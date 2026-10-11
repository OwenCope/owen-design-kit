// Slop linter for design review: catches AI-looking placeholders before the visual pass.
//
// Usage:
//   node lint-slop.mjs <url-or-file> [--width 1440]
//
// What each check catches:
//   a. letter-tile icons - square coloured tiles with 1-2 letters standing in for a real icon or logo.
//   b. tiny text - visible text under 12 px, usually unreadable fine print or leftover debug copy.
//   c. dead buttons - buttons or links styled as actions that go nowhere ('#', empty, javascript:void(0), .txt downloads).
//   d. decorative chips - rows of small non-interactive pills with 1-3 words that decorate instead of informing.
//   e. text-only theme toggle - a Theme/Light/Dark button with words instead of the platform switch or icon.
//   f. fake Mac - a drawn menu bar, clock or notch without a real laptop shell image.
//   g. emoji or unicode symbols used as icons - magnifiers, squares, check marks standing in for real icons.
//   h. duplicate visible strings - the same sentence appearing twice inside one section, usually copy-paste filler.
//   i. horizontal overflow at 390 px - the page scrolls sideways on a phone.
//   j. real Mac assets - in a Mac scene, Dock and file-row icons that are not mac-assets exports.
//   k. headline bigger than the product - the h1 takes more of the first screen than the largest visual.
//   l. duplicate actions - three or more visible controls in one container doing the same job.
//   m. placeholder icons - flat coloured squares where real app or file icons belong.
//   n. detached notch panel - a shelf/panel under the notch instead of growing out of it.
//
// Run this until it is clean before any visual review: fix every FAIL, then run it again.
import { createRequire as __cr } from 'node:module';
import { join as __join } from 'node:path';
// Load Playwright from the project you run this in, so the script works from the kit's own folder.
let chromium;
try { ({ chromium } = __cr(__join(process.cwd(), 'package.json'))('playwright')); }
catch { console.error('Playwright not found here. Run: npm i -D playwright && npx playwright install chromium'); process.exit(1); }
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
let target = args.find((a) => !a.startsWith('--'));
let width = 1440;
const widthIdx = args.indexOf('--width');
if (widthIdx !== -1 && args[widthIdx + 1]) width = Number(args[widthIdx + 1]) || 1440;
if (!target || process.argv.includes('--help')) { console.error('usage: node lint-slop.mjs <url-or-file> [--width 1440]'); process.exit(1); }
if (existsSync(resolve(target))) target = pathToFileURL(resolve(target)).href;

const results = [];
const report = (name, offenders, level = 'FAIL') => {
  const list = (offenders ?? []).slice(0, 5);
  results.push({ name, pass: list.length === 0, list, level });
};

const browser = await chromium.launch();
let failed = 0;
try {
const page = await browser.newPage({ viewport: { width, height: 900 } });
await page.goto(target, { waitUntil: 'networkidle' });
const pageHeight = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < pageHeight; y += 450) {
  await page.evaluate((v) => scrollTo(0, v), y);
  await page.waitForTimeout(60);
}
await page.evaluate(() => scrollTo(0, 0));
await page.waitForTimeout(400);

// a. letter-tile icons
report('letter-tile icons', await page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width < 16 || r.width > 80 || r.height < 16 || r.height > 80) continue;
    if (Math.abs(r.width - r.height) / Math.max(r.width, r.height) > 0.15) continue;
    const bg = getComputedStyle(el).backgroundColor;
    if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') continue;
    const text = (el.textContent ?? '').trim();
    if (/^.{1,2}$/s.test(text) && el.children.length === 0) {
      out.push(`${el.tagName.toLowerCase()} "${text}" ${Math.round(r.width)}x${Math.round(r.height)}`);
    }
  }
  return out;
}));

// b. tiny text
report('tiny text', await page.evaluate(() => {
  const out = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const text = (node.textContent ?? '').trim();
    if (!text) continue;
    const el = node.parentElement;
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const st = getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) < 0.05) continue;
    if (parseFloat(st.fontSize) < 12) out.push(`"${text.slice(0, 60)}" ${st.fontSize}`);
    if (out.length >= 40) break;
  }
  return out;
}));

