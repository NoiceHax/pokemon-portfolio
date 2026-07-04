/**
 * Phase 1 - Power. A near-black screen with a single power LED blinking on, evoking
 * a handheld console being switched on. Intentionally minimal and brief.
 */
export function PowerScreen() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-black">
      <span
        aria-hidden
        className="h-2.5 w-2.5 animate-pulse rounded-full bg-poke-red shadow-[0_0_12px_2px] shadow-poke-red"
      />
      <span className="sr-only">Powering on…</span>
    </div>
  )
}
