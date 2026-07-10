import { audio as audioAssets } from '@/lib/assets/registry'

/** Named audio cues available to the app. Keys mirror the asset registry. */
export type SoundKey = keyof typeof audioAssets

/**
 * Framework-agnostic audio manager.
 *
 * Responsibilities:
 * - Lazily create and cache one HTMLAudioElement per cue.
 * - Respect a global mute flag (set by the UI from SettingsProvider).
 * - Never overlap music: a new looping track stops other loops first. One-shot SFX
 *   can play over BGM without cutting the theme.
 * - Tolerate the browser autoplay policy: play() may reject until the user has
 *   interacted with the page; we swallow that rejection rather than crash.
 *
 * This class holds no React state. AudioProvider is the thin React binding.
 */
export class AudioManager {
  private elements = new Map<SoundKey, HTMLAudioElement>()
  private muted = false
  /** Cues paused by suspend() so resume() can pick them back up where they left off. */
  private suspended = new Set<SoundKey>()
  /** Current looping background track (if any). */
  private bgmKey: SoundKey | null = null

  setMuted(muted: boolean): void {
    this.muted = muted
    for (const element of this.elements.values()) {
      element.muted = muted
    }
  }

  /**
   * Pause every currently-playing cue (e.g. the window lost focus / tab was hidden),
   * remembering which were playing. Uses pause() - NOT stop() - so currentTime is kept
   * and resume() continues seamlessly. Idempotent.
   */
  suspend(): void {
    for (const [key, element] of this.elements) {
      if (!element.paused && !element.ended) {
        element.pause()
        this.suspended.add(key)
      }
    }
  }

  /** Resume the cues suspended by suspend() (window regained focus). Respects mute. */
  resume(): void {
    for (const key of this.suspended) {
      const element = this.elements.get(key)
      if (element) void element.play().catch(() => {})
    }
    this.suspended.clear()
  }

  private element(key: SoundKey): HTMLAudioElement | null {
    if (typeof Audio === 'undefined') return null // SSR guard
    let element = this.elements.get(key)
    if (!element) {
      element = new Audio(audioAssets[key])
      element.preload = 'none'
      element.muted = this.muted
      this.elements.set(key, element)
    }
    return element
  }

  /** Stop every cue except `keep` (optional). Resets playback position. */
  private haltOthers(keep?: SoundKey): void {
    for (const [key, element] of this.elements) {
      if (key === keep) continue
      element.pause()
      element.currentTime = 0
      this.suspended.delete(key)
    }
  }

  /**
   * Play a cue. Looping tracks are exclusive BGM (other music is halted first, then
   * this track plays). One-shot SFX layer on top of BGM without stopping it — that
   * matches game audio and avoids pausing the theme on every UI tick.
   */
  play(
    key: SoundKey,
    { loop = false, volume = 1 }: { loop?: boolean; volume?: number } = {},
  ): void {
    if (this.muted) return
    const element = this.element(key)
    if (!element) return

    if (loop) {
      // New BGM — stop every other cue so themes never stack.
      this.haltOthers(key)
      this.bgmKey = key
      element.loop = true
      element.onended = null
      element.volume = volume
      element.currentTime = 0
      void element.play().catch(() => {})
      return
    }

    // One-shot SFX — leave BGM running; only cut other one-shots so they don't pile up.
    for (const [otherKey, other] of this.elements) {
      if (otherKey === key || otherKey === this.bgmKey) continue
      if (!other.loop) {
        other.pause()
        other.currentTime = 0
      }
    }

    element.loop = false
    element.onended = null
    element.volume = volume
    element.currentTime = 0
    void element.play().catch(() => {})
  }

  stop(key: SoundKey): void {
    const element = this.elements.get(key)
    if (!element) return
    this.suspended.delete(key)
    element.onended = null
    element.pause()
    element.currentTime = 0
    if (this.bgmKey === key) {
      this.bgmKey = null
    }
  }

  stopAll(): void {
    this.bgmKey = null
    for (const key of this.elements.keys()) this.stop(key)
  }
}
