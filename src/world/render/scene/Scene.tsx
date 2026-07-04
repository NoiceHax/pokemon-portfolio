'use client'

import type { DialogueScript } from '@/engine/dialogue/types'
import { TILE_SIZE, type Direction, type WorldSnapshot } from '@/world/engine/types'
import type { WorldEngine } from '@/world/engine/WorldEngine'
import { BackgroundLayer } from './BackgroundLayer'
import { AnimatedWaterLayer } from './AnimatedWaterLayer'
import { AnimatedFlowerLayer } from './AnimatedFlowerLayer'
import { EntityLayer } from './EntityLayer'
import { ForegroundLayer } from './ForegroundLayer'
import { OverlayLayer } from './OverlayLayer'

/**
 * Scene - the four-layer render tree. DOM order IS z-order:
 *
 *   Scene
 *   ├── Background Layer   Ground · Terrain · Roads          (camera-transformed)
 *   ├── Animated Water     Shimmer over open water            (camera-transformed)
 *   ├── Entity Layer       Player · NPCs · Items · Signs      (camera-transformed, y-sorted)
 *   ├── Foreground Layer   Tree tops · Roofs · Bridges · Canopies  (camera-transformed)
 *   └── Overlay Layer      Dialogue · Fade · Transitions · Badge Unlocks  (viewport-fixed)
 *
 * The first three layers live inside one camera-translated world container so they scroll
 * together; the Overlay Layer sits outside it, pinned to the viewport. Every layer is a
 * pure consumer of the engine snapshot - the Scene changes no game state.
 */
export function Scene({
  engine,
  snapshot,
  registry,
  playerSpriteSrcByDir,
  zoom = 1,
}: {
  engine: WorldEngine
  snapshot: WorldSnapshot
  registry: Record<string, DialogueScript>
  playerSpriteSrcByDir?: (dir: Direction, frame: 0 | 1 | 2) => string
  /** CSS zoom applied to the world so ~TILES_ACROSS tiles fill the viewport. */
  zoom?: number
}) {
  return (
    <>
      {/* Camera-transformed, zoomed world. The camera offset is in world px; scaling from
          the top-left corner zooms the whole world (the camera is fed a viewport ÷ zoom so
          centering stays correct). Nested translate inside scale keeps motion crisp. */}
      <div
        className="absolute left-0 top-0 origin-top-left [image-rendering:pixelated]"
        style={{
          transform: `scale(${zoom}) translate3d(${snapshot.camera.x}px, ${snapshot.camera.y}px, 0)`,
          width: snapshot.mapWidth * TILE_SIZE,
          height: snapshot.mapHeight * TILE_SIZE,
        }}
      >
        <BackgroundLayer snapshot={snapshot} />
        <AnimatedWaterLayer snapshot={snapshot} />
        <AnimatedFlowerLayer snapshot={snapshot} />
        <EntityLayer snapshot={snapshot} playerSpriteSrcByDir={playerSpriteSrcByDir} />
        <ForegroundLayer snapshot={snapshot} />
      </div>

      {/* Viewport-fixed overlays. */}
      <OverlayLayer engine={engine} registry={registry} mapName={snapshot.mapName} />
    </>
  )
}
