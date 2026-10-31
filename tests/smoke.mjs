// Smoke test: open every screen in headless Chromium and fail on console errors.
// Usage: python3 -m http.server 8765 -d app &  node tests/smoke.mjs [baseUrl] [shotDir]
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const base = process.argv[2] || 'http://localhost:8765/';
const shots = process.argv[3] || '';
const routes = ['home', 'learn', 'lesson-welcome', 'lesson-attached', 'lesson-kursi', 'review', 'words', 'vocab', 'practice',
  'practice-meaning', 'practice-root', 'practice-person', 'practice-tense', 'practice-pronoun', 'practice-form', 'practice-case',
  'quran', 'surah-1', 'surah-2-255', 'surah-114', 'roots', 'root-0', 'grammar', 'grammar-forms', 'prefs', 'about', 'more', 'teacher'];

const browser = await chromium.launch();
let failures = 0;
for (const vp of [{ name: 'phone', width: 390, height: 844 }, { name: 'desktop', width: 1280, height: 860 }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, colorScheme: vp.name === 'desktop' ? 'dark' : 'light' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(base + '#home');
  await page.waitForSelector('.view', { timeout: 15000 });
  for (const r of routes) {
    errors.length = 0;
    await page.evaluate((h) => { location.hash = h; }, '#' + r);
    await page.waitForTimeout(r.startsWith('surah') || r.startsWith('practice-') || r.startsWith('root') ? 1800 : 700);
    const text = await page.evaluate(() => document.querySelector('main')?.innerText || '');
    const broken = text.includes('could not be opened');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    if (errors.length || broken || overflow) {
      failures += 1;
      console.log(`FAIL [${vp.name}] #${r}`, broken ? 'view error' : '', overflow ? 'horizontal overflow' : '', errors.slice(0, 3));
    } else console.log(`ok   [${vp.name}] #${r}`);
    if (shots) await page.screenshot({ path: `${shots}/${vp.name}-${r}.png`, fullPage: false });
  }
  await ctx.close();
}
await browser.close();
console.log(failures ? `${failures} failures` : 'all screens ok');
process.exit(failures ? 1 : 0);
