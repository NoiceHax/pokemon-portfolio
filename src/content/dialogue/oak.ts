import type { DialogueScript } from '@/engine/dialogue/types'
import type { ChosenExperience } from '@/providers/SettingsProvider'

/**
 * Professor Oak's boot dialogue - the FIRST dataset for the reusable dialogue engine.
 *
 * Text follows DESIGN.md's Oak script and the three canonical Viewer Selection
 * options (docs/DECISIONS.md, decision C). Oak exists only in the boot and is not a
 * recurring mascot (DESIGN.md).
 *
 * The script is a factory so the choices can invoke real behavior. In Milestone 4 the
 * caller passes a placeholder handler; Milestone 5 (Viewer Selection) wires actual
 * routing to Recruiter / Adventure. The dataset itself stays free of routing details.
 */
export function createOakScript(onChoose: (experience: ChosenExperience) => void): DialogueScript {
  return {
    id: 'oak-intro',
    // No portrait in the box - Oak is shown full-body above the dialogue, in the
    // style of the game's opening lecture.
    defaultSpeaker: {
      name: 'Professor Oak',
      accent: 'red',
    },
    startNodeId: 'welcome',
    nodes: {
      welcome: {
        id: 'welcome',
        lines: [
          'Hello there!',
          'Welcome to the world of software engineering!',
          'My name is Oak. People affectionately refer to me as the Pokémon Professor.',
          'This world is inhabited far and wide by projects, ideas, and stories...',
          '...and this one belongs to a trainer named Chandan.',
          'Every visitor comes here for a different reason.',
          'So tell me... what kind of trainer are you?',
        ],
        next: 'choose',
      },
      choose: {
        id: 'choose',
        lines: ['What kind of trainer are you?'],
        choices: [
          {
            id: 'recruiter',
            label: "I'm here to recruit.",
            next: 'confirm-recruiter',
            onSelect: () => onChoose('recruiter'),
          },
          {
            id: 'developer',
            label: "I'm here to explore.",
            next: 'confirm-adventure',
            onSelect: () => onChoose('developer'),
          },
          {
            id: 'friend',
            label: "I'm just visiting.",
            next: 'confirm-adventure',
            onSelect: () => onChoose('friend'),
          },
        ],
      },
      'confirm-recruiter': {
        id: 'confirm-recruiter',
        lines: ["Straight to business - I like it. Let's review the Trainer Card."],
        // Terminal: Viewer Selection (M5) takes over routing from here.
      },
      'confirm-adventure': {
        id: 'confirm-adventure',
        lines: ['A curious spirit! Then let the adventure begin.'],
        // Terminal: Viewer Selection (M5) takes over routing from here.
      },
    },
  }
}
