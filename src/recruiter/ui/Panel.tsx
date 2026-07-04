/**
 * Framed panel with bracket corners - the recurring container motif from the
 * Recruiter mockups (Trainer Card, Data Bank header, etc.). Reused everywhere so the
 * framing style stays consistent (CLAUDE.md: once a style is chosen, keep using it).
 */
interface PanelProps {
  children: React.ReactNode
  /** Adds the decorative corner brackets. */
  brackets?: boolean
  className?: string
}

export function Panel({ children, brackets = true, className = '' }: PanelProps) {
  return (
    <div className={`relative rounded-card border border-edge bg-surface-raised ${className}`}>
      {brackets ? <Brackets /> : null}
      {children}
    </div>
  )
}

/** Four L-shaped corner brackets, purely decorative. */
function Brackets() {
  const base = 'pointer-events-none absolute h-3 w-3 border-poke-red/70'
  return (
    <span aria-hidden>
      <span className={`${base} left-1.5 top-1.5 border-l-2 border-t-2`} />
      <span className={`${base} right-1.5 top-1.5 border-r-2 border-t-2`} />
      <span className={`${base} bottom-1.5 left-1.5 border-b-2 border-l-2`} />
      <span className={`${base} bottom-1.5 right-1.5 border-b-2 border-r-2`} />
    </span>
  )
}
