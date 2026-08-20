// Service Worker — Budget v4 (cache d'abord, fonctionnement hors ligne)
const CACHE = 'budget-v4-r59';
// index.html est le seul fichier indispensable ; les autres sont un confort.
const ESSENTIELS = ['./', './index.html'];
const OPTIONNELS = ['./manifest.webmanifest',
  './icon-192.png', './icon-256.png', './icon-512.png', './icon-1024.png',
  './icon-maskable-192.png', './icon-maskable-512.png', './apple-touch-icon.png',
  './capture-large.png', './capture-mobile.png'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    // Les essentiels doivent réussir, sinon l'installation échoue franchement.
    await c.addAll(ESSENTIELS);
    // Les optionnels sont tentés un par un : un fichier absent du dépôt
    // (icône, manifeste) ne doit pas empêcher toute la mise en cache.
    await Promise.all(OPTIONNELS.map(u =>
      c.add(u).catch(() => console.warn('[sw] non mis en cache :', u))));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, {ignoreSearch: true}).then(hit => hit ||
      fetch(e.request).then(res => {
        if (res.ok && e.request.url.startsWith(self.location.origin)){
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match('./index.html'))   // navigation hors ligne
    )
  );
});