// c. dead buttons
report('dead buttons', await page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll('a, button')) {
    const label = ((el.textContent ?? '').trim() || el.getAttribute('aria-label') || el.tagName).slice(0, 40);
    const href = (el.getAttribute('href') ?? '').trim().toLowerCase();
    if (href === '#' || href === '' && el.tagName === 'A' || href === 'javascript:void(0)' || href.endsWith('.txt')) {
      out.push(`${el.tagName.toLowerCase()} "${label}" href="${href || '(empty)'}"`);
    }
  }
  return out;
}));

// d. decorative chips
report('decorative chips', await page.evaluate(() => {
  const out = [];
  const parents = new Set();
  for (const el of document.querySelectorAll('body *')) parents.add(el.parentElement);
  for (const parent of parents) {
    if (!parent || parent === document.body) continue;
    const kids = [...parent.children].filter((el) => {
      if (/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) return false;
      const r = el.getBoundingClientRect();
      if (r.height >= 30 || r.height === 0) return false;
      const br = parseFloat(getComputedStyle(el).borderRadius);
      if (br < r.height / 2) return false;
      const words = (el.textContent ?? '').trim().split(/\s+/).filter(Boolean);
      return words.length >= 1 && words.length <= 3;
    });
    if (kids.length >= 3) out.push(`${kids.length} pills in <${parent.tagName.toLowerCase()}>: ${kids.slice(0, 3).map((k) => `"${k.textContent.trim().slice(0, 20)}"`).join(', ')}`);
  }
  return out;
}));

// e. text-only theme toggle
report('text-only theme toggle', await page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll('button')) {
    const text = (el.textContent ?? '').trim().toLowerCase();
    if ((text === 'theme' || text === 'light' || text === 'dark' || text === 'toggle theme') && !el.querySelector('svg, img')) {
      out.push(`button "${el.textContent.trim().slice(0, 30)}"`);
    }
  }
  return out;
}));

// f. fake Mac
report('fake Mac', await page.evaluate(() => {
  const clockRe = /\b([01]?\d|2[0-3]):[0-5]\d\b/;
  let hasChrome = false;
  for (const el of document.querySelectorAll('body *')) {
    if (el.children.length === 0 && clockRe.test(el.textContent ?? '')) {
      // A full-screen prototype draws the Mac itself edge to edge: the clock sits at the top-right of the viewport.
      const r = el.getBoundingClientRect();
      if (r.top < 40 && innerWidth - r.right < 60) return [];
      hasChrome = true; break;
    }
  }
  if (!hasChrome) return [];
  const hasShell = [...document.querySelectorAll('img')].some((img) =>
    /macbook|shell/i.test(img.getAttribute('src') ?? ''));
  return hasShell ? [] : ['Mac scene without a laptop shell'];
}));

// g. emoji or unicode symbols used as icons
report('emoji or symbol icons', await page.evaluate(() => {
  const out = [];
  const symbolRe = /^[\p{Emoji}\u2318\u2315\u25A0-\u25FF\u2600-\u27BF\u2B00-\u2BFF\uFE0E\uFE0F\s]+$/u;
  const scope = (el) => el.closest('button, nav, [role="menubar"], li, [role="menuitem"], [role="listitem"]');
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const text = (node.textContent ?? '').trim();
    if (text.length === 0 || text.length > 8) continue;
    if (!symbolRe.test(text)) continue;
    const holder = scope(node.parentElement);
    if (holder) out.push(`"${text}" in <${holder.tagName.toLowerCase()}>`);
    if (out.length >= 40) break;
  }
  return out;
}));

// h. duplicate visible strings
report('duplicate visible strings', await page.evaluate(() => {
  const out = [];
  for (const section of document.querySelectorAll('section')) {
    const seen = new Map();
    const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const text = (node.textContent ?? '').trim();
      if (text.length < 5 || /\n/.test(text)) continue;
      const el = node.parentElement;
      if (!el) continue;
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden') continue;
      seen.set(text, (seen.get(text) ?? 0) + 1);
      if (seen.get(text) === 2) out.push(`"${text.slice(0, 60)}" twice in <section>`);
      if (out.length >= 40) break;
    }
  }
  return out;
}));

