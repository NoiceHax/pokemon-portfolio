/** Client side of /api/wtp/*. Shapes mirror the route handlers. */

export interface PublicRun {
  score: number
  streak: number
  bestStreak: number
  correct: number
  lives: number
  over: boolean
}

export interface Round {
  silhouette: string
  gen: 1 | 2
  hintCount: number
  namePattern: string
}

export type Hint =
  | { kind: 'types'; label: string; types: string[] }
  | { kind: 'text'; label: string; text: string }

export interface Reveal {
  correct: boolean
  points: number
  pokemon: {
    id: number
    name: string
    types: string[]
    genus: string
    flavor: { text: string; game: string }
    reveal: string
    cry: string | null
  }
}

export interface LeaderboardEntry {
  name: string
  score: number
  bestStreak: number
  correct: number
  createdAt: string
}

export class WtpError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

async function post<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`/api/wtp/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = (await res.json().catch(() => ({}))) as T & { error?: string }
  if (!res.ok) throw new WtpError(data.error ?? 'Something went wrong.', res.status)
  return data
}

type Move<T> = { token: string; run: PublicRun } & T

export const wtpApi = {
  round: (token: string | null) => post<Move<{ round: Round }>>('round', token ? { token } : {}),
  hint: (token: string) => post<Move<{ hint: Hint }>>('hint', { token }),
  guess: (token: string, guess: string) =>
    post<Move<{ result: Reveal }>>('guess', { token, guess }),
  submit: (token: string, name: string) => post<{ ok: true }>('leaderboard', { token, name }),
  async leaderboard(): Promise<{ entries: LeaderboardEntry[]; configured: boolean }> {
    const res = await fetch('/api/wtp/leaderboard', { cache: 'no-store' })
    if (!res.ok) return { entries: [], configured: false }
    return res.json()
  },
}
