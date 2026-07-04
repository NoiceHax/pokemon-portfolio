/**
 * Badge completion progress bar (mockup: "BADGES UNLOCKED 15/28 … 53%"). An HP-bar
 * repurposed as a progress meter (CLAUDE.md: HP bars as progress bars).
 *
 * Unlock state is not live until BadgeProvider (Milestone 9); callers pass the
 * current counts. Until then the page passes 0 unlocked with a note.
 */
export function CompletionBar({ unlocked, total }: { unlocked: number; total: number }) {
  const percent = total === 0 ? 0 : Math.round((unlocked / total) * 100)
  return (
    <div className="rounded-card border border-edge bg-surface-raised p-4">
      <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wide text-ink-soft">
        <span>
          Badges Unlocked{' '}
          <span className="font-bold text-poke-red">
            {unlocked} / {total}
          </span>
        </span>
        <span>
          Completion <span className="font-bold text-poke-red">{percent}%</span>
        </span>
      </div>
      <div
        className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-sunken"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Badge completion"
      >
        <div
          className="h-full rounded-full bg-poke-red transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
