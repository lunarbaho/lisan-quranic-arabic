import { h, clear, fmtInterval, arSpan } from '../util.js';
import { icon, star8 } from '../icons.js';
import { D, gloss, lemma, loadLemmas, loadSurah, cardKeyForLemma } from '../data.js';
import { S, dueKeys, unseenKeys, grade, card } from '../store.js';
import { preview } from '../srs.js';
import { topbar, audioAvailable, playUrl, wordAudio, noteHtml, quranWords } from '../ui.js';
import { exampleEl } from '../learnflow.js';

/** Data needed to show one card, for curated (v…) or Reader-added (l…) words. */
function cardInfo(key) {
  if (key[0] === 'v') {
    const v = D.vocab[+key.slice(1)];
    return v ? { v, ar: v.ar, ar2: v.ar2, root: v.r, ex: v.ex } : null;
  }
  const L = lemma(+key.slice(1));
  if (!L) return null;
  return { L, ar: L.ar, ar2: '', root: L.root, ex: null };
}

export async function render(root) {
  await loadLemmas().catch(() => {});
  const view = h('div', { class: 'view' });
  root.appendChild(view);
  const queue = [...unseenKeys(), ...dueKeys()];
  const total = queue.length;
  let done = 0, again = 0;
  const lang = S.settings.lang;

  view.appendChild(topbar('Review', { back: '#home', sub: total ? `${total} due` : 'Nothing due' }));
  const stage = h('div', { class: 'stack' });
  view.appendChild(stage);

  if (!total) {
    const nextDue = Object.values(S.cards).filter((c) => c.st !== 0).map((c) => c.due).sort((a, b) => a - b)[0];
    stage.appendChild(h('div', { class: 'empty' }, h('span', { html: star8() }), h('h2', {}, 'All caught up'),
      h('p', {}, nextDue ? `Next review ${fmtInterval(Math.max(0, (nextDue - Date.now()) / 86400000))} from now.` : 'Learn some words first — they appear here when it is time to review them.'),
      h('div', { class: 'row', style: { justifyContent: 'center' } }, h('a', { class: 'btn', href: '#words' }, 'Learn new words'), h('a', { class: 'btn ghost', href: '#practice' }, 'Practice'))));
    return;
  }

  let keys = null;
  const setKeys = (fn) => { if (keys) document.removeEventListener('keydown', keys); keys = fn; if (fn) document.addEventListener('keydown', fn); };

  function next() {
    clear(stage);
    if (!queue.length) { finish(); return; }
    const key = queue.shift();
    const info = cardInfo(key);
    if (!info) { next(); return; }
    const c = card(key);
    stage.appendChild(h('div', { class: 'row nowrap' }, h('div', { class: 'progress' }, h('span', { style: { width: `${(done / (done + queue.length + 1)) * 100}%` } })),
      h('span', { class: 'small muted tnum' }, `${queue.length + 1} left`)));
    const face = h('div', { class: 'card raised flash' },
      h('div', { class: 'ar-big q-text q-solo', lang: 'ar', dir: 'rtl' }, info.ar),
      info.ar2 ? h('div', { class: 'ar2', lang: 'ar' }, info.ar2) : null);
    let ctxBtn = null, ctxBox = null;
    if (info.ex) {
      ctxBtn = h('button', { class: 'btn quiet small', html: `${icon('eye')} Show in a verse` });
      ctxBtn.addEventListener('click', () => { ctxBox = exampleNoTranslation(info); ctxBtn.replaceWith(ctxBox); ctxBtn = null; });
      face.appendChild(ctxBtn);
    }
    stage.appendChild(face);
    const reveal = h('button', { class: 'btn block', html: `Show answer <span class="kbd">Space</span>` });
    stage.appendChild(reveal);
    reveal.focus({ preventScroll: true });
    const doReveal = () => {
      reveal.remove();
      // the back shows the verse with its translation, so drop the front's hint or bare verse
      ctxBtn?.remove();
      ctxBox?.remove();
      face.appendChild(h('hr', { class: 'divider', style: { width: '100%' } }));
      if (info.v) {
        const v = info.v;
        face.appendChild(h('div', { class: 'meaning' }, gloss(v, lang)));
        const others = ['en', 'tr', 'de'].filter((l) => l !== lang).map((l) => v[l]).filter(Boolean);
        if (others.length) face.appendChild(h('div', { class: 'others' }, others.join(' · ')));
        if (S.settings.cognates && v.cog) face.appendChild(h('div', { class: 'cognates', style: { justifyContent: 'center' } }, v.cog.split(',').map((x) => x.trim()).filter(Boolean).map((x) => h('span', { class: 'chip', lang: 'tr' }, x))));
        if (v.note) face.appendChild(h('p', { class: 'small', html: noteHtml(v.note) }));
      } else {
        face.appendChild(h('div', { class: 'meaning' }, (lang === 'tr' && info.L.tr) || info.L.en));
      }
      if (info.root) face.appendChild(h('div', { class: 'row', style: { justifyContent: 'center' } }, h('span', { class: 'label' }, 'root'), h('span', { class: 'root-letters', lang: 'ar' }, [...info.root].join(' '))));
      if (info.ex) face.appendChild(exampleEl(info.v));
      if (info.ex && audioAvailable()) {
        const ex = info.ex;
        const [s, a] = ex.ref.split(':').map(Number);
        face.appendChild(h('button', { class: 'btn quiet small', html: `${icon('volume')} Hear the word`, onclick: () => playUrl(wordAudio(s, a, ex.w + 1)) }));
      }
      const pv = preview(c || { st: 0, s: 0, d: 0, reps: 0, lapses: 0, last: 0, due: 0 });
      const grades = h('div', { class: 'grades', role: 'group', 'aria-label': 'How well did you know it?' });
      [[1, 'Again'], [2, 'Hard'], [3, 'Good'], [4, 'Easy']].forEach(([g, label]) => {
        grades.appendChild(h('button', { class: `grade g${g}`, onclick: () => rate(g) }, label, h('small', {}, fmtInterval(pv[g]), h('span', { class: 'keys-hint' }, ` · ${g}`))));
      });
      stage.appendChild(grades);
      stage.appendChild(h('p', { class: 'tiny muted', style: { textAlign: 'center' } }, 'Again = did not know · Hard = slow · Good = knew it · Easy = instant.', h('span', { class: 'keys-hint' }, ' Keys 1–4.')));
      setKeys((e) => { const g = +e.key; if (g >= 1 && g <= 4) rate(g); });
    };
    reveal.addEventListener('click', doReveal);
    setKeys((e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); doReveal(); } });

    function rate(g) {
      setKeys(null);
      const res = grade(key, g);
      done += 1;
      if (res.again) { again += 1; queue.splice(Math.min(queue.length, 3 + Math.floor(Math.random() * 3)), 0, key); }
      next();
    }
  }

  function exampleNoTranslation(info) {
    const ex = info.ex;
    return h('div', { class: 'ctx' }, quranWords(ex.ar, { highlight: ex.w, center: true }), h('div', { class: 't' }, `(${ex.ref})`));
  }

  function finish() {
    setKeys(null);
    stage.appendChild(h('div', { class: 'done-burst' }, h('span', { html: star8() }), h('h2', {}, 'Review complete'),
      h('p', { class: 'muted' }, `${done} answers · ${again ? `${again} words will come back soon` : 'every word remembered'}.`),
      h('div', { class: 'row', style: { justifyContent: 'center' } }, h('a', { class: 'btn', href: '#words' }, 'Learn new words'), h('a', { class: 'btn ghost', href: '#home' }, 'Home'))));
  }

  next();
  void arSpan; void loadSurah; void cardKeyForLemma;
  return () => setKeys(null);
}
