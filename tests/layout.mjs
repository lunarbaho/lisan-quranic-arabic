// Layout quality test: opens every screen (and the states inside lessons,
// drills, flashcards and the word sheet) on several devices and settings and
// fails when text collides with other text, is cut off by its container, or
// makes the page scroll sideways.
//
// Collisions are measured from the real glyph ink, not from CSS boxes:
// Arabic marks (harakat, waqf signs, the small low mīm ۭ) reach far outside
// the line box in the Quran font, which is exactly what CSS boxes hide.
//
// Usage: python3 -m http.server 8765 -d app &
//        node tests/layout.mjs [baseUrl] [--quick] [--only phone,desktop,screens,…] [--shots dir]
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const base = args.find((a) => /^https?:/.test(a)) || 'http://localhost:8765/';
const quick = args.includes('--quick');
const shotDir = args.includes('--shots') ? args[args.indexOf('--shots') + 1] : '';
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null;
if (shotDir) mkdirSync(shotDir, { recursive: true });

// Google Fonts must load for a meaningful check; use the environment's proxy when there is one.
const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;
const browser = await chromium.launch(proxyUrl ? { proxy: { server: proxyUrl, bypass: 'localhost,127.0.0.1' } } : {});

const CONFIGS = [
  { name: 'phone', viewport: { width: 390, height: 844 }, scheme: 'dark', settings: { lang: 'en', arScale: 1 }, lessons: 'all' },
  { name: 'phone-tr-xl', viewport: { width: 390, height: 844 }, scheme: 'light', settings: { lang: 'tr', arScale: 1.4 }, lessons: 'some' },
  { name: 'small-de-l', viewport: { width: 320, height: 640 }, scheme: 'dark', settings: { lang: 'de', arScale: 1.2, gloss: false }, lessons: 'some' },
  { name: 'tablet', viewport: { width: 768, height: 1024 }, scheme: 'light', settings: { lang: 'en', arScale: 1 }, lessons: 'some' },
  { name: 'desktop', viewport: { width: 1280, height: 860 }, scheme: 'light', settings: { lang: 'en', arScale: 1 }, lessons: 'some' },
];
const ROUTES = ['home', 'learn', 'quran', 'surah-1', 'surah-2-255', 'surah-18', 'surah-114', 'roots', 'root-0', 'root-12',
  'grammar', 'prefs', 'about', 'more', 'teacher', 'vocab', 'practice'];
const DRILLS = ['meaning', 'root', 'person', 'tense', 'pronoun', 'form', 'case'];
const SOME_LESSONS = ['welcome', 'kinds', 'number', 'attached', 'kana', 'patterns', 'negation', 'kursi'];

