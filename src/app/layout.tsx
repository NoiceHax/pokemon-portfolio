import type { Metadata, Viewport } from 'next'
import { fontSans, fontDisplay, fontPokemon } from './fonts'
import { SettingsProvider } from '@/providers/SettingsProvider'
import { AudioProvider } from '@/providers/AudioProvider'
import { DevConsole } from '@/components/easter-eggs/DevConsole'
import { ServiceWorkerCleanup } from '@/components/ServiceWorkerCleanup'
import { SITE_URL } from '@/lib/seo'
import './globals.css'

// Shown verbatim in a link preview: `/` sets no `openGraph` of its own, so the share card
// for the bare domain is exactly this pair. Both are kept short enough to survive the
// ~100-character truncation WhatsApp and LinkedIn apply to a description.
const TITLE = "Trainer Chandan's Portfolio"
const DESCRIPTION = 'A portfolio disguised as a Pokémon adventure. Meet Chandan by exploring it.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: '%s - Trainer Chandan' },
  description: DESCRIPTION,
  applicationName: 'Trainer Chandan',
  keywords: ['portfolio', 'software engineer', 'Pokémon', 'Chandan', 'projects', 'developer'],
  authors: [{ name: 'Chandan' }],
  openGraph: {
    type: 'website',
    // No `url` here on purpose: this is the ROOT metadata, inherited by every route that
    // doesn't set its own openGraph. Hardcoding it made every deep link advertise itself
    // as the homepage when shared. `metadataBase` resolves the per-route URL instead.
    title: TITLE,
    description: DESCRIPTION,
    siteName: 'Trainer Chandan',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Trainer Chandan' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og.png'],
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.svg' },
}

export const viewport: Viewport = {
  themeColor: '#E3350D',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontDisplay.variable} ${fontPokemon.variable}`}
    >
      <body>
        <SettingsProvider>
          <AudioProvider>
            {children}
            <ServiceWorkerCleanup />
            <DevConsole />
          </AudioProvider>
        </SettingsProvider>
      </body>
    </html>
  )
}
