'use client'

import { useEffect, useRef } from 'react'

/**
 * A thin accent bar pinned to the top of the viewport that fills as the reader moves
 * through the entry. Progress is measured against the enclosing <article>, not the whole
 * page, so the sidebar (below the content on mobile) and the footer don't count as
 * reading: the bar is full once the article's last line is on screen.
 *
 * The width is driven by a transform written straight to the DOM on each animation
 * frame, so scrolling never re-renders React. It's decorative - screen readers already
 * know where they are in the document - so it stays hidden from them.
 */
export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bar = barRef.current
    const article = bar?.closest('article')
    if (!bar || !article) return

    let frame = 0
    const update = () => {
      frame = 0
      const { top, height } = article.getBoundingClientRect()
      const scrollable = height - window.innerHeight
      const progress = scrollable <= 0 ? 1 : Math.min(1, Math.max(0, -top / scrollable))
      bar.style.transform = `scaleX(${progress})`
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    // Images and embeds in the body change the article's height after first paint.
    const observer = new ResizeObserver(schedule)
    observer.observe(article)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      observer.disconnect()
    }
  }, [])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-40 h-1">
      <div
        ref={barRef}
        className="h-full origin-left bg-poke-red"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  )
}
