// Shared components: verses, the word sheet, quotes, confirmations, audio.
import { h, clear, arSpan, rootLetters, toast, quranWord, dayKey } from './util.js';
import { D, loadSurah, loadLemmas, lemma, surahMeta, cardKeyForLemma, rootCognates, findRoot } from './data.js';
import { S, wordStatus, introduce, card, commit, removeCard, restoreCard, lemmaIdsForKey } from './store.js';
import { describeSegment, summarizeWord } from './morph.js';
import { icon } from './icons.js';
import { audioAvailable, toggleVerse, playWord, stopAll, onAudio, audioState, isCurrent, RECITERS, verseAudio, wordAudio } from './audio.js';

export const env = {
  artifact: !!(window.claude && typeof window.claude.use === 'function'),
  teacher: null,      // set by teacher.js when the `sample` capability is available
};

// ---------------- audio ----------------
// The player itself lives in audio.js; these names stay for the views.
export const reciters = RECITERS;
export const stopAudio = stopAll;
export { audioAvailable, verseAudio, wordAudio };

/**
 * Play / pause button of one verse; its look follows the player.
 * mode 'remember' starts the way the learner last chose in the player.
 */
function verseButton(s, a, mode) {
  const b = h('button', { class: 'icon-btn verse-play', type: 'button', dataset: { ref: `${s}:${a}` } });
  b.addEventListener('click', () => toggleVerse(s, a, { mode: mode === 'remember' ? S.settings.playMode : mode }));
  paintVerseButton(b);
  return b;
}
function paintVerseButton(b) {
  const [s, a] = b.dataset.ref.split(':').map(Number);
  const cur = isCurrent(s, a);
  const status = audioState().status;
  const playing = cur && status !== 'paused';
  const look = cur ? status : 'idle';
  if (b.dataset.look === look) return;          // a long surah has hundreds of these
  b.dataset.look = look;
  b.innerHTML = icon(playing ? 'pause' : 'play');
  b.classList.toggle('on', cur);
  b.classList.toggle('busy', cur && status === 'loading');
  const label = playing ? `Pause verse ${a}` : cur ? `Resume verse ${a}` : `Play verse ${a}`;
  b.setAttribute('aria-label', label);
  b.title = label;
}
/** Mark the verse (or basmala) being recited, wherever it is on the page. */
function syncAudio(st) {
  const key = st.status === 'idle' ? '' : `${st.s}:${st.a}`;
  for (const x of document.querySelectorAll('[data-play].playing')) if (x.dataset.play !== key) x.classList.remove('playing', 'paused');
  if (key) for (const x of document.querySelectorAll(`[data-play="${key}"]`)) { x.classList.add('playing'); x.classList.toggle('paused', st.status === 'paused'); }
  document.querySelectorAll('.verse-play').forEach(paintVerseButton);
}
onAudio(syncAudio);
/** Give an element created while its verse plays the right marks from the start. */
export function markPlaying(node, s, a) {
  node.dataset.play = `${s}:${a}`;
  if (isCurrent(s, a)) { node.classList.add('playing'); node.classList.toggle('paused', audioState().status === 'paused'); }
  return node;
}

// ---------------- verse rendering ----------------
function stemLemma(word) { const seg = word[4][word[3]] || word[4][0]; return seg ? seg[2] : -1; }

