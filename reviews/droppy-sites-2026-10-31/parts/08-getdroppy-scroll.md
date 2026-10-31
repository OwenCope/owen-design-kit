# Scroll animation inventory: getdroppy.app (live site, 2026-10-31)

Research only. No site code was edited. All scroll claims below were measured in headless Chromium (Playwright, 1440x900 and 390x844, plus a reduced-motion pass) against the live page, or read from the downloaded HTML, CSS and same-origin JS in /tmp/droppy-review/scroll1/. Every JS and CSS file served is minified to a single line, so code anchors cite file:1 plus the enclosing symbol. This file goes deeper than 01-getdroppy-motion.md on scroll ranges, triggers, reverse behavior and reduced-motion end states, and does not repeat its hover, press and carousel verdicts except where scroll is involved.

## At a glance

1. Press-logo marquee ignores reduced motion (Medium). On screen under `prefers-reduced-motion: reduce`, `.stamps__track` measured `animationPlayState running` and moved about 40px in 600ms. There is no reduce rule for `.stamps` in either stylesheet. One-line fix.
2. Make-it-yours zoom starts late in a long pin (Low). The `#design-your-shelf` pin travels about 1980px, but the hero tile flight only moves between progress 0.65 and 0.95. At progress 0.505 the hero still measured `matrix(1, 0, 0, 1, 0, 0)`, parked. The first half of the pin shows almost no change.
3. Two long tasks during programmatic scroll (Low). PerformanceObserver recorded 217ms and 70ms long tasks across one full top-to-bottom pass. No layout properties animate, so the likely cost is video warm or decode during flings (inference).
4. Wordscroll demo films autoplay with no user toggle (Low). `#iphone-sync` starts its demo past progress 0.5 and `#design-your-shelf` past 0.1, muted and pausable only by scrolling away. The Dynamic Island demo right above them has an explicit play/pause button. Under reduced motion the wordscroll demos correctly gain native controls.
5. Cookie banner covers content in every capture including phones (Low). The banner is fixed, has no scroll-linked dismiss, and covers the lower-left quadrant at 390x844. It blocked the bottom of each scroll frame in this pass.

## Inventory

