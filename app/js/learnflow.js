// Shared "learn these words" flow: word cards, then a quiz that grades
// each word into the spaced-repetition schedule.
import { h, clear, shuffle, arSpan, screenKeys } from './util.js';
import { D, gloss } from './data.js';
import { S, introduce, grade, card } from './store.js';
import { icon } from './icons.js';
import { noteHtml, quranWords, revealFeedback } from './ui.js';

export function wordCard(v, { compact = false } = {}) {
  const lang = S.settings.lang;
  const others = ['en', 'tr', 'de'].filter((l) => l !== lang).map((l) => v[l]).filter(Boolean);
  const box = h('div', { class: 'card stack', style: { textAlign: 'center', justifyItems: 'center' } },
    h('div', { class: 'q-text q-solo', lang: 'ar', dir: 'rtl', style: { fontSize: compact ? 'calc(2rem * var(--ar-scale))' : 'calc(2.6rem * var(--ar-scale))' } }, v.ar),
    v.ar2 ? h('div', { class: 'ar muted', lang: 'ar' }, v.ar2) : null,
    h('div', { class: 'meaning', style: { fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 700 } }, gloss(v, lang)),
    others.length ? h('div', { class: 'small muted' }, others.join(' · ')) : null,
    v.r ? h('div', { class: 'row', style: { justifyContent: 'center' } }, h('span', { class: 'label' }, 'root'), h('span', { class: 'root-letters', lang: 'ar' }, [...v.r].join(' '))) : null,
    S.settings.cognates && v.cog ? h('div', { class: 'cognates', style: { justifyContent: 'center' } },
      v.cog.split(',').map((c) => c.trim()).filter(Boolean).map((c) => h('span', { class: 'chip', lang: 'tr' }, c))) : null,
    v.note && !compact ? h('p', { class: 'small', html: noteHtml(v.note) }) : null,
    v.ex && !compact ? exampleEl(v) : null,
    h('div', { class: 'tiny muted tnum' }, `${v.c.toLocaleString()}× in the Quran`));
  return box;
}

export function exampleEl(v) {
  const ex = v.ex;
  const words = quranWords(ex.ar, { highlight: ex.w, center: true });
  return h('a', { class: 'ctx', href: `#surah-${ex.ref.replace(':', '-')}`, style: { textDecoration: 'none', color: 'inherit' } },
    words, h('div', { class: 't' }, ex[S.settings.lang] || ex.en, ' ', h('b', {}, `(${ex.ref})`)));
}

/** Wrong options of the same part of speech and similar frequency; no two read alike. */
function distractors(v, n = 3) {
  const lang = S.settings.lang;
  const same = D.vocab.filter((x) => x.id !== v.id && x.p === v.p);
  const near = same.filter((x) => Math.abs(x.rank - v.rank) < 400);
  const seenG = new Set([gloss(v, lang)]), seenA = new Set([v.ar]);
  const out = [];
  for (const x of [...shuffle(near), ...shuffle(same)]) {
    if (out.length >= n) break;
    const g = gloss(x, lang);
    if (seenG.has(g) || seenA.has(x.ar)) continue;
    seenG.add(g); seenA.add(x.ar);
    out.push(x);
  }
  return out;
}

/**
 * Quiz each word until answered right once. First-try right → Good, else Again then Good.
 * Calls onDone({correct, total}).
 */
export function runWordQuiz(container, items, onDone, { title = 'Word check' } = {}) {
  const lang = S.settings.lang;
  const queue = shuffle(items.map((v) => ({ v, tries: 0 })));
  const total = items.length;
  let firstTry = 0;
  introduce(items.map((v) => `v${v.id}`));
  const setKeys = screenKeys(container);

  const next = () => {
    clear(container);
    if (!queue.length) { setKeys(null); onDone({ correct: firstTry, total }); return; }
    const item = queue.shift();
    const { v } = item;
    const reverse = item.tries === 0 && Math.random() < 0.25 && card(`v${v.id}`)?.reps > 0;
    const opts = shuffle([v, ...distractors(v)]);
    const done = total - queue.length - 1;
    container.appendChild(h('div', { class: 'row nowrap' }, h('div', { class: 'progress' }, h('span', { style: { width: `${(done / total) * 100}%` } })),
      h('span', { class: 'small muted tnum' }, `${done}/${total}`)));
    const wrap = h('div', { class: 'quiz' });
    wrap.appendChild(h('span', { class: 'label' }, title));
    if (reverse) {
      wrap.appendChild(h('p', { class: 'prompt' }, 'Which Arabic word means ', h('b', {}, `“${gloss(v, lang)}”`), '?'));
    } else {
      wrap.appendChild(h('div', { style: { textAlign: 'center' } }, h('div', { class: 'q-text q-solo', lang: 'ar', dir: 'rtl', style: { fontSize: 'calc(2.4rem * var(--ar-scale))' } }, v.ar)));
      wrap.appendChild(h('p', { class: 'prompt', style: { textAlign: 'center' } }, 'What does it mean?'));
    }
    const list = h('div', { class: 'options' });
    const fb = h('div');
    opts.forEach((o, i) => {
      const b = h('button', { class: `opt${reverse ? ' ar-opt' : ''}`, type: 'button' },
        h('span', { class: 'k' }, String(i + 1)), reverse ? arSpan(o.ar) : h('span', {}, gloss(o, lang)));
      b.addEventListener('click', () => answer(o, b));
      list.appendChild(b);
    });
    wrap.append(list, fb);
    container.appendChild(wrap);
    setKeys((e) => { const k = +e.key; if (k >= 1 && k <= opts.length) list.children[k - 1]?.click(); });

    function answer(o, b) {
      setKeys(null);
      [...list.children].forEach((x) => { x.disabled = true; });
      const right = o.id === v.id;
      const rightBtn = list.children[opts.indexOf(v)];
      rightBtn.classList.add('right');
      if (!right) b.classList.add('wrong');
      if (right && item.tries === 0) { firstTry += 1; grade(`v${v.id}`, 3); }
      else if (right) grade(`v${v.id}`, 3);
      else { grade(`v${v.id}`, 1); item.tries += 1; queue.splice(Math.min(queue.length, 2), 0, item); }
      const box = h('div', { class: `feedback ${right ? 'good' : 'bad'}` },
        h('b', {}, right ? 'Right' : 'Not quite'),
        h('span', {}, arSpan(v.ar), ` = ${gloss(v, lang)}`, v.cog && S.settings.cognates ? ` · Türkçe: ${v.cog}` : ''));
      clear(fb).appendChild(box);
      const go = h('button', { class: 'btn', html: `Continue ${icon('next')}`, onclick: next });
      fb.appendChild(h('div', { class: 'lesson-nav' }, go));
      revealFeedback(box);
      go.focus({ preventScroll: true });   // Enter / Space now continue
    }
  };
  next();
  return () => setKeys(null);
}
