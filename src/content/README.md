# content/ - Single Source of Truth

This layer is the **trunk** of the entire product. Every piece of information about
Chandan lives here **exactly once**:

- `profile/` - name, role, region, current quest, photo, trainer stats
- `projects/` - one entry per project (rendered as Pokédex entries)
- `journal/` - MDX writing (field notes, build logs, research, thoughts)
- `badges/` - visitor-achievement definitions (belong to the visitor, not Chandan)
- `experience/` - career timeline ("Journey So Far" / route map)
- `contact.ts` - email, LinkedIn, GitHub, resume
- `schema/` - Zod schemas + inferred TypeScript types for every content kind

## Rules (from PROJECT_BIBLE.md / DESIGN.md / CLAUDE.md)

- **No presentation here.** Zero React, zero styling. Data and types only.
- **No duplication.** Recruiter Mode and Adventure Mode both _read_ this layer and
  render it differently. Neither owns a copy.
- **Placeholders until real content is provided.** Never invent factual information.

## Dependency direction

`content` depends on nothing. Everything else may depend on `content`; `content`
may not depend on `lib`, `engine`, `recruiter`, `world`, or `components`.

## Layout (implemented in Milestone 2)

- `schema/` - Zod schemas + inferred/`Input` types (the type contract)
- `data/` - placeholder content: typed TS files + `data/journal/*.mdx`

## How to read content

Consume content **only** through `@/lib/content` accessors - never import
`@/content/data/*` directly. This keeps one validated path from data to UI:

```ts
import { getProfile, getProjects, getJournalEntries } from '@/lib/content'
```

Editing a single data file (e.g. a project in `data/projects.ts`) propagates to
every accessor and therefore to both experiences - the M2 guarantee.

## Where to add the real content (placeholders removed)

All placeholder data was cleared. Add the real content at these paths:

- **Projects (Pokédex):** `src/content/data/projects.ts` - push `ProjectInput` objects
  into the `projects` array. Shape: `src/content/schema/project.ts`. To feature a
  project in the "Current Party", also add its slug to `featuredProjectSlugs` in
  `src/content/data/profile.ts`.
- **Journal (blog / build logs):** managed via the **Control Room** (`/control-room` →
  writes to NeonDB `blog_posts`, which the public Journal reads; "Publish" makes an entry
  live). Static fallback (used only when the DB has no posts): add an `.mdx` file in
  `src/content/data/journal/` (with an `export const frontmatter = {…}` block; shape:
  `src/content/schema/blog.ts`), then register it in `src/lib/content/journal.ts` (add an
  `import * as x` line and push `x` to the `modules` array).
- **Journey / Experience (route map):** edited in the static file
  `src/content/data/experience.ts` (shape: `src/content/schema/experience.ts`; exactly one
  milestone should have `current: true`). Not managed by the Control Room.
