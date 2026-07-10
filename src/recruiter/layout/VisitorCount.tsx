'use client'

import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import { readStorage, writeStorage, STORAGE_KEYS } from '@/lib/storage/localStorage'

const VISIT_FLAG = 'tc.visitCounted'

function CountSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading trainers visited"
      className="flex items-center gap-2 rounded-card border border-edge bg-surface-raised p-2.5"
    >
      <span className="h-8 w-8 flex-none animate-pulse rounded bg-surface-sunken" />
      <div className="min-w-0 flex-1 space-y-2">
        <span className="block h-2.5 w-24 animate-pulse rounded bg-surface-sunken" />
        <span className="block h-4 w-12 animate-pulse rounded bg-surface-sunken" />
      </div>
    </div>
  )
}

/**
 * "Trainers visited" counter. Shows a skeleton on first load, a cached count
 * instantly on return visits, then refreshes from the API in the background.
 */
export function VisitorCount() {
  const [visits, setVisits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true

    const cached = readStorage<number | null>(STORAGE_KEYS.visitCount, null)
    if (typeof cached === 'number' && cached > 0) {
      setVisits(cached)
      setLoading(false)
    }

    const run = async () => {
      try {
        const counted = localStorage.getItem(VISIT_FLAG) === '1'
        let res = await fetch('/api/visits', {
          method: counted ? 'GET' : 'POST',
          cache: 'no-store',
        })
        if (!counted) localStorage.setItem(VISIT_FLAG, '1')
        if (!res.ok) res = await fetch('/api/visits', { cache: 'no-store' })
        const data = (await res.json().catch(() => ({}))) as { visits?: number }
        if (!alive || typeof data.visits !== 'number') return
        setVisits(data.visits)
        writeStorage(STORAGE_KEYS.visitCount, data.visits)
      } catch {
        /* keep cache / skeleton → empty */
      } finally {
        if (alive) setLoading(false)
      }
    }
    void run()
    return () => {
      alive = false
    }
  }, [])

  if (loading && (visits === null || visits <= 0)) return <CountSkeleton />
  if (visits === null || visits <= 0) return null

  return (
    <div className="flex items-center gap-2 rounded-card border border-edge bg-surface-raised p-2.5">
      <span className="grid h-8 w-8 flex-none place-items-center rounded bg-surface-sunken">
        <Users aria-hidden className="h-4 w-4 text-poke-red" />
      </span>
      <div className="min-w-0">
        <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">
          Trainers Visited
        </p>
        <p className="font-display text-base font-bold text-ink">
          {visits.toLocaleString()}
        </p>
      </div>
    </div>
  )
}
