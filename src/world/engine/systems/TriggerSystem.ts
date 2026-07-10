import type { TileCoord } from '../types'
import type { EventBus } from '../EventBus'
import type { MapData, AudioZone } from '@/world/world/mapTypes'
import type { WorldEntity } from '@/world/entities/entityTypes'

/**
 * TriggerSystem - resolves everything that fires by STEPPING onto a tile (as opposed
 * to pressing the action key, which the InteractionSystem handles):
 *   - step-warps (door mats) → WarpEntered
 *   - step triggers / secrets → SecretFound (+ optional dialogue)
 *   - audio zones → AudioZoneEntered (only when the active track changes)
 *
 * Holds the currently-playing track so it can emit AudioZoneEntered only on change.
 */
export class TriggerSystem {
  private activeTrack: string | null = null

  constructor(private readonly bus: EventBus) {}

  /** Reset audio tracking when the map changes. */
  resetForMap(map: MapData): void {
    this.activeTrack = null
    // Re-evaluate audio at the new spawn on the next onEnterTile call.
    void map
  }

  /** Called after the player finishes a step onto `pos`. */
  onEnterTile(pos: TileCoord, map: MapData, entities: WorldEntity[]): void {
    // Step warps + step triggers on this tile.
    for (const e of entities) {
      if (e.position.x !== pos.x || e.position.y !== pos.y) continue
      if (e.kind === 'warp' && e.trigger === 'step') {
        this.bus.emit({ type: 'WarpEntered', toMap: e.toMap, toSpawn: e.toSpawn })
        return // leaving the map; stop processing further triggers
      }
      if (e.kind === 'trigger') {
        if (e.secretId) this.bus.emit({ type: 'SecretFound', secretId: e.secretId })
      }
    }
    this.updateAudio(pos, map.audioZones ?? [])
  }

  /** Evaluate audio zones at a position; emit only when the track changes. */
  updateAudio(pos: TileCoord, zones: AudioZone[]): void {
    const zone = zones.find(
      (z) =>
        pos.x >= z.rect.x &&
        pos.x < z.rect.x + z.rect.width &&
        pos.y >= z.rect.y &&
        pos.y < z.rect.y + z.rect.height,
    )
    const next = zone?.track ?? null
    if (next !== this.activeTrack) {
      this.activeTrack = next
      this.bus.emit({ type: 'AudioZoneEntered', track: next })
    }
  }
}
