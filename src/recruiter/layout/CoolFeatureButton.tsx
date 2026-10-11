'use client'

import { useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Panel } from '@/recruiter/ui'
import { sprites } from '@/lib/assets/registry'
import {
  openWhosThatPokemon,
  readBest,
  WTP_BEST_EVENT,
  type WtpBest,
} from '@/components/whos-that-pokemon/events'

/**
 * "A Cool Feature" - the sidebar doorway to Who's That Pokémon? (the game itself is mounted
 * once in the root layout and opened by a window event). Shows a mystery silhouette on the
 * anime's blue burst and this browser's best score, once there is one.
 */
export function CoolFeatureButton() {
  const [best, setBest] = useState<WtpBest | null>(null)

  useEffect(() => {
    const sync = () => setBest(readBest())
    sync()
    window.addEventListener(WTP_BEST_EVENT, sync)
    return () => window.removeEventListener(WTP_BEST_EVENT, sync)
  }, [])

  return (
    <button
      type="button"
      onClick={openWhosThatPokemon}
      className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-poke-red"
      aria-label="Open a cool feature: play Who's That Pokémon?"
    >
      <Panel className="flex items-center gap-3 p-3 transition-colors hover:border-poke-red">
        <span
          aria-hidden
          className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-card border border-ink"
          style={{
            background:
              'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%), repeating-conic-gradient(#1e40af 0deg 12deg, #3b82f6 12deg 24deg)',
          }}
        >
          <img
            src={sprites.wtpTeaser}
            alt=""
            className="h-11 w-11 object-contain"
            draggable={false}
          />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="font-mono text-xs text-ink-faint">A Cool Feature</span>
          <span className="font-mono text-sm text-ink">Who&apos;s That Pokémon?</span>
          {best && best.score > 0 ? (
            <span className="font-mono text-xs text-ink-faint">
              Your best: {best.score} pts · streak {best.streak}
            </span>
          ) : null}
        </span>
        <ChevronRight aria-hidden className="h-4 w-4 shrink-0 text-poke-red" />
      </Panel>
    </button>
  )
}
