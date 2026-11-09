import Link from 'next/link'
import Image from 'next/image'
import { Clock, ArrowUpRight } from 'lucide-react'
import type { BlogFrontmatter } from '@/content/schema'
import { Panel } from '@/recruiter/ui'
import { ENTRY_TYPE_META } from './entryTypes'

/**
 * A Logs grid tile: optional cover, type + number, title, short excerpt, and a footer
 * with the date and read time. The whole tile links to the full entry and stretches to
 * the row height so tiles in a grid row line up.
 */
export function JournalCard({ entry }: { entry: BlogFrontmatter }) {
  const meta = ENTRY_TYPE_META[entry.type]
  return (
    <Link
      href={`/home/logs/${entry.slug}`}
      className="group block h-full rounded-card focus:outline-none focus-visible:ring-2 focus-visible:ring-poke-red"
    >
      <Panel
        brackets={false}
        className="flex h-full flex-col overflow-hidden transition-colors group-hover:border-poke-red"
      >
        {entry.cover ? (
          <div className="relative aspect-[16/9] w-full border-b border-edge bg-surface-sunken">
            <Image
              src={entry.cover.src}
              alt={entry.cover.alt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`rounded border px-1.5 py-0.5 font-mono text-xs uppercase ${meta.classes}`}
            >
              {meta.label}
            </span>
            <span className="font-mono text-xs text-ink-faint">
              #{String(entry.entryNumber).padStart(2, '0')}
            </span>
          </div>

          <h3 className="mt-3 font-display text-lg font-bold leading-snug text-ink group-hover:text-poke-red">
            {entry.title}
          </h3>
          <p className="mt-2 line-clamp-3 flex-1 font-sans text-base leading-relaxed text-ink-soft">
            {entry.excerpt}
          </p>

          <div className="mt-4 flex items-center justify-between border-t border-edge pt-3 font-mono text-xs text-ink-faint">
            <span className="flex items-center gap-1">
              <Clock aria-hidden className="h-3 w-3" />
              {entry.readMinutes} min read · {entry.date}
            </span>
            <ArrowUpRight
              aria-hidden
              className="h-4 w-4 text-poke-red-dark transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </div>
        </div>
      </Panel>
    </Link>
  )
}
