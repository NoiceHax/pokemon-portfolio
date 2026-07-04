'use client'

import { useCallback, useRef } from 'react'

/**
 * A callback ref that supports a cleanup function (like useEffect). When the attached
 * node changes or unmounts, the previous cleanup runs. Handy for attaching observers
 * directly to a DOM node without a separate effect + ref pair.
 */
export function useCallbackRef<T extends HTMLElement>(
  attach: (node: T | null) => (() => void) | undefined,
): (node: T | null) => void {
  const cleanupRef = useRef<(() => void) | undefined>(undefined)
  const attachRef = useRef(attach)
  attachRef.current = attach

  return useCallback((node: T | null) => {
    if (cleanupRef.current) {
      cleanupRef.current()
      cleanupRef.current = undefined
    }
    if (node) {
      cleanupRef.current = attachRef.current(node)
    }
  }, [])
}
