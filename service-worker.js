const CACHE_NAME = 'aigen-cache-v1';

// Assets to cache immediately
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/manifest.json',
  '/icon.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
          // Fail silently for dev environments where some assets might be dynamic
          console.log('Optional assets skipped during install');
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and chrome-extension URLs
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension')) {
    return;
  }

  event.respondWith(
    (async () => {
      // Network First Strategy
      try {
        const networkResponse = await fetch(event.request);
        
        // If successful network response, cache it
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, responseToCache);
        }
        
        return networkResponse;
      } catch (error) {
        // Network failed, try cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // If both fail and it's a navigation request, return index.html (SPA fallback)
        if (event.request.mode === 'navigate') {
           const cache = await caches.open(CACHE_NAME);
           return await cache.match('/index.html');
        }

        throw error;
      }
    })()
  );
});