export function wordButton(word, { s, a, w, gloss, onTap, highlight } = {}) {
  const lid = stemLemma(word);
  const st = wordStatus(lid);
  const cls = ['qw', st === 'known' ? 'known' : st === 'learning' ? 'learning' : '', highlight ? 'hl-target' : ''].filter(Boolean).join(' ');
  const g = gloss ? (S.settings.lang === 'tr' && word[2] ? word[2] : word[1]) : '';
  const b = h('button', { class: cls, type: 'button', lang: 'ar', 'aria-label': `${word[0]} — ${word[1]}`, dataset: lid >= 0 ? { l: String(lid) } : null },
    h('span', { class: 'qt' }, quranWord(word[0])), g ? h('span', { class: 'g', lang: S.settings.lang === 'tr' ? 'tr' : 'en' }, g) : null);
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

/**
 * Quran words shown as text (example verses, the verse of the day): the same
 * word boxes as the Reader, without meanings and not tappable.
 * `cls(i)` may add a class per word (known / learning).
 */
export function quranWords(words, { highlight = -1, cls = null, center = false } = {}) {
  return h('div', { class: 'verse-words', style: center ? { justifyContent: 'center' } : null },
    words.map((w, i) => h('span', { class: ['qw', i === highlight ? 'hl-target' : '', cls ? cls(i) : ''].filter(Boolean).join(' '), lang: 'ar' },
      h('span', { class: 'qt' }, quranWord(w)))));
}

/** A verse: tappable words, optional glosses and translation. */
export function verseEl(verse, s, { gloss = S.settings.gloss, transl = S.settings.transl, from = 0, to = null, highlightW = -1, head = true, onAsk, playMode = 'once' } = {}) {
  const words = verse.w.slice(from, to ?? verse.w.length);
  const whole = from === 0 && (to === null || to >= verse.w.length);
  const box = h('div', { class: 'verse', id: `v${s}-${verse.a}` });
  if (whole) markPlaying(box, s, verse.a);
  if (head) {
    const playBtn = audioAvailable() ? verseButton(s, verse.a, playMode) : null;
    const askBtn = env.teacher ? h('button', { class: 'icon-btn', title: 'Ask the teacher about this verse', 'aria-label': 'Ask the teacher about this verse', html: icon('teacher'),
      onclick: () => (onAsk ? onAsk(verse) : askTeacherAbout({ kind: 'verse', s, a: verse.a })) }) : null;
    box.appendChild(h('div', { class: 'verse-head' }, h('span', { class: 'ref' }, `${s}:${verse.a}`), h('span', { class: 'grow' }), playBtn, askBtn));
  }
  const wrap = h('div', { class: 'verse-words' });
  words.forEach((word, i) => wrap.appendChild(wordButton(word, { s, a: verse.a, w: from + i + 1, gloss, highlight: from + i === highlightW })));
  if (to === null || to >= verse.w.length) wrap.appendChild(h('span', { class: 'aya-num', lang: 'ar', 'aria-hidden': 'true' }, `﴿${arNum(verse.a)}﴾`));
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
      n.textContent = words.map((w) => quranWord(w[0])).join(' ');
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
  const { scrim, sheet, opener } = sheetEls;
  scrim.classList.remove('open'); sheet.classList.remove('open');
  document.querySelectorAll('.qw.sel').forEach((x) => x.classList.remove('sel'));
  setTimeout(() => { scrim.remove(); sheet.remove(); }, 220);
  sheetEls = null;
  document.removeEventListener('keydown', escClose);
  // back to where the reader was: the word or button that opened the sheet
  if (opener && opener.isConnected && sheet.contains(document.activeElement)) opener.focus({ preventScroll: true });
}
function escClose(e) { if (e.key === 'Escape') closeSheet(); }

export function openSheet(content, label = 'Details') {
  const opener = sheetEls ? sheetEls.opener : document.activeElement;
  closeSheet();
  const scrim = h('div', { class: 'scrim', onclick: closeSheet });
  const sheet = h('aside', { class: 'sheet', role: 'dialog', 'aria-label': label, 'aria-modal': 'true' },
    h('div', { class: 'grab' }),
    h('div', { class: 'row nowrap' }, h('span', { class: 'label grow' }, label),
      h('button', { class: 'icon-btn', 'aria-label': 'Close', html: icon('close'), onclick: closeSheet })),
    content);
  document.body.append(scrim, sheet);
  requestAnimationFrame(() => { scrim.classList.add('open'); sheet.classList.add('open'); });
  sheetEls = { scrim, sheet, opener };
  document.addEventListener('keydown', escClose);
  sheet.querySelector('.icon-btn')?.focus({ preventScroll: true });
}

export async function openWordSheet({ word, s, a, w }) {
  try { await loadLemmas(); } catch { toast('Could not load the word details (offline?)'); return; }
  const segs = word[4];
  const lid = stemLemma(word);
  const L = lemma(lid);
  const v = L && L.vocab >= 0 ? D.vocab[L.vocab] : null;
  const lang = S.settings.lang;
  const content = h('div', { class: 'stack' });

  const ctxGloss = lang === 'tr' && word[2] ? word[2] : word[1];
  const headRow = h('div', { class: 'row nowrap' },
    h('div', { class: 'grow stack-s' },
      h('div', { class: 'q-text q-solo', lang: 'ar', dir: 'rtl', style: { fontSize: 'calc(2.4rem * var(--ar-scale))', textAlign: 'right' } }, quranWord(word[0])),
      h('div', { class: 'small muted' }, `in this verse: “${ctxGloss}”`)),
    audioAvailable() ? h('button', { class: 'icon-btn word-audio', type: 'button', title: 'Hear this word', 'aria-label': 'Hear this word', html: icon('volume'),
      onclick: (e) => playWord(s, a, w, e.currentTarget) }) : null);
  content.appendChild(headRow);

  // add / remove right under the word, where the thumb is
  if (L) {
    const key = cardKeyForLemma(lid);
    const actions = h('div', { class: 'row' }, deckControl(key, { variant: 'full' }));
    if (env.teacher) actions.append(h('button', { class: 'btn small ghost', type: 'button', html: `${icon('teacher')} Ask the teacher`, onclick: () => {
      closeSheet(); askTeacherAbout({ kind: 'word', s, a, w });
    } }));
    content.appendChild(actions);
  }

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
      const r = findRoot(L.root);
      const rb = r
        ? h('a', { href: `#root-${r.idx}`, class: 'root-letters', lang: 'ar', style: { textDecoration: 'none' }, title: 'All words from this root', onclick: closeSheet }, rootLetters(L.root))
        : h('span', { class: 'root-letters', lang: 'ar' }, rootLetters(L.root));
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
  }
  openSheet(content, `${surahMeta(s).name} ${s}:${a} · word ${w}`);
}

