# engine/ - Shared, experience-agnostic runtime systems

Stateful systems reused across the Boot sequence and (later) the Adventure world.
These are the systems the Roadmap builds early so everything downstream reuses them.

- `emulator/` - boot state machine, first-visit gate, transition routing (Milestone 3)
- `dialogue/` - data-driven dialogue engine: typewriter, portraits, choices,
  branching, callbacks (Milestone 4). Professor Oak is the _first dataset_, not a
  special case - every NPC reuses this.
- `audio/` - audio manager: loading, playback, mute (Milestone 3/6). Always respects
  the global mute setting.
- `movement/` - faithful port of FireRed's tile-based overworld movement: grid,
  collision, per-frame speed tables, tap-to-turn state machine. Framework-agnostic
  (no React/DOM); the Adventure world layer drives it. See `movement/MOVEMENT.md`.

Presentation-layer transitions (Fade, CRT frame) live in `components/ui/transitions`
and `components/ui/CrtScreen` - they are dumb primitives, not stateful engine
systems, so they sit with the other UI primitives.

## Dependency direction

`engine` may depend on `content`, `lib`. It must not depend on `recruiter` or `world`
(those depend on `engine`, not the other way around).
