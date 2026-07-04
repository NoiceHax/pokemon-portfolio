import type { WorldEvent, WorldEventType, EventOf } from './events'

type Handler<T extends WorldEventType> = (event: EventOf<T>) => void
type AnyHandler = (event: WorldEvent) => void

/**
 * A tiny typed publish/subscribe bus - the only channel systems use to talk to each
 * other. `on` subscribes to one event type; `onAny` subscribes to all (used by the
 * React bridge and by loggers). Handlers are stored per type so emit is O(subscribers).
 *
 * Pure TS: no React, no DOM, no globals.
 */
export class EventBus {
  private handlers = new Map<WorldEventType, Set<AnyHandler>>()
  private anyHandlers = new Set<AnyHandler>()

  on<T extends WorldEventType>(type: T, handler: Handler<T>): () => void {
    let set = this.handlers.get(type)
    if (!set) {
      set = new Set()
      this.handlers.set(type, set)
    }
    set.add(handler as AnyHandler)
    return () => set!.delete(handler as AnyHandler)
  }

  onAny(handler: AnyHandler): () => void {
    this.anyHandlers.add(handler)
    return () => this.anyHandlers.delete(handler)
  }

  emit(event: WorldEvent): void {
    const set = this.handlers.get(event.type)
    if (set) for (const h of set) h(event)
    for (const h of this.anyHandlers) h(event)
  }

  clear(): void {
    this.handlers.clear()
    this.anyHandlers.clear()
  }
}
