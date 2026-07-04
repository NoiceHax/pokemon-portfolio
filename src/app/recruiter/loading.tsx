/**
 * Recruiter loading state - a Pokédex-style scanning shimmer while a page streams in
 * (CLAUDE.md: loading states should always exist).
 */
export default function Loading() {
  return (
    <div className="grid min-h-[40vh] place-items-center" role="status" aria-label="Loading">
      <div className="flex flex-col items-center gap-3">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-edge border-t-poke-red" />
        <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">Scanning…</p>
      </div>
    </div>
  )
}
