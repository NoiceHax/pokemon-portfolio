import type { Metadata } from 'next'
import { RickrollRedirect } from './rickroll-redirect'

/**
 * Disguised rickroll. The URL looks like a legit portfolio extra:
 *   https://noicehax.dev/trade/shiny-mewtwo-151
 *
 * How the trick survives embeds:
 * - Crawlers (Discord, Slack, X, iMessage, WhatsApp) only read this server HTML
 *   and the OG/Twitter tags below - they never execute JS, so the preview stays
 *   innocent with no hint of YouTube.
 * - Real visitors load the same innocent HTML for ~1.4s, then RickrollRedirect
 *   (client JS) sends them to Never Gonna Give You Up.
 * - No server-side redirect() and no <meta http-equiv="refresh">, both of which
 *   crawlers WOULD follow and which would leak the joke into the embed.
 */
export const metadata: Metadata = {
  title: { absolute: 'Shiny Mewtwo #150 — 9,412 Resets Later, Finally Mine' },
  description:
    'After 9,412 soft resets I finally hatched a legit shiny Mewtwo — Timid, 6IV, full proof + trade details inside. First come, first served.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/trade/shiny-mewtwo-151' },
  openGraph: {
    type: 'article',
    title: 'Shiny Mewtwo #150 — 9,412 Resets Later, Finally Mine',
    description:
      'Timid • 6IV • full proof video + trade details inside. Click to see the stats before someone else claims it.',
    siteName: 'Trainer Chandan',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Shiny Mewtwo trade - Trainer Chandan',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shiny Mewtwo #150 — 9,412 Resets Later, Finally Mine',
    description:
      'Timid • 6IV • full proof video + trade details inside. Click to see the stats before someone else claims it.',
    images: ['/og.png'],
  },
}

const RICKROLL_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

/**
 * Server-rendered decoy. Bots and link-preview scrapers see exactly this:
 * a wholesome Pokemon trade post. Humans see it for ~1 second before the
 * client redirect fires. Keep every string here innocent - nothing may mention
 * Rick Astley, YouTube, or rickroll, or the joke leaks into chat previews.
 */
export default function ShinyMewtwoTradePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">
        Pokédex #150 • Kanto • Full-odds hunt
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold">
        Shiny Mewtwo — 9,412 resets later, finally mine
      </h1>
      <dl className="mt-6 grid grid-cols-2 gap-3 font-mono text-sm">
        <div className="rounded border border-edge p-3">
          <dt className="text-ink-soft">Nature</dt>
          <dd className="font-bold">Timid</dd>
        </div>
        <div className="rounded border border-edge p-3">
          <dt className="text-ink-soft">IVs</dt>
          <dd className="font-bold">31 / 31 / 31 / 31 / 31 / 31</dd>
        </div>
        <div className="rounded border border-edge p-3">
          <dt className="text-ink-soft">Ability</dt>
          <dd className="font-bold">Pressure → Unnerve</dd>
        </div>
        <div className="rounded border border-edge p-3">
          <dt className="text-ink-soft">Proof</dt>
          <dd className="font-bold">Full video inside ⏳</dd>
        </div>
      </dl>
      <p className="mt-6 leading-relaxed">
        Three months of resets, one green-tailed legend. Full encounter proof, ball
        showcase and trade details are loading below — taking offers from today only,
        first come first served.
      </p>

      <RickrollRedirect />

      {/* Fallback for no-JS clients: looks like a video link, walks like a video link. */}
      <noscript>
        <p className="mt-6 text-center">
          <a href={RICKROLL_URL} className="underline">
            Watch the proof video
          </a>
        </p>
      </noscript>
    </main>
  )
}