| Section | Selector | What moves | Trigger and scroll range | Scrub or one-shot | Timing | Reduced-motion result | Phone result | Verdict |
|---|---|---|---|---|---|---|---|---|
| Dynamic Island | `.dynamic-island`, `.dynamic-island__stage` | Sticky stage pins; intro title lifts, edges drift in, demo video plays | Section top 5765, height 1800 at 1440x900, so progress 0 to 1 over scroll 5765 to 6665; stage is `position: sticky` | Scrubbed, lerped (`Math.exp(-elapsed/75)` scene, `/90` intro), reversible | Lerp constants 75/90ms; edge opacity 0 to 0.49 measured across the range | Collapses to static: height auto, stage `position: relative` | Same structure, 175svh under 733px per stylesheet | Keep |
| iPhone sync wordscroll | `#iphone-sync[data-wordscroll]`, `.w-lit`, `.wordscroll__demo` | Per-word opacity plus small translateY; copy fades out past 0.47; demo fades in past 0.52 and plays | Section top 15120, height 2880, travel 1980; words light over progress 0.1 to 0.4, demo in 0.52 to 0.6 | Scrubbed, fully reversible: scrolling back to 15000 returned first-word opacity 1 to 0 and demo 0.32 to 0 | rAF via `DroppyFrame.request`, passive scroll listener | Static stacked column, `.ws-reduced-motion`, lit words full opacity, demos get controls | Section height 2532 at 390px, same choreography, verified lit and demo states | Keep |
| Make-it-yours wordscroll | `#design-your-shelf[data-wordscroll]`, `.h3-yours__hero`, `.h3-yours__tile` | Hero shelf scales from full-bleed to slot; 8 tiles fly into grid slots with stagger | Same 2880 geometry (top 18000); tiles parked through progress 0.5, flight 0.65 to 0.95, settled at 1 | Scrubbed with real ScrollTimeline/ViewTimeline (`view-timeline: --h3-yours block`) where supported, rAF fallback otherwise; reversible | 50 WAAPI stops, linear; tile stagger measured 90ms apart in code comments | Hero hidden, tiles and title forced `opacity: 1, transform: none`, slot stills shown | Phones skip video (`isPhone` at 734px), static grid plus caption (inference from code, not frame-verified) | Keep, see F2 |
| All sections | `.reveal` (31 instances) | Opacity 0 to 1, translateY 16px to none | IntersectionObserver, threshold 4 percent, `rootMargin 0px 0px -2% 0px` | One-shot, then `.is-settled` sets `transition: none`; scrolling back up keeps them shown | `opacity 460ms + transform 460ms cubic-bezier(0.16, 1, 0.3, 1)`, per-element `--reveal-delay` | Forced to 1ms duration, ends visible | Same, verified settled states at 390px | Keep, purposeful single entrances |
| Closer look, strip, highlights | `.hx-select`, `.hx-pill`, `.hx-mark` | Clip-path wipes draw the accent once | IntersectionObserver at 50 percent visibility, `rootMargin 0px 0px -12% 0px`, observed once then unobserved | One-shot | 620 to 700ms `cubic-bezier(0.32, 0.72, 0, 1)` plus 240ms delay; knobs pop at delay plus 480 to 600ms | Finished state forced (clip-path inset 0, no transition) | Same | Keep |
| Featured on | `.stamps__track` | Infinite horizontal press-logo drift | Time-based loop, pauses offscreen (measured `paused` with `is-offstage`) | Loop, not scrubbed | `stamps-scroll 65s linear infinite` | Ignores it: still `running` on screen, moved about 40px in 600ms | Same loop | Fix, see F1 |
| Droplet catalog | `.droplets-row` (3 rows) | Slow horizontal tile drift, alternating direction | Time-based loops, run only while intersecting | Loop, not scrubbed | 84/95/106s linear infinite per row | Unwraps to a static centered grid, duplicate set hidden | Same degrade path | Keep |
| Every product video | `video` (69 total), `films.js` budget | Autoplay and pause driven by visibility ratio | Eligible at ratio 0.35 or more, ineligible at 0.10 or less; warm starts 150 percent viewport ahead on desktop, 50 percent on phones | Scroll-triggered play and pause, not scrubbed | 150ms scroll-rest debounce before schedule | No autoplay: 0 of 69 playing measured; wordscroll and island sections render static end states | Budget drops to 1 concurrent film | Keep |
| Floating player, tabs, highlights | `[data-ride]` sticky bars (`.hlx__scrubber`, `.h3-tabs__bar`, two `.showcase-highlights__controls`) | Bar sticks to viewport bottom while its rail is above, fades and drops 12px when the rail returns (`is-ride-hidden`) | IntersectionObserver on the preceding rail, `rootMargin 0px 0px -20% 0px` | Scroll-triggered toggle with 500ms fade | `opacity 0.5s + translate 0.5s var(--ease-out-soft)` | Transition removed, bars render statically | Same | Keep |
| Outro | `[data-outro-eyes]`, `.outro__icon-film` | Eye look-around film plays once in view | IntersectionObserver (film loader path); measured `paused: true, preload: none` offscreen, playing at scroll 24000 | One-shot trigger | Loop film once visible; poster rest frame otherwise | Not frame-verified under reduce in this pass | Not checked | Keep, see Not checked |
| Nav and sky bands | `.gnav`, `.sky`, `.footer`, `.sync-card` | No scroll movement. Nav stays fixed with a tone crossfade; sky dapple and footer bands only pause (`is-parked`, `is-spotlit`) when offscreen | Band visibility via IntersectionObserver, `rootMargin 200px 0px` | Toggles, not animation | Tone crossfade 320ms; dapple `sky-dapple-sway 11s/16s` is ambient, paused offscreen | Dapple animation removed; nav transitions set to 1ms | Same | Keep |
| Hero | `.hero`, `.hero__devices` | None on scroll. No sticky, no parallax, no scrub measured from 0 to 2000 | Not applicable | Not applicable | Not applicable | Not applicable | Same | Keep, correctly static |

