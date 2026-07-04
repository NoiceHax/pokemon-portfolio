import type { DialogueScript, DialogueNode } from '@/engine/dialogue/types'
import { getProjects, getJournalEntries, getExperience, getContact } from '@/lib/content'

/**
 * Turns the SHARED content layer into NPC dialogue for Adventure Mode. These NPCs read
 * the exact same accessors the Recruiter pages use (@/lib/content) - no duplicated
 * content. Change a project once and both experiences update.
 *
 * Each script is built from current content; every NPC teaches something real
 * (PROJECT_BIBLE: NPCs are guides, not decoration).
 */

function script(id: string, name: string, allLines: string[]): DialogueScript {
  const nodes: Record<string, DialogueNode> = {}
  const pages: string[][] = []
  for (let i = 0; i < allLines.length; i += 3) pages.push(allLines.slice(i, i + 3))
  pages.forEach((page, i) => {
    nodes[`n${i}`] = {
      id: `n${i}`,
      lines: page,
      next: i < pages.length - 1 ? `n${i + 1}` : undefined,
    }
  })
  return { id, defaultSpeaker: { name, accent: 'ink' }, startNodeId: 'n0', nodes }
}

/** Researcher NPC - talks through Chandan's projects (the Pokédex). */
export function projectsScript(): DialogueScript {
  const projects = getProjects()
  return script('npc-projects', 'Researcher', [
    "This is Chandan's research lab.",
    `He's catalogued ${projects.length} projects here - think of them as his Pokédex.`,
    ...projects.slice(0, 4).map((p) => `${p.title}: ${p.summary}`),
    'You can review every entry in detail from the Pokédex.',
  ])
}

/** Journalist NPC - talks through the Journal. */
export function journalScript(): DialogueScript {
  const entries = getJournalEntries().map((e) => e.frontmatter)
  return script('npc-journal', 'Journalist', [
    'Chandan keeps a field journal of everything he learns.',
    `There are ${entries.length} entries so far.`,
    ...entries.slice(0, 3).map((e) => `"${e.title}" - ${e.readMinutes} min read.`),
    'The best trainers never stop learning.',
  ])
}

/** Elder NPC - recounts the career journey (experience). */
export function journeyScript(): DialogueScript {
  const journey = getExperience()
  return script('npc-journey', 'Elder', [
    "Every trainer's journey shapes who they become.",
    ...journey.map((m) => `${m.year} · ${m.location}: ${m.role}.`),
  ])
}

/** Nurse NPC - the Pokémon Center; how to reach Chandan. */
export function contactScript(): DialogueScript {
  const contact = getContact()
  return script('npc-contact', 'Nurse', [
    'Welcome to the Pokémon Center!',
    contact.blurb,
    ...contact.channels.map((c) => `${c.label}.`),
    'Come back any time to heal up and connect.',
  ])
}
