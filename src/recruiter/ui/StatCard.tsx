import type { LucideIcon } from 'lucide-react'
import { Panel } from './Panel'

/**
 * A single headline statistic (Trainer Card "3 YRS EXPERIENCE" style): icon, large
 * value, small caption.
 */
interface StatCardProps {
  icon: LucideIcon
  value: string
  label: string
}

export function StatCard({ icon: Icon, value, label }: StatCardProps) {
  return (
    <Panel brackets={false} className="flex items-center gap-3 p-4">
      <Icon aria-hidden className="h-6 w-6 shrink-0 text-poke-red" strokeWidth={2} />
      <div className="min-w-0">
        <div className="font-display text-2xl font-bold leading-none text-ink">{value}</div>
        <div className="mt-1 font-mono text-xs uppercase leading-tight tracking-wide text-ink-faint">
          {label}
        </div>
      </div>
    </Panel>
  )
}
