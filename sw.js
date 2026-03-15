const CACHE_NAME = "dwx-dev-v1";
const ASSETS = [
  "index.html",
  "manifest.json",
  "assets/css/style.css",
  "assets/js/script.js",
  "assets/images/logo.svg",
  "project.html",
  "mobile.html",
  "admin.html",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((res) => {
          if (!res || res.status !== 200 || res.type !== "basic") return res;
          const cloned = res.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, cloned));
          return res;
        })
        .catch(() => caches.match("index.html"));
    }),
  );
});
