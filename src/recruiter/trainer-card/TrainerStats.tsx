import { Clock, BookOpen, Trophy, type LucideIcon } from 'lucide-react'
import type { TrainerStat } from '@/content/schema'
import { StatCard } from '@/recruiter/ui'

/** Icon per known stat key; falls back to a clock for unknown keys. */
const STAT_ICONS: Record<string, LucideIcon> = {
  experienceYears: Clock,
  projectCount: BookOpen,
  badgeCount: Trophy,
}

export function TrainerStats({ stats }: { stats: TrainerStat[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <li key={stat.key}>
          <StatCard icon={STAT_ICONS[stat.key] ?? Clock} value={stat.value} label={stat.label} />
        </li>
      ))}
    </ul>
  )
}
