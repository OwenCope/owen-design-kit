// Run the same short design brief through the OpenCode CLI into a fresh folder,
// then capture the result at fixed sizes so two runs can be compared fairly.
//
// Usage:
//   node scripts/eval-run.mjs --brief scripts/briefs/notch.txt --model <model-id> --out ~/kit-eval/notch-2 [--port 8600] [--timeout 1800]
//   node scripts/eval-run.mjs --compare <dirA> <dirB>
//
// Real opencode flags used (opencode v2.0.26, from `opencode run --help`):
//   opencode run --model/-m <provider/model#variant> --auto "<brief>"
// `run` is the non-interactive form; --auto approves permissions without prompting.
// Working directory is set by spawning with cwd = out folder.
import { createRequire as __cr } from 'node:module';
import { join as __join } from 'node:path';
let chromium;
try { ({ chromium } = __cr(__join(process.cwd(), 'package.json'))('playwright')); }
catch { console.error('Playwright not found here. Run: npm i -D playwright && npx playwright install chromium'); process.exit(1); }
import { spawn, execSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, statSync, createReadStream } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const kitRoot = join(here, '..');
const args = process.argv.slice(2);
const flag = (n) => { const i = args.indexOf(n); return i === -1 ? null : args[i + 1]; };

function serveDir(dir, port) {
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
  const ext = (p) => (p.match(/\.[a-z0-9]+$/i) ?? [''])[0].toLowerCase();
  const server = createServer((req, res) => {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = join(dir, path === '/' ? 'index.html' : path.replace(/^\//, ''));
    if (!file.startsWith(dir)) { res.writeHead(403); res.end(); return; }
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    if (!existsSync(file)) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': types[ext(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(res);
  });
  return new Promise((resolveP) => server.listen(port, () => resolveP(server)));
}
const close = (s) => new Promise((r) => s.close(r));

async function capture(url, out) {
  mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  try {
    const shots = [
      { name: 'desktop-light.png', viewport: { width: 1440, height: 900 }, colorScheme: 'light' },
      { name: 'desktop-dark.png', viewport: { width: 1440, height: 900 }, colorScheme: 'dark' },
      { name: 'phone.png', viewport: { width: 390, height: 844 }, colorScheme: 'light' },
    ];
    for (const s of shots) {
      const page = await browser.newPage({ viewport: s.viewport, colorScheme: s.colorScheme });
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      await page.screenshot({ path: join(out, s.name) });
      await page.close();
    }
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(out, 'desktop-full.png'), fullPage: true });
    await page.close();
  } finally { await browser.close(); }
}

async function compareMode(dirA, dirB) {
  const names = ['desktop-light.png', 'desktop-dark.png', 'phone.png', 'desktop-full.png'];
  const rows = names
    .filter((n) => existsSync(join(dirA, 'captures', n)) || existsSync(join(dirB, 'captures', n)))
    .map((n) => {
      const cell = (d) => existsSync(join(d, 'captures', n))
        ? `<img src="file://${resolve(d, 'captures', n)}" style="width:100%">`
        : '<p>missing</p>';
      return `<h2>${n}</h2><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px"><div><h3>A</h3>${cell(dirA)}</div><div><h3>B</h3>${cell(dirB)}</div></div>`;
    }).join('\n');
  const html = `<!doctype html><html><body style="font-family:system-ui;margin:24px"><h1>A: ${dirA} vs B: ${dirB}</h1>${rows}</body></html>`;
  writeFileSync(join(dirB, 'compare.html'), html);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
    await page.goto('file://' + resolve(dirB, 'compare.html'), { waitUntil: 'networkidle' });
    await page.screenshot({ path: join(dirB, 'compare.png'), fullPage: true });
    await page.close();
  } finally { await browser.close(); }
  console.log(`Wrote ${join(dirB, 'compare.html')} and ${join(dirB, 'compare.png')}`);
}

