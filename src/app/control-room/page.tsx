import { ControlRoom } from './ControlRoom'

// Unlisted admin dashboard. Not linked anywhere; revealed by the `gbaawesome` console
// command. Access is gated by the login (password + TOTP) inside ControlRoom, enforced
// server-side on every /api/admin/* call. Keep it out of search engines.
export const metadata = {
  title: 'Control Room',
  robots: { index: false, follow: false },
}

export default function ControlRoomPage() {
  return <ControlRoom />
}