// j. real Mac assets
report('real Mac assets', await page.evaluate(() => {
  const out = [];
  const clockRe = /\b([01]?\d|2[0-3]):[0-5]\d\b/;
  const cls = (el) => (typeof el.className === 'string' ? el.className : el.className?.baseVal ?? '');
  let hasScene = [...document.querySelectorAll('img')].some((img) =>
    /macbook|shell/i.test(img.getAttribute('src') ?? ''));
  if (!hasScene) hasScene = [...document.querySelectorAll('body *')].some((el) => /dock/i.test(cls(el)));
  if (!hasScene) {
    for (const el of document.querySelectorAll('body *')) {
      if (el.children.length === 0 && clockRe.test(el.textContent ?? '')) { hasScene = true; break; }
    }
  }
  if (!hasScene) return [];
  const docks = [...document.querySelectorAll('body *')].filter((el) => /dock/i.test(cls(el)));
  for (const el of document.querySelectorAll('body *')) {
    if (docks.includes(el)) continue;
    const kids = [...el.children];
    if (kids.length < 4) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0) continue;
    const square = kids.filter((k) => {
      const kr = k.getBoundingClientRect();
      return kr.width >= 16 && kr.width <= 96 && Math.abs(kr.width - kr.height) / kr.width < 0.2;
    });
    if (square.length < 4) continue;
    const tops = square.map((k) => k.getBoundingClientRect().top);
    if (Math.max(...tops) - Math.min(...tops) > 24) continue;
    const vr = el.getBoundingClientRect();
    if (vr.bottom < innerHeight * 0.5) continue;
    docks.push(el);
  }
  const symbolRe = /^[\p{Emoji}\u2318\u2315\u25A0-\u25FF\u2600-\u27BF\u2B00-\u2BFF\uFE0E\uFE0F\s]+$/u;
  const maskUrl = (el) => {
    const st = getComputedStyle(el);
    return `${st.maskImage ?? ''} ${st.webkitMaskImage ?? ''} ${st.backgroundImage ?? ''}`;
  };
  for (const dock of docks) {
    for (const svg of dock.querySelectorAll('svg')) {
      out.push(`inline svg icon in Dock container <${dock.tagName.toLowerCase()} class="${cls(dock).slice(0, 40)}">`);
      if (out.length >= 40) break;
    }
    if (out.length >= 40) break;
    for (const el of dock.querySelectorAll('div, span')) {
      const st = getComputedStyle(el);
      const bg = st.backgroundColor;
      const hasBg = bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent';
      const er = el.getBoundingClientRect();
      const iconSized = er.width >= 16 && Math.abs(er.width - er.height) / er.width < 0.3;   // skips dividers and running dots
      if (hasBg && iconSized && !/mac-assets/.test(maskUrl(el)) && !el.querySelector('img')) {
        out.push(`css-shape icon <${el.tagName.toLowerCase()}> in Dock container`);
        if (out.length >= 40) break;
      }
    }
    if (out.length >= 40) break;
    const walker = document.createTreeWalker(dock, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const text = (node.textContent ?? '').trim();
      if (!text || text.length > 8 || node.parentElement?.querySelector('img')) continue;
      if (symbolRe.test(text)) {
        out.push(`emoji/symbol "${text.slice(0, 10)}" in Dock container`);
        if (out.length >= 40) break;
      }
    }
    if (out.length >= 40) break;
    for (const img of dock.querySelectorAll('img')) {
      if (!/mac-assets/.test(img.getAttribute('src') ?? '')) {
        out.push(`img "${(img.getAttribute('src') ?? '(no src)').slice(0, 60)}" in Dock is not a mac-assets export`);
        if (out.length >= 40) break;
      }
    }
    if (out.length >= 40) break;
  }
  const fileRe = /\.(pdf|png|jpe?g|key|txt|mov|md|zip|html|swift|numbers|pages|m4a|mp3|wav)\b/i;
  for (const el of document.querySelectorAll('body *')) {
    if (out.length >= 40) break;
    const r = el.getBoundingClientRect();
    if (r.width < 14 || r.width > 48 || r.height < 14 || r.height > 48) continue;
    if (Math.abs(r.width - r.height) / Math.max(r.width, r.height) > 0.2) continue;
    const context = el.parentElement?.textContent ?? '';
    if (!fileRe.test(context)) continue;
    if (docks.some((d) => d.contains(el))) continue;
    if (el.tagName === 'IMG' && /mac-assets/.test(el.getAttribute('src') ?? '')) continue;
    if (/mac-assets/.test(maskUrl(el))) continue;
    out.push(`file-row icon <${el.tagName.toLowerCase()}> next to "${(context.trim().match(fileRe) ?? ['file'])[0]}" is not a mac-assets export`);
  }
  return out;
}));

