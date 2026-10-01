/* xcal service worker.
   Its first job is installability: Firefox and Chrome on Android only install a
   site that has one; without it "Add to Home Screen" is a bookmark that opens
   in a tab with the address bar. Its second job is the app shell offline.

   Strategy for same-origin GET requests: cache first, then refresh the cache
   from the network in the background. A launch never waits on the network, on
   a flaky connection as much as offline, and a new version is picked up on the
   launch after the one that downloaded it. The data file is cross-origin and
   never touched here; the page keeps it in localStorage itself. */
const CACHE = 'xcal-shell';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(caches.open(CACHE).then(cache =>
    cache.match(req, { ignoreSearch: true }).then(hit => {
      const refresh = fetch(req).then(res => {
        if (res.ok) cache.put(req, res.clone());
        return res;
      });
      if (hit) { refresh.catch(() => {}); return hit; }
      return refresh.catch(() => req.mode === 'navigate' ? cache.match('./index.html') : undefined);
    })
  ));
});
