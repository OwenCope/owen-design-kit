// Refresh site-gallery shots from shots/index.json.
//
//   npm i -D playwright && npx playwright install chromium
//   node capture.mjs [folder ...]
//
// No folders means every site in index.json. Writes hero.jpg, section-01.jpg
// to section-04.jpg and phone-hero.jpg into shots/<folder>/, then updates
// that site's files, title and captured date in index.json.
import { createRequire as __cr } from 'node:module';
import { join as __join, dirname as __dirname } from 'node:path';
import { fileURLToPath as __toPath } from 'node:url';
// Load Playwright from the project you run this in, so the script works from the kit's own folder.
let chromium;
try { ({ chromium } = __cr(__join(process.cwd(), 'package.json'))('playwright')); }
catch { console.error('Playwright not found here. Run: npm i -D playwright && npx playwright install chromium'); process.exit(1); }
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const root = __dirname(__toPath(import.meta.url));
const shotsDir = __join(root, '..', 'shots');
const indexPath = __join(shotsDir, 'index.json');
const sites = JSON.parse(readFileSync(indexPath, 'utf8'));

const wanted = process.argv.slice(2);
if (wanted.includes('--help')) { console.error('usage: node capture.mjs [folder ...]'); process.exit(1); }
const targets = wanted.length ? sites.filter((s) => wanted.includes(s.folder)) : sites;
for (const name of wanted) {
  if (!sites.some((s) => s.folder === name)) console.error(`skip ${name}: not in index.json`);
}

// Some banners only match on accessible name, so match the visible text instead.
async function dismissCookies(page) {
  await page.evaluate(() => {
    const match = /^(no thanks|reject|decline|accept( all)?( cookies)?)$/i;
    for (const el of document.querySelectorAll('button, [role="button"], a')) {
      const label = (el.innerText ?? el.textContent ?? '').trim();
      if (!match.test(label)) continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) < 0.05) continue;
      el.click();
      return;
    }
  }).catch(() => {});
}

async function captureSite(browser, site) {
  const dir = __join(shotsDir, site.folder);
  mkdirSync(dir, { recursive: true });

  const desktop = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  try {
    await desktop.goto(site.url, { waitUntil: 'networkidle' });
    await desktop.waitForTimeout(2500);
    await dismissCookies(desktop);
    await desktop.waitForTimeout(400);
    await desktop.evaluate(() => window.scrollTo(0, 0));
    await desktop.waitForTimeout(400);
    await desktop.screenshot({ path: __join(dir, 'hero.jpg'), type: 'jpeg', quality: 80 });
    for (let i = 1; i <= 4; i++) {
      await desktop.evaluate((y) => window.scrollTo(0, y), i * 1440);
      await desktop.waitForTimeout(400);
      await desktop.screenshot({ path: __join(dir, `section-0${i}.jpg`), type: 'jpeg', quality: 80 });
    }
    site.title = await desktop.title();
  } finally {
    await desktop.close();
  }

  const phone = await browser.newPage({
    viewport: { width: 370, height: 800 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  try {
    await phone.goto(site.url, { waitUntil: 'networkidle' });
    await phone.waitForTimeout(2500);
    await dismissCookies(phone);
    await phone.waitForTimeout(400);
    await phone.evaluate(() => window.scrollTo(0, 0));
    await phone.waitForTimeout(400);
    await phone.screenshot({ path: __join(dir, 'phone-hero.jpg'), type: 'jpeg', quality: 80 });
  } finally {
    await phone.close();
  }

  site.files = ['hero.jpg', 'section-01.jpg', 'section-02.jpg', 'section-03.jpg', 'section-04.jpg', 'phone-hero.jpg'];
  site.captured = true;
  site.capturedAt = new Date().toISOString().slice(0, 10);
  site.error = '';
}

let browser;
try {
  browser = await chromium.launch();
  for (const site of targets) {
    try {
      await captureSite(browser, site);
      console.log(`${site.folder}: captured ${site.files.length} shots`);
    } catch (e) {
      site.error = e.message;
      console.error(`${site.folder}: ERROR ${e.message}`);
    }
  }
} finally {
  await browser?.close();
}

writeFileSync(indexPath, JSON.stringify(sites, null, 2) + '\n');
console.log(`Updated ${indexPath}`);
