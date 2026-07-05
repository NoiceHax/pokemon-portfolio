import Link from 'next/link'

/**
 * Recruiter footer - matches the mockups' "Research Division" strip with secondary
 * links. "Hall of Fame" links to the semi-hidden page (a reward for the curious).
 */
export function Footer() {
  return (
    <footer className="mt-12 border-t border-edge">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 font-mono text-xs text-ink-faint sm:flex-row">
        <p>© 2024 NOICEHAX | Research Division</p>
        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <Link href="/recruiter" className="transition-colors hover:text-poke-red">
            Global Terminal
          </Link>
          <span aria-hidden>|</span>
          <Link href="/privacy" className="transition-colors hover:text-poke-red">
            Privacy Policy
          </Link>
          <span aria-hidden>|</span>
          <Link href="/hall-of-fame" className="transition-colors hover:text-poke-red">
            Hall of Fame
          </Link>
        </p>
      </div>
    </footer>
  )
}
