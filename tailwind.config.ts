import type { Config } from 'tailwindcss'

/**
 * Tailwind theme is the styling contract for the whole product.
 *
 * These seed tokens are derived from the Recruiter Mode mockups in /design
 * (Pokeball red accent, warm off-white surfaces, soft-gray borders, mono
 * labels). They are intentionally minimal here — the full design-token pass
 * happens in Prompt 01 (Design Tokens). Extend this palette rather than
 * introducing ad-hoc hex values in components (see CLAUDE.md: "Avoid
 * duplicated utility classes").
 */
const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx,mdx}',
    './src/components/**/*.{ts,tsx}',
    './src/recruiter/**/*.{ts,tsx}',
    './src/world/**/*.{ts,tsx}',
    './src/engine/**/*.{ts,tsx}',
    './src/content/**/*.{ts,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Pokeball-red accent used across nav, headings, CTAs.
        poke: {
          red: '#E3350D',
          'red-dark': '#B71C0C',
        },
        // Warm, minimal surfaces per DESIGN.md ("warm white", "soft gray").
        surface: {
          DEFAULT: '#FBF9F6',
          raised: '#FFFFFF',
          sunken: '#F3F0EB',
        },
        ink: {
          DEFAULT: '#1A1A1A',
          soft: '#4A4A4A',
          faint: '#8A8A8A',
        },
        edge: {
          DEFAULT: '#E4E0D9',
          strong: '#D2CCC2',
        },
      },
      fontFamily: {
        // Pixel font system, wired via next/font/local CSS variables in the layout.
        // sans + mono share the readable pixel body face (VT323); display is the
        // chunky 8-bit face (Press Start 2P). See src/app/fonts.ts.
        sans: ['var(--font-sans)', 'ui-monospace', 'monospace'],
        mono: ['var(--font-sans)', 'ui-monospace', 'monospace'],
        display: ['var(--font-display)', 'var(--font-sans)', 'monospace'],
        // Authentic Pokémon UI face — used for the Emulator Boot / title screen.
        pokemon: ['var(--font-pokemon)', 'var(--font-display)', 'monospace'],
      },
      borderRadius: {
        card: '0.875rem',
      },
    },
  },
  plugins: [],
}

export default config
