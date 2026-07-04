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
        label: 'Repository',
        href: 'https://noicehax.dev',
        kind: 'repo',
      },
    ],
  },
]