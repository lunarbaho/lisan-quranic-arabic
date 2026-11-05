import { h, toast } from '../util.js';
import { S, setSetting, exportState, importState, resetAll, sync } from '../store.js';
import { topbar, inlineConfirm, env } from '../ui.js';
import { audioAvailable, RECITERS, MODES, reciterChanged } from '../audio.js';

function seg(id, options, current, onPick) {
  const el = h('div', { class: 'seg', role: 'group', id });
  for (const [v, label] of options) {
    el.appendChild(h('button', { 'aria-pressed': String(v === current), type: 'button', onclick: () => {
      [...el.children].forEach((b, i) => b.setAttribute('aria-pressed', String(options[i][0] === v)));
      onPick(v);
    } }, label));
  }
  return el;
}
function toggle(id, key, label) {
  const input = h('input', { type: 'checkbox', id, checked: !!S.settings[key] });
  input.addEventListener('change', () => setSetting(key, input.checked));
  return h('label', { class: 'switch', title: label }, input, h('span'));
}
const pref = (title, desc, control) => h('div', { class: 'pref' }, h('div', { class: 'stack-s', style: { gap: '.1rem' } }, h('b', {}, title), desc ? h('span', { class: 'd' }, desc) : null), control);

export function render(root) {
  const view = h('div', { class: 'view' }, topbar('Preferences'));
  view.appendChild(h('section', { class: 'card', 'aria-label': 'Learning' },
    pref('Meanings and translations in', 'Word meanings, flashcards and verse translations (Diyanet for Türkçe, Bubenheim & Elyas for Deutsch).',
      seg('pref-lang', [['en', 'English'], ['tr', 'Türkçe'], ['de', 'Deutsch']], S.settings.lang, (v) => setSetting('lang', v))),
    pref('New words per day', 'The course has about 700 core words.',
      seg('pref-daily', [[5, '5'], [10, '10'], [15, '15'], [20, '20'], [30, '30']], S.settings.dailyNew, (v) => setSetting('dailyNew', v))),
    pref('Show Turkish cognates', 'Turkish words from the same Arabic root, on cards and in the word sheet.', toggle('pref-cog', 'cognates', 'Turkish cognates')),
    env.teacher ? pref('Teacher answers in', null, seg('pref-tlang', [['en', 'English'], ['tr', 'Türkçe'], ['de', 'Deutsch']], S.settings.teacherLang, (v) => setSetting('teacherLang', v))) : null));

  view.appendChild(h('section', { class: 'card', 'aria-label': 'Reading' },
    pref('Arabic size', null, seg('pref-size', [[0.85, 'S'], [1, 'M'], [1.2, 'L'], [1.4, 'XL']], S.settings.arScale, (v) => setSetting('arScale', v))),
    pref('Word meanings under Quran words', null, toggle('pref-gloss', 'gloss', 'Word meanings')),
    pref('Verse translation', null, toggle('pref-transl', 'transl', 'Translation')),
    pref('Color the words I know', 'Green = known, gold = still learning.', toggle('pref-known', 'known', 'Known-word colors')),
    pref('Theme', null, seg('pref-theme', [['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']], S.settings.theme, (v) => setSetting('theme', v)))));

  if (audioAvailable()) {
    const sel = h('select', { id: 'pref-reciter', 'aria-label': 'Reciter' },
      Object.entries(RECITERS).map(([k, [name]]) => h('option', { value: k, selected: (S.settings.reciter || 'alafasy') === k }, name)));
    sel.addEventListener('change', () => { setSetting('reciter', sel.value); reciterChanged(); });
    view.appendChild(h('section', { class: 'card', 'aria-label': 'Recitation' },
      pref('Reciter', 'Verse recitations from EveryAyah.', sel),
      pref('When you tap a verse', 'Play surah always goes on to the end. You can also switch this in the player while listening.',
        seg('pref-playmode', Object.entries(MODES).map(([k, m]) => [k, m.label]), S.settings.playMode || 'once', (v) => setSetting('playMode', v)))));
  }

  const backup = h('section', { class: 'card stack', 'aria-label': 'Your data' }, h('h2', {}, 'Your progress'));
  backup.appendChild(h('p', { class: 'small muted' }, sync.status === 'synced'
    ? 'Synced to your Claude account: open Lisan from the same link on any device and continue where you left off.'
    : 'Saved in this browser. Copy a backup to move your progress to another device or browser.'));
  const out = h('textarea', { id: 'backup-out', readonly: true, 'aria-label': 'Backup code', rows: '3' });
  const copyBtn = h('button', { class: 'btn small', type: 'button', onclick: async () => {
    out.value = exportState();
    try { await navigator.clipboard.writeText(out.value); toast('Backup copied'); }
    catch { out.hidden = false; out.focus(); out.select(); toast('Select the text and copy it'); }
  } }, 'Copy backup');
  out.hidden = true;
  const input = h('textarea', { id: 'backup-in', placeholder: 'Paste a backup here to restore it (it is merged with what you have).', 'aria-label': 'Paste backup', rows: '3' });
  const restoreBtn = h('button', { class: 'btn ghost small', type: 'button', onclick: () => {
    try { importState(input.value); input.value = ''; toast('Progress restored'); }
    catch (e) { toast(e.message || 'That backup could not be read'); }
  } }, 'Restore');
  backup.append(h('div', { class: 'row' }, copyBtn), out, input, h('div', { class: 'row' }, restoreBtn));
  const resetRow = h('div', { class: 'stack-s' });
  resetRow.appendChild(h('button', { class: 'btn ghost small', style: { justifySelf: 'start', color: 'var(--coral)' }, type: 'button', onclick: () =>
    inlineConfirm(resetRow, 'Delete all progress — lessons, words and history? This cannot be undone.', 'Delete everything', () => { resetAll(); toast('Progress deleted'); location.hash = '#home'; }) }, 'Reset all progress'));
  backup.appendChild(resetRow);
  view.appendChild(backup);
  root.appendChild(view);
}
