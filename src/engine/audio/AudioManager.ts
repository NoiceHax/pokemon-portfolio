import { audio as audioAssets } from '@/lib/assets/registry'

/** Named audio cues available to the app. Keys mirror the asset registry. */
export type SoundKey = keyof typeof audioAssets

/**
 * Framework-agnostic audio manager.
 *
 * Responsibilities:
 * - Lazily create and cache one HTMLAudioElement per cue.
 * - Respect a global mute flag (set by the UI from SettingsProvider).
 * - Tolerate the browser autoplay policy: play() may reject until the user has
 *   interacted with the page; we swallow that rejection rather than crash
 *   (CLAUDE.md: fail gracefully).
 *
 * This class holds no React state. AudioProvider is the thin React binding.
 */
export class AudioManager {
  private elements = new Map<SoundKey, HTMLAudioElement>()
  private muted = false

  setMuted(muted: boolean): void {
    this.muted = muted
    for (const element of this.elements.values()) {
      element.muted = muted
    }
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

  /** Play a one-shot cue from the start. Silently no-ops if blocked or muted. */
  play(
    key: SoundKey,
    { loop = false, volume = 1 }: { loop?: boolean; volume?: number } = {},
  ): void {
    const element = this.element(key)
    if (!element) return
    element.loop = loop
    element.volume = volume
    element.currentTime = 0
    // play() returns a promise that rejects under autoplay restrictions.
    void element.play().catch(() => {
      /* blocked until user gesture - acceptable, boot still proceeds */
    })
  }

  stop(key: SoundKey): void {
    const element = this.elements.get(key)
    if (!element) return
    element.pause()
    element.currentTime = 0
  }

  stopAll(): void {
    for (const key of this.elements.keys()) this.stop(key)
  }
}
