import { TILE_SIZE, type WorldSnapshot } from '@/world/engine/types'

/**
 * Animated Water Layer - the shimmer that sits just above the baked Background.
 *
 * The town art bakes a single still water frame; this layer draws one of the map's
 * `waterFrames` (full-map-size, transparent except over open water) chosen by the engine's
 * ambient `animTick`, so water gently cycles even while the player stands still. Purely
 * decorative (aria-hidden) and a pure snapshot consumer.
 */
export function AnimatedWaterLayer({ snapshot }: { snapshot: WorldSnapshot }) {
  const frames = snapshot.waterFrames
  if (frames.length === 0) return null
  const w = snapshot.mapWidth * TILE_SIZE
  const h = snapshot.mapHeight * TILE_SIZE
  const src = frames[snapshot.animTick % frames.length]

  return (
    <img
      aria-hidden
      src={src}
      alt=""
      draggable={false}
      className="pointer-events-none absolute left-0 top-0 max-w-none [image-rendering:pixelated]"
      style={{ width: w, height: h }}
    />
  )
}
