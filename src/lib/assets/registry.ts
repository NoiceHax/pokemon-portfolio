/**
 * Asset registry - the single place that maps logical asset names to file paths.
 *
 * Why this exists:
 * - Components never hardcode `/assets/...` strings. They import from here, so a
 *   moved or renamed file is a one-line change in one place.
 * - CLAUDE.md refers to the asset folder as `/exist`; the canonical folder in this
 *   repo is `/assets`, served statically from `public/assets` (see docs/DECISIONS.md).
 *   That reconciliation is centralized here and nowhere else.
 *
 * These are approved project assets (see docs/DECISIONS.md, decision A). Many are
 * sprite SHEETS - individual sprites are extracted via background-position/canvas
 * when the sprite system is built (Milestone 3/7). For now the registry just names
 * the source files that exist today.
 */

const ASSET_ROOT = '/assets'

export const spriteSheets = {
  playerSprites: `${ASSET_ROOT}/Playable_Characters/Player_Sprites.png`,
  overworldNpcs: `${ASSET_ROOT}/Trainers_NPCs/Overworld_NPCs.png`,
  trainers: `${ASSET_ROOT}/Trainers_NPCs/Trainers.png`,
  pokemon: `${ASSET_ROOT}/Pokemon/Pokemon.png`,
  pokemonOverworld: `${ASSET_ROOT}/Pokemon/Pokemon_Overworld.png`,
  items: `${ASSET_ROOT}/Miscellaneous/Items.png`,
  fonts: `${ASSET_ROOT}/Miscellaneous/Fonts.png`,
} as const

/** Reference/inspiration art (see docs/DECISIONS.md, decision F). */
export const referenceArt = {
  townMap: `${ASSET_ROOT}/Miscellaneous/Town_Map.png`,
  fameChecker: `${ASSET_ROOT}/Miscellaneous/Fame_Checker.png`,
  diploma: `${ASSET_ROOT}/Miscellaneous/Diploma.png`,
  introAndTitle: `${ASSET_ROOT}/Miscellaneous/Intro_and_Title.png`,
  professorOakLecture: `${ASSET_ROOT}/Miscellaneous/Professor_Oak_Lecture.png`,
} as const

/** Unpacked, background-keyed sprites (see scripts/extract-sprites.cjs). */
export const sprites = {
  professorOak: `${ASSET_ROOT}/sprites/prof_oak.png`,
  charizard: `${ASSET_ROOT}/sprites/charizard.png`,
  /** Large detailed trainer (Red) hero sprite - used as the Trainer Card avatar. */
  trainerHero: `${ASSET_ROOT}/sprites/red_hero.png`,
} as const

/** Full-scene reference maps for the Adventure world. */
export const maps = {
  ceruleanCity: `${ASSET_ROOT}/cerulean_city.png`,
  palletTown: `${ASSET_ROOT}/pallet_town.png`,
} as const

/**
 * Original-soundtrack audio cues, used through the audio manager (Milestone 3/6).
 *
 * Filenames are plain ASCII slugs on purpose. The source tracks ship with spaces and
 * non-ASCII characters (e.g. "Pokémon", "Victory! (Trainer)"), which serve fine from a
 * Windows dev box but 404 on Vercel's Linux static CDN (URL-encoding / Unicode
 * normalization mismatch) - so music played locally but not in production.
 */
export const audio = {
  titleScreen: `${ASSET_ROOT}/audio/title-screen.mp3`,
  professorOakLab: `${ASSET_ROOT}/audio/professor-oak-lab.mp3`,
  obtainedPokemon: `${ASSET_ROOT}/audio/obtained-pokemon.mp3`,
  victoryTrainer: `${ASSET_ROOT}/audio/victory-trainer.mp3`,
  pokemonCenter: `${ASSET_ROOT}/audio/pokemon-center.mp3`,
  jigglypuffsSong: `${ASSET_ROOT}/audio/jigglypuffs-song.mp3`,
} as const

export const assets = {
  spriteSheets,
  referenceArt,
  maps,
  audio,
} as const

export type AssetCategory = keyof typeof assets
