import type { Metadata } from 'next'
import { DEFAULT_OG_IMAGE, SITE_NAME } from '@/lib/seo'
import { TopNav, TrainerSidebar, Footer } from '@/recruiter/layout'
import { RecruiterChrome } from '@/recruiter/layout/RecruiterChrome'

export const metadata: Metadata = {
  title: {
    default: 'Home - Trainer Chandan',
    template: '%s - Trainer Chandan',
  },
  description:
    "Trainer Chandan's portfolio: Trainer Card, Pokédex projects, Journal, Journey and Pokémon Center.",
  // Share-card defaults for every Home page. og:title and og:description are left unset so
  // each page's own title/description flow in; './' resolves against the request path, so
  // every page gets its own og:url from this one line. A child that sets `openGraph`
  // replaces this object wholesale, so the detail routes repeat these keys.
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    url: './',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
  },
  // The root sets a twitter card, and Next only back-fills twitter from openGraph when a
  // card is declared at this level too - without this, every Home page would keep the
  // root's card title, description and image.
  twitter: { card: 'summary_large_image' },
}

/**
 * Home shell - the canonical top-nav + right-sidebar layout (docs/DECISIONS.md, M6).
 * The main column holds each page; the Trainer sidebar sits to the right on desktop
 * and moves below content on smaller screens so nothing is ever lost.
 */
export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface text-ink">
      <TopNav />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_18rem]">
          <main className="min-w-0">{children}</main>
          <div className="lg:sticky lg:top-20 lg:h-fit">
            <TrainerSidebar />
          </div>
        </div>
      </div>
      <Footer />
      <RecruiterChrome />
    </div>
  )
}
