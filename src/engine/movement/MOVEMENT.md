# Overworld Movement - FireRed physics spec

This module is a faithful port of Pokémon FireRed's overworld movement, derived by
reading the decompiled game (`/pokefirered`). It exists so Adventure Mode's world
feels like the real games, not like a generic top-down toy. This document is the
spec; the code implements it 1:1.

## The one idea

**There is no physics.** No velocity, no acceleration, no momentum. The world is a
grid of 16×16px tiles. The player always occupies exactly one tile. A "move" is a
scripted slide from one tile to the adjacent tile over a fixed number of frames.
Everything that reads as "Pokémon feel" falls out of this model - not out of tuning.

Reasoning in whole tiles (never sub-pixels) is what keeps collision exact and motion
crisp. Rendered scale is a separate, purely visual concern.

## Decomp source map

| Concept | This module | FireRed source |
|---|---|---|
| Input → move/turn decision | `PlayerController` | `field_player_avatar.c` `player_step`, `CheckMovementInputNotOnBike:456` |
| Tile-based grid + collision | `collision.ts` | `event_object_movement.c` `GetCollisionAtCoords:4830` |
| Per-frame pixel step tables | `speeds.ts` | `event_object_movement.c` `sNpcStepFuncTables:8917`, `NpcTakeStep:8933` |
| Direction unit vectors | `types.ts` `DIRECTION_VECTORS` | `sDirectionToVectors:903` |
| Ledge hops | `collision.ts` | `GetLedgeJumpDirection:8303` |
| Elevation layering (bridges) | `collision.ts` | `IsElevationMismatchAt`, `AreElevationsCompatible` |

## The behaviors we preserve

### 1. Tap-to-turn (the most important one)
Standing still and pressing a direction you are **not** facing → you **pivot in
place**. You do not move; the press is consumed by the turn. You step only when you
press the direction you already face (or hold it into the next tile). This deliberate
pacing is *the* thing that separates FireRed movement from a generic 8-way walker.
(`CheckMovementInputNotOnBike`.)

### 2. Input only at tile centers
Input is sampled every frame but only **acted on** when the player is idle at a tile
center. Mid-step presses are held and applied the instant the step completes, so the
player can never end up between tiles and a continuous hold walks smoothly tile after
tile.

### 3. Speed = frames per tile
Each speed is a fixed list of per-frame pixel deltas that sum to exactly one tile
(16px). "Faster" means fewer, larger hops - not a bigger px/s number.

| Speed | Frames/tile | Deltas | ~seconds @60fps |
|---|---|---|---|
| Normal (walk) | 16 | `1`×16 | 0.27 |
| Fast (run / surf) | 8 | `2`×8 | 0.13 |
| Faster (mach bike) | 4 | `4`×4 | 0.07 |
| Fastest (warp) | 2 | `8`×2 | 0.03 |

Running requires the run modifier held (FireRed: hold B). Some tiles disallow it.

### 4. Collision, in strict order
`resolveCollision` checks the destination tile and returns the first hit:
1. **LedgeJump** - a one-way ledge in the pressed direction → hop two tiles, cannot
   be reversed.
2. **Impassable** - walls, map border, or *directional* block (a tile enterable from
   some sides but not others - cliff edges).
3. **ElevationMismatch** - different z-layer (water vs. the bridge over it). Elevation
   0 is a transition layer that connects to anything (stairs, doorways).
4. **Occupied** - another entity stands on the tile.

A blocked step still turns the player to face the wall, then stops - the bump/thud is
the whole feedback. No tile change.

## Frame-rate independence

The GBA ran the step tables at a fixed 60fps. Browsers run at 60/120/144Hz. The
`stepper` accumulates real elapsed time and consumes one table entry per `FRAME_MS`
(16.67ms), so real-world walking speed is identical on any monitor while the exact
per-frame delta sequence - and thus the look - is preserved. We deliberately do *not*
interpolate within a frame; the crisp per-pixel stepping is part of the pixel-art
feel.

## Usage sketch

```ts
import { PlayerController, Direction } from '@/engine/movement'

const player = new PlayerController({
  map,                              // TileMap: grid of Tile (blocked / elevation / ledge …)
  start: { x: 5, y: 8, facing: Direction.South },
  getObstacles: () => npcs,         // entities that block tiles
  onStepStart: (dir, kind) => playFootstep(kind),
  onBlocked: () => playBump(),
})

// each render frame:
player.setInput(currentDpadDirection, isRunHeld)
player.update(deltaMs)
const { x, y } = player.getPixelPosition() // game px; multiply by display scale
```

## Intentionally deferred

These exist in FireRed and map cleanly onto this model when a feature needs them;
they are left out until then rather than speculatively built:

- **Forced movement** - ice slip, warp currents, spin tiles, slide tiles. These live
  as tile *behaviors* in the decomp (`sForcedMovementFuncs`), so they slot in as new
  `Tile.behavior` handlers without touching the core loop.
- **Bikes / surfing state transitions** - extra `MoveSpeed`s already exist; the state
  transitions (`DoPlayerAvatarTransition`) would layer on top.
- **Vacated-tile blocking** - FireRed blocks the tile an NPC *just left* for one step;
  add `previousCoords` to `Entity` if that precision matters.
- **Source-side directional blocking** - "can't leave this tile in direction X" (only
  the destination-side check is implemented).
