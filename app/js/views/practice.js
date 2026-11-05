import { h, clear, shuffle, sample, arSpan, rootLetters, screenKeys } from '../util.js';
import { icon, star8 } from '../icons.js';
import { D, loadLemmas, loadSurah, lemma, gloss, roots, surahMeta } from '../data.js';
import { S, logEvent, commit, wordStatus } from '../store.js';
import { parseFeat, describeSegment, summarizeWord, FORMS, personLabel } from '../morph.js';
import { topbar, loadingEl, verseEl, revealFeedback } from '../ui.js';

const MODES = {
  meaning: { title: 'Meaning in context', desc: 'A word from a real verse — what does it mean here?', icon: 'eye' },
  root: { title: 'Find the root', desc: 'Strip the pattern and name the three root letters.', icon: 'roots' },
  person: { title: 'Who is doing it?', desc: 'Read the subject from a verb\'s prefix and ending.', icon: 'teacher' },
  tense: { title: 'Past, present or command?', desc: 'Name the verb type — and spot the passive.', icon: 'path' },
  pronoun: { title: 'Which pronoun?', desc: 'Read the attached ending: his, their, you, us…', icon: 'words' },
  form: { title: 'Which verb form?', desc: 'Forms I–X from the shape of the verb.', icon: 'grammar' },
  case: { title: 'Which case?', desc: 'Nominative, accusative or genitive — from the ending.', icon: 'practice' },
};
const ROUND = 10;
const POOL = [1, 36, 55, 56, 67, 18, 19, 12, 2, 3, ...Array.from({ length: 37 }, (_, i) => 78 + i)];

export async function render(root, arg) {
  if (!arg || !MODES[arg]) return hub(root);
  return drill(root, arg);
}

function hub(root) {
  const view = h('div', { class: 'view' }, topbar('Practice', { sub: 'Drills made from real verses' }));
  view.appendChild(h('p', { class: 'muted' }, 'Every question uses a real word from the Quran with its real grammar. Ten questions per round; play as many rounds as you like.'));
  const grid = h('div', { class: 'stack' });
  for (const [k, m] of Object.entries(MODES)) {
    grid.appendChild(h('a', { class: 'card action', href: `#practice-${k}` }, h('span', { class: 'glyph', html: icon(m.icon) }),
      h('div', { class: 'stack-s' }, h('h3', {}, m.title), h('span', { class: 'small muted' }, m.desc)), h('span', { html: icon('next') })));
  }
  view.appendChild(grid);
  root.appendChild(view);
}

const PRONOUN_LABEL = { '1S': 'me / my', '1P': 'us / our', '2MS': 'you / your (m.)', '2FS': 'you / your (f.)', '2MP': 'you / your (pl.)', '2FP': 'you (f. pl.)', '2D': 'you two', '3MS': 'him / his / it', '3FS': 'her / its', '3MP': 'them / their', '3FP': 'them (f.)', '3D': 'them two' };
const normPgn = (p) => (p.length === 3 && p[2] === 'D') ? p[0] + 'D' : p;

function candidates(mode, s, verse) {
  const out = [];
  verse.w.forEach((w, wi) => {
    const segs = w[4];
    const stem = segs[w[3]] || segs[0];
    const f = parseFeat(stem[1]);
    const lid = stem[2];
    const base = { s, verse, wi, w, f, lid };
    if (mode === 'meaning') {
      const L = lemma(lid);
      if (!L || L.vocab < 0 || f.cls === 'P') return;
      const st = wordStatus(lid);
      if (st === 'new' && Object.keys(S.cards).length > 25) return;
      out.push(base);
    } else if (mode === 'root') {
      const L = lemma(lid);
      if (!L || !L.root || [...L.root].length !== 3 || f.pos === 'PN') return;
      out.push(base);
    } else if (mode === 'person') {
      if (f.cls === 'V' && f.pgn && f.aspect !== 'IMPV') out.push(base);
    } else if (mode === 'tense') {
      if (f.cls === 'V' && f.aspect) out.push(base);
    } else if (mode === 'form') {
      if (f.cls === 'V' && f.form && f.form <= 10 && f.form !== 9) out.push(base);
    } else if (mode === 'pronoun') {
      segs.forEach((sg, si) => {
        if (si === 0) return;
        const sf = parseFeat(sg[1]);
        if (sf.pos !== 'PRON' || !sf.pgn) return;
        const d = describeSegment(sg, segs, si);
        if (d.title.startsWith('subject')) return;
        out.push({ ...base, seg: sg, pgn: normPgn(sf.pgn), segIdx: si });
      });
    } else if (mode === 'case') {
      if (f.cls === 'N' && f.case && !['PRON', 'DEM', 'REL'].includes(f.pos) && !f.indef && segs.length <= 3) out.push(base);
    }
  });
  return out;
}

