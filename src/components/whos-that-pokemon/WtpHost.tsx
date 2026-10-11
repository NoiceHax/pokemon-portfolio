'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { OPEN_WTP_EVENT } from './events'
import { WtpLauncher } from './WtpLauncher'

// The game only loads once someone opens it.
const WtpModal = dynamic(() => import('./WtpModal').then((m) => m.WtpModal), { ssr: false })

/**
 * Mounted once in the root layout, so a run survives client-side navigation between pages.
 * Opens on the `open-whos-that-pokemon` window event (see events.ts) and decides where the
 * floating launcher shows:
 *  - /home/*: no launcher - the sidebar's "A Cool Feature" card is the doorway.
 *  - /adventure: desktop with a mouse only; on touch screens that corner is the A button.
 *  - the boot screen, the admin Control Room and the trade easter egg: nothing.
 *  - anywhere else: bottom-right.
 */
export function WtpHost() {
  const pathname = usePathname() ?? '/'
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  // Whatever had focus when the game opened, to hand focus back on close.
  const returnFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const onOpen = () => {
      if (document.activeElement instanceof HTMLElement) {
        returnFocusRef.current = document.activeElement
      }
      setLoaded(true)
      setOpen(true)
    }
    window.addEventListener(OPEN_WTP_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_WTP_EVENT, onOpen)
  }, [])

  const close = useCallback(() => setOpen(false), [])

  // On close, refocus the opener. The floating launcher unmounts while the game is open, so
  // if it was the opener, focus its fresh copy instead.
  useEffect(() => {
    if (open || !returnFocusRef.current) return
    const target = returnFocusRef.current
    returnFocusRef.current = null
    const id = window.requestAnimationFrame(() => {
      if (target.isConnected) target.focus()
      else document.querySelector<HTMLElement>('[data-wtp-launcher="true"]')?.focus()
    })
    return () => window.cancelAnimationFrame(id)
  }, [open])

  const hidden =
    pathname === '/' ||
    pathname.startsWith('/home') ||
    pathname.startsWith('/control-room') ||
    pathname.startsWith('/trade')

  return (
    <>
      {!hidden && !open ? <WtpLauncher desktopOnly={pathname.startsWith('/adventure')} /> : null}
      {loaded ? <WtpModal open={open} onClose={close} /> : null}
    </>
  )
}
