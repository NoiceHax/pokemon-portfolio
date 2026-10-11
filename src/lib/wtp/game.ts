import crypto from 'crypto'
import { NORMALIZED_NAMES, POKEMON, getPokemon, type WtpPokemon } from './data'
import { isMatch } from './match'
import { open, randomId, seal } from './token'

/**
 * Who's That Pokémon? game rules. The whole run lives in one encrypted, signed token the
 * client hands back on every request; each request opens it, applies one move, and seals a
 * new one with `seq` bumped. Replaying an older token is caught by the run-sequence check
 * in the route handlers (src/lib/db/wtp.ts) when a database is configured.
 */

export const MAX_LIVES = 3
const BASE_POINTS = 100
const HINT_COST = 15
const MIN_POINTS = 20
/**
 * Slowest pace a leaderboard run may average, per round started. A person needs a moment
 * to look, type and read the reveal; a script answering from a lookup table doesn't.
 */
const MIN_MS_PER_ROUND = 2_000

export interface RunState {
  v: 1
  runId: string
  seq: number
  score: number
  streak: number
  bestStreak: number
  correct: number
  misses: number
  used: number[]
  /** The unanswered round, if any: the answer's dex id and hints revealed so far. */
  current: { id: number; hints: number } | null
  startedAt: number
}

/** The part of the run the client may see. */
export interface PublicRun {
  score: number
  streak: number
  bestStreak: number
  correct: number
  lives: number
  over: boolean
}

export function newRun(): RunState {
  return {
    v: 1,
    runId: randomId(),
    seq: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    correct: 0,
    misses: 0,
    used: [],
    current: null,
    startedAt: Date.now(),
  }
}

export function sealRun(run: RunState): string {
  return seal(run, { encrypt: true })
}

export function openRun(token: unknown): RunState | null {
  const run = open<RunState>(token)
  return run && run.v === 1 ? run : null
}

export function isOver(run: RunState): boolean {
  // The pool only counts as exhausted once the last round has been answered.
  return run.misses >= MAX_LIVES || (run.current === null && run.used.length >= POKEMON.length)
}

/** False for runs played faster than a person could, which the leaderboard turns away. */
export function plausiblePace(run: RunState, now = Date.now()): boolean {
  return now - run.startedAt >= run.used.length * MIN_MS_PER_ROUND
}

export function publicRun(run: RunState): PublicRun {
  return {
    score: run.score,
    streak: run.streak,
    bestStreak: run.bestStreak,
    correct: run.correct,
    lives: Math.max(0, MAX_LIVES - run.misses),
    over: isOver(run),
  }
}

function miss(run: RunState) {
  run.misses += 1
  run.streak = 0
}

/**
 * Start the next round. An unanswered round is forfeited as a miss (no free re-rolls).
 * Returns null, leaving the run untouched, once every Pokémon has been used.
 */
export function startRound(run: RunState): WtpPokemon | null {
  const usedSet = new Set(run.used)
  const pool = POKEMON.filter((p) => !usedSet.has(p.id))
  if (pool.length === 0) return null
  if (run.current) miss(run)
  const pick = pool[crypto.randomInt(pool.length)]!
  run.used.push(pick.id)
  run.current = { id: pick.id, hints: 0 }
  run.seq += 1
  return pick
}

export type Hint =
  | { kind: 'types'; label: string; types: string[] }
  | { kind: 'text'; label: string; text: string }

function redact(text: string, name: string): string {
  // Gen 1/2 Pokédex text writes names in caps ("PIKACHU"); cover any casing. Whole words
  // only, so Hypno's entry keeps "hypnosis", and Nidoran♀ also matches a bare "NIDORAN".
  const escaped = name.replace(/[♀♂]$/, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(`(?<![a-z])${escaped}[♀♂]?(?![a-z])`, 'gi'), '?????')
}

const titleCase = (s: string) => s.replace(/(^|[\s-])\w/g, (c) => c.toUpperCase())

/** The hint ladder, vaguest first. */
function hintFor(p: WtpPokemon, n: number): Hint | null {
  switch (n) {
    case 0:
      return { kind: 'types', label: 'Type', types: p.types }
    case 1:
      return { kind: 'text', label: 'Species', text: `The ${p.genus}` }
    case 2:
      return {
        kind: 'text',
        label: `Pokédex (${titleCase(p.flavor.game)})`,
        text: redact(p.flavor.text, p.name),
      }
    case 3: {
      const facts = [`${p.heightM} m`, `${p.weightKg} kg`]
      if (p.color) facts.push(`mostly ${p.color}`)
      if (p.habitat === 'rare') facts.push('rarely seen')
      else if (p.habitat === 'waters-edge') facts.push("lives at the water's edge")
      else if (p.habitat) facts.push(`lives in: ${p.habitat.replace(/-/g, ' ')}`)
      return { kind: 'text', label: 'Field notes', text: facts.join(' · ') }
    }
    case 4: {
      const e = p.evolution
      let text: string
      if (e.from) text = `Evolves from ${e.from}.`
      else if (e.evolvesFurther) text = 'A first-stage Pokémon that can evolve.'
      else text = p.legendary ? 'A legendary Pokémon. It does not evolve.' : 'It does not evolve.'
      return { kind: 'text', label: 'Evolution', text }
    }
    case 5:
      return {
        kind: 'text',
        label: 'Last resort',
        text: `Starts with "${p.name[0]}", ${p.name.length} characters long.`,
      }
    default:
      return null
  }
}

export const HINT_COUNT = 6

export function takeHint(run: RunState): Hint | null {
  if (!run.current) return null
  const p = getPokemon(run.current.id)
  const hint = p ? hintFor(p, run.current.hints) : null
  if (!hint) return null
  run.current.hints += 1
  run.seq += 1
  return hint
}

export function pointsFor(hints: number, streak: number): number {
  const base = Math.max(MIN_POINTS, BASE_POINTS - HINT_COST * hints)
  return Math.round(base * (1 + 0.1 * Math.min(streak, 5)))
}

export interface GuessResult {
  correct: boolean
  points: number
  pokemon: WtpPokemon
}

/** Resolve the current round. An empty guess is a pass. */
export function guess(run: RunState, input: string): GuessResult | null {
  if (!run.current) return null
  const p = getPokemon(run.current.id)
  if (!p) return null
  const correct = isMatch(input, p.name, NORMALIZED_NAMES)
  let points = 0
  if (correct) {
    points = pointsFor(run.current.hints, run.streak)
    run.score += points
    run.streak += 1
    run.bestStreak = Math.max(run.bestStreak, run.streak)
    run.correct += 1
  } else {
    miss(run)
  }
  run.current = null
  run.seq += 1
  return { correct, points, pokemon: p }
}