function makeQuestion(mode, c) {
  const lang = S.settings.lang;
  if (mode === 'meaning') {
    const v = D.vocab[lemma(c.lid).vocab];
    const pool = D.vocab.filter((x) => x.id !== v.id && x.p === v.p && gloss(x, lang) !== gloss(v, lang));
    const opts = shuffle([v, ...sample(pool, 3)]);
    return { prompt: 'What does the highlighted word mean?', options: opts.map((o) => gloss(o, lang)), answer: opts.indexOf(v),
      explain: `${v.ar} — ${gloss(v, lang)}. Here: “${(lang === 'tr' && c.w[2]) || c.w[1]}”.` };
  }
  if (mode === 'root') {
    const L = lemma(c.lid);
    const all = roots().filter((r) => [...r.root].length === 3 && r.root !== L.root);
    const share = all.filter((r) => [...r.root].some((x) => L.root.includes(x))).slice(0, 80);
    const opts = shuffle([L.root, ...sample(share.length >= 3 ? share : all.slice(0, 200), 3).map((r) => r.root)]);
    return { prompt: 'Which root does the highlighted word come from?', options: opts.map(rootLetters), ar: true, answer: opts.indexOf(L.root),
      explain: `${rootLetters(L.root)} — ${L.en}. Dictionary form: ${L.ar}.` };
  }
  if (mode === 'person') {
    const right = normPgn(c.f.pgn);
    const pool = ['3MS', '3FS', '3MP', '2MS', '2MP', '1S', '1P', '3D', '3FP'].filter((x) => x !== right);
    const opts = shuffle([right, ...sample(pool, 3)]);
    return { prompt: 'Who is the subject of the highlighted verb?', options: opts.map(personLabel), answer: opts.indexOf(right), explain: summarizeWord(c.w) };
  }
  if (mode === 'tense') {
    const right = c.f.pass ? (c.f.aspect === 'PERF' ? 'Past, passive' : 'Present, passive') : { PERF: 'Past', IMPF: 'Present / future', IMPV: 'Command' }[c.f.aspect];
    const opts = ['Past', 'Present / future', 'Command', c.f.pass ? right : (Math.random() < 0.5 ? 'Past, passive' : 'Present, passive')];
    const uniq = [...new Set(opts)];
    const sh = shuffle(uniq);
    return { prompt: 'What kind of verb is highlighted?', options: sh, answer: sh.indexOf(right), explain: summarizeWord(c.w) };
  }
  if (mode === 'form') {
    const right = c.f.form;
    const pool = [1, 2, 3, 4, 5, 6, 7, 8, 10].filter((x) => x !== right);
    const opts = shuffle([right, ...sample(pool, 3)]);
    return { prompt: 'Which verb form is the highlighted verb?', options: opts.map((x) => `Form ${FORMS[x][0]} · ${FORMS[x][1]}`), answer: opts.indexOf(right), explain: summarizeWord(c.w) };
  }
  if (mode === 'pronoun') {
    const right = c.pgn;
    const pool = Object.keys(PRONOUN_LABEL).filter((x) => x !== right && !['2FP', '3FP', '2FS'].includes(x));
    const opts = shuffle([right, ...sample(pool, 3)]);
    const segText = c.seg[0];
    return { prompt: `Which pronoun is the ending ${segText ? `“${segText}”` : ''} in the highlighted word?`, options: opts.map((x) => PRONOUN_LABEL[x]), answer: opts.indexOf(right),
      explain: `${describeSegment(c.seg, c.w[4], c.segIdx).title}. Whole word: ${summarizeWord(c.w)}` };
  }
  if (mode === 'case') {
    const names = { NOM: 'Nominative (-u) · merfû', ACC: 'Accusative (-a) · mansûb', GEN: 'Genitive (-i) · mecrûr' };
    const keys = ['NOM', 'ACC', 'GEN'];
    return { prompt: 'Which case is the highlighted noun in?', options: keys.map((k) => names[k]), answer: keys.indexOf(c.f.case), explain: summarizeWord(c.w) };
  }
  return null;
}

