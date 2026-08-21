// Service Worker — Budget v4 (cache d'abord, fonctionnement hors ligne)
const CACHE = 'budget-v4-r62';
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
  const navigation = e.request.mode === 'navigate'
    || (e.request.destination === 'document');
  if (navigation){
    // Page principale : réseau d'abord, pour ne jamais rester bloqué sur une
    // version périmée si le nom du cache n'a pas été bumpé — repli sur le
    // cache uniquement hors ligne.
    e.respondWith(
      fetch(e.request).then(res => {
        if (res.ok){
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put('./index.html', clone));
        }
        return res;
      }).catch(() => caches.match('./index.html').then(hit => hit || caches.match(e.request)))
    );
    return;
  }
  // Assets statiques (icônes, manifeste…) : cache d'abord, réseau en repli.
  e.respondWith(
    caches.match(e.request, {ignoreSearch: true}).then(hit => hit ||
      fetch(e.request).then(res => {
        if (res.ok && e.request.url.startsWith(self.location.origin)){
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match('./index.html'))
    )
  );
});
