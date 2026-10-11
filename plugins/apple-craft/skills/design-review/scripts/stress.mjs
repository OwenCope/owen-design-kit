// Stress-test a page's layout with awkward real-world content.
//
//   npm i -D playwright && npx playwright install chromium
//   node stress.mjs <url> [out-dir]
//
// Writes one full-page PNG per scenario to out-dir (default ./stress),
// plus stress-report.json and stress-report.md. Exits 1 on any FAIL.
import { createRequire as __cr } from 'node:module';
import { join as __join } from 'node:path';
// Load Playwright from the project you run this in, so the script works from the kit's own folder.
let chromium;
try { ({ chromium } = __cr(__join(process.cwd(), 'package.json'))('playwright')); }
catch { console.error('Playwright not found here. Run: npm i -D playwright && npx playwright install chromium'); process.exit(1); }
import { mkdirSync, writeFileSync } from 'node:fs';

const url = process.argv[2];
const out = process.argv[3] ?? 'stress';
if (!url || process.argv.includes('--help')) { console.error('usage: node stress.mjs <url> [out-dir]'); process.exit(1); }
mkdirSync(out, { recursive: true });

const DESKTOP = { width: 1440, height: 900 };
const COMPOUNDS = [
  'Donaudampfschifffahrtsgesellschaftskapitän',
  'Rechtsschutzversicherungsgesellschaften',
  'Kraftfahrzeughaftpflichtversicherung',
];
const LONG_NAME = 'Maximiliana Alexandrovna Konstantinopoulou-Featherstonehaugh';
const TEXT_TAGS = 'h1,h2,h3,p,li,button,a,label,td,th,span';

// Full-page PNG, limited to the first 6000 px so huge pages stay manageable.
async function capture(page, file) {
  const h = await page.evaluate(() =>
    Math.max(document.body?.scrollHeight ?? 0, document.documentElement.scrollHeight));
  if (h > 6000) {
    const vp = page.viewportSize();
    await page.setViewportSize({ width: vp.width, height: 6000 });
    await page.screenshot({ path: file, fullPage: false });
    await page.setViewportSize(vp);
  } else {
    await page.screenshot({ path: file, fullPage: true });
  }
}

// Sideways scroll is a FAIL; clipped text, overlapping text and tiny text are WARNs.
async function checkOverflow(page) {
  return page.evaluate(() => {
    const fails = [];
    const warns = [];
    const vw = window.innerWidth;
    const over = document.documentElement.scrollWidth - vw;
    if (over > 0) fails.push(`page scrolls sideways by ${over}px`);

    const sel = (el) => {
      let s = el.tagName.toLowerCase();
      if (el.id) s += `#${el.id}`;
      else if (typeof el.className === 'string' && el.className.trim()) s += `.${el.className.trim().split(/\s+/)[0]}`;
      return s;
    };
    const text = (el) => ((el.innerText ?? el.textContent ?? '').trim().slice(0, 40));
    const seen = (el) => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      const st = getComputedStyle(el);
      return st.display !== 'none' && st.visibility !== 'hidden' && Number(st.opacity) > 0.05;
    };

    const candidates = [...document.querySelectorAll('h1,h2,h3,p,li,button,a,label,td,th,span,div')]
      .filter(seen).slice(0, 800);
    for (const el of candidates.slice(0, 300)) {
      const d = el.scrollWidth - el.clientWidth;
      if (d > 1) {
        warns.push(`clipped ${sel(el)} "${text(el)}" overflows by ${Math.round(d)}px`);
        if (warns.length >= 60) break;
      }
    }

    const byParent = new Map();
    for (const el of candidates) {
      const p = el.parentElement;
      if (!p) continue;
      if (!byParent.has(p)) byParent.set(p, []);
      byParent.get(p).push(el);
    }
    let overlaps = 0;
    for (const sibs of byParent.values()) {
      const sample = sibs.slice(0, 60);
      for (let i = 0; i < sample.length && overlaps < 20; i++) {
        const a = sample[i].getBoundingClientRect();
        for (let j = i + 1; j < sample.length && overlaps < 20; j++) {
          const b = sample[j].getBoundingClientRect();
          if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 4 &&
              Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 4) {
            warns.push(`overlap ${sel(sample[i])} × ${sel(sample[j])}`);
            overlaps++;
          }
        }
      }
      if (overlaps >= 20) break;
    }

    let tiny = 0;
    for (const el of candidates) {
      if (parseFloat(getComputedStyle(el).fontSize) < 12) {
        tiny++;
        if (tiny <= 20) warns.push(`small text ${sel(el)} "${text(el)}"`);
      }
    }
    if (tiny > 20) warns.push(`…plus ${tiny - 20} more elements under 12px`);

    return { fails, warns };
  });
}

