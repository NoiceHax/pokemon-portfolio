'use client'

import { useEffect, useRef, useState } from 'react'
import type { DialogueChoice } from '@/engine/dialogue/types'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useSettings } from '@/providers/SettingsProvider'

interface DialogueChoicesProps {
  choices: DialogueChoice[]
  onSelect: (choice: DialogueChoice) => void
  /** Fired when the highlighted choice changes (for a subtle cursor sound). */
  onHighlightChange?: () => void
}

/** How long the confirm flash plays before the selection commits. */
const CONFIRM_MS = 220

/**
 * Branching choice list. Keyboard-first, like a Pokémon menu: Up/Down move a cursor,
 * Enter selects. Mouse hover/click and touch tap work too. Each choice is a real
 * <button> for screen-reader and focus support, sized to a 44px touch target.
 *
 * On selection the chosen row briefly flashes (a small confirming animation) before
 * committing - echoing the games' selection feedback. Under reduced motion the flash
 * is skipped and selection commits immediately.
 */
export function DialogueChoices({ choices, onSelect, onHighlightChange }: DialogueChoicesProps) {
  const [active, setActive] = useState(0)
  const [confirming, setConfirming] = useState<number | null>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const { reducedMotion } = useSettings()
  const instant = prefersReducedMotion || reducedMotion
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const commit = (index: number) => {
    if (confirming !== null) return // ignore repeat input during confirm
    if (instant) {
      onSelect(choices[index])
      return
    }
    setConfirming(index)
    timerRef.current = setTimeout(() => onSelect(choices[index]), CONFIRM_MS)
  }

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActive((i) => (i + 1) % choices.length)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActive((i) => (i - 1 + choices.length) % choices.length)
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        commit(active)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [choices, active])

  useEffect(() => {
    onHighlightChange?.()
  }, [active, onHighlightChange])

  return (
    <ul className="mt-3 flex flex-col gap-1.5" role="menu" aria-label="Dialogue choices">
      {choices.map((choice, index) => {
        const isActive = index === active
        const isConfirming = index === confirming
        return (
          <li key={choice.id} role="none">
            <button
              type="button"
              role="menuitem"
              onMouseEnter={() => setActive(index)}
              onClick={() => commit(index)}
              className={`flex min-h-[44px] w-full items-center gap-2 rounded-md border px-3 py-2 text-left font-mono text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-poke-red ${
                isConfirming
                  ? 'border-poke-red bg-poke-red/15 text-ink'
                  : isActive
                    ? 'border-poke-red bg-poke-red/5 text-ink'
                    : 'border-transparent text-ink-soft hover:text-ink'
              }`}
            >
              <span
                aria-hidden
                className={isActive || isConfirming ? 'text-poke-red' : 'text-transparent'}
              >
                ▸
              </span>
              {choice.label}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
