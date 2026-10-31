import { h, clear, pct } from '../util.js';
import { star8, icon } from '../icons.js';
import { D, loadSurahLemmas } from '../data.js';
import { S, knownLemmas } from '../store.js';
import { topbar } from '../ui.js';

export async function render(root) {
  const lang = S.settings.lang;
  const view = h('div', { class: 'view' });
  root.appendChild(view);
  view.appendChild(topbar('Quran', { sub: '114 surahs · word by word' }));
  const r = S.reader;
  const meta = D.surahs[r.s - 1];
  view.appendChild(h('a', { class: 'card action turq', href: `#surah-${r.s}-${r.a}` }, h('span', { class: 'glyph', html: icon('quran') }),
    h('div', { class: 'stack-s' }, h('h3', {}, `Continue: ${meta.name} ${r.s}:${r.a}`), h('span', { class: 'small muted' }, meta[lang] || meta.en)), h('span', { html: icon('next') })));

  const search = h('input', { class: 'search', type: 'search', id: 'surah-search', placeholder: 'Search by name or number…', 'aria-label': 'Search surahs' });
  let filter = 'all';
  const seg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Filter surahs' });
  const filters = [['all', 'All'], ['amma', 'Juz ʿAmma'], ['ready', 'Ready for you']];
  for (const [k, label] of filters) seg.appendChild(h('button', { 'aria-pressed': String(k === filter), onclick: () => { filter = k; [...seg.children].forEach((b, i) => b.setAttribute('aria-pressed', String(filters[i][0] === k))); paint(); } }, label));
  const list = h('div', { class: 'list' });
  const hint = h('p', { class: 'small muted' }, 'The bar shows how many of each surah\'s words you know.');
  view.append(search, seg, hint, list);

  let known = new Map();
  function paint() {
    clear(list);
    const q = search.value.trim().toLowerCase();
    for (const s of D.surahs) {
      if (filter === 'amma' && s.n < 78) continue;
      const k = known.get(s.n) ?? 0;
      if (filter === 'ready' && k < 0.8) continue;
      if (q && !(`${s.n} ${s.name} ${s.ar} ${s.en} ${s.tr} ${s.de}`.toLowerCase().includes(q))) continue;
      list.appendChild(h('a', { class: 'list-item surah-row', href: `#surah-${s.n}` },
        h('span', { class: 'surah-no', html: `${star8('none', 'currentColor')}<b>${s.n}</b>` }),
        h('span', { class: 'stack-s', style: { gap: '.05rem' } }, h('b', {}, s.name),
          h('span', { class: 'tiny muted' }, `${s[lang] || s.en} · ${s.verses} verses · ${s.place === 'makkah' ? 'Meccan' : 'Medinan'}`),
          h('span', { class: 'tiny muted tnum' }, h('span', { class: 'mini-bar' }, h('span', { style: { width: `${k * 100}%` } })), ` ${pct(k)} known`)),
        h('span', { class: 'surah-ar', lang: 'ar' }, s.ar)));
    }
    if (!list.children.length) list.appendChild(h('p', { class: 'muted', style: { padding: '1rem 0' } }, filter === 'ready' ? 'No surah is above 80% yet — keep learning words and this list fills up.' : 'No surah matches.'));
  }
  search.addEventListener('input', paint);
  paint();
  try {
    const sl = await loadSurahLemmas();
    const { known: kn } = knownLemmas();
    for (const s of D.surahs) {
      const flat = sl[s.n] || [];
      let k = 0;
      for (let i = 0; i < flat.length; i += 2) if (kn.has(flat[i])) k += flat[i + 1];
      known.set(s.n, s.words ? k / s.words : 0);
    }
    paint();
  } catch { /* coverage bars stay empty offline */ }
}
