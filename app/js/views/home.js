import { h, clear, pct, dayKey } from '../util.js';
import { icon, logo } from '../icons.js';
import { D, gloss } from '../data.js';
import { S, streak, dueKeys, coverage, newWordsLeftToday, nextNewVocab, today, setSetting, lessonDone, wordStatus, unseenKeys } from '../store.js';
import { LESSONS } from '../content/lessons.js';
import { env } from '../ui.js';

const MILESTONES = [0.25, 0.5, 0.7, 0.8, 0.85];

function greeting() {
  const hr = new Date().getHours();
  if (hr < 11) return { ar: 'صَبَاحُ الْخَيْرِ', en: 'Good morning' };
  if (hr < 18) return { ar: 'السَّلَامُ عَلَيْكُمْ', en: 'As-salāmu ʿalaykum' };
  return { ar: 'مَسَاءُ الْخَيْرِ', en: 'Good evening' };
}

function onboarding(rerender) {
  const box = h('section', { class: 'card raised stack', 'aria-label': 'Set up' },
    h('h2', {}, 'Ahlan wa sahlan! Two quick choices'),
    h('p', { class: 'muted' }, 'Lessons are in English. Word meanings and verse translations can be shown in your favourite language — you can change both later in Preferences.'));
  const langSeg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Meaning language' });
  for (const [k, label] of [['en', 'English'], ['tr', 'Türkçe'], ['de', 'Deutsch']]) {
    const b = h('button', { 'aria-pressed': String(S.settings.lang === k), onclick: () => { S.settings.teacherLang = k; setSetting('lang', k); paint(); } }, label);
    langSeg.appendChild(b);
  }
  const paceSeg = h('div', { class: 'seg', role: 'group', 'aria-label': 'New words per day' });
  for (const n of [10, 15, 20, 30]) paceSeg.appendChild(h('button', { 'aria-pressed': String(S.settings.dailyNew === n), onclick: () => { setSetting('dailyNew', n); paint(); } }, `${n}/day`));
  const est = h('p', { class: 'small muted' });
  function paint() {
    [...langSeg.children].forEach((b, i) => b.setAttribute('aria-pressed', String(['en', 'tr', 'de'][i] === S.settings.lang)));
    [...paceSeg.children].forEach((b, i) => b.setAttribute('aria-pressed', String([10, 15, 20, 30][i] === S.settings.dailyNew)));
    est.textContent = `At ${S.settings.dailyNew} words a day you will know all ${D.vocab.length} core words in about ${Math.ceil(D.vocab.length / S.settings.dailyNew / 7)} weeks.`;
  }
  paint();
  box.append(h('div', { class: 'stack-s' }, h('span', { class: 'label' }, 'Meanings in'), langSeg),
    h('div', { class: 'stack-s' }, h('span', { class: 'label' }, 'New words per day'), paceSeg, est),
    h('div', { class: 'row' }, h('button', { class: 'btn', onclick: () => { setSetting('onboarded', true); location.hash = '#lesson-welcome'; } }, 'Start lesson 1'),
      h('button', { class: 'btn ghost', onclick: () => { setSetting('onboarded', true); rerender(); } }, 'Look around first')));
  return box;
}

function coverageCard() {
  const cov = coverage();
  const next = MILESTONES.find((m) => m > cov.known);
  const bar = h('div', { class: 'cov-bar', role: 'img', 'aria-label': `${pct(cov.known)} of the Quran's words known` },
    h('span', { style: { width: `${Math.min(100, cov.known * 100)}%` } }), ...MILESTONES.map((m) => h('i', { style: { left: `${m * 100}%` } })));
  const scale = h('div', { class: 'cov-scale' }, ...MILESTONES.map((m) => h('span', { style: { left: `${m * 100}%` } }, `${m * 100}%`)));
  return h('section', { class: 'card coverage', 'aria-label': 'Quran coverage' },
    h('div', { class: 'row spread' }, h('h3', {}, 'How much of the Quran you can recognize'), h('span', { class: 'chip turq tnum' }, pct(cov.known, 1))),
    bar, scale,
    h('p', { class: 'small muted' }, cov.words
      ? `You know the core word of ${pct(cov.known, 1)} of all 77,429 words in the Quran${next ? ` — next milestone ${pct(next)}` : ''}. ${pct(cov.mature, 1)} are already in long-term memory.`
      : 'Every word you learn lights up part of the Quran. The first 50 words alone cover almost half of it.'));
}

function verseOfDay() {
  // a short example verse where the learner knows the most words; rotates daily
  const scored = [];
  for (const v of D.vocab) {
    const ex = v.ex;
    if (!ex || ex.ar.length < 4 || ex.ar.length > 12) continue;
    const known = ex.l.filter((l) => ['known', 'learning'].includes(wordStatus(l))).length;
    scored.push({ ex, ratio: known / ex.ar.length });
  }
  if (!scored.length) return null;
  scored.sort((a, b) => b.ratio - a.ratio || a.ex.ref.localeCompare(b.ex.ref));
  const pool = scored.slice(0, Math.max(12, Math.floor(scored.length * 0.05)));
  const seed = [...dayKey()].reduce((s, c) => s + c.charCodeAt(0), 0);
  const { ex, ratio } = pool[seed % pool.length];
  const words = h('div', { class: 'verse-words show-known' }, ex.ar.map((w, i) => {
    const st = wordStatus(ex.l[i]);
    return h('span', { class: `qw ${st === 'known' ? 'known' : st === 'learning' ? 'learning' : ''}`, lang: 'ar', style: { cursor: 'default' } }, w);
  }));
  return h('section', { class: 'card stack', 'aria-label': 'Verse of the day' },
    h('div', { class: 'row spread' }, h('span', { class: 'label' }, 'Verse of the day'), h('span', { class: 'chip leaf tnum' }, `${Math.round(ratio * 100)}% known`)),
    words, h('p', { class: 'verse-tr' }, ex[S.settings.lang] || ex.en),
    h('a', { class: 'btn ghost small', href: `#surah-${ex.ref.replace(':', '-')}`, style: { justifySelf: 'start' } }, `Read ${ex.ref} in context`));
}