if (args.includes('--help')) { console.error('usage: node scripts/eval-run.mjs --brief <file> --model <model-id> --out <dir> [--port 8600] [--timeout 1800]\n   or: node scripts/eval-run.mjs --compare <dirA> <dirB>'); process.exit(0); }

if (args[0] === '--compare') {
  const [dirA, dirB] = [args[1], args[2]];
  if (!dirA || !dirB) { console.error('usage: node scripts/eval-run.mjs --compare <dirA> <dirB>'); process.exit(1); }
  await compareMode(resolve(dirA), resolve(dirB));
  process.exit(0);
}

const briefPath = flag('--brief'), model = flag('--model'), outRaw = flag('--out');
const port = Number(flag('--port') ?? 8600), timeoutSec = Number(flag('--timeout') ?? 1800);
if (!briefPath || !model || !outRaw) {
  console.error('usage: node scripts/eval-run.mjs --brief <file> --model <model-id> --out <dir> [--port 8600] [--timeout 1800]');
  process.exit(1);
}
const out = resolve(outRaw.replace(/^~/, process.env.HOME ?? ''));
if (existsSync(out) && readdirSync(out).length > 0) { console.error(`Refusing: ${out} already exists and is not empty.`); process.exit(1); }
mkdirSync(out, { recursive: true });

const brief = readFileSync(briefPath, 'utf8');
writeFileSync(join(out, 'brief.txt'), brief);
let kitVersion = 'unknown', opencodeVersion = 'unknown';
try { kitVersion = JSON.parse(readFileSync(join(kitRoot, '.claude-plugin', 'marketplace.json'), 'utf8')).metadata.version; } catch {}
try { opencodeVersion = execSync('opencode --version', { encoding: 'utf8' }).trim(); } catch {}
const command = `opencode run --model ${model} --auto '<brief as final argv; full text in brief.txt>'`;
writeFileSync(join(out, 'run.json'), JSON.stringify({ model, date: new Date().toISOString(), kitVersion, opencodeVersion, command }, null, 2));

const started = Date.now();
const log = join(out, 'agent.log');
const proc = spawn('opencode', ['run', '--model', model, '--auto', brief], { cwd: out, stdio: ['ignore', 'pipe', 'pipe'] });
const { openSync, writeSync } = await import('node:fs');
const fd = openSync(log, 'w');
proc.stdout.on('data', (d) => writeSync(fd, d));
proc.stderr.on('data', (d) => writeSync(fd, d));
let exitCode = null;
const timer = setTimeout(() => { proc.kill('SIGKILL'); }, timeoutSec * 1000);
await new Promise((r) => { proc.on('close', (c) => { exitCode = c ?? 124; r(); }); proc.on('error', () => { exitCode = 1; r(); }); });
clearTimeout(timer);
const { closeSync } = await import('node:fs');
closeSync(fd);
const durationSec = Math.round((Date.now() - started) / 1000);

const hasIndex = existsSync(join(out, 'index.html'));
if (hasIndex) {
  const server = await serveDir(out, port);
  try { await capture(`http://localhost:${port}/`, join(out, 'captures')); }
  finally { await close(server); }
}

const files = [];
(function walk(d, rel = '') { for (const e of readdirSync(d)) { if (e === 'captures') continue; const p = join(d, e); const r = rel ? rel + '/' + e : e; if (statSync(p).isDirectory()) walk(p, r); else files.push(r); } })(out);
writeFileSync(join(out, 'summary.md'), `# Eval run\n\n- Model: ${model}\n- Date: ${new Date().toISOString()}\n- Duration: ${durationSec}s\n- Exit code: ${exitCode}\n- index.html: ${hasIndex ? 'yes' : 'no'}${hasIndex ? '' : ' (no captures taken)'}\n\n## Files\n\n${files.map((f) => `- ${f}`).join('\n')}\n`);
console.log(`Done in ${durationSec}s, exit ${exitCode}, index.html: ${hasIndex ? 'yes' : 'no'}`);
