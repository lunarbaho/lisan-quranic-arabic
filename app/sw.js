// Lisan service worker: the app opens instantly and works offline.
//
// The code and core data of one release are cached together as a snapshot,
// so a page never mixes files from two releases (an ES module of a new release
// importing from one of the old would break the page). A new release is
// downloaded in full before it takes over; open pages switch to it at their
// next change of screen. Surah files are cached as they are read and kept
// across releases. Recitation audio streams from its own servers.
//
// VERSION is stamped with the commit by .github/workflows/pages.yml. Unstamped
// (local development) the worker prefers the network, so edits show at once.
const VERSION = 'lisan-dev';
const DEV = VERSION === 'lisan-dev';
const SHELL = `lisan-shell-${VERSION}`;
const DATA = 'lisan-data-v1';        // surah files — bump if their format ever changes
const FONTS = 'lisan-fonts-v1';
const LEGACY = ['lisan-v1', 'lisan-v2'];   // caches of the first worker, which served file by file

const FILES = [
  'index.html', 'manifest.webmanifest', 'css/app.css', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png',
  'js/main.js', 'js/util.js', 'js/icons.js', 'js/data.js', 'js/store.js', 'js/srs.js', 'js/morph.js', 'js/ui.js', 'js/audio.js',
  'js/teacher.js', 'js/learnflow.js',
  'js/content/kit.js', 'js/content/lessons.js', 'js/content/u1.js', 'js/content/u2.js', 'js/content/u3.js', 'js/content/u4.js', 'js/content/grammar.js',
  'js/views/home.js', 'js/views/learn.js', 'js/views/lesson.js', 'js/views/review.js', 'js/views/words.js', 'js/views/vocab.js',
  'js/views/practice.js', 'js/views/quran.js', 'js/views/reader.js', 'js/views/roots.js', 'js/views/grammar.js',
  'js/views/teacher.js', 'js/views/prefs.js', 'js/views/about.js', 'js/views/more.js',
  'data/vocab.json', 'data/surahs.json', 'data/lemmas.json', 'data/feats.json', 'data/surah_lemmas.json',
];

const SCOPE = new URL('./', self.location).href;
const rel = (url) => (url.startsWith(SCOPE) ? url.slice(SCOPE.length).split(/[?#]/)[0] : null);

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    // straight from the server, past the browser's HTTP cache: all files of one release
    await cache.addAll(FILES.map((f) => new Request(f, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    const fromLegacy = keys.some((k) => LEGACY.includes(k));
    await Promise.all(keys.filter((k) => k !== SHELL && k !== DATA && k !== FONTS).map((k) => caches.delete(k)));
    await self.clients.claim();
    // pages started by the first worker cannot switch over by themselves: reload them once
    if (fromLegacy) {
      for (const w of await self.clients.matchAll({ type: 'window' })) w.navigate(w.url).catch(() => {});
    }
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const path = rel(req.url);
  if (path !== null) {
    if (req.mode === 'navigate') {
      if (path === '' || path === 'index.html') e.respondWith(shell(req, 'index.html'));
      return;
    }
    if (/^data\/quran\/\d{3}\.json$/.test(path)) { e.respondWith(surahFile(req)); return; }
    e.respondWith(shell(req, path));
    return;
  }
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') e.respondWith(font(req));
  // everything else (recitation audio, the teacher) goes straight to the network
});

const offline = () => new Response('Offline', { status: 503, statusText: 'Offline', headers: { 'Content-Type': 'text/plain' } });

/** The release's own copy; in development the network first. */
async function shell(req, path) {
  const cache = await caches.open(SHELL);
  const key = new URL(path, SCOPE).href;
  if (DEV) {
    try {
      // a navigation request cannot be re-issued with options: ask for the page by its address
      const res = await fetch(req.mode === 'navigate' ? key : req, { cache: 'no-cache' });
      if (res.ok && FILES.includes(path)) cache.put(key, res.clone());
      return res;
    } catch {
      return (await cache.match(key)) || offline();
    }
  }
  const hit = await cache.match(key);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok && FILES.includes(path)) cache.put(key, res.clone());
    return res;
  } catch {
    return offline();
  }
}

/** Surah files: from the cache at once, refreshed in the background. */
async function surahFile(req) {
  const cache = await caches.open(DATA);
  const hit = await cache.match(req, { ignoreSearch: true });
  const fresh = fetch(req).then((res) => {
    if (res.ok) cache.put(req, res.clone());
    return res;
  });
  if (hit) { fresh.catch(() => {}); return hit; }
  try { return await fresh; } catch { return offline(); }
}

/** Fonts never change at a given address. */
async function font(req) {
  const cache = await caches.open(FONTS);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
    return res;
  } catch {
    return offline();
  }
}
