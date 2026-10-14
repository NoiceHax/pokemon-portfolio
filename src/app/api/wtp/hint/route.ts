import { takeHint } from '@/lib/wtp/game'
import { commit, error, readMove } from '@/lib/wtp/http'

/** POST { token, index? } → one missing letter. Each one lowers the round's points. */

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const move = await readMove(request, 'hint')
  if (move instanceof Response) return move
  const run = move.run!
  const fromSeq = run.seq
  const index = move.body.index
  if (index !== undefined && (typeof index !== 'number' || !Number.isInteger(index))) {
    return error('Choose a missing letter.', 422)
  }
  const hint = takeHint(run, index as number | undefined)
  if (!hint) return error('That letter cannot be revealed. Choose another blank.', 422)
  return commit(run, fromSeq, { hint })
}
