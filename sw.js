/**
 * RFKC Service Worker — intentionally minimal.
 *
 * This is a frequently-deployed SaaS with hash-named JS bundles, so an
 * aggressive "cache-first" shell cache does more harm than good (it can pin
 * users to a stale index.html that references old bundles). This worker
 * therefore caches nothing and simply passes requests through to the network.
 *
 * It also PURGES any caches left by older service-worker versions, so returning
 * clients that registered the previous (shell-caching) worker self-heal as soon
 * as the browser picks up this update.
 */
self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) { return Promise.all(keys.map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.clients.claim(); })
  );
});

// Network passthrough — no caching of app or API responses.
self.addEventListener('fetch', function (e) {
  // Let the browser handle it normally; explicitly respond for navigations so
  // the worker is considered "active" for installability without caching.
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(function () { return Response.error(); }));
  }
});

self.addEventListener('message', function (e) {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
