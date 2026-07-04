'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useTypewriter } from '@/hooks/useTypewriter'
import { useAudio } from '@/providers/AudioProvider'
import type { DialogueChoice, Speaker } from '@/engine/dialogue/types'
import { DialoguePortrait } from './DialoguePortrait'
import { DialogueChoices } from './DialogueChoices'

interface DialogueBoxProps {
  speaker: Speaker | undefined
  line: string
  hasChoices: boolean
  choices?: DialogueChoice[]
  /** Advance the dialogue (only when not a choice node). */
  onAdvance: () => void
  onSelect: (choice: DialogueChoice) => void
}

/**
 * The dialogue box - a framed Pokémon-style panel with a portrait, speaker name,
 * typed text, and either an advance indicator or a choice menu.
 *
 * Interaction model (matches the games):
 * - While text is typing, a tap/Enter completes it instantly (skip).
 * - Once fully shown, a tap/Enter advances (unless the node has choices, which are
 *   handled by DialogueChoices).
 *
 * The whole box is a button surface for pointer users; keyboard users get a global
 * Enter/Space handler. Choice nodes suppress advance so a stray Enter can't skip past
 * a decision.
 */
export function DialogueBox({
  speaker,
  line,
  hasChoices,
  choices,
  onAdvance,
  onSelect,
}: DialogueBoxProps) {
  const { play } = useAudio()
  const { displayed, isTyping, skip } = useTypewriter(line)

  const handleInteract = useCallback(() => {
    if (isTyping) {
      skip()
      return
    }
    if (!hasChoices) onAdvance()
  }, [isTyping, skip, hasChoices, onAdvance])

  // Keyboard: Enter/Space drives typing→advance. Choice navigation is owned by
  // DialogueChoices, so we only handle advance here when there are no choices.
  //
  // The listener is registered ONCE and reads the latest state/handlers through a ref.
  // Previously the effect depended on [handleInteract, hasChoices, isTyping]; because the
  // typewriter re-renders on every character tick (and `skip`/`handleInteract` are new each
  // render), the effect tore down and re-added the window listener ~every 28ms. A keydown
  // that landed in the teardown gap was dropped - so Enter/Space appeared to "do nothing"
  // (dialogue stuck on the first line). A stable listener + ref eliminates that race.
  const latest = useRef({ handleInteract, hasChoices, isTyping })
  latest.current = { handleInteract, hasChoices, isTyping }
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      const { handleInteract: hi, hasChoices: hc, isTyping: typing } = latest.current
      if (hc && !typing) return // let DialogueChoices handle selection
      event.preventDefault()
      hi()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const showChoices = hasChoices && !isTyping && choices

  return (
    <div
      data-dialogue-box="true"
      className="w-full max-w-2xl rounded-card border-2 border-ink/80 bg-surface-raised p-4 shadow-lg"
    >
      <div className="flex gap-4">
        <DialoguePortrait speaker={speaker} />
        <div className="min-w-0 flex-1">
          {speaker?.name ? (
            <p
              className={`font-display text-base font-bold uppercase tracking-wide ${
                speaker.accent === 'ink' ? 'text-ink' : 'text-poke-red'
              }`}
            >
              {speaker.name}
            </p>
          ) : null}

          {/* Clicking the text area completes/advances (pointer users). */}
          <button
            type="button"
            onClick={handleInteract}
            aria-label={isTyping ? 'Complete text' : 'Advance dialogue'}
            className="mt-1 w-full cursor-default text-left focus:outline-none"
          >
            <p className="min-h-[3rem] whitespace-pre-wrap font-mono text-lg leading-relaxed text-ink">
              {displayed}
            </p>
          </button>

          {showChoices ? (
            <DialogueChoices
              choices={choices}
              onSelect={onSelect}
              onHighlightChange={() => play('obtainedPokemon', { volume: 0.15 })}
            />
          ) : (
            <div className="mt-1 flex h-4 items-center justify-between">
              {/* Subtle, self-explanatory prompt near the box; only while there's more to
                  read. It naturally disappears when the dialogue ends. */}
              {!isTyping ? (
                <span className="font-mono text-[0.65rem] text-ink-faint">
                  <span className="font-display text-[0.55rem] uppercase tracking-wide">
                    Space
                  </span>{' '}
                  /{' '}
                  <span className="font-display text-[0.55rem] uppercase tracking-wide">
                    Enter
                  </span>{' '}
                  → Continue
                </span>
              ) : (
                <span />
              )}
              {!isTyping ? (
                <span aria-hidden className="animate-bounce font-mono text-poke-red">
                  ▾
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
