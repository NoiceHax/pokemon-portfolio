import {
  TILE_SIZE,
  type Direction,
  type TileCoord,
  type WorldSnapshot,
  type RenderEntity,
} from './types'
import { EventBus } from './EventBus'
import { Actor, RUN_DURATION, WALK_DURATION } from './Actor'
import { CollisionSystem } from './systems/CollisionSystem'
import { CameraSystem } from './systems/CameraSystem'
import { InteractionSystem } from './systems/InteractionSystem'
import { TriggerSystem } from './systems/TriggerSystem'
import { SaveSystem, type WorldSave } from './systems/SaveSystem'
import { CutsceneSystem, type CutsceneEvent, type CutsceneDriver } from './systems/CutsceneSystem'
import type { MapData, MapRegistry } from '@/world/world/mapTypes'
import type { WorldEntity, NpcEntity } from '@/world/entities/entityTypes'

interface Clock {
  now(): number
  schedule(cb: () => void): void
  timeout(cb: () => void, ms: number): void
  /** Optional persistent interval (for ambient animation); returns a cancel fn. */
  interval?(cb: () => void, ms: number): () => void
}

const defaultClock: Clock = {
  now: () => (typeof performance !== 'undefined' ? performance.now() : Date.now()),
  schedule: (cb) =>
    typeof requestAnimationFrame !== 'undefined'
      ? requestAnimationFrame(() => cb())
      : setTimeout(cb, 16),
  timeout: (cb, ms) => setTimeout(cb, ms),
  interval: (cb, ms) => {
    const id = setInterval(cb, ms)
    return () => clearInterval(id)
  },
}

/** ms between ambient animation ticks (water shimmer). ~5.5 Hz reads as a gentle cycle. */
const ANIM_TICK_MS = 180

/**
 * WorldEngine - the single source of truth for the Adventure world (framework-agnostic;
 * React only consumes its snapshot). Evolved to adopt the reference engine's better
 * mechanics: living NPC actors with behaviour loops, intent-position collision so
 * actors never overlap, a cutscene event sequencer, and faceMain-on-talk.
 *
 * State it owns: the player Actor, one Actor per NPC, the active map, camera, and
 * progression. Systems are composed and communicate via the EventBus. The animation
 * clock is bounded - it runs while any actor is moving OR the player holds an intent,
 * and idles otherwise (idle world ≈ 0 CPU).
 */
export class WorldEngine {
  readonly bus = new EventBus()
  private readonly collision = new CollisionSystem()
  private readonly camera = new CameraSystem()
  private readonly interaction = new InteractionSystem(this.bus)
  private readonly triggers = new TriggerSystem(this.bus)
  private readonly saves = new SaveSystem()
  private readonly cutscenes = new CutsceneSystem()

  private readonly registry: MapRegistry
  private readonly clock: Clock

  private map: MapData
  private player: Actor
  /** NPC actors by entity id (only entities that move / have a facing). */
  private actors = new Map<string, Actor>()

  private heldDirection: Direction | null = null
  /**
   * A direction pressed while a step was in progress. Movement is tile-locked, so we
   * can't act on it immediately; we stash it and consume it the instant the current
   * step finishes. This is what makes turns/steps at tile edges feel responsive instead
   * of dropping inputs ("physics breaks at weird places").
   */
  private bufferedDirection: Direction | null = null
  /** Run modifier (hold Shift): faster step cadence while held. */
  private wantsRun = false
  private visitedAreas = new Set<string>()
  private triggeredEvents = new Set<string>()
  private collectedItems = new Set<string>()
  private selectedExperience: string | null = null

  private running = false
  private lastTime = 0
  private destroyed = false
  private snapshotRef: WorldSnapshot

  /** Ambient animation counter (water) + its persistent timer's cancel fn. */
  private animTick = 0
  private stopAnimClock: (() => void) | null = null

