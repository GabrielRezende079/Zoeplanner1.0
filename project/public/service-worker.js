self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("zoeplanner-cache-v1").then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/favicon.svg",
        "/manifest.json",
        // Adicione outros arquivos essenciais aqui
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== "zoeplanner-cache-v1")
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
