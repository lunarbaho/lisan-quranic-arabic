// Shared components: verses, the word sheet, quotes, confirmations, audio.
import { h, clear, arSpan, rootLetters, toast } from './util.js';
import { D, loadSurah, loadLemmas, lemma, surahMeta, cardKeyForLemma, rootCognates, findRoot } from './data.js';
import { S, wordStatus, introduce, card, commit } from './store.js';
import { describeSegment, summarizeWord } from './morph.js';
import { icon } from './icons.js';

export const env = {
  artifact: !!(window.claude && typeof window.claude.use === 'function'),
  teacher: null,      // set by teacher.js when the `sample` capability is available
};

// ---------------- audio ----------------
const RECITERS = {
  alafasy: ['Mishary Alafasy', 'Alafasy_128kbps'],
  husary: ['Mahmoud Khalil al-Husary', 'Husary_128kbps'],
  minshawi: ['Muhammad al-Minshawi', 'Minshawy_Murattal_128kbps'],
  basit: ['Abdul Basit (murattal)', 'Abdul_Basit_Murattal_192kbps'],
};
export const reciters = RECITERS;
let player = null;
export function audioAvailable() { return !env.artifact; }

export function playUrl(url, onEnd) {
  if (!audioAvailable()) { toast('Audio plays when the app is opened from its own website.'); return null; }
  if (player) { player.pause(); player.onended = null; }
  player = new Audio(url);
  player.onended = () => onEnd && onEnd();
  player.play().catch(() => toast('Could not play audio (offline?)'));
  return player;
}
export function stopAudio() { if (player) { player.pause(); player.onended = null; player = null; } }
const pad3 = (n) => String(n).padStart(3, '0');
export const wordAudio = (s, a, w) => `https://audio.qurancdn.com/wbw/${pad3(s)}_${pad3(a)}_${pad3(w)}.mp3`;
export const verseAudio = (s, a) => `https://everyayah.com/data/${(RECITERS[S.settings.reciter] || RECITERS.alafasy)[1]}/${pad3(s)}${pad3(a)}.mp3`;

// ---------------- verse rendering ----------------
function stemLemma(word) { const seg = word[4][word[3]] || word[4][0]; return seg ? seg[2] : -1; }

export function wordButton(word, { s, a, w, gloss, onTap, highlight } = {}) {
  const lid = stemLemma(word);
  const st = wordStatus(lid);
  const cls = ['qw', st === 'known' ? 'known' : st === 'learning' ? 'learning' : '', highlight ? 'hl-target' : ''].filter(Boolean).join(' ');
  const g = gloss ? (S.settings.lang === 'tr' && word[2] ? word[2] : word[1]) : '';
  const b = h('button', { class: cls, type: 'button', lang: 'ar', 'aria-label': `${word[0]} — ${word[1]}` },
    h('span', { class: 'qt' }, word[0]), g ? h('span', { class: 'g', lang: S.settings.lang === 'tr' ? 'tr' : 'en' }, g) : null);
  b.addEventListener('click', () => {
    document.querySelectorAll('.qw.sel').forEach((x) => x.classList.remove('sel'));
    b.classList.add('sel');
    if (onTap) onTap(word, w);
    else openWordSheet({ word, s, a, w });
  });
  return b;
}

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
export const arNum = (n) => String(n).replace(/\d/g, (d) => AR_DIGITS[d]);

/** A verse: tappable words, optional glosses and translation. */
export function verseEl(verse, s, { gloss = S.settings.gloss, transl = S.settings.transl, from = 0, to = null, highlightW = -1, head = true, onAsk } = {}) {
  const words = verse.w.slice(from, to ?? verse.w.length);
  const box = h('div', { class: 'verse', id: `v${s}-${verse.a}` });
  if (head) {
    const playBtn = audioAvailable() ? h('button', { class: 'icon-btn', title: 'Play recitation', html: icon('play'),
      onclick: () => playUrl(verseAudio(s, verse.a)) }) : null;
    const askBtn = env.teacher ? h('button', { class: 'icon-btn', title: 'Ask the teacher about this verse', html: icon('teacher'),
      onclick: () => (onAsk ? onAsk(verse) : askTeacherAbout({ kind: 'verse', s, a: verse.a })) }) : null;
    box.appendChild(h('div', { class: 'verse-head' }, h('span', { class: 'ref' }, `${s}:${verse.a}`), h('span', { class: 'grow' }), playBtn, askBtn));
  }
  const wrap = h('div', { class: 'verse-words' });
  words.forEach((word, i) => wrap.appendChild(wordButton(word, { s, a: verse.a, w: from + i + 1, gloss, highlight: from + i === highlightW })));
  if (to === null || to >= verse.w.length) wrap.appendChild(h('span', { class: 'aya-num', 'aria-hidden': 'true' }, `﴿${arNum(verse.a)}﴾`));
  box.appendChild(wrap);
  if (transl) {
    const t = verse[S.settings.lang] || verse.en;
    if (t) box.appendChild(h('p', { class: 'verse-tr', lang: S.settings.lang }, t));
  }
  return box;
}

