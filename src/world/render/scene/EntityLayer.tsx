import {
  TILE_SIZE,
  type Direction,
  type WorldSnapshot,
  type RenderEntity,
} from '@/world/engine/types'
import { npcSprite, playerSprite } from '../sprites'

/**
 * Entity Layer - Player · NPCs · Items · Signs.
 *
 * All actors and props share one layer and are Y-SORTED by their feet, so something
 * lower on the map correctly overlaps something above it (classic 2D depth). This layer
 * sits between Background and Foreground: entities draw over the ground but pass behind
 * tree-tops/roofs. Pure snapshot consumer.
 */
export function EntityLayer({
  snapshot,
  playerSpriteSrcByDir,
}: {
  snapshot: WorldSnapshot
  playerSpriteSrcByDir?: (dir: Direction, frame: 0 | 1 | 2) => string
}) {
  const { player } = snapshot

  // One unified, y-sorted draw list: the player plus every visible entity.
  const drawList: { key: string; y: number; node: React.ReactNode }[] = []

  // animFrame is 0 when idle, and toggles while walking OR pushing against a wall (bump),
  // so we key the sprite off it directly.
  const playerSrc = (playerSpriteSrcByDir ?? playerSprite)(player.direction, player.animFrame)
  drawList.push({
    key: 'player',
    y: player.pixel.y,
    node: <Sprite key="player" pixel={player.pixel} src={playerSrc} alt="Trainer Chandan" />,
  })

  for (const e of snapshot.entities) {
    if (e.hidden) continue
    drawList.push({ key: e.id, y: e.pixel.y, node: <EntityNode key={e.id} entity={e} /> })
  }

  // Stable y-sort (feet lower on screen = drawn later = in front).
  drawList.sort((a, b) => a.y - b.y || (a.key < b.key ? -1 : 1))
  return <>{drawList.map((d) => d.node)}</>
}

function EntityNode({ entity }: { entity: RenderEntity }) {
  switch (entity.kind) {
    case 'npc':
      // NPCs draw directional walk frames from their sprite set. `right` reuses the
      // `side` art as-is; `left` mirrors it (npcSprite handles the frame lookup).
      return entity.spriteBase ? (
        <Sprite
          pixel={entity.pixel}
          src={npcSprite(entity.spriteBase, entity.direction, entity.animFrame ?? 0)}
          alt={entity.name ?? 'Person'}
          flipX={entity.direction === 'left'}
        />
      ) : null
    case 'item':
      // Ground items (a Poké Ball) are small props, not tile-tall characters - draw them
      // at ~60% of a tile, centered, so they read as an item lying on the ground.
      return entity.sprite ? (
        <Sprite
          pixel={entity.pixel}
          src={entity.sprite.src}
          alt={entity.sprite.alt}
          heightPx={Math.round(TILE_SIZE * 0.6)}
          centered
        />
      ) : null
    case 'sign':
      return null // signs are part of the map art; the interaction prompt shows on approach
    default:
      return null // warps + triggers are invisible in the world
  }
}

/**
 * A tile-anchored sprite. By default it draws at the art's NATURAL pixel size, feet at
 * the tile bottom (head overhangs upward - the classic overworld character look).
 *
 * - `heightPx` forces a specific rendered height (used to shrink small props like items).
 * - `centered` centers the sprite in the tile instead of anchoring it to the bottom
 *   (right for a ball lying on the ground rather than a standing character).
 */
function Sprite({
  pixel,
  src,
  alt,
  flipX = false,
  heightPx,
  centered = false,
}: {
  pixel: { x: number; y: number }
  src: string
  alt: string
  flipX?: boolean
  heightPx?: number
  centered?: boolean
}) {
  const anchor = centered
    ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
    : 'bottom-0 left-1/2 -translate-x-1/2'
  return (
    <div
      className="absolute"
      style={{
        width: TILE_SIZE,
        height: TILE_SIZE,
        transform: `translate3d(${pixel.x}px, ${pixel.y}px, 0)`,
      }}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        style={heightPx ? { height: heightPx } : undefined}
        className={`absolute max-w-none [image-rendering:pixelated] ${anchor}${
          flipX ? ' -scale-x-100' : ''
        }`}
      />
    </div>
  )
}