/* ------------------------------------------------------------------ */
/* In-page audit. Returns {issues: [...], fonts: {...}}.               */
/* ------------------------------------------------------------------ */
function audit() {
  const TOL = 1.5;                       // px of tolerated overlap
  const AR = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;
  const SKIP = 'script,style,noscript,select,option,textarea,input,code,svg';
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.textAlign = 'left';
  const range = document.createRange();
  const memo = { font: new Map(), layer: new Map(), clip: new Map(), block: new Map() };

  const describe = (el) => {
    const parts = [];
    for (let e = el; e && e !== document.body && parts.length < 3; e = e.parentElement) {
      const cls = [...e.classList].slice(0, 2).join('.');
      parts.unshift(e.tagName.toLowerCase() + (e.id ? `#${e.id}` : '') + (cls ? `.${cls}` : ''));
    }
    return parts.join(' > ');
  };
  const layerOf = (el) => {               // fixed/sticky subtrees float: compare them only among themselves
    if (!el || el === document.body) return null;
    if (memo.layer.has(el)) return memo.layer.get(el);
    const p = getComputedStyle(el).position;
    const v = p === 'fixed' || p === 'sticky' ? el : layerOf(el.parentElement);
    memo.layer.set(el, v);
    return v;
  };
  const clipsOf = (el) => {               // ancestors that cut off what overflows them
    if (!el || el === document.body || el === document.documentElement) return [];
    if (memo.clip.has(el)) return memo.clip.get(el);
    let res = clipsOf(el.parentElement);
    const cs = getComputedStyle(el);
    const hx = cs.overflowX === 'hidden' || cs.overflowX === 'clip';
    const hy = cs.overflowY === 'hidden' || cs.overflowY === 'clip';
    if (hx || hy) {
      const r = el.getBoundingClientRect();
      const l = r.left + parseFloat(cs.borderLeftWidth), t = r.top + parseFloat(cs.borderTopWidth);
      res = [...res, { el, hx, hy, ellipsis: cs.textOverflow === 'ellipsis', left: l, top: t, right: l + el.clientWidth, bottom: t + el.clientHeight }];
    }
    memo.clip.set(el, res);
    return res;
  };
  const blockOf = (el) => {               // the block whose lines this inline text is laid out in
    if (memo.block.has(el)) return memo.block.get(el);
    const v = getComputedStyle(el).display.startsWith('inline') && el.parentElement ? blockOf(el.parentElement) : el;
    memo.block.set(el, v);
    return v;
  };
  const fontOf = (el) => {
    let f = memo.font.get(el);
    if (!f) {
      const cs = getComputedStyle(el);
      f = { font: `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`, ls: cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing };
      memo.font.set(el, f);
    }
    return f;
  };

  const boxes = [];
  const issues = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!/\S/.test(n.data)) continue;
    const el = n.parentElement;
    if (!el || el.closest(SKIP)) continue;
    if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
    const { font, ls } = fontOf(el);
    ctx.font = font;
    ctx.letterSpacing = ls;
    const layer = layerOf(el);
    const clips = clipsOf(el);
    const block = blockOf(el);
    for (const m of n.data.matchAll(/\S+/g)) {
      range.setStart(n, m.index);
      range.setEnd(n, m.index + m[0].length);
      const rects = [...range.getClientRects()].filter((r) => r.width > 0.5 && r.height > 0.5);
      if (!rects.length) continue;
      ctx.direction = AR.test(m[0]) ? 'rtl' : 'ltr';
      const mt = ctx.measureText(m[0]);
      // one box per line the word sits on (bidi can split a word into several rects)
      const lines = new Map();
      for (const r of rects) {
        const k = Math.round(r.top);
        const u = lines.get(k);
        lines.set(k, u ? { left: Math.min(u.left, r.left), right: Math.max(u.right, r.right), top: r.top } : { left: r.left, right: r.right, top: r.top });
      }
      for (const [line, r] of lines) {
        const baseline = r.top + mt.fontBoundingBoxAscent;
        const box = {
          left: rects.length === 1 ? r.left - Math.max(0, mt.actualBoundingBoxLeft) : r.left,
          right: rects.length === 1 ? Math.max(r.right, r.left + mt.actualBoundingBoxRight) : r.right,
          top: baseline - mt.actualBoundingBoxAscent,
          bottom: baseline + mt.actualBoundingBoxDescent,
          base: baseline, node: n, line, layer, block, el, text: m[0],
        };
        if (box.bottom - box.top < 0.5) continue;
        boxes.push(box);
        for (const c of clips) {
          const v = c.hy && (box.top < c.top - TOL || box.bottom > c.bottom + TOL);
          const hz = c.hx && !c.ellipsis && (box.left < c.left - TOL || box.right > c.right + TOL);
          if (v || hz) {
            issues.push({ kind: 'clipped', key: `clip|${describe(el)}|${describe(c.el)}`,
              msg: `“${box.text}” in ${describe(el)} is cut off by ${describe(c.el)} (${v ? 'top/bottom' : 'sides'})` });
            break;
          }
        }
      }
    }
  }

  boxes.sort((a, b) => a.top - b.top);
  for (let i = 0; i < boxes.length; i++) {
    const a = boxes[i];
    for (let j = i + 1; j < boxes.length; j++) {
      const b = boxes[j];
      if (b.top >= a.bottom - TOL) break;
      if (a.layer !== b.layer) continue;
      if (a.node === b.node && a.line === b.line) continue;      // neighbours in one line of text
      const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      // neighbours on one line of a paragraph may touch: an italic f or an Arabic swash
      // overhangs the next character by design
      if (a.block === b.block && Math.abs(a.base - b.base) < 1.5 && w < 6) continue;
      if (w > TOL && h > TOL) {
        const [p, q] = [describe(a.el), describe(b.el)].sort();
        issues.push({ kind: 'overlap', key: `overlap|${p}|${q}`,
          msg: `“${a.text}” (${describe(a.el)}) and “${b.text}” (${describe(b.el)}) overlap by ${w.toFixed(1)}×${h.toFixed(1)}px` });
      }
    }
  }
  if (document.documentElement.scrollWidth > window.innerWidth + 1) {
    issues.push({ kind: 'overflow', key: 'overflow', msg: `page scrolls sideways (${document.documentElement.scrollWidth}px wide)` });
  }
  const fonts = {};
  for (const f of ['Amiri Quran', 'Scheherazade New', 'Alegreya Sans']) {
    fonts[f] = [...document.fonts].some((ff) => ff.family.replace(/"/g, '') === f && ff.status === 'loaded');
  }
  return { issues, fonts, boxes: boxes.length };
}

/* ------------------------------------------------------------------ */
const report = new Map();     // key -> {msg, kind, where: Set}
let checks = 0, fontWarned = false;
const slow = [];

async function check(page, cfg, label) {
  const t0 = Date.now();
  const res = await page.evaluate(audit);
  checks += 1;
  if (!fontWarned && !Object.values(res.fonts).every(Boolean)) {
    fontWarned = true;
    console.log('warning: some web fonts did not load, so fallback fonts were checked:', JSON.stringify(res.fonts));
  }
  const where = `${cfg.name} ${label}`;
  for (const is of res.issues) {
    if (!report.has(is.key)) {
      report.set(is.key, { msg: is.msg, kind: is.kind, where: new Set() });
      console.log(`  ✗ [${where}] ${is.msg}`);
    }
    report.get(is.key).where.add(where);
  }
  if (shotDir && res.issues.length) await page.screenshot({ path: `${shotDir}/${cfg.name}-${label.replace(/[^\w-]+/g, '_')}.png`, fullPage: true });
  if (Date.now() - t0 > 3000) slow.push(`${where} ${Date.now() - t0}ms`);
  return res.issues.length;
}

/** Wait until the view has finished loading, quotes are filled in and fonts are ready. */
async function settle(page) {
  await page.waitForFunction(() => {
    const main = document.querySelector('#main');
    if (!main || main.querySelector('.loading') || main.querySelector('.qref:not([data-done])')) return false;
    const n = main.querySelectorAll('.verse').length;          // the reader renders verses in chunks
    const ok = n === (window.__lastVerseCount ?? -1);
    window.__lastVerseCount = n;
    return ok;
  }, null, { timeout: 20000, polling: 150 }).catch(() => {});
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
}

async function go(page, hash) {
  await page.evaluate((h) => { window.__lastVerseCount = -1; location.hash = h; }, hash);
  await page.waitForTimeout(60);
  await settle(page);
}

async function clickAndSettle(page, handle, ms = 0) {
  await handle.click();
  if (ms) await page.waitForTimeout(ms);
  await settle(page);
}

function learnerState(settings) {
  const now = Date.now();
  const cards = {};
  for (let i = 0; i < 60; i++) cards[`v${i}`] = { s: i < 20 ? 40 : 4, d: 5, due: now - 1000, last: now - 4 * 86400000, reps: 3, lapses: 0, st: 2 };
  return { v: 1, settings: { lang: 'en', cognates: true, dailyNew: 15, theme: 'auto', arScale: 1, gloss: true, transl: true, known: true,
    teacherLang: 'en', onboarded: true, updatedAt: 1, ...settings }, lessons: { welcome: { done: now, score: 1 } }, cards,
  log: {}, reader: { s: 2, a: 255, updatedAt: 1 }, createdAt: now, updatedAt: now };
}

async function walkLesson(page, cfg, id) {
  await go(page, `#lesson-${id}`);
  for (let step = 0; step < 45; step++) {
    if (await page.$('.done-burst')) { await check(page, cfg, `lesson-${id} done`); return; }
    await check(page, cfg, `lesson-${id} step ${step}`);
    const opt = await page.$('.options .opt:not([disabled])');
    if (opt) {
      await clickAndSettle(page, opt);
      await check(page, cfg, `lesson-${id} step ${step} answered`);
    }
    const next = await page.$('.lesson-nav .btn:last-child');
    if (!next) { await page.waitForTimeout(300); continue; }
    await clickAndSettle(page, next);
  }
}

async function openPage(cfg) {
  const ctx = await browser.newContext({ viewport: cfg.viewport, colorScheme: cfg.scheme });
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(String(e)));
  await page.goto(`${base}#home`);
  await page.waitForSelector('.view', { timeout: 15000 });
  await page.evaluate((st) => localStorage.setItem('lisan.v1', JSON.stringify(st)), learnerState(cfg.settings));
  await page.reload();
  await page.waitForSelector('.view', { timeout: 15000 });
  await page.evaluate(() => Promise.all(['Amiri Quran', 'Scheherazade New', 'Alegreya Sans', 'Alegreya']
    .map((f) => document.fonts.load(`20px "${f}"`, f.startsWith('Alegreya') ? 'a' : 'بِسْمِ')))).catch(() => {});
  return { ctx, page };
}

