'use client'

import type { DialogueScript } from '@/engine/dialogue/types'
import type { WorldEngine } from '@/world/engine/WorldEngine'
import { DialogueOverlay } from '../DialogueOverlay'
import { MapTransition } from './MapTransition'
import { FadeOverlay } from './FadeOverlay'

/**
 * Overlay Layer - Dialogue · Fade · Transitions · Badge Unlocks.
 *
 * Everything drawn ABOVE the world, fixed to the viewport (not camera-transformed):
 *  - Dialogue    - the reused Dialogue Engine, opened by engine DialogueRequested events.
 *  - Fade        - general-purpose engine-driven fade to/from black (FadeOverlay).
 *  - Transitions - the quick auto-flash on area change (MapTransition).
 *  - Badge Unlocks - the unlock toast is app-level (BadgeToast in the providers) so it
 *    shows in BOTH experiences; the engine emits BadgeUnlocked, the provider renders it.
 *    A small area label is also shown here for orientation.
 */
export function OverlayLayer({
  engine,
  registry,
  mapName,
}: {
  engine: WorldEngine
  registry: Record<string, DialogueScript>
  mapName: string
}) {
  return (
    <>
      <MapTransition engine={engine} />
      <FadeOverlay engine={engine} />
      <DialogueOverlay engine={engine} registry={registry} />
      <div className="pointer-events-none absolute left-4 top-4 z-30 rounded-md border border-ink/40 bg-surface-raised/90 px-3 py-1 font-mono text-sm text-ink">
        {mapName}
      </div>
    </>
  )
}
