// Capture a web page for design review: desktop and phone, light and dark, plus quick checks.
//
//   npx -y -p playwright node capture.mjs http://localhost:3000 [out-dir]
//   (first run: npx -y playwright install chromium-headless-shell)
//
// Writes full-page screenshots to out-dir (default ./review) and prints problems it can measure:
// console errors, sideways scrolling on phones, buttons that move on hover, and links that go nowhere.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const url = process.argv[2];
const out = process.argv[3] ?? 'review';
if (!url) { console.error('usage: node capture.mjs <url> [out-dir]'); process.exit(1); }
mkdirSync(out, { recursive: true });

const sizes = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } };
const browser = await chromium.launch();
const problems = [];

for (const [size, viewport] of Object.entries(sizes)) {
  for (const scheme of ['light', 'dark']) {
    const page = await browser.newPage({ viewport, colorScheme: scheme, deviceScaleFactor: 2 });
    page.on('pageerror', (e) => problems.push(`${size}/${scheme}: page error: ${e.message}`));
    page.on('console', (m) => m.type() === 'error' && problems.push(`${size}/${scheme}: console: ${m.text()}`));
    await page.goto(url, { waitUntil: 'networkidle' });
    // Scroll through once so scroll-driven and lazy content renders before the capture.
    const height = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < height; y += viewport.height / 2) { await page.evaluate((v) => scrollTo(0, v), y); await page.waitForTimeout(60); }
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${out}/${size}-${scheme}.png`, fullPage: true });

    const sideways = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (sideways > 0) problems.push(`${size}/${scheme}: page scrolls sideways by ${sideways}px`);

    if (size === 'desktop' && scheme === 'light') {
      const controls = await page.$$('a[href], button');
      for (const control of controls.slice(0, 40)) {
        const label = ((await control.textContent()) ?? '').trim().slice(0, 40) || (await control.getAttribute('aria-label')) || '(no label)';
        const href = await control.getAttribute('href');
        if (href !== null && /^#(top)?$/.test(href) && /download|get|buy|install/i.test(label))
          problems.push(`"${label}" looks like a main action but links to ${href}`);
        // Scroll it into view first, so hovering doesn't scroll the page and fake a move.
        await control.scrollIntoViewIfNeeded().catch(() => {});
        await page.mouse.move(0, 0);
        await page.waitForTimeout(350);
        const before = await control.boundingBox();
        if (!before || before.width === 0) continue;
        await control.hover().catch(() => {});
        await page.waitForTimeout(350);
        const after = await control.boundingBox();
        if (after && (Math.abs(after.y - before.y) > 0.5 || Math.abs(after.x - before.x) > 0.5))
          problems.push(`"${label}" moves ${Math.round(after.y - before.y)}px on hover`);
      }
    }
    await page.close();
  }
}
await browser.close();
console.log(`Screenshots in ${out}/. Open each at full size and zoom into edges before scoring.`);
console.log(problems.length ? `\nProblems:\n- ${problems.join('\n- ')}` : '\nNo measurable problems. Still look at every screenshot.');
