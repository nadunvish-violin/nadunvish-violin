const CACHE_NAME = 'nadunvish-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  // Pass-through for now — just proves a service worker is active,
  // which satisfies installability. Real offline caching can be added later.
  event.respondWith(fetch(event.request))
})