export function render(root) {
  const view = h('div', { class: 'view' });
  root.appendChild(view);
  const paint = () => {
    clear(view);
    const g = greeting();
    view.appendChild(h('header', { class: 'row spread' },
      h('a', { class: 'brand mobile-only', href: '#home', html: `${logo(30)}<span class="brand-name">Lisan</span>` }),
      h('span', { class: 'chip gold', title: 'Days in a row', html: `${icon('flame')} <span class="tnum">${streak()}</span> day streak` })));
    view.appendChild(h('div', { class: 'hero' }, h('span', { class: 'greet-ar', lang: 'ar', dir: 'rtl' }, g.ar),
      h('h1', {}, `${g.en}.`), h('p', { class: 'muted' }, new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }))));

    if (!S.settings.onboarded) view.appendChild(onboarding(paint));

    const cov = coverage();
    const t = today();
    view.appendChild(h('div', { class: 'stats' },
      h('div', { class: 'stat gold' }, h('span', { class: 'num' }, String(streak())), h('span', { class: 'cap' }, 'day streak')),
      h('div', { class: 'stat cobalt' }, h('span', { class: 'num' }, String(cov.words)), h('span', { class: 'cap' }, 'words learned')),
      h('div', { class: 'stat turq' }, h('span', { class: 'num' }, pct(cov.known)), h('span', { class: 'cap' }, 'of the Quran'))));

    // today's actions
    const due = dueKeys().length + unseenKeys().length;
    const left = newWordsLeftToday();
    const nextLesson = LESSONS.find((l) => !lessonDone(l.id));
    const actions = h('section', { class: 'stack', 'aria-label': 'Today' }, h('h2', {}, 'Today'));
    actions.appendChild(h('a', { class: 'card action coral', href: '#review' },
      h('span', { class: 'glyph', html: icon('cards') }),
      h('div', { class: 'stack-s' }, h('h3', {}, due ? `Review ${due} word${due === 1 ? '' : 's'}` : 'Reviews done'),
        h('span', { class: 'small muted' }, due ? 'Due now — about ' + Math.max(1, Math.round(due * 0.12)) + ' min' : `${t.r} reviews today. Next ones arrive automatically.`)),
      h('span', { html: icon('next') })));
    if (nextLesson) {
      actions.appendChild(h('a', { class: 'card action', href: `#lesson-${nextLesson.id}` },
        h('span', { class: 'glyph', html: icon('path') }),
        h('div', { class: 'stack-s' }, h('h3', {}, `Lesson ${nextLesson.n}: ${nextLesson.title}`), h('span', { class: 'small muted' }, `${nextLesson.goal} · ${nextLesson.mins} min`)),
        h('span', { html: icon('next') })));
    }
    const nextWords = nextNewVocab(3);
    actions.appendChild(h('a', { class: 'card action turq', href: '#words' },
      h('span', { class: 'glyph', html: icon('sparkle') }),
      h('div', { class: 'stack-s' }, h('h3', {}, left ? `Learn ${Math.min(left, 10)} new words` : 'New words: goal reached'),
        h('span', { class: 'small muted' }, nextWords.length ? `Next: ${nextWords.map((v) => `${v.ar} (${gloss(v, S.settings.lang).split(/[;,]/)[0]})`).join(' · ')}` : 'You have every core word. Add more from the Reader.')),
      h('span', { html: icon('next') })));
    view.appendChild(actions);

    view.appendChild(coverageCard());
    const vod = verseOfDay();
    if (vod) view.appendChild(vod);

    view.appendChild(h('section', { class: 'grid2', 'aria-label': 'More' },
      h('a', { class: 'card action gold', href: '#practice' }, h('span', { class: 'glyph', html: icon('practice') }),
        h('div', { class: 'stack-s' }, h('h3', {}, 'Practice with real verses'), h('span', { class: 'small muted' }, 'Meanings, roots, tenses, pronouns')), h('span', {})),
      env.teacher
        ? h('a', { class: 'card action', href: '#teacher' }, h('span', { class: 'glyph', html: icon('teacher') }),
          h('div', { class: 'stack-s' }, h('h3', {}, 'Ask your teacher'), h('span', { class: 'small muted' }, 'Grammar, tafsir, in Türkçe or Deutsch')), h('span', {}))
        : h('a', { class: 'card action', href: '#quran' }, h('span', { class: 'glyph', html: icon('quran') }),
          h('div', { class: 'stack-s' }, h('h3', {}, 'Open the Quran'), h('span', { class: 'small muted' }, `Continue at ${S.reader.s}:${S.reader.a}`)), h('span', {}))));
  };
  paint();
}
