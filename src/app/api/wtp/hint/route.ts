import { takeHint } from '@/lib/wtp/game'
import { commit, error, readMove } from '@/lib/wtp/http'

/** POST { token } → the next hint on the ladder. Each one lowers the round's points. */

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const move = await readMove(request, 'hint')
  if (move instanceof Response) return move
  const run = move.run!
  const fromSeq = run.seq
  const hint = takeHint(run)
  if (!hint) return error('No more hints for this round.', 409)
  return commit(run, fromSeq, { hint })
}
