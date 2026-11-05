// Static check: the service worker caches every file the app needs offline.
// A module missing from its list would load from the network, and after the
// next release a page could mix code from two versions.
// Usage: node tests/precache.mjs
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const app = new URL('../app/', import.meta.url).pathname;
const sw = readFileSync(join(app, 'sw.js'), 'utf8');
const listed = new Set([...sw.match(/const FILES = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map((m) => m[1]));

const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [relative(app, p)];
});
const needed = [
  'index.html', 'manifest.webmanifest',
  ...walk(join(app, 'js')), ...walk(join(app, 'css')),
  ...readdirSync(join(app, 'data')).filter((f) => f.endsWith('.json')).map((f) => `data/${f}`),
];

let failed = 0;
for (const f of needed) if (!listed.has(f)) { console.log('FAIL not precached:', f); failed += 1; }
for (const f of listed) if (!existsSync(join(app, f))) { console.log('FAIL listed but missing:', f); failed += 1; }
if (!/^const VERSION = 'lisan-dev';$/m.test(sw)) { console.log("FAIL sw.js must keep `const VERSION = 'lisan-dev';` for the deploy workflow to stamp"); failed += 1; }
console.log(failed ? `${failed} problems` : `ok   ${listed.size} files precached, every module and core data file included`);
process.exit(failed ? 1 : 0);