Code anchors (all JS and CSS are line 1, minified; symbols locate the logic): wordscroll scrub `assets/js/wordscroll.js:1` (`initWordscroll`, `requestUpdate`, `DroppyFrame.request`), observer `rootMargin 20% 0px`; island scrub `assets/js/dynamic-island.js:1` (`requestPaint`, `Math.exp(-elapsed/75)`), observers at thresholds `[0,.2,.5]`, scroll listener with `{passive:true}`; yours scenes `assets/js/home3.js:1` (`initYours`, `addScene` id `yours`, `view-timeline --h3-yours`, `isPhone` at 734px); film budget `assets/js/films.js:1` (`PLAY_AT=.35`, `STOP_AT=.1`, 150ms `scrollRest`); accents `assets/js/headline-accents.js:1` (`SHOWN=.5`); reveals `assets/js/site.js:1` (`REVEAL_RATIO=.04`); ride bars `assets/js/site.js:1` (`[data-ride]`, `is-ride-hidden`); sticky stages `assets/css/wordscroll.css:1` (`.wordscroll.ws-ready` 500vh, stage sticky 100vh), `assets/css/dynamic-island.css:1` (section 200svh, stage sticky 100svh), `assets/css/home3.css:1` (`view-timeline:--h3-yours block`); reveals and ride fades `assets/css/site.css:1` (`.reveal`, `[data-ride]`); wipes `assets/css/features.css:1` (`.hx-select`, `.hx-mark`, `.hx-pill`). Markup: index.html:1270 (island), index.html:1298,1412,1467 (three `.hx`), index.html:1122 (stamps), index.html:1392 (scrubber), index.html:3399 and 3571 (wordscroll sections), index.html:3591 (`data-h3-yours`), index.html:4928 (outro eyes).

Frames: ../shots/droppy-scroll-01-top.png (top, static hero) through ../shots/droppy-scroll-05-tabs.png (tabs strip), ../shots/droppy-scroll-06-wordscroll-start.png (wordscroll copy phase), ../shots/droppy-scroll-07-wordscroll-mid.png (words lit, demo fading in), ../shots/droppy-scroll-08-wordscroll-demo.png (demo end state, real product UI), ../shots/droppy-scroll-09-yours-start.png (yours parked hero), ../shots/droppy-scroll-10-yours-mid.png (tiles mid-flight), ../shots/droppy-scroll-11-yours-end.png (tiles settled into slots), ../shots/droppy-scroll-12-bottom.png (bottom), ../shots/droppy-scroll-13-reduce-stamps.png (stamps still running under reduce), ../shots/droppy-scroll-14-phone-wordscroll.png and ../shots/droppy-scroll-15-phone-top.png (390px). A cookie banner covers the lower-left quadrant of every capture.

## Findings

### F1. Press marquee runs under reduced motion, Medium

Evidence: selector `.stamps__track`, index.html:1122. On screen under `reduce`, computed `animation: stamps-scroll / running`, transform moved from -122.6px to -162.1px in 600ms. No `prefers-reduced-motion` rule for `.stamps` exists in site.css or home.css, while sibling loops (`.droplets-row`, `.marquee__track`, `.sky-dapple__layer`) all have one. Frame (../shots/droppy-scroll-13-reduce-stamps.png).

Why it matters: a user who asked the OS to stop motion gets an infinite horizontal scroll with no way to stop it except leaving the section.

Fix with values: in home.css next to the stamps rule, add

    @media (prefers-reduced-motion: reduce){.stamps__track{animation:none}}

Static row of press marks, same treatment the droplets rows already get.

### F2. Make-it-yours flight uses only the last third of a long pin, Low

Evidence: selector `.h3-yours__hero`, index.html:3591. Measured at section progress 0.505: hero `matrix(1, 0, 0, 1, 0, 0)` (parked full-bleed); at 0.656 still parked; tiles at opacity 0 with offsets near plus or minus 1300px. First tile movement appeared between 0.656 and 0.808; settled at 0.96. Frames (../shots/droppy-scroll-09-yours-start.png, ../shots/droppy-scroll-10-yours-mid.png, ../shots/droppy-scroll-11-yours-end.png).

