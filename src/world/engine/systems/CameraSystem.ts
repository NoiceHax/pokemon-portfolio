import { TILE_SIZE } from '../types'

interface Viewport {
  width: number
  height: number
}

/**
 * CameraSystem - follows a pixel position, clamped to world bounds so the view never
 * shows past the map edge (and centers a map smaller than the viewport). Pure math; it
 * knows nothing about NPCs, dialogue, or input.
 */
export class CameraSystem {
  private viewport: Viewport = { width: 0, height: 0 }

  setViewport(width: number, height: number): void {
    this.viewport = { width, height }
  }

  /** Camera translate offset (px) that centers `pixel` within the viewport, clamped. */
  offset(
    pixel: { x: number; y: number },
    mapTilesW: number,
    mapTilesH: number,
  ): { x: number; y: number } {
    const mapW = mapTilesW * TILE_SIZE
    const mapH = mapTilesH * TILE_SIZE
    const centerX = pixel.x + TILE_SIZE / 2
    const centerY = pixel.y + TILE_SIZE / 2
    // NOT rounded: the Scene applies a CSS scale (zoom) on top of this world-pixel offset,
    // so rounding here would quantize to world pixels and each 1px step becomes a ~zoom-px
    // visual jump - a shimmer while walking. Leaving it continuous lets the browser
    // sub-pixel render a smooth scroll.
    return {
      x: this.clampAxis(this.viewport.width / 2 - centerX, this.viewport.width, mapW),
      y: this.clampAxis(this.viewport.height / 2 - centerY, this.viewport.height, mapH),
    }
  }

  private clampAxis(offset: number, viewportSize: number, mapSize: number): number {
    if (mapSize <= viewportSize) return (viewportSize - mapSize) / 2
    return Math.min(0, Math.max(viewportSize - mapSize, offset))
  }
}
