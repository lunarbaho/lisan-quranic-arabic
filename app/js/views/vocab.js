import { h, clear, fmtInterval, bare, ARABIC_RE } from '../util.js';
import { D, gloss, lemma, loadLemmas } from '../data.js';
import { S, card } from '../store.js';
import { isMature } from '../srs.js';
import { topbar, openSheet, deckControl } from '../ui.js';
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
  const bar = topbar('My words', { sub: `${started} in your deck · ${D.vocab.length} core words` });
  view.appendChild(bar);
  const paintSub = () => { bar.querySelector('.sub').textContent = `${Object.keys(S.cards).length} in your deck · ${D.vocab.length} core words`; };
  let filter = 'all';
  const search = h('input', { class: 'search', type: 'search', id: 'vocab-search', placeholder: 'Search Arabic, English, Türkçe, Deutsch…', 'aria-label': 'Search words' });
  const seg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Filter' });
  for (const [k, label] of [['all', 'All'], ['deck', 'In my deck'], ['new', 'Not started'], ['known', 'Long-term']]) {
    seg.appendChild(h('button', { 'aria-pressed': String(k === filter), onclick: () => { filter = k; [...seg.children].forEach((b, i) => b.setAttribute('aria-pressed', String(['all', 'deck', 'new', 'known'][i] === k))); paint(); } }, label));
  }
  const list = h('div', { class: 'list' });
  view.append(search, seg, list);

  // words added from the Reader that are not core words; a removed one stays listed until you leave
  const extra = [];
  const extraKeys = new Set();
  function collectExtra() {
    for (const k of Object.keys(S.cards)) {
      if (k[0] !== 'l' || extraKeys.has(k)) continue;
      const L = lemma(+k.slice(1));
      if (L) { extraKeys.add(k); extra.push({ key: k, L }); }
    }
  }

  function paint() {
    collectExtra();
    clear(list);
    const q = search.value.trim().toLowerCase();
    const qb = ARABIC_RE.test(q) ? bare(q) : '';      // Arabic: match with or without harakat
    const hit = (ar, text) => !q || (qb ? bare(ar).includes(qb) : text.toLowerCase().includes(q));
    const rows = [];
    for (const v of D.vocab) {
      const key = `v${v.id}`;
      const [st] = status(key);
      if (filter === 'deck' && !card(key)) continue;
      if (filter === 'new' && card(key)) continue;
      if (filter === 'known' && st !== 'known') continue;
      if (!hit(`${v.ar} ${v.ar2 || ''}`, `${v.en} ${v.tr} ${v.de} ${v.cog}`)) continue;
      rows.push({ key, ar: v.ar, g: gloss(v, lang), rank: v.rank, v });
    }
    for (const x of extra) {
      if (filter === 'new' ? card(x.key) : (filter !== 'all' && !card(x.key))) continue;
      if (!hit(x.L.ar, `${x.L.en} ${x.L.tr}`)) continue;
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
    box.appendChild(h('div', { class: 'row' }, deckControl(r.key, { variant: 'full', onChange: () => { paint(); paintSub(); } })));
    openSheet(box, 'Word');
  }

  search.addEventListener('input', paint);
  paint();
}
