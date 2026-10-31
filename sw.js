const CACHE_PREFIX = "glow-letter-";
const CACHE = `${CACHE_PREFIX}v118`;
const CORE = [
  "./",
  "index.html",
  "fonts/local-fonts.css?v=118",
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
  "styles.css?v=118",
  "experience.css?v=118",
  "email-auth.css?v=118",
  "moments.css?v=118",
  "games.css?v=118",
  "config.js?v=118",
  "vendor/supabase-2.110.9.js?v=118",
  "vendor/qrcode-generator-1.4.4.min.js?v=118",
  "letters.js?v=118",
  "i18n-extra.js?v=118",
  "qr-code.js?v=118",
  "app.js?v=118",
  "email-auth.js?v=118",
  "moments.js?v=118",
  "experience.js?v=118",
  "games-i18n.js?v=118",
  "games.js?v=118",
  "friends.css?v=118",
  "friends-i18n.js?v=118",
  "friends.js?v=118",
  "couple.css?v=118",
  "couple-i18n.js?v=118",
  "couple.js?v=118",
  "bear-reader.js?v=118",
  "online.js?v=118",
  "ultra.css?v=118",
  "table-board.css?v=118",
  "table-party.css?v=118",
  "table-group.css?v=118",
  "word.css?v=118",
  "ultra-i18n.js?v=118",
  "call.js?v=118",
  "table-i18n.js?v=118",
  "table.js?v=118",
  "table-content.js?v=118", "table-content-i18n.js?v=118",
  "table-board.js?v=118",
  "table-party.js?v=118",
  "table-group-content.js?v=118", "table-group-content-i18n.js?v=118",
  "table-group.js?v=118",
  "word-lists.js?v=118",
  "word-i18n.js?v=118",
  "word.js?v=118",
  "together.js?v=118",
  "voice.js?v=118",
  "manifest.webmanifest?v=118",
  "ranking.css?v=118",
  "ranking-i18n.js?v=118",
  "ranking.js?v=118",
  "guard.css?v=118", "guard.js?v=118",
  "admin.css?v=118", "admin.js?v=118",
  "durak.css?v=118", "shop.css?v=118", "durak-engine.js?v=118", "checkers-engine.js?v=118", "durak-cards.js?v=118", "durak-i18n.js?v=118", "durak.js?v=118", "shop.js?v=118",
  "icon-192.png",
  "icon-512.png",
  "favicon-48.png",
  "apple-touch-icon.png",
  "privacy.html",
  "assets/auth/apple-continue-ru.png",
  "assets/auth/apple-continue-en.png",
  "assets/auth/apple-continue-fr.png",
  "assets/scenes/cabin.webp",
  "assets/scenes/cabin-thumb.webp",
  "assets/scenes/bears.webp",
  "assets/scenes/bears-thumb.webp",
  "assets/scenes/roses-thumb.webp",
  "assets/scenes/kitten-thumb.webp",
  "assets/frame-roses.webp",
  "assets/frame-roses-thumb.webp"
];
const CORE_FILES = new Set(["", "index.html", "local-fonts.css", "styles.css", "config.js", "supabase-2.110.9.js", "qrcode-generator-1.4.4.min.js", "letters.js", "i18n-extra.js", "qr-code.js", "app.js", "email-auth.js", "moments.js", "experience.js", "games-i18n.js", "games.js", "games.css", "friends-i18n.js", "friends.js", "friends.css", "couple.css", "couple-i18n.js", "couple.js", "bear-reader.js", "online.js", "voice.js", "ultra.css", "table-board.css", "table-party.css", "word.css", "ultra-i18n.js", "call.js", "table-i18n.js", "table.js", "table-content.js", "table-content-i18n.js", "table-board.js", "table-party.js", "table-group-content.js", "table-group-content-i18n.js", "table-group.js", "table-group.css", "word-lists.js", "word-i18n.js", "word.js", "together.js", "ranking.css", "ranking-i18n.js", "ranking.js", "guard.css", "guard.js", "admin.css", "admin.js", "durak.css", "shop.css", "durak-engine.js", "checkers-engine.js", "durak-cards.js", "durak-i18n.js", "durak.js", "shop.js", "experience.css", "email-auth.css", "moments.css", "manifest.webmanifest"]);
const SENSITIVE_NAVIGATION_PARAMS = ["beta", "access", "audio", "from", "to", "msg", "moment", "quiz", "yn", "code", "state", "error", "error_code", "error_description", "error_reason", "error_uri", "access_token", "refresh_token", "expires_in", "expires_at", "token_type", "provider_token", "provider_refresh_token"];

// Файлы кладём по одному: addAll падал целиком, если на слабом интернете (iPhone, одна полоска LTE)
// не докачался хоть один из 12 МБ, — и телефон навсегда оставался на старой версии сайта.
// Не скачался файл сейчас — он придёт из сети при первом обращении.
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => Promise.allSettled(CORE.map(url => cache.add(url)))).then(() => self.skipWaiting()));
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
