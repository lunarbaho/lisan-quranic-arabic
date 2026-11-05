// Interaction test: a learner's first day, end to end.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const base = process.argv[2] || 'http://localhost:8765/';
const shots = process.argv[3] || '';
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
const check = (cond, msg) => { if (!cond) { console.log('FAIL', msg); process.exitCode = 1; } else console.log('ok  ', msg); };
const shot = (n) => shots && page.screenshot({ path: `${shots}/flow-${n}.png` });

await page.goto(base + '#home');
await page.waitForSelector('.view');
await page.click('text=Türkçe');
await page.click('text=Start lesson 1');
await page.waitForSelector('.lesson-body');

// walk through the lesson: answer quizzes (first option), continue otherwise.
// The first option is right about one time in four, and a missed word comes
// back until it is answered right, so leave plenty of room.
let guard = 0;
while (guard++ < 600) {
  if (await page.$('.done-burst')) break;
  const opt = await page.$('.options .opt:not([disabled])');
  if (opt) { await opt.click(); await page.waitForTimeout(120); continue; }
  const go = await page.$('.lesson-nav .btn:last-child');
  if (go) { await go.click(); await page.waitForTimeout(250); continue; }
  await page.waitForTimeout(300);
}
await shot('lesson-done');
await page.waitForTimeout(700); // let the debounced save flush
check(await page.$('.done-burst'), 'lesson 1 can be completed');
const st = await page.evaluate(() => JSON.parse(localStorage.getItem('lisan.v1')));
check(Object.keys(st.cards).length >= 8, `lesson words were added to the deck (${Object.keys(st.cards).length})`);
check(st.lessons.welcome?.done, 'lesson marked done');
check(st.settings.lang === 'tr', 'meaning language set to Turkish');

// new words session
await page.evaluate(() => { location.hash = '#words'; });
await page.waitForSelector('.lesson-nav .btn');
guard = 0;
while (guard++ < 600) {
  if (await page.$('.done-burst')) break;
  const opt = await page.$('.options .opt:not([disabled])');
  if (opt) { await opt.click(); await page.waitForTimeout(100); continue; }
  const go = await page.$('.lesson-nav .btn:last-child');
  if (go) { await go.click(); await page.waitForTimeout(150); continue; }
  await page.waitForTimeout(250);
}
await shot('words-done');
await page.waitForTimeout(700);
const st2 = await page.evaluate(() => JSON.parse(localStorage.getItem('lisan.v1')));
check(Object.keys(st2.cards).length >= 15, `new-words session added words (${Object.keys(st2.cards).length})`);

// make everything due and review
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('lisan.v1'));
  for (const c of Object.values(s.cards)) c.due = Date.now() - 1000;
  localStorage.setItem('lisan.v1', JSON.stringify(s));
});
await page.goto(base + '#review');
await page.reload();
await page.waitForSelector('.flash');
await shot('review-front');
await page.keyboard.press('Space');
await page.waitForSelector('.grades');
await shot('review-back');
guard = 0;
while (guard++ < 200) {
  if (await page.$('.done-burst')) break;
  if (await page.$('.grades')) { await page.keyboard.press('3'); await page.waitForTimeout(60); continue; }
  if (await page.$('.flash')) { await page.keyboard.press('Space'); await page.waitForTimeout(60); continue; }
  await page.waitForTimeout(150);
}
check(await page.$('.done-burst'), 'review session completes');

// reader word sheet
await page.evaluate(() => { location.hash = '#surah-1'; });
await page.waitForSelector('.qw');
await page.click('#v1-5 .qw >> nth=3');
await page.waitForSelector('.sheet.open');
await page.waitForTimeout(400);
await shot('word-sheet');
const sheetText = await page.innerText('.sheet');
check(/parts of the word/i.test(sheetText) && /Form X/.test(sheetText), 'word sheet explains نَسْتَعِينُ as Form X');
await page.keyboard.press('Escape');

// home reflects progress
await page.evaluate(() => { location.hash = '#home'; });
await page.waitForSelector('.stats');
await shot('home-after');
const cov = await page.innerText('.stat.turq .num');
check(cov !== '0%', `home shows Quran coverage (${cov})`);
check(errors.length === 0, `no console errors (${errors.slice(0, 3).join(' | ')})`);
await b.close();
