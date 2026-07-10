'use client'

import { useEffect, useState } from 'react'
import { Music } from 'lucide-react'
import { readStorage, writeStorage, STORAGE_KEYS } from '@/lib/storage/localStorage'

interface Track {
  configured: boolean
  isPlaying: boolean
  title?: string
  artist?: string
  albumArt?: string | null
  url?: string | null
}

/** True when we have a real track to show (configured + titled). */
function isUsableTrack(
  t: Track | null | undefined,
): t is Track & { configured: true; title: string } {
  return Boolean(t && t.configured && t.title)
}

function TrackSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading now playing"
      className="flex items-center gap-3 rounded-card border border-edge bg-surface-raised p-2.5"
    >
      <span className="h-10 w-10 flex-none animate-pulse rounded bg-surface-sunken" />
      <div className="min-w-0 flex-1 space-y-2">
        <span className="block h-2.5 w-20 animate-pulse rounded bg-surface-sunken" />
        <span className="block h-3 w-36 max-w-full animate-pulse rounded bg-surface-sunken" />
        <span className="block h-2.5 w-24 animate-pulse rounded bg-surface-sunken" />
      </div>
    </div>
  )
}

/**
 * "Now Playing" - Chandan's latest Spotify track. Shows a skeleton on first load,
 * a cached track instantly on return visits, then refreshes from the API (and every
 * 5 minutes).
 */
export function NowPlaying() {
  const [track, setTrack] = useState<Track | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true

    const cached = readStorage<Track | null>(STORAGE_KEYS.spotifyTrack, null)
    if (isUsableTrack(cached)) {
      setTrack({ ...cached, isPlaying: false })
      setLoading(false)
    }

    const load = async () => {
      try {
        const res = await fetch('/api/spotify/now-playing', { cache: 'no-store' })
        const data = (await res.json()) as Track
        if (!alive) return
        if (isUsableTrack(data)) {
          setTrack(data)
          writeStorage(STORAGE_KEYS.spotifyTrack, data)
        } else if (data && data.configured === false) {
          setTrack(data)
          writeStorage(STORAGE_KEYS.spotifyTrack, null)
        }
      } catch {
        /* keep cache / skeleton → empty */
      } finally {
        if (alive) setLoading(false)
      }
    }
    void load()
    const id = setInterval(load, 5 * 60_000)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [])

  if (loading && !isUsableTrack(track)) return <TrackSkeleton />
  if (!isUsableTrack(track)) return null

  const body = (
    <div className="flex items-center gap-3 rounded-card border border-edge bg-surface-raised p-2.5">
      {track.albumArt ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={track.albumArt}
          alt=""
          className="h-10 w-10 flex-none rounded object-cover"
        />
      ) : (
        <span className="grid h-10 w-10 flex-none place-items-center rounded bg-surface-sunken">
          <Music aria-hidden className="h-4 w-4 text-ink-soft" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-ink-faint">
          {track.isPlaying ? (
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
          ) : null}
          {track.isPlaying ? 'Now Playing' : 'Last Played'}
        </p>
        <p className="truncate font-mono text-sm text-ink">{track.title}</p>
        <p className="truncate font-mono text-xs text-ink-soft">{track.artist}</p>
      </div>
    </div>
  )

  return track.url ? (
    <a
      href={track.url}
      target="_blank"
      rel="noreferrer noopener"
      className="block transition-colors hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-poke-red"
      aria-label={`${track.isPlaying ? 'Now playing' : 'Last played'}: ${track.title} by ${track.artist}`}
    >
      {body}
    </a>
  ) : (
    body
  )
}
