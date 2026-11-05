// Interaction test: the recitation player, undoable word adds, review undo,
// lesson resume and screen-scoped keyboard shortcuts.
// Recitation audio is answered with a short silent clip, so the test needs no
// network and runs in seconds.
// Usage: python3 -m http.server 8765 -d app &  node tests/interactions.mjs [baseUrl]
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const base = process.argv[2] || 'http://localhost:8765/';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
let failed = 0;
const check = (cond, msg) => { console.log(cond ? 'ok  ' : 'FAIL', msg); if (!cond) failed += 1; };

// 0.7 s of silence as a WAV file
function silentWav(seconds = 0.7, rate = 8000) {
  const n = Math.round(seconds * rate);
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(rate, 24); buf.writeUInt32LE(rate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  return buf;
}
const clip = silentWav();
const requested = [];
await ctx.route(/everyayah\.com|audio\.qurancdn\.com/, (route) => {
  requested.push(route.request().url());
  route.fulfill({ status: 200, body: clip, headers: { 'Content-Type': 'audio/wav', 'Access-Control-Allow-Origin': '*' } });
});

// word timings: every verse gets three words across the 0.7 s clip
await ctx.route(/api\.quran\.com\/api\/v4\/verses\/by_chapter\/\d+/, (route) => {
  const s = +/by_chapter\/(\d+)/.exec(route.request().url())[1];
  const verses = Array.from({ length: 300 }, (_, i) => ({ verse_key: `${s}:${i + 1}`, audio: { url: '', segments: [[0, 1, 0, 230], [1, 2, 230, 460], [2, 3, 460, 690]] } }));
  route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ verses, pagination: { next_page: null } }) });
});

const audio = () => page.evaluate(() => ({
  marked: [...document.querySelectorAll('.playing[data-play]')].map((x) => x.dataset.play + (x.classList.contains('paused') ? ' paused' : '')),
  head: document.querySelector('#play-surah')?.textContent.trim(),
  stop: !document.querySelector('#stop-surah')?.hidden,
  bar: !document.querySelector('.player')?.hidden,
}));
const go = async (hash, sel) => { await page.evaluate((h) => { location.hash = h; }, hash); if (sel) await page.waitForSelector(sel); await page.waitForTimeout(300); };

await page.goto(base + '#home');
await page.waitForSelector('.view');

// ---------------- the surah player ----------------
await go('#surah-112', '#v112-4 .verse-play');
let a = await audio();
check(a.head === 'Play surah' && !a.stop && !a.bar && !a.marked.length, 'reader opens idle');
await page.click('#play-surah');
await page.waitForFunction(() => document.querySelector('.bismillah.playing'), null, { timeout: 5000 });
a = await audio();
check(a.head === 'Pause' && a.stop && a.bar, 'Play surah starts with the basmala; Pause and Stop appear');
await page.waitForFunction(() => document.querySelector('[data-play="112:1"].playing'), null, { timeout: 5000 });
check(true, 'continues to verse 1 by itself');
await page.click('#play-surah');                       // pause
a = await audio();
const pausedAt = a.marked[0];
check(a.head === 'Resume' && / paused$/.test(pausedAt || ''), `Pause keeps the verse marked as paused (${pausedAt})`);
await page.waitForTimeout(1500);
check((await audio()).marked[0] === pausedAt, 'nothing moves while paused');
await page.click('#play-surah');                       // resume
a = await audio();
check(a.head === 'Pause' && a.marked[0] === pausedAt.replace(' paused', ''), 'Resume continues at the same verse, not from the start');
await page.click('#stop-surah');
a = await audio();
check(a.head === 'Play surah' && !a.stop && !a.bar && a.marked.length === 0, 'Stop clears the highlight and the player');

// one verse: play, pause, resume, and it stops by itself at its end
await page.click('#v112-3 .verse-play');
await page.waitForFunction(() => document.querySelector('#v112-3 .verse-play')?.getAttribute('aria-label') === 'Pause verse 3', null, { timeout: 5000 });
check((await audio()).marked.join() === '112:3', 'a verse button plays its verse');
await page.click('#v112-3 .verse-play');
check(await page.getAttribute('#v112-3 .verse-play', 'aria-label') === 'Resume verse 3' && (await audio()).marked[0] === '112:3 paused', 'the same button pauses it');
await page.click('#v112-3 .verse-play');
await page.waitForFunction(() => !document.querySelector('.playing[data-play]'), null, { timeout: 5000 });
a = await audio();
check(!a.bar && a.head === 'Play surah', 'a single verse ends by itself and clears its highlight');

