// Lisan — app bootstrap, navigation and routing.
import { h, clear, isolateArabic } from './util.js';
import { icon, logo } from './icons.js';
import { loadCore, loadLemmas } from './data.js';
import { S, onChange, dueKeys, connectRemote } from './store.js';
import { closeSheet, stopAudio, env } from './ui.js';
import { initTeacher } from './teacher.js';

const NAV = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'learn', label: 'Course', icon: 'path' },
  { id: 'review', label: 'Review', icon: 'cards', badge: true },
  { id: 'quran', label: 'Quran', icon: 'quran' },
  { id: 'practice', label: 'Practice', icon: 'practice', rail: true },
  { id: 'vocab', label: 'My words', icon: 'words', rail: true },
  { id: 'roots', label: 'Roots', icon: 'roots', rail: true },
  { id: 'grammar', label: 'Grammar', icon: 'grammar', rail: true },
  { id: 'teacher', label: 'Teacher', icon: 'teacher', rail: true, needsTeacher: true },
  { id: 'prefs', label: 'Preferences', icon: 'prefs', rail: true },
  { id: 'about', label: 'About', icon: 'info', rail: true },
  { id: 'more', label: 'More', icon: 'more', tab: true },
];

const VIEWS = {
  home: () => import('./views/home.js'),
  learn: () => import('./views/learn.js'),
  lesson: () => import('./views/lesson.js'),
  review: () => import('./views/review.js'),
  words: () => import('./views/words.js'),
  vocab: () => import('./views/vocab.js'),
  practice: () => import('./views/practice.js'),
  quran: () => import('./views/quran.js'),
  surah: () => import('./views/reader.js'),
  roots: () => import('./views/roots.js'),
  root: () => import('./views/roots.js'),
  grammar: () => import('./views/grammar.js'),
  teacher: () => import('./views/teacher.js'),
  prefs: () => import('./views/prefs.js'),
  about: () => import('./views/about.js'),
  more: () => import('./views/more.js'),
};
// which nav item is highlighted for a route
const SECTION = { lesson: 'learn', words: 'home', surah: 'quran', root: 'roots' };
const sectionOf = (route) => (route.name === 'words' && route.arg.startsWith('surah-') ? 'quran' : SECTION[route.name] || route.name);

let main, rail, tabbar, cleanup = null, renderSeq = 0;

function applyTheme() {
  // "auto" leaves data-theme alone, so a host page (claude.ai) or the OS decides
  const t = S.settings.theme;
  const el = document.documentElement;
  if (t === 'light' || t === 'dark') { el.setAttribute('data-theme', t); el.dataset.lisanThemeSet = '1'; }
  else if (el.dataset.lisanThemeSet) { el.removeAttribute('data-theme'); delete el.dataset.lisanThemeSet; }
  el.style.setProperty('--ar-scale', S.settings.arScale || 1);
}

function navItems(filter) {
  return NAV.filter(filter).filter((n) => !n.needsTeacher || env.teacher);
}

function buildShell(root) {
  rail = h('nav', { class: 'rail', 'aria-label': 'Main' },
    h('a', { class: 'brand', href: '#home', html: `${logo(34)}<span class="brand-name">Lisan</span><span class="brand-ar" lang="ar">لِسَان</span>` }));
  tabbar = h('nav', { class: 'tabbar', 'aria-label': 'Main' });
  main = h('main', { class: 'main', id: 'main', tabindex: '-1' });
  clear(root).append(h('div', { class: 'shell' }, rail, main), tabbar);
  paintNav();
}

function paintNav() {
  const route = currentRoute();
  const section = sectionOf(route);
  const due = dueKeys().length;
  rail.querySelectorAll('a.nav, .rail-foot').forEach((x) => x.remove());
  for (const n of navItems((x) => !x.tab)) {
    const a = h('a', { class: 'nav', href: `#${n.id}`, 'aria-current': section === n.id ? 'page' : null, html: `${icon(n.icon)}<span>${n.label}</span>` });
    if (n.badge && due) a.appendChild(h('span', { class: 'count tnum' }, String(due)));
    rail.appendChild(a);
  }
  rail.appendChild(h('div', { class: 'rail-foot' }, h('span', { lang: 'ar', dir: 'rtl', class: 'q-text' }, 'بِلِسَانٍ عَرَبِيٍّ مُبِينٍ'), h('span', {}, 'In a clear Arabic tongue — 26:195')));
  clear(tabbar);
  const tabIds = ['home', 'learn', 'review', 'quran', 'more'];
  const moreSections = NAV.filter((n) => n.rail).map((n) => n.id);
  for (const id of tabIds) {
    const n = NAV.find((x) => x.id === id);
    const active = section === id || (id === 'more' && (moreSections.includes(section) || section === 'more'));
    const a = h('a', { class: 'tab', href: `#${id}`, 'aria-current': active ? 'page' : null, html: `${icon(n.icon)}<span>${n.label}</span>` });
    if (n.badge && due) a.appendChild(h('span', { class: 'dot tnum' }, due > 99 ? '99+' : String(due)));
    tabbar.appendChild(a);
  }
}

