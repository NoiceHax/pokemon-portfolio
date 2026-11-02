import { randomInt } from 'crypto'
import type { Difficulty } from './settings'

/** Pick fresh letter positions once per round; punctuation always stays visible. */
export function namePattern(name: string, difficulty: Difficulty = 'normal'): string {
  const chars = Array.from(name.toUpperCase())
  const positions = chars.flatMap((char, index) => (/[A-Z]/.test(char) ? [index] : []))
  const fraction = { easy: 0.5, normal: 0.25, hard: 0 }[difficulty]
  const count = Math.min(positions.length - 1, Math.floor(positions.length * fraction))
  for (let i = positions.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[positions[i], positions[j]] = [positions[j]!, positions[i]!]
  }
  const visible = new Set(positions.slice(0, Math.max(0, count)))
  return chars
    .map((char, index) => (/[A-Z]/.test(char) && !visible.has(index) ? '_' : char))
    .join('')
}
