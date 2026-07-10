/**
 * Lightweight analytics. Records typed events so both experiences can report the same
 * signals (page views, world interactions). There is no backend yet - events are
 * buffered in memory and logged in development; a real sink (Vercel Analytics, etc.)
 * can be attached in one place at launch.
 */

export type AnalyticsEvent =
  | { type: 'page_view'; payload: { path: string } }
  | { type: 'section_view'; payload: { section: string } }
  | { type: 'world_interact'; payload: { entity: string } }
  | { type: 'experience_chosen'; payload: { experience: string } }

const buffer: Array<AnalyticsEvent & { at: number }> = []

/** Record an event. Safe to call anywhere (SSR-safe, never throws). */
export function track<T extends AnalyticsEvent['type']>(
  type: T,
  payload: Extract<AnalyticsEvent, { type: T }>['payload'],
): void {
  try {
    const event = { type, payload, at: typeof performance !== 'undefined' ? performance.now() : 0 }
    buffer.push(event as AnalyticsEvent & { at: number })
    if (process.env.NODE_ENV === 'development' && typeof console !== 'undefined') {
      // eslint-disable-next-line no-console
      console.debug('[analytics]', type, payload)
    }
  } catch {
    /* analytics must never break the app */
  }
}

/** Read the in-memory event buffer (for debugging / the dev console). */
export function getAnalyticsBuffer(): ReadonlyArray<AnalyticsEvent & { at: number }> {
  return buffer
}
