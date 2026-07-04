import type { Metadata } from 'next'
import { TopNav, TrainerSidebar, Footer } from '@/recruiter/layout'
import { RecruiterChrome } from '@/recruiter/layout/RecruiterChrome'

export const metadata: Metadata = {
  title: {
    default: 'Recruiter Mode - Trainer Chandan',
    template: '%s - Trainer Chandan',
  },
  description:
    "Trainer Chandan's portfolio in Recruiter Mode: Trainer Card, Pokédex projects, Journal, Badges and Pokémon Center.",
}

/**
 * Recruiter Mode shell - the canonical top-nav + right-sidebar layout
 * (docs/DECISIONS.md, M6). The main column holds each page; the Trainer sidebar sits
 * to the right on desktop and moves below content on smaller screens so nothing is
 * ever lost.
 */
export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
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
