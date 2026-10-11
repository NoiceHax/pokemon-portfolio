import { readStorage, writeStorage, STORAGE_KEYS } from '@/lib/storage/localStorage'

/**
 * Doorways into Who's That Pokémon? The game is mounted once (WtpHost, in the root layout);
 * any page opens it by dispatching this window event - the sidebar card, the floating
 * launcher, or anything added later.
 */
export const OPEN_WTP_EVENT = 'open-whos-that-pokemon'

export function openWhosThatPokemon() {
  window.dispatchEvent(new Event(OPEN_WTP_EVENT))
}

/** Personal bests, kept in this browser only (the global board is server-side). */
export interface WtpBest {
  score: number
  streak: number
}

export const WTP_BEST_EVENT = 'wtp-best-updated'

export function readBest(): WtpBest {
  return readStorage<WtpBest>(STORAGE_KEYS.wtpBest, { score: 0, streak: 0 })
}

export function recordBest(score: number, streak: number) {
  const best = readBest()
  if (score <= best.score && streak <= best.streak) return
  writeStorage(STORAGE_KEYS.wtpBest, {
    score: Math.max(score, best.score),
    streak: Math.max(streak, best.streak),
  })
  window.dispatchEvent(new Event(WTP_BEST_EVENT))
}
