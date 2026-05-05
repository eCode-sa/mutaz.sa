const CACHE_NAME = "mutaz-sa-cache-v1";

const urlsToCache = [
  "/",
  "/index.html",
  "/favicon.webp",
  "/mutazsk.webp",
  "/manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
