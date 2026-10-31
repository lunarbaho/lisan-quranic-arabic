import { h, clear, rootLetters, bare } from '../util.js';
import { D, loadLemmas, roots, lemma, rootCognates, gloss, cardKeyForLemma } from '../data.js';
import { S, wordStatus, introduce, card } from '../store.js';
import { topbar, loadingEl } from '../ui.js';
import { icon } from '../icons.js';

export async function render(root, arg, name) {
  root.appendChild(loadingEl('Loading the roots…'));
  await loadLemmas();
  clear(root);
  if (name === 'root') return detail(root, +arg || 0);
  return list(root);
}

function rootMeaning(r) {
  // the most frequent curated word of the root gives a quick sense of its idea
  for (const id of r.lemmas) { const L = lemma(id); if (L.vocab >= 0) return gloss(D.vocab[L.vocab], S.settings.lang); }
  return lemma(r.lemmas[0]).en;
}

function list(root) {
  const all = roots();
  const view = h('div', { class: 'view' }, topbar('Roots', { sub: `${all.length.toLocaleString()} roots in the Quran` }));
  view.appendChild(h('p', { class: 'muted' }, 'Most Arabic words grow from a three-letter root. Learn the root, and its family becomes easy. Sorted by how often the root appears.'));
  const search = h('input', { class: 'search', type: 'search', id: 'root-search', placeholder: 'Type root letters (علم) or a meaning…', 'aria-label': 'Search roots', dir: 'auto' });
  const box = h('div', { class: 'list' });
  view.append(search, box);
  const paint = () => {
    clear(box);
    const q = search.value.trim();
    const qb = bare(q).replace(/\s/g, '');
    let rows = all;
    if (q) {
      rows = /[؀-ۿ]/.test(q)
        ? all.filter((r) => bare(r.root).startsWith(qb) || bare(r.root).includes(qb))
        : all.filter((r) => rootMeaning(r).toLowerCase().includes(q.toLowerCase()) || rootCognates(r.root).join(' ').toLowerCase().includes(q.toLowerCase()));
    }
    const frag = document.createDocumentFragment();
    for (const r of rows.slice(0, 250)) {
      const knownN = r.lemmas.filter((id) => ['known', 'learning'].includes(wordStatus(id))).length;
      frag.appendChild(h('a', { class: 'list-item', href: `#root-${r.idx}` },
        h('div', { class: 'stack-s', style: { gap: '.05rem' } }, h('span', {}, rootMeaning(r)),
          h('span', { class: 'tiny muted tnum' }, `${r.count.toLocaleString()}× · ${r.lemmas.length} words${knownN ? ` · you know ${knownN}` : ''}`),
          S.settings.cognates && rootCognates(r.root).length ? h('span', { class: 'tiny', style: { color: 'var(--coral)' }, lang: 'tr' }, rootCognates(r.root).slice(0, 5).join(', ')) : null),
        h('span', { class: 'root-letters', lang: 'ar' }, rootLetters(r.root))));
    }
    box.appendChild(frag);
    if (!rows.length) box.appendChild(h('p', { class: 'muted', style: { padding: '1rem 0' } }, 'No root matches.'));
  };
  search.addEventListener('input', paint);
  paint();
  root.appendChild(view);
}

function detail(root, idx) {
  const r = roots()[idx];
  if (!r) { location.hash = '#roots'; return; }
  const lang = S.settings.lang;
  const view = h('div', { class: 'view' }, topbar(`Root ${rootLetters(r.root)}`, { back: '#roots', sub: `${r.count.toLocaleString()} occurrences · ${r.lemmas.length} words` }));
  view.appendChild(h('div', { class: 'card stack', style: { textAlign: 'center' } },
    h('div', { class: 'root-letters', lang: 'ar', style: { fontSize: '3rem' } }, rootLetters(r.root)),
    h('div', { class: 'meaning', style: { fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700 } }, rootMeaning(r))));
  const cog = rootCognates(r.root);
  if (S.settings.cognates && cog.length) {
    view.appendChild(h('div', { class: 'callout tr' }, h('span', { class: 'label' }, 'Türkçe bağlantı'),
      h('div', { class: 'cognates' }, cog.map((c) => h('span', { class: 'chip', lang: 'tr' }, c))),
      h('p', { class: 'small' }, 'Turkish words that come from this root — use them as memory hooks.')));
  }
  const listEl = h('div', { class: 'list' });
  for (const id of r.lemmas) {
    const L = lemma(id);
    const v = L.vocab >= 0 ? D.vocab[L.vocab] : null;
    const key = cardKeyForLemma(id);
    const st = wordStatus(id);
    const add = card(key) ? h('span', { class: `chip ${st === 'known' ? 'leaf' : 'gold'}` }, st === 'known' ? 'known' : 'learning')
      : h('button', { class: 'chip cobalt', type: 'button', html: `${icon('plus')} add`, onclick: (e) => { e.stopPropagation(); introduce([key]); e.currentTarget.replaceWith(h('span', { class: 'chip gold' }, 'added')); } });
    listEl.appendChild(h('div', { class: 'list-item', style: { cursor: 'default' } },
      h('div', { class: 'stack-s', style: { gap: '.05rem' } }, h('span', {}, v ? gloss(v, lang) : ((lang === 'tr' && L.tr) || L.en)),
        h('span', { class: 'tiny muted tnum' }, `${L.all}× · ${{ N: 'noun', V: 'verb', P: 'particle' }[L.cls]}${v && v.ar2 ? ` · ${v.ar2}` : ''}`)),
      h('div', { class: 'row nowrap' }, add, h('span', { class: 'ar', lang: 'ar' }, v ? v.ar : L.ar))));
  }
  view.appendChild(h('h2', {}, 'Words from this root'));
  view.appendChild(listEl);
  root.appendChild(view);
}
