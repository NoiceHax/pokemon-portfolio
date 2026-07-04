/**
 * Boot phases - the single source of truth for where the emulator is in its startup.
 * Modeled on a real Fire Red power-on:
 *
 *   power (console on) → gamefreak (publisher logo sweep) → title (Fire Red-style
 *   title screen, waits for PRESS START) → oak (Professor Oak dialogue)
 *
 * `title` is a HOLD phase: it does not auto-advance - it waits for the player to press
 * start (key/click), like the games. `oak` is terminal for the boot machine.
 */
export const BOOT_PHASES = ['power', 'gamefreak', 'title', 'oak'] as const
export type BootPhase = (typeof BOOT_PHASES)[number]

/**
 * Auto-advance durations (ms) for TIMED phases only. `title` waits for input and
 * `oak` is terminal, so neither has a duration.
 */
export const PHASE_DURATIONS_MS: Record<'power' | 'gamefreak', number> = {
  power: 1100,
  gamefreak: 3200,
}

/** Phases that auto-advance on a timer (vs. waiting for input / being terminal). */
export function isTimedPhase(phase: BootPhase): phase is 'power' | 'gamefreak' {
  return phase === 'power' || phase === 'gamefreak'
}

export function nextPhase(phase: BootPhase): BootPhase {
  const index = BOOT_PHASES.indexOf(phase)
  if (index === -1 || index === BOOT_PHASES.length - 1) return 'oak'
  return BOOT_PHASES[index + 1]
}

export const FIRST_PHASE: BootPhase = BOOT_PHASES[0]
export const TERMINAL_PHASE: BootPhase = 'oak'
/** The phase that waits for the player to press start. */
export const TITLE_PHASE: BootPhase = 'title'
