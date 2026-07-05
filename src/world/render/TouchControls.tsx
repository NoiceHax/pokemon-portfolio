'use client'

import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Circle } from 'lucide-react'
import type { Direction } from '@/world/engine/types'

/**
 * On-screen D-pad + action button for touch devices. Hold a direction to walk
 * continuously (same as holding a keyboard key); release to stop. Hidden on desktop.
 */
export function TouchControls({
  onMoveStart,
  onMoveEnd,
  onAction,
}: {
  onMoveStart: (d: Direction) => void
  onMoveEnd: () => void
  onAction: () => void
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 md:hidden">
      <div className="pointer-events-auto absolute bottom-6 left-6 grid grid-cols-3 grid-rows-3 gap-1">
        <span />
        <Pad label="Move up" direction="up" onPressStart={onMoveStart} onPressEnd={onMoveEnd}>
          <ChevronUp className="h-6 w-6" />
        </Pad>
        <span />
        <Pad label="Move left" direction="left" onPressStart={onMoveStart} onPressEnd={onMoveEnd}>
          <ChevronLeft className="h-6 w-6" />
        </Pad>
        <span />
        <Pad label="Move right" direction="right" onPressStart={onMoveStart} onPressEnd={onMoveEnd}>
          <ChevronRight className="h-6 w-6" />
        </Pad>
        <span />
        <Pad label="Move down" direction="down" onPressStart={onMoveStart} onPressEnd={onMoveEnd}>
          <ChevronDown className="h-6 w-6" />
        </Pad>
        <span />
      </div>
      <button
        type="button"
        aria-label="Interact"
        onClick={onAction}
        className="pointer-events-auto absolute bottom-8 right-6 grid h-14 w-14 touch-none place-items-center rounded-full border-2 border-ink bg-poke-red text-white shadow-lg active:scale-95 select-none"
      >
        <Circle className="h-6 w-6 fill-white" />
      </button>
    </div>
  )
}

function Pad({
  label,
  direction,
  onPressStart,
  onPressEnd,
  children,
}: {
  label: string
  direction: Direction
  onPressStart: (d: Direction) => void
  onPressEnd: () => void
  children: React.ReactNode
}) {
  const end = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    onPressEnd()
  }

  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(e) => {
        e.preventDefault()
        e.currentTarget.setPointerCapture(e.pointerId)
        onPressStart(direction)
      }}
      onPointerUp={end}
      onPointerCancel={end}
      className="grid h-11 w-11 touch-none place-items-center rounded-md border border-ink/60 bg-surface-raised/90 text-ink shadow active:scale-95 select-none"
    >
      {children}
    </button>
  )
}
