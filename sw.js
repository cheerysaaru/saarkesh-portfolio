var CACHE_NAME = 'saarkesh-portfolio-v4';
var ASSETS_TO_CACHE = [
  'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800;900&display=swap'
];

self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
    return cache.addAll(ASSETS_TO_CACHE);
  }));
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') { return; }
  var url = new URL(req.url);

  /* Let the browser handle these directly, never from cache:
     - pages (so new versions show right away)
     - content.json and the dashboard (so edits show right away)
     - videos and any range request (cached copies break seeking/playback)
     - Cloudinary / GitHub (they have their own caching) */
  if (req.mode === 'navigate' ||
      /\/content(\.live)?\.json$/.test(url.pathname) ||
      /\/admin(\/|$)/.test(url.pathname) ||
      req.headers.has('range') ||
      /\.(mp4|webm|mov|m4v)$/i.test(url.pathname) ||
      /cloudinary\.com|github\.com|githubusercontent\.com/.test(url.hostname)) {
    return;
  }

  /* Static assets (images, fonts, scripts): cache first, fill on the way. */
  event.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) { return cached; }
      return fetch(req).then(function (response) {
        if (response && response.status === 200 && (response.type === 'basic' || url.hostname.indexOf('fonts.') !== -1)) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(req, copy); });
        }
        return response;
      });
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(names.filter(function (n) { return n !== CACHE_NAME; }).map(function (n) { return caches.delete(n); }));
    })
  );
  self.clients.claim();
});
