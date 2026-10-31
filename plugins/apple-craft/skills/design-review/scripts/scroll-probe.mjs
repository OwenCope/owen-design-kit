// Scroll audit for a live site: which elements change while scrolling, and how.
//
//   npm i -D playwright && npx playwright install chromium
//   node scroll-probe.mjs <url> [--out dir] [--width 1440] [--step 100]
//
// Steps from top to bottom in --step px, snapshots transform, opacity, filter,
// clip-path and className per element, then scrolls back to check reversals.
// Logs longtask and layout-shift entries, saves up to ~30 frame PNGs,
// writes scroll-probe.json and prints a markdown table.
import { createRequire as __cr } from 'node:module';
import { join as __join } from 'node:path';
let chromium;
try { ({ chromium } = __cr(__join(process.cwd(), 'package.json'))('playwright')); }
catch { console.error('Playwright not found here. Run: npm i -D playwright && npx playwright install chromium'); process.exit(1); }
import { mkdirSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith('--'));
let out = './scroll-probe-out';
let width = 1440;
let step = 100;
const opt = (name, dflt) => {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] ? args[i + 1] : dflt;
};
out = opt('--out', out);
width = Number(opt('--width', width)) || 1440;
step = Number(opt('--step', step)) || 100;
if (!url || args.includes('--help')) { console.error('usage: node scroll-probe.mjs <url> [--out dir] [--width 1440] [--step 100]'); process.exit(1); }
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const changed = [];
let perf = { longtasks: [], shifts: [] };
let docH = 0;
try {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.addInitScript(() => {
    window.__lt = [];
    window.__ls = [];
    try {
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push({ d: Math.round(e.duration), n: (e.name || '').slice(0, 80) }); }).observe({ entryTypes: ['longtask'] });
    } catch {}
    try {
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__ls.push(Number(e.value.toFixed(4))); }).observe({ type: 'layout-shift', buffered: true });
    } catch {}
  });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  docH = await page.evaluate(() => document.documentElement.scrollHeight);

  const snap = () => page.evaluate(() => {
    // Key elements by a stable id, not DOM position: pages add and remove nodes while scrolling.
    window.__spNext = window.__spNext || 1;
    const out = [];
    for (const el of document.querySelectorAll('*')) {
      if (out.length >= 4000) break;
      if (!el.__spId) el.__spId = window.__spNext++;
      out.push(el);
    }
    return out.map((el) => {
      const i = el.__spId;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return null;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return null;
      let sel = el.tagName.toLowerCase();
      if (el.id) sel += `#${el.id}`;
      else if (typeof el.className === 'string' && el.className.trim()) sel += '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.');
      return { i, sel, t: cs.transform, o: cs.opacity, f: cs.filter, c: cs.clipPath, k: el.className?.baseVal === undefined ? String(el.className).slice(0, 80) : '' };
    }).filter(Boolean);
  });

  const ys = [];
  for (let y = 0; y <= Math.max(0, docH - 900); y += step) ys.push(y);
  if (ys[ys.length - 1] !== Math.max(0, docH - 900)) ys.push(Math.max(0, docH - 900));

  const snaps = [];
  for (const y of ys) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(120);
    snaps.push({ y, els: await snap() });
  }

  const byIdx = new Map();
  for (const s of snaps) {
    for (const el of s.els) {
      if (!byIdx.has(el.i)) byIdx.set(el.i, []);
      byIdx.get(el.i).push({ y: s.y, ...el });
    }
  }
  for (const [idx, rows] of byIdx) {
    const first = rows[0];
    let startY = null, endY = null, props = new Set();
    for (let k = 1; k < rows.length; k++) {
      for (const p of ['t', 'o', 'f', 'c', 'k']) {
        if (rows[k][p] !== rows[k - 1][p]) {
          props.add(p);
          if (startY === null) startY = rows[k].y;
          endY = rows[k].y;
        }
      }
    }
    if (startY !== null) changed.push({ sel: first.sel, idx, props: [...props], startY, endY });
  }

  // Scroll back to top: did each change reverse?
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  const back = await snap();
  const backByIdx = new Map(back.map((el) => [el.i, el]));
  for (const c of changed) {
    const b = backByIdx.get(c.idx);
    const firstRows = byIdx.get(c.idx);
    if (!b || !firstRows) { c.reversed = false; continue; }
    c.reversed = ['t', 'o', 'f', 'c', 'k'].every((p) => b[p] === firstRows[0][p]);
  }

  // Sticky ancestors and their pinned length.
  const stickyInfo = await page.evaluate((list) => {
    const byId = new Map([...document.querySelectorAll('*')].filter((n) => n.__spId).map((n) => [n.__spId, n]));
    return list.slice(0, 60).map((c) => {
      const el = byId.get(c.idx);
      if (!el) return { idx: c.idx, sticky: null };
      let anc = el.parentElement, found = null;
      while (anc && anc !== document.body) {
        if (getComputedStyle(anc).position === 'sticky') { found = anc; break; }
        anc = anc.parentElement;
      }
      if (!found) return { idx: c.idx, sticky: null };
      const pr = found.parentElement ? found.parentElement.getBoundingClientRect() : { height: 0 };
      const fr = found.getBoundingClientRect();
      let sel = found.tagName.toLowerCase();
      if (found.id) sel += `#${found.id}`;
      else if (typeof found.className === 'string' && found.className.trim()) sel += '.' + found.className.trim().split(/\s+/).slice(0, 2).join('.');
      return { idx: c.idx, sticky: sel, pinnedPx: Math.max(0, Math.round(pr.height - fr.height)) };
    });
  }, changed);
  const stickyByIdx = new Map(stickyInfo.map((s) => [s.idx, s]));
  for (const c of changed) {
    const s = stickyByIdx.get(c.idx);
    c.sticky = s?.sticky ?? null;
    c.pinnedPx = s?.pinnedPx ?? null;
  }

  perf = await page.evaluate(() => ({
    longtasks: (window.__lt || []).slice(0, 20),
    shifts: window.__ls || [],
  }));

  // Frames at start, middle and end of each change, capped near 30 shots.
  let frames = 0;
  for (const c of changed.slice(0, 10)) {
    const mid = Math.round((c.startY + c.endY) / 2);
    for (const [tag, y] of [['start', c.startY], ['mid', mid], ['end', c.endY]]) {
      if (frames >= 30) break;
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(250);
      const safe = c.sel.replace(/[^a-z0-9]+/gi, '-').slice(0, 40);
      await page.screenshot({ path: `${out}/${frames}-${safe}-${tag}-${y}.png` }).catch(() => {});
      frames++;
    }
    if (frames >= 30) break;
  }
  await page.close();
} finally {
  await browser.close();
}

