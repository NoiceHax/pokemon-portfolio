'use client'

import { useCallbackRef } from './useCallbackRef'
import { useState } from 'react'

interface Size {
  width: number
  height: number
}

/**
 * Measures an element's size and keeps it updated via ResizeObserver. Returns a
 * callback ref to attach and the current size. Used by the world viewport so the
 * camera knows how much space it has to center within.
 */
export function useElementSize<T extends HTMLElement>(): [(node: T | null) => void, Size] {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 })

  const ref = useCallbackRef<T>((node) => {
    if (!node) return undefined
    const update = () => setSize({ width: node.clientWidth, height: node.clientHeight })
    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  })

  return [ref, size]
}
