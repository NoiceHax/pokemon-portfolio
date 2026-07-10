import Link from 'next/link'
import { Calendar, Clock, ChevronRight } from 'lucide-react'
import type { BlogFrontmatter } from '@/content/schema'
import { Panel } from '@/recruiter/ui'
import { ENTRY_TYPE_META } from './entryTypes'

/**
 * A Journal list row (mockup: cover, type + number, title, excerpt, date, read time,
 * tags). Links to the full entry.
 */
export function JournalCard({ entry }: { entry: BlogFrontmatter }) {
  const meta = ENTRY_TYPE_META[entry.type]
  return (
    <Link
      href={`/home/journal/${entry.slug}`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-poke-red"
    >
      <Panel brackets={false} className="flex gap-4 p-4 transition-colors hover:border-poke-red">
        {entry.cover ? (
          <div className="hidden h-24 w-24 shrink-0 overflow-hidden rounded-md border border-edge bg-surface-sunken sm:block">
            <img
              src={entry.cover.src}
              alt={entry.cover.alt}
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`rounded border px-1.5 py-0.5 font-mono text-xs uppercase ${meta.classes}`}
            >
              {meta.label}
            </span>
            <span className="font-mono text-xs text-ink-faint">
              #{String(entry.entryNumber).padStart(2, '0')}
            </span>
          </div>

          <h3 className="mt-1 font-display text-lg font-bold text-ink">{entry.title}</h3>
          <p className="mt-1 line-clamp-2 font-sans text-sm text-ink-soft">{entry.excerpt}</p>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-ink-faint">
            <span className="flex items-center gap-1">
              <Calendar aria-hidden className="h-3 w-3" />
              {entry.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock aria-hidden className="h-3 w-3" />
              {entry.readMinutes} min read
            </span>
            {entry.tags.map((tag) => (
              <span key={tag} className="rounded bg-surface-sunken px-1.5 py-0.5">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <ChevronRight aria-hidden className="h-5 w-5 shrink-0 self-center text-poke-red" />
      </Panel>
    </Link>
  )
}