// i. horizontal overflow at 390 px wide (reuses the same browser)
{
  const phone = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    await phone.goto(target, { waitUntil: 'networkidle' });
    const scrollWidth = await phone.evaluate(() => document.documentElement.scrollWidth);
    report('horizontal overflow at 390px', scrollWidth > 390 ? [`scrollWidth ${scrollWidth}px exceeds 390`] : []);
  } finally {
    await phone.close().catch(() => {});
  }
}

// k. headline bigger than the product
try {
  report('headline bigger than the product', await page.evaluate(() => {
    const clipArea = (r) => {
      const w = Math.min(r.right, innerWidth) - Math.max(r.left, 0);
      const h = Math.min(r.bottom, 900) - Math.max(r.top, 0);
      return w > 0 && h > 0 ? w * h : 0;
    };
    const heads = [...document.querySelectorAll('h1')].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.top < 900 && r.bottom > 0;
    });
    let headArea = 0;
    if (heads.length) {
      for (const el of heads) {
        const a = clipArea(el.getBoundingClientRect());
        if (a > headArea) headArea = a;
      }
    } else {
      let found = false;
      for (const el of document.querySelectorAll('body *')) {
        if (el.children.length > 3) continue;
        const text = (el.textContent ?? '').trim();
        if (!text || text.length > 200) continue;
        if (parseFloat(getComputedStyle(el).fontSize) <= 48) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0 || r.top >= 900 || r.bottom <= 0) continue;
        const a = clipArea(r);
        if (a > headArea) { headArea = a; found = true; }
      }
      if (!found) return [];
    }
    let visualArea = 0;
    for (const el of document.querySelectorAll('img, picture, video, canvas, [role="img"]')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0 || r.top >= 900 || r.bottom <= 0) continue;
      const a = clipArea(r);
      if (a > visualArea) visualArea = a;
    }
    if (!visualArea) return ['no visual in the first screen: the headline takes more of the first screen than the product'];
    if (headArea > visualArea) return [`the headline takes more of the first screen than the product (headline ${Math.round(headArea)}px², visual ${Math.round(visualArea)}px²)`];
    return [];
  }), 'WARN');
} catch { report('headline bigger than the product', ['check could not run'], 'WARN'); }

// l. duplicate actions
try {
  report('duplicate actions', await page.evaluate(() => {
    const out = [];
    const verbRe = /add|upload|browse|import|new|create/i;
    const els = [...document.querySelectorAll('button, [role="button"], input[type="file"], body *')].filter((el) => {
      const label = `${el.textContent ?? ''} ${el.getAttribute?.('aria-label') ?? ''} ${el.getAttribute?.('value') ?? ''}`;
      if (!verbRe.test(label)) return false;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return false;
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) < 0.05) return false;
      if (el.closest('button, [role="button"]') !== null && !/^(BUTTON|INPUT)$/.test(el.tagName) && el.getAttribute?.('role') !== 'button') return false;
      return true;
    });
    const groups = new Map();
    for (const el of els) {
      const label = `${el.textContent ?? ''} ${el.getAttribute?.('aria-label') ?? ''}`.toLowerCase();
      const m = label.match(verbRe)?.[0].toLowerCase() ?? '';
      const key = /add|upload|browse|import/.test(m) ? 'add' : m;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(el);
    }
    for (const [verb, members] of groups) {
      if (members.length < 3) continue;
      const chains = members.map((el) => {
        const chain = [];
        for (let n = el; n && n !== document.body; n = n.parentElement) chain.unshift(n);
        return chain;
      });
      let common = null;
      for (const cand of chains[0]) {
        if (chains.every((c) => c.includes(cand))) common = cand;
      }
      if (!common || common === document.body || common === document.documentElement) continue;
      const r = common.getBoundingClientRect();
      if (r.width >= innerWidth && r.height >= innerHeight) continue;
      const texts = members.slice(0, 4).map((el) => `"${((el.textContent ?? '').trim() || el.getAttribute?.('aria-label') || el.tagName).slice(0, 30)}"`);
      out.push(`several visible controls do the same job ("${verb}": ${texts.join(', ')})`);
    }
    return out;
  }), 'WARN');
} catch { report('duplicate actions', ['check could not run'], 'WARN'); }

