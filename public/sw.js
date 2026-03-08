const CACHE_PREFIX = 'medibrief-';
// Auto-version: changes on each deploy since Vite injects new file hashes
const CACHE_VERSION = 'v' + Date.now().toString(36).slice(-6);
const CACHE_NAME = CACHE_PREFIX + CACHE_VERSION;

// Install: cache shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([
      '/',
      '/index.html',
      '/favicon.ico',
    ]))
  );
  self.skipWaiting();
});

// Activate: clean ALL old medibrief caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API, cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, chrome-extension, and OAuth redirect
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:' || url.pathname.startsWith('/~oauth')) {
    return;
  }

  // API/Supabase calls: network only
  if (url.hostname.includes('supabase') || url.pathname.startsWith('/rest/') || url.pathname.startsWith('/functions/')) {
    return;
  }

  // Scripts/styles: network-first to avoid stale chunk/runtime mismatches
  if (request.destination === 'script' || request.destination === 'style' || url.pathname.match(/\.(js|css)$/)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html')))
    );
    return;
  }

  // Images/fonts: cache-first
  if (request.destination === 'image' || request.destination === 'font' || url.pathname.match(/\.(png|jpg|jpeg|svg|webp|gif|woff2?|ttf|otf)$/)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // HTML navigation: network-first with cache fallback
  if (request.destination === 'document' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }
});
