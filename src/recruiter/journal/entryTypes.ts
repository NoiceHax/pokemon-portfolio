import type { JournalEntryType } from '@/content/schema'

/** Display label + color per journal entry type (mockup filter chips). */
export const ENTRY_TYPE_META: Record<JournalEntryType, { label: string; classes: string }> = {
  'field-note': { label: 'Field Note', classes: 'text-poke-red bg-poke-red/5 border-poke-red/30' },
  'build-log': { label: 'Build Log', classes: 'text-green-700 bg-green-50 border-green-200' },
  research: { label: 'Research', classes: 'text-purple-700 bg-purple-50 border-purple-200' },
  learning: { label: 'Learning', classes: 'text-amber-700 bg-amber-50 border-amber-200' },
  thought: { label: 'Thought', classes: 'text-blue-700 bg-blue-50 border-blue-200' },
  article: { label: 'Article', classes: 'text-stone-700 bg-stone-100 border-stone-200' },
}