export function currentRoute() {
  const raw = decodeURIComponent((location.hash || '#home').slice(1)) || 'home';
  const m = raw.match(/^([a-z]+)(?:-(.*))?$/);
  if (!m || !VIEWS[m[1]]) return { name: 'home', arg: '' };
  return { name: m[1], arg: m[2] || '' };
}

// a new version of the app was installed while this page was open: it is
// loaded at the next change of screen, never in the middle of one
let updateReady = false;

async function render() {
  if (updateReady) { location.reload(); return; }
  const seq = ++renderSeq;
  const route = currentRoute();
  closeSheet();
  stopAudio();
  if (cleanup) { try { cleanup(); } catch { /* view already gone */ } cleanup = null; }
  paintNav();
  try {
    let mod;
    try { mod = await VIEWS[route.name](); }
    catch (e) { if (reloadForUpdate()) return; throw e; }
    if (seq !== renderSeq) return;
    clear(main);
    window.scrollTo({ top: 0 });          // a view may then scroll where it needs to (e.g. a verse)
    const ret = await mod.render(main, route.arg, route.name);
    if (seq !== renderSeq) { if (typeof ret === 'function') ret(); return; }
    cleanup = typeof ret === 'function' ? ret : null;
  } catch (e) {
    console.error(e);
    if (seq !== renderSeq) return;
    clear(main).appendChild(h('div', { class: 'view' }, h('div', { class: 'card stack' },
      h('h2', {}, 'This page could not be opened'),
      h('p', { class: 'muted' }, String(e.message || e)),
      h('p', {}, navigator.onLine === false ? 'You are offline. Pages you have opened before work offline; this one needs a connection first.' : 'Reload the app to try again. Your progress is saved.'),
      h('div', { class: 'row' },
        h('button', { class: 'btn', type: 'button', onclick: () => location.reload() }, 'Reload'),
        h('a', { class: 'btn ghost', href: '#home' }, 'Go to Home')))));
  }
  main.focus({ preventScroll: true });
}

/** A screen's code failed to load. Usually the app was just updated: reload once. */
function reloadForUpdate() {
  if (navigator.onLine === false) return false;
  try {
    const last = +sessionStorage.getItem('lisan.reloadedAt') || 0;
    if (Date.now() - last < 30000) return false;      // already tried: show the error instead
    sessionStorage.setItem('lisan.reloadedAt', String(Date.now()));
  } catch { return false; }
  location.reload();
  return true;
}

export function rerender() { render(); }

async function boot() {
  const root = document.getElementById('app');
  applyTheme();
  root.innerHTML = '<div class="loading" style="min-height:90vh"><div class="spinner"></div><span>Opening Lisan…</span></div>';
  try {
    await loadCore();
  } catch (e) {
    root.innerHTML = '';
    root.appendChild(h('div', { class: 'loading', style: { minHeight: '90vh' } },
      h('h2', {}, 'Lisan could not load its word list'),
      h('p', { class: 'muted' }, 'Serve the app folder over http(s) — opening index.html directly from disk blocks the data files.'),
      h('code', {}, 'python3 -m http.server -d app 8000')));
    return;
  }
  buildShell(root);
  // Arabic inside Latin text, wherever a view or lesson puts it, gets the Arabic font and its own direction
  isolateArabic(document.body);
  new MutationObserver((records) => {
    for (const r of records) for (const n of r.addedNodes) isolateArabic(n);
  }).observe(document.body, { childList: true, subtree: true });
  onChange(() => { applyTheme(); paintNav(); });
  window.addEventListener('hashchange', render);
  if ('serviceWorker' in navigator) {
    const controlled = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (controlled) updateReady = true; });
  }
  await render();
  loadLemmas().then(() => { if (currentRoute().name === 'home') paintNav(); }).catch(() => {});
  // optional claude.ai runtime: synced progress + AI teacher
  if (env.artifact) {
    connectRemote().then((ok) => { if (ok && ['home', 'learn', 'vocab'].includes(currentRoute().name)) render(); });
    initTeacher().then((ok) => { if (ok) { paintNav(); if (['home', 'more'].includes(currentRoute().name)) render(); } });
  }
}

boot();
