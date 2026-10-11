'use client'

import { useEffect, useState } from 'react'
import { openWhosThatPokemon } from './events'

/**
 * Floating Poké Ball "?" in the bottom-right corner that opens Who's That Pokémon?.
 * With `desktopOnly` it only appears on wide screens with a fine pointer (the Adventure
 * world puts its touch A-button in this corner).
 */
export function WtpLauncher({ desktopOnly = false }: { desktopOnly?: boolean }) {
  const [allowed, setAllowed] = useState(!desktopOnly)

  useEffect(() => {
    if (!desktopOnly) {
      setAllowed(true)
      return
    }
    const query = window.matchMedia('(min-width: 768px) and (pointer: fine)')
    setAllowed(query.matches)
    const onChange = (e: MediaQueryListEvent) => setAllowed(e.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [desktopOnly])

  if (!allowed) return null

  return (
    <button
      type="button"
      data-wtp-launcher="true"
      onClick={openWhosThatPokemon}
      aria-label="Play Who's That Pokémon?"
      title="Who's That Pokémon?"
      className="group fixed bottom-5 right-4 z-50 flex min-h-11 items-center gap-2 rounded-full border-2 border-poke-red bg-surface/95 py-1.5 pl-1.5 pr-3 font-mono text-sm font-semibold text-poke-red shadow-lg backdrop-blur transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-poke-red sm:right-5"
    >
      <span
        aria-hidden
        className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-full border-2 border-ink"
      >
        <span className="absolute inset-x-0 top-0 h-1/2 bg-poke-red" />
        <span className="absolute inset-x-0 bottom-0 h-1/2 bg-white" />
        <span className="relative grid h-4 w-4 place-items-center rounded-full border-2 border-ink bg-white font-display text-[0.5rem] leading-none text-ink">
          ?
        </span>
      </span>
      <span className="hidden sm:inline">Who&apos;s that Pokémon?</span>
    </button>
  )
}
