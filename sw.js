/* xcal service worker.
   Its first job is installability: Firefox and Chrome on Android only install a
   site that has one; without it "Add to Home Screen" is a bookmark that opens
   in a tab with the address bar. Its second job is the app shell offline.

   Strategy: same-origin GET requests go network first and refresh the cache,
   falling back to the cache when the network fails. So an online launch always
   runs the latest version and needs no update/reload choreography, and an
   offline launch gets the last one that loaded. The data file is cross-origin
   and is never touched here; the page keeps it in localStorage itself. */
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
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});
