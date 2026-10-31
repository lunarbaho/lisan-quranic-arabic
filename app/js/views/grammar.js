import { h } from '../util.js';
import { GRAMMAR } from '../content/grammar.js';
import { LESSONS } from '../content/lessons.js';
import { topbar } from '../ui.js';

export function render(root, arg) {
  const view = h('div', { class: 'view' }, topbar('Grammar', { sub: 'Quick reference tables' }));
  view.appendChild(h('p', { class: 'muted' }, 'Everything from the course in one place, for looking things up while you read. Every term also has its Turkish name in the lessons.'));
  for (const g of GRAMMAR) {
    const d = h('details', { class: 'fold', id: `g-${g.id}`, open: arg === g.id || (!arg && g.id === 'pronouns') },
      h('summary', {}, h('span', {}, g.title), h('span', { class: 'ar', lang: 'ar', style: { color: 'var(--turq)', fontSize: '1.1rem' } }, g.ar)),
      h('div', { class: 'inner', html: g.html }));
    view.appendChild(d);
  }
  view.appendChild(h('h2', {}, 'All lessons'));
  view.appendChild(h('div', { class: 'list' }, LESSONS.map((l) => h('a', { class: 'list-item', href: `#lesson-${l.id}` },
    h('span', {}, `${l.n}. ${l.title}`), h('span', { class: 'ar', lang: 'ar', style: { fontSize: '1.1rem' } }, l.ar)))));
  root.appendChild(view);
  if (arg) setTimeout(() => document.getElementById(`g-${arg}`)?.scrollIntoView({ block: 'start' }), 50);
}
