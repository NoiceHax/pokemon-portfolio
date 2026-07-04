import { NextResponse } from 'next/server'
import { rateLimit, clientIp, tooManyRequests } from '@/lib/rateLimit'

/**
 * Spotify "Now Playing" endpoint.
 *
 * Uses a server-held refresh token (never exposed to the client) to mint a short-lived
 * access token, then reads the currently-playing track, falling back to the most recent
 * track when nothing is playing. Returns a small normalized shape the UI polls.
 *
 * Requires env: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN.
 * When unset, returns { configured:false } and the UI hides itself.
 */

export const dynamic = 'force-dynamic'
export const revalidate = 0

const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing'
const RECENT_URL = 'https://api.spotify.com/v1/me/player/recently-played?limit=1'

interface Track {
  isPlaying: boolean
  title: string
  artist: string
  album: string
  albumArt: string | null
  url: string | null
}

async function getAccessToken(): Promise<string | null> {
  const id = process.env.SPOTIFY_CLIENT_ID
  const secret = process.env.SPOTIFY_CLIENT_SECRET
  const refresh = process.env.SPOTIFY_REFRESH_TOKEN
  if (!id || !secret || !refresh) return null

  const basic = Buffer.from(`${id}:${secret}`).toString('base64')
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh }),
    cache: 'no-store',
  })
  if (!res.ok) return null
  const data = (await res.json()) as { access_token?: string }
  return data.access_token ?? null
}

interface SpotifyArtist { name: string }
interface SpotifyItem {
  name?: string
  artists?: SpotifyArtist[]
  album?: { name?: string; images?: { url: string }[] }
  external_urls?: { spotify?: string }
}

function normalize(item: SpotifyItem, isPlaying: boolean): Track {
  return {
    isPlaying,
    title: item?.name ?? 'Unknown',
    artist: (item?.artists ?? []).map((a) => a.name).join(', ') || 'Unknown',
    album: item?.album?.name ?? '',
    albumArt: item?.album?.images?.[0]?.url ?? null,
    url: item?.external_urls?.spotify ?? null,
  }
}

export async function GET(request: Request) {
  // 60 polls / min per IP (UI polls every 30s; generous headroom).
  const rl = await rateLimit(`spotify:${clientIp(request)}`, { limit: 60, windowMs: 60_000 })
  if (!rl.ok) return tooManyRequests(rl.retryAfterSeconds)

  const token = await getAccessToken()
  if (!token) {
    return NextResponse.json({ configured: false, isPlaying: false })
  }

  try {
    const now = await fetch(NOW_PLAYING_URL, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (now.status === 200) {
      const data = (await now.json()) as { item?: SpotifyItem; is_playing?: boolean }
      if (data?.item) {
        return NextResponse.json({ configured: true, ...normalize(data.item, Boolean(data.is_playing)) })
      }
    }
    // Nothing playing → last played.
    const recent = await fetch(RECENT_URL, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (recent.ok) {
      const data = (await recent.json()) as { items?: { track: SpotifyItem }[] }
      const track = data?.items?.[0]?.track
      if (track) return NextResponse.json({ configured: true, ...normalize(track, false) })
    }
    return NextResponse.json({ configured: true, isPlaying: false })
  } catch {
    return NextResponse.json({ configured: true, isPlaying: false })
  }
}
