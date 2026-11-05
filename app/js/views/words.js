import { h, clear, pct, screenKeys } from '../util.js';
import { icon, star8 } from '../icons.js';
import { loadLemmas, surahMeta } from '../data.js';
import { S, nextNewVocab, newWordsLeftToday, coverage } from '../store.js';
import { topbar } from '../ui.js';
import { wordCard, runWordQuiz, surahNewWords } from '../learnflow.js';

const BATCH = 10;

export async function render(root, arg = '') {
  await loadLemmas().catch(() => {});
  const view = h('div', { class: 'view' });
  root.appendChild(view);
  // #words-surah-67: the words of one surah, to prepare reading it
  const sm = /^surah-(\d+)$/.exec(arg || '');
  const s = sm ? Math.min(114, Math.max(1, +sm[1])) : 0;
  const meta = s ? surahMeta(s) : null;
  const left = newWordsLeftToday();
  let batch, pending = 0;
  if (s) {
    const all = await surahNewWords(s).catch(() => []);
    batch = all.slice(0, BATCH);
    pending = all.length - batch.length;
    view.appendChild(topbar(`Words of ${meta.name}`, { back: `#surah-${s}`,
      sub: all.length ? `${all.length} core word${all.length === 1 ? '' : 's'} of this surah to learn` : 'You have all its core words' }));
  } else {
    batch = nextNewVocab(left > 0 ? Math.min(BATCH, left) : 5);
    view.appendChild(topbar('New words', { back: '#home', sub: left > 0 ? `${left} left in today's goal` : 'Daily goal reached — extra words are welcome' }));
  }
  const stage = h('div', { class: 'stack' });
  view.appendChild(stage);
  if (!batch.length) {
    stage.appendChild(s
      ? h('div', { class: 'empty' }, h('span', { html: star8() }), h('h2', {}, `You know every core word of ${meta.name}`),
        h('p', {}, 'Rarer words: tap them in the Reader and add them there.'), h('a', { class: 'btn', href: `#surah-${s}` }, `Read ${meta.name}`))
      : h('div', { class: 'empty' }, h('span', { html: star8() }), h('h2', {}, 'Every core word is in your deck'),
        h('p', {}, 'Add rarer words from the Reader with “Add to my words”.')));
    return;
  }
  const covBefore = coverage().known;
  let i = 0;
  const setKeys = screenKeys(stage);
  let stopQuiz = null;

  function show() {
    clear(stage);
    if (i >= batch.length) { quiz(); return; }
    const v = batch[i];
    stage.appendChild(h('div', { class: 'row nowrap' }, h('div', { class: 'progress' }, h('span', { style: { width: `${(i / batch.length) * 50}%` } })),
      h('span', { class: 'small muted tnum' }, `${i + 1}/${batch.length}`)));
    stage.appendChild(h('p', { class: 'small muted' }, s ? `In ${meta.name} · word #${v.rank} in the whole Quran · read it, say it, connect it.` : `Word #${v.rank} by frequency · read it, say it, connect it.`));
    stage.appendChild(wordCard(v));
    const back = i > 0 ? h('button', { class: 'btn ghost', html: icon('back'), 'aria-label': 'Previous word', onclick: () => { i -= 1; show(); } }) : null;
    const go = h('button', { class: 'btn', html: `${i === batch.length - 1 ? 'Check yourself' : 'Next word'} ${icon('next')}`, onclick: () => { i += 1; show(); } });
    stage.appendChild(h('div', { class: 'lesson-nav' }, back, go));
    go.focus({ preventScroll: true });
    setKeys((e) => { if (e.key === 'ArrowRight') go.click(); if (e.key === 'ArrowLeft' && back) back.click(); });
  }

  function quiz() {
    setKeys(null);
    stopQuiz = runWordQuiz(stage, batch, ({ correct, total }) => {
      clear(stage);
      const covAfter = coverage().known;
      const more = s ? pending : newWordsLeftToday();
      stage.appendChild(h('div', { class: 'done-burst' }, h('span', { html: star8() }), h('h2', {}, `${total} new words`),
        h('p', { class: 'muted' }, `${correct} of ${total} right on the first try. They will come back for review tomorrow.`),
        h('p', {}, `Quran coverage ${pct(covBefore, 1)} → `, h('b', {}, pct(covAfter, 1))),
        h('div', { class: 'row', style: { justifyContent: 'center' } },
          more > 0 ? h('button', { class: 'btn', type: 'button', onclick: () => { clear(root); restart(root, arg); } }, `${Math.min(BATCH, more)} more`) : null,
          s ? h('a', { class: more > 0 ? 'btn ghost' : 'btn', href: `#surah-${s}` }, `Read ${meta.name}`)
            : h('a', { class: more > 0 ? 'btn ghost' : 'btn', href: '#home' }, 'Home'))));
    }, { title: s ? `Words of ${meta.name}` : 'New words' });
  }

  show();
  void S;
  return () => { setKeys(null); if (stopQuiz) stopQuiz(); };
}

// "N more" starts a fresh batch in place; the router only knows the first
// render's cleanup, so each batch hands its own over before the next starts
let cleanupBatch = null;
async function restart(root, arg) {
  if (cleanupBatch) cleanupBatch();
  cleanupBatch = await render(root, arg);
  window.scrollTo({ top: 0 });
}
