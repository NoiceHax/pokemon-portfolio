'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, X } from 'lucide-react'
import {
  getProfile,
  getFeaturedProjects,
  getContact,
  getExperience,
} from '@/lib/content'
import type { BlogFrontmatter } from '@/content/schema'
import { TrainerHeader } from '@/recruiter/trainer-card'
import { PokedexCard } from '@/recruiter/pokedex/PokedexCard'
import { JournalCard } from '@/recruiter/journal'
import { ContactLinks } from '@/recruiter/pokemon-center/ContactLinks'
import { JourneyTimeline } from '@/recruiter/experience'
import {
  getDestination,
  type RecruiterDestinationId,
} from '@/world/world/recruiterPortals'

/**
 * Recruiter Preview - the "looking inside the building" screen shown after entering a
 * house door, before opening the full recruiter page. Generic: it picks a per-destination
 * preview body (a teaser built from the SAME shared content the real pages use) and a CTA
 * that opens the full page. Adding a destination = one case here + an entry in
 * recruiterPortals.ts.
 */
export function RecruiterPreview({
  destinationId,
  onEnter,
  onClose,
}: {
  destinationId: RecruiterDestinationId
  /** Open the full recruiter page (CTA). */
  onEnter: () => void
  /** Back to Adventure without entering (close the preview). */
  onClose: () => void
}) {
  const dest = getDestination(destinationId)

  // Esc closes the preview (back to Adventure) - matches the "Skip / Back" convention used
  // everywhere else. The dialogue box isn't up here, so a global listener is safe.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      data-input-capture="true"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <div className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-card border-2 border-poke-red bg-surface p-6 shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Back to Adventure (Esc)"
          className="absolute right-3 top-3 rounded-md border border-edge p-1.5 text-ink-soft hover:text-poke-red"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        <p className="mb-1 font-mono text-xs uppercase tracking-widest text-ink-faint">
          You peek inside...  <span className="normal-case">press Esc to go back</span>
        </p>
        <h2 className="mb-4 font-display text-xl text-poke-red">{dest.label}</h2>

        <PreviewBody destinationId={destinationId} />

        <button
          onClick={onEnter}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-poke-red px-5 py-3 font-mono text-sm font-semibold text-white transition-colors hover:bg-poke-red-dark"
        >
          {dest.cta}
          <ArrowRight aria-hidden className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

/** Per-destination teaser bodies, all built from the shared content layer. */
function PreviewBody({ destinationId }: { destinationId: RecruiterDestinationId }) {
  switch (destinationId) {
    case 'trainer-card':
      // Hero section ONLY - no quick-nav cards, no bottom feature cards.
      return (
        <div className="rounded-card border border-edge bg-surface-raised p-4">
          <TrainerHeader profile={getProfile()} />
        </div>
      )

    case 'pokedex':
      // Top 5 featured projects as preview cards.
      return (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {getFeaturedProjects()
            .slice(0, 5)
            .map((project) => (
              <li key={project.slug}>
                <PokedexCard project={project} />
              </li>
            ))}
        </ul>
      )

    case 'journal':
      // The 5 most recent PUBLISHED posts, fetched live (DB-first) so newly published
      // entries show up here immediately - not a stale static teaser.
      return <JournalPreview />

    case 'pokemon-center':
      // Contact section preview.
      return (
        <div className="rounded-card border border-edge bg-surface-raised p-4">
          <p className="mb-3 font-mono text-sm text-ink-soft">
            Heal up and reach out - let&apos;s connect.
          </p>
          <ContactLinks channels={getContact().channels} />
        </div>
      )

    case 'journey':
      // Journey timeline preview (latest milestones first).
      return <JourneyTimeline milestones={getExperience()} />
  }
}

/**
 * The 5 most recent published Journal entries, fetched from the public /api/journal
 * endpoint (DB-first, MDX fallback). Client-side so it reflects posts published after the
 * page was built. Shows a light loading line and a graceful empty state.
 */
function JournalPreview() {
  const [entries, setEntries] = useState<BlogFrontmatter[] | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/journal', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { entries: [] }))
      .then((data: { entries?: BlogFrontmatter[] }) => {
        if (!cancelled) setEntries(data.entries ?? [])
      })
      .catch(() => {
        if (!cancelled) setEntries([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (entries === null) {
    return <p className="font-mono text-sm text-ink-faint">Loading recent entries…</p>
  }
  if (entries.length === 0) {
    return <p className="font-mono text-sm text-ink-faint">No journal entries yet.</p>
  }
  return (
    <ul className="flex flex-col gap-3">
      {entries.slice(0, 5).map((entry) => (
        <li key={entry.slug}>
          <JournalCard entry={entry} />
        </li>
      ))}
    </ul>
  )
}
