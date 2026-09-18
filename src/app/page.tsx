import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { BootGuard } from '@/components/boot/BootGuard'
import { BootSequence } from '@/components/boot/BootSequence'
import {
  getProfile,
  getFeaturedProjects,
  getProjects,
  getJournalEntries,
  getExperience,
  getContact,
} from '@/lib/content'
import { JsonLd, personSchema, webSiteSchema } from '@/lib/seo'
import { Panel } from '@/recruiter/ui'
import { TrainerHeader, TrainerStats, ProjectParty, QuickActions } from '@/recruiter/trainer-card'

/**
 * The Trainer Card shows a years-of-experience figure derived from the current date
 * (see content/data/profile.ts). This page is otherwise fully static, so without a
 * revalidate the number would be frozen at whatever the last manual deploy computed -
 * and deploys here are manual. One day is far finer than the annual granularity of the
 * value, and the page has no other time-dependent content.
 */
export const revalidate = 86400

export const metadata: Metadata = {
  // `/` and `/home` serve the same Trainer Card, consolidated onto this URL. The bare
  // domain is what gets typed, linked and shared, so it is the one that should be
  // indexed - pointing it at `/home` made the site's strongest URL declare itself a
  // duplicate and handed the equity to a page with no external links of its own.
  // It therefore carries the title and description a search result should show.
  // `absolute` opts out of the root layout's "%s - Trainer Chandan" template.
  //
  // The share card is unaffected: this page sets no `openGraph`, so og:title and
  // og:description still come from the root layout.
  title: { absolute: 'Chandan - Software Engineer Portfolio' },
  description:
    'Chandan, a software engineer in India: Pokédex projects, the journey so far, field notes and contact - a Pokémon-inspired interactive portfolio.',
  alternates: { canonical: '/' },
}

/**
 * Application entry point.
 *
 * Every visitor enters through the Emulator Boot (DESIGN.md: no exceptions). The boot
 * sequence runs Power → Boot → Startup → Professor Oak, then hands off to /home.
 *
 * The Trainer Card is rendered in normal document flow BEHIND the boot screen, which is
 * an opaque `fixed inset-0` overlay present in the server HTML and painted on the first
 * frame - so a visitor still only ever sees the boot. Without it this URL served 88
 * characters and no links: the boot timers wait on requestAnimationFrame and /home was
 * reachable only through a client-side router.push, which made `/` a dead end for
 * anything that does not run JS. Nothing here is hidden; the overlay simply covers it.
 * BootGuard keeps the covered subtree from being scrolled or tabbed into while it does.
 *
 * TrainerHeader owns the only <h1> on this page (and on /home), so the two pages agree
 * on their heading as well as their content.
 */
export default function RootPage() {
  const profile = getProfile()
  const featured = getFeaturedProjects()
  validateRemainingContentAtBuild()

  return (
    <>
      <BootGuard className="min-h-screen bg-surface text-ink">
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
          <Panel className="p-6">
            <TrainerHeader profile={profile} />
            <div className="mt-6">
              <TrainerStats stats={profile.stats} />
            </div>
            <div className="mt-6 border-t border-edge pt-6">
              <ProjectParty projects={featured} />
            </div>
            <div className="mt-6 border-t border-edge pt-6">
              <Link
                href="/home"
                className="inline-flex items-center gap-1 font-mono text-sm font-semibold uppercase text-poke-red-dark transition-colors hover:text-poke-red focus:outline-none focus-visible:ring-2 focus-visible:ring-poke-red"
              >
                Enter the Trainer Card
                <ArrowRight aria-hidden className="h-3 w-3" />
              </Link>
            </div>
          </Panel>

          <QuickActions />
        </div>
      </BootGuard>

      <BootSequence />

      <JsonLd data={personSchema(profile)} />
      <JsonLd data={webSiteSchema()} />
    </>
  )
}

/**
 * Accessors this page has no markup for. Touching them server-side keeps the Shared
 * Content Layer validated at build time - malformed content fails the build - which was
 * the whole job of this page before it rendered anything.
 */
function validateRemainingContentAtBuild() {
  getProjects()
  getJournalEntries()
  getExperience()
  getContact()
}
