// Slow a page's motion down, do one interaction, and save the frames side by side in one image.
// Usage (from a project with Playwright installed):
//   node filmstrip.mjs <url> <steps> [--speed 0.25] [--frames 8] [--every 60] [--clip x,y,w,h] [--out film] [--size 1280x800] [--dark] [--reduce] [--watch <selector>]
// Steps are comma-separated, run in order:
//   click:#notch   hover:.card   press:Enter   focus:#notch   key:Escape   wait:300   film   film:900
//   "film" captures --frames frames, one every --every ms of real time; "film:900" spreads them over 900 ms instead.
//   Steps before the first "film" set the scene; you can film more than once (e.g. open, then close).
// --watch names container(s) checked for empty frames (repeatable, comma-separated too). Without it,
//   the 5 elements whose box area changes most (>30%) between a film's first and last frame are checked.
// An EMPTY frame is a visible, grown container whose content is not yet visible (the classic panel-out
//   before content-in bug). Empty frames get a red outline plus EMPTY in the strip, a per-frame "watched"
//   entry in frames.json, and a console summary. Exit code: 0 clean, 1 error, 2 empty frame found.
// Output: <out>/strip-1.png (frames with timestamps), <out>/frames.json (every running animation at each frame).
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';

let chromium;
try { ({ chromium } = createRequire(join(process.cwd(), 'package.json'))('playwright')); }
catch { console.error('Playwright not found here. Run: npm i -D playwright && npx playwright install chromium'); process.exit(1); }

const [url, stepsArg] = process.argv.slice(2);
if (!url || !stepsArg || process.argv.includes('--help')) { console.error('usage: node filmstrip.mjs <url> <steps> [options]  (see the top of this file)'); process.exit(1); }
const opt = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > -1 ? process.argv[i + 1] : d; };
const speed = Number(opt('speed', '0.25'));
const count = Number(opt('frames', '8'));
const every = Number(opt('every', '60'));
const out = resolve(opt('out', 'film'));
const watches = [];
process.argv.forEach((a, i) => { if (a === '--watch' && process.argv[i + 1]) watches.push(process.argv[i + 1]); });
const watchSels = watches.flatMap((s) => s.split(',').map((x) => x.trim()).filter(Boolean));
const [vw, vh] = opt('size', '1280x800').split('x').map(Number);
const clip = opt('clip') ? (([x, y, width, height]) => ({ x, y, width, height }))(opt('clip').split(',').map(Number)) : null;
if (!Number.isFinite(speed) || speed <= 0 || !Number.isFinite(count) || count < 1 || !Number.isFinite(vw) || !Number.isFinite(vh)) { console.error('usage: node filmstrip.mjs <url> <steps> [--speed >0] [--frames >=1] [--size WxH]'); process.exit(1); }
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

const snapDom = (sels) => page.evaluate((sels) => {
  const els = [...document.querySelectorAll('*')].slice(0, 3000);
  const idx = new Map(els.map((el, i) => [el, i]));
  const pathOf = (el) => {
    if (el.id) return '#' + CSS.escape(el.id);
    const parts = []; let cur = el;
    while (cur && cur.parentElement && parts.length < 5) {
      const p = cur.parentElement, tag = cur.tagName.toLowerCase();
      const n = [...p.children].filter((c) => c.tagName === cur.tagName).indexOf(cur) + 1;
      parts.unshift(`${tag}:nth-of-type(${n})`);
      cur = p;
      if (cur.id) { parts.unshift('#' + CSS.escape(cur.id)); break; }
    }
    return parts.join('>');
  };
  return els.map((el, i) => {
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    return { path: pathOf(el), x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1),
      op: parseFloat(cs.opacity), disp: cs.display, vis: cs.visibility,
      text: (el.textContent || '').trim().length > 0, media: /^(IMG|SVG|VIDEO|CANVAS)$/.test(el.tagName),
      parent: el.parentElement ? (idx.get(el.parentElement) ?? -1) : -1,
      match: sels.map((s) => { try { return el.matches(s); } catch { return false; } }) };
  });
}, sels);

// Fraction of a container's content descendants that are actually visible.
const contentScore = (nodes, ci) => {
  const c = nodes[ci], chain = (j) => { const out = []; let g = j, d = 0; while (g !== -1 && d++ < 60) { out.push(g); if (g === ci) break; g = nodes[g].parent; } return out; };
  const desc = nodes.map((_, j) => j).filter((j) => j !== ci && chain(j).includes(ci));
  const cands = desc.filter((j) => nodes[j].text || nodes[j].media);
  if (!cands.length) return 0;
  const inside = (j) => { const r = nodes[j]; return r.w > 0 && r.h > 0 && r.x < c.x + c.w && r.x + r.w > c.x && r.y < c.y + c.h && r.y + r.h > c.y; };
  let vis = 0;
  for (const j of cands) {
    const ch = chain(j);
    if (!inside(j) || ch.some((k) => nodes[k].disp === 'none' || nodes[k].vis === 'hidden')) continue;
    if (ch.reduce((p, k) => p * nodes[k].op, 1) >= 0.35) vis++;
  }
  return vis / cands.length;
};