async function runScenario(browser, name, { viewport = DESKTOP, gotoOpts, mutate } = {}) {
  const fileOf = (s) => `${out}/${s}.png`;
  if (name === 'slow-network') {
    const context = await browser.newContext({ viewport });
    try {
      const page = await context.newPage();
      await context.addInitScript(() => {
        window.__cls = 0;
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
        }).observe({ type: 'layout-shift', buffered: true });
      });
      await page.route(/.*/, async (route) => {
        if (['image', 'font', 'script'].includes(route.request().resourceType())) {
          await new Promise((r) => setTimeout(r, 1500));
        }
        await route.continue();
      });
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(300);
      await capture(page, fileOf('slow-early'));
      await page.waitForLoadState('load');
      await capture(page, fileOf('slow-late'));
      const cls = await page.evaluate(() => window.__cls ?? 0);
      const { fails, warns } = await checkOverflow(page);
      if (cls > 0.1) warns.push(`cumulative layout shift ${cls.toFixed(3)}`);
      return { scenario: name, screenshots: ['slow-early.png', 'slow-late.png'], status: fails.length ? 'FAIL' : 'PASS', fails, warns, cls: Number(cls.toFixed(3)) };
    } finally {
      await context.close();
    }
  }
  const page = await browser.newPage({ viewport });
  try {
    await page.goto(url, gotoOpts ?? { waitUntil: 'networkidle' });
    if (mutate) await mutate(page);
    await capture(page, fileOf(name));
    const { fails, warns } = await checkOverflow(page);
    return { scenario: name, screenshots: [`${name}.png`], status: fails.length ? 'FAIL' : 'PASS', fails, warns };
  } finally {
    await page.close();
  }
}

const scenarios = [
  { name: 'baseline' },
  {
    name: 'long-words',
    mutate: (page) => page.evaluate((words) => {
      let i = 0;
      const nodes = [...document.querySelectorAll('h1,h2,h3,p,li,button,a,label,td,th,span')]
        .flatMap((el) => [...el.childNodes].filter((n) => n.nodeType === 3 && n.nodeValue.trim()));
      for (const node of nodes) {
        const parts = node.nodeValue.split(/(\s+)/);
        let best = -1;
        let len = 0;
        parts.forEach((p, idx) => {
          if (!/^\s*$/.test(p) && p.length > len) { len = p.length; best = idx; }
        });
        if (best >= 0) { parts[best] = words[i++ % words.length]; node.nodeValue = parts.join(''); }
      }
    }, COMPOUNDS),
  },
  {
    name: 'long-text',
    mutate: (page) => page.evaluate(() => {
      const nodes = [...document.querySelectorAll('h1,h2,h3,p,li,button,a,label,td,th,span')]
        .flatMap((el) => [...el.childNodes].filter((n) => n.nodeType === 3 && n.nodeValue.trim()));
      for (const node of nodes) node.nodeValue += node.nodeValue;
    }),
  },
  {
    name: 'long-names',
    mutate: (page) => page.evaluate((name) => {
      for (const el of document.querySelectorAll('*')) {
        const cls = typeof el.className === 'string' ? el.className : (el.getAttribute('class') ?? '');
        if (/name|user|author|avatar/i.test(`${cls} ${el.getAttribute('aria-label') ?? ''}`)) el.textContent = name;
      }
    }, LONG_NAME),
  },
  {
    name: 'text-200',
    mutate: (page) => page.evaluate(() => {
      // Read every size before writing any, so nested elements don't compound.
      const els = [...document.querySelectorAll('*')];
      const sizes = els.map((el) => parseFloat(getComputedStyle(el).fontSize));
      els.forEach((el, i) => { if (Number.isFinite(sizes[i])) el.style.fontSize = `${sizes[i] * 2}px`; });
    }),
  },
  {
    name: 'rtl',
    mutate: (page) => page.evaluate(() => {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    }),
  },
  { name: 'narrow', viewport: { width: 320, height: 700 } },
  {
    name: 'empty-lists',
    mutate: (page) => page.evaluate(() => {
      for (const el of document.querySelectorAll('ul,ol,tbody,[role="list"],[role="grid"]')) el.innerHTML = '';
    }),
  },
  {
    name: 'many-items',
    mutate: (page) => page.evaluate(() => {
      for (const list of document.querySelectorAll('ul,ol,tbody')) {
        const first = list.firstElementChild;
        if (!first) continue;
        let guard = 0;
        while (list.childElementCount < 200 && guard++ < 500) list.append(first.cloneNode(true));
      }
    }),
  },
  { name: 'slow-network' },
];

let browser;
const results = [];
try {
  browser = await chromium.launch();
  for (const s of scenarios) {
    try {
      results.push(await runScenario(browser, s.name, s));
    } catch (e) {
      results.push({ scenario: s.name, screenshots: [], status: 'ERROR', fails: [], warns: [], error: e.message });
    }
    const r = results[results.length - 1];
    console.log(`${r.scenario}: ${r.status} (${r.screenshots.join(', ') || 'no screenshot'}) — ${r.fails.length} fail(s), ${r.warns.length} warning(s)${r.error ? ` — ${r.error}` : ''}`);
  }
} finally {
  await browser?.close();
}

writeFileSync(`${out}/stress-report.json`, JSON.stringify({ url, date: new Date().toISOString(), results }, null, 2));
writeFileSync(`${out}/stress-report.md`, ['# Layout stress report', '', `Tested: ${url}`, '',
  ...results.flatMap((r) => [
    `## ${r.scenario} — ${r.status}`,
    ...r.screenshots.map((s) => `Screenshot: ${s}`),
    ...(r.error ? [`Error: ${r.error}`] : []),
    ...(r.cls !== undefined ? [`Cumulative layout shift: ${r.cls}`] : []),
    ...r.fails.map((f) => `- FAIL: ${f}`),
    ...r.warns.map((w) => `- WARN: ${w}`),
    ...(!r.fails.length && !r.warns.length && !r.error ? ['- Clean.'] : []),
    '',
  ]),
].join('\n'));

if (results.some((r) => r.status !== 'PASS')) process.exit(1);
