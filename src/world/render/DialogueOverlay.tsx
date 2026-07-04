'use client'

import { useEffect, useState } from 'react'
import type { DialogueScript } from '@/engine/dialogue/types'
import { DialogueScene } from '@/components/ui/DialogueBox'
import type { WorldEngine } from '@/world/engine/WorldEngine'

/**
 * Bridges engine dialogue events to the (unchanged, reused) Dialogue Engine.
 *
 * The engine emits `DialogueRequested(dialogueId)`; this overlay resolves the id to a
 * script via the registry and renders it with `DialogueScene`. On finish it emits
 * `DialogueFinished`. This is the only place that knows both worlds - the engine speaks
 * in ids, the Dialogue Engine speaks in scripts. Which dialogue is *open* is UI state,
 * not game state, so it lives here, not in the engine.
 */
export function DialogueOverlay({
  engine,
  registry,
}: {
  engine: WorldEngine
  registry: Record<string, DialogueScript>
}) {
  const [active, setActive] = useState<{ id: string; script: DialogueScript } | null>(null)

  useEffect(() => {
    return engine.bus.on('DialogueRequested', ({ dialogueId }) => {
      const script = registry[dialogueId]
      if (script) setActive({ id: dialogueId, script })
    })
  }, [engine, registry])

  if (!active) return null

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 flex justify-center p-4">
      <DialogueScene
        key={active.id}
        script={active.script}
        onFinish={() => {
          engine.bus.emit({ type: 'DialogueFinished', dialogueId: active.id })
          setActive(null)
        }}
      />
    </div>
  )
}
