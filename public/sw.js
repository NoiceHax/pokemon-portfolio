/**
 * Legacy service-worker stub.
 *
 * This app is not a PWA. Browsers (or an old deployment) may still poll /sw.js from a
 * stale registration — which showed up as GET /sw.js 404 in dev/prod logs. This file
 * satisfies that probe, clears any leftover caches, then unregisters so the browser
 * stops checking after one update cycle.
 */
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
      await self.registration.unregister()
    })(),
  )
})
