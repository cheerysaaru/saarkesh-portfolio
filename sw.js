var CACHE_NAME = 'saarkesh-portfolio-v2';
var ASSETS_TO_CACHE = [
  './',
  'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800;900&display=swap',
  'images/portrait.jpg'
];

self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
    return cache.addAll(ASSETS_TO_CACHE);
  }));
});

self.addEventListener('fetch', function (event) {
  var req = event.request;

  /* Never cache or serve the HTML page from the cache.
     Navigation requests must always hit the network, otherwise the SW
     returns a stale copy of index.html and newly-referenced images
     (e.g. the design gallery) never load after a deploy/pull. */
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req));
    return;
  }

  event.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) { return cached; }
      return fetch(req).then(function (response) {
        /* Only cache successful, same-origin, basic responses (static assets). */
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        var responseToCache = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(req, responseToCache);
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