import { NotebookPen } from 'lucide-react'
import { getJournalFrontmatter } from '@/lib/content/journal'
import { PageHeader } from '@/recruiter/ui'
import { JournalList } from '@/recruiter/journal'

export const metadata = {
  title: 'Journal',
  description: 'How does Chandan think? Field notes, build logs, research and thoughts.',
}

// DB-backed content: read the Journal fresh on every request so a post published in the
// Control Room appears immediately, instead of serving a build-time static snapshot that
// was rendered before the post existed.
export const dynamic = 'force-dynamic'

/** Journal - "How does Chandan think?" A research notebook (DB-first, MDX fallback). */
export default async function JournalPage() {
  const entries = await getJournalFrontmatter()
  return (
    <div>
      <PageHeader
        icon={NotebookPen}
        title="Journal"
        subtitle="Field notes, research logs and thoughts from the journey."
      />
      <JournalList entries={entries} />
    </div>
  )
}
