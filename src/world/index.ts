/**
 * Public surface of the Adventure world. The app mounts `WorldRenderer`; everything
 * else (engine, systems, maps) is internal. The engine is the source of truth; React
 * only consumes its snapshot.
 */
export { WorldRenderer } from './render/WorldRenderer'
export { buildDialogueRegistry } from './world/dialogueRegistry'
export { WorldEngine } from './engine/WorldEngine'
export type { WorldSnapshot } from './engine/types'