Why it matters: the visitor scrolls about 1000px of pinned stage with almost no change before the choreography starts. The pin earns its length only in the last third.

Fix with values (inference, verify in `initYours` before changing): remap the tile flight to section progress 0.35 to 0.85 instead of 0.6 to 0.9, keeping the 90ms stagger and the settled end state identical. If the mapping lives in the `onTick` parts table in `assets/js/home3.js:1` (`initYours`), shift each part start earlier by 0.25 of progress and leave durations alone, then re-probe at 100px steps and confirm first movement at or before progress 0.4.

### F3. Two long tasks during a full scroll pass, Low

Evidence: PerformanceObserver `longtask` entries of 217ms and 70ms recorded across one programmatic top-to-bottom scroll at 1440x900. No layout properties animate anywhere in the inventory (transform and opacity only), and CLS measured 0 in the earlier motion pass.

Why it matters: 217ms exceeds the 50ms long-task threshold and can drop scrub frames during fast flings. A fast jump from 15000 to 17200 still landed on the correct end state (lit 1, demo 1), so this is smoothness, not correctness.

Fix with values (inference): films.js already debounces scheduling 150ms after scroll rest (`assets/js/films.js:1`, `scrollRest`). Keep that, and avoid starting new warm fetches while `scrolling` is true rather than warming ahead during the fling. Concretely, gate the `near.observe` warm path on `!scrolling` so range-ahead fetches wait for the 150ms rest, then re-measure long tasks on the same pass and confirm the maximum is under 100ms.

### F4. Wordscroll demos autoplay with no user toggle, Low

Evidence: selectors `#iphone-sync .wordscroll__demo` (index.html:3399, play at progress 0.52) and `#design-your-shelf .wordscroll__demo` (index.html:3571, play past 0.1). Both are muted and pause when scrolled away or when the tab hides, and both gain native controls under reduced motion. The island demo 9000px above them has an explicit `[data-island-play]` button (index.html:1284).

Why it matters: the page already established the pattern that a pinned demo gets a visible play control. The two wordscroll demos are the only pinned films without one.

Fix with values: mirror the island control. Add a button with the same 44px round treatment next to each `.wordscroll__demo`, wired to the existing `playDemo`/`pauseDemo` pair in `assets/js/wordscroll.js:1`, with `aria-label` matching the demo content and no change to the scroll-driven default. Under `prefers-reduced-motion` the button already has its correct end state (native controls shown).

## Keep

* Dynamic Island scrub: lerped but attached, title and edges measured moving with scroll, video plays only past 50 percent stage visibility with a user toggle, static under reduce.
* Both wordscroll scrubs: per-word lighting over progress 0.1 to 0.4, demo resolves to real product UI (three iPhones; shelf grid), fully reversible, static with controls under reduce.
* Section reveals: 31 instances, one entrance each, `transition: none` once settled, 1ms under reduce.
* Headline wipes: three accents, 620 to 700ms once each, finished state forced under reduce.
* Droplet rows and ride bars: slow loops with offscreen pause and static reduce states; sticky control bars fade correctly.
* Film budget: 69 videos, 2 concurrent on desktop and 1 on phones, warm-ahead and 150ms rest debounce, 0 playing under reduce.

## Not checked

* Safari and WebKit behavior, including the HEVC fallback path in dynamic-island.js. Chromium only.
* Real-device frame pacing and thermal throttle. Headless numbers only.
* Outro eye film trigger details (`[data-outro-eyes]`, index.html:4928): seen playing at scroll 24000, driver not traced to a line.
* Save-data path: `films.js` and island code branch on it, not exercised.
* Cookie banner entrance: it rendered statically in every capture; no entrance animation observed or asserted.
* Keyboard operation during scroll scenes while pinned. Roving tabindex exists on tabs and pills in code, not exercised in this pass.
