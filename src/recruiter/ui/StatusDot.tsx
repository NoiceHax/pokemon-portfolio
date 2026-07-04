import type { ProjectStatus } from '@/content/schema'

const STATUS_STYLE: Record<ProjectStatus, { dot: string; label: string }> = {
  production: { dot: 'bg-green-500', label: 'Production' },
  prototype: { dot: 'bg-blue-500', label: 'Prototype' },
  archived: { dot: 'bg-stone-400', label: 'Archived' },
  concept: { dot: 'bg-amber-500', label: 'Concept' },
}

/** Colored status indicator used on Pokédex cards ("Status: Production"). */
export function StatusDot({ status }: { status: ProjectStatus }) {
  const style = STATUS_STYLE[status]
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-soft">
      <span aria-hidden className={`h-2 w-2 rounded-full ${style.dot}`} />
      Status: {style.label}
    </span>
  )
}
