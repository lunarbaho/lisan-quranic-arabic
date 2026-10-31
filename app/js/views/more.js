import { h } from '../util.js';
import { icon } from '../icons.js';
import { topbar, env } from '../ui.js';

export function render(root) {
  const items = [
    ['practice', 'Practice', 'Drills from real verses', 'practice'],
    ['vocab', 'My words', 'Every word and its review status', 'words'],
    ['roots', 'Roots', 'Explore word families', 'roots'],
    ['grammar', 'Grammar', 'Reference tables', 'grammar'],
    env.teacher ? ['teacher', 'Teacher', 'Ask questions in Türkçe, English or Deutsch', 'teacher'] : null,
    ['prefs', 'Preferences', 'Language, pace, size, backup', 'prefs'],
    ['about', 'About Lisan', 'Method and sources', 'info'],
  ].filter(Boolean);
  const view = h('div', { class: 'view' }, topbar('More'));
  view.appendChild(h('div', { class: 'stack' }, items.map(([id, t, d, ic]) => h('a', { class: 'card action', href: `#${id}` },
    h('span', { class: 'glyph', html: icon(ic) }), h('div', { class: 'stack-s' }, h('h3', {}, t), h('span', { class: 'small muted' }, d)), h('span', { html: icon('next') })))));
  root.appendChild(view);
}