  constructor(registry: MapRegistry, startMapId: string, clock: Clock = defaultClock) {
    this.registry = registry
    this.clock = clock
    this.map = registry[startMapId]
    this.player = new Actor(this.map.spawn)
    this.visitedAreas.add(this.map.id)
    this.loadActors()
    this.snapshotRef = this.buildSnapshot()

    this.bus.on('WarpEntered', ({ toMap, toSpawn }) => this.changeArea(toMap, toSpawn))
    this.startAnimationClock()
  }

  /**
   * Persistent, movement-independent tick that advances ambient tile animation (water)
   * and republishes so the scene re-renders even while the player stands still. No-op
   * when the injected clock has no `interval` (e.g. deterministic test clocks).
   */
  private startAnimationClock(): void {
    this.stopAnimClock =
      this.clock.interval?.(() => {
        if (this.destroyed) return
        this.animTick++
        this.publish()
      }, ANIM_TICK_MS) ?? null
  }

  // ---- Actors ----

  /** Instantiate an Actor for each NPC on the current map and start its behaviour loop. */
  private loadActors(): void {
    this.actors.clear()
    for (const e of this.map.entities) {
      if (e.kind === 'npc') {
        const actor = new Actor(e.position, e.facing ?? 'down')
        this.actors.set(e.id, actor)
      }
    }
    // Kick off behaviour loops after a tick so the map is settled.
    this.clock.timeout(() => this.runBehaviourLoops(), 400)
  }

  /** All tiles currently occupied/reserved by actors (for collision). */
  private occupiedTiles(exclude?: Actor): TileCoord[] {
    const tiles: TileCoord[] = []
    if (this.player !== exclude) tiles.push(...this.player.occupies())
    for (const a of this.actors.values()) if (a !== exclude) tiles.push(...a.occupies())
    return tiles
  }

  private canStep(actor: Actor, target: TileCoord): boolean {
    return !this.collision.isBlocked(
      this.map,
      this.activeEntities(),
      this.occupiedTiles(actor),
      target.x,
      target.y,
    )
  }

  /**
   * Try to move the player one step in `direction`. Movement is purely grid + hard
   * collision: the step happens only if the tile ahead is walkable (see canStep).
   * Returns true if a step actually started (else the move is blocked).
   */
  private beginPlayerMove(direction: Direction): boolean {
    const ahead = this.player.ahead(direction)
    if (this.canStep(this.player, ahead)) {
      this.player.beginStep(direction, ahead, this.wantsRun ? RUN_DURATION : WALK_DURATION)
      return true
    }
    return false
  }

  // ---- Input ----

  setHeld(direction: Direction | null): void {
    this.heldDirection = direction
    if (direction) this.tryPlayerStep(direction)
    else {
      this.player.stopPush()
      this.publish()
    }
  }

  pressDirection(direction: Direction): void {
    this.tryPlayerStep(direction)
  }
  releaseDirection(): void {
    this.heldDirection = null
    this.player.stopPush()
    this.publish()
  }

  /** Set the run modifier (hold to move at run cadence). */
  setRun(on: boolean): void {
    this.wantsRun = on
  }

  private tryPlayerStep(direction: Direction): void {
    if (this.cutscenes.isRunning()) return
    if (this.player.isMoving()) {
      // Tile-locked mid-step: remember the latest press so it fires the moment this
      // step completes, instead of being dropped at the tile boundary.
      this.bufferedDirection = direction
      this.start()
      return
    }
    this.player.face(direction)
    if (this.beginPlayerMove(direction)) {
      this.bus.emit({ type: 'PlayerTurned', direction })
    }
    this.publish()
    this.start()
  }

  interact(): void {
    if (this.cutscenes.isRunning() || this.player.isMoving()) return
    const target = this.interaction.resolveTarget(
      this.player.position,
      this.player.direction,
      this.activeEntities(),
    )
    if (!target) return
    // faceMain: the NPC turns to face the player.
    if (target.kind === 'npc' && target.faceOnTalk !== false) {
      const actor = this.actors.get(target.id)
      if (actor) actor.face(opposite(this.player.direction))
    }
    // Items are picked up: remove them and announce the pickup.
    if (target.kind === 'item') {
      this.collectItem(target.id, target.name)
    }
    this.interaction.trigger(target)
    this.publish()
  }

