import { TILE_SIZE, type WorldSnapshot } from '@/world/engine/types'

/**
 * Foreground Layer - Tree tops · Roofs · Bridges · Canopies.
 *
 * Drawn OVER the Entity Layer so the player and NPCs pass *behind* it (walk under a
 * tree canopy, behind a roof eave). A map may ship one baked `foreground` image or
 * ordered `foregroundLayers` (treetops → roofs → bridges → canopies). Never intercepts
 * input (pointer-events-none). Pure snapshot consumer.
 */
export function ForegroundLayer({ snapshot }: { snapshot: WorldSnapshot }) {
  if (!snapshot.foreground && snapshot.foregroundLayers.length === 0) return null
  const w = snapshot.mapWidth * TILE_SIZE
  const h = snapshot.mapHeight * TILE_SIZE

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-0 top-0"
      style={{ width: w, height: h }}
    >
      {snapshot.foreground ? <MapImage src={snapshot.foreground} w={w} h={h} /> : null}
      {snapshot.foregroundLayers.map((layer, i) => (
        <MapImage key={`fg-${layer.role ?? i}`} src={layer.src} w={w} h={h} />
      ))}
    </div>
  )
}

function MapImage({ src, w, h }: { src: string; w: number; h: number }) {
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      className="absolute left-0 top-0 max-w-none [image-rendering:pixelated]"
      style={{ width: w, height: h }}
    />
  )
}
