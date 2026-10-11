'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Panel } from '@/recruiter/ui'
import { useSettings } from '@/providers/SettingsProvider'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import {
  wtpApi,
  WtpError,
  type Hint,
  type LeaderboardEntry,
  type PublicRun,
  type Reveal,
  type Round,
} from './api'
import { recordBest } from './events'
import { GAME_TYPE_CLASSES } from './typeColors'

/**
 * Who's That Pokémon? - the anime's mid-episode segment as a game. A silhouette appears on
 * the blue burst, you guess, and the Pokémon is revealed with its cry. Hints cost points,
 * three misses end the run, and a finished run can go on the global leaderboard.
 *
 * All answers stay on the server (see src/lib/wtp); this component only ever holds the
 * opaque run token, the per-round silhouette URL, and whatever the server chose to reveal.
 */

type Phase = 'intro' | 'round' | 'reveal' | 'over'

const CRY_VOLUME = 0.12
const HINT_COST = 15

export function WtpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { muted, reducedMotion: forcedReduced } = useSettings()
  const reduced = usePrefersReducedMotion() || forcedReduced

  const [phase, setPhase] = useState<Phase>('intro')
  const [token, setToken] = useState<string | null>(null)
  const [run, setRun] = useState<PublicRun | null>(null)
  const [round, setRound] = useState<Round | null>(null)
  const [hints, setHints] = useState<Hint[]>([])
  const [reveal, setReveal] = useState<Reveal | null>(null)
  const [guessText, setGuessText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const overlayRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const primaryRef = useRef<HTMLButtonElement>(null)

  // One request at a time; a spent or rejected token means the run can't continue.
  const call = useCallback(async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    setBusy(true)
    setError(null)
    try {
      return await fn()
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong.'
      setError(message)
      if (e instanceof WtpError && (e.status === 400 || e.status === 409)) {
        setToken(null)
        setPhase('intro')
      }
      return null
    } finally {
      setBusy(false)
    }
  }, [])

  const nextRound = useCallback(
    async (fromToken: string | null) => {
      const res = await call(() => wtpApi.round(fromToken))
      if (!res) return
      setToken(res.token)
      setRun(res.run)
      setRound(res.round)
      setHints([])
      setReveal(null)
      setGuessText('')
      setPhase('round')
    },
    [call],
  )

  const takeHint = async () => {
    if (!token) return
    const res = await call(() => wtpApi.hint(token))
    if (!res) return
    setToken(res.token)
    setRun(res.run)
    setHints((h) => [...h, res.hint])
    inputRef.current?.focus()
  }

  const submitGuess = async (text: string) => {
    if (!token) return
    const res = await call(() => wtpApi.guess(token, text))
    if (!res) return
    setToken(res.token)
    setRun(res.run)
    setReveal(res.result)
    setPhase('reveal')
    recordBest(res.run.score, res.run.bestStreak)
    if (res.result.pokemon.cry && !muted) {
      const cry = new Audio(res.result.pokemon.cry)
      cry.volume = CRY_VOLUME
      void cry.play().catch(() => {})
    }
  }

  // Focus the right control as each phase starts.
  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => {
      if (phase === 'round') inputRef.current?.focus()
      else primaryRef.current?.focus()
    }, 50)
    return () => window.clearTimeout(id)
  }, [open, phase])

  // Esc closes; Tab stays inside the dialog. Both stand down while another keyboard-owning
  // layer (the backtick DevConsole) is open on top, so its Esc doesn't close the game too.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return
      const layers = document.querySelectorAll('[data-input-capture="true"]')
      if (Array.from(layers).some((el) => el !== overlayRef.current)) return
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [href]',
        )
        if (focusables.length === 0) return
        const first = focusables[0]!
        const last = focusables[focusables.length - 1]!
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const hintsLeft = round ? round.hintCount - hints.length : 0

  return (
    // data-input-capture: the Adventure world ignores its movement keys while this exists.
    <div
      ref={overlayRef}
      data-input-capture="true"
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wtp-title"
        className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto"
      >
        <Panel className="p-4 sm:p-5">
          <header className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2
                id="wtp-title"
                className="font-display text-sm leading-relaxed text-poke-red sm:text-base"
              >
                Who&apos;s That Pokémon?
              </h2>
              <p className="font-mono text-xs text-ink-faint">
                Gen I &amp; II · #001–251
                {round && phase !== 'intro'
                  ? ` · this one is Gen ${round.gen === 1 ? 'I' : 'II'}`
                  : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Who's That Pokémon?"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-edge text-ink-soft transition-colors hover:border-poke-red hover:text-poke-red focus:outline-none focus-visible:ring-2 focus-visible:ring-poke-red"
            >
              <X aria-hidden className="h-4 w-4" />
            </button>
          </header>

          {run && phase !== 'intro' ? <Scoreboard run={run} /> : null}

          {phase === 'intro' ? (
            <Intro
              busy={busy}
              error={error}
              primaryRef={primaryRef}
              onStart={() => void nextRound(null)}
            />
          ) : null}

          {(phase === 'round' || phase === 'reveal') && round ? (
            <>
              <Stage
                silhouette={round.silhouette}
                reveal={phase === 'reveal' ? reveal : null}
                reduced={reduced}
              />

              {phase === 'round' ? (
                <>
                  <HintList hints={hints} />
                  <form
                    className="mt-3 flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (guessText.trim() && !busy) void submitGuess(guessText)
                    }}
                  >
                    <input
                      ref={inputRef}
                      value={guessText}
                      onChange={(e) => setGuessText(e.target.value)}
                      maxLength={40}
                      autoComplete="off"
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck={false}
                      aria-label="Your guess"
                      placeholder="It's…"
                      className="min-w-0 flex-1 rounded-card border border-edge bg-surface px-3 py-2 font-mono text-base text-ink placeholder:text-ink-faint focus:border-poke-red focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={busy || !guessText.trim()}
                      className="rounded-card bg-poke-red px-4 py-2 font-display text-xs text-white transition-colors hover:bg-poke-red-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-poke-red focus-visible:ring-offset-2 disabled:opacity-50"
                    >
                      Guess!
                    </button>
                  </form>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => void takeHint()}
                      disabled={busy || hintsLeft <= 0}
                      className="rounded-card border border-edge px-3 py-1.5 font-mono text-sm text-ink-soft transition-colors hover:border-poke-red hover:text-poke-red focus:outline-none focus-visible:ring-2 focus-visible:ring-poke-red disabled:opacity-50"
                    >
                      {hintsLeft > 0
                        ? `Hint (−${HINT_COST} pts) · ${hintsLeft} left`
                        : 'No hints left'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void submitGuess('')}
                      disabled={busy}
                      className="font-mono text-sm text-ink-faint underline-offset-2 hover:text-poke-red hover:underline focus:outline-none focus-visible:text-poke-red disabled:opacity-50"
                    >
                      Give up (costs a life)
                    </button>
                  </div>
                </>
              ) : null}

              {phase === 'reveal' && reveal && run ? (
                <RevealPanel
                  reveal={reveal}
                  over={run.over}
                  busy={busy}
                  primaryRef={primaryRef}
                  onNext={() => (run.over ? setPhase('over') : void nextRound(token))}
                />
              ) : null}
              {error ? <p className="mt-2 font-mono text-sm text-poke-red">{error}</p> : null}
            </>
          ) : null}

          {phase === 'over' && run ? (
            <GameOver
              run={run}
              token={token}
              primaryRef={primaryRef}
              onRestart={() => {
                setToken(null)
                void nextRound(null)
              }}
            />
          ) : null}
        </Panel>
      </div>
    </div>
  )
}