  /** Pick up an item: mark collected (so it stops rendering) + emit ItemCollected. */
  private collectItem(itemId: string, name: string): void {
    if (this.collectedItems.has(itemId)) return
    this.collectedItems.add(itemId)
    this.triggeredEvents.add(`item:${itemId}`)
    this.bus.emit({ type: 'ItemCollected', itemId, name })
  }

  /** Walk-over pickup: collect an item on `tile` (like grabbing a Poké Ball in the games). */
  private pickUpItemAt(tile: TileCoord): void {
    const item = this.activeEntities().find(
      (e) => e.kind === 'item' && e.position.x === tile.x && e.position.y === tile.y,
    )
    if (item && item.kind === 'item') {
      this.collectItem(item.id, item.name)
      if (item.dialogueId)
        this.bus.emit({ type: 'DialogueRequested', dialogueId: item.dialogueId, entityId: item.id })
    }
  }

  /** Map entities minus items the player has already collected. */
  private activeEntities(): WorldEntity[] {
    if (this.collectedItems.size === 0) return this.map.entities
    return this.map.entities.filter((e) => !(e.kind === 'item' && this.collectedItems.has(e.id)))
  }

  setViewport(width: number, height: number): void {
    this.camera.setViewport(width, height)
    this.publish()
  }
  setExperience(experience: string | null): void {
    this.selectedExperience = experience
  }
  travelTo(mapId: string, spawn?: TileCoord): void {
    this.changeArea(mapId, spawn)
  }

  // ---- Cutscenes (scripted + NPC behaviour) ----

  /** Public: run a scripted cutscene (e.g. an intro). Locks input until done. */
  async startCutscene(events: CutsceneEvent[]): Promise<void> {
    await this.cutscenes.play(events, this.driver())
    this.publish()
  }

  private driver(): CutsceneDriver {
    return {
      walk: (who, direction) => this.actorWalk(who, direction),
      stand: (who, direction, time) => this.actorStand(who, direction, time),
      face: (who, toward) => {
        const a = this.actorFor(who)
        const t = this.actorFor(toward)
        if (a && t) a.face(opposite(t.direction))
        this.publish()
      },
      text: (dialogueId) =>
        new Promise((resolve) => {
          this.bus.emit({ type: 'DialogueRequested', dialogueId, entityId: 'cutscene' })
          const off = this.bus.on('DialogueFinished', () => {
            off()
            resolve()
          })
        }),
      warp: (toMap, toSpawn) => this.changeArea(toMap, toSpawn),
      wait: (ms) => new Promise((resolve) => this.clock.timeout(resolve, ms)),
    }
  }

  private actorFor(who: string): Actor | undefined {
    return who === 'player' || who === 'main' ? this.player : this.actors.get(who)
  }

  private actorWalk(who: string, direction: Direction): Promise<void> {
    return new Promise((resolve) => {
      const actor = this.actorFor(who)
      if (!actor) return resolve()
      actor.face(direction)
      const target = actor.ahead(direction)
      if (!this.canStep(actor, target)) return resolve() // blocked → skip
      actor.beginStep(direction, target)
      this.start()
      const off = this.bus.on('ActorStepped', (e) => {
        if (e.actorId === who) {
          off()
          resolve()
        }
      })
    })
  }

  private actorStand(who: string, direction: Direction, time: number): Promise<void> {
    return new Promise((resolve) => {
      const actor = this.actorFor(who)
      if (actor) actor.face(direction)
      this.publish()
      this.clock.timeout(resolve, time)
    })
  }

  /** Each NPC with a behaviour loop runs it forever, pausing during cutscenes. */
  private runBehaviourLoops(): void {
    for (const e of this.map.entities) {
      if (e.kind === 'npc' && e.behaviourLoop && e.behaviourLoop.length) {
        this.loopNpc(e)
      }
    }
  }

