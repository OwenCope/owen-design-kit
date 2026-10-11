// Run from the consuming project: node /path/to/capture-motion.mjs <url> <scenario.json> <out-dir>
import { createRequire } from 'node:module';
import { readFile, mkdir, readdir, lstat, stat, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { performance } from 'node:perf_hooks';

const limits = { scenarioBytes: 32768, targets: 20, actions: 40, samples: 1200,
  sampleBytes: 4 * 1024 * 1024, outputBytes: 64 * 1024 * 1024, text: 256, animations: 8 };
const limitations = [
  'Diagnostic capture, not a performance benchmark. Sampling is discrete and instrumentation adds overhead.',
  'Computed styles and geometry do not prove visibility, readability or accessibility compliance.',
  'Canvas, iframe contents, shadow roots and pseudo-elements are not introspected.',
  'Web Animations inventories omit some JavaScript-driven motion; only eight animations per target are retained.',
  'Screenshots can perturb timing. Their timestamps bracket capture, not the exact rasterization instant.',
  'Video and DOM samples have no exact frame alignment. No causal attribution, jank certification or visual approval is inferred.',
  'Final settling is a fixed wait, not a detected end of motion. Replay order is fixed; application and network behavior may vary.',
  'Structured evidence omits HTML, page text, input values, cookies, headers, storage and error payloads.',
  'Paint masking is selectable and recorded in environment; masked mode changes standard form paint and computed colors. Neither mode provides comprehensive redaction; capture only nonsensitive pages.',
  'Output size is polled during recording and enforced after closure; temporary disk use can exceed the final limit.',
];
const fail = (message) => { throw new Error(message); };
const navigationKey = /^(?:(?:Shift|Control|Alt|Meta)\+)*(?:Enter|Escape|Tab|Space|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Home|End|PageUp|PageDown)$/;
const semanticStates = ['aria-expanded', 'aria-disabled', 'disabled'];
function keys(value, allowed, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${label} must be an object.`);
  for (const key of Object.keys(value)) if (!allowed.includes(key)) fail(`${label}: unsupported field ${key}. JavaScript steps are not supported.`);
}
function integer(value, min, max, label) {
  if (!Number.isInteger(value) || value < min || value > max) fail(`${label} must be an integer from ${min} to ${max}.`);
  return value;
}
function text(value, label, max = limits.text) {
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[\x00-\x1f]/.test(value)) fail(`${label} must be nonempty text of at most ${max} characters, without control characters.`);
  return value;
}
function validate(raw) {
  keys(raw, ['viewport', 'colorScheme', 'reducedMotion', 'targets', 'actions', 'durationMs', 'sampleIntervalMs', 'actionTimeoutMs', 'settleMs', 'paintMasking', 'readiness'], 'scenario');
  keys(raw.viewport, ['width', 'height'], 'viewport');
  const viewport = { width: integer(raw.viewport.width, 320, 1920, 'viewport.width'), height: integer(raw.viewport.height, 240, 1080, 'viewport.height') };
  if (!['light', 'dark'].includes(raw.colorScheme)) fail('colorScheme must be light or dark.');
  if (!['reduce', 'no-preference'].includes(raw.reducedMotion)) fail('reducedMotion must be reduce or no-preference.');
  if (!Array.isArray(raw.targets) || !raw.targets.length || raw.targets.length > limits.targets) fail('targets must contain 1 to 20 scoped CSS selectors.');
  const ids = new Set();
  const targets = raw.targets.map((target) => {
    keys(target, ['id', 'selector'], 'target');
    const id = text(target.id, 'target.id', 64);
    if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(id) || ids.has(id)) fail('Target IDs must be unique identifiers beginning with a letter.');
    ids.add(id);
    return { id, selector: text(target.selector, 'target.selector') };
  });
  if (!Array.isArray(raw.actions) || raw.actions.length > limits.actions) fail('actions must be an array of at most 40 steps.');
  const expectation = (value, label) => {
    keys(value, ['target', 'state', 'equals'], label);
    if (!ids.has(value.target)) fail(`${label}: target must name a scoped target ID.`);
    if (!['present', 'visible', 'focused', ...semanticStates].includes(value.state)) fail(`${label}: unsupported state.`);
    if (value.state.startsWith('aria-')) {
      if (![null, 'true', 'false'].includes(value.equals)) fail(`${label}: equals must be null, "true" or "false".`);
    } else if (typeof value.equals !== 'boolean') fail(`${label}: equals must be boolean.`);
    return { ...value };
  };
  let readiness;
  if (raw.readiness !== undefined) {
    keys(raw.readiness, ['target', 'state', 'equals', 'timeoutMs'], 'readiness');
    const { timeoutMs, ...expected } = raw.readiness;
    readiness = { ...expectation(expected, 'readiness'), timeoutMs: integer(timeoutMs ?? 2000, 100, 5000, 'readiness.timeoutMs') };
  }
  if (raw.paintMasking !== undefined && !['masked', 'unmasked'].includes(raw.paintMasking)) fail('paintMasking must be masked or unmasked.');
  const names = new Set();
  const actions = raw.actions.map((action, index) => {
    const fields = { click: ['type', 'target'], hover: ['type', 'target'], press: ['type', 'target', 'key'], keyboard: ['type', 'key'], assert: ['type', 'target', 'state', 'equals'], wait: ['type', 'ms'], checkpoint: ['type', 'name'], screenshot: ['type', 'name'] };
    if (!fields[action?.type]) fail(`Action ${index + 1}: use click, hover, press, keyboard, assert, wait or checkpoint/screenshot.`);
    keys(action, fields[action.type], `Action ${index + 1}`);
    if (['click', 'hover', 'press'].includes(action.type) && !ids.has(action.target)) fail(`Action ${index + 1}: target must name a scoped target ID.`);
    if (['press', 'keyboard'].includes(action.type) && (typeof action.key !== 'string' || action.key.length > 64 || !navigationKey.test(action.key))) fail(`Action ${index + 1}: key must be a navigation key, optionally with modifiers; text entry is not supported.`);
    if (action.type === 'assert') {
      const { type, ...expected } = action;
      expectation(expected, `Action ${index + 1}`);
    }
    if (action.type === 'wait') integer(action.ms, 0, 5000, `Action ${index + 1}.ms`);
    if (['checkpoint', 'screenshot'].includes(action.type)) {
      text(action.name, 'checkpoint.name', 64);
      if (names.has(action.name)) fail('Checkpoint names must be unique.');
      names.add(action.name);
    }
    return { ...action };
  });
  const scenario = { viewport, colorScheme: raw.colorScheme, reducedMotion: raw.reducedMotion, targets, actions, paintMasking: raw.paintMasking ?? 'masked', ...(readiness ? { readiness } : {}),
    durationMs: integer(raw.durationMs ?? 15000, 1000, 30000, 'durationMs'),
    sampleIntervalMs: integer(raw.sampleIntervalMs ?? 50, 25, 1000, 'sampleIntervalMs'),
    actionTimeoutMs: integer(raw.actionTimeoutMs ?? 2000, 100, 5000, 'actionTimeoutMs'),
    settleMs: integer(raw.settleMs ?? 500, 0, 5000, 'settleMs') };
  if (actions.reduce((sum, a) => sum + (a.ms ?? 0), scenario.settleMs + (readiness?.timeoutMs ?? 0)) >= scenario.durationMs) fail('Declared waits, readiness and settling must fit within durationMs, leaving time for actions and screenshots.');
  return scenario;
}

// This function is serialized by Playwright. It reads a fixed field allowlist, never page content.
function installSampler({ targets, interval, binding, stateKey, animations, eventBinding }) {
  if (window !== window.top || window[stateKey]) return;
  const documentId = crypto.randomUUID();
  const identities = new WeakMap();
  let nextId = 0;
  const identify = (element) => {
    if (!element) return null;
    if (!identities.has(element)) identities.set(element, `${documentId}:${++nextId}`);
    return { nodeId: identities.get(element), tag: element.tagName.toLowerCase() };
  };
  const short = (value) => typeof value === 'string' ? value.slice(0, 256) : value;
  const number = (value) => typeof value === 'number' && Number.isFinite(value) ? value : null;
  const stamp = () => ({ documentId, documentMs: performance.now(), timeOriginMs: performance.timeOrigin });
  const listeners = [];
  const state = { stopped: false, stamp, take: null, read: null, stop: () => { state.stopped = true; clearTimeout(state.timer); for (const [kind, listener] of listeners) document.removeEventListener(kind, listener, true); } };
  window[stateKey] = state;
  const read = (el) => {
    if (!el) return { present: false, visible: false, focused: false, 'aria-expanded': null, 'aria-disabled': null, disabled: false };
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return { present: true, visible: rect.width > 0 && rect.height > 0 && style.display !== 'none' && !['hidden', 'collapse'].includes(style.visibility), focused: document.activeElement === el,
      'aria-expanded': ['true', 'false'].includes(el.getAttribute('aria-expanded')) ? el.getAttribute('aria-expanded') : null,
      'aria-disabled': ['true', 'false'].includes(el.getAttribute('aria-disabled')) ? el.getAttribute('aria-disabled') : null, disabled: el.matches(':disabled') };
  };
  state.read = (id) => {
    const target = targets.find((target) => target.id === id);
    const matches = document.querySelectorAll(target.selector);
    return { ...stamp(), matchCount: matches.length, ...read(matches[0]) };
  };
  let eventCount = 0;
  for (const kind of ['pointerdown', 'pointerup', 'pointerover', 'click', 'keydown', 'keyup', 'focusin', 'focusout', 'input', 'change']) {
    const listener = (event) => {
      if (state.stopped || eventCount >= 600) return;
      const scoped = targets.flatMap(({ id, selector }) => {
        const matches = [...document.querySelectorAll(selector)];
        return matches.some((el) => el === event.target || el.contains(event.target)) ? [id] : [];
      });
      const allowedKeys = ['Enter', 'Escape', 'Tab', ' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'];
      const observation = { ...stamp(), kind, target: scoped.length ? { ...identify(event.target), targets: scoped } : null, isTrusted: event.isTrusted };
      if (['keydown', 'keyup'].includes(kind) && allowedKeys.includes(event.key)) observation.key = event.key === ' ' ? 'Space' : event.key;
      eventCount++;
      void window[eventBinding]({ ...observation, documentLimitReached: eventCount === 600 }).catch(() => {});
    };
    listeners.push([kind, listener]);
    document.addEventListener(kind, listener, true);
  }
  state.take = () => {
    const start = performance.now();
    const elements = targets.map(({ id, selector }) => {
      const matches = document.querySelectorAll(selector);
      const el = matches[0];
      if (!el) return { id, present: false, matchCount: 0 };
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      const inventory = el.getAnimations({ subtree: false });
      return { id, present: true, matchCount: matches.length, ...identify(el), state: read(el),
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left },
        geometry: { clientWidth: el.clientWidth, clientHeight: el.clientHeight, scrollWidth: el.scrollWidth, scrollHeight: el.scrollHeight, scrollLeft: el.scrollLeft, scrollTop: el.scrollTop },
        style: Object.fromEntries(['opacity', 'transform', 'display', 'visibility', 'fontSize', 'color', 'backgroundColor', 'borderRadius', 'overflowX', 'overflowY', 'position', 'zIndex'].map((key) => [key, short(style[key])])),
        animationCount: inventory.length,
        animations: inventory.slice(0, animations).map((animation) => {
          const timing = animation.effect?.getComputedTiming();
          return { kind: animation.constructor.name, playState: animation.playState, currentTime: number(animation.currentTime), playbackRate: number(animation.playbackRate),
            timing: timing ? { delay: number(timing.delay), duration: number(timing.duration), iterations: number(timing.iterations), progress: number(timing.progress), endTime: number(timing.endTime), easing: short(timing.easing), fill: timing.fill, direction: timing.direction } : null };
        }) };
    });
    const focus = identify(document.activeElement);
    if (focus) focus.targets = elements.filter((el) => el.nodeId === focus.nodeId).map((el) => el.id);
    return { ...stamp(), viewport: { width: innerWidth, height: innerHeight, scrollX, scrollY }, focus, elements, samplerWorkMs: performance.now() - start };
  };
  const tick = async () => {
    if (state.stopped) return;
    try {
      const keepGoing = await window[binding](state.take());
      if (!keepGoing) return state.stop();
    } catch {
      try { await window[binding]({ ...stamp(), samplerError: true }); } catch { /* The document may have navigated away. */ }
      return state.stop();
    }
    state.timer = setTimeout(tick, interval);
  };
  tick();
}

async function filesIn(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const name = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await filesIn(name));
    else if (entry.isFile()) files.push({ name, bytes: (await stat(name)).size });
  }
  return files;
}
const relative = (out, file) => path.relative(out, file).split(path.sep).join('/');
const md = (value) => String(value).replace(/[\\`*_[\]<>#|]/g, '\\$&');
function orderedEvidence(capture) {
  const records = [];
  const add = (receivedMs, kind, detail) => records.push({ receivedMs, kind, detail });
  for (const action of capture.actions) {
    add(action.start.hostMs, 'action-request', { index: action.index, type: action.type, target: action.target, key: action.key, dispatch: action.dispatch });
    if (action.end) add(action.end.hostMs, 'action-end', { index: action.index, status: action.status });
  }
  for (const input of capture.observedInput) add(input.receivedMs, 'observed-input', input);
  for (const assertion of capture.assertions) add(assertion.end.hostMs, 'assertion', assertion);
  const rounded = (value) => typeof value === 'number' ? Math.round(value * 10) / 10 : value;
  const snapshot = (el) => ({ present: el.present, nodeId: el.nodeId, matchCount: el.matchCount, state: el.state,
    rect: el.rect ? Object.fromEntries(['x', 'y', 'width', 'height'].map((key) => [key, rounded(el.rect[key])])) : null,
    style: el.style ? { ...el.style, opacity: rounded(Number(el.style.opacity)), transform: el.style.transform.replace(/-?\d*\.?\d+(?:e[+-]?\d+)?/gi, (value) => String(rounded(Number(value)))) } : null });
  let previous;
  const states = new Map();
  for (const sample of capture.samples) {
    if (!previous || previous.documentId !== sample.documentId) {
      if (previous) for (const [target, value] of states) add(previous.receivedMs, 'final-value', { target, documentId: previous.documentId, value });
      add(sample.receivedMs, 'document', { documentId: sample.documentId }); states.clear();
    }
    if (previous?.documentId === sample.documentId && sample.documentMs - previous.documentMs > capture.scenario.sampleIntervalMs * 2) add(sample.receivedMs, 'sampling-gap', { documentId: sample.documentId, fromDocumentMs: previous.documentMs, toDocumentMs: sample.documentMs });
    if (!previous || previous.focus?.nodeId !== sample.focus?.nodeId) add(sample.receivedMs, 'focus', sample.focus);
    for (const el of sample.elements ?? []) {
      const current = snapshot(el);
      const prior = states.get(el.id);
      if (JSON.stringify(prior) !== JSON.stringify(current)) add(sample.receivedMs, prior ? 'sampled-transition' : 'first-value', { target: el.id, documentId: sample.documentId, documentMs: sample.documentMs, before: prior, after: current });
      states.set(el.id, current);
    }
    previous = sample;
  }
  if (previous) for (const [target, value] of states) add(previous.receivedMs, 'final-value', { target, documentId: previous.documentId, value });
  records.sort((a, b) => a.receivedMs - b.receivedMs);
  // Keep boundaries even when a long animation exhausts the transition allowance.
  const transitions = records.filter((record) => record.kind === 'sampled-transition');
  const retained = new Set(transitions.slice(0, 120));
  const ordered = records.filter((record) => record.kind !== 'sampled-transition' || retained.has(record));
  return { records: ordered.slice(0, 1500), omitted: records.length - Math.min(ordered.length, 1500), ordering: 'Host request/end or receipt time; document time orders observations within a document. Receipt order does not establish causality or video alignment.', precision: 'Geometry, opacity and transform numbers rounded to 0.1 for transitions; raw samples retain precision.' };
}
function summary(capture) {
  const lines = ['# Motion capture', '', `Status: ${capture.status.state}. ${capture.status.reason ?? ''}`, '',
    '**Visual review pending until images/playback are inspected.**', '',
    `Paint masking: **${capture.environment.paintMasking}**. Not comprehensive redaction.`, '',
    `Assertion outcomes: ${capture.assertionStatus}. Capture completion and visual approval are separate.`, '',
    `${capture.samples.length} samples; ${capture.actions.length} action records; ${capture.observedInput.length} input observations; ${capture.errors.length} recorded errors.`, '', '## Ordered evidence', '',
    capture.evidence.ordering, capture.evidence.precision, `Omitted records: ${capture.evidence.omitted}. Input observation limit reached: ${capture.environment.inputObservationLimitReached}.`, ''];
  for (const record of capture.evidence.records) {
    const line = `- ${record.receivedMs.toFixed(1)} ms ${record.kind}: ${JSON.stringify(record.detail)}`;
    if (lines.join('\n').length + line.length > 14000) { lines.push('Further ordered records omitted from this summary; see capture.json evidence and raw samples.'); break; }
    lines.push(line);
  }
  lines.push('', '## Observed ranges (context only)', '');
  for (const target of capture.scenario.targets) {
    const observations = capture.samples.flatMap((sample) => sample.elements?.filter((el) => el.id === target.id) ?? []);
    const present = observations.filter((el) => el.present);
    const nodeIds = new Set(present.map((el) => el.nodeId));
    const changed = new Set();
    for (let i = 1; i < present.length; i++) {
      for (const key of Object.keys(present[i].style)) if (present[i].style[key] !== present[i - 1].style[key]) changed.add(key);
    }
    const ranges = ['x', 'y', 'width', 'height'].map((key) => {
      const values = present.map((el) => el.rect[key]);
      return values.length ? `${key} ${Math.min(...values).toFixed(2)}..${Math.max(...values).toFixed(2)}` : `${key} unavailable`;
    });
    const opacity = present.map((el) => Number(el.style.opacity)).filter(Number.isFinite);
    if (opacity.length) ranges.push(`opacity ${Math.min(...opacity)}..${Math.max(...opacity)}`);
    lines.push(`- ${md(target.id)}: present ${present.length}/${observations.length}; missing ${observations.length - present.length}; ${nodeIds.size} observed node identities; ambiguous matches ${present.filter((el) => el.matchCount > 1).length}. ${ranges.join(', ')}. Changed style fields: ${[...changed].join(', ') || 'none observed'}.`);
  }
  const focusChanges = capture.samples.filter((s, i, all) => i && s.focus?.nodeId !== all[i - 1].focus?.nodeId);
  lines.push('', `Focus identity changes: ${focusChanges.length}. First changes: ${focusChanges.slice(0, 12).map((s) => `${s.receivedMs.toFixed(1)} ms → ${md(s.focus?.targets?.join(', ') || s.focus?.tag || 'none')}`).join('; ') || 'none observed'}.`, '', '## Actions', '');
  for (const action of capture.actions) lines.push(`- ${action.index + 1}. ${md(action.type)}${action.target ? ` ${md(action.target)}` : ''}: ${action.status}, host ${action.start.hostMs.toFixed(1)}..${action.end?.hostMs.toFixed(1) ?? 'unavailable'} ms.${action.reason ? ` ${md(action.reason)}` : ''}`);
  lines.push('', '## Checkpoints', '');
  for (const shot of capture.screenshots) lines.push(`- [${md(shot.name)}](${shot.path}): host ${shot.start.hostMs.toFixed(1)}..${shot.end.hostMs.toFixed(1)} ms.`);
  lines.push('', capture.video ? `[Normal-speed video](${capture.video})` : 'Video unavailable or removed to respect the output limit.', '', '## Errors', '');
  for (const error of capture.errors.slice(0, 20)) lines.push(`- ${md(error.kind)} at ${error.hostMs.toFixed(1)} ms: ${md(error.name)} (payload omitted).`);
  if (!capture.errors.length) lines.push('No errors recorded.');
  lines.push('', '## Limits', '', ...capture.limitations.map((line) => `- ${line}`), '');
  return lines.join('\n').slice(0, 24000);
}

async function main() {
  const [urlArg, scenarioFile, outArg, ...extra] = process.argv.slice(2);
  if (!urlArg || !scenarioFile || !outArg || extra.length) fail('Usage: node capture-motion.mjs <url> <scenario.json> <out-dir>');
  let url;
  try { url = new URL(urlArg); } catch { fail('URL must be an absolute HTTP or HTTPS URL.'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) fail('Use HTTP or HTTPS without URL credentials.');
  if ((await stat(scenarioFile)).size > limits.scenarioBytes) fail('Scenario exceeds 32 KiB.');
  let raw;
  try { raw = JSON.parse(await readFile(scenarioFile, 'utf8')); } catch { fail('Scenario must contain valid JSON.'); }
  const scenario = validate(raw);
  const out = path.resolve(outArg);
  try {
    const info = await lstat(out);
    if (!info.isDirectory() || info.isSymbolicLink() || (await readdir(out)).length) fail('Output must be a new or empty directory, not a symlink.');
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const require = createRequire(path.join(process.cwd(), '__motion_capture__.cjs'));
  let chromium, playwrightVersion;
  try { ({ chromium } = require('playwright')); playwrightVersion = require('playwright/package.json').version; }
  catch { fail('Playwright is missing from the consuming project. From that project run: npm install -D playwright && npx playwright install chromium. Nothing was installed.'); }
  await mkdir(out, { recursive: true });
  const began = performance.now();
  const now = () => performance.now() - began;
  const capture = { schemaVersion: 1, createdAt: new Date().toISOString(),
    environment: { url: `${url.origin}${url.pathname}`, node: process.version, playwright: playwrightVersion, platform: os.platform(), architecture: os.arch(), headless: true, deviceScaleFactor: 1, clock: 'hostMs/receivedMs: Node monotonic milliseconds since run start; documentMs: performance.now within documentId; timeOriginMs: document wall-clock origin, not video alignment', limits },
    scenario, actions: [], samples: [], observedInput: [], assertions: [], screenshots: [], video: null, errors: [], status: { state: 'recording' }, limitations };
  capture.environment.paintMasking = scenario.paintMasking;
  capture.environment.inputObservationLimitReached = false;
  let browser, context, page, video, closing, deadline, monitor, sampleBytes = 0, accepting = true;
  const binding = `__motion_${Date.now()}_sample`;
  const stateKey = `${binding}_state`;
  const eventBinding = `${binding}_input`;
  const stopContext = () => context ? closing ??= context.close() : Promise.resolve();
  const stop = (reason) => {
    if (capture.status.state !== 'failed') capture.status = { state: 'failed', reason };
    accepting = false;
    void stopContext().catch(() => {});
  };
  const interrupt = () => stop('Capture interrupted; partial evidence retained.');
  const stamp = async () => ({ hostMs: now(), document: page && !page.isClosed() ? await page.evaluate((key) => window[key]?.stamp() ?? null, stateKey).catch(() => null) : null });
  const checkpoint = async (name) => {
    const start = await stamp();
    const file = `checkpoint-${String(capture.screenshots.length + 1).padStart(2, '0')}.png`;
    await page.screenshot({ path: path.join(out, file), fullPage: false, animations: 'allow', timeout: scenario.actionTimeoutMs });
    capture.screenshots.push({ name, path: file, start, end: await stamp() });
  };
  const observeExpectation = async (expected, point, timeoutMs = 0) => {
    const start = await stamp();
    let actual = null, outcome = 'unknown';
    const until = performance.now() + timeoutMs;
    try {
      do {
        actual = await page.evaluate(({ key, target }) => window[key]?.read(target) ?? null, { key: stateKey, target: expected.target });
        outcome = !actual || actual.matchCount > 1 ? 'unknown' : actual[expected.state] === expected.equals ? 'pass' : 'fail';
        if (outcome === 'pass' || performance.now() >= until) break;
        await page.waitForTimeout(Math.min(50, Math.max(0, until - performance.now())));
      } while (true);
    } catch { outcome = 'unknown'; }
    const record = { point, expected, actual, outcome, start, end: await stamp() };
    capture.assertions.push(record);
    return record;
  };
  process.once('SIGINT', interrupt);
  process.once('SIGTERM', interrupt);
  try {
    try { browser = await chromium.launch({ headless: true, timeout: 10000 }); }
    catch { fail('Chromium could not launch. From the consuming project run: npx playwright install chromium. Check that this environment supports headless Chromium.'); }
    capture.environment.chromium = browser.version();
    if (capture.status.state === 'failed') fail(capture.status.reason);
    context = await browser.newContext({ viewport: scenario.viewport, colorScheme: scenario.colorScheme, reducedMotion: scenario.reducedMotion, deviceScaleFactor: 1, recordVideo: { dir: path.join(out, 'video'), size: scenario.viewport }, acceptDownloads: false });
    capture.environment.recordingStartedHostMs = now();
    deadline = setTimeout(() => stop('Recording duration limit reached.'), scenario.durationMs);
    let inspectingSize = false;
    monitor = setInterval(async () => {
      if (inspectingSize) return;
      inspectingSize = true;
      try { if ((await filesIn(out)).reduce((sum, file) => sum + file.bytes, 0) > limits.outputBytes - 8 * 1024 * 1024) stop('Artifact size limit reached.'); }
      catch { stop('Could not measure artifact size.'); }
      finally { inspectingSize = false; }
    }, 250);
    page = await context.newPage();
    video = page.video();
    context.on('page', (other) => { if (other !== page) { stop('Additional pages are unsupported; use a single-page scenario.'); void other.close().catch(() => {}); } });
    page.on('pageerror', (error) => {
      const name = ['Error', 'TypeError', 'RangeError', 'ReferenceError', 'SyntaxError', 'URIError', 'EvalError', 'AggregateError'].includes(error.name) ? error.name : 'Error';
      if (capture.errors.length < 100) capture.errors.push({ kind: 'pageerror', name, hostMs: now() });
    });
    page.on('crash', () => stop('Page crashed.'));
    await page.exposeBinding(binding, (source, sample) => {
      if (!accepting || source.frame !== page.mainFrame()) return false;
      const bytes = Buffer.byteLength(JSON.stringify(sample));
      if (capture.samples.length >= limits.samples || sampleBytes + bytes > limits.sampleBytes) { stop('Structured sample limit reached.'); return false; }
      sampleBytes += bytes;
      capture.samples.push({ ...sample, receivedMs: now() });
      if (sample.samplerError) { stop('Sampler failed: check CSS selectors and browser support.'); return false; }
      return true;
    });
    await page.exposeBinding(eventBinding, (source, observation) => {
      if (!accepting || source.frame !== page.mainFrame()) return;
      if (observation.documentLimitReached || capture.observedInput.length >= 600) capture.environment.inputObservationLimitReached = true;
      if (capture.observedInput.length < 600) capture.observedInput.push({ ...observation, receivedMs: now() });
    });
    // Paint masking avoids collecting standard form values in video, not just in the JSON.
    if (scenario.paintMasking === 'masked') await page.addInitScript(() => {
      const attach = () => {
        if (!document.documentElement) return;
        const style = document.createElement('style');
        style.textContent = 'input:not([type=button]):not([type=submit]):not([type=reset]),textarea,select,select option,[contenteditable],[contenteditable] *{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;caret-color:transparent!important}';
        document.documentElement.append(style);
      };
      if (document.documentElement) attach();
      else { const observer = new MutationObserver(() => { if (document.documentElement) { attach(); observer.disconnect(); } }); observer.observe(document, { childList: true }); }
    });
    await page.addInitScript(installSampler, { targets: scenario.targets, interval: scenario.sampleIntervalMs, binding, stateKey, animations: limits.animations, eventBinding });
    await page.goto(url.href, { waitUntil: 'domcontentloaded', timeout: Math.min(scenario.durationMs, 10000) });
    capture.environment.page = await page.evaluate(() => ({ userAgent: navigator.userAgent, dpr: devicePixelRatio, viewport: { width: innerWidth, height: innerHeight }, colorSchemeDark: matchMedia('(prefers-color-scheme: dark)').matches, reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches, webAnimations: typeof Element.prototype.getAnimations === 'function' }));
    if (scenario.readiness) {
      const { timeoutMs, ...expected } = scenario.readiness;
      const ready = await observeExpectation(expected, 'readiness', timeoutMs);
      if (ready.outcome !== 'pass') fail('Scoped readiness did not pass within its bounded wait.');
    }
    await checkpoint('before-actions');
    for (const [index, action] of scenario.actions.entries()) {
      if (capture.status.state === 'failed') fail(capture.status.reason);
      const record = { ...action, index, start: await stamp(), status: 'running', dispatch: ['click', 'hover'].includes(action.type) ? 'Playwright auto-waited targeted input' : action.type === 'press' ? 'Playwright targeted key; focuses target' : action.type === 'keyboard' ? 'Playwright current-focus key' : 'no input' };
      capture.actions.push(record);
      try {
        if (action.type === 'wait') await page.waitForTimeout(action.ms);
        else if (action.type === 'keyboard') await page.keyboard.press(action.key);
        else if (action.type === 'assert') {
          const { type, ...expected } = action;
          await observeExpectation(expected, { actionIndex: index });
        }
        else if (['checkpoint', 'screenshot'].includes(action.type)) await checkpoint(action.name);
        else {
          const target = scenario.targets.find((target) => target.id === action.target);
          const locator = page.locator(`css=${target.selector}`);
          const count = await locator.count();
          if (count !== 1) fail(`Action target ${target.id} matched ${count} elements; exactly one is required at action start.`);
          if (action.type === 'press') await locator.press(action.key, { timeout: scenario.actionTimeoutMs });
          else await locator[action.type]({ timeout: scenario.actionTimeoutMs });
        }
        record.status = 'completed';
      } catch (error) {
        record.status = 'failed';
        const detail = error.message.startsWith('Action target ') ? error.message : error.name === 'TimeoutError' ? 'action timed out' : 'target unavailable, ambiguous, or action could not complete';
        record.reason = `Action ${index + 1} (${action.type}${action.target ? ` ${action.target}` : ''}) failed: ${detail}.`;
        throw new Error(record.reason);
      } finally { record.end = await stamp(); }
    }
    await page.waitForTimeout(scenario.settleMs);
    await checkpoint('after-final-wait');
    if (capture.status.state !== 'failed') capture.status = { state: 'completed' };
  } catch (error) {
    if (capture.status.state !== 'failed') capture.status = { state: 'failed', reason: error.message.startsWith('Chromium could') || error.message.startsWith('Action ') || error.message.startsWith('Scoped readiness ') ? error.message : 'Capture failed during setup, navigation, sampling or screenshot capture; partial evidence retained.' };
  } finally {
    accepting = false;
    clearTimeout(deadline);
    clearInterval(monitor);
    if (page && !page.isClosed()) await page.evaluate((key) => window[key]?.stop(), stateKey).catch(() => {});
    try { await stopContext(); }
    catch { capture.status = { state: 'failed', reason: 'Context closure failed; video may be incomplete.' }; }
    try { await browser?.close(); }
    catch { capture.status = { state: 'failed', reason: 'Browser closure failed; video may be incomplete.' }; }
    process.removeListener('SIGINT', interrupt);
    process.removeListener('SIGTERM', interrupt);
    if (video) {
      try { capture.video = relative(out, await video.path()); }
      catch { capture.status = { state: 'failed', reason: 'Video unavailable after context closure; other evidence retained.' }; }
    }
    capture.environment.recordingEndedHostMs = now();
    // Reserve space for bounded JSON and summary, retaining checkpoints before video on overflow.
    let files = await filesIn(out);
    let bytes = files.reduce((sum, file) => sum + file.bytes, 0);
    for (const file of files.sort((a, b) => Number(b.name.endsWith('.webm')) - Number(a.name.endsWith('.webm')) || b.bytes - a.bytes)) {
      if (bytes <= limits.outputBytes - 8 * 1024 * 1024) break;
      await unlink(file.name);
      bytes -= file.bytes;
      const removed = relative(out, file.name);
      if (capture.video === removed) capture.video = null;
      capture.screenshots = capture.screenshots.filter((shot) => shot.path !== removed);
      capture.status = { state: 'failed', reason: 'Artifact size limit exceeded; oversized media removed, structured partial evidence retained.' };
    }
    capture.environment.mediaBytes = bytes;
    capture.environment.sampleBytes = sampleBytes;
    capture.assertionsNotReached = scenario.actions.filter((action) => action.type === 'assert').length + Number(Boolean(scenario.readiness)) - capture.assertions.length;
    capture.assertionStatus = capture.assertions.some((entry) => entry.outcome === 'fail') ? 'fail' : capture.assertionsNotReached || capture.assertions.some((entry) => entry.outcome === 'unknown') ? 'unknown' : capture.assertions.length ? 'pass' : 'not-requested';
    capture.evidence = orderedEvidence(capture);
    await writeFile(path.join(out, 'capture.json'), JSON.stringify(capture) + '\n');
    await writeFile(path.join(out, 'summary.md'), summary(capture));
  }
  console.log(`${capture.status.state}: ${path.join(out, 'summary.md')}`);
  if (capture.status.state === 'failed') { console.error(capture.status.reason); process.exitCode = 1; }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
