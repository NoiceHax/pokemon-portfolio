import { stepCoord, type Direction, type TileCoord } from '../types'
import type { EventBus } from '../EventBus'
import type { WorldEntity } from '@/world/entities/entityTypes'

/**
 * InteractionSystem - the generic interaction pipeline. The player does NOT know about
 * NPCs, signs, or warps. `resolveTarget` finds whatever the player faces; `trigger`
 * emits the right events for it based on kind. Splitting the two lets the engine do
 * something in between (e.g. turn the NPC to face the player) before firing.
 *
 * Stateless: it reads facing/position + entities and emits. Listeners decide what
 * happens next (open dialogue, warp).
 */
export class InteractionSystem {
  constructor(private readonly bus: EventBus) {}

  /** The entity directly in front of the player, or null. */
  resolveTarget(
    playerPos: TileCoord,
    facing: Direction,
    entities: WorldEntity[],
  ): WorldEntity | null {
    const faced = stepCoord(playerPos, facing)
    return entities.find((e) => e.position.x === faced.x && e.position.y === faced.y) ?? null
  }

  /** Fire the appropriate events for interacting with `target`. */
  trigger(target: WorldEntity): void {
    this.bus.emit({ type: 'InteractionStarted', entityId: target.id, at: target.position })

    switch (target.kind) {
      case 'npc':
      case 'sign':
        this.bus.emit({
          type: 'DialogueRequested',
          dialogueId: target.dialogueId,
          entityId: target.id,
        })
        break
      case 'trigger':
        if (target.secretId) this.bus.emit({ type: 'SecretFound', secretId: target.secretId })
        if (target.dialogueId)
          this.bus.emit({
            type: 'DialogueRequested',
            dialogueId: target.dialogueId,
            entityId: target.id,
          })
        break
      case 'warp':
        if (target.trigger === 'interact')
          this.bus.emit({ type: 'WarpEntered', toMap: target.toMap, toSpawn: target.toSpawn })
        break
      case 'portal':
        if (target.trigger === 'interact')
          this.bus.emit({
            type: 'RecruiterPortalEntered',
            portalId: target.id,
            destination: target.destination,
          })
        break
    }
  }
}
