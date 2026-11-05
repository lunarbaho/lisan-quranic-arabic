// Recitation: the one place that plays audio.
//
// A verse session plays one verse of a surah and then, depending on its mode,
// stops ('once'), goes on verse by verse to the end of the surah ('continue'),
// or loops the verse ('repeat'). It can be paused and resumed where it was,
// skipped forward and back, and stopped. Word clips play on their own element
// and pause a running verse, so it can be resumed afterwards.
//
// Views never touch <audio>: they call these functions and subscribe with
// onAudio() to show which verse is playing.
import { toast } from './util.js';
import { S, setSetting } from './store.js';
import { surahMeta } from './data.js';

// [name, EveryAyah folder, Quran.com recitation id (word timings of the same recordings)]
export const RECITERS = {
  alafasy: ['Mishary Alafasy', 'Alafasy_128kbps', 7],
  husary: ['Mahmoud Khalil al-Husary', 'Husary_128kbps', 6],
  minshawi: ['Muhammad al-Minshawi', 'Minshawy_Murattal_128kbps', 9],
  basit: ['Abdul Basit (murattal)', 'Abdul_Basit_Murattal_192kbps', 2],
};

// inside a claude.ai artifact the page may not load media from other sites
const ARTIFACT = !!(window.claude && typeof window.claude.use === 'function');
export function audioAvailable() { return !ARTIFACT && typeof Audio === 'function'; }

const pad3 = (n) => String(n).padStart(3, '0');
export const reciter = () => RECITERS[S.settings.reciter] || RECITERS.alafasy;
/** Every surah but al-Fātiḥa (whose first verse it is) and at-Tawba opens with the basmala. */
export const hasBasmala = (s) => s !== 1 && s !== 9;
/** Verse audio; verse 0 is the basmala that opens a surah, recited as 1:1. */
export const verseAudio = (s, a) => a === 0
  ? `https://everyayah.com/data/${reciter()[1]}/001001.mp3`
  : `https://everyayah.com/data/${reciter()[1]}/${pad3(s)}${pad3(a)}.mp3`;
export const wordAudio = (s, a, w) => `https://audio.qurancdn.com/wbw/${pad3(s)}_${pad3(a)}_${pad3(w)}.mp3`;

export const MODES = {
  once: { label: 'This verse', hint: 'Plays this verse, then stops' },
  continue: { label: 'Continue', hint: 'Goes on to the next verses' },
  repeat: { label: 'Repeat', hint: 'Repeats this verse until you stop it' },
};

/**
 * status: idle | loading | playing | paused
 * s, a:   the surah and verse (a = 0 is the basmala); last = the surah's last verse
 * mode:   once | continue | repeat
 */
const state = { status: 'idle', s: 0, a: 0, last: 0, mode: 'once' };
const listeners = new Set();

