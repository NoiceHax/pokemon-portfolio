import { NotebookPen } from 'lucide-react'
import { getJournalFrontmatter } from '@/lib/content/journal'
import { PageHeader } from '@/recruiter/ui'
import { JournalList } from '@/recruiter/journal'

export const metadata = {
  title: 'Logs',
  description: 'Two-minute reads on what Chandan builds, researches and learns.',
  alternates: { canonical: '/home/logs' },
}

// DB-backed content: read the posts fresh on every request so a post published in the
// Control Room appears immediately, instead of serving a build-time static snapshot that
// was rendered before the post existed.
export const dynamic = 'force-dynamic'

/** Logs - a grid of short, two-minute reads (DB-first, MDX fallback). */
export default async function LogsPage() {
  const entries = await getJournalFrontmatter()
  return (
    <div>
      <PageHeader
        icon={NotebookPen}
        title="Logs"
        subtitle="Two-minute reads on what I build, research and learn."
      />
      <JournalList entries={entries} />
    </div>
  )
}
