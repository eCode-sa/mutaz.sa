const CACHE_NAME = "mutaz-sa-cache-v3"; // غير هذا الرقم (v3, v4..) في كل مرة تقوم فيها بتحديث الموقع

const urlsToCache = [
  "/",
  "/index.html",
  "/favicon.webp",
  "/mutazsk.webp",
  "/manifest.json"
];

// 1. تثبيت السيرفر ووركر وحفظ الملفات
self.addEventListener("install", event => {
  self.skipWaiting(); // إجبار المتصفح على التحديث فوراً
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// 2. تفعيل السيرفر ووركر وحذف الكاش القديم (هذا هو الحل السحري لمشكلتك)
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log("تم حذف الكاش القديم:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. جلب الملفات (يقرأ من الكاش الجديد، وإذا لم يجده يطلبه من الإنترنت)
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
