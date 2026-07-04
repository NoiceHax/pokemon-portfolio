'use client'

import { useEffect, useState } from 'react'
import { Music } from 'lucide-react'

interface Track {
  configured: boolean
  isPlaying: boolean
  title?: string
  artist?: string
  albumArt?: string | null
  url?: string | null
}

/**
 * "Now Playing" - Chandan's latest Spotify track, shown below the badge rail. Polls the
 * server route (which holds the Spotify creds) every 30s. Renders nothing until the
 * feature is configured (no creds → no clutter). A green pulse marks a live track;
 * otherwise it shows the most recently played song.
 */
export function NowPlaying() {
  const [track, setTrack] = useState<Track | null>(null)

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const res = await fetch('/api/spotify/now-playing', { cache: 'no-store' })
        const data = (await res.json()) as Track
        if (alive) setTrack(data)
      } catch {
        /* leave last state */
      }
    }
    load()
    const id = setInterval(load, 30_000)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [])

  // Hide entirely until configured and we have a track to show.
  if (!track || !track.configured || !track.title) return null

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
        <p className="flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-wide text-ink-faint">
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
