const CACHE_NAME = 'simple-calc-pwa-poc-v1'
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/styles.css',
  '/app.js',
  '/icons/icon-192.png',
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
})

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  )
})
