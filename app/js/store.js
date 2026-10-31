// Learner state: settings, lesson progress, SRS cards, daily log.
// Saved to localStorage; when the page runs as a claude.ai artifact with the
// `db` capability it is also synced to the learner's private store, so
// progress follows them between phone and computer.
import { safeStorage, debounce, dayKey, addDays } from './util.js';
import { newCard, schedule, isKnown, isMature } from './srs.js';
import { D } from './data.js';

const KEY = 'lisan.v1';
const ls = safeStorage();
const listeners = new Set();

function fresh() {
  return {
    v: 1,
    settings: { lang: 'en', cognates: true, dailyNew: 15, theme: 'auto', arScale: 1, gloss: true, transl: true,
      known: true, teacherLang: 'en', onboarded: false, updatedAt: 0 },
    lessons: {},
    cards: {},
    log: {},
    reader: { s: 1, a: 1, updatedAt: 0 },
    createdAt: Date.now(),
    updatedAt: 0,
  };
}

export const S = load();
export const sync = { status: 'local', detail: '' };

function load() {
  const base = fresh();
  try {
    const raw = ls && ls.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      return { ...base, ...s, settings: { ...base.settings, ...s.settings }, reader: { ...base.reader, ...s.reader } };
    }
  } catch { /* corrupted or blocked storage: start fresh */ }
  return base;
}

const saveLocal = debounce(() => {
  try { ls && ls.setItem(KEY, JSON.stringify(S)); } catch { /* storage full or blocked */ }
}, 400);

export function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function commit() {
  S.updatedAt = Date.now();
  saveLocal();
  pushRemote();
  for (const fn of listeners) fn();
}

export function setSetting(k, v) {
  S.settings[k] = v;
  S.settings.updatedAt = Date.now();
  commit();
}

// ---------------- daily log ----------------
export function today() {
  const k = dayKey();
  if (!S.log[k]) S.log[k] = { r: 0, c: 0, n: 0, l: 0, p: 0 };
  return S.log[k];
}

export function logEvent(field, n = 1) { today()[field] += n; }

export function streak() {
  let k = dayKey();
  const active = (d) => { const e = S.log[d]; return e && (e.r + e.n + e.l + e.p) > 0; };
  let n = 0;
  if (!active(k)) k = addDays(k, -1);       // today not done yet: count up to yesterday
  while (active(k)) { n += 1; k = addDays(k, -1); }
  return n;
}

// ---------------- lessons ----------------
export function lessonDone(id) { return !!S.lessons[id]?.done; }
export function completeLesson(id, score) {
  const prev = S.lessons[id];
  S.lessons[id] = { done: prev?.done || Date.now(), score: Math.max(prev?.score || 0, score) };
  logEvent('l');
  commit();
}

// ---------------- cards ----------------
export function card(key) { return S.cards[key]; }

/** Introduce words (create cards) without grading them yet. */
export function introduce(keys) {
  let added = 0;
  for (const k of keys) {
    if (!S.cards[k]) { S.cards[k] = newCard(); added += 1; }
  }
  if (added) { logEvent('n', added); commit(); }
  return added;
}

export function grade(key, g) {
  const c = S.cards[key] || newCard();
  const res = schedule(c, g);
  S.cards[key] = res.card;
  logEvent('r');
  if (g >= 3) logEvent('c');
  commit();
  return res;
}

export function removeCard(key) { delete S.cards[key]; commit(); }

export function dueKeys(now = Date.now()) {
  return Object.entries(S.cards)
    .filter(([, c]) => c.st !== 0 && c.due <= now)
    .sort((a, b) => a[1].due - b[1].due)
    .map(([k]) => k);
}

/** Cards that were introduced but never graded (e.g. interrupted session). */
export function unseenKeys() {
  return Object.entries(S.cards).filter(([, c]) => c.st === 0).map(([k]) => k);
}

export function newWordsLeftToday() {
  return Math.max(0, S.settings.dailyNew - today().n);
}

/** Next curated words not yet introduced, in frequency order. */
export function nextNewVocab(n) {
  const out = [];
  for (const v of D.vocab) {
    if (out.length >= n) break;
    if (!S.cards[`v${v.id}`]) out.push(v);
  }
  return out;
}

export function lemmaIdsForKey(key) {
  if (key[0] === 'v') return D.vocab[+key.slice(1)]?.l || [];
  return [+key.slice(1)];
}

/** Lemma ids the learner knows (graded at least once) / has mature. */
export function knownLemmas() {
  const known = new Set();
  const mature = new Set();
  for (const [k, c] of Object.entries(S.cards)) {
    if (!isKnown(c)) continue;
    for (const l of lemmaIdsForKey(k)) {
      known.add(l);
      if (isMature(c)) mature.add(l);
    }
  }
  return { known, mature };
}

