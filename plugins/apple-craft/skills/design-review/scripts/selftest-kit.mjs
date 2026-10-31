// Self-test the kit's own demo pages: motion-kit and design-patterns HTML files, served locally.
//
//   npm i -D playwright && npx playwright install chromium
//   node selftest-kit.mjs [--quick] [--webkit]
//
// Loads every .html file in ../../motion-kit/ and ../../design-patterns/ over a local http server,
// at 1440x900 and 390x844 (isMobile, hasTouch), light and dark: page errors, console
// errors, failed requests, sideways scrolling and broken images. Then, unless --quick,
// runs reduced-motion.mjs and hover-probe.mjs against each page and collects their
// results. Prints one summary table, writes it to selftest-report.md in the current
// directory, and exits 1 on any failure.
import { createRequire as __cr } from 'node:module';
import { join as __join, basename, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
let chromium, webkit;
try { ({ chromium, webkit } = __cr(__join(process.cwd(), 'package.json'))('playwright')); }
catch { console.error('Playwright not found here. Run: npm i -D playwright && npx playwright install chromium'); process.exit(1); }
import { readdirSync, readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { spawnSync, spawn } from 'node:child_process';
import { tmpdir } from 'node:os';

const quick = process.argv.includes('--quick');
const here = dirname(fileURLToPath(import.meta.url));
const roots = [__join(here, '../../motion-kit'), __join(here, '../../design-patterns')];
const pages = [];
for (const root of roots) {
  let names = [];
  try { names = readdirSync(root); } catch { continue; }
  for (const n of names.sort()) if (n.endsWith('.html')) pages.push(__join(root, n));
}
if (!pages.length) { console.error('No .html pages found in motion-kit/ or design-patterns/.'); process.exit(1); }

const combos = [
  { tag: 'desktop/light', viewport: { width: 1440, height: 900 }, scheme: 'light' },
  { tag: 'desktop/dark', viewport: { width: 1440, height: 900 }, scheme: 'dark' },
  { tag: 'phone/light', viewport: { width: 390, height: 844 }, scheme: 'light', isMobile: true, hasTouch: true },
  { tag: 'phone/dark', viewport: { width: 390, height: 844 }, scheme: 'dark', isMobile: true, hasTouch: true },
];

// Serve the skills folder over http: file:// pages block CSS masks and canvas reads that work on a real site.
// The server runs in its own process because spawnSync below blocks this one.
const skillsRoot = __join(here, '../..');
const serverCode = `
const http = require('http'), fs = require('fs'), path = require('path');
const root = process.argv[1];
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.json': 'application/json' };
http.createServer((req, res) => {
  const file = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(0, '127.0.0.1', function () { console.log('ready ' + this.address().port); });`;
const server = spawn(process.execPath, ['-e', serverCode, skillsRoot], { stdio: ['ignore', 'pipe', 'inherit'] });
const port = await new Promise((resolve, reject) => {
  server.stdout.on('data', (d) => { const m = String(d).match(/ready (\d+)/); if (m) resolve(Number(m[1])); });
  server.on('exit', () => reject(new Error('static server exited')));
});
const urlFor = (file) => `http://127.0.0.1:${port}/${file.slice(skillsRoot.length + 1).split(/[\\/]/).map(encodeURIComponent).join('/')}`;
process.on('exit', () => server.kill());

// --webkit runs the same pass in WebKit, the engine behind Safari (npx playwright install webkit).
const engine = process.argv.includes('--webkit') ? webkit : chromium;
const browser = await engine.launch();
const rows = [];
try {
  for (const file of pages) {
    const url = urlFor(file);
    const errors = [], overflows = [], broken = new Set();
    for (const c of combos) {
      const page = await browser.newPage({
        viewport: c.viewport, colorScheme: c.scheme,
        ...(c.isMobile ? { isMobile: true, hasTouch: true } : {}),
      });
      page.on('pageerror', (e) => errors.push(`${c.tag}: ${String(e.message).split('\n')[0]}`));
      page.on('console', (m) => { if (m.type() === 'error') errors.push(`${c.tag}: console: ${m.text().slice(0, 120)}`); });
      page.on('requestfailed', (r) => errors.push(`${c.tag}: request failed: ${r.url().slice(-80)}`));
      page.on('response', (r) => { if (!r.ok()) errors.push(`${c.tag}: ${r.status()} ${r.url().slice(-80)}`); });
      await page.goto(url, { waitUntil: 'load' }).catch((e) => errors.push(`${c.tag}: goto: ${String(e.message).split('\n')[0]}`));
      await page.waitForTimeout(800);
      const height = await page.evaluate(() => document.documentElement.scrollHeight).catch(() => 0);
      for (let y = 0; y < height; y += c.viewport.height / 2) {
        await page.evaluate((v) => window.scrollTo(0, v), y).catch(() => {});
        await page.waitForTimeout(60);
      }
      await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
      await page.waitForTimeout(300);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth).catch(() => 0);
      if (over > 0) overflows.push(`${c.tag}: +${Math.round(over)}px`);
      const bad = await page.evaluate(() => [...document.querySelectorAll('img')]
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.getAttribute('src') || '(no src)')).catch(() => []);
      for (const src of bad) broken.add(`${c.tag}: ${src}`);
      await page.close().catch(() => {});
    }

    let rm = 'PASS', hover = '-';
    if (!quick) {
      const rmRun = spawnSync('node', [__join(here, 'reduced-motion.mjs'), url], { cwd: process.cwd(), encoding: 'utf8' });
      const rmLines = String(rmRun.stdout ?? '').split('\n').filter((l) => /^(PASS|FAIL|CHECK) /.test(l.trim()));
      const fails = rmLines.filter((l) => l.trim().startsWith('FAIL '));
      rm = fails.length ? `FAIL: ${fails.map((l) => l.trim().slice(5, 80)).join('; ')}` : 'PASS';
      const out = mkdtempSync(__join(tmpdir(), 'selftest-hover-'));
      spawnSync('node', [__join(here, 'hover-probe.mjs'), url, '--out', out], { cwd: process.cwd(), encoding: 'utf8' });
      let results = [];
      try { results = JSON.parse(readFileSync(__join(out, 'hover-probe.json'), 'utf8')).results ?? []; } catch {}
      const flags = new Set();
      for (const r of results) {
        const isCtl = /^(a|button)\b/.test(r.selector ?? '');
        for (const f of r.flags ?? []) {
          if (f === 'MOVES_ON_HOVER' || f === 'MOVES_ON_PRESS' || f === 'STICKY_TOUCH') flags.add(f);
          else if (f === 'NO_HOVER' && isCtl) flags.add(`NO_HOVER (${r.selector})`);
        }
      }
      hover = flags.size ? [...flags].join(', ') : 'clean';
    }
    rows.push({ page: basename(file), errors, overflows, broken: [...broken], rm, hover });
    const bad = errors.length || overflows.length || broken.size
      || rm.startsWith('FAIL') || /MOVES_ON_(HOVER|PRESS)/.test(hover);
    console.log(`${basename(file)}: ${bad ? 'FAIL' : 'PASS'} (${errors.length} errors, overflow ${overflows.length ? overflows.join('; ') : 'none'}, broken ${broken.size ? [...broken].join('; ') : 'none'}, motion ${rm}, hover ${hover})`);
  }
} finally {
  await browser.close();
}

const cell = (a) => (a.length ? a.join('<br>') : '-');
console.log('\n| page | errors | overflow | broken images | reduced motion | hover |');
console.log('|---|---|---|---|---|---|');
for (const r of rows) console.log(`| ${r.page} | ${cell(r.errors)} | ${cell(r.overflows)} | ${cell(r.broken)} | ${r.rm} | ${r.hover} |`);

const report = ['# Kit self-test report', '',
  `Date: ${new Date().toISOString()}${quick ? ' (--quick: probe pass skipped)' : ''}`, '',
  '| page | errors | overflow | broken images | reduced motion | hover |',
  '|---|---|---|---|---|---|',
  ...rows.map((r) => `| ${r.page} | ${cell(r.errors)} | ${cell(r.overflows)} | ${cell(r.broken)} | ${r.rm} | ${r.hover} |`), ''];
writeFileSync(__join(process.cwd(), 'selftest-report.md'), report.join('\n'));
console.log('\nWrote selftest-report.md.');

server.kill();
if (rows.some((r) => r.errors.length || r.overflows.length || r.broken.length || r.rm.startsWith('FAIL') || /MOVES_ON_(HOVER|PRESS)/.test(r.hover))) process.exit(1);
process.exit(0);
