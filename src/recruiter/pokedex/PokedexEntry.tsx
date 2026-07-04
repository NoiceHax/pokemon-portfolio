import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import type { Project } from '@/content/schema'
import { Panel, TypePill, StatusDot } from '@/recruiter/ui'
import { ProjectCover } from './ProjectCover'

/**
 * Full Pokédex entry (project detail). Renders the rich fields from the Project
 * schema, omitting optional sections that aren't present so a light project still
 * looks intentional (CLAUDE.md: graceful, no empty filler).
 */
export function PokedexEntry({ project }: { project: Project }) {
  const dexLabel = `No. ${String(project.dexNumber).padStart(3, '0')}`
  return (
    <article className="space-y-6">
      <Link
        href="/recruiter/pokedex"
        className="inline-flex items-center gap-1 font-mono text-sm text-ink-soft hover:text-poke-red focus:outline-none focus-visible:text-poke-red"
      >
        <ArrowLeft aria-hidden className="h-4 w-4" />
        Back to Pokédex
      </Link>

      <Panel className="overflow-hidden p-6">
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm font-bold text-poke-red">{dexLabel}</span>
          <StatusDot status={project.status} />
        </div>

        <h1 className="mt-2 font-display text-3xl font-bold text-ink">{project.title}</h1>
        <p className="mt-1 font-mono text-sm text-ink-soft">{project.summary}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.types.map((type) => (
            <TypePill key={type} type={type} />
          ))}
        </div>

        <div className="mt-4 overflow-hidden rounded-md border border-edge bg-surface-sunken">
          <ProjectCover project={project} className="h-56" />
        </div>

        <Section title="Stack">
          <div className="flex flex-wrap gap-1.5">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="rounded-md border border-edge px-2 py-0.5 font-mono text-xs text-ink-soft"
              >
                {tech}
              </span>
            ))}
          </div>
        </Section>

        {project.problemSolved ? (
          <Section title="Problem Solved">
            <p className="font-sans text-sm leading-relaxed text-ink">{project.problemSolved}</p>
          </Section>
        ) : null}

        {project.description ? (
          <Section title="Description">
            <p className="font-sans text-sm leading-relaxed text-ink">{project.description}</p>
          </Section>
        ) : null}

        {project.architecture ? (
          <Section title="Architecture">
            <p className="font-sans text-sm leading-relaxed text-ink">{project.architecture}</p>
          </Section>
        ) : null}

        {project.challenges?.length ? (
          <Section title="Challenges">
            <List items={project.challenges} />
          </Section>
        ) : null}

        {project.lessons?.length ? (
          <Section title="Lessons">
            <List items={project.lessons} />
          </Section>
        ) : null}

        {project.links.length ? (
          <Section title="Links">
            <ul className="flex flex-wrap gap-3">
              {project.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-sm text-poke-red hover:underline"
                  >
                    {link.label}
                    <ExternalLink aria-hidden className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}
      </Panel>
    </article>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 border-t border-edge pt-4">
      <h2 className="mb-2 font-mono text-xs uppercase tracking-wide text-poke-red">{title}</h2>
      {children}
    </section>
  )
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5 font-sans text-sm text-ink">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}
