# Capture motion evidence

Use this CLI when playback and sampled element state would help refine a website interaction. It records normal-speed Chromium video, PNG checkpoints and structured observations. It runs locally and uploads nothing. Loading the requested website still makes that page's normal network requests.

Run from the **consuming project's directory**, where Playwright is available. The script resolves `playwright` with `createRequire` from that working directory, including when the skill is copied or installed elsewhere.

```sh
cd /absolute/path/to/your-project
node /absolute/path/to/apple-craft/skills/motion-kit/capture/capture-motion.mjs \
  http://localhost:3000 \
  /absolute/path/to/apple-craft/skills/motion-kit/capture/notch-shelf-scenario.json \
  ./motion-before
```

Usage is exactly `node capture-motion.mjs <url> <scenario.json> <out-dir>`. Use HTTP or HTTPS without URL credentials. Output must be a new or empty directory, not a symlink. The tool never installs dependencies. If Playwright is missing, it suggests `npm install -D playwright && npx playwright install chromium` from the consuming project. If Chromium cannot launch, it suggests the browser-install command and checking the runtime environment.

## Scenario

[notch-shelf-scenario.json](notch-shelf-scenario.json) is a real, tested scenario for `../notch-shelf.html`: it sends a file to the notch with the keyboard, opens the shelf while the file is still flying, closes it with Escape and checks `aria-expanded` at each step. Copy it and change the targets and actions for your page.

Required fields:

| Field | Contract |
| --- | --- |
| `viewport` | Integer `width` 320–1920 and `height` 240–1080. Device scale is fixed at 1. |
| `colorScheme` | `light` or `dark`. |
| `reducedMotion` | `reduce` or `no-preference`. |
| `targets` | 1–20 objects with a unique `id` and a scoped CSS `selector`. IDs start with a letter and contain letters, digits, `_` or `-`, up to 64 characters. Selectors are at most 256 characters. Use narrow, unique selectors. |
| `actions` | An ordered array of at most 40 actions. Empty is allowed for observing the initial state. |

Optional fields:

| Field | Default | Range |
| --- | --- | --- |
| `durationMs` | 15000 | 1000–30000; recording budget starting after context creation, including navigation, screenshots and waits. Browser launch has a separate 10000 ms timeout. |
| `sampleIntervalMs` | 50 | 25–1000; delay after each sampler delivery, not a guaranteed frame cadence. |
| `actionTimeoutMs` | 2000 | 100–5000; per input action or screenshot. |
| `settleMs` | 500 | 0–5000; fixed final wait, not detected settling. |
| `paintMasking` | `masked` | `masked` or `unmasked`. Opt into unmasked only for nonsensitive local fixtures when judging actual paint. Neither mode provides comprehensive redaction. |
| `readiness` | absent | One scoped expectation with `timeoutMs` (default 2000, integer 100–5000). Polls every up to 50 ms before the initial checkpoint; its wait budget must fit durationMs with declared waits and settling. |

Actions accept only these fields:

```json
{ "type": "click", "target": "toggle" }
{ "type": "hover", "target": "toggle" }
{ "type": "press", "target": "toggle", "key": "Shift+Tab" }
{ "type": "keyboard", "key": "Tab" }
{ "type": "assert", "target": "toggle", "state": "focused", "equals": true }
{ "type": "wait", "ms": 100 }
{ "type": "checkpoint", "name": "opening" }
```

`screenshot` is an alias for `checkpoint`. Names must be unique, nonempty and at most 64 characters. They never become filenames. A `target` refers to a declared ID, not an inline selector. Click, hover and press require exactly one matching element **at action start**; missing or ambiguous targets fail clearly. Playwright applies its usual actionability checks and may scroll or focus the target. Press focuses its target and sends a key; it does not simulate a global keyboard action without a target.

Supported keys are Enter, Escape, Tab, Space, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Home, End, PageUp and PageDown, optionally prefixed with Shift, Control, Alt or Meta and `+`. Text entry, drag, arbitrary JavaScript and unknown fields are rejected. Waits are integers from 0 to 5000 ms. Total declared waits plus final settling must leave room inside the recording budget. The scenario file is capped at 32 KiB. JSON structure and output are checked before launch; CSS syntax is checked by the browser sampler before actions.

