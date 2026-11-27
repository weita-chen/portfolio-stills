/* WEITA PWA service worker.
 * Network-first for navigations (offline fallback only).
 * Cache-first for hashed /assets/* and self-hosted fonts.
 * Never caches Mux streams or non-GET requests. HTML is not stored.
 */
const VERSION = "v1";
const STATIC_CACHE = `weita-static-${VERSION}`;
const OFFLINE_CACHE = `weita-offline-${VERSION}`;
const OFFLINE_URL = "/offline.html";
const PRECACHE = [OFFLINE_URL, "/favicon.svg", "/icons/icon-192.png"];

function isMuxHost(hostname) {
  return hostname === "stream.mux.com" || hostname === "image.mux.com" || hostname.endsWith(".mux.com");
}

function isStaticAsset(pathname) {
  return (
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/fonts/") ||
    pathname.startsWith("/film/fonts/") ||
    pathname.startsWith("/icons/") ||
    pathname === "/favicon.svg" ||
    pathname === "/favicon.ico"
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(OFFLINE_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("weita-") && !key.endsWith(`-${VERSION}`))
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (isMuxHost(url.hostname)) return;
  if (url.origin !== self.location.origin) return;

  const isNavigate = request.mode === "navigate" || request.destination === "document";
  if (isNavigate) {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch {
          const cache = await caches.open(OFFLINE_CACHE);
          const fallback = await cache.match(OFFLINE_URL);
          return fallback || Response.error();
        }
      })(),
    );
    return;
  }

  if (!isStaticAsset(url.pathname)) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      const hit = await cache.match(request);
      if (hit) return hit;
      const response = await fetch(request);
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })(),
  );
});