/** Each part runs in a fresh page, so one long walk cannot exhaust the renderer. */
const PARTS = {
  async screens(page, cfg) {
    for (const r of ROUTES) {
      await go(page, `#${r}`);
      if (r === 'grammar') await page.evaluate(() => document.querySelectorAll('details.fold').forEach((d) => { d.open = true; }));
      await check(page, cfg, `#${r}`);
    }
  },
  async sheet(page, cfg) {
    await go(page, '#surah-1');
    for (const [v, w] of [[1, 0], [5, 3], [7, 8]]) {
      await page.click(`#v1-${v} .qw >> nth=${w}`);
      await page.waitForSelector('.sheet.open');
      await page.waitForTimeout(320);                            // slide-in transition
      await check(page, cfg, `word sheet 1:${v} word ${w + 1}`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(260);
    }
  },
  async review(page, cfg) {
    await go(page, '#review');
    for (let k = 0; k < (quick ? 1 : 4); k++) {
      await check(page, cfg, `review card ${k} front`);
      const ctxBtn = await page.$('.flash .btn.quiet');
      if (ctxBtn) { await clickAndSettle(page, ctxBtn); await check(page, cfg, `review card ${k} verse`); }
      await clickAndSettle(page, await page.$('.btn.block'));
      await check(page, cfg, `review card ${k} back`);
      await clickAndSettle(page, await page.$('.grade.g3'));
    }
  },
  async words(page, cfg) {
    await go(page, '#words');
    for (let k = 0; k < 10; k++) {
      if (k < 3 || !quick) await check(page, cfg, `new word ${k}`);
      const nx = await page.$('.lesson-nav .btn:last-child');
      if (!nx) break;
      await clickAndSettle(page, nx);
    }
    await check(page, cfg, 'word check');
    const o = await page.$('.options .opt');
    if (o) { await clickAndSettle(page, o); await check(page, cfg, 'word check answered'); }
  },
  async drills(page, cfg) {
    for (const d of DRILLS) {
      await go(page, `#practice-${d}`);
      await page.waitForSelector('.options .opt, .empty', { timeout: 15000 }).catch(() => {});
      await check(page, cfg, `practice-${d}`);
      const o = await page.$('.options .opt');
      if (o) { await clickAndSettle(page, o); await check(page, cfg, `practice-${d} answered`); }
    }
  },
  async lessons(page, cfg) {
    const ids = await page.evaluate(async () => (await import('./js/content/lessons.js')).LESSONS.map((l) => l.id));
    const list = cfg.lessons === 'all' && !quick ? ids : SOME_LESSONS.filter((x) => ids.includes(x));
    for (const id of list) await walkLesson(page, cfg, id);
  },
};

let failures = 0;
const t0 = Date.now();
for (const cfg of CONFIGS.filter((c) => !only || only.includes(c.name))) {
  for (const [name, run] of Object.entries(PARTS)) {
    if (only && only.some((o) => PARTS[o]) && !only.includes(name)) continue;
    const { ctx, page } = await openPage(cfg);
    try {
      await run(page, cfg);
    } catch (e) {
      failures += 1;
      console.log(`FAIL [${cfg.name} ${name}] the walk stopped: ${String(e.message || e).split('\n')[0]}`);
    }
    if (page.errors.length) { failures += 1; console.log(`FAIL [${cfg.name} ${name}] page errors:`, page.errors.slice(0, 3)); }
    await ctx.close();
  }
  console.log(`[${cfg.name}] done — ${checks} checks so far, ${Math.round((Date.now() - t0) / 1000)}s`);
}
await browser.close();

const issues = [...report.values()];
for (const kind of ['overlap', 'clipped', 'overflow']) {
  const list = issues.filter((x) => x.kind === kind);
  if (!list.length) continue;
  console.log(`\n${kind.toUpperCase()} — ${list.length} distinct problem${list.length === 1 ? '' : 's'}`);
  for (const x of list.slice(0, 80)) {
    const where = [...x.where];
    console.log(`  ✗ ${x.msg}\n      on ${where.slice(0, 4).join(' · ')}${where.length > 4 ? ` · +${where.length - 4} more` : ''}`);
  }
  if (list.length > 80) console.log(`  … and ${list.length - 80} more`);
}
if (slow.length) console.log(`\nslow checks: ${slow.slice(0, 5).join(', ')}`);
failures += issues.length;
console.log(`\n${checks} screens and states checked in ${Math.round((Date.now() - t0) / 1000)}s: ${issues.length ? `${issues.length} layout problems` : 'no overlapping, clipped or sideways-scrolling text'}`);
process.exit(failures ? 1 : 0);
