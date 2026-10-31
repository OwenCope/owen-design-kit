// Reduced Motion check: with Reduce Motion on, nothing should still move on its own.
//
//   npm i -D playwright && npx playwright install chromium
//   node reduced-motion.mjs <url>
//
// Loads the page with reducedMotion 'reduce', scrolls through once, and prints
// a pass/fail list: running animations, marquees, autoplay video,
// smooth scrolling, and reveals stuck at opacity 0. Exit 1 on any FAIL.
import { createRequire as __cr } from 'node:module';
import { join as __join } from 'node:path';
let chromium;
try { ({ chromium } = __cr(__join(process.cwd(), 'package.json'))('playwright')); }
catch { console.error('Playwright not found here. Run: npm i -D playwright && npx playwright install chromium'); process.exit(1); }

const url = process.argv[2];
if (!url || process.argv.includes('--help')) { console.error('usage: node reduced-motion.mjs <url>'); process.exit(1); }

const browser = await chromium.launch();
let failed = 0;
const line = (pass, name, detail) => {
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` - ${detail}` : ''}`);
  if (!pass) failed++;
};
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 450) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(60);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);

  const anims = await page.evaluate(() => {
    let all = [];
    try { all = document.getAnimations({ subtree: true }); } catch { all = []; }
    return all.slice(0, 40).map((a) => {
      const t = a.effect?.target;
      let sel = '(unknown)';
      if (t && t.tagName) {
        sel = t.tagName.toLowerCase();
        if (t.id) sel += `#${t.id}`;
        else if (typeof t.className === 'string' && t.className.trim()) sel += '.' + t.className.trim().split(/\s+/).slice(0, 2).join('.');
      }
      return { sel, state: a.playState, name: a.animationName ?? a.id ?? '' };
    });
  });
  const running = anims.filter((a) => a.state === 'running');
  line(!running.length, 'running animations', running.length ? `${running.length} still running: ${running.slice(0, 5).map((a) => `${a.sel} (${a.state})`).join(', ')}` : 'none running');

  // Marquees: on-screen elements whose transform moves between two samples 600ms apart.
  const moved = await page.evaluate(() => new Promise((res) => {
    const vis = [...document.querySelectorAll('*')].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight;
    }).slice(0, 1500);
    const first = new Map(vis.map((el) => [el, getComputedStyle(el).transform]));
    setTimeout(() => {
      const out = [];
      for (const el of vis) {
        if (!el.isConnected) continue;
        if (getComputedStyle(el).transform !== first.get(el)) {
          let s = el.tagName.toLowerCase();
          if (el.id) s += `#${el.id}`;
          else if (typeof el.className === 'string' && el.className.trim()) s += '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.');
          out.push(s);
          if (out.length >= 10) break;
        }
      }
      res(out);
    }, 600);
  }));
  line(!moved.length, 'marquees', moved.length ? `still moving: ${moved.slice(0, 5).join(', ')}` : 'nothing moving on screen');

  const vids = await page.evaluate(() => [...document.querySelectorAll('video')].slice(0, 12).map((v) => ({
    autoplay: v.autoplay, paused: v.paused,
    sel: (v.id ? `video#${v.id}` : `video.${typeof v.className === 'string' ? v.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}`),
  })));
  const playing = vids.filter((v) => !v.paused);
  line(!playing.length, 'autoplay video', playing.length ? `${playing.length} playing: ${playing.slice(0, 5).map((v) => v.sel).join(', ')}` : vids.length ? `${vids.length} videos, all paused` : 'no videos');

  const behavior = await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);
  line(behavior !== 'smooth', 'scroll behavior', `html scroll-behavior is ${behavior}`);

  const stuck = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      // Controls hidden until hover (nav chevrons, close buttons) are not reveals.
      if (el.closest('a, button, input, select, [role], svg, [aria-hidden="true"]')) continue;
      if (r.width < 40 || r.height < 16) continue;
      if (!el.textContent.trim() && !el.querySelector('img, video, picture, canvas')) continue;
      if (Number(cs.opacity) < 0.05) {
        let s = el.tagName.toLowerCase();
        if (el.id) s += `#${el.id}`;
        else if (typeof el.className === 'string' && el.className.trim()) s += '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.');
        out.push(s);
        if (out.length >= 10) break;
      }
    }
    return out;
  });
  // Not a fail: inactive tabs and captions are hidden on purpose. Look at each one.
  if (stuck.length) console.log(`CHECK hidden content - ${stuck.length} elements at opacity 0 after a full scroll, confirm each is meant to be hidden: ${stuck.join(', ')}`);
  else line(true, 'reveals resolve', 'nothing stuck hidden');

  await ctx.close();
} finally {
  await browser.close();
}
process.exit(failed ? 1 : 0);
