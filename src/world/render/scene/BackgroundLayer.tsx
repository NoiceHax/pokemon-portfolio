import { TILE_SIZE, type WorldSnapshot } from '@/world/engine/types'

/**
 * Background Layer - Ground · Terrain · Roads.
 *
 * The bottom of the Scene. Draws the map's background art beneath everything else.
 * A map may ship a single baked image (`background`) or ordered sub-layers
 * (`backgroundLayers`: ground → terrain → roads) that stack in array order; when both
 * exist the sub-layers draw over the flat image. Purely decorative (aria-hidden) and a
 * pure snapshot consumer - it renders, it never touches engine state.
 */
export function BackgroundLayer({ snapshot }: { snapshot: WorldSnapshot }) {
  const w = snapshot.mapWidth * TILE_SIZE
  const h = snapshot.mapHeight * TILE_SIZE

  return (
    <div aria-hidden className="absolute left-0 top-0" style={{ width: w, height: h }}>
      {snapshot.background ? <MapImage src={snapshot.background} w={w} h={h} /> : null}
      {snapshot.backgroundLayers.map((layer, i) => (
        <MapImage key={`bg-${layer.role ?? i}`} src={layer.src} w={w} h={h} />
      ))}
    </div>
  )
}

/** A full-map-size, pixel-crisp image layer. */
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
