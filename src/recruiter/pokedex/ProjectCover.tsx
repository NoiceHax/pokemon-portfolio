import type { Project } from '@/content/schema'

/**
 * Project cover art. Until real project imagery exists, we render a clean, on-brand
 * placeholder - a soft gradient tinted by the project's primary type with the dex
 * number and a Poké Ball motif - instead of a raw sprite sheet. When a project provides
 * a real (non-placeholder) cover image, that is shown instead.
 */

const TYPE_GRADIENT: Record<string, string> = {
  psychic: 'from-pink-200 to-pink-100',
  water: 'from-blue-200 to-sky-100',
  grass: 'from-green-200 to-emerald-100',
  electric: 'from-amber-200 to-yellow-100',
  fire: 'from-orange-200 to-amber-100',
  normal: 'from-stone-200 to-stone-100',
}

export function ProjectCover({
  project,
  className = '',
}: {
  project: Project
  className?: string
}) {
  const realImage = !project.isPlaceholder && !project.cover.src.includes('/Miscellaneous/')
  if (realImage) {
    return (
      <img
        src={project.cover.src}
        alt={project.cover.alt}
        className={`w-full object-cover ${className}`}
      />
    )
  }

  const grad = TYPE_GRADIENT[project.types[0]] ?? TYPE_GRADIENT.normal
  const dex = `No. ${String(project.dexNumber).padStart(3, '0')}`
  return (
    <div
      className={`relative flex w-full items-center justify-center bg-gradient-to-br ${grad} ${className}`}
      role="img"
      aria-label={`${project.title} cover`}
    >
      {/* Faint Poké Ball motif */}
      <span
        aria-hidden
        className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border-2 border-ink/25"
      >
        <span className="h-2 w-2 rounded-full bg-ink/25" />
      </span>
      <span className="font-display text-2xl text-ink/50">{dex}</span>
    </div>
  )
}
