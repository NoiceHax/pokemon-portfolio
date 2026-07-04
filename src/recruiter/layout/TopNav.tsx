'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { NAV_ITEMS } from './navItems'

/**
 * Persistent top navigation for Recruiter Mode. Active link is underlined in the
 * accent color. On mobile the links collapse behind a menu button so navigation is
 * never lost (CLAUDE.md: mobile should never lose functionality).
 */
export function TopNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/recruiter' ? pathname === href : pathname.startsWith(href)

  return (
    <header className="sticky top-0 z-30 border-b border-edge bg-surface/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/recruiter"
          className="flex items-center gap-2 font-display text-lg font-bold uppercase tracking-wide text-poke-red"
        >
          <span
            aria-hidden
            className="grid h-6 w-6 place-items-center rounded-full border-2 border-poke-red"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-poke-red" />
          </span>
          NOICEHAX
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={`border-b-2 pb-0.5 font-mono text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-poke-red ${
                  isActive(item.href)
                    ? 'border-poke-red text-poke-red'
                    : 'border-transparent text-ink-soft hover:text-ink'
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="rounded-md border border-edge p-1.5 text-ink-soft md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open ? (
        <ul className="flex flex-col gap-1 border-t border-edge px-4 py-2 md:hidden">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={`block rounded-md px-2 py-2 font-mono text-sm ${
                  isActive(item.href)
                    ? 'bg-poke-red/5 text-poke-red'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </header>
  )
}