// ---------------- adding words to the deck ----------------
/** Quran words on the page that belong to this card get their known / learning colour again. */
function recolorWords(key) {
  for (const l of lemmaIdsForKey(key)) {
    const st = wordStatus(l);
    for (const b of document.querySelectorAll(`.qw[data-l="${l}"]`)) {
      b.classList.toggle('known', st === 'known');
      b.classList.toggle('learning', st === 'learning');
    }
  }
}

/**
 * Add a word to the review deck, or take it out again, right where it is shown.
 * A word added a moment ago is removed with one tap (nothing is lost); a word
 * with review history asks first. Every change can be undone from the toast.
 * variant 'chip' fits list rows, 'full' the word sheet.
 */
export function deckControl(key, { variant = 'chip', onChange = null } = {}) {
  const box = h('span', { class: `deck deck-${variant}` });
  let revert = 0;
  const changed = () => { paint(); recolorWords(key); if (onChange) onChange(); };
  const add = () => {
    introduce([key]);
    changed();
    toast('Added to your words — it comes up in Review.', { action: 'Undo', onAction: () => { removeCard(key); changed(); } });
  };
  const remove = () => {
    const old = removeCard(key);
    changed();
    if (old) toast('Removed from your words.', { action: 'Undo', onAction: () => { restoreCard(key, old); changed(); } });
  };
  const askRemove = () => {
    clearTimeout(revert);
    clear(box);
    const keep = h('button', { class: variant === 'chip' ? 'chip' : 'btn small ghost', type: 'button', onclick: paint }, 'Keep');
    if (variant === 'full') box.append(h('span', { class: 'small' }, 'Remove it and its review history?'));
    box.append(h('button', { class: variant === 'chip' ? 'chip coral' : 'btn small coral', type: 'button', onclick: remove }, 'Remove'), keep);
    keep.focus({ preventScroll: true });
    revert = setTimeout(() => { if (box.isConnected) paint(); }, 6000);
  };
  function paint() {
    clearTimeout(revert);
    clear(box);
    const c = card(key);
    if (!c) {
      box.append(h('button', { class: variant === 'chip' ? 'chip cobalt deck-btn' : 'btn small', type: 'button', 'aria-pressed': 'false',
        title: 'Add to my words', html: `${icon('plus')}<span>${variant === 'chip' ? 'Add' : 'Add to my words'}</span>`, onclick: add }));
      return;
    }
    const fresh = !c.reps;
    const known = c.st === 2;
    const label = fresh ? 'Added' : known ? 'Known' : 'Learning';
    if (variant === 'chip') {
      box.append(h('button', { class: `chip ${fresh ? 'gold' : known ? 'leaf' : 'gold'} deck-btn`, type: 'button', 'aria-pressed': 'true',
        title: fresh ? 'In your words — tap to undo' : 'In your review deck — tap to remove', 'aria-label': `${label} — ${fresh ? 'tap to undo' : 'tap to remove'}`,
        html: `${icon('check')}<span>${label}</span>`, onclick: fresh ? remove : askRemove }));
      return;
    }
    const when = fresh ? 'comes up in your next review' : `next review ${fmtWhen(c.due)}`;
    box.append(h('span', { class: `chip ${fresh ? 'gold' : 'leaf'}`, html: `${icon('check')}<span>${fresh ? 'Added' : 'In your review deck'} · ${when}</span>` }),
      h('button', { class: 'btn small ghost', type: 'button', html: fresh ? `${icon('undo')} Undo` : 'Remove', onclick: fresh ? remove : askRemove }));
  }
  paint();
  return box;
}

function fmtWhen(due) {
  const d = (due - Date.now()) / 86400000;
  if (d <= 0) return 'now';
  if (dayKey(new Date(due)) === dayKey()) return 'today';
  if (d < 2 && dayKey(new Date(due)) === dayKey(new Date(Date.now() + 86400000))) return 'tomorrow';
  return `in ${Math.round(d)} days`;
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

/** After an answer, bring its explanation into view above the sticky Continue bar. */
export function revealFeedback(el) {
  const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  requestAnimationFrame(() => el.scrollIntoView({ block: 'nearest', behavior: smooth ? 'smooth' : 'auto' }));
}

export function loadingEl(text = 'Loading…') {
  return h('div', { class: 'loading' }, h('div', { class: 'spinner' }), h('span', {}, text));
}

export function persistReader(s, a) { S.reader = { s, a, updatedAt: Date.now() }; commit(); }
