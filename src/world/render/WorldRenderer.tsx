'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DialogueScript } from '@/engine/dialogue/types'
import { TILE_SIZE, TILES_ACROSS, type Direction } from '@/world/engine/types'
import { WorldEngine } from '@/world/engine/WorldEngine'
import { MAP_REGISTRY, START_MAP_ID } from '@/world/world/maps'
import { useAudio } from '@/providers/AudioProvider'
import { track } from '@/lib/analytics'
import { useWorldSnapshot } from './useWorldEngine'
import { useElementSize } from '@/hooks/useElementSize'
import { Scene } from './scene/Scene'
import { TouchControls } from './TouchControls'
import { RecruiterPreview } from './RecruiterPreview'
import { AdventureOnboarding } from './AdventureOnboarding'
import { resolveDestination, getDestination, type RecruiterDestinationId } from '@/world/world/recruiterPortals'
import { setAdventureTransition, getAdventureTransition, clearAdventureTransition } from '@/lib/adventureTransition'
import { MuteButton } from '@/components/ui/MuteButton'

// Keyed by KeyboardEvent.code (the PHYSICAL key), not `.key`. Using `.key` breaks when a
// modifier is held: releasing "d" while Shift is down fires keyup with key "D", which
// wouldn't match the "d" recorded on keydown, so the key would never be released and the
// player would walk forever. `.code` ("KeyD"/"ArrowRight") is invariant under Shift.
const CODE_TO_DIR: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  KeyW: 'up',
  KeyS: 'down',
  KeyA: 'left',
  KeyD: 'right',
}

// Music volumes - increased for better audibility
const BG_MUSIC_VOLUME = 0.2
const ZONE_MUSIC_VOLUME = 0.25
const SFX_VOLUME = 0.3


/**
 * WorldRenderer - the top-level consumer. It instantiates the engine ONCE (in a ref),
 * feeds it input and viewport size, and bridges engine events out to app providers
 * (audio, analytics). Everything below it is a pure snapshot renderer.
 *
 * React owns NO game state here: the engine instance lives in a ref, and the only
 * reactive value is the immutable snapshot from `useWorldSnapshot`.
 */
