import { notFound } from 'next/navigation'
import { getProject, getProjects } from '@/lib/content'
import { DEFAULT_OG_IMAGE, JsonLd, SITE_NAME, projectOgImage, projectSchema } from '@/lib/seo'
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
  const path = `/home/pokedex/${project.slug}`
  // Projects without real cover art fall back to the site card, so the alt has to follow
  // the image rather than always describing the (unused) placeholder cover.
  const image = projectOgImage(project)
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: path },
    // Setting `openGraph` replaces the Home layout's copy rather than merging into it,
    // so siteName and type are repeated here alongside this project's own cover art.
    openGraph: {
      type: 'website' as const,
      siteName: SITE_NAME,
      url: path,
      images: [{ url: image, alt: image === DEFAULT_OG_IMAGE ? SITE_NAME : project.cover.alt }],
    },
  }
}

export default function PokedexEntryPage({ params }: EntryPageProps) {
  const project = getProject(params.slug)
  if (!project) notFound()
  return (
    <>
      <JsonLd data={projectSchema(project)} />
      <PokedexEntry project={project} />
    </>
  )
}
