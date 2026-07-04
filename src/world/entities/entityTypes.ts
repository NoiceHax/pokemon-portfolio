import type { Direction, TileCoord } from '@/world/engine/types'

/**
 * The world's entity data model. Entities are pure DATA - they carry no behavior and
 * no dialogue scripts, only a `dialogueId` that the Dialogue Engine resolves. This is
 * what keeps maps data-driven: a new NPC is a new data record, never new code.
 *
 * The player never knows about these types. It emits a generic interaction; the
 * InteractionSystem finds the faced entity and decides the response from its `kind`.
 */

interface BaseEntity {
  id: string
  position: TileCoord
  /** Does this entity block its tile? Defaults per kind (see entityIsSolid). */
  solid?: boolean
  /** Badge slug to unlock when this entity is interacted with / entered. */
  unlockBadge?: string
}

/** One step in an NPC's idle behaviour loop (inspired by the reference engine). */
export type BehaviourStep =
  | { type: 'stand'; direction: Direction; time: number }
  | { type: 'walk'; direction: Direction }

/** An NPC. Talking to it opens the dialogue registered under `dialogueId`. */
export interface NpcEntity extends BaseEntity {
  kind: 'npc'
  name: string
  /**
   * Extracted sprite-set id (e.g. `npc_a`). The renderer resolves directional walk
   * frames (`{base}_{dir}_{frame}.png`) from this, so NPCs animate a 2-frame walk per
   * direction instead of showing one static front frame.
   */
  spriteBase?: string
  facing?: Direction
  dialogueId: string
  /**
   * Optional idle loop that makes the NPC feel alive (stand/turn/wander). It runs only
   * while the world is idle and pauses during cutscenes/dialogue.
   */
  behaviourLoop?: BehaviourStep[]
  /** Turn to face the player when talked to (like the games). Default true. */
  faceOnTalk?: boolean
}

/** A readable sign / placard. Interacting opens `dialogueId`. */
export interface SignEntity extends BaseEntity {
  kind: 'sign'
  dialogueId: string
  /** Hide the marker (used for invisible secret triggers). */
  hidden?: boolean
}

/** A door / warp. `step` fires on walking onto it; `interact` needs the action key. */
export interface WarpEntity extends BaseEntity {
  kind: 'warp'
  toMap: string
  toSpawn?: TileCoord
  trigger: 'step' | 'interact'
  label?: string
}

/**
 * A recruiter portal - an enterable house door that leads OUT of Adventure Mode into a
 * section of the Recruiter website (via a preview overlay). Data-driven: the door only
 * names a destination id (or 'random'); the mapping of ids → recruiter pages/previews
 * lives in the portal config, so new maps/pages reuse this without engine changes.
 */
export interface PortalEntity extends BaseEntity {
  kind: 'portal'
  /**
   * Which recruiter destination this door opens: a fixed destination id, or 'random' to
   * pick one of the destinations each time it is entered (a fun exploration mechanic).
   */
  destination: string
  /** How the door is entered (doors use 'interact', like the games). */
  trigger: 'step' | 'interact'
  label?: string
}

/** An invisible step trigger (audio zones, secret spots) resolved by the TriggerSystem. */
export interface TriggerEntity extends BaseEntity {
  kind: 'trigger'
  /** Optional dialogue shown when stepped on / interacted with. */
  dialogueId?: string
  /** Fires a SecretFound event with this id. */
  secretId?: string
  hidden: true
}

/**
 * A collectible item lying in the world (a Poké Ball on the ground, a hidden note).
 * Interacting picks it up: emits ItemCollected, optionally opens dialogue / unlocks a
 * badge, and the item disappears. It draws in the Entity Layer, y-sorted like actors.
 */
export interface ItemEntity extends BaseEntity {
  kind: 'item'
  name: string
  sprite: { src: string; alt: string }
  /** Optional line shown on pickup (via the dialogue engine). */
  dialogueId?: string
  /** Whether the item blocks its tile before pickup (default false - you walk onto it). */
  solid?: boolean
}

export type WorldEntity =
  | NpcEntity
  | SignEntity
  | WarpEntity
  | PortalEntity
  | TriggerEntity
  | ItemEntity

/** Whether an entity blocks movement onto its tile. */
export function entityIsSolid(entity: WorldEntity): boolean {
  if (entity.solid !== undefined) return entity.solid
  if (entity.kind === 'sign') return false
  if (entity.kind === 'trigger') return false
  if (entity.kind === 'item') return false // walk onto an item to grab it
  if (entity.kind === 'warp') return entity.trigger === 'interact'
  if (entity.kind === 'portal') return entity.trigger === 'interact' // door tile is solid
  return true // NPCs block by default
}
