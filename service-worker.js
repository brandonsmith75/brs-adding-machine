const CACHE_NAME = 'brs-adding-machine-cache-v15';
// Use absolute paths to ensure files are cached correctly from the root.
const urlsToCache = [
  '/', // This is the index.html file
  '/manifest.json'
];

// Install the service worker and cache the app shell
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching minimal app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache app shell during install:', error);
      })
  );
});

// Clean up old caches on activation
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Use a "stale-while-revalidate" strategy for all fetches
self.addEventListener('fetch', event => {
  // Ignore non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        // Fetch from the network in the background
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // If we get a valid response, update the cache
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(error => {
            console.warn(`Fetch failed for: ${event.request.url}`, error);
            // This could be a genuine network error or a CORS issue.
        });

        // Return the cached response immediately if it exists, otherwise wait for the network
        return cachedResponse || fetchPromise;
      });
    })
  );
});