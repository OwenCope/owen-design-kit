// Renders og-image.html to a 1200x630 PNG.
// Usage: node make-og.mjs --title "Gaze" --line "Unlock your Mac with a look." --image ./shot.png [--out og.png]
// Run from a project that has Playwright installed (npm i -D playwright).
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { readFileSync } from 'node:fs';

const require = createRequire(resolve(process.cwd(), 'package.json'));
let chromium;
try { ({ chromium } = require('playwright')); }
catch { console.error('Playwright not found. Run: npm i -D playwright && npx playwright install chromium'); process.exit(1); }

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > -1 ? process.argv[i + 1] : d; };
const title = arg('title', 'Product'), line = arg('line', ''), image = arg('image'), out = resolve(arg('out', 'og.png'));
const template = resolve(dirname(fileURLToPath(import.meta.url)), 'og-image.html');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(template).href);
// Inline the image as a data URL so file paths outside the template folder work.
const src = image ? `data:image/${image.endsWith('.jpg') || image.endsWith('.jpeg') ? 'jpeg' : 'png'};base64,${readFileSync(resolve(image)).toString('base64')}` : null;
await page.evaluate(({ title, line, src }) => {
  document.getElementById('title').textContent = title;
  document.getElementById('line').textContent = line;
  if (src) document.getElementById('image').src = src;
}, { title, line, src });
await page.waitForFunction(() => [...document.images].every((i) => i.complete));
await page.screenshot({ path: out });
await browser.close();
console.log(`wrote ${out}`);
