const CACHE_PREFIX = "glow-letter-";
const CACHE = `${CACHE_PREFIX}v24`;
const CORE = [
  "./",
  "index.html",
  "styles.css?v=24",
  "experience.css?v=24",
  "config.js?v=24",
  "vendor/supabase-2.110.9.js?v=24",
  "vendor/qrcode-generator-1.4.4.min.js?v=24",
  "letters.js?v=24",
  "reply-engine.js?v=24",
  "qr-code.js?v=24",
  "app.js?v=24",
  "experience.js?v=24",
  "manifest.webmanifest?v=24",
  "icon.svg",
  "privacy.html",
  "assets/auth/apple-continue-ru.png",
  "assets/auth/apple-continue-en.png",
  "assets/auth/apple-continue-fr.png",
  "assets/campfire-lake.png",
  "assets/campfire-mobile.png"
];
const CORE_FILES = new Set(["", "index.html", "styles.css", "config.js", "supabase-2.110.9.js", "qrcode-generator-1.4.4.min.js", "letters.js", "reply-engine.js", "qr-code.js", "app.js", "experience.js", "experience.css", "manifest.webmanifest"]);
const SENSITIVE_NAVIGATION_PARAMS = ["beta", "access", "from", "to", "msg", "code", "state", "error", "error_code", "error_description", "error_reason", "error_uri", "access_token", "refresh_token", "expires_in", "expires_at", "token_type", "provider_token", "provider_refresh_token"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

async function networkFirst(request, fallback = request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") await cache.put(request, response.clone());
    return response;
  } catch {
    return (await caches.match(fallback, { ignoreSearch: true })) || (await caches.match(request, { ignoreSearch: true }));
  }
}

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Safari and Android WebView use byte ranges for MP4 playback. Do not put a
  // partial 206 response into the normal asset cache.
  if (event.request.destination === "video" || event.request.headers.has("range")) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (event.request.mode === "navigate") {
    if (SENSITIVE_NAVIGATION_PARAMS.some(parameter => url.searchParams.has(parameter))) {
      event.respondWith(fetch(event.request).catch(() => caches.match("index.html", { ignoreSearch: true })));
      return;
    }
    event.respondWith(networkFirst(event.request, "index.html"));
    return;
  }

  const file = url.pathname.split("/").pop();
  if (CORE_FILES.has(file)) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok && response.type === "basic") {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
    }
    return response;
  })));
});