const strips = [], log = [];
const emptySummary = [];
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
    const recs = []; const start = Date.now();
    const startNodes = await snapDom(watchSels);
    for (let i = 0; i < count; i++) {
      const target = start + (i * gap) / speed;
      const wait = target - Date.now(); if (wait > 0) await page.waitForTimeout(wait);
      const shot = await page.screenshot(clip ? { clip } : {});
      const ms = Math.round((Date.now() - start) * speed);
      recs.push({ ms, png: shot.toString('base64'), anims: await runningAnimations(), nodes: await snapDom(watchSels) });
    }
    // Watched containers: explicit --watch selectors, else the 5 elements whose area
    // changed most (>30%) between this film's first and last frame.
    let watchers;
    if (watchSels.length) {
      watchers = watchSels.flatMap((s, k) => recs[0].nodes.map((n, j) => n.match[k] ? { sel: s, ref: n.path } : null).filter(Boolean));
    } else {
      const area = (ns, p) => { const n = ns.find((q) => q.path === p); return n ? n.w * n.h : 0; };
      const paths = [...new Set(recs[0].nodes.concat(recs[recs.length - 1].nodes).map((n) => n.path))];
      watchers = paths.map((p) => {
        const a0 = area(recs[0].nodes, p), a1 = area(recs[recs.length - 1].nodes, p);
        const ch = a0 < 1 ? (a1 > 1 ? Infinity : 0) : Math.abs(a1 - a0) / a0;
        return { sel: p, ref: p, ch, d: Math.abs(a1 - a0) };
      }).filter((w) => w.ch > 0.3).sort((a, b) => b.d - a.d).slice(0, 5);
    }
    const idxOf = (nodes, ref) => nodes.findIndex((n) => n.path === ref);
    const rowOf = (nodes, j) => (j < 0 ? null : { w: nodes[j].w, h: nodes[j].h, op: nodes[j].op, s: contentScore(nodes, j) });
    // Precompute per-watcher minima and maxima across the film, then judge each frame.
    // The film-start snapshot counts toward the minimum so the pre-growth size is seen
    // even though the first screenshot lands ~100 ms into the film.
    const stats = new Map(watchers.map((w) => {
      const rows = [{ nodes: startNodes }, ...recs.map((r) => ({ nodes: r.nodes }))].map((o) => rowOf(o.nodes, idxOf(o.nodes, w.ref)));
      const areas = rows.map((r) => (r ? r.w * r.h : 0));
      return [w.ref + '\0' + w.sel, { rows: rows.slice(1), min: Math.min(...areas), maxS: Math.max(...rows.map((r) => (r ? r.s : 0))) }];
    }));
    const frames = recs.map((r, i) => {
      const last = i === recs.length - 1;
      const watched = watchers.map((w) => {
        const st = stats.get(w.ref + '\0' + w.sel), row = st.rows[i];
        if (!row) return { selector: w.sel, w: 0, h: 0, opacity: 0, contentVisible: 0, empty: false };
        const area = row.w * row.h;
        const grown = area > 1 && area >= 1.5 * Math.max(st.min, 1);
        const smallest = area <= st.min * 1.001 + 1;
        const empty = row.op >= 0.5 && grown && row.s < 0.2 && st.maxS >= 0.5 && !((i === 0 || last) && smallest);
        return { selector: w.sel, w: row.w, h: row.h, opacity: +row.op.toFixed(3), contentVisible: +row.s.toFixed(3), empty };
      });
      log.push({ film: filmNo, frame: i + 1, ms: r.ms, animations: r.anims, watched });
      return { ms: r.ms, png: r.png, empty: watched.some((x) => x.empty), watched };
    });
    const empties = frames.flatMap((f) => f.watched.filter((x) => x.empty).map((x) =>
      `EMPTY FRAME at ${f.ms} ms: ${x.selector} is ${x.w}x${x.h} but its content is ${Math.round(x.contentVisible * 100)}% visible`));
    emptySummary.push({ film: filmNo, lines: empties.length ? empties : ['no empty frames'] });
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
    figcaption{position:absolute;left:8px;top:8px;background:rgba(0,0,0,.7);padding:2px 8px;border-radius:6px}
    .empty img{outline:4px solid #ff3b30;outline-offset:-4px}
    .badge{position:absolute;right:8px;top:8px;background:#ff3b30;padding:2px 8px;border-radius:6px}</style>
    <div class="g">${frames.map((f) => `<figure class="${f.empty ? 'empty' : ''}"><img src="data:image/png;base64,${f.png}"><figcaption>${f.ms} ms</figcaption>${f.empty ? '<span class="badge">EMPTY</span>' : ''}</figure>`).join('')}</div>`);
  await sheet.setViewportSize({ width: 1600, height: 800 });
  await sheet.waitForFunction(() => [...document.images].every((i) => i.complete));
  await sheet.locator('.g').screenshot({ path: join(out, `strip-${n + 1}.png`) });
}
writeFileSync(join(out, 'frames.json'), JSON.stringify({ url, steps: stepsArg, speed, errors, frames: log }, null, 2));
await browser.close();
const foundEmpty = log.some((f) => f.watched?.some((w) => w.empty));
for (const s of emptySummary) for (const line of s.lines) console.log(`film ${s.film}: ${line}`);
console.log(`${strips.length} strip(s) in ${out}${errors.length ? `\npage errors: ${errors.join(' | ')}` : ''}`);
process.exit(foundEmpty ? 2 : 0);
