const CACHE_NAME = "mutaz-sa-cache-v5";

// الملفات الأساسية التي نحتاج تخزينها
const urlsToCache = [
  "/",
  "/index.html",
  "/favicon.webp",
  "/mutazsk.webp",
  "/manifest.json"
];

// تثبيت Service Worker وتخزين الملفات الأساسية
self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// تفعيل Service Worker وحذف أي كاش قديم
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log("Old cache deleted:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// استراتيجية الجلب
// صفحات HTML: يجلب من الإنترنت أولاً حتى تظهر التحديثات مباشرة
// الصور والملفات الأخرى: يقرأ من الكاش أولاً لتحسين السرعة
self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const isHTMLRequest =
    request.headers.get("accept") &&
    request.headers.get("accept").includes("text/html");

  if (isHTMLRequest) {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          return caches.match(request).then(cachedResponse => {
            return cachedResponse || caches.match("/index.html");
          });
        })
    );

    return;
  }

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          return caches.match("/index.html");
        });
    })
  );
});