async function drill(root, mode) {
  const m = MODES[mode];
  const view = h('div', { class: 'view' }, topbar(m.title, { back: '#practice', sub: m.desc }));
  root.appendChild(view);
  const stage = h('div', { class: 'stack' }, loadingEl('Collecting verses…'));
  view.appendChild(stage);
  await loadLemmas();
  let cands = [];
  const tried = new Set();
  let loaded = 0;
  // a few surahs at a time, in parallel, until there is enough to choose from
  for (let k = 0; k < 3 && cands.length < ROUND * 3; k++) {
    const batch = sample(POOL.filter((x) => !tried.has(x)), 3);
    batch.forEach((x) => tried.add(x));
    const datas = await Promise.all(batch.map((x) => loadSurah(x).catch(() => null)));
    datas.forEach((data, j) => {
      if (!data) return;
      loaded += 1;
      for (const v of data.v) cands.push(...candidates(mode, batch[j], v));
    });
  }
  if (!view.isConnected) return;
  if (!loaded) {
    clear(stage).appendChild(h('div', { class: 'empty' }, h('h2', {}, 'Could not load the verses'),
      h('p', {}, 'Drills use real verses. Check your connection and try again — surahs you have opened before work offline.'),
      h('button', { class: 'btn', type: 'button', onclick: () => { clear(root); drill(root, mode); } }, 'Try again')));
    return;
  }
  if (mode === 'meaning' && cands.length < ROUND) {
    clear(stage).appendChild(h('div', { class: 'empty' }, h('h2', {}, 'Learn a few words first'), h('p', {}, 'This drill uses words from your deck.'), h('a', { class: 'btn', href: '#words' }, 'Learn new words')));
    return;
  }
  const qs = sample(cands, ROUND).map((c) => ({ c, q: makeQuestion(mode, c) })).filter((x) => x.q);
  let i = 0, right = 0;
  const setKeys = screenKeys(view);

  function show() {
    clear(stage);
    if (i >= qs.length) {
      setKeys(null);
      logEvent('p', qs.length); commit();
      stage.appendChild(h('div', { class: 'done-burst' }, h('span', { html: star8() }), h('h2', {}, `${right} / ${qs.length}`),
        h('p', { class: 'muted' }, right >= qs.length * 0.8 ? 'Excellent — your eye for patterns is getting sharp.' : 'Every round trains your eye. Try another.'),
        h('div', { class: 'row', style: { justifyContent: 'center' } }, h('button', { class: 'btn', type: 'button', onclick: () => { clear(root); window.scrollTo({ top: 0 }); drill(root, mode); } }, 'Another round'),
          h('a', { class: 'btn ghost', href: '#practice' }, 'Other drills'))));
      return;
    }
    const { c, q } = qs[i];
    stage.appendChild(h('div', { class: 'row nowrap' }, h('div', { class: 'progress' }, h('span', { style: { width: `${(i / qs.length) * 100}%` } })), h('span', { class: 'small muted tnum' }, `${i + 1}/${qs.length}`)));
    const card = h('div', { class: 'card' });
    card.appendChild(h('div', { class: 'label' }, `${surahMeta(c.s).name} ${c.s}:${c.verse.a}`));
    card.appendChild(verseEl(c.verse, c.s, { gloss: false, transl: false, head: false, highlightW: c.wi }));
    stage.appendChild(card);
    const quiz = h('div', { class: 'quiz' }, h('p', { class: 'prompt' }, q.prompt));
    const list = h('div', { class: 'options' });
    const fb = h('div');
    q.options.forEach((o, k) => {
      const b = h('button', { class: `opt${q.ar ? ' ar-opt' : ''}`, type: 'button' }, h('span', { class: 'k' }, String(k + 1)), q.ar ? arSpan(o) : h('span', {}, o));
      b.addEventListener('click', () => choose(k, b));
      list.appendChild(b);
    });
    quiz.append(list, fb);
    stage.appendChild(quiz);
    setKeys((e) => { const k = +e.key; if (k >= 1 && k <= q.options.length) list.children[k - 1].click(); });

    function choose(k, b) {
      setKeys(null);
      [...list.children].forEach((x) => { x.disabled = true; });
      const ok = k === q.answer;
      if (ok) right += 1;
      list.children[q.answer].classList.add('right');
      if (!ok) b.classList.add('wrong');
      const t = (S.settings.lang === 'tr' && c.verse.tr) || (S.settings.lang === 'de' && c.verse.de) || c.verse.en;
      const box = h('div', { class: `feedback ${ok ? 'good' : 'bad'}` }, h('b', {}, ok ? 'Right' : 'Not quite'), h('span', {}, q.explain), h('span', { class: 'small muted' }, t));
      fb.appendChild(box);
      const go = h('button', { class: 'btn', html: `Continue ${icon('next')}`, onclick: () => { i += 1; show(); } });
      fb.appendChild(h('div', { class: 'lesson-nav' }, go));
      revealFeedback(box);
      go.focus({ preventScroll: true });
    }
  }
  show();
  return () => setKeys(null);
}
