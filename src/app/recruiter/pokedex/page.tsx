import { BookOpen } from 'lucide-react'
import { getProjects } from '@/lib/content'
import { PageHeader } from '@/recruiter/ui'
import { DataBankHeader, PokedexGrid } from '@/recruiter/pokedex'

export const metadata = {
  title: 'Pokédex',
  description: 'What has Chandan built? Projects catalogued as Pokédex entries.',
}

/** Pokédex - "What has Chandan built?" Content-driven via getProjects. */
export default function PokedexPage() {
  const projects = getProjects()
  return (
    <div>
      <PageHeader
        icon={BookOpen}
        title="Pokédex"
        subtitle="A catalogue of projects - each entry documents what was built and learned."
      />
      <DataBankHeader />
      <PokedexGrid projects={projects} />
    </div>
  )
}
