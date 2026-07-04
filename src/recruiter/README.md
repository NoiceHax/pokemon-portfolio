# recruiter/ - Recruiter Mode feature components

The premium SaaS presentation layer. Feature-grouped (not type-grouped) per CLAUDE.md.

- `layout/` - top nav + right-rail trainer sidebar + footer (canonical nav:
  Trainer Card · Pokédex · Journal · Badges · Pokémon Center)
- `trainer-card/` - TrainerCard, TrainerHeader, TrainerStats, ProjectParty, ...
- `pokedex/` - PokedexGrid, PokedexCard, PokedexEntry, ...
- `journal/` - JournalList, JournalEntry, JournalSidebar, ...
- `badge-case/` - BadgeGrid, BadgeCard, BadgeDetail, CompletionBar, ...
- `pokemon-center/` - ContactForm, ContactLinks, ...

## Rules

- Renders content from `@/content` only. No invented data, no duplicated content.
- Everything reachable within two clicks (DESIGN.md). Target: recruiter understands
  Chandan in ~60 seconds.

## Dependency direction

`recruiter` may depend on `content`, `lib`, `engine`, `components`, `hooks`,
`providers`. It must not depend on `world`.
