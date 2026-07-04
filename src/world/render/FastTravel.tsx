'use client'

import { useEffect, useState } from 'react'
import { Map as MapIcon } from 'lucide-react'

export interface FastTravelDestination {
  label: string
  mapId: string
}

/**
 * PokéNav fast travel. Opens with M or the on-screen button; selecting a destination
 * calls the engine's travelTo. Keyboard-navigable. Purely a control surface - it sends
 * a command to the engine and holds only its own open/highlight UI state.
 */
export function FastTravel({
  destinations,
  onTravel,
}: {
  destinations: FastTravelDestination[]
  onTravel: (mapId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault()
        setOpen((o) => !o)
        return
      }
      if (!open) return
      if (e.key === 'Escape') setOpen(false)
      else if (e.key === 'ArrowDown') setActive((i) => (i + 1) % destinations.length)
      else if (e.key === 'ArrowUp')
        setActive((i) => (i - 1 + destinations.length) % destinations.length)
      else if (e.key === 'Enter') {
        onTravel(destinations[active].mapId)
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, active, destinations, onTravel])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Fast travel (PokéNav)"
        className="absolute right-4 top-4 z-30 flex items-center gap-1.5 rounded-md border border-ink/40 bg-surface-raised/90 px-3 py-1.5 font-mono text-xs text-ink hover:border-poke-red"
      >
        <MapIcon className="h-4 w-4" aria-hidden />
        PokéNav
      </button>

      {open ? (
        <div
          data-input-capture="true"
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-xs rounded-card border-2 border-ink bg-surface-raised p-4">
            <p className="mb-3 font-display text-xs uppercase tracking-wide text-poke-red">
              PokéNav - Fast Travel
            </p>
            <ul role="menu" className="flex flex-col gap-1">
              {destinations.map((d, i) => (
                <li key={d.mapId} role="none">
                  <button
                    type="button"
                    role="menuitem"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => {
                      onTravel(d.mapId)
                      setOpen(false)
                    }}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left font-mono text-sm ${
                      i === active ? 'bg-poke-red/10 text-poke-red' : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    <span
                      aria-hidden
                      className={i === active ? 'text-poke-red' : 'text-transparent'}
                    >
                      ▸
                    </span>
                    {d.label}
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-center font-mono text-[0.65rem] text-ink-faint">
              Esc to close · M to toggle
            </p>
          </div>
        </div>
      ) : null}
    </>
  )
}
