'use client'

import { useEffect } from 'react'

/**
 * Clears any legacy service-worker registrations on first load. The app is not a PWA;
 * stale registrations from an earlier deployment were causing GET /sw.js 404 noise.
 */
export function ServiceWorkerCleanup() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister())
    })
  }, [])

  return null
}
