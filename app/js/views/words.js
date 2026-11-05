import { h, clear, pct, screenKeys } from '../util.js';
import { icon, star8 } from '../icons.js';
import { loadLemmas } from '../data.js';
import { S, nextNewVocab, newWordsLeftToday, coverage } from '../store.js';
import { topbar } from '../ui.js';
import { wordCard, runWordQuiz } from '../learnflow.js';

const BATCH = 10;

export async function render(root) {
  await loadLemmas().catch(() => {});
  const view = h('div', { class: 'view' });
  root.appendChild(view);
  const left = newWordsLeftToday();
  const size = left > 0 ? Math.min(BATCH, left) : 5;
  const batch = nextNewVocab(size);
  view.appendChild(topbar('New words', { back: '#home', sub: left > 0 ? `${left} left in today's goal` : 'Daily goal reached — extra words are welcome' }));
  const stage = h('div', { class: 'stack' });
  view.appendChild(stage);
  if (!batch.length) {
    stage.appendChild(h('div', { class: 'empty' }, h('span', { html: star8() }), h('h2', {}, 'Every core word is in your deck'),
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
    stage.appendChild(h('p', { class: 'small muted' }, `Word #${v.rank} by frequency · read it, say it, connect it.`));
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
      stage.appendChild(h('div', { class: 'done-burst' }, h('span', { html: star8() }), h('h2', {}, `${total} new words`),
        h('p', { class: 'muted' }, `${correct} of ${total} right on the first try. They will come back for review tomorrow.`),
        h('p', {}, `Quran coverage ${pct(covBefore, 1)} → `, h('b', {}, pct(covAfter, 1))),
        h('div', { class: 'row', style: { justifyContent: 'center' } },
          newWordsLeftToday() > 0 ? h('button', { class: 'btn', type: 'button', onclick: () => { clear(root); restart(root); } }, `${Math.min(BATCH, newWordsLeftToday())} more`) : null,
          h('a', { class: newWordsLeftToday() > 0 ? 'btn ghost' : 'btn', href: '#home' }, 'Home'))));
    }, { title: 'New words' });
  }

  show();
  void S;
  return () => { setKeys(null); if (stopQuiz) stopQuiz(); };
}

// "N more" starts a fresh batch in place; the router only knows the first
// render's cleanup, so each batch hands its own over before the next starts
let cleanupBatch = null;
async function restart(root) {
  if (cleanupBatch) cleanupBatch();
  cleanupBatch = await render(root);
  window.scrollTo({ top: 0 });
}
