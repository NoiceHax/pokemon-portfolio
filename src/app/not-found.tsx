import Link from 'next/link'

/**
 * Custom 404 - a nod to the famous "missing" glitch. A recruiter sees a clean,
 * friendly error page; a Pokémon fan sees the joke. Both get a way home.
 */
export default function NotFound() {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-black px-6 text-center">
      <div>
        <p className="font-display text-3xl text-poke-red sm:text-5xl">MISSINGNO.</p>
        <p className="mt-4 font-mono text-sm text-surface/80">
          A wild glitch appeared! This page ran off into the tall grass.
        </p>
        <p className="mt-1 font-mono text-xs text-surface/50">Error 404 - page not found.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-md bg-poke-red px-4 py-2 font-display text-xs text-white hover:bg-poke-red-dark"
          >
            Boot up again
          </Link>
          <Link
            href="/home"
            className="rounded-md border border-surface/40 px-4 py-2 font-display text-xs text-surface/90 hover:border-surface"
          >
            Recruiter Mode
          </Link>
        </div>
      </div>
    </main>
  )
}
