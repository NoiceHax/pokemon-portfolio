'use client'

import { useEffect } from 'react'
import { useDialogue } from '@/engine/dialogue/useDialogue'
import type { DialogueScript } from '@/engine/dialogue/types'
import { DialogueBox } from './DialogueBox'

interface DialogueSceneProps {
  script: DialogueScript
  /** Called once when the dialogue reaches a terminal node. */
  onFinish?: () => void
}

/**
 * Convenience wrapper that runs a full DialogueScript through the engine and renders
 * it in a DialogueBox. This is the reusable unit every NPC (and Professor Oak) uses:
 * pass a script, optionally handle onFinish.
 */
export function DialogueScene({ script, onFinish }: DialogueSceneProps) {
  const { node, speaker, line, hasChoices, isFinished, advance, select } = useDialogue(script)

  useEffect(() => {
    if (isFinished) onFinish?.()
  }, [isFinished, onFinish])

  if (!node) return null

  return (
    <DialogueBox
      speaker={speaker}
      line={line}
      hasChoices={hasChoices}
      choices={node.choices}
      onAdvance={advance}
      onSelect={select}
    />
  )
}
