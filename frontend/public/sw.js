/* EMI Service Worker — Cache strategy:
 * - /assets/*  → CacheFirst  (Vite hashes filenames, safe to cache forever)
 * - Navigate   → NetworkFirst with offline fallback to cached index.html
 * - /api/*     → NetworkOnly (never cache API responses)
 */

const CACHE = 'emi-shell-v1'

// On install, cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(['/', '/manifest.webmanifest'])
    )
  )
  self.skipWaiting()
})

// On activate, delete old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  // Skip API calls — always go to network
  if (url.pathname.startsWith('/api/')) return

  // Hashed assets (e.g. /assets/index-AbCdEf.js) — CacheFirst
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) => cached ?? fetchAndCache(request)
      )
    )
    return
  }

  // Navigation requests — NetworkFirst, fall back to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone()
          caches.open(CACHE).then((c) => c.put(request, clone))
          return res
        })
        .catch(() => caches.match('/'))
    )
    return
  }

  // Everything else — NetworkFirst with cache fallback
  event.respondWith(
    fetch(request)
      .then((res) => {
        const clone = res.clone()
        caches.open(CACHE).then((c) => c.put(request, clone))
        return res
      })
      .catch(() => caches.match(request))
  )
})

function fetchAndCache(request) {
  return fetch(request).then((res) => {
    const clone = res.clone()
    caches.open(CACHE).then((c) => c.put(request, clone))
    return res
  })
}