  private async loopNpc(npc: NpcEntity): Promise<void> {
    let i = 0
    const step = async () => {
      if (this.destroyed || !this.actors.has(npc.id)) return
      // Pause during cutscenes/dialogue; retry shortly.
      if (this.cutscenes.isRunning()) {
        this.clock.timeout(step, 500)
        return
      }
      const b = npc.behaviourLoop![i]
      i = (i + 1) % npc.behaviourLoop!.length
      if (b.type === 'walk') await this.actorWalk(npc.id, b.direction)
      else await this.actorStand(npc.id, b.direction, b.time)
      step()
    }
    step()
  }

  // ---- Area change ----

  private changeArea(mapId: string, spawn?: TileCoord): void {
    const next = this.registry[mapId]
    if (!next) return
    this.map = next
    this.visitedAreas.add(mapId)
    this.player.teleport(spawn ?? next.spawn, 'down')
    this.loadActors()
    this.triggers.resetForMap(next)
    this.triggers.updateAudio(this.player.position, next.audioZones ?? [])
    this.bus.emit({ type: 'AreaChanged', mapId: next.id, mapName: next.name })
    this.publish()
  }

  // ---- Bounded animation clock ----

  private anyActorMoving(): boolean {
    if (this.player.isMoving()) return true
    for (const a of this.actors.values()) if (a.isMoving()) return true
    return false
  }

  private start(): void {
    if (this.running || this.destroyed) return
    this.running = true
    this.lastTime = this.clock.now()
    const loop = () => {
      if (!this.running || this.destroyed) return
      const now = this.clock.now()
      const dt = Math.min(now - this.lastTime, 64)
      this.lastTime = now

      // Tick the player; on step-complete emit events + fire triggers.
      const mapBefore = this.map.id
      if (this.player.tick(dt)) {
        this.bus.emit({ type: 'ActorStepped', actorId: 'player' })
        this.bus.emit({
          type: 'PlayerMoved',
          from: this.player.position,
          to: this.player.position,
          direction: this.player.direction,
        })
        this.triggers.onEnterTile(this.player.position, this.map, this.activeEntities())
        this.pickUpItemAt(this.player.position)
        if (this.map.id !== mapBefore) {
          this.running = false
          return
        }
        // Continue walking if a key is still held; otherwise consume a buffered tap that
        // arrived mid-step. Held direction wins (continuous walk); the buffer is one-shot.
        if (!this.cutscenes.isRunning()) {
          const next = this.heldDirection ?? this.bufferedDirection
          if (next) {
            this.player.face(next)
            this.beginPlayerMove(next)
          }
        }
        this.bufferedDirection = null
      }

      // Tick NPC actors.
      for (const [id, actor] of this.actors) {
        if (actor.tick(dt)) this.bus.emit({ type: 'ActorStepped', actorId: id })
      }

      this.publish()

      // Keep looping while anything moves, or the player still wants to walk.
      const wantsMore =
        this.anyActorMoving() ||
        (this.heldDirection !== null && !this.cutscenes.isRunning() && !this.player.isMoving())
      if (wantsMore && !this.destroyed) {
        // Idle but holding a key: start the next step, or (if blocked) walk in place
        // against the wall - the FireRed "bump".
        if (this.heldDirection && !this.player.isMoving() && !this.cutscenes.isRunning()) {
          this.player.face(this.heldDirection)
          if (this.beginPlayerMove(this.heldDirection)) this.player.stopPush()
          else this.player.push(dt)
        }
        this.clock.schedule(loop)
      } else {
        this.running = false
      }
    }
    this.clock.schedule(loop)
  }

  // ---- Snapshot ----

  snapshot(): WorldSnapshot {
    return this.snapshotRef
  }

  private publish(): void {
    this.snapshotRef = this.buildSnapshot()
    this.bus.emit({ type: 'SnapshotChanged' })
  }

