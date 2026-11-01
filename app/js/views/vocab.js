import { h, clear, fmtInterval } from '../util.js';
import { D, gloss, lemma, loadLemmas } from '../data.js';
import { S, card, removeCard, introduce } from '../store.js';
import { isMature } from '../srs.js';
import { topbar, openSheet, inlineConfirm } from '../ui.js';
import { wordCard } from '../learnflow.js';

function status(key) {
  const c = card(key);
  if (!c) return ['new', 'not started'];
  if (c.st === 0) return ['learning', 'waiting'];
  if (isMature(c)) return ['known', 'long-term'];
  return ['learning', `next in ${fmtInterval(Math.max(0, (c.due - Date.now()) / 86400000))}`];
}

export async function render(root) {
  await loadLemmas().catch(() => {});
  const lang = S.settings.lang;
  const view = h('div', { class: 'view' });
  root.appendChild(view);
  const started = Object.keys(S.cards).length;
  view.appendChild(topbar('My words', { sub: `${started} in your deck · ${D.vocab.length} core words` }));
  let filter = 'all';
  const search = h('input', { class: 'search', type: 'search', id: 'vocab-search', placeholder: 'Search Arabic, English, Türkçe, Deutsch…', 'aria-label': 'Search words' });
  const seg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Filter' });
  for (const [k, label] of [['all', 'All'], ['deck', 'In my deck'], ['new', 'Not started'], ['known', 'Long-term']]) {
    seg.appendChild(h('button', { 'aria-pressed': String(k === filter), onclick: () => { filter = k; [...seg.children].forEach((b, i) => b.setAttribute('aria-pressed', String(['all', 'deck', 'new', 'known'][i] === k))); paint(); } }, label));
  }
  const list = h('div', { class: 'list' });
  view.append(search, seg, list);

  const extra = Object.keys(S.cards).filter((k) => k[0] === 'l').map((k) => ({ key: k, L: lemma(+k.slice(1)) })).filter((x) => x.L);

  function paint() {
    clear(list);
    const q = search.value.trim().toLowerCase();
    const rows = [];
    for (const v of D.vocab) {
      const key = `v${v.id}`;
      const [st] = status(key);
      if (filter === 'deck' && !card(key)) continue;
      if (filter === 'new' && card(key)) continue;
      if (filter === 'known' && st !== 'known') continue;
      if (q && !(`${v.ar} ${v.en} ${v.tr} ${v.de} ${v.cog}`.toLowerCase().includes(q) || v.ar.replace(/[ً-ٰٟ]/g, '').includes(q))) continue;
      rows.push({ key, ar: v.ar, g: gloss(v, lang), rank: v.rank, v });
    }
    if (filter !== 'new') for (const x of extra) {
      if (q && !(`${x.L.ar} ${x.L.en} ${x.L.tr}`.toLowerCase().includes(q))) continue;
      if (filter === 'known' && status(x.key)[0] !== 'known') continue;
      rows.push({ key: x.key, ar: x.L.ar, g: (lang === 'tr' && x.L.tr) || x.L.en, rank: null, L: x.L });
    }
    if (!rows.length) { list.appendChild(h('p', { class: 'muted', style: { padding: '1rem 0' } }, 'No words match.')); return; }
    const frag = document.createDocumentFragment();
    for (const r of rows.slice(0, 400)) {
      const [st, label] = status(r.key);
      frag.appendChild(h('button', { class: 'list-item', type: 'button', onclick: () => details(r) },
        h('div', { class: 'stack-s', style: { gap: '.05rem' } }, h('span', {}, r.g), h('span', { class: 'tiny muted tnum' }, r.rank ? `#${r.rank} · ${label}` : `added from the Quran · ${label}`)),
        h('div', { class: 'row nowrap' }, h('span', { class: `chip ${st === 'known' ? 'leaf' : st === 'learning' ? 'gold' : ''}` }, st === 'new' ? '—' : st === 'known' ? '✓' : '…'),
          h('span', { class: 'ar', lang: 'ar' }, r.ar))));
    }
    list.appendChild(frag);
    if (rows.length > 400) list.appendChild(h('p', { class: 'small muted', style: { padding: '.8rem 0' } }, `${rows.length - 400} more — search to narrow down.`));
  }

  function details(r) {
    const box = h('div', { class: 'stack' });
    if (r.v) box.appendChild(wordCard(r.v));
    else box.appendChild(h('div', { class: 'card stack', style: { textAlign: 'center' } }, h('div', { class: 'ar-big q-text q-solo', lang: 'ar', dir: 'rtl' }, r.ar), h('div', {}, r.g)));
    const actions = h('div', { class: 'row' });
    if (!card(r.key)) actions.appendChild(h('button', { class: 'btn small', onclick: () => { introduce([r.key]); paint(); openSheetAgain(); } }, 'Add to my deck'));
    else actions.appendChild(h('button', { class: 'btn ghost small', onclick: () => inlineConfirm(box, 'Remove this word and its review history?', 'Remove', () => { removeCard(r.key); paint(); openSheetAgain(); }) }, 'Remove from deck'));
    box.appendChild(actions);
    openSheet(box, 'Word');
    function openSheetAgain() { details(r); }
  }

  search.addEventListener('input', paint);
  paint();
}
