const CACHE_PREFIX = "glow-letter-";
const CACHE = `${CACHE_PREFIX}v70`;
const CORE = [
  "./",
  "index.html",
  "fonts/local-fonts.css?v=70",
  "fonts/cormorant-normal-cyrillic-ext.woff2",
  "fonts/cormorant-normal-cyrillic.woff2",
  "fonts/cormorant-normal-latin-ext.woff2",
  "fonts/cormorant-normal-latin.woff2",
  "fonts/cormorant-italic-cyrillic-ext.woff2",
  "fonts/cormorant-italic-cyrillic.woff2",
  "fonts/cormorant-italic-latin-ext.woff2",
  "fonts/cormorant-italic-latin.woff2",
  "fonts/literata-normal-cyrillic-ext.woff2",
  "fonts/literata-normal-cyrillic.woff2",
  "fonts/literata-normal-latin-ext.woff2",
  "fonts/literata-normal-latin.woff2",
  "fonts/literata-italic-cyrillic-ext.woff2",
  "fonts/literata-italic-cyrillic.woff2",
  "fonts/literata-italic-latin-ext.woff2",
  "fonts/literata-italic-latin.woff2",
  "fonts/manrope-normal-cyrillic-ext.woff2",
  "fonts/manrope-normal-cyrillic.woff2",
  "fonts/manrope-normal-latin-ext.woff2",
  "fonts/manrope-normal-latin.woff2",
  "styles.css?v=70",
  "experience.css?v=70",
  "email-auth.css?v=70",
  "moments.css?v=70",
  "games.css?v=70",
  "config.js?v=70",
  "vendor/supabase-2.110.9.js?v=70",
  "vendor/qrcode-generator-1.4.4.min.js?v=70",
  "letters.js?v=70",
  "i18n-extra.js?v=70",
  "qr-code.js?v=70",
  "app.js?v=70",
  "email-auth.js?v=70",
  "moments.js?v=70",
  "experience.js?v=70",
  "games-i18n.js?v=70",
  "games.js?v=70",
  "friends.css?v=70",
  "friends-i18n.js?v=70",
  "friends.js?v=70",
  "voice.js?v=70",
  "manifest.webmanifest?v=70",
  "icon-192.png",
  "icon-512.png",
  "favicon-48.png",
  "apple-touch-icon.png",
  "privacy.html",
  "assets/auth/apple-continue-ru.png",
  "assets/auth/apple-continue-en.png",
  "assets/auth/apple-continue-fr.png",
  "assets/scenes/bears.webp",
  "assets/scenes/bears-thumb.webp",
  "assets/scenes/roses-thumb.webp",
  "assets/scenes/kitten-thumb.webp",
  "assets/frame-roses.webp",
  "assets/frame-roses-thumb.webp"
];
const CORE_FILES = new Set(["", "index.html", "local-fonts.css", "styles.css", "config.js", "supabase-2.110.9.js", "qrcode-generator-1.4.4.min.js", "letters.js", "i18n-extra.js", "qr-code.js", "app.js", "email-auth.js", "moments.js", "experience.js", "games-i18n.js", "games.js", "games.css", "friends-i18n.js", "friends.js", "friends.css", "voice.js", "experience.css", "email-auth.css", "moments.css", "manifest.webmanifest"]);
const SENSITIVE_NAVIGATION_PARAMS = ["beta", "access", "audio", "from", "to", "msg", "moment", "quiz", "yn", "code", "state", "error", "error_code", "error_description", "error_reason", "error_uri", "access_token", "refresh_token", "expires_in", "expires_at", "token_type", "provider_token", "provider_refresh_token"];

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
    return (await caches.match(request, { ignoreSearch: true })) || (await caches.match(fallback, { ignoreSearch: true }));
  }
}

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Byte-range requests (audio playback) must not land in the asset cache as
  // partial 206 responses.
  if (event.request.headers.has("range")) {
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
