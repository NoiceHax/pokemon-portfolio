import type { Direction, TileCoord } from './types'

/**
 * The engine's event vocabulary. Systems never call each other directly - they emit
 * events on the EventBus and other systems (or React) react. This keeps every system
 * decoupled and independently testable.
 */
export type WorldEvent =
  | { type: 'PlayerMoved'; from: TileCoord; to: TileCoord; direction: Direction }
  | { type: 'PlayerStopped'; at: TileCoord }
  | { type: 'PlayerTurned'; direction: Direction }
  /** An actor (player or NPC) finished a one-tile step. */
  | { type: 'ActorStepped'; actorId: string }
  | { type: 'InteractionStarted'; entityId: string; at: TileCoord }
  | { type: 'DialogueRequested'; dialogueId: string; entityId: string }
  | { type: 'DialogueFinished'; dialogueId: string }
  | { type: 'WarpEntered'; toMap: string; toSpawn?: TileCoord }
  /** An enterable house door that portals into the Recruiter site (see recruiterPortals). */
  | { type: 'RecruiterPortalEntered'; portalId: string; destination: string }
  | { type: 'AreaChanged'; mapId: string; mapName: string }
  | { type: 'AudioZoneEntered'; track: string | null }
  | { type: 'SecretFound'; secretId: string }
  /** A world item was picked up (and removed from the map). */
  | { type: 'ItemCollected'; itemId: string; name: string }
  /** Request a fade of the overlay (fade to black / back). Drives the Fade overlay. */
  | { type: 'FadeRequested'; to: 'in' | 'out'; durationMs: number }
  /** Emitted whenever the published snapshot changes (renderer subscribes to this). */
  | { type: 'SnapshotChanged' }

export type WorldEventType = WorldEvent['type']

/** Narrow a WorldEvent by its `type` tag. */
export type EventOf<T extends WorldEventType> = Extract<WorldEvent, { type: T }>
