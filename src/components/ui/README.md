# components/ui/ - Shared presentation primitives

Dumb, reusable building blocks consumed by **both** experiences. No domain logic,
no data fetching - props in, pixels out.

Planned primitives (created as features need them, not speculatively):

- `DialogueBox/` - renders output from `@/engine/dialogue`
- `PokeButton/`, `Panel/` (bracket-corner framed panel), `ProgressBar/`
  (HP-bar-style), `Cursor/` (selection cursor)
- `animations/` - reusable Framer Motion variants + wrappers

## Rules

- One responsibility per component. Keep files small.
- Extract repeated Tailwind patterns here instead of duplicating utility classes.

## Dependency direction

`components/ui` may depend on `lib`, `hooks`. It must not depend on `content`,
`recruiter`, or `world` (primitives stay generic).