// the word being recited is marked, and the mark goes when the recitation stops
await page.click('#v112-1 .verse-play');
await page.waitForSelector('#v112-1 .qw.reciting', { timeout: 5000 }).catch(() => {});
const lit = await page.evaluate(() => [...document.querySelectorAll('.qw.reciting')].map((x) => x.closest('.verse').id + ' word ' + x.dataset.w));
check(lit.length === 1 && lit[0].startsWith('v112-1 '), `the word being recited is marked (${lit.join()})`);
await page.click('.player .icon-btn[aria-label="Stop recitation"]');
check(!(await page.$('.qw.reciting')), 'the word mark goes when the recitation stops');

// repeat mode loops the verse; next / previous move inside the surah
await page.click('#v112-2 .verse-play');
await page.waitForSelector('.player:not([hidden])');
await page.click('.player-mode');                      // once → continue
await page.click('.player-mode');                      // continue → repeat
await page.waitForTimeout(2000);
check((await audio()).marked[0] === '112:2', 'Repeat keeps playing the same verse');
await page.click('.player .icon-btn[aria-label="Next verse"]');
await page.waitForTimeout(200);
check((await audio()).marked[0] === '112:3', 'Next verse moves on');
await page.click('.player .icon-btn[aria-label="Stop recitation"]');
await page.click('#v112-4 .verse-play');
await page.waitForSelector('.player:not([hidden])');
check((await page.getAttribute('.player-mode', 'aria-label')).startsWith('Playback: Repeat'), 'the next verse tapped starts in the mode chosen last (Repeat)');
await page.click('.player .icon-btn[aria-label="Stop recitation"]');

// a word clip pauses the verse instead of silently killing it
await page.click('#v112-1 .verse-play');
await page.waitForSelector('.player:not([hidden])');
await page.click('#v112-1 .qw >> nth=0');
await page.waitForSelector('.sheet.open .word-audio');
await page.click('.sheet .word-audio');
await page.waitForTimeout(200);
check((await audio()).marked[0] === '112:1 paused', 'hearing a word pauses the verse, which can be resumed');
await page.keyboard.press('Escape');
await page.waitForTimeout(300);

// a lesson shows one verse, so its play button plays just that verse, whatever the Reader remembers
await go('#lesson-welcome', '.lesson-body');
for (let k = 0; k < 12 && !(await page.$('.lesson-body .verse-play')); k++) {
  const opt = await page.$('.options .opt:not([disabled])');
  if (opt) { await opt.click(); await page.waitForTimeout(150); continue; }
  await page.click('.lesson-nav .btn:last-child');
  await page.waitForTimeout(250);
}
await page.click('.lesson-body .verse-play');
await page.waitForFunction(() => document.querySelector('.lesson-body .verse.playing'), null, { timeout: 5000 });
await page.waitForFunction(() => !document.querySelector('.playing[data-play]'), null, { timeout: 5000 }).catch(() => {});
check(!(await page.$('.playing[data-play]')), 'a lesson verse plays once and stops');

// leaving the reader stops everything
await go('#surah-112', '#v112-1 .verse-play');
await page.click('#v112-1 .verse-play');
await page.waitForSelector('.player:not([hidden])');
await go('#home', '.stats');
await go('#surah-112', '#v112-1');
a = await audio();
check(!a.marked.length && a.head === 'Play surah', 'leaving the reader stops the recitation');
check(requested.some((u) => u.includes('/112001.mp3')) && requested.some((u) => u.includes('/001001.mp3')), 'verse and basmala recordings were requested');

// ---------------- adding words, undoable ----------------
const cards = () => page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('lisan.v1') || '{}').cards || {}));
await page.waitForTimeout(500);
const before = (await cards()).length;
await go('#root-0', '.list-item .deck button');
await page.click('.list .list-item .deck button');
await page.waitForTimeout(500);
check((await page.innerText('.list .list-item .deck')).includes('Added') && (await cards()).length === before + 1, 'Add on a root page adds the word');
await page.click('.list .list-item .deck button');
await page.waitForTimeout(500);
check((await page.innerText('.list .list-item .deck')).includes('Add') && (await cards()).length === before, 'tapping Added again takes it back out');
await page.click('.list .list-item .deck button');
await page.click('.toast .toast-act');
await page.waitForTimeout(500);
check((await cards()).length === before, 'Undo in the toast takes it back out');
await go('#surah-1', '#v1-2 .qw');
await page.click('#v1-2 .qw >> nth=2');
await page.waitForSelector('.sheet.open .deck button');
await page.click('.sheet .deck button');
await page.waitForTimeout(400);
check(/Added/.test(await page.innerText('.sheet .deck')) && (await cards()).length === before + 1, 'the word sheet adds a word');
await page.click('.sheet .deck button');
await page.waitForTimeout(400);
check(/Add to my words/.test(await page.innerText('.sheet .deck')) && (await cards()).length === before, 'and its Undo removes it again');
await page.keyboard.press('Escape');