writeFileSync(`${out}/scroll-probe.json`, JSON.stringify({ url, date: new Date().toISOString(), docH, step, perf, changed }, null, 2));
// One row per element signature: repeated words, cards or tiles merge into a single range.
const groups = new Map();
for (const c of changed) {
  const g = groups.get(c.sel) || { sel: c.sel, count: 0, props: new Set(), startY: c.startY, endY: c.endY, reversed: true, sticky: c.sticky, pinnedPx: c.pinnedPx };
  g.count++;
  c.props.forEach((p) => g.props.add(p));
  g.startY = Math.min(g.startY, c.startY);
  g.endY = Math.max(g.endY, c.endY);
  g.reversed = g.reversed && c.reversed;
  g.sticky = g.sticky || c.sticky;
  g.pinnedPx = g.pinnedPx ?? c.pinnedPx;
  groups.set(c.sel, g);
}
const names = { t: 'transform', o: 'opacity', f: 'filter', c: 'clip-path', k: 'class' };
console.log('| element | count | props | scroll range | reversed | sticky (pinned px) |');
console.log('|---|---|---|---|---|---|');
for (const g of [...groups.values()].sort((a, b) => a.startY - b.startY).slice(0, 60)) {
  console.log(`| \`${g.sel}\` | ${g.count} | ${[...g.props].map((p) => names[p]).join(', ')} | ${g.startY}px to ${g.endY}px | ${g.reversed ? 'yes' : 'no'} | ${g.sticky ? `${g.sticky} (${g.pinnedPx}px)` : '-'} |`);
}
if (!changed.length) console.log('| - | - | - | - | - | No scroll-driven changes found. |');
const cls = perf.shifts.reduce((a, b) => a + b, 0);
console.log(`\nLongtasks: ${perf.longtasks.length}, layout shifts: ${perf.shifts.length}, CLS sum: ${cls.toFixed(3)}.`);
console.log(`Wrote ${out}/scroll-probe.json.`);
