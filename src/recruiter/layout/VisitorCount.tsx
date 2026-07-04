'use client'

import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'

const VISIT_FLAG = 'tc.visitCounted'

/**
 * "Trainers visited" analytics - a durable, DB-backed visit counter shown under the
 * Spotify widget. On a browser's first-ever load it POSTs once (flagged in localStorage
 * so refreshes don't inflate it); afterwards it just reads the total. Hidden until the
 * counter is available (returns 0 → still shown as 0 once DB is configured).
 */
export function VisitorCount() {
  const [visits, setVisits] = useState<number | null>(null)

  useEffect(() => {
    let alive = true
    const run = async () => {
      try {
        const counted = localStorage.getItem(VISIT_FLAG) === '1'
        // If we'd POST but get rate-limited, fall back to a GET so we still show a total.
        let res = await fetch('/api/visits', {
          method: counted ? 'GET' : 'POST',
          cache: 'no-store',
        })
        if (!counted) localStorage.setItem(VISIT_FLAG, '1')
        if (!res.ok) res = await fetch('/api/visits', { cache: 'no-store' })
        const data = (await res.json().catch(() => ({}))) as { visits?: number }
        if (alive && typeof data.visits === 'number') setVisits(data.visits)
      } catch {
        /* leave hidden */
      }
    }
    void run()
    return () => {
      alive = false
    }
  }, [])

  if (visits === null || visits <= 0) return null

  return (
    <div className="flex items-center gap-2 rounded-card border border-edge bg-surface-raised p-2.5">
      <span className="grid h-8 w-8 flex-none place-items-center rounded bg-surface-sunken">
        <Users aria-hidden className="h-4 w-4 text-poke-red" />
      </span>
      <div className="min-w-0">
        <p className="font-mono text-[0.6rem] uppercase tracking-wide text-ink-faint">
          Trainers Visited
        </p>
        <p className="font-display text-base font-bold text-ink">
          {visits.toLocaleString()}
        </p>
      </div>
    </div>
  )
}