// ---------------- review: undo a mis-tap ----------------
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('lisan.v1'));
  s.cards = {};
  for (const k of ['v1', 'v2', 'v3']) s.cards[k] = { s: 5, d: 5, due: Date.now() - 1000, last: Date.now() - 6 * 86400000, reps: 3, lapses: 0, st: 2 };
  localStorage.setItem('lisan.v1', JSON.stringify(s));
});
await page.goto(base + '#review');
await page.reload();
await page.waitForSelector('.flash');
const front = await page.innerText('.flash .ar-big');
await page.keyboard.press('Space');
await page.waitForSelector('.grades');
await page.keyboard.press('1');
await page.waitForTimeout(400);
await page.click('#review-undo');
await page.waitForTimeout(400);
const after = await page.evaluate(() => JSON.parse(localStorage.getItem('lisan.v1')).cards);
check(await page.innerText('.flash .ar-big') === front && Object.values(after).every((c) => c.lapses === 0 && c.reps === 3), 'Undo takes back a mis-tapped grade and shows the card again');

// ---------------- an abandoned quiz never answers for another screen ----------------
await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('lisan.v1')); s.cards = {}; s.log = {}; localStorage.setItem('lisan.v1', JSON.stringify(s)); });
await page.goto(base + '#words');
await page.reload();
await page.waitForSelector('.lesson-nav .btn');
for (let k = 0; k < 20 && !(await page.$('.options .opt')); k++) { await page.click('.lesson-nav .btn:last-child'); await page.waitForTimeout(80); }
check(!!(await page.$('.options .opt')), 'reached the word check');
await page.waitForTimeout(700);                        // the store saves 400 ms after a change
const deck = await page.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('lisan.v1')).cards));
await go('#quran', '.surah-row');
for (const k of ['1', '2', '3', '4']) await page.keyboard.press(k);
await page.waitForTimeout(600);
check(await page.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('lisan.v1')).cards)) === deck, 'number keys on another screen do not grade the abandoned word check');

// ---------------- the Reader keeps its place ----------------
await go('#surah-2', '#v2-45');
await page.waitForTimeout(500);
await page.evaluate(() => document.getElementById('v2-40').scrollIntoView({ block: 'start' }));
await page.waitForTimeout(1200);
check(await page.evaluate(() => location.hash) === '#surah-2-40', 'the address follows the reading position');
await go('#root-3', '.list-item');
await page.goBack();
await page.waitForSelector('#v2-40');
await page.waitForTimeout(1500);
const topVerse = await page.evaluate(() => {
  const line = document.querySelector('.topbar').getBoundingClientRect().bottom + 30;
  return [...document.querySelectorAll('.verse')].find((v) => v.getBoundingClientRect().bottom > line)?.id;
});
check(topVerse === 'v2-40', `Back from a word's root returns to the same verse (${topVerse})`);

// ---------------- prepare a surah: learn its words ----------------
await go('#surah-67', '.learn-surah');
const offer = await page.innerText('.learn-surah');
await page.click('.learn-surah');
await page.waitForSelector('.lesson-nav .btn');
check(/Words of Al-Mulk/.test(await page.innerText('.topbar h1')) && /\d+ core words? of this surah/.test(await page.innerText('.topbar .sub')), `the Reader offers the surah's own words (${offer})`);

// ---------------- lessons resume after a detour ----------------
await go('#lesson-kinds', '.lesson-nav .btn');
await page.click('.lesson-nav .btn:last-child');
await page.waitForTimeout(250);
await page.click('.lesson-nav .btn:last-child');
await page.waitForTimeout(250);
const heading = await page.innerText('.lesson-body h2, .lesson-body .label');
await go('#root-0', '.list-item');
await page.goBack();
await page.waitForSelector('.resume-note');
check(await page.innerText('.lesson-body h2, .lesson-body .label') === heading, 'a lesson picks up at the same step after a detour');
await page.click('.resume-note .btn');
await page.waitForTimeout(300);
check(!(await page.$('.resume-note')) && /Ism, fiʿl, ḥarf/.test(await page.innerText('.lesson-body h2')), 'Start over goes back to step 1');

check(errors.length === 0, `no console errors ${errors.slice(0, 3).join(' | ')}`);
await b.close();
console.log(failed ? `${failed} failures` : 'all interactions ok');
process.exit(failed ? 1 : 0);
