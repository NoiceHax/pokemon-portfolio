import type { TileCoord } from '@/world/engine/types'

/**
 * Builds a simple, reliable collision grid for an interior room: a solid wall border
 * with an open, walkable floor, top two rows treated as furniture, and a 1-tile
 * doorway gap at the bottom-center (the exit mat).
 */
export function roomCollision(width: number, height: number): string[] {
  const doorX = Math.floor(width / 2)
  const rows: string[] = []
  for (let y = 0; y < height; y++) {
    let row = ''
    for (let x = 0; x < width; x++) {
      const isBorder = x === 0 || x === width - 1 || y === 0 || y === height - 1
      const isDoorway = y === height - 1 && x === doorX
      const isTopFurniture = y <= 1
      row += (isBorder && !isDoorway) || isTopFurniture ? '#' : '.'
    }
    rows.push(row)
  }
  return rows
}

export function roomSpawn(width: number, height: number): TileCoord {
  return { x: Math.floor(width / 2), y: height - 2 }
}

export function roomDoor(width: number, height: number): TileCoord {
  return { x: Math.floor(width / 2), y: height - 1 }
}
