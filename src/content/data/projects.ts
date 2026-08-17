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
    stack: [
      'Next.js',
      'React',
      'TypeScript',
      'Python',
      'FastAPI',
      'PostgreSQL',
      'RAG',
      'Gemini',
    ],
    links: [
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
    stack: [
      'React',
      'Node.js',
      'Express',
      'MongoDB',
      'Tailwind CSS',
      'Google Maps',
      'Cloudinary',
    ],
    links: [
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
    stack: [
      'React',
      'FastAPI',
      'Python',
      'YOLOv8',
      'OpenCV',
      'Gemini',
      'Computer Vision',
      'OCR',
    ],
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
    stack: [
      'Next.js',
      'TypeScript',
      'GitHub API',
      'jsDelivr',
      'ISR',
      'Tailwind CSS',
    ],
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
      'An AI-powered platform for analyzing repositories and identifying code quality and security issues.',
    status: 'prototype',
    types: ['electric'],
    cover: {
      src: '/projects/qwerty.png',
      alt: 'AI Security Scanner',
    },
    problemSolved:
      'Developers often rely on multiple disconnected tools for repository analysis, vulnerability detection, and code review. Qwerty AI Scanner consolidates these workflows into a unified interface that analyzes projects, identifies potential issues, and provides AI-generated explanations and actionable recommendations.',
    stack: [
      'Next.js',
      'TypeScript',
      'FastAPI',
      'Python',
      'AI',
      'GitHub API',
      'Tailwind CSS',
    ],
    links: [
      {
        label: 'Live Demo',
        href: 'https://qwerty-iota-three.vercel.app/dashboard',
        kind: 'demo',
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
    stack: [
      'Next.js',
      'React',
      'TypeScript',
      'Canvas',
      'Tailwind CSS',
      'Framer Motion',
    ],
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
      {
        label: 'Repository',
        href: 'https://github.com/NoiceHax/chinnaswamy-farm-stay',
        kind: 'repo',
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
      {
        label: 'Repository',
        href: 'https://github.com/NoiceHax/shree-solar',
        kind: 'repo',
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
      src: '/assets/Miscellaneous/Town_Map.png',
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
    slug: 'llm-gateway',
    dexNumber: 10,
    title: 'LLM Gateway',
    summary:
      'An OpenAI-compatible front door over a pool of NVIDIA NIM keys with per-project model routing.',
    status: 'production',
    types: ['psychic'],
    cover: {
      src: '/assets/Miscellaneous/Town_Map.png',
      alt: 'LLM Gateway',
    },
    problemSolved:
      'Multiple self-hosted apps each held their own API key and hardcoded model, so throttling or a model outage took features down independently. The gateway centralizes key pooling, rate limiting, and scored model routing behind one OpenAI-compatible endpoint.',
    stack: ['Python', 'FastAPI', 'NVIDIA NIM', 'OpenAI API', 'Routing'],
    links: [
      {
        label: 'Repository',
        href: 'https://github.com/NoiceHax/llm-gateway',
        kind: 'repo',
      },
    ],
    featured: true,
  },

  {
    slug: 'drafter',
    dexNumber: 11,
    title: 'Drafter',
    summary:
      'An AI pre-production workspace that turns a rough idea into a structured short-form script with hooks, scenes, and visuals.',
    status: 'prototype',
    types: ['psychic'],
    cover: {
      src: '/assets/Miscellaneous/Town_Map.png',
      alt: 'Drafter',
    },
    problemSolved:
      'Creators often bounce between chatbots and docs to go from idea to shootable script. Drafter stages the whole pipeline — refine, angle, hooks, research, scene script, and visual directions — as a regeneratable workspace instead of a one-shot chat.',
    stack: ['Next.js', 'TypeScript', 'Python', 'FastAPI', 'SSE', 'PostgreSQL'],
    links: [
      {
        label: 'Repository',
        href: 'https://github.com/NoiceHax/Drafter',
        kind: 'repo',
      },
    ],
  },

  {
    slug: 'ragnotebook',
    dexNumber: 12,
    title: 'PDFChat / RAG Notebook',
    summary:
      'A full RAG pipeline for chatting with PDFs using page-level citations and grounded answers.',
    status: 'production',
    types: ['psychic'],
    cover: {
      src: '/assets/Miscellaneous/Town_Map.png',
      alt: 'PDFChat RAG Notebook',
    },
    problemSolved:
      'Generic chatbots invent answers about uploaded documents. This pipeline chunks PDFs with page metadata, embeds into ChromaDB, and generates answers with citations so every claim stays tied to source pages.',
    stack: [
      'React 19',
      'Vite',
      'FastAPI',
      'PyMuPDF',
      'ChromaDB',
      'Gemini Embeddings',
      'Groq',
    ],
    links: [
      {
        label: 'Repository',
        href: 'https://github.com/NoiceHax/ragnotebook',
        kind: 'repo',
      },
    ],
  },

  {
    slug: 'rift',
    dexNumber: 13,
    title: 'Rift',
    summary:
      'An autonomous application-security orchestration platform with deterministic workflows and a unified finding model.',
    status: 'prototype',
    types: ['electric'],
    cover: {
      src: '/assets/Miscellaneous/Town_Map.png',
      alt: 'Rift',
    },
    problemSolved:
      'Point scanners dump disconnected results. Rift plans a content-addressed task DAG across Semgrep, Trivy, Gitleaks, Nuclei and others, normalizes findings, correlates them deterministically, and keeps AI as an optional enrichment leaf — never the source of truth.',
    stack: ['Python', 'PostgreSQL', 'Redis', 'Plugin SDK', 'Semgrep', 'Trivy'],
    links: [
      {
        label: 'Repository',
        href: 'https://github.com/NoiceHax/rift',
        kind: 'repo',
      },
    ],
  },

  {
    slug: 'search-typeahead',
    dexNumber: 14,
    title: 'Search Typeahead System',
    summary:
      'A sub-millisecond prefix autocomplete service over a 200k-query dataset with popularity and trending rankers.',
    status: 'production',
    types: ['electric'],
    cover: {
      src: '/assets/Miscellaneous/Town_Map.png',
      alt: 'Search Typeahead System',
    },
    problemSolved:
      'Keystroke-path search needs single-digit millisecond lookups, relevance under both all-time and trending scores, and batched write pressure. This service implements prefix ranking, an in-process distributed cache, and aggregated counter updates against the ORCAS dataset.',
    stack: ['Node.js', 'TypeScript', 'Caching', 'ORCAS Dataset'],
    links: [
      {
        label: 'Repository',
        href: 'https://github.com/NoiceHax/Search-Typeahead-System',
        kind: 'repo',
      },
    ],
  },

  {
    slug: 'lagclear',
    dexNumber: 15,
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
    dexNumber: 16,
    title: 'Waltuh',
    summary:
      'An orchestration layer for Claude Code where Claude decides and Waltuh executes with benchmarks and acceptance gates.',
    status: 'prototype',
    types: ['normal'],
    cover: {
      src: '/assets/Miscellaneous/Town_Map.png',
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
    dexNumber: 17,
    title: 'GitHub Portfolio Analyzer',
    summary:
      'A web app that scores GitHub profiles, checks repo health, and suggests actionable portfolio improvements.',
    status: 'prototype',
    types: ['normal'],
    cover: {
      src: '/assets/Miscellaneous/Town_Map.png',
      alt: 'GitHub Portfolio Analyzer',
    },
    problemSolved:
      'Developers struggle to see how recruiters read their GitHub. The analyzer scores profiles, reviews repository health, and generates README-oriented recommendations in a single responsive UI.',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'GitHub API'],
    links: [
      {
        label: 'Repository',
        href: 'https://github.com/NoiceHax/githubanalyzer',
        kind: 'repo',
      },
    ],
  },

  {
    slug: 'seq2seq-date',
    dexNumber: 18,
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
    dexNumber: 19,
    title: 'Scaler Mentors Persona Chat',
    summary:
      'Chat with three AI-powered Scaler mentor personas, each with a distinct teaching style.',
    status: 'prototype',
    types: ['psychic'],
    cover: {
      src: '/assets/Miscellaneous/Town_Map.png',
      alt: 'Scaler Mentors Persona Chat',
    },
    problemSolved:
      'Generic tutoring chatbots lack a consistent teaching voice. Separate mentor personas (DSA, career strategy, intuitive explanations) keep tone and guidance style stable while sharing one LLM backend.',
    stack: ['React', 'Vite', 'Node.js', 'NVIDIA NIM', 'LLM'],
    links: [
      {
        label: 'Repository',
        href: 'https://github.com/NoiceHax/persona-chatbot',
        kind: 'repo',
      },
    ],
  },

  {
    slug: 'model-visualiser',
    dexNumber: 20,
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
        label: 'Repository',
        href: 'https://github.com/NoiceHax/model-visualiser',
        kind: 'repo',
      },
    ],
  },

  {
    slug: 'vibecoolertunes',
    dexNumber: 21,
    title: 'vibecoolertunes',
    summary:
      'Claude Code plugins for distinct stop-reason notification tones and turn timeline reporting.',
    status: 'production',
    types: ['normal'],
    cover: {
      src: '/assets/Miscellaneous/Town_Map.png',
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
]
