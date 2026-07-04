'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { DialogueChoice, DialogueNode, DialogueScript, Speaker } from './types'

interface DialogueState {
  /** The active node, or null once the dialogue has ended. */
  node: DialogueNode | null
  /** Resolved speaker for the active node (node speaker → script default). */
  speaker: Speaker | undefined
  /** The current line/page text within the active node. */
  line: string
  /** True when the last line of the node is showing (advancing will move on/branch). */
  isLastLine: boolean
  /** True when the node presents choices (branching decision point). */
  hasChoices: boolean
  /** True once the dialogue reaches a terminal node with no next/choices. */
  isFinished: boolean
  /** Advance to the next line, then the next node. No-op at a choice node. */
  advance: () => void
  /** Select a branching choice: fire its callback and jump to its target. */
  select: (choice: DialogueChoice) => void
}

/**
 * Runtime that walks a DialogueScript. Dataset-agnostic - it knows nothing about Oak
 * or any NPC, only the graph shape. This is what makes the engine reusable.
 *
 * Node entry fires `onEnter` exactly once per entry (guarded so React's effect
 * re-runs and Strict Mode double-invokes don't double-fire real side effects).
 */
export function useDialogue(script: DialogueScript): DialogueState {
  const [nodeId, setNodeId] = useState<string | null>(script.startNodeId)
  const [lineIndex, setLineIndex] = useState(0)
  const enteredNodeRef = useRef<string | null>(null)

  const node = nodeId ? (script.nodes[nodeId] ?? null) : null

  // Fire onEnter once per node entry.
  useEffect(() => {
    if (node && enteredNodeRef.current !== node.id) {
      enteredNodeRef.current = node.id
      node.onEnter?.()
    }
  }, [node])

  const speaker = node?.speaker ?? script.defaultSpeaker
  const lines = node?.lines ?? []
  const line = lines[lineIndex] ?? ''
  const isLastLine = lineIndex >= lines.length - 1
  const hasChoices = Boolean(node?.choices && node.choices.length > 0)
  const isFinished = node === null

  const goToNode = useCallback((id: string | null) => {
    setNodeId(id)
    setLineIndex(0)
  }, [])

  const advance = useCallback(() => {
    if (!node || hasChoices) return
    if (!isLastLine) {
      setLineIndex((i) => i + 1)
      return
    }
    // Last line consumed: follow `next`, or end the dialogue.
    goToNode(node.next ?? null)
  }, [node, hasChoices, isLastLine, goToNode])

  const select = useCallback(
    (choice: DialogueChoice) => {
      choice.onSelect?.()
      goToNode(choice.next ?? null)
    },
    [goToNode],
  )

  return useMemo(
    () => ({
      node,
      speaker,
      line,
      isLastLine,
      hasChoices,
      isFinished,
      advance,
      select,
    }),
    [node, speaker, line, isLastLine, hasChoices, isFinished, advance, select],
  )
}
