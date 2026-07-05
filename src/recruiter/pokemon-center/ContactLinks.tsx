import {
  Mail,
  Github,
  Linkedin,
  FileText,
  Globe,
  Twitter,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'
import type { ContactChannel } from '@/content/schema'

const CHANNEL_ICON: Record<ContactChannel['key'], LucideIcon> = {
  email: Mail,
  github: Github,
  linkedin: Linkedin,
  resume: FileText,
  website: Globe,
  twitter: Twitter,
}

/**
 * Contact channel rows (mockup: Send Transmission / GitHub / LinkedIn). Each is a
 * labelled link; email uses mailto, others open in a new tab.
 */
export function ContactLinks({ channels }: { channels: ContactChannel[] }) {
  return (
    <ul className="space-y-2">
      {channels.map((channel) => {
        const Icon = CHANNEL_ICON[channel.key]
        const external = !channel.href.startsWith('mailto:')
        return (
          <li key={channel.key}>
            <a
              href={channel.href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noreferrer' : undefined}
              className="flex min-h-11 items-center justify-between rounded-md border border-edge px-3 py-3 font-mono text-sm text-ink transition-colors hover:border-poke-red focus:outline-none focus-visible:ring-2 focus-visible:ring-poke-red"
            >
              <span className="flex items-center gap-2">
                <Icon aria-hidden className="h-4 w-4 text-ink-soft" />
                {channel.label}
              </span>
              <ChevronRight aria-hidden className="h-4 w-4 text-poke-red" />
            </a>
          </li>
        )
      })}
    </ul>
  )
}
