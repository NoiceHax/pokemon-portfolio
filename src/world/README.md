# world/ - Adventure Engine

A reusable, event-driven exploration engine. **The engine owns all game state; React
only renders.** If React vanished, the engine would still run.

## Layers

- `engine/` - pure TypeScript, the source of truth. No React, no DOM.
  - `WorldEngine.ts` - owns player/map/entities/camera + progression; composes systems;
    publishes an immutable `snapshot()` and emits events on the `EventBus`.
  - `EventBus.ts` / `events.ts` - the typed channel every system communicates through.
  - `systems/` - one responsibility each: `CollisionSystem`, `MovementSystem`,
    `CameraSystem`, `InteractionSystem`, `TriggerSystem`, `SaveSystem`.
  - `types.ts` - `Direction`, `TileCoord`, `WorldSnapshot`, `TILE_SIZE`.
- `entities/` - the entity data model (`NpcEntity` / `SignEntity` / `WarpEntity` /
  `TriggerEntity`). Entities are DATA and carry a `dialogueId`, never a script.
- `world/` - data-driven world definitions.
  - `mapTypes.ts` - the `MapData` shape.
  - `maps/` - `cerulean.ts` + `interiors.ts` (+ generated `ceruleanCollision.ts`).
  - `dialogueRegistry.ts` / `contentDialogue.ts` - id → `DialogueScript`, reusing the
    unchanged Dialogue Engine and the shared content layer.
- `render/` - small React consumers. `WorldRenderer` instantiates the engine (once, in
  a ref), feeds it input + viewport, and bridges its events to app providers; the rest
  (`TileLayer`, `PlayerSprite`, `EntityLayer`, `DialogueOverlay`, `TouchControls`,
  `FastTravel`) render the snapshot via `useWorldSnapshot` (`useSyncExternalStore`).

## Rules

- React never holds game state. The only reactive value is the engine's snapshot.
- Systems never call each other directly - they emit events.
- Movement is grid-based, deterministic (face, then step), one tile at a time.
- The animation clock is bounded: it runs only while a step animates; idle = no CPU.
- Adding a map or NPC is adding DATA to `world/maps` - never new engine code.
- The Dialogue Engine (`@/engine/dialogue`) is reused unchanged; NPCs provide ids.

## Save shape

`{ currentMap, playerPosition, playerDirection, visitedAreas, triggeredEvents,
selectedExperience }` - plain data only, via `WorldEngine.serialize()` / `.load()`.
