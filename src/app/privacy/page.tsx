import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { DEFAULT_OG_IMAGE, SITE_NAME } from '@/lib/seo'

export const metadata = {
  title: 'Privacy Policy',
  description: 'What this site collects, why, and how it is used.',
  alternates: { canonical: '/privacy' },
  // Outside the Home layout, so the share card is inherited from the root and would
  // otherwise advertise the site description on every page. Spelled out here instead.
  openGraph: {
    type: 'website' as const,
    siteName: SITE_NAME,
    url: '/privacy',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: { card: 'summary_large_image' as const },
}

/**
 * Privacy Policy - a plain-language description of the (minimal) data this portfolio
 * handles. Kept honest and specific to what the site actually does: a contact form that
 * emails submissions, an optional Hall of Fame sign-in, and an anonymous visit counter.
 * No third-party ad/analytics trackers, no selling of data.
 */
export default function PrivacyPage() {
  return (
    <main className="min-h-[100dvh] bg-surface px-6 py-16 text-ink">
      <div className="mx-auto max-w-2xl">
        <ShieldCheck className="h-10 w-10 text-poke-red-dark" aria-hidden />
        <h1 className="mt-4 font-display text-2xl text-poke-red-dark sm:text-3xl">Privacy Policy</h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-widest text-ink-faint">
          Last updated: 10 September 2026
        </p>

        <div className="mt-8 space-y-8 font-sans text-base leading-relaxed text-ink">
          <section>
            <p>
              This is a personal portfolio site. It collects as little as possible, uses it only to
              make the features work, and never sells it or shares it with advertisers. There are no
              third-party advertising or analytics trackers.
            </p>
          </section>

          <Section title="What is collected">
            <ul className="ml-5 list-disc space-y-2">
              <li>
                <strong>Contact form.</strong> When you send a message, the name, email address and
                message you type are emailed directly to the site owner so they can reply. That’s
                the only reason it’s collected.
              </li>
              <li>
                <strong>Hall of Fame.</strong> If you choose to sign the wall, the name, optional
                handle and optional message you enter are stored and shown publicly on the Hall of
                Fame page. Signing is entirely optional.
              </li>
              <li>
                <strong>Visit count.</strong> An anonymous, aggregate counter of page visits. It
                does not identify you.
              </li>
              <li>
                <strong>Abuse prevention.</strong> To stop spam and brute-force attempts, the
                contact form, Hall of Fame, visit counter and admin login are rate-limited. Each
                request stores a one-way hash of your IP address (never the address itself)
                together with the route and a request count. These rows are automatically
                deleted once they age out - typically within minutes, and always within 24
                hours.
              </li>
            </ul>
          </Section>

          <Section title="Cookies & local storage">
            <p>
              The site stores a few preferences in your browser’s local/session storage - such as
              whether you’ve seen the intro, your sound setting, and your chosen experience - so the
              site behaves the way you left it. These stay on your device and are not tracking
              cookies.
            </p>
          </Section>

          <Section title="How it’s used">
            <p>
              Contact submissions are used only to respond to you. Hall of Fame entries are shown on
              that public page. Nothing here is used for profiling, advertising, or sold to anyone.
            </p>
          </Section>

          <Section title="Third-party services">
            <p>
              The site uses an email provider to deliver contact messages, a database provider to
              store Hall of Fame entries and journal posts, and (optionally) a music service to show
              a “now playing” track. These providers only receive the data needed to perform those
              functions.
            </p>
          </Section>

          <Section title="Your choices">
            <p>
              You can browse without submitting anything. To remove a Hall of Fame entry or ask
              what’s stored, use the contact form and it’ll be handled. Clearing your browser’s site
              data removes the local preferences described above.
            </p>
          </Section>
        </div>

        <div className="mt-12 border-t border-edge pt-6">
          <Link
            href="/home"
            className="inline-flex items-center gap-1 font-mono text-sm text-ink-soft transition-colors hover:text-poke-red"
          >
            <ArrowLeft aria-hidden className="h-4 w-4" />
            Back to the portfolio
          </Link>
        </div>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 font-display text-lg text-ink">{title}</h2>
      <div className="text-ink-soft">{children}</div>
    </section>
  )
}