function Scoreboard({ run }: { run: PublicRun }) {
  return (
    <div className="mb-3 flex items-center justify-between rounded-card border border-edge bg-surface-sunken px-3 py-1.5 font-mono text-sm text-ink-soft">
      <span>
        Score <strong className="text-ink">{run.score}</strong>
      </span>
      <span>
        Streak <strong className="text-ink">{run.streak}</strong>
      </span>
      <span className="flex items-center gap-1" aria-label={`${run.lives} lives left`}>
        {[0, 1, 2].map((i) => (
          <PokeBallIcon key={i} dim={i >= run.lives} />
        ))}
      </span>
    </div>
  )
}

function PokeBallIcon({ dim }: { dim: boolean }) {
  return (
    <span
      aria-hidden
      className={`relative inline-block h-3.5 w-3.5 overflow-hidden rounded-full border border-ink ${dim ? 'opacity-25' : ''}`}
    >
      <span className="absolute inset-x-0 top-0 h-1/2 bg-poke-red" />
      <span className="absolute inset-x-0 bottom-0 h-1/2 bg-white" />
      <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ink bg-white" />
    </span>
  )
}

/** The anime's blue burst with the silhouette on it; flips to colour on reveal. */
function Stage({
  silhouette,
  reveal,
  reduced,
}: {
  silhouette: string
  reveal: Reveal | null
  reduced: boolean
}) {
  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[18rem] overflow-hidden rounded-card border-2 border-ink"
      style={{
        background:
          'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.85) 0%, rgba(191,219,254,0.55) 22%, rgba(255,255,255,0) 55%), repeating-conic-gradient(from 0deg at 50% 50%, #1e40af 0deg 9deg, #3b82f6 9deg 18deg)',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={silhouette}
          src={silhouette}
          alt="A Pokémon silhouette"
          draggable={false}
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: reveal ? 0 : 1, scale: 1 }}
          transition={
            reduced
              ? { duration: 0.15 }
              : {
                  scale: { type: 'spring', stiffness: 260, damping: 18 },
                  opacity: { duration: 0.2 },
                }
          }
          className="absolute inset-[8%] h-[84%] w-[84%] select-none object-contain"
        />
      </AnimatePresence>
      {reveal ? (
        <>
          <motion.img
            src={reveal.pokemon.reveal}
            alt={reveal.pokemon.name}
            draggable={false}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0.15 : 0.35, delay: reduced ? 0 : 0.15 }}
            className="absolute inset-[8%] h-[84%] w-[84%] select-none object-contain"
          />
          {reduced ? null : (
            <motion.span
              aria-hidden
              className="absolute inset-0 bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.5, times: [0, 0.3, 1] }}
            />
          )}
        </>
      ) : null}
    </div>
  )
}

