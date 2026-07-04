import type { Contact } from '@/content/schema'

/**
 * PLACEHOLDER contact data (Pokémon Center).
 *
 * Uses obvious placeholder handles (decision E). Replace hrefs/email with Chandan’s
 * real channels before launch.
 */
export const contact: Contact = {
  blurb:
    'Looking to start a new adventure with Trainer Chandan? Send a transmission and we can establish a secure connection.',
  email: 'chandanp24107@gmail.com',
  channels: [
    { key: 'email', label: 'Send Transmission', href: 'mailto:chandanp24107@gmail.com' },
    { key: 'github', label: 'GitHub Repository', href: 'https://github.com/NoiceHax' },
    { key: 'linkedin', label: 'LinkedIn Network', href: 'https://linkedin.com/in/chandanp34' },
  ],
}
