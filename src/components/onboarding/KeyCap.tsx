'use client'

/**
 * A small pixel-styled keyboard cap, e.g. [W] [E] [Enter]. Used across the onboarding
 * control hints. Purely presentational.
 */
export function KeyCap({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex min-w-[2rem] items-center justify-center rounded-[4px] border-b-2 border-edge-strong border-x border-t bg-surface-raised px-1.5 py-0.5 font-display text-xs leading-none text-ink shadow-[0_1px_0_rgba(0,0,0,0.15)]">
      {children}
    </kbd>
  )
}