/** Share of all words in the Quran whose core word the learner knows. */
export function coverage() {
  const { known, mature } = knownLemmas();
  let k = 0, m = 0;
  const counts = (id) => {
    if (D.lemmas) return D.lemmas[id]?.[3] || 0;
    const v = D.vocabByLemma.get(id);
    return v && v.l.length === 1 ? v.c : 0;
  };
  for (const id of known) k += counts(id);
  for (const id of mature) m += counts(id);
  return { known: k / D.totalWords, mature: m / D.totalWords, words: known.size };
}

export function wordStatus(lemmaId) {
  if (lemmaId < 0) return 'none';
  const v = D.vocabByLemma.get(lemmaId);
  const c = S.cards[v ? `v${v.id}` : `l${lemmaId}`];
  if (!c) return 'new';
  if (c.st === 0) return 'new';
  return isMature(c) ? 'known' : (c.st === 2 ? 'known' : 'learning');
}

// ---------------- backup ----------------
export function exportState() { return JSON.stringify(S); }

export function importState(text) {
  const incoming = JSON.parse(text);
  if (!incoming || typeof incoming !== 'object' || !incoming.cards) throw new Error('This is not a Lisan backup.');
  mergeInto(S, incoming);
  commit();
}

export function resetAll() {
  const f = fresh();
  for (const k of Object.keys(S)) delete S[k];
  Object.assign(S, f);
  S.updatedAt = Date.now();
  S.resetAt = Date.now();
  commit();
}

// ---------------- merge (two devices, one learner) ----------------
function mergeInto(a, b) {
  if ((b.resetAt || 0) > (a.updatedAt || 0)) {
    // the other copy was reset after our last change: adopt it
    for (const k of Object.keys(a)) delete a[k];
    Object.assign(a, structuredClone(b));
    return;
  }
  for (const [k, cb] of Object.entries(b.cards || {})) {
    const ca = a.cards[k];
    if (!ca || (cb.last || 0) > (ca.last || 0) || ((cb.last || 0) === (ca.last || 0) && cb.reps > ca.reps)) a.cards[k] = cb;
  }
  for (const [k, lb] of Object.entries(b.lessons || {})) {
    const la = a.lessons[k];
    if (!la) a.lessons[k] = lb;
    else a.lessons[k] = { done: Math.min(la.done || Infinity, lb.done || Infinity), score: Math.max(la.score || 0, lb.score || 0) };
  }
  for (const [d, eb] of Object.entries(b.log || {})) {
    const ea = a.log[d] || { r: 0, c: 0, n: 0, l: 0, p: 0 };
    a.log[d] = Object.fromEntries(['r', 'c', 'n', 'l', 'p'].map((f) => [f, Math.max(ea[f] || 0, eb[f] || 0)]));
  }
  if ((b.settings?.updatedAt || 0) > (a.settings?.updatedAt || 0)) a.settings = { ...a.settings, ...b.settings };
  if ((b.reader?.updatedAt || 0) > (a.reader?.updatedAt || 0)) a.reader = { ...b.reader };
  a.createdAt = Math.min(a.createdAt || Date.now(), b.createdAt || Date.now());
}

// ---------------- remote sync (claude.ai artifact `db`) ----------------
let remote = null;          // DocumentReference
let pushing = false, pendingPush = false;
const pushRemote = debounce(async () => {
  if (!remote) return;
  if (pushing) { pendingPush = true; return; }
  pushing = true;
  try {
    await remote.set({ state: JSON.stringify(S), at: Date.now() });
    sync.status = 'synced';
    sync.detail = '';
  } catch (e) {
    sync.status = 'error';
    sync.detail = e?.code || 'unavailable';
  } finally {
    pushing = false;
    if (pendingPush) { pendingPush = false; pushRemote(); }
  }
}, 3000);

export async function connectRemote() {
  if (!window.claude || typeof window.claude.use !== 'function') return false;
  try {
    const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
    if (!db || !user) return false;
    const uid = await user.id();
    if (!uid) return false;
    const ref = db.doc(`data/users/${uid}/progress`);
    sync.status = 'connecting';
    const snap = await ref.get();
    if (snap.exists) {
      const body = snap.data();
      const other = JSON.parse(body.state || '{}');
      if (other && other.cards) mergeInto(S, other);
    }
    remote = ref;
    sync.status = 'synced';
    commit();
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') pushRemote.flush(); });
    return true;
  } catch (e) {
    sync.status = 'error';
    sync.detail = e?.code || 'unavailable';
    return false;
  }
}
