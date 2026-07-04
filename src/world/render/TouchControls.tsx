'use client'

import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Circle } from 'lucide-react'
import type { Direction } from '@/world/engine/types'

/**
 * On-screen D-pad + action button for touch devices. Calls the same engine methods the
 * keyboard does, so there is one input path into the engine. Hidden on desktop.
 */
export function TouchControls({
  onMove,
  onAction,
}: {
  onMove: (d: Direction) => void
  onAction: () => void
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 md:hidden">
      <div className="pointer-events-auto absolute bottom-6 left-6 grid grid-cols-3 grid-rows-3 gap-1">
        <span />
        <Pad label="Move up" onPress={() => onMove('up')}>
          <ChevronUp className="h-6 w-6" />
        </Pad>
        <span />
        <Pad label="Move left" onPress={() => onMove('left')}>
          <ChevronLeft className="h-6 w-6" />
        </Pad>
        <span />
        <Pad label="Move right" onPress={() => onMove('right')}>
          <ChevronRight className="h-6 w-6" />
        </Pad>
        <span />
        <Pad label="Move down" onPress={() => onMove('down')}>
          <ChevronDown className="h-6 w-6" />
        </Pad>
        <span />
      </div>
      <button
        type="button"
        aria-label="Interact"
        onClick={onAction}
        className="pointer-events-auto absolute bottom-8 right-6 grid h-14 w-14 place-items-center rounded-full border-2 border-ink bg-poke-red text-white shadow-lg active:scale-95"
      >
        <Circle className="h-6 w-6 fill-white" />
      </button>
    </div>
  )
}

function Pad({
  label,
  onPress,
  children,
}: {
  label: string
  onPress: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onPress}
      className="grid h-11 w-11 place-items-center rounded-md border border-ink/60 bg-surface-raised/90 text-ink shadow active:scale-95"
    >
      {children}
    </button>
  )
}
