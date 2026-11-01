import { h, clear, arSpan, pct } from '../util.js';
import { icon, star8 } from '../icons.js';
import { D, loadLemmas, getVerse } from '../data.js';
import { S, completeLesson, card, coverage } from '../store.js';
import { LESSONS, lessonById } from '../content/lessons.js';
import { topbar, hydrateQuotes, verseEl, loadingEl, env, askTeacherAbout, noteHtml, revealFeedback } from '../ui.js';
import { wordCard, runWordQuiz } from '../learnflow.js';

export async function render(root, id) {
  const lesson = lessonById(id);
  if (!lesson) { location.hash = '#learn'; return; }
  root.appendChild(loadingEl('Preparing the lesson…'));
  await loadLemmas().catch(() => {});
  clear(root);

  const words = lesson.words.map((r) => D.vocabByRank.get(r)).filter(Boolean);
  const steps = lesson.steps.map((s) => ({ ...s }));
  const retry = [];
  let i = 0, quizRight = 0, quizTotal = 0;
  const covBefore = coverage().known;

  const view = h('div', { class: 'view' });
  root.appendChild(view);
  const bar = h('span', { style: { width: '0%' } });
  view.appendChild(topbar(`${lesson.n}. ${lesson.title}`, { back: '#learn', sub: arSpan(lesson.ar), right: env.teacher
    ? h('button', { class: 'icon-btn', title: 'Ask the teacher about this lesson', html: icon('teacher'), onclick: () => askTeacherAbout({ kind: 'lesson', id: lesson.id }) }) : null }));
  view.appendChild(h('div', { class: 'row nowrap' }, h('div', { class: 'progress', role: 'progressbar', 'aria-label': 'Lesson progress' }, bar)));
  const body = h('div', { class: 'lesson-body' });
  view.appendChild(body);

  let keyHandler = null;
  const setKeys = (fn) => { if (keyHandler) document.removeEventListener('keydown', keyHandler); keyHandler = fn; if (fn) document.addEventListener('keydown', fn); };

  function nav(onNext, { label = 'Continue', disabled = false } = {}) {
    const back = i > 0 ? h('button', { class: 'btn ghost', html: icon('back'), 'aria-label': 'Previous step', onclick: () => { i -= 1; show(); } }) : null;
    const go = h('button', { class: 'btn', html: `${label} ${icon('next')}`, disabled, onclick: onNext });
    return { el: h('div', { class: 'lesson-nav' }, back, go), go };
  }

  function show() {
    window.scrollTo({ top: 0 });
    clear(body);
    const all = steps.length + retry.length;
    bar.style.width = `${Math.min(100, (i / Math.max(1, all)) * 100)}%`;
    if (i >= steps.length) { finish(); return; }
    const st = steps[i];
    if (st.teach) {
      body.appendChild(h('div', { class: 'stack', html: st.teach }));
      hydrateQuotes(body);
      const n = nav(() => { i += 1; show(); });
      body.appendChild(n.el);
      setKeys((e) => { if (e.key === 'Enter' && document.activeElement?.tagName !== 'BUTTON') n.go.click(); });
    } else if (st.quiz) quiz(st);
    else if (st.verse) verse(st);
    else if (st.words) wordsStep();
  }

  function quiz(st) {
    const wrap = h('div', { class: 'quiz' }, h('span', { class: 'label' }, st.retry ? 'Try again' : 'Check'), h('div', { class: 'prompt', html: st.quiz }));
    const list = h('div', { class: 'options' });
    const fb = h('div');
    const order = st.order || shuffleIdx(st.o.length);
    st.order = order;
    order.forEach((oi, k) => {
      const b = h('button', { class: `opt${st.ar ? ' ar-opt' : ''}`, type: 'button' }, h('span', { class: 'k' }, String(k + 1)),
        st.ar ? arSpan(st.o[oi]) : h('span', { html: st.o[oi] }));
      b.addEventListener('click', () => choose(oi, b));
      list.appendChild(b);
    });
    wrap.append(list, fb);
    body.appendChild(wrap);
    hydrateQuotes(body);
    setKeys((e) => { const k = +e.key; if (k >= 1 && k <= order.length && !list.children[0].disabled) list.children[k - 1].click(); });

    function choose(oi, b) {
      [...list.children].forEach((x) => { x.disabled = true; });
      const right = oi === st.a;
      list.children[order.indexOf(st.a)].classList.add('right');
      if (!right) b.classList.add('wrong');
      if (!st.retry && !st.answered) { quizTotal += 1; if (right) quizRight += 1; }
      st.answered = true;
      if (!right && !st.retried) { st.retried = true; retry.push({ ...st, retry: true, order: null, retried: true }); }
      const box = h('div', { class: `feedback ${right ? 'good' : 'bad'}` }, h('b', {}, right ? 'Correct' : 'Not quite'), h('span', { html: st.why || '' }));
      fb.appendChild(box);
      const n = nav(() => { i += 1; show(); });
      fb.appendChild(n.el);
      revealFeedback(box);
      n.go.focus({ preventScroll: true });
      setKeys(null);
    }
  }

  async function verse(st) {
    const holder = h('div', { class: 'stack' }, loadingEl('Loading the verse…'));
    body.appendChild(holder);
    const s = Number(st.verse.split(':')[0]);
    const v = await getVerse(st.verse).catch(() => null);
    clear(holder);
    if (v) {
      holder.appendChild(h('div', { class: 'label' }, `${D.surahs[s - 1].name} ${st.verse}`));
      holder.appendChild(h('div', { class: 'card' }, verseEl(v, s, { gloss: true, transl: true, head: true })));
      holder.appendChild(h('p', { class: 'small muted' }, 'Tap any word for its root, grammar and meaning.'));
      if (st.note) holder.appendChild(h('div', { class: 'callout' }, h('span', { class: 'label' }, 'Look closely'), h('p', { html: st.note })));
    } else holder.appendChild(h('p', { class: 'muted' }, `Verse ${st.verse} could not be loaded (offline?).`));
    const n = nav(() => { i += 1; show(); });
    body.appendChild(n.el);
    setKeys((e) => { if (e.key === 'Enter' && document.activeElement?.tagName !== 'BUTTON') n.go.click(); });
  }

  function wordsStep() {
    const fresh = words.filter((v) => !card(`v${v.id}`) || card(`v${v.id}`).st === 0);
    body.appendChild(h('h2', {}, fresh.length ? `New words (${fresh.length})` : 'Words of this lesson'));
    body.appendChild(h('p', { class: 'muted' }, fresh.length
      ? 'Read each card: the root and the Turkish words are the fastest way in. A short check at the end adds them to your review deck.'
      : 'You already have all of these in your deck.'));
    const grid = h('div', { class: 'stack' });
    for (const v of (fresh.length ? fresh : words)) grid.appendChild(wordCard(v, { compact: !fresh.length }));
    body.appendChild(grid);
    const n = nav(() => { i += 1; show(); });
    body.appendChild(n.el);
    setKeys(null);
  }

  function finish() {
    if (retry.length) {
      steps.push(...retry.splice(0));
      show();
      return;
    }
    setKeys(null);
    const fresh = words.filter((v) => { const c = card(`v${v.id}`); return !c || c.st === 0; });
    if (fresh.length) {
      body.appendChild(h('h2', {}, 'Word check'));
      const holder = h('div', { class: 'stack' });
      body.appendChild(holder);
      runWordQuiz(holder, fresh, () => done(fresh.length), { title: `Word check · ${lesson.title}` });
    } else done(0);
  }

  function done(added) {
    clear(body);
    bar.style.width = '100%';
    const score = quizTotal ? quizRight / quizTotal : 1;
    completeLesson(lesson.id, score);
    const covAfter = coverage().known;
    const nextL = LESSONS[lesson.n] || null;
    body.appendChild(h('div', { class: 'done-burst' },
      h('span', { html: star8() }),
      h('h2', {}, `Lesson ${lesson.n} complete`),
      h('p', { class: 'muted' }, quizTotal ? `${quizRight} of ${quizTotal} checks right on the first try.` : 'Well done.'),
      added ? h('p', {}, `${added} words added to your review deck. Quran coverage ${pct(covBefore, 1)} → `, h('b', {}, pct(covAfter, 1)), '.') : null));
    body.appendChild(h('div', { class: 'row', style: { justifyContent: 'center' } },
      nextL ? h('a', { class: 'btn', href: `#lesson-${nextL.id}`, html: `Next: ${nextL.title} ${icon('next')}` }) : h('a', { class: 'btn', href: '#quran' }, 'Open the Quran'),
      h('a', { class: 'btn ghost', href: '#home' }, 'Home')));
    if (lesson.id === 'welcome') body.appendChild(h('div', { class: 'callout', style: { marginTop: '1rem' } }, h('span', { class: 'label' }, 'Next step'),
      h('p', { html: noteHtml('Your first words will come back for review tomorrow. Today, try the next lesson or learn 10 new words from Home.') })));
  }

  show();
  return () => setKeys(null);
}

function shuffleIdx(n) {
  const a = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
