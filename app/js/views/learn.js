import { h } from '../util.js';
import { star8 } from '../icons.js';
import { lessonDone } from '../store.js';
import { LESSONS, UNITS } from '../content/lessons.js';
import { topbar } from '../ui.js';

export function render(root) {
  const done = LESSONS.filter((l) => lessonDone(l.id)).length;
  const next = LESSONS.find((l) => !lessonDone(l.id));
  const view = h('div', { class: 'view' }, topbar('Course', { sub: `${done} of ${LESSONS.length} lessons done` }));
  view.appendChild(h('p', { class: 'muted' }, 'Go in order the first time — each lesson builds on the one before. Every lesson ends with a word check that adds its words to your review deck. You can reopen any lesson at any time.'));
  for (const u of UNITS) {
    const ls = LESSONS.filter((l) => l.unit === u.n);
    const ud = ls.filter((l) => lessonDone(l.id)).length;
    const sec = h('section', { class: 'unit', 'aria-label': `Unit ${u.n}` },
      h('div', { class: 'unit-head' }, h('span', { class: 'label' }, `Unit ${u.n}`), h('span', { class: 'chip tnum' }, `${ud}/${ls.length}`),
        h('h2', {}, u.title, ' ', h('span', { class: 'ar', lang: 'ar', dir: 'rtl' }, u.ar))),
      h('p', { class: 'small muted' }, u.blurb));
    const list = h('div', { class: 'lessons' });
    for (const l of ls) {
      const isDone = lessonDone(l.id);
      const isNext = next && next.id === l.id;
      list.appendChild(h('a', { class: `lesson-row${isDone ? ' done' : ''}${isNext ? ' next' : ''}`, href: `#lesson-${l.id}` },
        h('span', { class: 'star', html: `${star8()}<b>${l.n}</b>` }),
        h('span', { class: 't' }, l.title),
        h('span', { class: 'lar', lang: 'ar', dir: 'rtl' }, l.ar),
        h('span', { class: 's' }, `${l.mins} min · ${isDone ? 'done' : isNext ? 'up next' : l.goal}`)));
    }
    sec.appendChild(list);
    view.appendChild(sec);
  }
  root.appendChild(view);
}
