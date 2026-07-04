'use client'

import { useEffect, useState } from 'react'
import { hasShownHint, markHintShown, type HintId } from './hintState'

/**
 * Gate a one-shot onboarding hint to once per session.
 *
 * Returns `show` - true only if this hint hasn't been shown yet - and `dismiss`, which
 * marks it shown and hides it. `show` starts false and flips true after mount (post-
 * hydration) so it never causes an SSR/client mismatch.
 *
 * @param id      Stable hint id (see HINT_IDS).
 * @param enabled When false, the hint stays suppressed (e.g. condition not yet met).
 */
export function useOncePerSession(id: HintId, enabled = true): {
  show: boolean
  dismiss: () => void
} {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!enabled) return
    if (hasShownHint(id)) return
    setShow(true)
  }, [id, enabled])

  const dismiss = () => {
    markHintShown(id)
    setShow(false)
  }

  return { show, dismiss }
}
