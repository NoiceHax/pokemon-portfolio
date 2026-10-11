import { z } from 'zod'
import { guess } from '@/lib/wtp/game'
import { cryUrl, revealUrl } from '@/lib/wtp/data'
import { commit, error, readMove } from '@/lib/wtp/http'

/**
 * POST { token, guess } → whether it was right, plus the reveal: name, colour art, cry and
 * the full Pokédex entry. An empty guess passes the round (a miss).
 */

export const dynamic = 'force-dynamic'

const guessSchema = z.string().max(40)

export async function POST(request: Request) {
  const move = await readMove(request, 'guess')
  if (move instanceof Response) return move
  const run = move.run!
  const input = guessSchema.safeParse(move.body.guess ?? '')
  if (!input.success) return error('Invalid guess.', 400)
  const fromSeq = run.seq
  const result = guess(run, input.data)
  if (!result) return error('No round in progress.', 409)
  const p = result.pokemon
  return commit(run, fromSeq, {
    result: {
      correct: result.correct,
      points: result.points,
      pokemon: {
        id: p.id,
        name: p.name,
        types: p.types,
        genus: p.genus,
        flavor: p.flavor,
        reveal: revealUrl(p),
        cry: cryUrl(p),
      },
    },
  })
}
