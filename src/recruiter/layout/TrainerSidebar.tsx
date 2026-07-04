import Link from 'next/link'
import { getProfile } from '@/lib/content'
import { NAV_ITEMS } from './navItems'
import { SidebarBadgeRail } from './SidebarBadgeRail'
import { CoolFeatureButton } from './CoolFeatureButton'
import { NowPlaying } from './NowPlaying'
import { VisitorCount } from './VisitorCount'

/**
 * Right-hand Trainer sidebar (canonical Recruiter layout). Shows the trainer avatar,
 * ID, quick navigation, and a live badge rail - mirroring the mockups. Content-driven
 * via getProfile (no duplicated data); unlock state via BadgeProvider.
 */
export function TrainerSidebar() {
  const profile = getProfile()

  return (
    <aside className="flex flex-col gap-5" aria-label="Trainer summary">
      {/* Identity */}
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-full border-2 border-poke-red bg-surface-sunken">
          <img
            src={(profile.sidebarAvatar ?? profile.avatar).src}
            alt={(profile.sidebarAvatar ?? profile.avatar).alt}
            className="h-full w-full object-contain [image-rendering:pixelated]"
          />
        </span>
        <div>
          <p className="font-display text-base font-bold text-poke-red">{profile.name}</p>
          <p className="font-mono text-xs text-ink-faint">ID: {profile.trainerId}</p>
        </div>
      </div>

      {/* Quick links */}
      <nav aria-label="Quick navigation">
        <ul className="flex flex-col">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-3 border-b border-edge py-2.5 font-mono text-sm text-ink-soft transition-colors hover:text-poke-red focus:outline-none focus-visible:text-poke-red"
              >
                <item.icon aria-hidden className="h-4 w-4" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* "A Cool Feature" - opens the hidden developer terminal (same as pressing `). */}
      <CoolFeatureButton />

      {/* Badge rail (live unlock state) */}
      <SidebarBadgeRail />

      {/* Latest Spotify track (hidden until Spotify creds are configured). */}
      <NowPlaying />

      {/* Durable "trainers visited" counter (below Now Playing). */}
      <VisitorCount />
    </aside>
  )
}
