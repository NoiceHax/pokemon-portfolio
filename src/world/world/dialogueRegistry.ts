import type { DialogueScript } from '@/engine/dialogue/types'
import type { ChosenExperience } from '@/providers/SettingsProvider'
import { projectsScript, journalScript, journeyScript, contactScript } from './contentDialogue'

/**
 * Dialogue registry - the single map from a dialogue ID to its DialogueScript.
 *
 * This is the seam that lets NPCs carry only an ID (data) while the Dialogue Engine
 * (unchanged, reused) does the rest. The engine emits `DialogueRequested(dialogueId)`;
 * the React DialogueOverlay looks the id up here and renders it via `useDialogue`.
 *
 * Content-backed scripts read the shared content layer (no duplication). Static
 * scripts (guide/signs/secret) are authored inline. The guide script varies by chosen
 * experience - Friend gets warmer dialogue + hints (docs/DECISIONS.md, decision C).
 */

function lines(id: string, name: string, all: string[]): DialogueScript {
  const nodes: Record<string, DialogueScript['nodes'][string]> = {}
  const pages: string[][] = []
  for (let i = 0; i < all.length; i += 3) pages.push(all.slice(i, i + 3))
  pages.forEach((page, i) => {
    nodes[`n${i}`] = {
      id: `n${i}`,
      lines: page,
      next: i < pages.length - 1 ? `n${i + 1}` : undefined,
    }
  })
  return { id, defaultSpeaker: { name, accent: 'ink' }, startNodeId: 'n0', nodes }
}

function guideScript(experience: ChosenExperience): DialogueScript {
  const body =
    experience === 'friend'
      ? [
          'Hey, so glad you stopped by!',
          'Chandan built this whole town by hand - no game engine, just code.',
          'Psst - try pressing the ` key anywhere for a little secret.',
          'And check the water on the far west side. Curious folks find things there.',
        ]
      : [
          'Welcome to Cerulean City!',
          'This is where Chandan sharpened his skills.',
          'Face a building door and press Enter to head inside - each holds part of his story.',
        ]
  return lines('guide', 'Guide', body)
}

/**
 * Build the registry. Called once per session with the chosen experience so the guide
 * dialogue can vary. Content scripts are evaluated here (current content snapshot).
 */
export function buildDialogueRegistry(
  experience: ChosenExperience,
): Record<string, DialogueScript> {
  return {
    // Content-backed NPCs (shared content layer)
    'npc-projects': projectsScript(),
    'npc-journal': journalScript(),
    'npc-journey': journeyScript(),
    'npc-contact': contactScript(),

    // Static overworld dialogue
    guide: guideScript(experience),
    townsfolk: lines('townsfolk', 'Townsfolk', [
      'This town never sits still - always someone building something.',
      'The red-roofed Pokémon Center up north is where you reach Chandan.',
    ]),
    'sign-town': lines('sign-town', 'Sign', [
      'CERULEAN CITY',
      'A city of cerulean water. Home base for a curious engineer.',
    ]),
    'sign-center': lines('sign-center', 'Sign', [
      'POKÉMON CENTER - heal up and connect with Chandan.',
    ]),
    secret: lines('secret', '...', [
      'You found a hidden spot by the water.',
      "'The best easter eggs reward the curious.' - a note, half-buried.",
    ]),
    'item-potion': lines('item-potion', 'Trainer Chandan', [
      'You picked up a Potion!',
      '(In a portfolio, the real items are the projects - check the Pokédex.)',
    ]),

    // Ambient townsfolk - each points at a real part of the portfolio (no filler).
    'npc-researcher': lines('npc-researcher', 'Researcher', [
      'I study how Chandan builds things.',
      'The lab to the west logs every project - go see his work firsthand.',
    ]),
    'npc-lass': lines('npc-lass', 'Lass', [
      'You battle with Pokémon; Chandan battles with bugs - and wins.',
      'The Gym holds the story of his toughest challenges.',
    ]),
    'npc-shopkeeper': lines('npc-shopkeeper', 'Shopkeeper', [
      'Every good trainer keeps their tools sharp.',
      'Chandan trades in TypeScript, React, and a lot of coffee.',
    ]),
    'npc-hiker': lines('npc-hiker', 'Hiker', [
      "I've climbed a lot of mountains. Chandan's climbed a few learning curves.",
      'Read his journal up the road - the trail notes are worth it.',
    ]),
    'npc-kid': lines('npc-kid', 'Youngster', [
      'When I grow up I wanna ship code like Chandan!',
      'He says: start small, keep building, never stop being curious.',
    ]),
    'npc-lady': lines('npc-lady', 'Townsfolk', [
      'This whole town runs on one engine, written from scratch.',
      'No shortcuts - just careful, readable code.',
    ]),
  }
}
