# providers/ - Cross-cutting React Context

Global state is a last resort (CLAUDE.md: "Avoid unnecessary global state"). Only
genuinely cross-cutting concerns that BOTH experiences read/write belong here:

- `SettingsProvider` - mute, reduced-motion, first-visit, chosen experience
- `AudioProvider` - current track + mute plumbing (Milestone 3/6)
- `BadgeProvider` - visitor badge unlock progress, shared by both experiences (Milestone 9)

Everything else stays local or lifted only as far as necessary.

## Dependency direction

`providers` may depend on `lib`, `content`. Components subscribe via `hooks` or
directly where appropriate.
