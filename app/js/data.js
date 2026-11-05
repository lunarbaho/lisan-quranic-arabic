// Loads the generated data files and answers questions about words.
import { bare } from './util.js';

const cache = new Map();

async function getJSON(path) {
  if (!cache.has(path)) {
    cache.set(path, fetch(path).then((r) => {
      if (!r.ok) throw new Error(`Could not load ${path} (${r.status})`);
      return r.json();
    }).catch((e) => { cache.delete(path); throw e; }));
  }
  return cache.get(path);
}

export const D = {
  vocab: [],          // curated course words
  surahs: [],
  lemmas: null,       // [ar, root, cls, stemCount, allCount, glossEN, glossTR, vocabId]
  totalWords: 77429,
  feats: null,
  surahLemmas: null,
  vocabByRank: new Map(),
  vocabByLemma: new Map(),
};

export async function loadCore() {
  const [vocab, surahs] = await Promise.all([getJSON('data/vocab.json'), getJSON('data/surahs.json')]);
  D.vocab = vocab;
  D.surahs = surahs;
  for (const v of vocab) {
    D.vocabByRank.set(v.rank, v);
    for (const l of v.l) D.vocabByLemma.set(l, v);
  }
}

export async function loadLemmas() {
  if (D.lemmas) return;
  const [lem, feats] = await Promise.all([getJSON('data/lemmas.json'), getJSON('data/feats.json')]);
  D.lemmas = lem.l;
  D.totalWords = lem.total;
  D.feats = feats;
}

export async function loadSurahLemmas() {
  if (!D.surahLemmas) D.surahLemmas = await getJSON('data/surah_lemmas.json');
  return D.surahLemmas;
}

export function loadSurah(n) {
  return getJSON(`data/quran/${String(n).padStart(3, '0')}.json`);
}

/** Resolve "2:255" → {s, a}. */
export function parseRef(ref) {
  const [s, a] = String(ref).split(':').map(Number);
  return { s, a };
}

export async function getVerse(ref) {
  const { s, a } = parseRef(ref);
  const data = await loadSurah(s);
  return data.v[a - 1] || null;
}

export function surahMeta(n) { return D.surahs[n - 1]; }

export function vocabById(id) { return D.vocab[id]; }

export function lemma(id) {
  if (!D.lemmas || id < 0) return null;
  const l = D.lemmas[id];
  if (!l) return null;
  return { id, ar: l[0], root: l[1], cls: l[2], stem: l[3], all: l[4], en: l[5], tr: l[6], vocab: l[7] };
}

export function gloss(v, lang) {
  if (!v) return '';
  return v[lang] || v.en;
}

/** Card key for a lemma: curated words use their vocab id, others the raw lemma. */
export function cardKeyForLemma(lemmaId) {
  const v = D.vocabByLemma.get(lemmaId);
  return v ? `v${v.id}` : `l${lemmaId}`;
}

/** Turkish words from the same root, gathered from the curated vocabulary. */
let cognateIndex = null;
export function rootCognates(root) {
  if (!root) return [];
  if (!cognateIndex) {
    cognateIndex = new Map();
    for (const v of D.vocab) {
      if (!v.r || !v.cog) continue;
      if (!cognateIndex.has(v.r)) cognateIndex.set(v.r, new Set());
      for (const c of v.cog.split(',').map((x) => x.trim()).filter(Boolean)) cognateIndex.get(v.r).add(c);
    }
  }
  return [...(cognateIndex.get(root) || [])];
}

let rootIndex = null;
/** root → {root, lemmas: [ids], count} sorted by frequency. Needs lemmas. */
export function roots() {
  if (rootIndex) return rootIndex;
  const map = new Map();
  D.lemmas.forEach((l, id) => {
    const r = l[1];
    if (!r) return;
    if (!map.has(r)) map.set(r, { root: r, lemmas: [], count: 0 });
    const e = map.get(r);
    e.lemmas.push(id);
    e.count += l[4];
  });
  rootIndex = [...map.values()].sort((a, b) => b.count - a.count);
  rootIndex.forEach((r, i) => { r.idx = i; r.lemmas.sort((a, b) => D.lemmas[b][4] - D.lemmas[a][4]); });
  return rootIndex;
}

export function findRoot(root) { return roots().find((r) => r.root === root) || null; }

/** Search lemmas/vocab by Arabic (diacritics ignored) or by meaning. */
export function searchWords(q, lang, limit = 40) {
  const s = q.trim();
  if (!s) return [];
  const out = [];
  const isAr = /[؀-ۿ]/.test(s);
  if (isAr) {
    const b = bare(s);
    D.lemmas.forEach((l, id) => {
      if (out.length >= limit * 3) return;
      if (bare(l[0]).includes(b) || (l[1] && l[1] === b)) out.push(id);
    });
    out.sort((a, b2) => D.lemmas[b2][4] - D.lemmas[a][4]);
    return out.slice(0, limit);
  }
  const low = s.toLowerCase();
  for (const v of D.vocab) {
    if ((v.en + ' ' + v.tr + ' ' + v.de + ' ' + v.cog).toLowerCase().includes(low)) out.push(v.l[0]);
    if (out.length >= limit) break;
  }
  if (out.length < limit) {
    D.lemmas.forEach((l, id) => {
      if (out.length >= limit) return;
      if (l[7] >= 0) return;
      if ((l[5] + ' ' + l[6]).toLowerCase().includes(low)) out.push(id);
    });
  }
  return out;
}
