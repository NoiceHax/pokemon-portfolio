import Image from 'next/image'
import type { Project } from '@/content/schema'

/**
 * Project cover art. A project's real screenshot when it has one; until then (a cover
 * pointing at the shared /Miscellaneous/ stand-in, or `isPlaceholder`), a big Poké Ball
 * reading "Image incoming" on a gradient tinted by the project's primary type.
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
  sizes,
}: {
  project: Project
  className?: string
  /**
   * How wide the cover box is at each breakpoint. Required rather than defaulted: a grid
   * card and a full-width entry size their boxes completely differently, and one shared
   * string under-declares for the entry - the browser then picks a srcset candidate
   * narrower than the box and upscales a screenshot that had the detail to spare.
   */
  sizes: string
}) {
  const realImage = !project.isPlaceholder && !project.cover.src.includes('/Miscellaneous/')
  if (realImage) {
    // `fill` rather than fixed dimensions: callers set the box height via className
    // (h-36 on a grid card, h-56 on an entry), so the height is already reserved and
    // the intrinsic size of the source screenshot is irrelevant to layout.
    return (
      <div className={`relative w-full overflow-hidden ${className}`}>
        <Image
          src={project.cover.src}
          alt={project.cover.alt}
          fill
          sizes={sizes}
          className="object-cover"
        />
      </div>
    )
  }

  const grad = TYPE_GRADIENT[project.types[0]] ?? TYPE_GRADIENT.normal
  return (
    <div
      className={`group/cover relative flex w-full items-center justify-center overflow-hidden bg-gradient-to-br ${grad} ${className}`}
      role="img"
      aria-label={`${project.title} - screenshot coming soon`}
    >
      <IncomingBall />
    </div>
  )
}

/**
 * A big Poké Ball filling most of the box, with "Image incoming" on its lower half.
 * An SVG so it scales with whatever height the caller gives the cover (a card or a full
 * entry) without breakpoint juggling. Shakes like a catch attempt when the card is hovered.
 */
function IncomingBall() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 200"
      className="group-hover/cover:pokeball-wobble h-[86%] w-auto drop-shadow-md"
    >
      <defs>
        <clipPath id="incoming-ball-clip">
          <circle cx="100" cy="100" r="94" />
        </clipPath>
      </defs>
      <g clipPath="url(#incoming-ball-clip)">
        <rect width="200" height="100" className="fill-poke-red" />
        <rect y="100" width="200" height="100" className="fill-surface-raised" />
        <rect y="92" width="200" height="16" className="fill-ink" />
        {/* Gloss on the red half. */}
        <ellipse
          cx="62"
          cy="44"
          rx="26"
          ry="14"
          className="fill-white"
          opacity="0.35"
          transform="rotate(-24 62 44)"
        />
      </g>
      <circle cx="100" cy="100" r="94" fill="none" className="stroke-ink" strokeWidth="8" />
      <circle cx="100" cy="100" r="24" className="fill-ink" />
      <circle cx="100" cy="100" r="15" className="fill-surface-raised" />
      <circle
        cx="100"
        cy="100"
        r="9"
        fill="none"
        className="stroke-ink"
        strokeOpacity="0.25"
        strokeWidth="2"
      />
      <text
        x="100"
        y="146"
        textAnchor="middle"
        className="fill-ink"
        style={{ fontFamily: 'var(--font-display)', fontSize: 13, letterSpacing: 1 }}
      >
        IMAGE
      </text>
      <text
        x="100"
        y="166"
        textAnchor="middle"
        className="fill-ink"
        style={{ fontFamily: 'var(--font-display)', fontSize: 13, letterSpacing: 1 }}
      >
        INCOMING
      </text>
    </svg>
  )
}
