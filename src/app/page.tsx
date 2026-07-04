import { BootSequence } from '@/components/boot/BootSequence'
import {
  getProfile,
  getProjects,
  getJournalEntries,
  getBadges,
  getExperience,
  getContact,
} from '@/lib/content'

/**
 * Application entry point.
 *
 * Every visitor enters through the Emulator Boot (DESIGN.md: no exceptions). The boot
 * sequence runs Power → Boot → Startup → Professor Oak. Viewer Selection (M5) will
 * branch to Recruiter or Adventure from Oak.
 *
 * We also touch every content accessor here (server-side, not rendered) so the Shared
 * Content Layer is still validated at build time - malformed content fails the build.
 */
export default function HomePage() {
  validateContentAtBuild()
  return <BootSequence />
}

function validateContentAtBuild() {
  getProfile()
  getProjects()
  getJournalEntries()
  getBadges()
  getExperience()
  getContact()
}
