var CACHE_NAME = 'saarkesh-portfolio-v1';
var ASSETS_TO_CACHE = [
  './',
  'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800;900&display=swap',
  'images/portrait.jpg'
];

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
    return cache.addAll(ASSETS_TO_CACHE);
  }));
  self.skipWaiting();
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) { return cached; }
      return fetch(event.request).then(function (response) {
        if (!response || response.status !== 200 || response.type !== 'basic') { return response; }
        var responseToCache = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.filter(function (name) { return name !== CACHE_NAME; }).map(function (name) {
          return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});
