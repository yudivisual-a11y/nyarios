// BERES Service Worker for PWA WebAPK
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let network handle fetching
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
