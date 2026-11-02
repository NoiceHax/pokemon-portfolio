import Link from 'next/link'
import type { Metadata } from 'next'
import { GuessGame } from '@/components/whos-that-pokemon/GuessGame'
import { MuteButton } from '@/components/ui/MuteButton'

export const metadata: Metadata = {
  title: "Who's That Pokémon?",
  description:
    'Choose your generations and difficulty, identify Pokémon silhouettes, and build your streak.',
  alternates: { canonical: '/minigame/guess' },
}

export default function GuessPage() {
  return (
    <main className="min-h-screen bg-surface px-4 py-6 text-ink sm:px-8">
      <nav
        aria-label="Game navigation"
        className="mx-auto mb-6 flex w-full max-w-3xl items-center justify-between gap-4"
      >
        <Link href="/home" className="text-sm text-poke-red hover:underline">
          Back to portfolio
        </Link>
        <MuteButton />
      </nav>
      <h1 className="mb-6 text-center font-display text-2xl sm:text-3xl">Who&apos;s That Pokémon?</h1>
      <GuessGame />
    </main>
  )
}