// m. placeholder icons
try {
  report('placeholder icons', await page.evaluate(() => {
    const found = [];
    const holderSel = '[class*="dock" i], [id*="dock" i], [class*="icon" i], [id*="icon" i], [class*="file" i], [id*="file" i], [class*="tile" i], [id*="tile" i]';
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width < 24 || r.width > 96 || r.height < 24 || r.height > 96) continue;
      if (Math.abs(r.width - r.height) / Math.max(r.width, r.height) > 0.2) continue;
      if (!el.closest(holderSel)) continue;
      const st = getComputedStyle(el);
      if (st.backgroundImage && st.backgroundImage !== 'none') continue;
      const bg = st.backgroundColor;
      if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') continue;
      if (el.querySelector('img, svg')) continue;
      found.push(`<${el.tagName.toLowerCase()}> ${Math.round(r.width)}x${Math.round(r.height)}`);
    }
    for (const img of document.querySelectorAll('img')) {
      if (/placeholder|dummy|via\.placeholder/i.test(img.getAttribute('src') ?? '')) {
        found.push(`img "${(img.getAttribute('src') ?? '').slice(0, 60)}"`);
      }
    }
    if (found.length <= 2) return [];
    return [`placeholder squares where real icons belong (use mac-props assets): ${found.length} found`, ...found];
  }));
} catch { report('placeholder icons', ['check could not run'], 'WARN'); }

// n. detached notch panel
try {
  report('detached notch panel', await page.evaluate(() => {
    const notch = document.querySelector('[class*="notch" i], [id*="notch" i]');
    if (!notch) return [];
    const nr = notch.getBoundingClientRect();
    if (nr.width === 0 && nr.height === 0) return [];
    const lum = (c) => {
      const m = (c ?? '').match(/[\d.]+/g)?.map(Number) ?? [];
      if (m.length < 3) return -1;
      return (m[0] + m[1] + m[2]) / 3;
    };
    const notchLum = lum(getComputedStyle(notch).backgroundColor);
    const panels = [...document.querySelectorAll('[class*="shelf" i], [id*="shelf" i], [class*="panel" i], [id*="panel" i], [class*="drawer" i], [id*="drawer" i], [class*="tray" i], [id*="tray" i]')];
    for (const p of panels) {
      if (p === notch || notch.contains(p)) continue;
      const r = p.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      const st = getComputedStyle(p);
      if (st.display === 'none' || st.visibility === 'hidden') continue;
      if (!(r.left < nr.right && r.right > nr.left && r.top >= nr.top)) continue;
      const gap = r.top - nr.bottom;
      const panelLum = lum(st.backgroundColor);
      const contrast = notchLum >= 0 && panelLum >= 0 && Math.abs(notchLum - panelLum) > 150;
      const notchDarkPanelLight = notchLum >= 0 && notchLum < 60 && panelLum > 200;
      if (gap > 2 || contrast || notchDarkPanelLight) {
        return ['the panel appears under the notch instead of growing out of it'];
      }
    }
    return [];
  }), 'WARN');
} catch { report('detached notch panel', ['check could not run'], 'WARN'); }

failed = 0;
let warns = 0;
for (const r of results) {
  console.log(`${r.pass ? 'PASS' : (r.level ?? 'FAIL')} ${r.name}`);
  for (const item of r.list) console.log(`  - ${item}`);
  if (!r.pass) { if ((r.level ?? 'FAIL') === 'FAIL') failed++; else warns++; }
}
if (failed) console.log(`\n${failed} check(s) failed.`);
else if (warns) console.log(`\n${warns} warning(s).`);
else console.log('\nAll checks passed.');
} finally {
  await browser.close().catch(() => {});
}
process.exit(failed ? 1 : 0);
