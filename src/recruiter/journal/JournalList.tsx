'use client'

import { useMemo, useState } from 'react'
import type { BlogFrontmatter, JournalEntryType } from '@/content/schema'
import { JournalCard } from './JournalCard'
import { ENTRY_TYPE_META } from './entryTypes'

type Filter = JournalEntryType | 'all'

/**
 * Journal list with type filter chips (mockup). Filtering is client-side over the
 * already-loaded entries - no refetch. Renders an empty state when a filter matches
 * nothing.
 */
export function JournalList({ entries }: { entries: BlogFrontmatter[] }) {
  const [filter, setFilter] = useState<Filter>('all')

  // Only show chips for types that actually have entries.
  const availableTypes = useMemo(() => {
    const present = new Set(entries.map((e) => e.type))
    return (Object.keys(ENTRY_TYPE_META) as JournalEntryType[]).filter((t) => present.has(t))
  }, [entries])

  const visible = filter === 'all' ? entries : entries.filter((e) => e.type === filter)

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filter journal by type">
        <Chip active={filter === 'all'} onClick={() => setFilter('all')}>
          All Entries
        </Chip>
        {availableTypes.map((type) => (
          <Chip key={type} active={filter === type} onClick={() => setFilter(type)}>
            {ENTRY_TYPE_META[type].label}
          </Chip>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-card border border-dashed border-edge p-8 text-center font-mono text-sm text-ink-faint">
          No entries in this category yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {visible.map((entry) => (
            <li key={entry.slug}>
              <JournalCard entry={entry} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 font-mono text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-poke-red ${
        active
          ? 'border-poke-red bg-poke-red/5 text-poke-red'
          : 'border-edge text-ink-soft hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}