  private buildSnapshot(): WorldSnapshot {
    const renderEntities: RenderEntity[] = this.activeEntities().map((e) => {
      const actor = e.kind === 'npc' ? this.actors.get(e.id) : undefined
      const position = actor ? actor.position : e.position
      const pixel = actor
        ? actor.pixel()
        : { x: e.position.x * TILE_SIZE, y: e.position.y * TILE_SIZE }
      return {
        id: e.id,
        kind: e.kind,
        position,
        pixel,
        direction: actor ? actor.direction : ('down' as Direction),
        sprite: 'sprite' in e ? e.sprite : undefined,
        spriteBase: e.kind === 'npc' ? e.spriteBase : undefined,
        animFrame: actor ? actor.animFrame() : undefined,
        name: 'name' in e ? e.name : undefined,
        // Warps + explicitly-hidden triggers aren't drawn; NPCs/signs/items are.
        hidden:
          'hidden' in e ? Boolean(e.hidden) : e.kind === 'warp' || e.kind === 'portal',
      }
    })

    // Background / foreground layer stacks: prefer explicit multi-layer art, else wrap
    // the flat single images. The renderer draws these in order (ground→…→canopies).
    const backgroundLayers =
      this.map.backgroundLayers ?? (this.map.background ? [{ src: this.map.background }] : [])
    const foregroundLayers =
      this.map.foregroundLayers ?? (this.map.foreground ? [{ src: this.map.foreground }] : [])

    return {
      mapId: this.map.id,
      mapName: this.map.name,
      mapWidth: this.map.width,
      mapHeight: this.map.height,
      background: this.map.background,
      foreground: this.map.foreground ?? null,
      backgroundLayers,
      foregroundLayers,
      waterFrames: this.map.waterFrames ?? [],
      flowerTiles: this.map.flowerTiles ?? [],
      player: {
        position: this.player.position,
        pixel: this.player.pixel(),
        direction: this.player.direction,
        moving: this.player.isMoving(),
        animFrame: this.player.animFrame(),
      },
      entities: renderEntities,
      camera: this.camera.offset(this.player.pixel(), this.map.width, this.map.height),
      animTick: this.animTick,
    }
  }

  // ---- Save / load ----

  serialize(): WorldSave {
    return {
      currentMap: this.map.id,
      playerPosition: { ...this.player.position },
      playerDirection: this.player.direction,
      visitedAreas: [...this.visitedAreas],
      triggeredEvents: [...this.triggeredEvents],
      selectedExperience: this.selectedExperience,
    }
  }

  load(save: unknown): boolean {
    const knownMaps = new Set(Object.keys(this.registry))
    if (!this.saves.isValid(save, knownMaps)) return false
    this.map = this.registry[save.currentMap]
    this.player.teleport(save.playerPosition, save.playerDirection)
    save.visitedAreas.forEach((a) => this.visitedAreas.add(a))
    save.triggeredEvents.forEach((e) => {
      this.triggeredEvents.add(e)
      if (e.startsWith('item:')) this.collectedItems.add(e.slice('item:'.length))
    })
    this.selectedExperience = save.selectedExperience
    this.loadActors()
    this.triggers.resetForMap(this.map)
    this.triggers.updateAudio(this.player.position, this.map.audioZones ?? [])
    this.publish()
    return true
  }

  markEventTriggered(id: string): void {
    this.triggeredEvents.add(id)
  }
  hasTriggered(id: string): boolean {
    return this.triggeredEvents.has(id)
  }

  isDestroyed(): boolean {
    return this.destroyed
  }
  destroy(): void {
    this.destroyed = true
    this.running = false
    this.stopAnimClock?.()
    this.stopAnimClock = null
    this.bus.clear()
  }
}

function opposite(d: Direction): Direction {
  return d === 'up' ? 'down' : d === 'down' ? 'up' : d === 'left' ? 'right' : 'left'
}
