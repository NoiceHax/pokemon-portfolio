/**
 * One place for every playback level in the app.
 *
 * These are deliberately very low. The music is background music: it should sit under
 * the content and be the thing you notice only if you stop and listen for it, never the
 * thing you reach for the volume slider because of. The previous per-call-site literals
 * (0.5 for the boot themes, 0.2-0.3 elsewhere) drifted apart over time and were loud
 * enough to talk over the page, so the numbers live here now and the call sites just
 * name the role of the sound.
 */

/** Looping background themes. */
export const MUSIC_VOLUME = 0.035

/** World one-shots: picking an item up, opening a door. */
export const SFX_VOLUME = 0.06

/** Interface ticks, e.g. moving the cursor between dialogue choices. Quietest of all:
 *  it can fire several times a second, so it has to stay almost subliminal. */
export const UI_SFX_VOLUME = 0.02
