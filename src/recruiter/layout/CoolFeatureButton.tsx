'use client'

import { ChevronRight } from 'lucide-react'
import { Panel } from '@/recruiter/ui'

/**
 * "A Cool Feature" - opens the hidden developer terminal (the DevConsole, normally found
 * by pressing the backtick key). Dispatches a window event the DevConsole listens for, so
 * recruiters get a discoverable doorway to the same easter-egg terminal.
 */
export function CoolFeatureButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event('open-dev-console'))}
      className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-poke-red"
      aria-label="Open a cool feature (developer terminal)"
    >
      <Panel className="flex items-center justify-between p-3 transition-colors hover:border-poke-red">
        <span className="font-mono text-sm text-ink">A Cool Feature</span>
        <ChevronRight aria-hidden className="h-4 w-4 text-poke-red" />
      </Panel>
    </button>
  )
}
