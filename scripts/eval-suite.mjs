// Run every fair brief through the OpenCode CLI into one folder, then build a
// single report page so the runs can be judged side by side.
//
// Usage:
//   node scripts/eval-suite.mjs --model <model-id> --out <dir> [--agent designer] [--briefs tally,settings,music,recipe,habit] [--parallel 2] [--timeout 1800]
//
// eval-run.mjs has no --agent flag, so this script spawns `opencode run`
// directly (same flags eval-run.mjs uses, plus --agent when given) and reuses
// its capture steps below.
import { createRequire as __cr } from 'node:module';
import { join as __join } from 'node:path';
let chromium;
try { ({ chromium } = __cr(__join(process.cwd(), 'package.json'))('playwright')); }
catch { console.error('Playwright not found here. Run: npm i -D playwright && npx playwright install chromium'); process.exit(1); }
import { spawn, execSync, execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, statSync, createReadStream, openSync, writeSync, closeSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const kitRoot = join(here, '..');
const args = process.argv.slice(2);
const flag = (n) => { const i = args.indexOf(n); return i === -1 ? null : args[i + 1]; };

const USAGE = 'usage: node scripts/eval-suite.mjs --model <model-id> --out <dir> [--agent <name>] [--briefs tally,settings,music,recipe,habit] [--parallel 2] [--timeout 1800]';
if (args.includes('--help') || args.includes('-h')) { console.error(USAGE); process.exit(0); }

const model = flag('--model'), outRaw = flag('--out');
const agent = flag('--agent');
const briefs = (flag('--briefs') ?? 'tally,settings,music,recipe,habit').split(',').map((s) => s.trim()).filter(Boolean);
const parallel = Number(flag('--parallel') ?? 2) || 2;
const timeoutSec = Number(flag('--timeout') ?? 1800);
if (!model || !outRaw || briefs.length === 0) { console.error(USAGE); process.exit(1); }
const out = resolve(outRaw.replace(/^~/, process.env.HOME ?? ''));
if (existsSync(out) && readdirSync(out).length > 0) { console.error(`Refusing: ${out} already exists and is not empty.`); process.exit(1); }
mkdirSync(out, { recursive: true });

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

async function capture(url, outDir) {
  mkdirSync(outDir, { recursive: true });
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
      await page.screenshot({ path: join(outDir, s.name) });
      await page.close();
    }
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(outDir, 'desktop-full.png'), fullPage: true });
    await page.close();
  } finally { await browser.close(); }
}

function runAgent(brief, runDir) {
  return new Promise((resolveP) => {
    const opArgs = ['run', '--model', model];
    if (agent) opArgs.push('--agent', agent);
    opArgs.push('--auto', brief);
    const log = join(runDir, 'agent.log');
    const proc = spawn('opencode', opArgs, { cwd: runDir, stdio: ['ignore', 'pipe', 'pipe'] });
    const fd = openSync(log, 'w');
    proc.stdout.on('data', (d) => writeSync(fd, d));
    proc.stderr.on('data', (d) => writeSync(fd, d));
    let exitCode = null;
    const timer = setTimeout(() => { proc.kill('SIGKILL'); }, timeoutSec * 1000);
    const done = (c) => { clearTimeout(timer); closeSync(fd); resolveP(c); };
    proc.on('close', (c) => done(c ?? 124));
    proc.on('error', () => done(1));
  });
}

function lintSlop(url) {
  try {
    const text = execFileSync('node', [join(kitRoot, 'plugins/apple-craft/skills/design-review/scripts/lint-slop.mjs'), url], { encoding: 'utf8', timeout: 300000 });
    return parseLint(text);
  } catch (e) {
    return parseLint((e.stdout ?? '') + '\n' + (e.stderr ?? ''));
  }
}

function parseLint(text) {
  let pass = 0, fail = 0, warn = 0;
  for (const line of text.split('\n')) {
    const m = line.match(/^(PASS|FAIL|WARN)\s+(.+)$/);
    if (!m) continue;
    if (m[1] === 'PASS') pass++;
    else if (m[1] === 'FAIL') fail++;
    else warn++;
  }
  return { pass, fail, warn, raw: text.trim() };
}

function checkCopy(runDir) {
  const script = join(kitRoot, 'scripts/check-copy.mjs');
  if (!existsSync(script)) return { skipped: true, note: 'scripts/check-copy.mjs not present; skipped' };
  try {
    const text = execFileSync('node', [script, runDir, '--json'], { encoding: 'utf8', timeout: 120000 });
    return { skipped: false, result: text.trim() };
  } catch (e) {
    return { skipped: false, result: ((e.stdout ?? '') + '\n' + (e.stderr ?? '')).trim() || 'check-copy failed with no output' };
  }
}

