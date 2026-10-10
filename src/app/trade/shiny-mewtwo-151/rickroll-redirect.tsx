'use client'

import { useEffect } from 'react'

const RICKROLL_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

/**
 * Client-only redirect. This file is the whole trick:
 * - Embed crawlers (Discord/Slack/Twitter/iMessage) don't run JS, so they only
 *   ever see the innocent server HTML + OG tags from page.tsx.
 * - Real browsers run this effect and get sent to the rickroll.
 * No server redirect is used on purpose - a 301/302 would teach the crawlers
 * where the joke goes and ruin the preview.
 */
export function RickrollRedirect() {
  useEffect(() => {
    const t = window.setTimeout(() => {
      window.location.replace(RICKROLL_URL)
    }, 1400)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <p className="mt-6 text-center font-mono text-xs text-ink-soft">
      Loading proof video…
      <br />
      <a href={RICKROLL_URL} className="underline">
        Click here if you are not redirected
      </a>
    </p>
  )
}
