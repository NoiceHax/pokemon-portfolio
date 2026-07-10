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
      /*
       * Pixel fonts (VT323 / Press Start 2P) look smaller than typical UI fonts at the
       * same CSS size. Raise text-* sizes only — never html { font-size }, which would
       * scale padding/gaps/widths and feel like a page zoom.
       */
      fontSize: {
        xs: ['0.875rem', { lineHeight: '1.25rem' }], // 14px (default 12)
        sm: ['1rem', { lineHeight: '1.5rem' }], // 16px (default 14)
        base: ['1.125rem', { lineHeight: '1.75rem' }], // 18px (default 16)
        lg: ['1.25rem', { lineHeight: '1.875rem' }], // 20px (default 18)
        xl: ['1.375rem', { lineHeight: '2rem' }], // 22px (default 20)
        '2xl': ['1.625rem', { lineHeight: '2.25rem' }], // 26px (default 24)
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px (same as default)
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px (same as default)
      },
    },
  },
  plugins: [],
}

export default config
