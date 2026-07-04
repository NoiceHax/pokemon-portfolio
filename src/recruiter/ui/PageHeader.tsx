import type { LucideIcon } from 'lucide-react'

/**
 * Page header used at the top of each Recruiter page: an icon, a display-font title,
 * and a mono subtitle with the thin red underline seen in the mockups.
 */
interface PageHeaderProps {
  icon: LucideIcon
  title: string
  subtitle: string
}

export function PageHeader({ icon: Icon, title, subtitle }: PageHeaderProps) {
  return (
    <header className="mb-6">
      <div className="flex items-center gap-3">
        <Icon aria-hidden className="h-7 w-7 text-poke-red" strokeWidth={2.5} />
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-ink">
          {title}
        </h1>
      </div>
      <p className="mt-2 max-w-xl font-mono text-sm text-ink-soft">{subtitle}</p>
      <div className="mt-3 h-0.5 w-24 bg-poke-red" />
    </header>
  )
}
