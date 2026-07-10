import Link from 'next/link'
import { Trophy } from 'lucide-react'
import { getHallOfFame, isDbConfigured } from '@/lib/db'
import { HallOfFameForm } from '@/components/hall-of-fame/HallOfFameForm'

export const metadata = {
  title: 'Hall of Fame',
  description: 'Explorers who found the hidden links.',
}

// Always render fresh so a new sign-in appears immediately.
export const dynamic = 'force-dynamic'

/**
 * Hall of Fame - an FRLG-style leaderboard of everyone who discovered the hidden links.
 * The roll of finders sits up top; a small form on the right lets a new explorer sign the
 * wall. Backed by NeonDB (falls back to an empty roll + a friendly note until DATABASE_URL
 * is configured).
 */
export default async function HallOfFamePage() {
  const finders = await getHallOfFame()

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-indigo-950 to-black px-6 py-16 text-surface">
      <div className="mx-auto max-w-5xl text-center">
        <Trophy className="mx-auto h-12 w-12 text-amber-300" aria-hidden />
        <h1 className="mt-4 font-display text-2xl text-amber-300 sm:text-4xl">HALL OF FAME</h1>
        <p className="mt-3 font-mono text-sm text-surface/70">
          Explorers who found the hidden links.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl gap-8 md:grid-cols-[1fr_18rem]">
        {/* Leaderboard roll */}
        <ol className="flex flex-col gap-3">
          {finders.length === 0 ? (
            <li className="rounded-card border border-surface/20 bg-white/5 px-4 py-6 text-center font-mono text-sm text-surface/60">
              {isDbConfigured
                ? 'No explorers yet - be the first to sign the wall!'
                : 'The leaderboard wakes up once the database is connected.'}
            </li>
          ) : (
            finders.map((f, i) => (
              <li
                key={f.id}
                className="flex items-start gap-4 rounded-card border border-surface/20 bg-white/5 px-4 py-3 text-left"
              >
                <span className="font-display text-sm text-amber-300">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm text-surface">
                    {f.name}
                    {f.handle ? (
                      <span className="ml-2 text-surface/50">{f.handle}</span>
                    ) : null}
                  </p>
                  {f.message ? (
                    <p className="mt-0.5 truncate font-mono text-xs text-surface/60">
                      “{f.message}”
                    </p>
                  ) : null}
                </div>
                {f.linksFound > 0 ? (
                  <span className="font-mono text-xs text-amber-300/80">
                    {f.linksFound} 🔗
                  </span>
                ) : null}
              </li>
            ))
          )}
        </ol>

        {/* Sign-the-wall form */}
        <aside className="rounded-card border border-surface/20 bg-white/5 p-4">
          <HallOfFameForm />
        </aside>
      </div>

      <div className="mx-auto mt-10 max-w-5xl text-center">
        <Link
          href="/home"
          className="inline-block font-mono text-xs text-amber-300 underline hover:text-amber-200"
        >
          ← Back to the portfolio
        </Link>
      </div>
    </main>
  )
}
