/** Reveal alternating letters and punctuation; only missing letters reach editable slots. */
export function namePattern(name: string): string {
  let letter = 0
  return Array.from(name.toUpperCase(), (char) => {
    if (!/[A-Z]/.test(char)) return char
    return letter++ % 2 === 0 ? char : '_'
  }).join('')
}
