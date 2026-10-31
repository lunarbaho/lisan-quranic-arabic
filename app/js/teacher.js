// The AI teacher ("Hoca"): available when Lisan runs as a claude.ai artifact
// with the `sample` capability. Every call is started by the learner.
import { env } from './ui.js';
import { D, loadLemmas, loadSurah, lemma, surahMeta, findRoot } from './data.js';
import { S, coverage } from './store.js';
import { describeSegment } from './morph.js';
import { rootLetters } from './util.js';
import { LESSONS } from './content/lessons.js';

export async function initTeacher() {
  if (!env.artifact) return false;
  try {
    const sample = await window.claude.use('sample');
    if (!sample) return false;
    let limits = null;
    try { limits = await sample.limits(); } catch { limits = null; }
    env.teacher = { sample, tools: !!(limits && limits.tools) };
    return true;
  } catch {
    return false;
  }
}

const LANG_NAME = { en: 'English', tr: 'Turkish (Türkçe)', de: 'German (Deutsch)' };

export function instructions() {
  const done = LESSONS.filter((l) => S.lessons[l.id]?.done).map((l) => l.title);
  const next = LESSONS.find((l) => !S.lessons[l.id]?.done);
  const cov = coverage();
  return `You are "Hoca", a warm and precise Quranic Arabic teacher inside the Lisan app.

The learner: a Muslim, native Turkish speaker living in Germany, fluent in Turkish, German and English. They already read Arabic script with harakat and learn languages quickly. Their goal is to understand the Quran directly in Arabic, as fast as possible.

How to teach:
- Answer in ${LANG_NAME[S.settings.teacherLang] || 'English'}. Write every Arabic word with full harakat in Arabic script; do not transliterate unless asked.
- Be concise and structured: short paragraphs, small tables or bullet lists. Go deeper only when asked.
- Name grammar with the Arabic term plus the Turkish (Ottoman-tradition) term the learner may know, e.g. mubtadaʾ (mübtedâ), khabar (haber), fāʿil (fâil), mafʿūl bih (mef'ûlün bih), iḍāfa (izâfet), ḥāl (hâl).
- When it helps memory, point out Turkish words from the same Arabic root (e.g. قَلْب → kalp, inkılap; جَمَعَ → cami, cuma, cemaat).
- Quranic text: quote only verses that appear in this conversation or that you fetched with the get_verse tool, and always give the reference (surah:verse). Never present your own wording as Quran.
- Interpretation (tafsir): give the mainstream understanding briefly, cite the classical source when you can (al-Ṭabarī, Ibn Kathīr, al-Qurṭubī) or Diyanet's "Kur'an Yolu", and mention real differences of opinion respectfully. For fiqh rulings, give an overview and advise asking a qualified scholar.
- Build on what the learner knows. When it fits, finish with one short exercise or question.

Learner progress: ${done.length} of ${LESSONS.length} lessons done${done.length ? ` (latest: ${done[done.length - 1]})` : ''}; next lesson: ${next ? next.title : 'course complete'}. Knows ${cov.words} words, which cover ${(cov.known * 100).toFixed(0)}% of the Quran's words.`;
}

/** Plain-text dump of a verse with word-by-word morphology for the prompt. */
export async function verseContext(s, a) {
  await loadLemmas();
  const data = await loadSurah(s);
  const v = data.v[a - 1];
  if (!v) throw new Error(`Verse ${s}:${a} does not exist.`);
  const words = v.w.map((w, i) => {
    const segs = w[4];
    const stem = segs[w[3]] || segs[0];
    const L = lemma(stem[2]);
    const parts = segs.map((sg, j) => `${sg[0]}=${describeSegment(sg, segs, j).title}`).join(' + ');
    return `${i + 1}. ${w[0]} — "${w[1]}" | ${parts}${L ? ` | lemma ${L.ar}${L.root ? `, root ${rootLetters(L.root)}` : ''}` : ''}`;
  }).join('\n');
  const meta = surahMeta(s);
  return `Quran ${s}:${a} (Surah ${meta.name}, ${meta.ar})
Arabic: ${v.w.map((w) => w[0]).join(' ')}
Word by word:
${words}
Translation (Saheeh International): ${v.en}
Türkçe (Diyanet): ${v.tr}
Deutsch (Bubenheim & Elyas): ${v.de}`;
}

export function teacherTools() {
  if (!env.teacher?.tools) return undefined;
  return [
    {
      name: 'get_verse',
      description: 'Fetch the exact Uthmani Arabic text of one Quran verse with word-by-word glosses, morphology and three translations. Use it before quoting any verse.',
      inputSchema: { type: 'object', properties: { ref: { type: 'string', description: 'surah:verse, e.g. "2:255"' } }, required: ['ref'] },
      async execute(input) {
        const [s, a] = String(input.ref || '').split(':').map(Number);
        if (!(s >= 1 && s <= 114) || !(a >= 1)) throw new Error('Use the form "surah:verse", e.g. "2:255".');
        return await verseContext(s, a);
      },
    },
    {
      name: 'lookup_root',
      description: 'List the words of an Arabic root as they occur in the Quran, with how often each appears and a short meaning. Input the three root letters, e.g. "علم".',
      inputSchema: { type: 'object', properties: { root: { type: 'string' } }, required: ['root'] },
      async execute(input) {
        await loadLemmas();
        const r = String(input.root || '').replace(/[\sً-ٟ]/g, '');
        const entry = findRoot(r);
        if (!entry) throw new Error(`No root ${r} found in the Quran.`);
        return entry.lemmas.slice(0, 25).map((id) => {
          const L = lemma(id);
          const v = L.vocab >= 0 ? D.vocab[L.vocab] : null;
          return `${v ? v.ar : L.ar} (${L.all}×): ${v ? v.en : L.en}`;
        }).join('\n');
      },
    },
  ];
}
