'use client'

import { KeyCap } from './KeyCap'

/**
 * A slim, always-visible command reference pinned to the bottom-center of Adventure Mode.
 * Desktop: keyboard legend. Mobile: a short pointer to the on-screen touch buttons
 * (the keyboard bar is redundant when the D-pad is visible).
 */
export function ControlsBar() {
  return (
    <div
      role="note"
      aria-label="Controls"
      className="pointer-events-none fixed bottom-3 left-1/2 z-[60] -translate-x-1/2"
    >
      {/* Desktop — keyboard / mouse legend */}
      <div className="hidden max-w-[96vw] flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-black/10 bg-surface-raised/80 px-3.5 py-1.5 font-mono text-xs text-ink-soft shadow-sm backdrop-blur-sm sm:gap-4 md:flex">
        <Item keys={['↑↓←→', 'WASD']} label="Move" />
        <Divider />
        <Item keys={['Shift']} label="Run" />
        <Divider />
        <Item keys={['Enter', 'Space']} label="Interact" />
      </div>

      {/* Mobile — touch controls are on screen; no keyboard keys needed */}
      <p className="rounded-full border border-black/10 bg-surface-raised/80 px-3.5 py-1.5 font-mono text-xs text-ink-soft shadow-sm backdrop-blur-sm md:hidden">
        Hold the D-pad to move · red button to interact
      </p>
    </div>
  )
}

function Item({ keys, label }: { keys: string[]; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="flex items-center gap-1">
        {keys.map((k) => (
          <KeyCap key={k}>{k}</KeyCap>
        ))}
      </span>
      <span>{label}</span>
    </span>
  )
}

function Divider() {
  return <span className="text-ink-faint/50" aria-hidden>·</span>
}