function HintList({ hints }: { hints: Hint[] }) {
  if (hints.length === 0) {
    return (
      <p className="mt-3 text-center font-mono text-sm text-ink-faint">
        Guess with no hints for the full 100 points.
      </p>
    )
  }
  return (
    <ul className="mt-3 flex flex-col gap-1.5" aria-live="polite">
      {hints.map((h, i) => (
        <li
          key={i}
          className="rounded-card border border-edge bg-surface px-3 py-1.5 font-mono text-sm text-ink"
        >
          <span className="mr-2 text-xs uppercase tracking-wide text-ink-faint">{h.label}</span>
          {h.kind === 'types' ? (
            <span className="inline-flex gap-1.5">
              {h.types.map((t) => (
                <span
                  key={t}
                  className={`rounded-full px-2 py-0.5 text-xs capitalize ${GAME_TYPE_CLASSES[t] ?? 'bg-stone-400 text-white'}`}
                >
                  {t}
                </span>
              ))}
            </span>
          ) : (
            h.text
          )}
        </li>
      ))}
    </ul>
  )
}

function RevealPanel({
  reveal,
  over,
  busy,
  primaryRef,
  onNext,
}: {
  reveal: Reveal
  over: boolean
  busy: boolean
  primaryRef: React.RefObject<HTMLButtonElement>
  onNext: () => void
}) {
  const p = reveal.pokemon
  return (
    <div className="mt-3 text-center" aria-live="polite">
      <p className={`font-display text-xs ${reveal.correct ? 'text-green-700' : 'text-poke-red'}`}>
        {reveal.correct ? `Correct! +${reveal.points}` : 'Not quite!'}
      </p>
      <p className="mt-2 font-display text-base text-ink sm:text-lg">It&apos;s {p.name}!</p>
      <p className="mt-1 font-mono text-sm text-ink-faint">
        #{String(p.id).padStart(3, '0')} · The {p.genus}
      </p>
      <p className="mx-auto mt-2 max-w-sm font-mono text-sm leading-snug text-ink-soft">
        {p.flavor.text}
      </p>
      <button
        ref={primaryRef}
        type="button"
        onClick={onNext}
        disabled={busy}
        className="mt-3 rounded-card bg-poke-red px-4 py-2 font-display text-xs text-white transition-colors hover:bg-poke-red-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-poke-red focus-visible:ring-offset-2 disabled:opacity-50"
      >
        {over ? 'See results' : 'Next Pokémon'}
      </button>
    </div>
  )
}

