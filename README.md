# Trainer Chandan

> A Pokémon-inspired interactive software engineering portfolio.

A memorable product that presents the same portfolio content through multiple user experiences — designed so a recruiter finds it professional, a developer finds it fascinating, and a friend finds it personal.

---

## The Concept

Visitors begin before they know it's a portfolio. A handheld console boots. Professor Oak appears and asks a single question:

**"What kind of trainer are you?"**

That answer shapes the entire experience.

---

## The Three Experiences

### 1. Boot Sequence
A nostalgic emulator boot — GameFreak splash, title screen, Oak's intro dialogue — that establishes the world and sets tone. Fully skippable.

### 2. Recruiter Mode (`/recruiter`)
A premium SaaS interface using Pokémon design language. Structured for speed — everything visible immediately, no exploration required.

| Section | Pokémon Equivalent |
|---|---|
| Trainer Card | Who is Chandan? |
| Pokédex | Projects |
| Journal | Blog / How he thinks |
| Badge Case | Achievements |
| Pokémon Center | Contact |
| Experience | Career timeline |

### 3. Adventure Mode (`/adventure`)
A tile-based overworld where visitors physically explore a Pokémon-inspired world. Buildings represent portfolio sections. NPCs provide information. Hidden interactions reward curiosity.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.5 |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Database | Neon (PostgreSQL serverless) |
| Content | MDX + Zod schemas |
| Email | Nodemailer |
| Icons | Lucide React |

---

## Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Root → boot sequence
│   ├── adventure/              # Adventure mode world
│   ├── recruiter/              # Recruiter mode (Trainer Card, Pokédex, Journal, Badges, etc.)
│   ├── control-room/           # Admin: publish journal posts
│   ├── hall-of-fame/           # Visitor Hall of Fame
│   └── api/                    # API routes (contact, journal, visits, hall-of-fame, admin)
│
├── engine/                     # Experience-agnostic runtime systems
│   ├── emulator/               # Boot state machine, first-visit gate, transition routing
│   ├── dialogue/               # Data-driven dialogue engine (typewriter, portraits, branching)
│   ├── audio/                  # Audio manager (load, play, mute)
│   └── movement/               # Tile-based overworld movement (FireRed physics port)
│
├── components/
│   ├── boot/                   # Boot sequence screens (GameFreak, Power, Title)
│   ├── onboarding/             # Session-scoped contextual hint system
│   ├── hall-of-fame/           # Hall of Fame entry form
│   └── ui/                     # Shared primitives
│       ├── CrtScreen/          # CRT bezel frame
│       ├── DialogueBox/        # Pokémon-style dialogue (box, portrait, choices, scene)
│       ├── PixelText/          # FireRed bitmap font renderer
│       ├── animations/         # Framer Motion variants
│       └── transitions/        # Fade transition component
│
├── content/
│   ├── data/                   # Static content (badges)
│   ├── dialogue/               # Professor Oak script
│   └── schema/                 # Zod schemas (profile, project, blog, experience, badge, contact)
│
├── lib/
│   ├── db/                     # Neon database client + schema
│   ├── content/                # Content loaders and validators
│   ├── analytics/              # Visit tracking
│   ├── admin/                  # Admin auth
│   └── rateLimit.ts            # API rate limiting
│
├── hooks/                      # Shared React hooks
│   ├── useTypewriter.ts
│   ├── useVisitTracker.ts
│   ├── useElementSize.ts
│   └── usePrefersReducedMotion.ts
│
└── assets/
    └── fonts/                  # PressStart2P, VT323, PokemonEmeraldPro, PokemonFRLG

public/
└── assets/
    ├── audio/                  # Game music (title, Pokémon Center, Oak's lab, etc.)
    ├── Pokemon/                # Pokémon sprite sheets
    ├── Playable_Characters/    # Player overworld sprites
    ├── Trainers_NPCs/          # NPC sprite sheets
    └── Miscellaneous/          # UI elements, town maps, credits
