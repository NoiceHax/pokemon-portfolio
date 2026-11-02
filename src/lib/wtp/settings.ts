export const GENERATIONS = [
  { id: 1, region: 'Kanto' },
  { id: 2, region: 'Johto' },
  { id: 3, region: 'Hoenn' },
  { id: 4, region: 'Sinnoh' },
  { id: 5, region: 'Unova' },
  { id: 6, region: 'Kalos' },
  { id: 7, region: 'Alola' },
  { id: 8, region: 'Galar / Hisui' },
  { id: 9, region: 'Paldea' },
] as const

export type Generation = (typeof GENERATIONS)[number]['id']
export type Difficulty = 'easy' | 'normal' | 'hard'
export interface GameSettings {
  generations: Generation[]
  difficulty: Difficulty
}

export const DEFAULT_SETTINGS: GameSettings = { generations: [1, 2], difficulty: 'normal' }

export function parseSettings(input: unknown): GameSettings | null {
  if (input === undefined) return { ...DEFAULT_SETTINGS, generations: [1, 2] }
  if (!input || typeof input !== 'object') return null
  const { generations, difficulty } = input as Record<string, unknown>
  if (
    !Array.isArray(generations) ||
    generations.length === 0 ||
    generations.length > GENERATIONS.length ||
    !generations.every((gen) => GENERATIONS.some(({ id }) => id === gen)) ||
    !['easy', 'normal', 'hard'].includes(difficulty as string)
  )
    return null
  return {
    generations: [...new Set(generations)] as Generation[],
    difficulty: difficulty as Difficulty,
  }
}
