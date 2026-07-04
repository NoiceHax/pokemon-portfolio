import type { MapData } from '../mapTypes'
import type { WorldEntity } from '@/world/entities/entityTypes'
import { CERULEAN_COLLISION } from './ceruleanCollision'

/**
 * Cerulean City - the Adventure spawn (docs/DECISIONS.md, decision D), as pure DATA.
 * Renders the real town artwork; walkability from CERULEAN_COLLISION. Buildings have
 * interact-warp doors into their interiors; NPCs/signs carry dialogueIds. Every entity
 * teaches or guides - no filler.
 */
const entities: WorldEntity[] = [
  {
    id: 'guide',
    kind: 'npc',
    name: 'Guide',
    position: { x: 24, y: 23 },
    facing: 'down',
    spriteBase: 'npc_b',
    dialogueId: 'guide',
  },
  {
    id: 'wanderer',
    kind: 'npc',
    name: 'Townsfolk',
    position: { x: 20, y: 23 },
    facing: 'down',
    // npc_c/d/g/h have NO side-facing art in the sheet (their strips end before the side
    // columns), so they turn invisible when talked to from the side. Only npc_a/b/e/f have
    // full down/up/side sets - every walkable NPC must use one of those four.
    spriteBase: 'npc_e',
    dialogueId: 'townsfolk',
  },

  // Ambient townsfolk - populate the city so it feels lived-in. Each carries a short
  // dialogue that points at a real part of the portfolio (CLAUDE.md: no filler NPCs).
  // All positions are confirmed-walkable tiles (see CERULEAN_COLLISION).
  {
    id: 'npc-researcher',
    kind: 'npc',
    name: 'Researcher',
    position: { x: 12, y: 12 },
    facing: 'down',
    spriteBase: 'npc_a',
    dialogueId: 'npc-researcher',
  },
  {
    id: 'npc-kid',
    kind: 'npc',
    name: 'Youngster',
    position: { x: 28, y: 12 },
    facing: 'down',
    spriteBase: 'npc_b',
    dialogueId: 'npc-kid',
  },
  {
    id: 'npc-lass',
    kind: 'npc',
    name: 'Lass',
    position: { x: 12, y: 18 },
    facing: 'right',
    spriteBase: 'npc_e',
    dialogueId: 'npc-lass',
  },
  {
    id: 'npc-shopkeeper',
    kind: 'npc',
    name: 'Shopkeeper',
    position: { x: 44, y: 18 },
    facing: 'down',
    spriteBase: 'npc_f',
    dialogueId: 'npc-shopkeeper',
  },
  {
    id: 'npc-hiker',
    kind: 'npc',
    name: 'Hiker',
    position: { x: 10, y: 30 },
    facing: 'down',
    spriteBase: 'npc_f',
    dialogueId: 'npc-hiker',
  },
  {
    id: 'npc-lady',
    kind: 'npc',
    name: 'Townsfolk',
    position: { x: 34, y: 30 },
    facing: 'left',
    spriteBase: 'npc_a',
    dialogueId: 'npc-lady',
  },

  // Enterable house doors are RECRUITER PORTALS: interacting opens a preview of a
  // recruiter section, then the full page (see world/recruiterPortals.ts).
  //
  // Which buildings ARE houses is defined by public/assets/reference.png: exactly 8
  // enterable houses (each with a door), and 2 "not a house" buildings that have NO door
  // and must stay inaccessible - the top-RIGHT corner house (~45,12) and the building
  // immediately RIGHT of the Mart (~34,29). We deliberately place NO portal on those two.
  //
  // The 8 houses: top-left pair, top-middle, mid-left, Pokémon Center, the BIKE building,
  // the bottom-left bike shop, and the Mart. 5 are permanently mapped (Trainer Card,
  // Pokédex, Journal, Pokémon Center, Journey); the other 3 pick a random destination each
  // entry. Each door sits on the building's solid door tile; the player faces it from the
  // walkable tile below and presses Enter.
  {
    id: 'door-pokecenter',
    kind: 'portal',
    position: { x: 22, y: 19 },
    trigger: 'interact',
    destination: 'pokemon-center',
    label: 'Pokémon Center',
  },
  {
    id: 'door-lab-right',
    kind: 'portal',
    position: { x: 14, y: 28 },
    trigger: 'interact',
    destination: 'pokedex',
    label: 'Research Lab',
  },
  {
    id: 'door-lab-left',
    kind: 'portal',
    position: { x: 13, y: 28 },
    trigger: 'interact',
    destination: 'pokedex',
    label: 'Research Lab',
  },
  {
    id: 'door-house',
    kind: 'portal',
    position: { x: 15, y: 17 },
    trigger: 'interact',
    destination: 'journal',
    label: 'Journal House',
  },
  // The BIKE building (Cerulean Gym style) has a DOUBLE door - two adjacent entrances.
  // Both lead to the same destination so either side works.
  {
    id: 'door-bike-left',
    kind: 'portal',
    position: { x: 31, y: 21 },
    trigger: 'interact',
    destination: 'trainer-card',
    label: 'Bike Shop',
  },
  // The 5th FIXED mapping: Journey / Experience. The Mart building (its blue entrance).
  {
    id: 'door-mart',
    kind: 'portal',
    position: { x: 29, y: 28 },
    trigger: 'interact',
    destination: 'journey',
    label: 'Journey House',
  },
  // The house immediately LEFT of the Mart (has its own door).
  {
    id: 'door-mart-left-house',
    kind: 'portal',
    position: { x: 23, y: 28 },
    trigger: 'interact',
    destination: 'random',
    label: 'A House',
  },
  // The top houses - random destination each entry (exploration mechanic).
  {
    id: 'door-north-left',
    kind: 'portal',
    position: { x: 10, y: 11 },
    trigger: 'interact',
    destination: 'random',
    label: 'A House',
  },
  {
    id: 'door-north-mid',
    kind: 'portal',
    position: { x: 17, y: 11 },
    trigger: 'interact',
    destination: 'random',
    label: 'A House',
  },
  {
    id: 'door-north-right',
    kind: 'portal',
    position: { x: 30, y: 11 },
    trigger: 'interact',
    destination: 'random',
    label: 'A House',
  },

  // A collectible on the path - walk onto it and press Enter to pick it up.
  {
    id: 'item-potion',
    kind: 'item',
    name: 'a Potion',
    position: { x: 25, y: 24 },
    sprite: { src: '/assets/sprites/item_pokeball.png', alt: 'Item' },
    dialogueId: 'item-potion',
  },

  // Signs.
  { id: 'sign-town', kind: 'sign', position: { x: 18, y: 20 }, dialogueId: 'sign-town' },
  { id: 'sign-center', kind: 'sign', position: { x: 25, y: 19 }, dialogueId: 'sign-center' },

  // Hidden secret by the water - invisible trigger, unlocks Secret Finder.
  {
    id: 'secret-spot',
    kind: 'trigger',
    position: { x: 3, y: 13 },
    dialogueId: 'secret',
    secretId: 'water-note',
    unlockBadge: 'secret-finder',
    hidden: true,
  },
]

export const ceruleanMap: MapData = {
  id: 'cerulean',
  name: 'Cerulean City',
  width: 48,
  height: 40,
  spawn: { x: 22, y: 23 },
  background: '/assets/maps/cerulean.png',
  // Foreground = tree canopies, so the player walks behind them (derived layer).
  foreground: '/assets/maps/cerulean_upper.png',
  collision: CERULEAN_COLLISION,
  // Animated water shimmer frames (see scripts/gen-cerulean-water.cjs).
  waterFrames: [
    '/assets/maps/cerulean_water_0.png',
    '/assets/maps/cerulean_water_1.png',
    '/assets/maps/cerulean_water_2.png',
  ],
  // Ambient swaying flowers on open grass near the town centre (walkable tiles only).
  flowerTiles: [
    { x: 21, y: 23 },
    { x: 34, y: 23 },
    { x: 21, y: 24 },
    { x: 35, y: 25 },
    { x: 11, y: 29 },
  ],
  entities,
}