function Intro({
  busy,
  error,
  primaryRef,
  onStart,
}: {
  busy: boolean
  error: string | null
  primaryRef: React.RefObject<HTMLButtonElement>
  onStart: () => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-1 font-mono text-sm text-ink-soft">
        <li>· A silhouette appears. Name the Pokémon.</li>
        <li>· 100 points each; every hint costs {HINT_COST}. Streaks add a bonus.</li>
        <li>· Three misses and the run is over.</li>
      </ul>
      <button
        ref={primaryRef}
        type="button"
        onClick={onStart}
        disabled={busy}
        className="self-center rounded-card bg-poke-red px-5 py-2.5 font-display text-xs text-white transition-colors hover:bg-poke-red-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-poke-red focus-visible:ring-offset-2 disabled:opacity-50"
      >
        {busy ? 'Loading…' : 'Start'}
      </button>
      {error ? <p className="text-center font-mono text-sm text-poke-red">{error}</p> : null}
      <Leaderboard />
    </div>
  )
}

function GameOver({
  run,
  token,
  primaryRef,
  onRestart,
}: {
  run: PublicRun
  token: string | null
  primaryRef: React.RefObject<HTMLButtonElement>
  onRestart: () => void
}) {
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [refresh, setRefresh] = useState(0)

  const submit = async () => {
    if (!token || !name.trim()) return
    setStatus('sending')
    try {
      await wtpApi.submit(token, name.trim())
      setStatus('sent')
      setRefresh((n) => n + 1)
    } catch (e) {
      setStatus('error')
      setMessage(e instanceof Error ? e.message : 'Could not submit.')
    }
  }

  return (
    <div className="flex flex-col gap-3 text-center">
      <p className="font-display text-sm text-ink">Game over</p>
      <p className="font-mono text-base text-ink-soft">
        {run.correct} caught · best streak {run.bestStreak} ·{' '}
        <strong className="text-ink">{run.score} pts</strong>
      </p>
      <Leaderboard
        refreshKey={refresh}
        footer={(configured) =>
          configured && run.correct > 0 && status !== 'sent' ? (
            <form
              className="mt-2 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                void submit()
              }}
            >
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={24}
                aria-label="Your name for the leaderboard"
                placeholder="Trainer name"
                className="min-w-0 flex-1 rounded-card border border-edge bg-surface px-3 py-1.5 font-mono text-sm text-ink placeholder:text-ink-faint focus:border-poke-red focus:outline-none"
              />
              <button
                type="submit"
                disabled={status === 'sending' || !name.trim()}
                className="rounded-card border border-poke-red px-3 py-1.5 font-mono text-sm text-poke-red transition-colors hover:bg-poke-red hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-poke-red disabled:opacity-50"
              >
                Submit
              </button>
            </form>
          ) : status === 'sent' ? (
            <p className="mt-2 font-mono text-sm text-green-700">You&apos;re on the board!</p>
          ) : null
        }
      />
      {status === 'error' && message ? (
        <p className="font-mono text-sm text-poke-red">{message}</p>
      ) : null}
      <button
        ref={primaryRef}
        type="button"
        onClick={onRestart}
        className="self-center rounded-card bg-poke-red px-5 py-2.5 font-display text-xs text-white transition-colors hover:bg-poke-red-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-poke-red focus-visible:ring-offset-2"
      >
        Play again
      </button>
    </div>
  )
}

function Leaderboard({
  refreshKey = 0,
  footer,
}: {
  refreshKey?: number
  footer?: (configured: boolean) => React.ReactNode
}) {
  const [data, setData] = useState<{ entries: LeaderboardEntry[]; configured: boolean } | null>(
    null,
  )

  useEffect(() => {
    let alive = true
    void wtpApi.leaderboard().then((d) => {
      if (alive) setData(d)
    })
    return () => {
      alive = false
    }
  }, [refreshKey])

  if (!data || !data.configured) return footer && data ? <>{footer(false)}</> : null

  return (
    <section
      aria-label="Leaderboard"
      className="rounded-card border border-edge bg-surface-sunken p-3 text-left"
    >
      <h3 className="mb-1.5 font-display text-[0.6rem] uppercase tracking-wide text-ink-faint">
        Top trainers
      </h3>
      {data.entries.length === 0 ? (
        <p className="font-mono text-sm text-ink-faint">No scores yet. Be the first!</p>
      ) : (
        <ol className="flex flex-col font-mono text-sm">
          {data.entries.map((e, i) => (
            <li
              key={`${e.name}-${e.createdAt}`}
              className="flex items-baseline justify-between gap-2 border-b border-edge py-0.5 last:border-0"
            >
              <span className="truncate text-ink">
                <span className="mr-2 text-ink-faint">{i + 1}.</span>
                {e.name}
              </span>
              <span className="shrink-0 text-ink-soft">
                {e.score} pts · {e.correct} caught
              </span>
            </li>
          ))}
        </ol>
      )}
      {footer?.(true)}
    </section>
  )
}
