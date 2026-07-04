'use client'

import { useSyncExternalStore } from 'react'
import type { WorldEngine } from '@/world/engine/WorldEngine'
import type { WorldSnapshot } from '@/world/engine/types'

/**
 * The single bridge between the engine and React. `useSyncExternalStore` subscribes to
 * the engine's `SnapshotChanged` event and reads the immutable snapshot. React holds NO
 * game state - it only re-renders when the engine publishes a new snapshot. This is the
 * whole "React is a consumer, not the source of truth" contract, in one hook.
 */
export function useWorldSnapshot(engine: WorldEngine): WorldSnapshot {
  return useSyncExternalStore(
    (onChange) => engine.bus.on('SnapshotChanged', onChange),
    () => engine.snapshot(),
    () => engine.snapshot(),
  )
}