```

---

## Key Systems

### Boot / Emulator Engine
`src/engine/emulator/` — A state machine that manages the full boot sequence: power-on, GameFreak logo, title screen, first-visit gate, Oak's intro, and mode selection. Handles routing to Recruiter or Adventure based on the visitor's choice.

### Dialogue Engine
`src/engine/dialogue/` — Data-driven dialogue system with typewriter animation, character portraits, branching choices, and callbacks. Professor Oak is the first dataset, not a special case — every NPC reuses the same engine.

### Movement Engine
`src/engine/movement/` — A faithful port of FireRed's tile-based overworld movement: 16×16 grid, collision detection, per-frame speed tables, tap-to-turn state machine. Framework-agnostic (no React/DOM coupling).

### Audio Manager
`src/engine/audio/` — Centralized audio: loading, looped BGM playback, SFX, and global mute. Always respects user mute preference.

### Onboarding Hints
`src/components/onboarding/` — Session-scoped contextual hint system. Hints appear once per session via `sessionStorage` and guide new visitors through controls and features without being intrusive.

### Content Layer
`src/content/schema/` — All portfolio content is defined once via Zod schemas and consumed by both Recruiter and Adventure modes. No duplicated data.

### Database (Neon)
`src/lib/db/` — PostgreSQL via Neon serverless. Powers: leaderboard/Hall of Fame, journal posts (published from Control Room), visit analytics. Gracefully degrades without credentials.

---

## Pages & Routes

| Route | Description |
|---|---|
| `/` | Boot sequence (GameFreak → Title → Oak → mode select) |
| `/recruiter` | Trainer Card (main recruiter landing) |
| `/recruiter/pokedex` | Projects list |
| `/recruiter/pokedex/[slug]` | Individual project detail |
| `/recruiter/experience` | Career experience timeline |
| `/recruiter/journal` | Blog post list |
| `/recruiter/journal/[slug]` | Individual blog post |
| `/recruiter/badges` | Badge Case (achievements) |
| `/recruiter/pokemon-center` | Contact form |
| `/adventure` | Tile-based adventure world |
| `/hall-of-fame` | Visitor Hall of Fame |
| `/control-room` | Admin: write and publish journal posts |
| `/privacy` | Privacy policy |

### API Routes

| Endpoint | Purpose |
|---|---|
| `POST /api/contact` | Contact form → email via Nodemailer |
| `GET/POST /api/journal` | Fetch / create journal posts |
| `GET/POST /api/hall-of-fame` | Visitor leaderboard entries |
| `POST /api/visits` | Visit analytics tracking |
| `POST /api/admin/login` | Admin authentication |
| `GET/POST /api/admin/posts` | Admin journal post management |

---

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment template and fill in values
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | No | Neon PostgreSQL connection string |
| `SMTP_HOST` | No | SMTP server for contact form |
| `SMTP_PORT` | No | SMTP port |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASS` | No | SMTP password |
| `ADMIN_PASSWORD` | No | Control Room admin password |

The app runs without any env vars — database and email features degrade gracefully.

---

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run typecheck    # TypeScript type check (no emit)
npm run format       # Prettier (write)
npm run format:check # Prettier (check only)
```

---

## Design Principles

- **Recruiter first** — every decision asks "does this improve the recruiter experience?"
- **One content layer** — projects, blogs, profile, and achievements exist exactly once; both modes consume the same data
- **Pokémon as design language** — interface elements (Pokédex frames, dialogue boxes, Trainer Cards) not characters or gameplay
- **Animation communicates** — every animation has a purpose; no infinite floating or random bouncing
- **Accessible** — keyboard navigable, visible focus states, `prefers-reduced-motion` respected

---

## Fonts

| Font | Use |
|---|---|
| PressStart2P | Primary pixel heading font |
| VT323 | Monospace body text in game contexts |
| PokemonEmeraldPro | Emerald-style UI text |
| PokemonFRLG | FireRed/LeafGreen dialogue font |

---

## Audio Tracks

| File | Context |
|---|---|
| `title-screen.mp3` | Boot title screen |
| `professor-oak-lab.mp3` | Oak intro sequence |
| `pokemon-center.mp3` | Contact / Pokémon Center |
| `obtained-pokemon.mp3` | Achievement stings |
| `obtained-badge.mp3` | Badge unlock |
| `victory-trainer.mp3` | Victory fanfare |
| `jigglypuffs-song.mp3` | Easter egg |
