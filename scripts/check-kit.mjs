#!/usr/bin/env node
// Checks the kit for broken links, missing skills and lines that contradict its own rules.
// Usage: node scripts/check-kit.mjs [--json]
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pluginDirs = ['plugins/apple-craft/skills', 'plugins/owen-design/skills'].map((p) => join(root, p));
const out = [];
const add = (level, file, line, msg) => out.push({ level, file: relative(root, file), line, msg });
const read = (f) => { try { return readFileSync(f, 'utf8'); } catch { return null; } };
const ls = (d) => { try { return readdirSync(d); } catch { return []; } };
const isDir = (p) => { try { return statSync(p).isDirectory(); } catch { return false; } };

// 1. Skill folders and frontmatter
const skills = new Map(); // name -> folder
for (const base of pluginDirs) for (const name of ls(base)) {
  const dir = join(base, name);
  if (!isDir(dir)) continue;
  const md = join(dir, 'SKILL.md');
  if (!existsSync(md)) continue; // research or asset folders
  skills.set(name, dir);
  const text = read(md) || '';
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) { add('FAIL', md, 1, 'no frontmatter'); continue; }
  const n = fm[1].match(/^name:\s*(.+)$/m)?.[1].trim();
  if (!n) add('FAIL', md, 1, 'frontmatter has no name');
  else if (n !== name) add('FAIL', md, 1, `name "${n}" does not match folder "${name}"`);
  if (!/^description:\s*\S/m.test(fm[1])) add('FAIL', md, 1, 'frontmatter has no description');
}

// Markdown files to scan
const mdFiles = [];
const walk = (d) => { for (const f of ls(d)) { if (f === 'node_modules' || f.startsWith('.')) continue; const p = join(d, f); if (isDir(p)) walk(p); else if (f.endsWith('.md')) mdFiles.push(p); } };
walk(join(root, 'plugins'));
for (const f of ['README.md', 'AGENTS.md']) if (existsSync(join(root, f))) mdFiles.push(join(root, f));

const skillOf = (file) => [...skills.values()].find((d) => file.startsWith(d + '/'));
const rules = (() => { try { return JSON.parse(read(join(root, 'scripts/check-kit.rules.json'))); } catch (e) { add('FAIL', join(root, 'scripts/check-kit.rules.json'), 1, 'rules file is not valid JSON'); return []; } })()
  .map((r) => { try { return { ...r, re: new RegExp(r.pattern, 'i') }; } catch { add('FAIL', join(root, 'scripts/check-kit.rules.json'), 1, `bad pattern in ${r.id}`); return null; } }).filter(Boolean);

for (const file of mdFiles) {
  const lines = (read(file) || '').split('\n');
  let fence = false;
  lines.forEach((line, i) => {
    const ln = i + 1;
    if (/^\s*(```|~~~)/.test(line)) { fence = !fence; return; }
    if (fence) return;
    // 2. Unknown skill names
    if (/\bskills?\b/i.test(line)) for (const m of line.matchAll(/`([a-z][a-z0-9]*(?:-[a-z0-9]+)+)`/g))
      if (!skills.has(m[1])) add('WARN', file, ln, `unknown skill \`${m[1]}\``);
    // 3. Relative links
    for (const m of line.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
      const href = m[1];
      if (/^(https?:|mailto:|#)/.test(href)) continue;
      const target = resolve(dirname(file), href.split('#')[0].split('?')[0]);
      if (!existsSync(target)) add('FAIL', file, ln, `broken link ${href}`);
    }
    // 4. Backtick paths
    for (const m of line.matchAll(/`([^`\s]+\/[^`\s]+\.(?:md|mjs|js|sh|swift|html|css|json|png|jpg))`/g)) {
      const p = m[1].replace(/^\.\//, '');
      // Project skills describe files in other repos; globs, placeholders and generated folders aren't checkable.
      if (/\/(project-[^/]+|working-with-owen)\//.test(file)) continue;
      if (p.startsWith('/') || p.startsWith('~') || /[<*]|X\.Y/.test(p) || p.startsWith('mac-assets/') || p.startsWith('node_modules/')) continue;
      const bases = [dirname(file), skillOf(file), ...pluginDirs, root].filter(Boolean);
      if (!bases.some((b) => existsSync(join(b, p)))) add('WARN', file, ln, `path not found \`${p}\``);
    }
    // 6. Contradiction rules
    // A rule quoted as a prohibition ("no press shrink") or a condition ("otherwise write three") is the rule itself, not a breach.
    // Logs of past rejections quote the rejected thing; rules don't apply to them.
    if (!/(picks|lessons)\.md$/.test(file)) for (const r of rules) { const hit = line.match(r.re); if (hit && !/\b(no|never|not|don't|otherwise|only when|if)\b[^.]{0,30}$/i.test(line.slice(0, hit.index))) add(r.level, file, ln, `${r.id}: ${r.message} ("${hit[0]}")`); }
  });
}

// 5. README skills table
const readme = read(join(root, 'README.md'));
if (readme) {
  const listed = new Set();
  readme.split('\n').forEach((line, i) => {
    const m = line.match(/^\|\s*`([a-z0-9-]+)`\s*\|/);
    if (!m) return;
    listed.add(m[1]);
    if (!skills.has(m[1])) add('FAIL', join(root, 'README.md'), i + 1, `README lists \`${m[1]}\` but there is no such skill`);
  });
  for (const [name, dir] of skills) if (dir.includes('apple-craft') && !listed.has(name)) add('WARN', join(root, 'README.md'), 1, `apple-craft skill \`${name}\` missing from README table`);
}

if (process.argv.includes('--json')) console.log(JSON.stringify(out, null, 2));
else {
  for (const lvl of ['FAIL', 'WARN']) for (const o of out.filter((x) => x.level === lvl)) console.log(`${lvl}  ${o.file}:${o.line}  ${o.msg}`);
  const f = out.filter((o) => o.level === 'FAIL').length, w = out.length - f;
  console.log(`\n${skills.size} skills, ${mdFiles.length} files checked: ${f} fail, ${w} warn`);
}
process.exit(out.some((o) => o.level === 'FAIL') ? 1 : 0);
