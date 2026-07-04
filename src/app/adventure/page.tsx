'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import { buildDialogueRegistry } from '@/world'
import { useSettings } from '@/providers/SettingsProvider'

/**
 * Adventure Mode. The engine + renderer are client-only (they run an event loop and
 * measure the viewport) and heavy, so lazy-loaded with `ssr: false` and kept out of the
 * Recruiter bundle.
 *
 * Spawns in Cerulean City (decision D). The dialogue registry is built here with the
 * chosen experience so the guide's dialogue can vary (Friend gets warmer hints -
 * decision C). React owns no game state; the engine does.
 */
const WorldRenderer = dynamic(() => import('@/world').then((m) => m.WorldRenderer), {
  ssr: false,
  loading: () => (
    <div className="grid h-[100dvh] w-full place-items-center bg-black">
      <p className="font-mono text-sm text-surface/70">Loading world…</p>
    </div>
  ),
})

export default function AdventurePage() {
  const { chosenExperience } = useSettings()
  const registry = useMemo(() => buildDialogueRegistry(chosenExperience), [chosenExperience])
  return <WorldRenderer registry={registry} experience={chosenExperience} />
}
