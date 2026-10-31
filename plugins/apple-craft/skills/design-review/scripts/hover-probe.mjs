// Hover and press audit for a live site: what changes on hover, press and focus, per control group.
//
//   npm i -D playwright && npx playwright install chromium
//   node hover-probe.mjs <url> [--out dir] [--width 1440]
//
// Writes hover-probe.json plus rest/hover crops to --out (default ./hover-probe-out),
// and prints one markdown row per group. Groups share a tag plus sorted class list.
import { createRequire as __cr } from 'node:module';
import { join as __join } from 'node:path';
let chromium;
try { ({ chromium } = __cr(__join(process.cwd(), 'package.json'))('playwright')); }
catch { console.error('Playwright not found here. Run: npm i -D playwright && npx playwright install chromium'); process.exit(1); }
import { mkdirSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith('--'));
let out = './hover-probe-out';
let width = 1440;
const outIdx = args.indexOf('--out');
if (outIdx !== -1 && args[outIdx + 1]) out = args[outIdx + 1];
const widthIdx = args.indexOf('--width');
if (widthIdx !== -1 && args[widthIdx + 1]) width = Number(args[widthIdx + 1]) || 1440;
if (!url || args.includes('--help')) { console.error('usage: node hover-probe.mjs <url> [--out dir] [--width 1440]'); process.exit(1); }
mkdirSync(out, { recursive: true });

const PROPS = ['transform', 'scale', 'translate', 'opacity', 'background-color', 'color',
  'box-shadow', 'border-color', 'filter', 'text-decoration-line', 'outline'];
const TRANS = ['transition-property', 'transition-duration', 'transition-timing-function'];