async function runBrief(name, port) {
  const briefPath = join(here, 'briefs', `${name}.txt`);
  if (!existsSync(briefPath)) return { name, error: `brief not found: ${briefPath}` };
  const runDir = join(out, name);
  mkdirSync(runDir, { recursive: true });
  const brief = readFileSync(briefPath, 'utf8');
  writeFileSync(join(runDir, 'brief.txt'), brief);
  let kitVersion = 'unknown', opencodeVersion = 'unknown';
  try { kitVersion = JSON.parse(readFileSync(join(kitRoot, '.claude-plugin', 'marketplace.json'), 'utf8')).metadata.version; } catch {}
  try { opencodeVersion = execSync('opencode --version', { encoding: 'utf8' }).trim(); } catch {}
  const opArgs = ['run', '--model', model];
  if (agent) opArgs.push('--agent', agent);
  const command = `opencode ${opArgs.join(' ')} --auto '<brief as final argv; full text in brief.txt>'`;
  writeFileSync(join(runDir, 'run.json'), JSON.stringify({ model, agent: agent ?? null, brief: name, date: new Date().toISOString(), kitVersion, opencodeVersion, command }, null, 2));

  const started = Date.now();
  const exitCode = await runAgent(brief, runDir);
  const durationSec = Math.round((Date.now() - started) / 1000);

  const hasIndex = existsSync(join(runDir, 'index.html'));
  let lint = { pass: 0, fail: 0, warn: 0, raw: hasIndex ? '' : 'no index.html; lint not run' };
  if (hasIndex) {
    const server = await serveDir(runDir, port);
    try {
      await capture(`http://localhost:${port}/`, join(runDir, 'captures'));
      lint = lintSlop(`http://localhost:${port}/`);
    } finally { await close(server); }
  }
  const copy = checkCopy(runDir);

  let logTail = '';
  try {
    const lines = readFileSync(join(runDir, 'agent.log'), 'utf8').split('\n');
    logTail = lines.slice(-10).join('\n');
  } catch {}

  const files = [];
  (function walk(d, rel = '') { for (const e of readdirSync(d)) { if (e === 'captures') continue; const p = join(d, e); const r = rel ? rel + '/' + e : e; if (statSync(p).isDirectory()) walk(p, r); else files.push(r); } })(runDir);
  writeFileSync(join(runDir, 'summary.md'), `# Eval run (${name})\n\n- Model: ${model}\n- Agent: ${agent ?? '(default)'}\n- Date: ${new Date().toISOString()}\n- Duration: ${durationSec}s\n- Exit code: ${exitCode}\n- index.html: ${hasIndex ? 'yes' : 'no'}${hasIndex ? '' : ' (no captures taken)'}\n- Lint: ${lint.pass} pass, ${lint.fail} fail, ${lint.warn} warn\n- Copy check: ${copy.skipped ? copy.note : copy.result}\n\n## Files\n\n${files.map((f) => `- ${f}`).join('\n')}\n`);
  console.log(`Done ${name} in ${durationSec}s, exit ${exitCode}, index.html: ${hasIndex ? 'yes' : 'no'}, lint ${lint.pass}/${lint.fail}/${lint.warn}`);
  return { name, runDir, durationSec, exitCode, hasIndex, lint, copy, logTail };
}

const results = [];
let next = 0;
async function worker(slot) {
  while (next < briefs.length) {
    const name = briefs[next++];
    results.push(await runBrief(name, 8600 + slot));
  }
}
await Promise.all(Array.from({ length: Math.min(parallel, briefs.length) }, (_, i) => worker(i)));

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const shot = (r, n) => existsSync(join(r.runDir, 'captures', n))
  ? `<img src="./${r.name}/captures/${n}" style="width:100%">` : '<p>missing</p>';
const rows = results.map((r) => {
  if (r.error) return `<tr><td>${esc(r.name)}</td><td colspan="5">${esc(r.error)}</td></tr>`;
  return `<tr><td>${esc(r.name)}</td>`
    + `<td>${shot(r, 'desktop-light.png')}</td>`
    + `<td>${shot(r, 'phone.png')}</td>`
    + `<td>${r.lint.pass} pass, ${r.lint.fail} fail, ${r.lint.warn} warn</td>`
    + `<td>${esc(r.copy.skipped ? r.copy.note : r.copy.result)}</td>`
    + `<td>${r.durationSec}s, exit ${r.exitCode}, index.html ${r.hasIndex ? 'yes' : 'no'}</td></tr>`
    + `<tr><td colspan="6"><details><summary>last 10 lines of agent.log (${esc(r.name)})</summary><pre>${esc(r.logTail)}</pre></details></td></tr>`;
}).join('\n');
writeFileSync(join(out, 'index.html'), `<!doctype html><html><head><meta charset="utf-8"><title>Eval suite: ${esc(model)}${agent ? ` (${esc(agent)})` : ''}</title></head>`
  + `<body style="font-family:system-ui;margin:24px"><h1>Eval suite: ${esc(model)}${agent ? `, agent ${esc(agent)}` : ''}</h1>`
  + `<table border="1" cellpadding="8" style="border-collapse:collapse;width:100%"><tr><th>Brief</th><th>Desktop light</th><th>Phone</th><th>Lint</th><th>Copy check</th><th>Run</th></tr>${rows}</table></body></html>`);

const mdRows = results.map((r) => {
  if (r.error) return `| ${r.name} | error | error | ${r.error} |`;
  return `| ${r.name} | ${r.durationSec}s, exit ${r.exitCode} | ${r.lint.pass} pass, ${r.lint.fail} fail, ${r.lint.warn} warn | ${r.copy.skipped ? r.copy.note : r.copy.result.replace(/\n/g, '; ')} |`;
}).join('\n');
writeFileSync(join(out, 'summary.md'), `# Eval suite\n\n- Model: ${model}\n- Agent: ${agent ?? '(default)'}\n- Date: ${new Date().toISOString()}\n\n| Brief | Run | Lint | Copy check |\n|---|---|---|---|\n${mdRows}\n`);
console.log(`Wrote ${join(out, 'index.html')} and ${join(out, 'summary.md')}`);
