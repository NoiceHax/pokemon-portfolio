/**
 * Guess matching. Forgiving the way a friend on the couch would be: case, spacing,
 * punctuation and accents don't matter, the gender symbols can be typed as words, and one
 * typo is allowed on longer names.
 */

export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/♀/g, 'f')
    .replace(/♂/g, 'm')
    .replace(/\bfemale\b/g, 'f')
    .replace(/\bmale\b/g, 'm')
    .replace(/[^a-z0-9]/g, '')
}

function levenshtein(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 1) return 2
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0]!
    prev[0] = i
    for (let j = 1; j <= b.length; j++) {
      const up = prev[j]!
      prev[j] = Math.min(up + 1, prev[j - 1]! + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1))
      diag = up
    }
  }
  return prev[b.length]!
}

/**
 * True when `guess` names the Pokémon whose display name is `name` (e.g. "Nidoran♀").
 * `knownNames` is every Pokémon's normalized name: a guess that is exactly some other
 * Pokémon's name is wrong, however close it is (Nidorino for Nidorina, Porygon for
 * Porygon2), so it never gets the one-typo allowance.
 */
export function isMatch(guess: string, name: string, knownNames?: ReadonlySet<string>): boolean {
  const g = normalize(guess)
  const n = normalize(name)
  if (!g) return false
  if (g === n) return true
  // Either Nidoran counts for "nidoran" - the silhouettes differ, the name doesn't.
  if (n.startsWith('nidoran') && g === 'nidoran') return true
  if (knownNames?.has(g)) return false
  return n.length >= 5 && levenshtein(g, n) <= 1
}