export function WorldRenderer({
  registry,
  experience,
}: {
  registry: Record<string, DialogueScript>
  experience: string | null
}) {
  const { play, stop } = useAudio()

  // The engine lives in React state so its lifecycle is tied to this component, but it
  // is NOT React game state - it's an opaque object React only holds a handle to.
  //
  // Under React Strict Mode (dev), the component mounts→unmounts→remounts. A plain
  // useRef engine would be destroyed on the first unmount and then reused while dead,
  // so nothing would move (the bug this guards against). Instead we lazily create the
  // engine and, on (re)mount, replace it if the current one was destroyed.
  const [engine, setEngine] = useState(() => {
    const e = new WorldEngine(MAP_REGISTRY, START_MAP_ID)
    e.setExperience(experience)
    return e
  })

  useEffect(() => {
    // If a prior Strict-Mode pass destroyed this engine, spin up a fresh one.
    let active = engine
    if (active.isDestroyed()) {
      active = new WorldEngine(MAP_REGISTRY, START_MAP_ID)
      active.setExperience(experience)
      setEngine(active)
    }
    return () => active.destroy()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const snapshot = useWorldSnapshot(engine)
  const [viewportRef, viewport] = useElementSize<HTMLDivElement>()
  const router = useRouter()

  // The recruiter-portal preview currently open (null = none). Set when the player enters
  // a house door; carries the resolved destination + the originating door + a save
  // snapshot to restore on return.
  const [preview, setPreview] = useState<{
    portalId: string
    destinationId: RecruiterDestinationId
    returnSnapshot: unknown
  } | null>(null)

  // On mount: if we're returning from the recruiter site, restore the exact spot.
  useEffect(() => {
    const t = getAdventureTransition()
    if (t?.returnSnapshot) {
      engine.load(t.returnSnapshot)
      clearAdventureTransition()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Zoom so ~TILES_ACROSS tiles fill the viewport width (the GBA field of view). The
  // world container is CSS-scaled by this; the camera is fed a VIRTUAL viewport (actual
  // size ÷ zoom) so its world-pixel centering/clamping stays correct under the scale.
  const zoom =
    viewport.width > 0
      ? Math.max(1, viewport.width / (TILES_ACROSS * TILE_SIZE))
      : 1

  useEffect(() => {
    if (viewport.width === 0) return
    engine.setViewport(viewport.width / zoom, viewport.height / zoom)
  }, [engine, viewport.width, viewport.height, zoom])

  // Bridge engine events → app providers. The engine stays framework/provider-agnostic;
  // this effect is the adapter.
  useEffect(() => {
    const offInteract = engine.bus.on('InteractionStarted', ({ entityId }) =>
      track('world_interact', { entity: entityId }),
    )
    // Ambient background: Victory! (Trainer) is the default Adventure Mode BGM,
    // kept at a subtle volume. When the player steps into an interior's audio zone,
    // we play that track instead; leaving the zone brings the default back.
    play('victoryTrainer', { loop: true, volume: BG_MUSIC_VOLUME })

    const activeTrack = { current: null as string | null }
    const offAudio = engine.bus.on('AudioZoneEntered', ({ track: t }) => {
      if (activeTrack.current) stop(activeTrack.current as never)
      if (t) {
        stop('victoryTrainer')
        play(t as never, { loop: true, volume: ZONE_MUSIC_VOLUME })
      } else {
        play('victoryTrainer', { loop: true, volume: BG_MUSIC_VOLUME })
      }
      activeTrack.current = t
    })
    const offItem = engine.bus.on('ItemCollected', ({ itemId, name }) => {
      track('world_interact', { entity: `item:${itemId}` })
      play('obtainedPokemon' as never, { volume: SFX_VOLUME })
      void name
    })
    // Entering a house door → recruiter portal. Capture where we are (to restore on
    // return), resolve the destination (random collapses to a concrete one HERE so the
    // preview and the opened page agree), play the door sound, and show the preview.
    const offPortal = engine.bus.on('RecruiterPortalEntered', ({ portalId, destination }) => {
      const destinationId = resolveDestination(destination)
      const returnSnapshot = engine.serialize()
      play('obtainedPokemon' as never, { volume: SFX_VOLUME })
      track('world_interact', { entity: `portal:${portalId}:${destinationId}` })
      setPreview({ portalId, destinationId, returnSnapshot })
    })
    return () => {
      offInteract()
      offAudio()
      offItem()
      offPortal()
      stop('victoryTrainer')
      stop('jigglypuffsSong')
    }
  }, [engine, play, stop])

  // Keyboard input → engine, intent-based. Holding a direction walks continuously; the
  // most-recently-pressed held key wins. While an overlay owns input (dialogue box or
  // PokéNav), the engine ignores movement/interact so the two never fight.
  useEffect(() => {
    const inputCaptured = () =>
      document.querySelector('[data-dialogue-box="true"], [data-input-capture="true"]') !== null
    // Track held direction keys (by physical `.code`) in press order so releasing one
    // falls back to another still held.
    const held: string[] = []
    const isShift = (e: KeyboardEvent) => e.code === 'ShiftLeft' || e.code === 'ShiftRight'

    const applyHeld = () => {
      const topCode = held[held.length - 1]
      engine.setHeld(topCode ? CODE_TO_DIR[topCode] : null)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (inputCaptured()) {
        // An overlay (dialogue / dev console) owns the keyboard: drop any held direction so
        // the player doesn't keep walking underneath it, and stop running.
        held.length = 0
        engine.setHeld(null)
        engine.setRun(false)
        return
      }
      if (isShift(e)) {
        engine.setRun(true)
        return
      }
      const dir = CODE_TO_DIR[e.code]
      if (dir) {
        e.preventDefault()
        if (!held.includes(e.code)) held.push(e.code)
        applyHeld()
        return
      }
      if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyE') {
        e.preventDefault()
        engine.interact()
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (isShift(e)) {
        engine.setRun(false)
        return
      }
      if (!CODE_TO_DIR[e.code]) return
      const i = held.indexOf(e.code)
      if (i !== -1) held.splice(i, 1)
      applyHeld()
    }
    const onBlur = () => {
      held.length = 0
      engine.setRun(false)
      engine.setHeld(null)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [engine])

  return (
    <div
      ref={viewportRef}
      className="relative h-[100dvh] w-full overflow-hidden bg-black"
      role="application"
      aria-label={`Adventure world: ${snapshot.mapName}. Arrow keys or WASD to move, hold Shift to run, Enter to interact.`}
    >
      {/* The four-layer Scene: Background → Entity → Foreground → Overlay. */}
      <Scene engine={engine} snapshot={snapshot} registry={registry} zoom={zoom} />

      <div className="absolute right-4 top-4 z-40">
        <MuteButton className="border-ink/40 bg-surface-raised/90" />
      </div>

      <TouchControls
        onMoveStart={(d) => engine.setHeld(d)}
        onMoveEnd={() => engine.releaseDirection()}
        onAction={() => engine.interact()}
      />

      {/* Contextual onboarding: controls legend, area objective, and the door prompt.
          Purely snapshot-driven; suppressed while the preview modal is open. */}
      <AdventureOnboarding snapshot={snapshot} overlayOpen={preview !== null} />

      {/* Recruiter portal preview - "looking inside the building" before the full page. */}
      {preview ? (
        <RecruiterPreview
          destinationId={preview.destinationId}
          onClose={() => setPreview(null)}
          onEnter={() => {
            // Persist the transition (originating door, chosen destination, return
            // snapshot) so the recruiter pages can show the Return button and restore us.
            setAdventureTransition({
              portalId: preview.portalId,
              destination: preview.destinationId,
              returnSnapshot: preview.returnSnapshot,
            })
            router.push(getDestination(preview.destinationId).href)
          }}
        />
      ) : null}
    </div>
  )
}
