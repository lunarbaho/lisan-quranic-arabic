// Small DOM + data helpers shared by every view.

/** Hyperscript: h('div', {class: 'x', onclick}, child, [children], 'text') */
export function h(tag, props, ...children) {
  const el = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, v);
    }
  }
  append(el, children);
  return el;
}

function append(el, children) {
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    if (Array.isArray(c)) append(el, c);
    else if (c instanceof Node) el.appendChild(c);
    else el.appendChild(document.createTextNode(String(c)));
  }
}

export function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Wrap a string that may be Arabic so it renders right-to-left. */
export function arSpan(text, cls = 'ar') {
  return h('span', { class: cls, lang: 'ar', dir: 'rtl' }, text);
}

export const ARABIC_RE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sample(arr, n) { return shuffle(arr).slice(0, n); }
export function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export function debounce(fn, ms) {
  let t;
  const d = (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  d.flush = (...args) => { clearTimeout(t); fn(...args); };
  return d;
}

/** Local calendar day as YYYY-MM-DD (the unit for streaks and daily goals). */
export function dayKey(d = new Date()) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export function addDays(key, n) {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + n));
}

export const DAY = 86400000;

export function fmtInterval(days) {
  if (days < 1 / 24) return `${Math.max(1, Math.round(days * 1440))}m`;
  if (days < 1) return `${Math.round(days * 24)}h`;
  if (days < 30) return `${Math.round(days)}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${(days / 365).toFixed(1)}y`;
}

export function pct(x, digits = 0) { return `${(x * 100).toFixed(digits)}%`; }

/** Format a corpus root like "قول" as spaced letters "ق و ل". */
export function rootLetters(root) { return root ? [...root].join(' ') : ''; }

const DIAC = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
export function bare(s) {
  return (s || '').replace(DIAC, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/[ؤ]/g, 'و').replace(/[ئ]/g, 'ي').replace(/ء/g, '');
}

export function toast(msg, ms = 2200) {
  let el = document.querySelector('.toast');
  if (!el) { el = h('div', { class: 'toast', role: 'status', 'aria-live': 'polite' }); document.body.appendChild(el); }
  el.textContent = msg;
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), ms);
}

export function safeStorage() {
  try {
    const k = '__lisan_probe__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return window.localStorage;
  } catch { return null; }
}
