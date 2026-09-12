import { audio as audioAssets } from '@/lib/assets/registry'

/** Named audio cues available to the app. Keys mirror the asset registry. */
export type SoundKey = keyof typeof audioAssets

/** Gestures the browser accepts as "the user has interacted with this page". */
const UNLOCK_EVENTS = ['pointerdown', 'keydown', 'touchstart'] as const

/**
 * Framework-agnostic audio manager.
 *
 * Responsibilities:
 * - Lazily create and cache one HTMLAudioElement per cue.
 * - Stay silent until the app explicitly enables sound (see `setEnabled`).
 * - Respect a global mute flag (set by the UI from SettingsProvider).
 * - Never overlap music: a new looping track stops other loops first. One-shot SFX
 *   can play over BGM without cutting the theme.
 * - Survive the browser autoplay policy: play() rejects with NotAllowedError until the
 *   page has a user activation. We remember the track that was refused and start it on
 *   the visitor's first click/keypress instead of dropping it.
 *
 * This class holds no React state. AudioProvider is the thin React binding.
 */
export class AudioManager {
  private elements = new Map<SoundKey, HTMLAudioElement>()
  private muted = false
  /**
   * Sound is opt-in. The boot sequence (title screen -> Professor Oak) is deliberately
   * silent, so nothing can play until Recruiter or Adventure Mode turns this on.
   */
  private enabled = false
  /** How many mounted modes currently want sound (see setEnabled). */
  private enabledBy = 0
  /** Cues paused by suspend() so resume() can pick them back up where they left off. */
  private suspended = new Set<SoundKey>()
  /** Current looping background track (if any). */
  private bgmKey: SoundKey | null = null
  /**
   * A looping track that was asked for but could not start - either autoplay refused it
   * or we were muted at the time. Started as soon as that changes.
   */
  private pendingBgm: { key: SoundKey; volume: number } | null = null
  private unlockBound = false

  /**
   * Turn sound on or off wholesale. Turning it off stops everything and forgets any
   * deferred track, so leaving a mode can never leak audio into the next one.
   *
   * Reference-counted, because on a client-side route change the arriving mode can
   * enable sound before the departing one has unmounted. A plain boolean would let that
   * stale cleanup switch the audio straight back off - silence on a page that had just
   * asked for music.
   */
  setEnabled(enabled: boolean): void {
    this.enabledBy = Math.max(0, this.enabledBy + (enabled ? 1 : -1))
    const next = this.enabledBy > 0
    if (this.enabled === next) return
    this.enabled = next
    if (!next) {
      this.pendingBgm = null
      this.unbindUnlock()
      this.stopAll()
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted
    for (const element of this.elements.values()) {
      element.muted = muted
    }
    // Un-muting has to be able to recover: a track requested while muted never actually
    // started, so flipping `element.muted` back alone would leave the page silent.
    if (!muted) this.startPending()
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
    this.startPending()
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
   * this track plays). One-shot SFX layer on top of BGM without stopping it - that
   * matches game audio and avoids pausing the theme on every UI tick.
   */
  play(
    key: SoundKey,
    { loop = false, volume = 1 }: { loop?: boolean; volume?: number } = {},
  ): void {
    if (!this.enabled) return
    if (this.muted) {
      // Remember the theme so un-muting starts it; one-shots are moments, not state.
      if (loop) this.pendingBgm = { key, volume }
      return
    }
    const element = this.element(key)
    if (!element) return

    if (loop) {
      // New BGM - stop every other cue so themes never stack.
      this.haltOthers(key)
      this.bgmKey = key
      element.loop = true
      element.onended = null
      element.volume = volume
      element.currentTime = 0
      this.pendingBgm = { key, volume }
      void element
        .play()
        .then(() => {
          if (this.pendingBgm?.key === key) this.pendingBgm = null
          this.unbindUnlock()
        })
        .catch(() => {
          // Almost always NotAllowedError: no user activation yet. Wait for one.
          this.bindUnlock()
        })
      return
    }

    // One-shot SFX - leave BGM running; only cut other one-shots so they don't pile up.
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
    if (this.pendingBgm?.key === key) this.pendingBgm = null
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
    this.pendingBgm = null
    for (const key of this.elements.keys()) this.stop(key)
  }

  /** Start the deferred theme, if there is one and nothing is stopping it now. */
  private startPending(): void {
    const pending = this.pendingBgm
    if (!pending || !this.enabled || this.muted) return
    const element = this.element(pending.key)
    if (!element) return
    this.haltOthers(pending.key)
    this.bgmKey = pending.key
    element.loop = true
    element.onended = null
    element.volume = pending.volume
    void element
      .play()
      .then(() => {
        if (this.pendingBgm?.key === pending.key) this.pendingBgm = null
        this.unbindUnlock()
      })
      .catch(() => {
        this.bindUnlock()
      })
  }

  private onUnlock = (): void => {
    this.startPending()
  }

  /**
   * Listen for the first real interaction anywhere on the page. Bound only once a play()
   * has actually been refused, and torn down as soon as one succeeds - so the listeners
   * cost nothing on a page whose audio started normally.
   */
  private bindUnlock(): void {
    if (this.unlockBound || typeof document === 'undefined') return
    this.unlockBound = true
    for (const type of UNLOCK_EVENTS) {
      document.addEventListener(type, this.onUnlock, { passive: true })
    }
  }

  private unbindUnlock(): void {
    if (!this.unlockBound || typeof document === 'undefined') return
    this.unlockBound = false
    for (const type of UNLOCK_EVENTS) {
      document.removeEventListener(type, this.onUnlock)
    }
  }

  /** Release page-level listeners (the provider calls this on teardown). */
  dispose(): void {
    this.unbindUnlock()
    this.stopAll()
  }
}
