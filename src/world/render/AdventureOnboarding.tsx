'use client'

import { ControlsBar, ObjectiveBanner, InteractionHint, HINT_IDS, useOncePerSession } from '@/components/onboarding'
import { stepCoord, type WorldSnapshot } from '@/world/engine/types'

/**
 * All Adventure-Mode contextual guidance, driven purely by the world snapshot. It teaches
 * by playing while keeping a quiet permanent reference:
 *
 *  - A slim always-visible controls bar (WASD move · E enter · Esc back) pinned bottom-center.
 *  - An "Objective" banner the first time the player is in Cerulean City.
 *  - A live "[E] → Enter" prompt whenever the player faces an enterable house door - it
 *    appears only within interaction range (the tile directly ahead) and hides otherwise.
 *
 * A hint that's suppressed (blocked by a preview overlay, or already shown) simply renders
 * nothing. Nothing here captures input.
 */
export function AdventureOnboarding({
  snapshot,
  /** True while a modal (recruiter preview) is open - suppress the door prompt then. */
  overlayOpen,
}: {
  snapshot: WorldSnapshot
  overlayOpen: boolean
}) {
  // Objective banner: once per session, and only while actually in Cerulean City.
  const inCerulean = snapshot.mapId === 'cerulean'
  const objective = useOncePerSession(HINT_IDS.ceruleanObjective, inCerulean)

  // Is the player standing directly in front of an enterable house door?
  const facingDoor = isFacingPortal(snapshot)

  return (
    <>
      {/* Persistent command reference - hidden while a modal owns the screen. */}
      {!overlayOpen ? <ControlsBar /> : null}

      {objective.show ? (
        <ObjectiveBanner
          lines={[
            'Explore Cerulean City.',
            "Open house doors to discover parts of Chandan's portfolio.",
          ]}
          onDone={objective.dismiss}
        />
      ) : null}

      <InteractionHint visible={facingDoor && !overlayOpen} keyLabel="E" action="Enter" />
    </>
  )
}

/** True if the tile directly ahead of the player holds a (visible) portal - a house door. */
function isFacingPortal(snapshot: WorldSnapshot): boolean {
  const ahead = stepCoord(snapshot.player.position, snapshot.player.direction)
  return snapshot.entities.some(
    (e) =>
      e.kind === 'portal' &&
      !e.hidden &&
      e.position.x === ahead.x &&
      e.position.y === ahead.y,
  )
}
