import type { Metadata } from 'next'
import { DEFAULT_OG_IMAGE, SITE_NAME } from '@/lib/seo'

const DESCRIPTION =
  "Explore Trainer Chandan's portfolio as a walkable Pokémon-style world - the same projects, journal and contact routes, as a game."

/**
 * Adventure Mode is a Client Component, and a 'use client' page cannot export metadata -
 * so its title and description live here instead of inheriting the root's.
 *
 * Not indexed: the renderer is loaded with `ssr: false`, so the only HTML a crawler ever
 * receives is the "Loading world…" fallback. Indexing that would put a blank page in the
 * results under the site's name, and every project, journal entry and contact route the
 * world leads to is already indexable under /home. `follow` stays on so the crawler still
 * walks through to those.
 *
 * The share card is still worth setting: noindex keeps it out of search results, but this
 * is the link someone actually pastes into a chat, and openGraph is spelled out because
 * Next only back-fills og:title/og:description when no ancestor set them - the root does.
 */
export const metadata: Metadata = {
  title: 'Adventure Mode',
  description: DESCRIPTION,
  robots: { index: false, follow: true },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    url: '/adventure',
    title: `Adventure Mode - ${SITE_NAME}`,
    description: DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: { card: 'summary_large_image' },
}

export default function AdventureLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
