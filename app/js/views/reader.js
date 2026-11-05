import { h, clear, debounce, pct, toast } from '../util.js';
import { icon } from '../icons.js';
import { D, loadSurah, loadLemmas, surahMeta } from '../data.js';
import { S, setSetting, knownLemmas } from '../store.js';
import { topbar, verseEl, loadingEl, persistReader, markPlaying } from '../ui.js';
import { audioAvailable, RECITERS, MODES, reciter, hasBasmala, onAudio, audioState, toggleSurah, togglePause,
  stop, next, prev, setMode, reciterChanged } from '../audio.js';

const smooth = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export async function render(root, arg) {
  const [sStr, aStr] = String(arg || '1').split('-');
  const s = Math.min(114, Math.max(1, parseInt(sStr, 10) || 1));
  const meta = surahMeta(s);
  const target = Math.min(meta.verses, parseInt(aStr, 10) || 0);
  const lang = S.settings.lang;
  const view = h('div', { class: 'view' });
  root.appendChild(view);
  let alive = true;

  const toggles = h('div', { class: 'row toggles', role: 'group', 'aria-label': 'Display' });
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

  // ---- recitation controls ----
  let playBtn = null, stopBtn = null;
  if (audioAvailable()) {
    const sel = h('select', { id: 'reciter', 'aria-label': 'Reciter' },
      Object.entries(RECITERS).map(([k, [name]]) => h('option', { value: k, selected: (S.settings.reciter || 'alafasy') === k }, name)));
    sel.addEventListener('change', () => { setSetting('reciter', sel.value); reciterChanged(); paintAudio(audioState()); });
    playBtn = h('button', { class: 'btn small', type: 'button', id: 'play-surah', onclick: () => toggleSurah(s) });
    stopBtn = h('button', { class: 'btn small ghost', type: 'button', id: 'stop-surah', html: `${icon('stop')} Stop`, onclick: stop, hidden: true });
    view.appendChild(h('div', { class: 'row audio-row' }, playBtn, stopBtn, sel));
  }

  const body = h('div', { class: 'card', style: { paddingBlock: '.3rem' } }, loadingEl('Opening the surah…'));
  view.appendChild(body);
  const navRow = h('div', { class: 'row spread' },
    s > 1 ? h('a', { class: 'btn ghost small', href: `#surah-${s - 1}`, html: `${icon('back')} ${D.surahs[s - 2].name}` }) : h('span'),
    s < 114 ? h('a', { class: 'btn ghost small', href: `#surah-${s + 1}`, html: `${D.surahs[s].name} ${icon('next')}` }) : h('span'));
  view.appendChild(navRow);

  // the mini player: stays at the bottom of the screen while a verse of this surah plays
  const iconBtn = (name, label, fn) => h('button', { class: 'icon-btn', type: 'button', 'aria-label': label, title: label, html: icon(name), onclick: fn });
  const pPrev = iconBtn('prevTrack', 'Previous verse (or start of this one)', prev);
  const pToggle = h('button', { class: 'player-main', type: 'button', onclick: togglePause });
  const pNext = iconBtn('nextTrack', 'Next verse', next);
  const pRef = h('b', { class: 'tnum' });
  const pSub = h('span', { class: 'player-sub' });
  const pMode = h('button', { class: 'player-mode', type: 'button', onclick: () => {
    const order = ['once', 'continue', 'repeat'];
    const m = order[(order.indexOf(audioState().mode) + 1) % order.length];
    setMode(m);
    toast(`${MODES[m].label}: ${MODES[m].hint.toLowerCase()}.`);
  } });
  const pStop = iconBtn('close', 'Stop recitation', stop);
  const bar = h('div', { class: 'player', role: 'region', 'aria-label': 'Recitation player', hidden: true },
    h('div', { class: 'player-ctl' }, pPrev, pToggle, pNext), h('div', { class: 'player-info' }, pRef, pSub), pMode, pStop);
  view.appendChild(bar);

  const [data] = await Promise.all([loadSurah(s), loadLemmas()]);
  if (!alive) return () => {};
  const { known } = knownLemmas();
  let k = 0, n = 0;
  for (const v of data.v) for (const w of v.w) { n += 1; const seg = w[4][w[3]] || w[4][0]; if (seg && known.has(seg[2])) k += 1; }
  stats.textContent = `You know ${k} of its ${n} words (${pct(n ? k / n : 0)}). Tap any word for meaning, root and grammar.`;

  // ---- verses, rendered in chunks so long surahs open fast ----
  let paintGen = 0;
  let landing = null;               // where #surah-s-a jumped to, until the learner scrolls
  function paintVerses(keepScroll) {
    const gen = ++paintGen;
    const y = window.scrollY;
    clear(body);
    body.classList.toggle('show-known', !!S.settings.known);
    if (hasBasmala(s)) body.appendChild(markPlaying(h('div', { class: 'bismillah', lang: 'ar', dir: 'rtl' }, 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'), s, 0));
    const CHUNK = 30;
    let idx = 0;
    const add = (upTo) => {
      const frag = document.createDocumentFragment();
      for (; idx < Math.min(data.v.length, upTo); idx++) frag.appendChild(verseEl(data.v[idx], s, { gloss: S.settings.gloss, transl: S.settings.transl }));
      body.appendChild(frag);
    };
    const step = () => {
      if (!alive || gen !== paintGen) return;          // a newer paint or another screen took over
      add(idx + CHUNK);
      if (idx < data.v.length) setTimeout(step, 0);
      else if (keepScroll) window.scrollTo({ top: y });
      else realign();
    };
    if (keepScroll) { add(data.v.length); window.scrollTo({ top: y }); return; }
    if (target > 1) {
      // render up to the target at once so the page can open right on it
      add(target + 5);
      const el = document.getElementById(`v${s}-${target}`);
      if (el) {
        el.scrollIntoView({ block: 'start' });
        el.classList.add('arrived');
        landing = { el, y: window.scrollY };
      }
    }
    step();
  }
  // web fonts and later chunks can shift the page: stay on the target unless the learner moved
  function realign() {
    if (!landing || !alive) return;
    if (Math.abs(window.scrollY - landing.y) > 4) { landing = null; return; }
    landing.el.scrollIntoView({ block: 'start' });
    landing.y = window.scrollY;
  }
  paintVerses(false);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(realign);
  persistReader(s, target || 1);

  // ---- remember the reading position ----
  // The address follows it too (without a new history entry), so coming Back
  // from a word's root page, or reloading, opens the surah at the same verse.
  const remember = (a) => {
    if (!alive || !a) return;
    if (a !== S.reader.a || S.reader.s !== s) persistReader(s, a);
    const m = /^#surah-(\d+)/.exec(location.hash);
    if (m && +m[1] === s) {
      const want = a > 1 ? `#surah-${s}-${a}` : `#surah-${s}`;
      if (location.hash !== want) { try { history.replaceState(history.state, '', want); } catch { /* rate-limited: next time */ } }
    }
  };
  const onScroll = debounce(() => {
    if (!alive) return;
    if (audioState().status !== 'idle' && audioState().s === s) return;   // the recited verse is the position
    // the verse at the reading line, just under the sticky header
    const line = (view.querySelector('.topbar')?.getBoundingClientRect().bottom || 60) + 30;
    for (const el of body.querySelectorAll('.verse')) {
      if (el.getBoundingClientRect().bottom > line) { remember(+el.id.split('-')[1]); break; }
    }
  }, 600);
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---- follow the recitation ----
  let followKey = '';
  const bottomEdge = () => (bar.hidden ? window.innerHeight : bar.getBoundingClientRect().top);
  const inView = (el) => { const r = el.getBoundingClientRect(); return r.bottom > 60 && r.top < bottomEdge(); };
  const fullyInView = (el) => { const r = el.getBoundingClientRect(); return r.top >= 60 && r.bottom <= bottomEdge(); };
  function follow(st) {
    const key = `${st.s}:${st.a}`;
    if (key === followKey) return;
    const before = followKey ? body.querySelector(`[data-play="${followKey}"]`) : null;
    const first = !followKey;
    followKey = key;
    if (st.a > 0) remember(st.a);
    const el = body.querySelector(`[data-play="${key}"]`);
    if (!el || fullyInView(el)) return;
    // scroll along only while the learner is following the recitation
    if (!first && !(before && inView(before))) return;
    const tall = el.offsetHeight > (bottomEdge() - 60) * 0.8;
    el.scrollIntoView({ block: tall ? 'start' : 'center', behavior: smooth() ? 'smooth' : 'auto' });
  }

  function paintAudio(st) {
    if (!alive) return;
    const mine = st.status !== 'idle' && st.s === s;
    const playing = mine && st.status !== 'paused';
    if (playBtn) {
      playBtn.innerHTML = mine ? (playing ? `${icon('pause')} Pause` : `${icon('play')} Resume`) : `${icon('play')} Play surah`;
      playBtn.classList.toggle('quiet', !mine);
      stopBtn.hidden = !mine;
    }
    bar.hidden = !mine;
    document.body.classList.toggle('has-player', mine);
    if (!mine) { followKey = ''; return; }
    pToggle.innerHTML = icon(playing ? 'pause' : 'play');
    pToggle.setAttribute('aria-label', playing ? 'Pause' : 'Resume');
    pToggle.title = playing ? 'Pause' : 'Resume';
    pToggle.classList.toggle('busy', st.status === 'loading');
    pRef.textContent = st.a === 0 ? 'Bismillah' : `${s}:${st.a}`;
    pSub.textContent = `${meta.name} · ${reciter()[0]}`;
    pNext.disabled = st.a >= st.last;
    const m = MODES[st.mode];
    pMode.innerHTML = `${icon({ once: 'once', continue: 'flow', repeat: 'repeat' }[st.mode])}<span>${m.label}</span>`;
    pMode.setAttribute('aria-label', `Playback: ${m.label} — ${m.hint}. Tap to change.`);
    pMode.title = `${m.hint} — tap to change`;
    pMode.classList.toggle('on', st.mode !== 'once');
    follow(st);
  }
  const off = onAudio(paintAudio);
  paintAudio(audioState());

  return () => {
    alive = false;
    off();
    window.removeEventListener('scroll', onScroll);
    document.body.classList.remove('has-player');
  };
}
