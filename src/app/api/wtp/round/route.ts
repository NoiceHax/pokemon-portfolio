import { newRun, startRound } from '@/lib/wtp/game'
import { commit, error, readMove } from '@/lib/wtp/http'
import { namePattern } from '@/lib/wtp/namePattern'

/**
 * POST { token? } → the next round: a silhouette image URL and the generation, never the
 * name. The image URL carries the new run token (see round-image), so it differs on every
 * round and says nothing about which Pokémon it is. Without a token a new run starts. An
 * unanswered round in the token counts as a miss.
 */

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const move = await readMove(request, 'round', { allowNew: true })
  if (move instanceof Response) return move
  const run = move.run ?? newRun()
  const fromSeq = run.seq
  const pokemon = startRound(run)
  if (!pokemon) return error('Every Pokémon has been shown. Start a new run.', 409)
  return commit(run, fromSeq, (token) => ({
    round: {
      silhouette: `/api/wtp/round-image?t=${encodeURIComponent(token)}`,
      gen: pokemon.gen,
      hintCount: namePattern(pokemon.name).split('_').length - 1,
      namePattern: namePattern(pokemon.name),
    },
  }))
}
