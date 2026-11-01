import { h, clear, debounce, pct } from '../util.js';
import { icon } from '../icons.js';
import { D, loadSurah, loadLemmas, surahMeta } from '../data.js';
import { S, setSetting, knownLemmas } from '../store.js';
import { topbar, verseEl, loadingEl, audioAvailable, playUrl, stopAudio, verseAudio, persistReader, env, reciters } from '../ui.js';

export async function render(root, arg) {
  const [sStr, aStr] = String(arg || '1').split('-');
  const s = Math.min(114, Math.max(1, parseInt(sStr, 10) || 1));
  const target = parseInt(aStr, 10) || 0;
  const meta = surahMeta(s);
  const lang = S.settings.lang;
  const view = h('div', { class: 'view' });
  root.appendChild(view);

  const toggles = h('div', { class: 'row', role: 'group', 'aria-label': 'Display' });
  const mk = (key, label) => {
    const b = h('button', { class: 'chip', 'aria-pressed': String(!!S.settings[key]), type: 'button' }, label);
    b.addEventListener('click', () => { setSetting(key, !S.settings[key]); b.setAttribute('aria-pressed', String(!!S.settings[key])); paintVerses(true); });
    return b;
  };
  toggles.append(mk('gloss', 'Word meanings'), mk('transl', 'Translation'), mk('known', 'Known-word colors'));

  view.appendChild(topbar(`${meta.name}`, { back: '#quran', sub: `${meta[lang] || meta.en} · ${meta.verses} verses · ${meta.place === 'makkah' ? 'Meccan' : 'Medinan'}`,
    right: h('span', { class: 'surah-ar', lang: 'ar', style: { fontSize: '1.5rem' } }, meta.ar) }));
  view.appendChild(toggles);
  const stats = h('p', { class: 'small muted' });
  view.appendChild(stats);
  let playBtn = null;
  if (audioAvailable()) {
    const sel = h('select', { id: 'reciter', 'aria-label': 'Reciter' }, Object.entries(reciters).map(([k, [name]]) => h('option', { value: k, selected: (S.settings.reciter || 'alafasy') === k }, name)));
    sel.addEventListener('change', () => setSetting('reciter', sel.value));
    playBtn = h('button', { class: 'btn small quiet', html: `${icon('play')} Play surah` });
    view.appendChild(h('div', { class: 'row' }, playBtn, sel));
  }
  const body = h('div', { class: 'card', style: { paddingBlock: '.3rem' } }, loadingEl('Opening the surah…'));
  view.appendChild(body);
  const navRow = h('div', { class: 'row spread' },
    s > 1 ? h('a', { class: 'btn ghost small', href: `#surah-${s - 1}`, html: `${icon('back')} ${D.surahs[s - 2].name}` }) : h('span'),
    s < 114 ? h('a', { class: 'btn ghost small', href: `#surah-${s + 1}`, html: `${D.surahs[s].name} ${icon('next')}` }) : h('span'));
  view.appendChild(navRow);

  const [data] = await Promise.all([loadSurah(s), loadLemmas()]);
  const { known } = knownLemmas();
  let k = 0, n = 0;
  for (const v of data.v) for (const w of v.w) { n += 1; const seg = w[4][w[3]] || w[4][0]; if (seg && known.has(seg[2])) k += 1; }
  stats.textContent = `You know ${k} of its ${n} words (${pct(n ? k / n : 0)}). Tap any word for meaning, root and grammar.`;

  let stopPlay = false;
  function paintVerses(keepScroll) {
    const y = window.scrollY;
    clear(body);
    body.classList.toggle('show-known', !!S.settings.known);
    if (s !== 1 && s !== 9) body.appendChild(h('div', { class: 'bismillah', lang: 'ar', dir: 'rtl' }, 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'));
    const CHUNK = 30;
    let idx = 0;
    const step = () => {
      const frag = document.createDocumentFragment();
      for (let j = 0; j < CHUNK && idx < data.v.length; j++, idx++) frag.appendChild(verseEl(data.v[idx], s, { gloss: S.settings.gloss, transl: S.settings.transl }));
      body.appendChild(frag);
      if (idx < data.v.length) setTimeout(step, 0);
      else if (keepScroll) window.scrollTo({ top: y });
      else if (target > 1) document.getElementById(`v${s}-${target}`)?.scrollIntoView({ block: 'start' });
    };
    if (target > 1 && !keepScroll) {
      // render up to the target synchronously so we can jump straight to it
      const frag = document.createDocumentFragment();
      for (; idx < Math.min(data.v.length, target + 5); idx++) frag.appendChild(verseEl(data.v[idx], s, { gloss: S.settings.gloss, transl: S.settings.transl }));
      body.appendChild(frag);
      document.getElementById(`v${s}-${target}`)?.scrollIntoView({ block: 'start' });
      setTimeout(step, 0);
    } else step();
  }
  paintVerses(false);
  persistReader(s, target || 1);

  const onScroll = debounce(() => {
    const vs = body.querySelectorAll('.verse');
    for (const el of vs) {
      const r = el.getBoundingClientRect();
      if (r.bottom > 80) { const a = +el.id.split('-')[1]; if (a && a !== S.reader.a) persistReader(s, a); break; }
    }
  }, 600);
  window.addEventListener('scroll', onScroll, { passive: true });

  if (playBtn) {
    let playing = false;
    playBtn.addEventListener('click', () => {
      if (playing) { stopPlay = true; stopAudio(); playing = false; playBtn.innerHTML = `${icon('play')} Play surah`; return; }
      playing = true; stopPlay = false;
      playBtn.innerHTML = `${icon('stop')} Stop`;
      let a = Math.max(1, S.reader.a || 1);
      const playA = () => {
        if (stopPlay || a > data.v.length) { playing = false; playBtn.innerHTML = `${icon('play')} Play surah`; return; }
        const el = document.getElementById(`v${s}-${a}`);
        document.querySelectorAll('.verse.playing').forEach((x) => { x.classList.remove('playing'); x.style.background = ''; });
        if (el) { el.classList.add('playing'); el.style.background = 'var(--gold-soft)'; el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
        persistReader(s, a);
        playUrl(verseAudio(s, a), () => { a += 1; playA(); });
      };
      playA();
    });
  }
  void env;
  return () => { window.removeEventListener('scroll', onScroll); stopPlay = true; stopAudio(); };
}
