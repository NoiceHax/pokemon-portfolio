'use client'

import { useEffect, useRef } from 'react'

/**
 * Makes the content behind the boot overlay inert while the boot is up.
 *
 * `/` server-renders the Trainer Card in normal document flow so the URL has real,
 * crawlable content - the overlay merely covers it. Two side effects come with that: the
 * document is now taller than the viewport, so the boot screen scrolls and moves nothing
 * visible; and every link in the covered subtree is still a tab stop, so focus lands on
 * content the visitor cannot see (the `oak` phase is terminal and holds indefinitely,
 * so that is not a brief window). Neither is fixed by hiding the markup - it has to stay
 * rendered - so the subtree is only made non-interactive and the page held still.
 *
 * Done from an effect because `/` is a Server Component: React 18 drops an `inert` prop
 * rather than forwarding it, and the scroll lock belongs to the document. The boot only
 * ever ends by navigating away, so both stay on for the life of the page and are undone
 * on unmount, for a client-side route back.
 */
export function BootGuard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const covered = ref.current
    covered?.setAttribute('inert', '')

    const root = document.documentElement
    const previousOverflow = root.style.overflow
    root.style.overflow = 'hidden'

    return () => {
      covered?.removeAttribute('inert')
      root.style.overflow = previousOverflow
    }
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
