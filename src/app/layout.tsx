import type { Metadata, Viewport } from 'next'
import { fontSans, fontDisplay, fontPokemon } from './fonts'
import { SettingsProvider } from '@/providers/SettingsProvider'
import { AudioProvider } from '@/providers/AudioProvider'
import { DevConsole } from '@/components/easter-eggs/DevConsole'
import { ServiceWorkerCleanup } from '@/components/ServiceWorkerCleanup'
import './globals.css'

const SITE_URL = 'https://trainer-chandan.vercel.app'
const TITLE = 'Trainer Chandan - Interactive Portfolio'
const DESCRIPTION =
  'A Pokémon-inspired interactive software engineering portfolio. The same content, two experiences: a fast Recruiter mode and an explorable Adventure world.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: '%s - Trainer Chandan' },
  description: DESCRIPTION,
  applicationName: 'Trainer Chandan',
  keywords: ['portfolio', 'software engineer', 'Pokémon', 'Chandan', 'projects', 'developer'],
  authors: [{ name: 'Chandan' }],
  openGraph: {
    type: 'website',
    url: SITE_URL,
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
