// Lisan service worker: the app works offline after the first visit.
const VERSION = 'lisan-v2';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css', 'icons/icon.svg',
  'js/main.js', 'js/util.js', 'js/icons.js', 'js/data.js', 'js/store.js', 'js/srs.js', 'js/morph.js', 'js/ui.js',
  'js/teacher.js', 'js/learnflow.js',
  'js/content/kit.js', 'js/content/lessons.js', 'js/content/u1.js', 'js/content/u2.js', 'js/content/u3.js', 'js/content/u4.js', 'js/content/grammar.js',
  'js/views/home.js', 'js/views/learn.js', 'js/views/lesson.js', 'js/views/review.js', 'js/views/words.js', 'js/views/vocab.js',
  'js/views/practice.js', 'js/views/quran.js', 'js/views/reader.js', 'js/views/roots.js', 'js/views/grammar.js',
  'js/views/teacher.js', 'js/views/prefs.js', 'js/views/about.js', 'js/views/more.js',
  'data/vocab.json', 'data/surahs.json', 'data/lemmas.json', 'data/feats.json', 'data/surah_lemmas.json',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const fonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!sameOrigin && !fonts) return;            // audio and APIs go straight to the network
  e.respondWith(caches.open(VERSION).then(async (cache) => {
    const hit = await cache.match(req, { ignoreSearch: sameOrigin });
    const fresh = fetch(req).then((res) => {
      if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
      return res;
    }).catch(() => hit);
    return hit || fresh;                          // stale-while-revalidate
  }));
});