`keyboard` uses Playwright's current-focus keyboard input without locating or focusing a target. Use it for Tab, Shift+Tab, activation, Escape and focus return journeys. `press` focuses its declared target before sending the key, so it cannot establish that keyboard navigation reached that target. No synthetic DOM events are substituted for either input action. Click and hover retain Playwright actionability auto-waits; call completion does not identify the exact dispatch instant.

An `assert` is an immediate read-only expectation at that action's declared position. Its exact fields are `type`, `target`, `state`, `equals`. Readiness uses the same expectation fields without `type`, plus optional `timeoutMs`. Allowed states:

| State | `equals` | Operational meaning |
| --- | --- | --- |
| `present` | boolean | At least one selector match. Multiple matches produce unknown for every expectation. |
| `visible` | boolean | First match has positive bounding width/height, display other than none and computed visibility other than hidden/collapse. Absent is false. This excludes neither occlusion, opacity zero, offscreen position nor clipping; it is not visual visibility approval. |
| `focused` | boolean | Exact match is document.activeElement; absence is false. Descendant focus does not count. |
| `aria-expanded`, `aria-disabled` | `"true"`, `"false"`, or null | Allowlisted attribute value; absent or noncanonical value is null. |
| `disabled` | boolean | Element matches CSS :disabled, including inherited native disabled semantics; absence is false. |

No assertion changes state, dispatches input or waits. Explicit waits can precede assertions. Assertion failure does not abort the journey or fail capture completion. Readiness polls the same scoped read; timeout, ambiguity or unavailable sampler stops capture and retains evidence. Protocol evaluation adds overhead; the duration watchdog bounds the whole recording, rather than guaranteeing exact per-read timing.

Keep interruption inputs adjacent except for the intended wait: Enter, wait 100 ms, Escape, then settle/assert/checkpoint. A screenshot, assertion or other protocol round trip between time-sensitive inputs perturbs the interval. The example's 100 ms wait is requested delay, not a dispatch-to-dispatch guarantee.

## Evidence

- `capture.json`: schema version 1, measured environment, normalized scenario, action records, raw samples, relative media paths, errors, status and limitations.
- `summary.md`: bounded ordered evidence followed by contextual ranges, action outcomes and linked checkpoints. Masking and assertion status appear prominently.
- `checkpoint-*.png`: viewport screenshots before actions, at each named checkpoint and after the final wait. Animations remain enabled during capture.
- `video/*.webm`: normal-speed Playwright video, retained after context closure. It includes setup/navigation and recording shutdown, not just the actions.

The sampler is installed before navigation and actions. Each target records presence, match count, a bounding rectangle, client/scroll geometry, opacity, transform, display, visibility, font size, colors, border radius, overflow, position and z-index. It inspects the first match and reports ambiguity; it does not recursively capture a subtree. Node IDs use a per-document WeakMap: the same DOM node keeps its identity, a replacement gets a new identity, and missing targets remain explicit. IDs are capture-local, not cross-run matching keys.

Focus records node identity, tag and matching scoped target IDs. Animation records include available Web Animations play state, current time, playback rate and a small timing allowlist. Nonfinite or nonnumeric timing values become `null`; they are not proof that an animation ended. At most eight animations per target are retained, alongside the total count. No keyframe source or arbitrary application state is exported.

Samples carry monotonic `documentMs`, a `documentId`, `timeOriginMs` and monotonic host `receivedMs`. A new document starts a new clock and identity namespace. Action and screenshot records bracket each operation with host times and available document times. Host action times include Playwright dispatch and actionability overhead. Sample receipt is later than sampling. Screenshot timestamps bracket the call, not the exact paint instant. Do not align video frames exactly with these timestamps.

Schema version remains 1. Existing actions, samples, screenshots, video, errors and status remain available. Additions are:

- `environment.paintMasking` and `environment.inputObservationLimitReached`.
- `actions[].dispatch`: describes auto-waited targeted input, targeted focus side effect, current-focus keys or no input. These are requested operation brackets, not observed events.
- `observedInput[]`: DOM capture-phase observations of pointerdown/up/over, click, keydown/up, focusin/out, input and change. Fields are kind, documentId/documentMs/timeOriginMs, host receivedMs, isTrusted, scoped target identity or null, optional navigation key, and documentLimitReached. Scoped identities contain nodeId, tag and declared target IDs, including containing targets. Unscoped events retain no target identity. Only the base navigation key is retained, never text keys, modifier state, typed text, values or arbitrary payloads. Observations include application-dispatched events with isTrusted false; trust does not prove causality. Missing observations do not prove missing input. Top-document capture listeners may be blocked by other listeners; frames and shadow internals are not inspected.
- `samples[].elements[].state`: the fixed state allowlist above for present targets.
- `assertions[]`: point (`"readiness"` or `{ "actionIndex": 0 }`), expected fields, actual scoped read with document stamp/match count, outcome (`pass`, `fail`, `unknown`), and start/end host/document brackets. `assertionsNotReached` counts declared checks skipped after interruption. `assertionStatus` is fail if any mismatch, otherwise unknown for unavailable/unreached checks, pass when all requested checks pass, or not-requested. These are separate from status and visual approval.
- `evidence`: records, omitted count, ordering and precision notes. Records contain receivedMs, kind and detail, ordered by host request/end or receipt time. Kinds cover action-request/end, observed-input, assertion, document, focus, first-value, sampled-transition, final-value and sampling-gap. Transitions include before/after presence, node identity, semantic states, rect and style. Gaps exceed twice the requested sample interval within one document; they describe absent samples, not proven dropped frames. Geometry/opacity round to 0.1; raw samples preserve precision. Transform strings remain computed observations, not decomposed motion or causal explanations.

Input observations stop at 600 per document and 600 retained per capture, marking the limit rather than flooding output. Ordered evidence keeps the first 120 sampled transitions and at most 1500 total records; it reports omissions. The Markdown timeline has a 14,000-character budget inside the existing 24,000-character summary. First/final records cover each observed document's initial and last sampled values. Geometry, opacity and transform numbers round to 0.1 in this record; raw samples preserve precision. Inspect raw samples for omitted changes. Host receipt order across streams cannot establish dispatch/response causality or exact video alignment.

Page errors retain their bounded name and host receipt time. Messages, stacks and console payloads are omitted to avoid collecting application data. URL query strings and fragments are omitted from the environment. HTML, page text, input values, cookies, request headers and storage are not read for export. By default, standard input, textarea, select and contenteditable text is paint-masked before document rendering, including in video. This changes computed colors and paint; it is not complete redaction for custom controls, canvas or sensitive content elsewhere. Unmasked mode removes this paint intervention and may expose all visible content in media. Use a nonsensitive fixture or review page and inspect artifacts before sharing. The tool has no upload step.

Capture is capped at 1200 samples, 4 MiB of compact raw sample data, 100 error records, 256 characters per sampled style string, 24,000 summary characters and 64 MiB of final output. Size is polled every 250 ms, reserving 8 MiB for reports. Temporary disk use can exceed the final cap between polls and while video finalizes. Oversized media is removed after closure, prioritizing video removal before checkpoints; the failure status explains the missing media. These limits stop capture rather than silently claiming complete evidence.

Exit code 0 means capture completed, not visual approval. Exit code 1 means configuration/dependency failure or failed capture. Preflight failures print a specific reason without launching. Once capture starts, action failure, duration/size limits, sampler failure, page crashes, interruptions or unsupported additional pages retain partial JSON, summary and available media. Browser/context closure runs in `finally`. Forced process termination or filesystem failure can prevent saving evidence.

## Compare the same inputs

Use the [local capture viewer](review-captures.md) to inspect these artifacts, attach comments to actual media and export feedback for the next comparison.

1. Capture a baseline with a stable local page and the smallest relevant scope.
2. Inspect video at normal speed and open the named PNG checkpoints. The summary always says **visual review pending until images/playback are inspected**.
3. Make one supported change, then replay the same scenario into a fresh `motion-after` directory. Keep viewport, preferences, page data and starting state consistent. A new browser context starts without the user's saved login or storage.
4. Compare named checkpoints and action boundaries, then sampled geometry/style ranges. Node IDs and exact milliseconds are not stable alignment keys across runs. Record a separate reduced-motion scenario and relevant viewport when needed.
5. Distinguish observed values from visual judgments and suspected causes. This tool does not automatically diff or score captures.

Sampling is discrete and instrumentation adds overhead. Computed values cannot prove visibility, readability or accessibility compliance. Canvas, iframe contents, shadow roots and pseudo-elements are not introspected. Available animation inventories omit some JavaScript-driven motion. Screenshot capture can perturb timing. There is no exact video/DOM frame alignment, causal attribution, jank certification or visual approval. Use a separate, purpose-built performance benchmark when evaluating frame delivery or runtime costs.
