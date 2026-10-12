#!/usr/bin/env node
// Detects when a candidate page reskins a design-kit demo/example page.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);

if (args.includes('--help') || args.length === 0) {
  console.log('Usage: node scripts/check-copy.mjs <file-or-folder> [--threshold 0.3] [--json]');
  process.exit(args.includes('--help') ? 0 : 1);
}

let target = null, threshold = 0.3, json = false;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--json') json = true;
  else if (a === '--threshold') threshold = parseFloat(args[++i]);
  else if (!a.startsWith('--') && target === null) target = a;
}
if (!target) { console.log('Usage: node scripts/check-copy.mjs <file-or-folder> [--threshold 0.3] [--json]'); process.exit(1); }
target = resolve(target);

const isDir = (p) => { try { return statSync(p).isDirectory(); } catch { return false; } };
const ls = (d) => { try { return readdirSync(d); } catch { return []; } };
const read = (f) => { try { return readFileSync(f, 'utf8'); } catch { return null; } };

// Collect files recursively, skipping ignored dirs and motion.js library.
const SKIP_DIRS = new Set(['node_modules', '.git']);
const walk = (dir, exts, out = []) => {
  for (const f of ls(dir)) {
    if (SKIP_DIRS.has(f)) continue;
    const p = join(dir, f);
    if (isDir(p)) { walk(p, exts, out); continue; }
    if (basename(p) === 'motion.js') continue;
    if (exts.some((e) => p.endsWith(e))) out.push(p);
  }
  return out;
};

let candidates;
if (isDir(target)) candidates = walk(target, ['.html', '.css', '.js']);
else candidates = [target];
if (candidates.length === 0) { console.error('No candidate files found.'); process.exit(1); }

// Kit references: all .html under plugins/apple-craft/skills plus .js under signature-moments/examples.
const skillsBase = join(root, 'plugins', 'apple-craft', 'skills');
const refs = walk(skillsBase, ['.html']);
for (const f of walk(join(skillsBase, 'signature-moments', 'examples'), ['.js'])) {
  if (!refs.includes(f)) refs.push(f);
}

// Normalise: lowercase, collapse whitespace, drop blank/short/closing-only lines.
const normalise = (text) =>
  text.toLowerCase().split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter((l) => l.length >= 20 && !/^[}\s>);]*$/.test(l) && !/^<\/\w+>$/.test(l));

const shingles = (lines, n = 5) => {
  const words = lines.join(' ').split(' ').filter(Boolean);
  const set = new Set();
  for (let i = 0; i + n <= words.length; i++) set.add(words.slice(i, i + n).join(' '));
  return set;
};
const jaccard = (a, b) => {
  if (!a.size && !b.size) return 0;
  let inter = 0;
  const [small, big] = a.size < b.size ? [a, b] : [b, a];
  for (const x of small) if (big.has(x)) inter++;
  return inter / (a.size + b.size - inter || 1);
};

const refCache = new Map();
for (const r of refs) {
  const t = read(r);
  if (t === null) continue;
  const lines = normalise(t);
  refCache.set(r, { lines, set: new Set(lines), sh: shingles(lines) });
}

const results = [];
for (const cand of candidates) {
  const text = read(cand);
  if (text === null) continue;
  const clines = normalise(text);
  const cset = new Set(clines);
  const csh = shingles(clines);
  let best = { ref: null, sim: 0, shared: [] };
  if (clines.length > 0) {
    for (const [r, rc] of refCache) {
      const shared = clines.filter((l) => rc.set.has(l));
      const lineRatio = shared.length / clines.length;
      const sim = Math.max(lineRatio, jaccard(csh, rc.sh));
      if (sim > best.sim) best = { ref: r, sim, shared };
    }
  }
  results.push({
    candidate: cand,
    reference: best.ref,
    similarity: best.sim,
    sharedCount: best.shared.length,
    shared: [...new Set(best.shared)].slice(0, 8),
  });
}
results.sort((a, b) => b.similarity - a.similarity);

if (json) {
  console.log(JSON.stringify(results.map((r) => ({
    candidate: r.candidate,
    reference: r.reference ? relative(root, r.reference) : null,
    similarity: +r.similarity.toFixed(4),
    sharedLines: r.sharedCount,
    status: r.similarity >= threshold ? 'FAIL' : 'PASS',
  })), null, 2));
} else {
  for (const r of results) {
    const fail = r.similarity >= threshold;
    const status = fail ? 'FAIL' : 'PASS';
    console.log(`${status}  ${r.candidate}  ->  ${r.reference ? relative(root, r.reference) : '(no reference)'}  ${(r.similarity * 100).toFixed(1)}%  shared=${r.sharedCount}`);
    if (fail) for (const l of r.shared) console.log(`      | ${l.slice(0, 100)}`);
  }
}
process.exit(results.some((r) => r.similarity >= threshold) ? 1 : 0);
