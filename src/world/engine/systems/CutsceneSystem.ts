import type { Direction, TileCoord } from '../types'

/**
 * A cutscene is an ordered list of these verbs (inspired by the reference engine's
 * OverworldEvent). Both scripted moments and NPC behaviour loops are expressed as
 * cutscenes, so there is ONE sequencing mechanism.
 */
export type CutsceneEvent =
  | { type: 'walk'; who?: string; direction: Direction }
  | { type: 'stand'; who?: string; direction: Direction; time: number }
  | { type: 'face'; who: string; toward: string } // `who` turns to face `toward`
  | { type: 'text'; dialogueId: string }
  | { type: 'warp'; toMap: string; toSpawn?: TileCoord }
  | { type: 'wait'; time: number }

/**
 * Hooks the CutsceneSystem uses to act on the world. The engine implements these; this
 * keeps the sequencer decoupled from engine internals (it only knows these verbs).
 * Each returns a promise that resolves when the step is fully done.
 */
export interface CutsceneDriver {
  walk(who: string, direction: Direction): Promise<void>
  stand(who: string, direction: Direction, time: number): Promise<void>
  face(who: string, toward: string): void
  text(dialogueId: string): Promise<void>
  warp(toMap: string, toSpawn?: TileCoord): void
  wait(ms: number): Promise<void>
}

/**
 * CutsceneSystem - runs a sequence of events to completion, awaiting each. While a
 * cutscene runs, the engine locks player input and pauses NPC behaviour loops.
 */
export class CutsceneSystem {
  private running = false

  isRunning(): boolean {
    return this.running
  }

  async play(
    events: CutsceneEvent[],
    driver: CutsceneDriver,
    defaultWho = 'player',
  ): Promise<void> {
    this.running = true
    for (const event of events) {
      switch (event.type) {
        case 'walk':
          await driver.walk(event.who ?? defaultWho, event.direction)
          break
        case 'stand':
          await driver.stand(event.who ?? defaultWho, event.direction, event.time)
          break
        case 'face':
          driver.face(event.who, event.toward)
          break
        case 'text':
          await driver.text(event.dialogueId)
          break
        case 'warp':
          driver.warp(event.toMap, event.toSpawn)
          break
        case 'wait':
          await driver.wait(event.time)
          break
      }
    }
    this.running = false
  }
}