async function styles(handle) {
  return handle.evaluate((el, ps) => {
    const cs = getComputedStyle(el);
    const o = {};
    for (const p of ps) o[p] = cs.getPropertyValue(p);
    o.matchesHover = el.matches(':hover');
    o.matchesFocusVisible = el.matches(':focus-visible');
    const r = el.getBoundingClientRect();
    o.rect = { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    return o;
  }, PROPS.concat(TRANS));
}

function shortDiff(a, b) {
  const d = [];
  for (const p of PROPS) {
    if ((a?.[p] ?? '') !== (b?.[p] ?? '')) d.push(`${p}: ${(a?.[p] ?? '').slice(0, 40)} -> ${(b?.[p] ?? '').slice(0, 40)}`);
  }
  return d;
}

function covers(transProp, changedProp) {
  if (!transProp) return false;
  const t = transProp.toLowerCase();
  if (t.includes('all')) return true;
  const base = changedProp.split('-')[0];
  return t.split(',').some((s) => s.trim() === changedProp || s.trim() === base);
}

const browser = await chromium.launch();
// Dismiss a cookie banner so it does not cover controls.
async function dismissBanner(page) {
  try {
    for (const b of await page.$$('button')) {
      const t = ((await b.textContent().catch(() => '')) ?? '').trim().toLowerCase();
      if (/^(ok|got it|dismiss|close)$/.test(t) || /no thanks|reject|decline|accept|allow/.test(t)) {
        if (await b.isVisible().catch(() => false)) { await b.click().catch(() => {}); break; }
      }
    }
  } catch {}
}

const results = [];
try {
  let page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  await dismissBanner(page);
  await page.waitForTimeout(600);

  const groups = await page.evaluate(() => {
    const seen = new Set();
    const cands = [];
    const push = (el) => {
      if (!el || seen.has(el)) return;
      seen.add(el);
      cands.push(el);
    };
    for (const el of document.querySelectorAll('a, button, [role="button"], [role="tab"], summary, input, select, textarea, [tabindex]:not([tabindex="-1"])')) push(el);
    // Elements targeted by a :hover rule may not match the list above (for example div cards).
    for (const sheet of document.styleSheets) {
      let rules = null;
      try { rules = sheet.cssRules; } catch { continue; }
      if (!rules) continue;
      for (const r of rules) {
        if (!r.selectorText || !r.selectorText.includes(':hover')) continue;
        for (const part of r.selectorText.split(',')) {
          const base = part.split(':hover')[0].trim();
          if (!base) continue;
          try { for (const el of document.querySelectorAll(base)) push(el); } catch {}
        }
      }
    }
    const bySig = new Map();
    const sigOf = (el) => {
      const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(Boolean).sort().join('.') : '';
      return `${el.tagName.toLowerCase()}${cls ? '.' + cls : ''}`;
    };
    const selOf = (el) => {
      let s = el.tagName.toLowerCase();
      if (el.id) return `${s}#${el.id}`;
      const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(Boolean).sort() : [];
      if (cls.length) s += '.' + cls.slice(0, 3).join('.');
      return s;
    };
    for (const el of cands) {
      const r = el.getBoundingClientRect();
      const st = getComputedStyle(el);
      if (r.width === 0 && r.height === 0) continue;
      if (st.display === 'none' || st.visibility === 'hidden') continue;
      const sig = sigOf(el);
      if (!bySig.has(sig)) bySig.set(sig, { sig, sel: selOf(el), count: 0 });
      bySig.get(sig).count++;
    }
    return [...bySig.values()].slice(0, 40);
  });

  let gi = 0;
  let crashes = 0;
  for (const g of groups) {
    try {
      const loc = page.locator(g.sel).first();
      const count = await loc.count().catch(() => 0);
      if (!count) continue;
      const reps = Math.min(count, 2);
      const row = { selector: g.sel, count: g.count, hover: [], press: [], focus: [], transition: '', flags: [] };
      let rest = null, hov = null, press = null, foc = null, trans = '';
      for (let i = 0; i < reps; i++) {
        const h = await page.locator(g.sel).nth(i).elementHandle().catch(() => null);
        if (!h) continue;
        await h.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(300);
        await page.mouse.move(4, 4);
        await page.waitForTimeout(200);
        rest = await styles(h).catch(() => null);
        await page.locator(g.sel).nth(i).hover({ timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(600);
        hov = await styles(h).catch(() => null);
        const box = await h.boundingBox().catch(() => null);
        if (box) {
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          await page.mouse.down();
          await page.waitForTimeout(300);
          press = await styles(h).catch(() => null);
          await page.mouse.up();
        }
        // Keyboard focus: Tab toward it, fall back to focus().
        await page.mouse.move(4, 4);
        await page.keyboard.press('Escape').catch(() => {});
        let landed = false;
        for (let t = 0; t < 20; t++) {
          await page.keyboard.press('Tab');
          await page.waitForTimeout(80);
          const active = await page.evaluate((sel, idx) => {
            const els = document.querySelectorAll(sel);
            return els[idx] === document.activeElement;
          }, [g.sel, i]).catch(() => false);
          if (active) { landed = true; break; }
        }
        if (!landed) await h.focus().catch(() => {});
        await page.waitForTimeout(200);
        foc = await styles(h).catch(() => null);
        trans = [foc?.['transition-property'], foc?.['transition-duration'], foc?.['transition-timing-function']].filter(Boolean).join(' / ');
        if (i === 0 && box) {
          const pad = 24;
          const clip = { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad), width: Math.min(box.width + pad * 2, width), height: box.height + pad * 2 };
          await h.scrollIntoViewIfNeeded().catch(() => {});
          await page.mouse.move(4, 4);
          await page.waitForTimeout(250);
          await page.screenshot({ path: `${out}/${gi}-rest.png`, clip }).catch(() => {});
          await page.locator(g.sel).nth(i).hover({ timeout: 5000 }).catch(() => {});
          await page.waitForTimeout(600);
          await page.screenshot({ path: `${out}/${gi}-hover.png`, clip }).catch(() => {});
          await page.mouse.move(4, 4);
        }
        break;
      }
      row.hover = shortDiff(rest, hov);
      row.press = shortDiff(hov, press || hov);
      row.focus = shortDiff(rest, foc || rest);
      row.transition = trans;
      row.restRect = rest?.rect ?? null;
      const moved = (d) => d.some((s) => /^(transform|scale|translate):/.test(s));
      if (moved(row.hover)) row.flags.push('MOVES_ON_HOVER');
      if (moved(row.press)) row.flags.push('MOVES_ON_PRESS');
      if (!row.hover.length) row.flags.push('NO_HOVER');
      if (foc && !foc.matchesFocusVisible && !String(foc.outline ?? '').startsWith('rgb')) row.flags.push('NO_FOCUS_RING');
      else if (foc && !foc.matchesFocusVisible) {
        const o = String(foc.outline ?? '');
        if (o === '' || o.startsWith('none') || /0px/.test(o)) row.flags.push('NO_FOCUS_RING');
      }
      for (const d of row.hover.concat(row.press)) {
        const prop = d.split(':')[0];
        if (!covers(foc?.['transition-property'] ?? hov?.['transition-property'] ?? '', prop)) { row.flags.push('SNAP'); break; }
      }
      if (rest?.rect && (rest.rect.w < 44 || rest.rect.h < 44)) row.flags.push('SMALL_TARGET');
      results.push(row);
      gi++;
    } catch (e) {
      // Heavy pages can crash headless Chromium mid-run; keep what was measured.
      if (!/crash|closed/i.test(String(e?.message))) throw e;
      // Reopen and carry on with the next group; give up after three crashes.
      crashes++;
      console.error(`Page crashed while probing ${g.sel}${crashes < 3 ? ', reopening' : `; reporting the ${results.length} groups measured`}.`);
      if (crashes >= 3) break;
      await page.close().catch(() => {});
      page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto(url, { waitUntil: 'networkidle' }).catch(() => {});
      await page.waitForTimeout(1500);
      await dismissBanner(page).catch(() => {});
    }
  }
  await page.close().catch(() => {});

  // Touch re-run: tap, move away, check whether hover styles stick.
  const touch = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  try {
    await touch.goto(url, { waitUntil: 'networkidle' });
    await touch.waitForTimeout(1500);
    for (const row of results) {
      const loc = touch.locator(row.selector).first();
      if ((await loc.count().catch(() => 0)) === 0) continue;
      const h = await loc.elementHandle().catch(() => null);
      if (!h) continue;
      await h.scrollIntoViewIfNeeded().catch(() => {});
      await touch.waitForTimeout(400);
      const before = await styles(h).catch(() => null);
      await loc.tap({ timeout: 5000 }).catch(() => {});
      await touch.waitForTimeout(400);
      await touch.touchscreen.tap(10, 10).catch(() => {});
      await touch.waitForTimeout(400);
      const after = await styles(h).catch(() => null);
      if (shortDiff(before, after).length) row.flags.push('STICKY_TOUCH');
    }
  } catch (e) {
    console.error(`Touch pass stopped early: ${String(e?.message).split('\n')[0]}`);
  } finally {
    await touch.close().catch(() => {});
  }
} finally {
  await browser.close();
}

writeFileSync(`${out}/hover-probe.json`, JSON.stringify({ url, date: new Date().toISOString(), results }, null, 2));
console.log('| selector | count | hover | press | focus | transition | flags |');
console.log('|---|---|---|---|---|---|---|');
for (const r of results) {
  const cell = (a) => (a.length ? a.join('; ').slice(0, 160) : '-');
  console.log(`| \`${r.selector}\` | ${r.count} | ${cell(r.hover)} | ${cell(r.press)} | ${cell(r.focus)} | ${r.transition.slice(0, 80) || '-'} | ${r.flags.join(', ') || '-'} |`);
}
console.log(`\nWrote ${out}/hover-probe.json and rest/hover crops.`);
if (results.some((r) => r.flags.includes('MOVES_ON_HOVER') || r.flags.includes('MOVES_ON_PRESS'))) process.exitCode = 1;
