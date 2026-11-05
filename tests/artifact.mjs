// Artifact-mode test: bundled single page + stubbed claude.ai runtime (db, user, sample).
// Usage: python3 tools/build_artifact.py build/artifact
//        python3 -m http.server 8766 -d build/artifact &  node tests/artifact.mjs http://localhost:8766/
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const url = process.argv[2] || 'http://localhost:8766/';
const shots = process.argv[3] || '';
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 390, height: 844 } });
// the claude.ai runtime, as the page sees it: a private db, the user, and sampling for the teacher
await page.addInitScript(() => {
  window.__dbWrites = 0;
  const docs = {};
  const sample = async (msgs, opts) => {
    window.__lastInput = msgs;
    const text = '**bold** answer about الإِضَافَة\n\n| a | b |\n|---|---|\n| 1 | 2 |';
    if (opts && opts.onText) opts.onText({ text });
    return { text, truncated: false };
  };
  sample.limits = async () => ({ tools: false });
  window.claude = {
    async use(name) {
      if (name === 'db') return { doc: (path) => ({
        async get() { return { exists: !!docs[path], data: () => docs[path] }; },
        async set(v) { docs[path] = v; window.__dbWrites += 1; },
      }) };
      if (name === 'user') return { id: async () => 'learner-1' };
      if (name === 'sample') return sample;
      return null;
    },
  };
});
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
const check = (c, m) => { console.log(c ? 'ok  ' : 'FAIL', m); if (!c) process.exitCode = 1; };
await page.goto(url + '#home');
await page.waitForSelector('.stats', { timeout: 20000 });
await page.waitForTimeout(1500);
check(await page.$('a.tab[href="#more"]'), 'shell renders from the inline bundle');
await page.evaluate(() => { location.hash = '#lesson-kinds'; });
await page.waitForSelector('.lesson-body');
await page.waitForTimeout(800);
const rail = await page.evaluate(() => !!document.querySelector('.topbar .icon-btn[title*="teacher"]'));
check(rail, 'teacher button appears when sample is available');
await page.evaluate(() => { location.hash = '#surah-1'; });
await page.waitForSelector('.qw');
check(!(await page.$('.verse-head button[title="Play recitation"]')), 'audio buttons hidden in artifact mode');
await page.evaluate(() => { location.hash = '#teacher'; });
await page.waitForSelector('#teacher-input');
await page.fill('#teacher-input', 'What is iḍāfa?');
await page.click('.composer .btn:not([hidden])');
await page.waitForSelector('.msg.ai strong', { timeout: 5000 });
if (shots) await page.screenshot({ path: `${shots}/artifact-teacher.png` });
const ai = await page.innerHTML('.msg.ai:last-child');
check(ai.includes('<strong>bold</strong>') && ai.includes('class="ar"') && ai.includes('<table>'), 'teacher answer renders markdown, Arabic and tables safely');
const input = await page.evaluate(() => window.__lastInput);
check(Array.isArray(input) && input[0].content.includes('Turkish') && input[input.length - 1].content.includes('iḍāfa'), 'teacher prompt carries learner profile and question');
await page.waitForTimeout(3500);
const writes = await page.evaluate(() => window.__dbWrites || 0);
check(writes > 0, `progress is synced to the db (${writes} writes)`);
check(errors.length === 0, `no console errors ${errors.slice(0, 3).join(' | ')}`);
await b.close();
