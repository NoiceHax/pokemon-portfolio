import type { ProjectInput } from '@/content/schema'

/**
 * Project data (Pokédex entries).
 *
 * Placeholder entries were removed - add real projects here.
 *
 * To add a project: push a ProjectInput object below (see ProjectInput in
 * @/content/schema/project.ts for the full shape). Required fields: slug, dexNumber,
 * title, summary, status, types (≥1 pokemonType), cover ({ src, alt }), stack, links.
 * Optional: description, challenges, lessons, featured. Set `featured: true` and add the
 * slug to `featuredProjectSlugs` in @/content/data/profile.ts to show it in the party.
 */
export const projects: ProjectInput[] = [
  {
    slug: 'learnflow-ai',
    dexNumber: 1,
    title: 'LearnFlow AI',
    summary:
      'An adaptive AI learning platform that generates personalized study paths, tracks mastery, conducts weighted assessments, and teaches through a Socratic AI mentor.',
    status: 'production',
    types: ['water'],
    cover: {
      src: '/projects/learnflowai.png',
      alt: 'LearnFlow AI',
    },
    problemSolved:
      'Traditional learning platforms force every student through the same curriculum regardless of their pace or understanding. LearnFlow AI continuously evaluates mastery, generates personalized study paths, and uses Socratic questioning to guide students toward deeper conceptual understanding rather than simply providing answers.',
    stack: ['Next.js', 'React', 'TypeScript', 'Python', 'FastAPI', 'PostgreSQL', 'RAG', 'Gemini'],
    links: [
      {
        label: 'Live Site',
        href: 'https://learnflow.noicehax.dev',
        kind: 'live',
      },
      {
        label: 'Repository',
        href: 'https://github.com/NoiceHax/Learnflow-AI',
        kind: 'repo',
      },
    ],
    featured: true,
  },

  {
    slug: 'aasrah',
    dexNumber: 2,
    title: 'Aasrah',
    summary:
      'A platform connecting citizens, volunteers, and NGOs to streamline reporting and assistance for homeless individuals.',
    status: 'prototype',
    types: ['grass'],
    cover: {
      src: '/projects/aasrah.png',
      alt: 'Aasrah',
    },
    problemSolved:
      'Helping homeless individuals often requires coordination between multiple organizations, resulting in delayed responses and duplicated efforts. Aasrah creates a unified workflow where citizens submit reports, NGOs manage cases, volunteers choose or receive assignments, and every report remains traceable throughout its lifecycle.',
    stack: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS', 'Google Maps', 'Cloudinary'],
    links: [
      {
        label: 'Live Site',
        href: 'https://aasrah.noicehax.dev',
        kind: 'live',
      },
      {
        label: 'Repository',
        href: 'https://github.com/NoiceHax/Aasrah',
        kind: 'repo',
      },
    ],
    featured: true,
  },

  {
    slug: 'divyalipi-ai',
    dexNumber: 3,
    title: 'DivyaLipi AI',
    summary:
      'An AI-powered OCR pipeline for digitizing and translating ancient Sanskrit manuscripts.',
    status: 'production',
    types: ['psychic'],
    cover: {
      src: '/projects/divyalipi.png',
      alt: 'DivyaLipi AI',
    },
    problemSolved:
      'Existing OCR systems perform poorly on degraded historical Sanskrit manuscripts due to image noise, faded ink, and handwritten scripts. DivyaLipi AI combines document localization, OCR, image preprocessing, and LLM-assisted translation to recover readable digital text from centuries-old manuscripts.',
    stack: ['React', 'FastAPI', 'Python', 'YOLOv8', 'OpenCV', 'Gemini', 'Computer Vision', 'OCR'],
    links: [
      {
        label: 'Repository',
        href: 'https://github.com/NoiceHax/DivyaLipi-AI',
        kind: 'repo',
      },
      {
        label: 'Live Demo',
        href: 'https://divya-lipi-ai.vercel.app/',
        kind: 'demo',
      },
    ],
    featured: true,
  },

  {
    slug: 'ssf-platform',
    dexNumber: 4,
    title: 'Snehasammilana Trust Platform',
    summary:
      'A modern event platform replacing a legacy WordPress website with a scalable, zero-cost content architecture.',
    status: 'production',
    types: ['normal'],
    cover: {
      src: '/projects/ssf.png',
      alt: 'Snehasammilana Trust Platform',
    },
    problemSolved:
      'Managing hundreds of megabytes of event photos on free hosting while allowing non-technical administrators to publish new events is difficult. The platform uses GitHub as a headless CMS, jsDelivr as a global CDN, and runtime event discovery to deliver scalable media hosting without requiring redeployment or paid infrastructure.',
    stack: ['Next.js', 'TypeScript', 'GitHub API', 'jsDelivr', 'ISR', 'Tailwind CSS'],
    links: [
      {
        label: 'Website',
        href: 'https://ssf-alpha.vercel.app/',
        kind: 'demo',
      },
    ],
  },

  {
    slug: 'ai-scanner',
    dexNumber: 5,
    title: 'AI Security Scanner',
    summary:
      'A security scanner that statically analyzes repositories and probes live sites, then summarizes findings with AI.',
    status: 'prototype',
    types: ['fire'],
    cover: {
      src: '/projects/qwerty.png',
      alt: 'AI Security Scanner',
    },
    problemSolved:
      'Security checks are usually spread across separate tools for secrets, dependencies, headers and endpoints. The scanner clones a repository for static checks (secrets, dangerous functions, dependency audit, misconfiguration), probes the live site for TLS, headers, CORS, cookies and harmless injection tests, then correlates and scores the findings and has Gemini explain them, with scans running as queued jobs that report progress live.',
    stack: [
      'Next.js',
      'FastAPI',
      'Python',
      'Gemini',
      'PostgreSQL',
      'Redis + RQ',
      'WebSockets',
      'GitHub OAuth',
    ],
    links: [
      {
        label: 'Live Demo',
        href: 'https://qwerty-iota-three.vercel.app/dashboard',
        kind: 'demo',
      },
      {
        label: 'Repository',
        href: 'https://github.com/NoiceHax/qwerty',
        kind: 'repo',
      },
    ],
  },

  {
    slug: 'pokedex-portfolio',
    dexNumber: 6,
    title: 'Pokédex Portfolio',
    summary:
      'An interactive portfolio inspired by Pokémon FireRed, built as an explorable browser game instead of a traditional website.',
    status: 'production',
    types: ['fire'],
    cover: {
      src: '/projects/portfolio.png',
      alt: 'Pokédex Portfolio',
    },
    problemSolved:
      'Traditional portfolio websites are static and forgettable. This project recreates the feel of Pokémon FireRed in the browser with a custom tile engine, collision detection, layered maps, NPC interactions, building interiors, camera movement, and interactive project exploration to create a memorable developer portfolio.',
    stack: ['Next.js', 'React', 'TypeScript', 'Canvas', 'Tailwind CSS', 'Framer Motion'],
    links: [
      {
        label: 'Live Site',
        href: 'https://noicehax.dev',
        kind: 'live',
      },
    ],
  },

  {
    slug: 'chinnaswamy-farm-stay',
    dexNumber: 7,
    title: 'Chinnaswamy Farm Stay',
    summary:
      'A content-driven marketing site for a family-run farm stay near Sarjapura, with hour-aware theming and strong SEO.',
    status: 'production',
    types: ['grass'],
    cover: {
      src: '/projects/chinnaswamy.jpg',
      alt: 'Chinnaswamy Farm Stay',
    },
    problemSolved:
      'A small farm stay needed a modern, indexable website without a CMS or backend. The site keeps all copy as typed content, paints dawn-to-night palettes before hydration, and ships structured data so search and social previews stay accurate while bookings stay on Airbnb.',
    stack: ['Next.js', 'React 19', 'TypeScript', 'Tailwind CSS', 'SEO', 'Vercel'],
    links: [
      {
        label: 'Website',
        href: 'https://www.chinnaswamyfarm.in',
        kind: 'live',
      },
    ],
    featured: true,
  },

  {
    slug: 'shree-solar',
    dexNumber: 8,
    title: 'Shree Solar Systems',
    summary:
      'A prerendered marketing site for a Sarjapura solar installer, built for SEO and social sharing.',
    status: 'production',
    types: ['electric'],
    cover: {
      src: '/projects/shree-solar.jpg',
      alt: 'Shree Solar Systems',
    },
    problemSolved:
      'Client-rendered SPAs leave search engines and WhatsApp scrapers with an empty shell. This site uses a Vite SSR + prerender pipeline so every route ships real HTML, metadata, and JSON-LD while staying easy to maintain in plain React.',
    stack: ['React 19', 'Vite', 'SSR', 'Prerender', 'CSS', 'Vercel'],
    links: [
      {
        label: 'Website',
        href: 'https://www.shreesolarsystems.com',
        kind: 'live',
      },
    ],
    featured: true,
  },

  {
    slug: 'minecraft-manager',
    dexNumber: 9,
    title: 'Minecraft Manager',
    summary:
      'An event-driven daemon that owns a Dockerised Minecraft server lifecycle with Discord, idle shutdown, and session history.',
    status: 'production',
    types: ['fire'],
    cover: {
      src: '/projects/minecraft-manager-cover.jpg',
      alt: 'Minecraft Manager',
    },
    problemSolved:
      'Homelab Minecraft ops were split across fragile scripts for Discord bridging and idle shutdown. One typed, restart-safe daemon now streams logs, tracks players, auto-stops idle servers, and keeps the whole path covered by a large automated test suite.',
    stack: ['Python', 'Docker', 'Discord', 'Event-driven', 'pyright', 'Ruff'],
    links: [
      {
        label: 'Repository',
        href: 'https://github.com/NoiceHax/minecraft-manager',
        kind: 'repo',
      },
    ],
  },

  {
    slug: 'drafter',
    dexNumber: 10,
    title: 'Drafter',
    summary:
      'An AI pre-production workspace that turns a rough idea into a structured short-form script with hooks, scenes, and visuals.',
    status: 'prototype',
    types: ['psychic'],
    cover: {
      src: '/projects/drafter.png',
      alt: 'Drafter',
    },
    problemSolved:
      'Creators often bounce between chatbots and docs to go from idea to shootable script. Drafter stages the whole pipeline — refine, angle, hooks, research, scene script, and visual directions — as a regeneratable workspace instead of a one-shot chat.',
    stack: ['Next.js', 'TypeScript', 'Python', 'FastAPI', 'SSE', 'PostgreSQL'],
    links: [
      {
        label: 'Live Site',
        href: 'https://drafter.noicehax.dev',
        kind: 'live',
      },
      {
        label: 'Repository',
        href: 'https://github.com/NoiceHax/Drafter',
        kind: 'repo',
      },
    ],
  },

  {
    slug: 'ragnotebook',
    dexNumber: 11,
    title: 'PDFChat / RAG Notebook',
    summary:
      'A full RAG pipeline for chatting with PDFs using page-level citations and grounded answers.',
    status: 'production',
    types: ['psychic'],
    cover: {
      src: '/projects/ragnotebook.png',
      alt: 'PDFChat RAG Notebook',
    },
    problemSolved:
      'Generic chatbots invent answers about uploaded documents. This pipeline chunks PDFs with page metadata, embeds into ChromaDB, and generates answers with citations so every claim stays tied to source pages.',
    stack: ['React 19', 'Vite', 'FastAPI', 'PyMuPDF', 'ChromaDB', 'Gemini Embeddings', 'Groq'],
    links: [
      {
        label: 'Live Site',
        href: 'https://rag.noicehax.dev',
        kind: 'live',
      },
      {
        label: 'Repository',
        href: 'https://github.com/NoiceHax/ragnotebook',
        kind: 'repo',
      },
    ],
  },

  {
    slug: 'search-typeahead',
    dexNumber: 12,
    title: 'Search Typeahead System',
    summary:
      'A sub-millisecond prefix autocomplete service over a 200k-query dataset with popularity and trending rankers.',
    status: 'production',
    types: ['electric'],
    cover: {
      src: '/projects/search-typeahead.png',
      alt: 'Search Typeahead System',
    },
    problemSolved:
      'Keystroke-path search needs single-digit millisecond lookups, relevance under both all-time and trending scores, and batched write pressure. This service implements prefix ranking, an in-process distributed cache, and aggregated counter updates against the ORCAS dataset.',
    stack: ['Node.js', 'TypeScript', 'Caching', 'ORCAS Dataset'],
    links: [
      {
        label: 'Live Site',
        href: 'https://search.noicehax.dev',
        kind: 'live',
      },
      {
        label: 'Repository',
        href: 'https://github.com/NoiceHax/Search-Typeahead-System',
        kind: 'repo',
      },
    ],
  },

  {
    slug: 'lagclear',
    dexNumber: 13,
    title: 'LagClear',
    summary:
      'A browser extension that virtualizes off-screen AI chat messages so long threads stay fast.',
    status: 'production',
    types: ['electric'],
    cover: {
      src: '/projects/lagclear.png',
      alt: 'LagClear extension',
    },
    problemSolved:
      'Long ChatGPT/Claude/Gemini threads lag because every message stays in the DOM. LagClear applies content-visibility virtualization to off-screen turns so a 2,000-message thread paints about as cheaply as a short one.',
    stack: ['JavaScript', 'Manifest V3', 'Chrome', 'Firefox', 'CSS Containment'],
    links: [
      {
        label: 'Repository',
        href: 'https://github.com/NoiceHax/lagclear-extension',
        kind: 'repo',
      },
    ],
  },

  {
    slug: 'waltuh',
    dexNumber: 14,
    title: 'Waltuh',
    summary:
      'An orchestration layer for Claude Code where Claude decides and Waltuh executes with benchmarks and acceptance gates.',
    status: 'prototype',
    types: ['normal'],
    cover: {
      src: '/projects/waltuh-cover.jpg',
      alt: 'Waltuh',
    },
    problemSolved:
      'Agent runs need a reliable execution and evaluation harness around Claude Code. Waltuh separates decision from execution and ships doctor checks, acceptance tests, and published benchmarks so agent behavior can be verified instead of trusted blindly.',
    stack: ['Node.js', 'TypeScript', 'Claude Code', 'Benchmarks'],
    links: [
      {
        label: 'Repository',
        href: 'https://github.com/NoiceHax/Waltuh',
        kind: 'repo',
      },
    ],
  },

  {
    slug: 'github-analyzer',
    dexNumber: 15,
    title: 'GitHub Portfolio Analyzer',
    summary:
      'A web app that scores GitHub profiles, checks repo health, and suggests actionable portfolio improvements.',
    status: 'prototype',
    types: ['normal'],
    cover: {
      src: '/projects/github-analyzer.png',
      alt: 'GitHub Portfolio Analyzer',
    },
    problemSolved:
      'Developers struggle to see how recruiters read their GitHub. The analyzer scores profiles, reviews repository health, and generates README-oriented recommendations in a single responsive UI.',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'GitHub API'],
    links: [
      {
        label: 'Live Site',
        href: 'https://github.noicehax.dev',
        kind: 'live',
      },
      {
        label: 'Repository',
        href: 'https://github.com/NoiceHax/githubanalyzer',
        kind: 'repo',
      },
    ],
  },

  {
    slug: 'seq2seq-date',
    dexNumber: 16,
    title: 'Seq2Seq Date Conversion',
    summary:
      'An attention-based sequence-to-sequence model that converts free-form date phrases into standard formats.',
    status: 'prototype',
    types: ['psychic'],
    cover: {
      src: '/projects/seq2seq-date.png',
      alt: 'Seq2Seq date conversion attention heatmap',
    },
    problemSolved:
      'Natural-language dates are messy and inconsistent. This project trains an attention seq2seq model to map informal date phrases into structured outputs and visualizes where the model attends while decoding.',
    stack: ['Python', 'PyTorch', 'Attention', 'NLP'],
    links: [
      {
        label: 'Repository',
        href: 'https://github.com/NoiceHax/seq2seq-date',
        kind: 'repo',
      },
    ],
  },

  {
    slug: 'persona-chatbot',
    dexNumber: 17,
    title: 'Scaler Mentors Persona Chat',
    summary:
      'Chat with three AI-powered Scaler mentor personas, each with a distinct teaching style.',
    status: 'prototype',
    types: ['psychic'],
    cover: {
      src: '/projects/persona-chatbot.png',
      alt: 'Scaler Mentors Persona Chat',
    },
    problemSolved:
      'Generic tutoring chatbots lack a consistent teaching voice. Separate mentor personas (DSA, career strategy, intuitive explanations) keep tone and guidance style stable while sharing one LLM backend.',
    stack: ['React', 'Vite', 'Node.js', 'NVIDIA NIM', 'LLM'],
    links: [
      {
        label: 'Live Site',
        href: 'https://persona.noicehax.dev',
        kind: 'live',
      },
      {
        label: 'Repository',
        href: 'https://github.com/NoiceHax/persona-chatbot',
        kind: 'repo',
      },
    ],
  },

  {
    slug: 'model-visualiser',
    dexNumber: 18,
    title: 'YOLOv8 Model Visualiser',
    summary:
      'A React showcase of a YOLOv8m detector trained to 95.5% mAP@0.5 on only 600 custom images.',
    status: 'production',
    types: ['psychic'],
    cover: {
      src: '/projects/model-visualiser.png',
      alt: 'YOLOv8 model performance curves',
    },
    problemSolved:
      'Training results are hard to communicate without interactive evidence. The showcase surfaces PR/F1 curves and prediction exploration so model quality is visible without digging through training logs.',
    stack: ['React', 'YOLOv8', 'Computer Vision', 'Python'],
    links: [
      {
        label: 'Live Demo',
        href: 'https://model-visualiser.vercel.app/',
        kind: 'demo',
      },
    ],
  },

  {
    slug: 'vibecoolertunes',
    dexNumber: 19,
    title: 'vibecoolertunes',
    summary:
      'Claude Code plugins for distinct stop-reason notification tones and turn timeline reporting.',
    status: 'production',
    types: ['normal'],
    cover: {
      src: '/projects/vibecoolertunes-cover.jpg',
      alt: 'vibecoolertunes',
    },
    problemSolved:
      'A single alert does not tell you whether Claude finished, needs permission, or is waiting on a question. These plugins play distinct tones when the terminal is unfocused and add wall-clock turn timelines for past sessions.',
    stack: ['Claude Code', 'Plugins', 'TypeScript'],
    links: [
      {
        label: 'Repository',
        href: 'https://github.com/NoiceHax/vibecoolertunes',
        kind: 'repo',
      },
    ],
  },

  {
    slug: '65to70',
    dexNumber: 20,
    title: '65to70',
    summary:
      'A local-first browser extension that detects what you finish watching across sites, merges watchlists, and syncs to Simkl, Trakt or Letterboxd.',
    status: 'prototype',
    types: ['water'],
    cover: {
      src: '/projects/65to70.png',
      alt: '65to70',
    },
    problemSolved:
      'Watch history and watchlists end up scattered across streaming sites, and trackers want your data uploaded first. The extension asks for no host permissions at install, registers a site only when you switch it on, identifies titles through TMDB with an offline fallback index, and keeps history in IndexedDB until you choose to push it to a tracker you connected.',
    stack: [
      'TypeScript',
      'WXT (MV3)',
      'React 19',
      'Dexie / IndexedDB',
      'TMDB API',
      'Vitest',
      'GitHub Actions',
    ],
    links: [
      {
        label: 'Repository',
        href: 'https://github.com/NoiceHax/65to70',
        kind: 'repo',
      },
    ],
    featured: true,
  },

  {
    slug: 'tastebin',
    dexNumber: 21,
    title: 'Tastebin',
    summary:
      'A self-hosted, invite-only pastebin with multi-file uploads, a built-in PDF reader, expiry, burn-after-reading and curl uploads.',
    status: 'prototype',
    types: ['water'],
    cover: {
      src: '/projects/tastebin.png',
      alt: 'Tastebin',
    },
    problemSolved:
      'Sharing code, files and PDFs privately without a public paste site. Pastes are unlisted and can expire or delete themselves after a set number of reads, and a link preview never spends a read because only an explicit Reveal counts. Uploads are stored once by hash and type-checked from their bytes.',
    stack: [
      'FastAPI',
      'SQLAlchemy 2',
      'Alembic',
      'PostgreSQL',
      'Next.js 16',
      'CodeMirror 6',
      'pdf.js',
      'Docker',
    ],
    links: [],
  },

  {
    slug: 'homelab-control-panel',
    dexNumber: 22,
    title: 'Homelab Control Panel',
    summary:
      'A self-hosted dashboard for managing Docker containers on a homelab over SSH, with a Minecraft server console and properties editor.',
    status: 'prototype',
    types: ['fire'],
    cover: {
      src: '/projects/homelab-control-panel.png',
      alt: 'Homelab Control Panel',
    },
    problemSolved:
      'Managing a homelab usually means SSHing in to run docker commands. The panel gives a role-gated web UI to start, stop and restart containers, stream logs and watch live host and container stats over WebSockets, with every change audit-logged. A Minecraft module shows server status, runs RCON commands and edits server.properties.',
    stack: [
      'FastAPI',
      'SQLAlchemy',
      'Docker SDK',
      'asyncssh',
      'Next.js 15',
      'shadcn/ui',
      'xterm.js',
      'WebSockets',
    ],
    links: [],
  },

  {
    slug: 'expensetrail',
    dexNumber: 23,
    title: 'ExpenseTrail (DevOps Capstone)',
    summary:
      'A small expense tracker taken from laptop to a monitored Kubernetes deploy: CI with security scans, Helm, Terraform for EKS, Argo CD and Grafana.',
    status: 'prototype',
    types: ['fire'],
    cover: {
      src: '/projects/expensetrail.png',
      alt: 'ExpenseTrail',
    },
    problemSolved:
      'A capstone showing the full automated path for a simple app. The pipeline tests, scans code and images (Bandit, pip-audit, gitleaks, Trivy) and pushes SHA-tagged images to GHCR; Helm deploys it with migrations and autoscaling, Argo CD keeps it in sync, and Prometheus and Grafana monitor it. Terraform ran against LocalStack rather than real AWS.',
    stack: [
      'FastAPI',
      'PostgreSQL',
      'GitHub Actions',
      'Helm',
      'Terraform',
      'Argo CD',
      'Prometheus / Grafana',
      'Trivy',
    ],
    links: [],
  },

  {
    slug: 'bohred',
    dexNumber: 24,
    title: 'Bohred',
    summary:
      'A periodic-table learning app with drag-and-drop placement, a quiz mode and badges, syncing progress to Firebase.',
    status: 'production',
    types: ['grass'],
    cover: {
      src: '/projects/bohred.png',
      alt: 'Bohred',
    },
    problemSolved:
      'Memorising the periodic table is dull. Students place elements into the grid by drag-and-drop, play a game mode and earn badges for streaks, groups and blocks mastered, with progress merged between the browser and Firestore under Google sign-in.',
    stack: ['React 19', 'Vite', 'React Router 7', 'Firebase Auth', 'Firestore', 'Netlify'],
    links: [
      {
        label: 'Live Site',
        href: 'https://bohred.netlify.app',
        kind: 'live',
      },
    ],
  },

  {
    slug: 'starmap-wallpaper',
    dexNumber: 25,
    title: 'Starmap Wallpaper',
    summary:
      'Generates a wallpaper of the real night sky above your location (stars, constellations and planets) and applies it on Hyprland.',
    status: 'production',
    types: ['normal'],
    cover: {
      src: '/projects/starmap-wallpaper.png',
      alt: 'Starmap Wallpaper',
    },
    problemSolved:
      'A desktop wallpaper that shows the sky as it actually is right now. It computes star positions from the Hipparcos catalogue and planet positions with Skyfield, sizes and colours stars by magnitude, detects location and screen resolution, and redraws every 12 hours on a systemd timer.',
    stack: ['Python', 'Skyfield', 'NumPy', 'pandas', 'matplotlib', 'systemd', 'Hyprland'],
    links: [
      {
        label: 'Repository',
        href: 'https://github.com/NoiceHax/starmap-wallpaper',
        kind: 'repo',
      },
    ],
  },

  {
    slug: 'minecraft-server',
    dexNumber: 26,
    title: 'Minecraft Server',
    summary:
      'A self-hosted Paper Minecraft server on my homelab, run in Docker and managed end to end by Minecraft Manager.',
    status: 'production',
    types: ['fire'],
    cover: {
      src: '/projects/minecraft-server-cover.jpg',
      alt: 'Minecraft block-letter sign with toy figures',
    },
    problemSolved:
      "Friends wanted an always-available survival world without paying for hosting or leaving a 4 GB JVM running all day. The server runs Paper 26.2 on Java 25 in the itzg/minecraft-server container with Aikar's JVM flags, boots in about 14 seconds, and is reachable over the internet. Minecraft Manager watches its logs, shuts it down after 15 idle minutes, and lets friends check status or start it from Discord.",
    stack: ['Docker', 'itzg/minecraft-server', 'Paper 26.2', 'Java 25', 'RCON', 'Discord', 'Linux'],
    links: [],
  },
]
