import localFont from 'next/font/local'

/**
 * Pixel font system (Fire Red / Game Boy inspired).
 *
 * The whole app uses pixel fonts to read as an authentic Pokémon game:
 * - `display` (Press Start 2P) - the chunky 8-bit face for headings, nav, dialogue,
 *   titles, UI chrome.
 * - `sans` (VT323) - a readable pixel face for long-form body (Journal articles,
 *   Pokédex descriptions) so recruiters can actually read the content.
 * - `mono` maps to the same pixel body face for consistency.
 *
 * Fonts are bundled locally (src/assets/fonts) so there is no external request - the
 * CSP-safe, offline-safe path.
 */
export const fontDisplay = localFont({
  src: '../assets/fonts/PressStart2P.ttf',
  variable: '--font-display',
  display: 'swap',
})

/**
 * `pokemon` (Pokémon Emerald Pro) - the authentic GBA-era Pokémon UI typeface. Used for
 * the Emulator Boot / title screen so the very start reads unmistakably as a Pokémon
 * game. The rest of the app keeps Press Start 2P for its chunkier chrome.
 */
export const fontPokemon = localFont({
  src: '../assets/fonts/PokemonEmeraldPro.ttf',
  variable: '--font-pokemon',
  display: 'swap',
})

export const fontSans = localFont({
  src: '../assets/fonts/VT323.ttf',
  variable: '--font-sans',
  display: 'swap',
})

// Body + mono share the readable pixel face.
export const fontMono = fontSans