/**
 * Fill every `.qref` placeholder inside `root` with real Quran text.
 * <span class="qref" data-ref="2:255"></span>              whole verse (block)
 * <span class="qref" data-ref="1:2" data-w="2-3"></span>   words 2–3 inline
 */
export async function hydrateQuotes(root) {
  const nodes = [...root.querySelectorAll('.qref:not([data-done])')];
  if (!nodes.length) return;
  await loadLemmas().catch(() => {});
  await Promise.all(nodes.map(async (n) => {
    n.dataset.done = '1';
    const [s, a] = n.dataset.ref.split(':').map(Number);
    let data;
    try { data = await loadSurah(s); } catch { n.textContent = `(${n.dataset.ref})`; return; }
    const verse = data.v[a - 1];
    if (!verse) return;
    if (n.dataset.w) {
      const [x, y] = n.dataset.w.split('-').map(Number);
      const words = verse.w.slice(x - 1, y || x);
      clear(n);
      n.classList.add('q-inline');
      n.setAttribute('lang', 'ar'); n.setAttribute('dir', 'rtl');
      n.textContent = words.map((w) => w[0]).join(' ');
      n.title = `${s}:${a}`;
      return;
    }
    const meta = surahMeta(s);
    const block = h('div', { class: 'q-block' },
      verseEl(verse, s, { head: false, gloss: n.dataset.gloss !== 'off', transl: n.dataset.tr !== 'off' }),
      h('div', { class: 'src' }, `${meta.name} ${s}:${a}`));
    n.replaceWith(block);
  }));
}

// ---------------- the word sheet ----------------
let sheetEls = null;
export function closeSheet() {
  if (!sheetEls) return;
  const { scrim, sheet } = sheetEls;
  scrim.classList.remove('open'); sheet.classList.remove('open');
  document.querySelectorAll('.qw.sel').forEach((x) => x.classList.remove('sel'));
  setTimeout(() => { scrim.remove(); sheet.remove(); }, 220);
  sheetEls = null;
  document.removeEventListener('keydown', escClose);
}
function escClose(e) { if (e.key === 'Escape') closeSheet(); }

export function openSheet(content, label = 'Details') {
  closeSheet();
  const scrim = h('div', { class: 'scrim', onclick: closeSheet });
  const sheet = h('aside', { class: 'sheet', role: 'dialog', 'aria-label': label, 'aria-modal': 'true' },
    h('div', { class: 'grab' }),
    h('div', { class: 'row nowrap' }, h('span', { class: 'label grow' }, label),
      h('button', { class: 'icon-btn', 'aria-label': 'Close', html: icon('close'), onclick: closeSheet })),
    content);
  document.body.append(scrim, sheet);
  requestAnimationFrame(() => { scrim.classList.add('open'); sheet.classList.add('open'); });
  sheetEls = { scrim, sheet };
  document.addEventListener('keydown', escClose);
  sheet.querySelector('.icon-btn')?.focus({ preventScroll: true });
}

