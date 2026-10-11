// Slow a page's motion down, do one interaction, and save the frames side by side in one image.
// Usage (from a project with Playwright installed):
//   node filmstrip.mjs <url> <steps> [--speed 0.25] [--frames 8] [--every 60] [--clip x,y,w,h] [--out film] [--size 1280x800] [--dark] [--reduce]
// Steps are comma-separated, run in order:
//   click:#notch   hover:.card   press:Enter   focus:#notch   key:Escape   wait:300   film   film:900
//   "film" captures --frames frames, one every --every ms of real time; "film:900" spreads them over 900 ms instead.
//   Steps before the first "film" set the scene; you can film more than once (e.g. open, then close).
// Output: <out>/strip-1.png (frames with timestamps), <out>/frames.json (every running animation at each frame).
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';

let chromium;
try { ({ chromium } = createRequire(join(process.cwd(), 'package.json'))('playwright')); }
catch { console.error('Playwright not found here. Run: npm i -D playwright && npx playwright install chromium'); process.exit(1); }

const [url, stepsArg] = process.argv.slice(2);
if (!url || !stepsArg) { console.error('usage: node filmstrip.mjs <url> <steps> [options]  (see the top of this file)'); process.exit(1); }
const opt = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > -1 ? process.argv[i + 1] : d; };
const speed = Number(opt('speed', '0.25'));
const count = Number(opt('frames', '8'));
const every = Number(opt('every', '60'));
const out = resolve(opt('out', 'film'));
const [vw, vh] = opt('size', '1280x800').split('x').map(Number);
const clip = opt('clip') ? (([x, y, width, height]) => ({ x, y, width, height }))(opt('clip').split(',').map(Number)) : null;
mkdirSync(out, { recursive: true });

// Slow every clock the page can read, before any script caches it. CSS and Web Animations are
// slowed separately through DevTools, so springs written in JS and CSS transitions stay in step.
const slowClock = (k) => {
  const realNow = performance.now.bind(performance), t0 = realNow();
  const now = () => t0 + (realNow() - t0) * k;
  performance.now = now;
  const dateNow = Date.now, d0 = dateNow();
  Date.now = () => d0 + (dateNow() - d0) * k;
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => raf(() => cb(now()));
  const st = window.setTimeout.bind(window), si = window.setInterval.bind(window);
  window.setTimeout = (fn, ms = 0, ...a) => st(fn, ms / k, ...a);
  window.setInterval = (fn, ms = 0, ...a) => si(fn, ms / k, ...a);
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: 2,
  colorScheme: process.argv.includes('--dark') ? 'dark' : 'light',
  reducedMotion: process.argv.includes('--reduce') ? 'reduce' : 'no-preference' });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.addInitScript(slowClock, speed);
const cdp = await ctx.newCDPSession(page);
await cdp.send('Animation.enable');
await cdp.send('Animation.setPlaybackRate', { playbackRate: speed });
await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(1000 / speed > 4000 ? 4000 : 1000 / speed);

const runningAnimations = () => page.evaluate(() => document.getAnimations().map((a) => {
  const el = a.effect?.target; const t = a.effect?.getComputedTiming?.() || {};
  return { target: el ? el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.classList?.length ? '.' + [...el.classList].join('.') : '') : null,
    name: a.animationName || a.transitionProperty || a.id || a.constructor.name, progress: t.progress == null ? null : +t.progress.toFixed(3), state: a.playState };
}));

const strips = [], log = [];
let filmNo = 0;
for (const step of stepsArg.split(',').map((s) => s.trim()).filter(Boolean)) {
  const [kind, ...rest] = step.split(':'); const arg = rest.join(':');
  if (kind === 'click') await page.click(arg);
  else if (kind === 'hover') await page.hover(arg);
  else if (kind === 'focus') await page.focus(arg);
  else if (kind === 'press') await page.keyboard.press(arg);
  else if (kind === 'key') await page.keyboard.press(arg);
  else if (kind === 'wait') await page.waitForTimeout(Number(arg) / speed);
  else if (kind === 'film') {
    filmNo++;
    const gap = arg ? Number(arg) / Math.max(1, count - 1) : every;
    const frames = []; const start = Date.now();
    for (let i = 0; i < count; i++) {
      const target = start + (i * gap) / speed;
      const wait = target - Date.now(); if (wait > 0) await page.waitForTimeout(wait);
      const shot = await page.screenshot(clip ? { clip } : {});
      const ms = Math.round((Date.now() - start) * speed);
      frames.push({ ms, png: shot.toString('base64') });
      log.push({ film: filmNo, frame: i + 1, ms, animations: await runningAnimations() });
    }
    strips.push(frames);
  } else { console.error(`unknown step "${step}"`); process.exit(1); }
}

// Lay each film out as one strip, with the time each frame shows (in the page's own, unslowed time).
const sheet = await ctx.newPage();
for (const [n, frames] of strips.entries()) {
  const cols = Math.min(frames.length, 4);
  await sheet.setContent(`<style>body{margin:0;background:#1d1d1f;font:600 22px -apple-system,sans-serif;color:#fff}
    .g{display:grid;grid-template-columns:repeat(${cols},1fr);gap:8px;padding:8px}
    figure{margin:0;position:relative}img{width:100%;display:block;border-radius:6px}
    figcaption{position:absolute;left:8px;top:8px;background:rgba(0,0,0,.7);padding:2px 8px;border-radius:6px}</style>
    <div class="g">${frames.map((f) => `<figure><img src="data:image/png;base64,${f.png}"><figcaption>${f.ms} ms</figcaption></figure>`).join('')}</div>`);
  await sheet.setViewportSize({ width: 1600, height: 800 });
  await sheet.waitForFunction(() => [...document.images].every((i) => i.complete));
  await sheet.locator('.g').screenshot({ path: join(out, `strip-${n + 1}.png`) });
}
writeFileSync(join(out, 'frames.json'), JSON.stringify({ url, steps: stepsArg, speed, errors, frames: log }, null, 2));
await browser.close();
console.log(`${strips.length} strip(s) in ${out}${errors.length ? `\npage errors: ${errors.join(' | ')}` : ''}`);
