import type { MapData } from '../mapTypes'
import type { WorldEntity } from '@/world/entities/entityTypes'
import { roomCollision, roomSpawn, roomDoor } from './roomCollision'

/**
 * Cerulean City building interiors, as pure DATA. Each hosts one content-backed NPC
 * (referenced by dialogueId) and a step-warp doorway back to Cerulean. Adding an
 * interior is adding a spec to this list - no code.
 */
interface InteriorSpec {
  id: string
  name: string
  background: string
  width: number
  height: number
  npc: { name: string; spriteBase: string; dialogueId: string }
  exitToCerulean: { x: number; y: number }
  music?: string
}

function buildInterior(spec: InteriorSpec): MapData {
  const spawn = roomSpawn(spec.width, spec.height)
  const door = roomDoor(spec.width, spec.height)
  const npcPos = { x: Math.max(1, Math.floor(spec.width / 2) - 2), y: 3 }
  const entities: WorldEntity[] = [
    {
      id: `${spec.id}-npc`,
      kind: 'npc',
      name: spec.npc.name,
      position: npcPos,
      facing: 'down',
      spriteBase: spec.npc.spriteBase,
      dialogueId: spec.npc.dialogueId,
    },
    {
      id: `${spec.id}-exit`,
      kind: 'warp',
      position: door,
      trigger: 'step',
      toMap: 'cerulean',
      toSpawn: spec.exitToCerulean,
      label: 'Exit',
    },
  ]
  return {
    id: spec.id,
    name: spec.name,
    width: spec.width,
    height: spec.height,
    spawn,
    background: spec.background,
    collision: roomCollision(spec.width, spec.height),
    entities,
    music: spec.music,
    audioZones: spec.music
      ? [
          {
            id: `${spec.id}-music`,
            rect: { x: 0, y: 0, width: spec.width, height: spec.height },
            track: spec.music,
          },
        ]
      : undefined,
  }
}

export const INTERIOR_MAPS: MapData[] = [
  buildInterior({
    id: 'interior-pokecenter',
    name: 'Pokémon Center',
    background: '/assets/maps/interior_pokecenter.png',
    width: 14,
    height: 9,
    // npc_a/b/e/f are the only sets with side-facing art (see cerulean.ts note); npc_c has
    // none, so it vanishes when faced from the side. Use npc_e here.
    npc: { name: 'Nurse', spriteBase: 'npc_e', dialogueId: 'npc-contact' },
    exitToCerulean: { x: 31, y: 13 },
    music: 'pokemonCenter',
  }),
  buildInterior({
    id: 'interior-lab',
    name: 'Research Lab',
    background: '/assets/maps/interior_mart.png',
    width: 10,
    height: 8,
    npc: { name: 'Researcher', spriteBase: 'npc_a', dialogueId: 'npc-projects' },
    exitToCerulean: { x: 27, y: 25 },
    music: 'professorOakLab',
  }),
  buildInterior({
    id: 'interior-house',
    name: 'Journal House',
    background: '/assets/maps/interior_house.png',
    width: 11,
    height: 9,
    npc: { name: 'Journalist', spriteBase: 'npc_b', dialogueId: 'npc-journal' },
    exitToCerulean: { x: 14, y: 22 },
  }),
  buildInterior({
    id: 'interior-gym',
    name: 'Cerulean Gym',
    background: '/assets/maps/interior_gym.png',
    width: 16,
    height: 19,
    npc: { name: 'Elder', spriteBase: 'npc_a', dialogueId: 'npc-journey' },
    exitToCerulean: { x: 37, y: 20 },
  }),
]
