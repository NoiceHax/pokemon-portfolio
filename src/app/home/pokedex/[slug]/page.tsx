import { notFound } from 'next/navigation'
import { getProject, getProjects } from '@/lib/content'
import { PokedexEntry } from '@/recruiter/pokedex'

interface EntryPageProps {
  params: { slug: string }
}

/** Pre-render an entry page per project so the Pokédex is fully static. */
export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }))
}

export function generateMetadata({ params }: EntryPageProps) {
  const project = getProject(params.slug)
  if (!project) return { title: 'Unknown Entry' }
  return { title: project.title, description: project.summary }
}

export default function PokedexEntryPage({ params }: EntryPageProps) {
  const project = getProject(params.slug)
  if (!project) notFound()
  return <PokedexEntry project={project} />
}
