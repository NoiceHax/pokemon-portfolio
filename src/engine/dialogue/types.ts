/**
 * Dialogue data model.
 *
 * A dialogue is a GRAPH of nodes. The engine walks the graph; datasets (Professor
 * Oak, every future NPC) are pure data that plug into it. This is the reuse
 * guarantee from the Roadmap: "Professor Oak works. Future NPCs reuse it."
 *
 * Design notes:
 * - A node either auto-advances (`next`) or presents `choices` (branching). If it has
 *   neither, it is terminal.
 * - Callbacks (`onEnter`, `onSelect`) let dialogue drive side effects - playing a
 *   sound, or (for Oak) selecting an experience - without the engine knowing
 *   anything about those domains.
 * - Text is authored as an array of lines so one node can hold multiple advanceable
 *   "pages" of speech, matching how Pokémon dialogue boxes page through text.
 */

/** Who is speaking. Portrait is optional; not every line needs a face. */
export interface Speaker {
  /** Display name, e.g. "Professor Oak". */
  name: string
  /** Optional portrait image (src + required alt for accessibility). */
  portrait?: { src: string; alt: string }
  /** Optional accent color key for the name label (defaults to the theme accent). */
  accent?: 'red' | 'ink'
}

/** A branching option shown at a node. */
export interface DialogueChoice {
  /** Stable id for keys/analytics. */
  id: string
  /** Button label shown to the visitor. */
  label: string
  /** Node to jump to when chosen. Omit for a choice that only runs a callback/ends. */
  next?: string
  /** Side effect fired when this choice is selected. */
  onSelect?: () => void
}

/** A single node in the dialogue graph. */
export interface DialogueNode {
  id: string
  /** Speaker for this node. May be omitted to inherit the script's default speaker. */
  speaker?: Speaker
  /** One or more pages of text. Advancing pages through them before moving on. */
  lines: string[]
  /** Auto-advance target once all lines are read (ignored if `choices` present). */
  next?: string
  /** Branching choices. Presence makes this a decision node. */
  choices?: DialogueChoice[]
  /** Side effect fired when this node is entered. */
  onEnter?: () => void
}

/** A complete, self-contained dialogue. */
export interface DialogueScript {
  /** Stable id, e.g. "oak-intro". */
  id: string
  /** Default speaker used by nodes that don't specify one. */
  defaultSpeaker?: Speaker
  /** Node id the script starts at. */
  startNodeId: string
  /** All nodes, keyed by id. */
  nodes: Record<string, DialogueNode>
}
