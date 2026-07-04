'use client'

import { useEffect, useRef, useState } from 'react'
import { useBadges } from '@/providers/BadgeProvider'
import { useAudio } from '@/providers/AudioProvider'
import { getAnalyticsBuffer } from '@/lib/analytics'

/**
 * Hidden developer console (Milestone 10). Opens with the backtick (`) key. Recruiters
 * never see it; developers naturally find it. Also exposes a `window.trainer` API for
 * console pokers. Unlocks the "Secret Finder" badge on first open and plays Jigglypuff's Song.
 *
 * Commands: help, badges, unlock <slug>, whoami, events, clear, close.
 */
export function DevConsole() {
  const { unlock, unlockedSlugs, totalCount } = useBadges()
  const { play, stop } = useAudio()
  const easterEggMusicRef = useRef(false)
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [lines, setLines] = useState<string[]>([
    'Trainer Dev Console. Type `help`. (This is an easter egg.)',
  ])

  // Expose a window API for developers digging in the browser console.
  useEffect(() => {
    const api = {
      help: () => 'Commands: help, badges, unlock(slug), whoami, events',
      whoami: () => 'Trainer Chandan - built with Next.js, TypeScript, a hand-rolled tile engine.',
      badges: () => `${unlockedSlugs.size}/${totalCount} unlocked`,
      unlock: (slug: string) => {
        unlock(slug)
        return `unlocked: ${slug}`
      },
      events: () => getAnalyticsBuffer(),
    }
    ;(window as unknown as { trainer: typeof api }).trainer = api
  }, [unlock, unlockedSlugs, totalCount])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '`') {
        e.preventDefault()
        setOpen((o) => {
          if (!o) {
            unlock('secret-finder')
            if (!easterEggMusicRef.current) {
              easterEggMusicRef.current = true
              play('jigglypuffsSong', { volume: 0.2, loop: true })
            }
          } else {
            easterEggMusicRef.current = false
          }
          return !o
        })
      } else if (e.key === 'Escape' && open) {
        setOpen(false)
        easterEggMusicRef.current = false
      }
    }
    // Also openable from UI (the "A Cool Feature" button) - same effect as backtick.
    const onOpenEvent = () => {
      unlock('secret-finder')
      if (!easterEggMusicRef.current) {
        easterEggMusicRef.current = true
        play('jigglypuffsSong', { volume: 0.2, loop: true })
      }
      setOpen(true)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('open-dev-console', onOpenEvent)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('open-dev-console', onOpenEvent)
    }
  }, [open, unlock, play])

  const run = (raw: string) => {
    const [cmd, ...args] = raw.trim().split(/\s+/)
    const out: string[] = [`> ${raw}`]
    switch (cmd) {
      case 'help':
        out.push('help · badges · unlock <slug> · whoami · events · clear · close')
        break
      case 'badges':
        out.push(`${unlockedSlugs.size}/${totalCount} badges unlocked`)
        break
      case 'unlock':
        if (args[0]) {
          unlock(args[0])
          out.push(`Unlocked: ${args[0]}`)
        } else out.push('usage: unlock <slug>')
        break
      case 'whoami':
        out.push('Trainer Chandan - a curious engineer who builds things.')
        break
      case 'gbaawesome':
        // Secret: open the unlisted admin Control Room (login-gated).
        out.push('Opening the Control Room…')
        setLines((prev) => [...prev, ...out])
        window.location.href = '/control-room'
        return
      case 'events':
        out.push(`${getAnalyticsBuffer().length} events recorded this session`)
        break
      case 'clear':
        setLines([])
        return
      case 'close':
        setOpen(false)
        return
      case '':
        break
      default:
        out.push(`Unknown command: ${cmd}. Try 'help'.`)
    }
    setLines((prev) => [...prev, ...out])
  }

  if (!open) return null

  return (
    // data-input-capture: while the console is open it OWNS the keyboard. The Adventure
    // world's global key handler bails out whenever an element with this attribute exists,
    // so arrow/WASD/interact keys don't leak through to move the player behind the console.
    <div
      data-input-capture="true"
      className="fixed inset-x-0 bottom-0 z-[100] max-h-[45vh] overflow-hidden border-t-2 border-poke-red bg-black/95 font-mono text-xs text-green-400"
    >
      <div className="max-h-[35vh] overflow-y-auto p-3">
        {lines.map((l, i) => (
          <div key={i} className="whitespace-pre-wrap">
            {l}
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          run(input)
          setInput('')
        }}
        className="flex items-center gap-2 border-t border-green-900 px-3 py-2"
      >
        <span aria-hidden className="text-poke-red">
          $
        </span>
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Developer console input"
          className="flex-1 bg-transparent text-green-400 outline-none"
          placeholder="type a command…"
        />
      </form>
    </div>
  )
}