export async function openWordSheet({ word, s, a, w }) {
  await loadLemmas();
  const segs = word[4];
  const lid = stemLemma(word);
  const L = lemma(lid);
  const v = L && L.vocab >= 0 ? D.vocab[L.vocab] : null;
  const lang = S.settings.lang;
  const content = h('div', { class: 'stack' });

  const ctxGloss = lang === 'tr' && word[2] ? word[2] : word[1];
  const headRow = h('div', { class: 'row nowrap' },
    h('div', { class: 'grow stack-s' },
      h('div', { class: 'q-text', lang: 'ar', dir: 'rtl', style: { fontSize: 'calc(2.4rem * var(--ar-scale))', lineHeight: '1.7', textAlign: 'right' } }, word[0]),
      h('div', { class: 'small muted' }, `in this verse: “${ctxGloss}”`)),
    audioAvailable() ? h('button', { class: 'icon-btn', title: 'Hear this word', html: icon('volume'), onclick: () => playUrl(wordAudio(s, a, w)) }) : null);
  content.appendChild(headRow);

  // morphology breakdown
  const brk = h('div', { class: 'seg-break' });
  segs.forEach((sg, i) => {
    const d = describeSegment(sg, segs, i);
    brk.appendChild(h('div', { class: `sg ${d.role}` }, h('span', { class: 'ar', lang: 'ar' }, sg[0]), h('span', { class: 'r' }, d.title)));
  });
  content.appendChild(h('div', { class: 'stack-s' }, h('span', { class: 'label' }, 'Parts of the word'), brk,
    h('p', { class: 'small' }, summarizeWord(word))));
  const stemDesc = describeSegment(segs[word[3]] || segs[0], segs, word[3]);
  if (stemDesc.terms.length) {
    content.appendChild(h('div', { class: 'row' }, ...stemDesc.terms.filter(Boolean).map((t, i) =>
      h('span', { class: `chip ${i === 0 ? 'turq' : 'coral'}`, lang: i === 0 ? 'ar' : 'tr' }, t))));
  }

  if (L) {
    const dl = h('dl', { class: 'kv' });
    dl.append(h('dt', {}, 'Dictionary form'), h('dd', {}, arSpan(v ? v.ar : L.ar), v && v.ar2 ? h('span', { class: 'muted' }, ' · ', arSpan(v.ar2)) : null));
    dl.append(h('dt', {}, 'Meaning'), h('dd', {}, v ? (v[lang] || v.en) : (lang === 'tr' && L.tr ? L.tr : L.en)));
    if (v && lang !== 'en') dl.append(h('dt', {}, 'English'), h('dd', {}, v.en));
    if (v && lang !== 'tr') dl.append(h('dt', {}, 'Türkçe'), h('dd', { lang: 'tr' }, v.tr));
    if (v && lang !== 'de') dl.append(h('dt', {}, 'Deutsch'), h('dd', { lang: 'de' }, v.de));
    if (L.root) {
      const rb = h('a', { href: `#root-${findRoot(L.root)?.idx ?? 0}`, class: 'root-letters', style: { textDecoration: 'none' }, onclick: closeSheet }, rootLetters(L.root));
      dl.append(h('dt', {}, 'Root'), h('dd', {}, rb));
    }
    dl.append(h('dt', {}, 'In the Quran'), h('dd', { class: 'tnum' }, `${L.all.toLocaleString()} times`));
    content.appendChild(dl);
    const cog = v && v.cog ? v.cog.split(',').map((x) => x.trim()).filter(Boolean) : rootCognates(L.root).slice(0, 8);
    if (S.settings.cognates && cog.length) {
      content.appendChild(h('div', { class: 'stack-s' }, h('span', { class: 'label' }, v && v.cog ? 'Turkish words from this root' : 'Turkish words from the same root'),
        h('div', { class: 'cognates' }, cog.map((c) => h('span', { class: 'chip', lang: 'tr' }, c)))));
    }
    if (v && v.note) content.appendChild(h('div', { class: 'callout' }, h('span', { class: 'label' }, 'Note'), h('p', { html: noteHtml(v.note) })));

    const key = cardKeyForLemma(lid);
    const c = card(key);
    const status = h('div', { class: 'row' });
    const paint = () => {
      clear(status);
      const cc = card(key);
      if (cc && cc.st !== 0) status.append(h('span', { class: 'chip leaf', html: `${icon('check')} In your review deck` }));
      else if (cc) status.append(h('span', { class: 'chip gold' }, 'Waiting for its first review'));
      else status.append(h('button', { class: 'btn small', html: `${icon('plus')} Add to my words`, onclick: () => {
        introduce([key]);
        toast('Added — it will appear in your next review.');
        paint();
      } }));
      if (env.teacher) status.append(h('button', { class: 'btn small ghost', html: `${icon('teacher')} Ask the teacher`, onclick: () => {
        closeSheet(); askTeacherAbout({ kind: 'word', s, a, w });
      } }));
    };
    paint();
    content.appendChild(status);
    void c;
  }
  openSheet(content, `${surahMeta(s).name} ${s}:${a} · word ${w}`);
}

/** Render a note string, wrapping Arabic runs so they display right-to-left. */
export function noteHtml(text) {
  return String(text).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
    .replace(/([؀-ۿ][؀-ۿݐ-ݿ\sً-ٰٟـ]*[؀-ۿً-ٰٟ])/g, '<span class="ar" lang="ar" dir="rtl">$1</span>');
}

// ---------------- teacher hand-off ----------------
export function askTeacherAbout(ctx) {
  sessionStorageSafeSet('lisan.ask', JSON.stringify(ctx));
  location.hash = '#teacher';
}
function sessionStorageSafeSet(k, v) { try { sessionStorage.setItem(k, v); } catch { window.__lisanAsk = v; } }
export function takeTeacherContext() {
  let v = null;
  try { v = sessionStorage.getItem('lisan.ask'); sessionStorage.removeItem('lisan.ask'); } catch { v = window.__lisanAsk; }
  window.__lisanAsk = null;
  return v ? JSON.parse(v) : null;
}

// ---------------- small builders ----------------
export function topbar(title, { back, sub, right } = {}) {
  return h('header', { class: 'topbar' },
    back ? h('a', { class: 'icon-btn', href: back, 'aria-label': 'Back', html: icon('back') }) : null,
    h('div', { class: 'grow' }, h('h1', {}, title), sub ? h('div', { class: 'sub' }, sub) : null),
    right || null);
}

export function inlineConfirm(container, message, yesLabel, onYes) {
  const box = h('div', { class: 'confirm' }, h('p', {}, message),
    h('div', { class: 'row' },
      h('button', { class: 'btn coral small', onclick: () => { box.remove(); onYes(); } }, yesLabel),
      h('button', { class: 'btn ghost small', onclick: () => box.remove() }, 'Cancel')));
  container.appendChild(box);
  return box;
}

export function loadingEl(text = 'Loading…') {
  return h('div', { class: 'loading' }, h('div', { class: 'spinner' }), h('span', {}, text));
}

export function persistReader(s, a) { S.reader = { s, a, updatedAt: Date.now() }; commit(); }