export function audioState() { return state; }
export function onAudio(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export const isActive = () => state.status !== 'idle';
export const isCurrent = (s, a) => state.status !== 'idle' && state.s === s && state.a === a;

function set(patch) {
  Object.assign(state, patch);
  for (const fn of [...listeners]) {
    try { fn(state); } catch (e) { console.error(e); }
  }
  updateMediaSession();
}

// ---------------- the verse element ----------------
// One element is reused for every verse: mobile browsers unlock media per
// element on the first tap, so a reused element can go on to the next verse
// by itself.
let el = null;
let switching = false;        // a new verse is being loaded: its pause/abort events are ours
let stale = false;            // the loaded recording is out of date (reciter changed, load failed)
let current = { key: '', blob: '' };  // what el holds; blob is an object URL we must revoke
let ahead = null;             // { key, ctrl, blob } — the next verse, fetched while this one plays
let triedNetwork = false;     // a prefetched copy failed: retry once from the network

const keyOf = (s, a) => `${reciter()[1]}/${s}/${a}`;

function player() {
  if (el) return el;
  el = new Audio();
  el.preload = 'auto';
  el.addEventListener('playing', () => {
    switching = false;
    if (state.status === 'idle') return;
    set({ status: 'playing' });
    prefetchNext();
    follow();
  });
  el.addEventListener('waiting', () => { if (state.status === 'playing') set({ status: 'loading' }); });
  // paused by the system (another app took the audio, headphones unplugged)
  el.addEventListener('pause', () => {
    if (switching || el.ended || state.status === 'idle' || state.status === 'paused') return;
    set({ status: 'paused' });
  });
  el.addEventListener('ended', onEnded);
  el.addEventListener('error', onError);
  return el;
}

function onEnded() {
  if (state.status === 'idle') return;
  emitWord(0);
  if (state.mode === 'repeat') { el.currentTime = 0; start(); return; }
  if (state.mode === 'continue' && state.a < state.last) { load(state.s, state.a + 1); return; }
  stop();
}

function onError() {
  if (state.status === 'idle' || !el.getAttribute('src')) return;
  switching = false;
  if (current.blob && !triedNetwork) {          // the prefetched copy did not decode: fetch it normally
    triedNetwork = true;
    load(state.s, state.a, { network: true });
    return;
  }
  stale = true;
  set({ status: 'paused' });
  toast(navigator.onLine === false ? 'You are offline — recitation needs a connection.' : 'Could not load the recitation. Tap play to try again.');
}

function start() {
  const p = el.play();
  if (p && p.catch) {
    p.catch((err) => {
      if (err && err.name === 'AbortError') return;           // replaced by a newer verse
      switching = false;
      if (state.status === 'idle') return;
      set({ status: 'paused' });
      if (err && err.name === 'NotAllowedError') toast('Tap play to start the recitation.');
    });
  }
}

function load(s, a, { network = false } = {}) {
  const p = player();
  const key = keyOf(s, a);
  let src = verseAudio(s, a);
  let blob = '';
  if (!network && ahead && ahead.key === key && ahead.blob) { src = blob = ahead.blob; ahead = null; }
  else dropAhead();
  if (!network) triedNetwork = false;
  if (current.blob && current.blob !== blob) URL.revokeObjectURL(current.blob);
  current = { key, blob };
  stale = false;
  switching = true;
  set({ s, a, status: 'loading' });
  loadTimings(s, a);
  p.src = src;
  start();
}

// ---------------- following the words ----------------
// Quran.com publishes when each word starts and ends in these same recordings
// (checked: the files are identical, or the same recording). While a verse
// plays, the word being recited is announced to onWord() listeners.
const timingCache = new Map();   // "id/s" → Promise<Map(verse → [[word, from ms, to ms], …]) | null>
let segs = null;                 // timings of the verse playing now
let wordPos = 0;                 // the word being recited, 1-based; 0 = none
let raf = 0;
const wordListeners = new Set();
export function onWord(fn) { wordListeners.add(fn); return () => wordListeners.delete(fn); }
export const currentWord = () => wordPos;

function emitWord(pos) {
  if (pos === wordPos) return;
  wordPos = pos;
  for (const fn of [...wordListeners]) {
    try { fn(state.s, state.a, pos); } catch (e) { console.error(e); }
  }
}

function surahTimings(s) {
  const id = reciter()[2];
  if (!id || S.settings.followWords === false) return Promise.resolve(null);
  const k = `${id}/${s}`;
  if (!timingCache.has(k)) {
    timingCache.set(k, (async () => {
      const out = new Map();
      for (let page = 1; page <= 10; page++) {
        const r = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${s}?audio=${id}&per_page=50&page=${page}&words=false`, { credentials: 'omit' });
        if (!r.ok) throw new Error(String(r.status));
        const d = await r.json();
        for (const v of d.verses || []) {
          const a = +String(v.verse_key || '').split(':')[1];
          const list = ((v.audio && v.audio.segments) || []).filter((x) => Array.isArray(x) && x.length >= 4).map((x) => [x[1], x[2], x[3]]);
          if (a && list.length) out.set(a, list);
        }
        if (!d.pagination || !d.pagination.next_page) break;
      }
      return out;
    })().catch(() => { timingCache.delete(k); return null; }));
  }
  return timingCache.get(k);
}

function loadTimings(s, a) {
  segs = null;
  emitWord(0);
  if (a === 0) return;                         // the basmala line is not split into words
  surahTimings(s).then((map) => {
    if (!map || state.s !== s || state.a !== a) return;
    segs = map.get(a) || null;
    follow();
  });
}

function track() {
  raf = 0;
  if (state.status !== 'playing' || !segs || !el) return;
  const t = el.currentTime * 1000;
  let pos = 0;
  for (const [w, from, to] of segs) {
    if (t < from) break;
    pos = w;                                   // between two words the last one stays lit
    if (t < to) break;
  }
  if (pos) emitWord(pos);
  raf = requestAnimationFrame(track);
}
function follow() { if (!raf && segs && state.status === 'playing') raf = requestAnimationFrame(track); }

// ---------------- prefetch: the next verse is ready when this one ends ----------------
function dropAhead() {
  if (!ahead) return;
  ahead.ctrl.abort();
  if (ahead.blob) URL.revokeObjectURL(ahead.blob);
  ahead = null;
}

function prefetchNext() {
  if (state.mode !== 'continue' || state.a >= state.last) return;
  if (navigator.connection && navigator.connection.saveData) return;
  const key = keyOf(state.s, state.a + 1);
  if (ahead && ahead.key === key) return;
  dropAhead();
  const entry = { key, ctrl: new AbortController(), blob: '' };
  ahead = entry;
  fetch(verseAudio(state.s, state.a + 1), { signal: entry.ctrl.signal, credentials: 'omit' })
    .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.blob(); })
    .then((b) => {
      if (ahead !== entry) return;
      entry.blob = URL.createObjectURL(b);
    })
    .catch(() => { if (ahead === entry) ahead = null; });
}

// ---------------- public controls ----------------
function unavailable() {
  toast('Recitation plays when Lisan is opened from its own website.');
}

/** Start a verse. mode 'continue' from verse 1 starts with the basmala. */
export function playVerse(s, a, { mode = 'once' } = {}) {
  if (!audioAvailable()) { unavailable(); return; }
  stopWord();
  const meta = surahMeta(s);
  const last = meta ? meta.verses : a;
  const first = mode === 'continue' && a === 1 && hasBasmala(s) ? 0 : a;
  Object.assign(state, { mode, last });   // announced together with the verse by load()
  load(s, first);
}

/**
 * The play button of one verse: play it, or pause / resume it when it is the
 * current one. `mode` is how a new session starts (the Reader passes the
 * learner's choice; a lesson, showing one verse, plays just that verse).
 */
export function toggleVerse(s, a, { mode = 'once' } = {}) {
  if (isCurrent(s, a)) { if (state.status === 'paused') resume(); else pause(); return; }
  // inside a running session of this surah, jump there and keep its mode
  if (isActive() && state.s === s) { stopWord(); load(s, a); return; }
  playVerse(s, a, { mode: MODES[mode] ? mode : 'once' });
}

/** The surah's play button: start from the top, or pause / resume what is playing in it. */
export function toggleSurah(s) {
  if (isActive() && state.s === s) { if (state.status === 'paused') resume(); else pause(); return; }
  playVerse(s, 1, { mode: 'continue' });
}

export function pause() {
  if (state.status !== 'playing' && state.status !== 'loading') return;
  switching = false;
  if (el) el.pause();
  set({ status: 'paused' });
}

export function resume() {
  if (state.status !== 'paused') return;
  stopWord();
  if (stale || !el || !el.getAttribute('src')) { load(state.s, state.a); return; }
  set({ status: el.readyState >= 3 ? 'playing' : 'loading' });
  start();
}

export function togglePause() { if (state.status === 'paused') resume(); else pause(); }

export function stop() {
  switching = false;
  dropAhead();
  if (el) {
    el.pause();
    el.removeAttribute('src');
    el.load();                       // drops the download as well
  }
  if (current.blob) URL.revokeObjectURL(current.blob);
  current = { key: '', blob: '' };
  stale = false;
  segs = null;
  emitWord(0);
  if (state.status !== 'idle') set({ status: 'idle', s: 0, a: 0, last: 0, mode: 'once' });
}

export function next() {
  if (!isActive() || state.a >= state.last) return;
  load(state.s, state.a + 1);
}

export function prev() {
  if (!isActive()) return;
  // a few seconds in, "back" restarts the verse — like any music player
  if (el && el.currentTime > 3 && state.status !== 'loading') { el.currentTime = 0; emitWord(0); if (state.status === 'paused') resume(); return; }
  if (state.a > 1) load(state.s, state.a - 1);
  else if (el) { el.currentTime = 0; emitWord(0); if (state.status === 'paused') resume(); }
}

/** Change how the current session goes on; remembered for the next verse you tap. */
export function setMode(mode) {
  if (!MODES[mode] || mode === state.mode) return;
  if (S.settings.playMode !== mode) setSetting('playMode', mode);
  set({ mode });
  if (mode === 'continue' && state.status === 'playing') prefetchNext();
  else if (mode !== 'continue') dropAhead();
}

/** The reciter setting changed: the current verse is reloaded in the new voice. */
export function reciterChanged() {
  dropAhead();
  if (!isActive()) return;
  if (state.status === 'paused') { stale = true; updateMediaSession(); return; }
  load(state.s, state.a);
}

// ---------------- single words ----------------
let wordEl = null;
let wordBtn = null;

function stopWord() {
  if (wordEl) wordEl.pause();
  if (wordBtn) { wordBtn.classList.remove('sounding'); wordBtn = null; }
}

/** Play one word of a verse. A running verse is paused and can be resumed. */
export function playWord(s, a, w, button = null) {
  if (!audioAvailable()) { unavailable(); return; }
  pause();
  stopWord();
  if (!wordEl) {
    wordEl = new Audio();
    const done = () => { if (wordBtn) { wordBtn.classList.remove('sounding'); wordBtn = null; } };
    wordEl.addEventListener('ended', done);
    wordEl.addEventListener('error', () => { done(); toast('Could not play this word (offline?)'); });
  }
  wordBtn = button;
  if (button) button.classList.add('sounding');
  wordEl.src = wordAudio(s, a, w);
  const p = wordEl.play();
  if (p && p.catch) p.catch((err) => { if (err && err.name !== 'AbortError' && wordBtn === button) stopWord(); });
}

/** Silence everything (leaving a screen). */
export function stopAll() { stopWord(); stop(); }

// ---------------- lock screen and headphone controls ----------------
let mediaActions = false;
function updateMediaSession() {
  const ms = navigator.mediaSession;
  if (!ms) return;
  try {
    if (!mediaActions) {
      mediaActions = true;
      const actions = { play: resume, pause, stop, previoustrack: prev, nexttrack: next };
      for (const [k, fn] of Object.entries(actions)) { try { ms.setActionHandler(k, () => fn()); } catch { /* unsupported action */ } }
    }
    if (state.status === 'idle') { ms.playbackState = 'none'; ms.metadata = null; return; }
    const meta = surahMeta(state.s);
    const title = state.a === 0 ? `${meta.name} · Bismillah` : `${meta.name} ${state.s}:${state.a}`;
    const artist = reciter()[0];
    if (typeof MediaMetadata === 'function' && (!ms.metadata || ms.metadata.title !== title || ms.metadata.artist !== artist)) {
      ms.metadata = new MediaMetadata({ title, artist, album: 'Lisan · Quran', artwork: [{ src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }] });
    }
    ms.playbackState = state.status === 'paused' ? 'paused' : 'playing';
  } catch { /* media session is optional */ }
}
