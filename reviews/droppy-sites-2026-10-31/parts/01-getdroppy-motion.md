# Motion review: getdroppy.app (live site, 2026-10-31)

Research only. No site code was edited. All motion claims below were measured in headless Chromium (Playwright, 1440x900 and 390x844, plus a reduced-motion pass) against the live page, or read directly from the downloaded HTML/CSS/JS in /tmp/droppy-review/hank/.

## At a glance

1. Press-logo marquee ignores reduced motion (Medium). The `.stamps__track` keeps scrolling when `prefers-reduced-motion: reduce` is on. Measured 31px of travel in 600ms with playState running. Every other loop on the page has a reduce rule. One-line fix.
2. Spotlight tabs auto-advance every 6 seconds (Low). Pause on hover, focus, hold, hidden tab and reduced motion all work, and arrows exist, but it is still a timed carousel rotating 8 video panels under the reader.
3. Several buttons scale on press or hover (Low). `.btn--applepill:active` goes to `scale(0.98)`, the sound toggle and round buttons shrink to 0.92, showcase arrows grow to 1.06. The house rule is buttons never move; the label-blur morph already gives feedback, so the scales add nothing.
4. Segmented tab buttons are 40px tall on phones (Low). R-03 asks for 44px minimum targets. Measured 78 to 100px wide by 40px tall at 390px width.
5. Two floating-player films are the heaviest single assets measured (Low, informational). `player-morph-20261001c.mp4` is 6.5MB and `player-motion-1-20261001c.mp4` is 5.4MB. Lazy loading and the 2-at-a-time playback budget contain the damage, but they deserve a byte budget so they do not grow further.

## Hero intro motion

### H1. Lake film crossfade and headline sweep are restrained and reduce-safe (keep)

What I saw: the hero film (`.hero-lake__film`, 2560x1098 AV1 measured playing at load, `readyState 4`) fades in over its poster with `transition: opacity 240ms linear` (index.html:642-643). The word "Supercharged" gets one shimmer pass: `hero-charged-sweep 2.73s cubic-bezier(0.45, 0, 0.25, 1) 0.4s 1 forwards` (index.html:743, keyframes at 748-751), ending on solid text. The legacy nav intro (`navDockExpand 640ms cubic-bezier(0.32, 1.22, 0.36, 1) 120ms both`, site.css) is skipped on repeat visits (`nav-intro-done`, index.html:60) and under reduced motion. The current header (`.gnav`) has no entrance animation at all: fixed position, measured `animation: none`.

Why it matters: the intro says one thing (the product is alive) and stops. Nothing loops for decoration in the first viewport except the lake itself.

Fix: none. If the 2.73s sweep ever feels slow on repeat visits, cut it to `1.6s` with the same curve rather than removing it.

### H2. Hero loop never resolves to product UI (note, no fix proposed)

What I saw: the 12-second 120fps lake film loops forever (measured `loop: true, paused: false` at top). It is brand art, not the app. The page earns this back later: the Dynamic Island section, the wordscroll demos and the closer all end on real product video.

Why it matters: signature-moments asks the last frame to be the payoff. A hero that never lands is a known acceptable exception for atmosphere, and the poster-first paint plus `saveData` guard in films.js keep it honest. Leave it.

## Scroll-driven and frame-sequence animation

### S1. Wordscroll word lighting is a proper scrub, ends on the real demo (keep)

What I saw: `[data-wordscroll]` sections (index.html:3399, 3571) run a 500vh section (420vh under 720px) with a sticky stage. Per-word opacity plus a small `translateY` runs off scroll progress through `DroppyFrame` (rAF), words lighting across progress 0.1 to 0.4, demo video fading in past 0.5 and playing past that point (wordscroll.js). Under reduced motion the section renders as a static stacked column with `.w-lit` at full opacity (wordscroll.css, `.ws-reduced-motion` block) and demo videos get native controls. Mid-scroll probe showed copy/demo custom properties animating and the island title at `opacity 0.9976` with a 0.19px lift, so the pipeline is live, not faked.

Why it matters: this is the page signature moment and it follows the rules. Scroll-driven, ends on real UI, Reduce Motion shows the end state, every mid frame I captured is a clean still (../shots/droppy-motion-03-scroll20.png).

Fix: none.

### S2. Dynamic Island section uses lerped scroll progress with a user play toggle (keep)

What I saw: `.dynamic-island` is 200svh with a sticky stage (175svh under 733px, dynamic-island.css). Progress is smoothed with exponential lerp (`Math.exp(-elapsed/75)` for scene, `/90` for intro, dynamic-island.js), title lifts 80px and edges drift about 18px as you enter. The demo video plays only at 50 percent stage visibility, pauses offscreen, and has an explicit play/pause button with an aria-label. Reduced motion collapses the section to static height with the stage `position: relative` (measured `900px`, relative).

Why it matters: the smoothing constants (75/90ms) are fast enough to feel attached to the finger and slow enough to avoid judder. The visible toggle is the correct answer to autoplay policy.

Fix: none.

### S3. Make-it-yours zoom runs on real scroll timelines with an rAF fallback (keep)

What I saw: 19 live animations using ScrollTimeline/ViewTimeline were counted in `document.getAnimations()` mid-page. home3.js builds WAAPI keyframes (50 stops) attached to `animationTimeline` when Scroll-Driven Animations exist, otherwise drives the same curves from rAF (`runScenes`). Tiles zoom into their slot over progress 0.6 to 0.9 with 90ms stagger on play, and phones skip the video entirely (`isPhone` guard) in favor of a static grid plus caption.

Why it matters: this is the most technically careful motion on the page. No jank was measured (one 52ms long task total, CLS 0, see Cost).

Fix: none.

### S4. Section reveals are single entrances, then the transition is removed (keep)

What I saw: `.reveal` starts at `opacity: 0; translateY(16px)` and settles with `opacity 460ms + transform 460ms cubic-bezier(0.16, 1, 0.3, 1)` (site.css), with small per-element `--reveal-delay` staggers in the hero (60/120/180/240/340ms, index.html). Once settled, `.is-settled` sets `transition: none`, and reduced motion forces 1ms. No per-paragraph fade was found.

Why it matters: passes R-19. One entrance per group, then zero ongoing cost.

Fix: none.

### S5. Headline accent wipes are quick clip-path reveals, once each (keep)

What I saw: `.hx` accents wipe via `clip-path` over 620 to 700ms with `cubic-bezier(0.32, 0.72, 0, 1)` and a 240ms delay (features.css), triggered once by an IntersectionObserver at 50 percent visibility (headline-accents.js), with the finished state forced under reduced motion.

Why it matters: drawing attention to the headline idea with a wipe that ends on static text is exactly what this technique is for.

Fix: none.

## Hover and press feedback

### P1. Primary buttons give content feedback, not movement (keep)

What I saw: hovering Buy, Download for macOS and the tab buttons produced `transform: none` before and after in the hover probe. The `.btn-morph` treatment dissolves the label through a 340ms blur (`--morph-dur: 340ms`, `--morph-ease: cubic-bezier(0.22, 1, 0.36, 1)`, site.css) instead of moving the button. The download control expands to its options in place.

Why it matters: this matches the motion-kit rule word for word. Do not change it.

### P2. Small press and hover scales on several controls (Low)

What I saw: `.btn--applepill:active` and `.btn--darkpill:active` use `transform: scale(0.98)` (site.css). `.yt-sound-toggle:active`, `.h3-roundbtn:active` and `.h3-swatch:active` shrink to 0.92/0.9, `.h3-pill` presses to 0.96, and `.showcase-highlights__arrow:hover` grows to `scale(1.06)` over 180ms (home.css, home3.css).

Why it matters: each instance is small, but together they break the one clear rule this page otherwise follows perfectly. The blur morph and color changes already confirm every press.

Fix: delete the `scale()` from each rule above and keep the existing background, color and blur feedback. Concretely: remove `transform: scale(0.98)` from the two `:active` pill rules, remove `:active` scale from the toggles and swatches, and change the showcase arrow hover to background-color only.

## Nav behaviour on scroll

### N1. Fixed nav with tone crossfade, no hide, staged menus (keep)

What I saw: `.gnav` is `position: fixed` and never hides. Measured class and transform identical (`transform: none`) at top and at 1200px scrolled. Tone changes crossfade color tokens over 320ms (`--gnav-dur: 320ms`, `--gnav-ease: cubic-bezier(0.4, 0, 0.6, 1)`). Menu items stagger in at 18ms steps from 60ms (120ms out, 280ms in). The phone sheet opens over 400ms with links staggered 24ms. Reduced motion forces 1ms durations. Focus-visible rings are 2px throughout.

Why it matters: a nav that stays put and only changes color is the calmest correct choice over long scroll art. Menu choreography is fast and interruptible.

Fix: none.

## Carousels, marquees and loops

### C1. Press-logo marquee ignores reduced motion (Medium)

What I saw: `.stamps__track` runs `stamps-scroll 65s linear infinite` (home.css) with pause on hover. Under `prefers-reduced-motion: reduce`, scrolled into the center of the viewport, the track measured playState `running` and moved 31.08px in 600ms. There is no reduce rule for `.stamps` in site.css or home.css. I checked: every sibling loop (droplets rows, marquee track, sky dapple, twinkles) has one. The droplets rows correctly resolve to a wrapped static grid with the duplicate set hidden, and the dapple resolves to no animation.

Why it matters: a user who asked the OS to stop motion gets an infinite horizontal scroll with no way to stop it except leaving the section. R-19 also fails here: under reduce the motion has no purpose the user consented to.

Fix: in home.css next to the stamps rule, add `@media (prefers-reduced-motion: reduce){.stamps__track{animation:none}}`. Static row of press marks, same as the droplets rows already do.

### C2. Spotlight tabs auto-advance every 6 seconds (Low)

What I saw: `<div class="h3-tabs" data-h3-tabs data-auto="6000">` (index.html:1414) rotates 8 video panels. The implementation is careful: pause on hover, focus, hold after manual selection, hidden tab and reduced motion (home3.js `schedule()`), arrows plus a sliding thumb (`transform 0.42s cubic-bezier(0.32, 0.72, 0, 1)`), panels crossfade 300/320ms, offscreen videos pause. Reduced-motion probe showed 0 videos playing.

Why it matters: even a well-built timed rotation pulls the eye while reading captions, and web-design bans auto-advancing carousels. The pause conditions reduce the harm but do not remove the class of problem.

Fix: remove `data-auto="6000"` so the tabs are manual (arrows, thumb and keyboard already exist), or if rotation must stay, raise it to `data-auto="12000"` so a reader can finish a caption. Either is a one-attribute change.

### C3. Droplet catalog rows loop slowly and degrade to a grid (keep)

What I saw: `.droplets-row` drifts with `droplets-row-drift` over 84/95/106s per row (`--row-dur`, `--row-phase`), linear infinite, reversing on alternate rows (home.css). Hover pauses, offscreen pauses via `.is-offstage`, reduced motion unwraps to a centered static grid. 33 WAAPI/CSS animations total were live at load, most of them these rows and scroll scenes.

Why it matters: the durations are slow enough to read tile by tile, and the loop shows catalog breadth that a static grid could not fit above the fold. Passes R-19 with a written purpose (breadth of the 40-plus catalog).

Fix: none.

### C4. Sky light drift is subtle transform-only ambience (keep)

What I saw: `sky-dapple-sway 11s/16s ease-in-out infinite alternate` moving about 1.4 container-query widths with half-degree rotation (site.css), `opacity 0.26/0.18`, `will-change: transform`, animation removed under reduced motion, parked when spotlit.

Why it matters: barely-there light response, zero layout cost, off under reduce. This is restraint done right.

Fix: none.

## Reduced-motion handling

Near exemplary. Measured under `reducedMotion: reduce`: 0 running animations at top, 0 of 69 videos playing, wordscroll static with full-opacity lit words, island section static, tab auto-advance off with thumb transitions at 0.01ms, pricing panels instant, card flip degraded to a 200ms opacity fade, hero film hidden at `opacity: 0` with the poster showing, demo animations (download modal, brew copy, pricing sheen) all neutralized. The single exception is C1 above.

## Motion on phones

Measured at 390x844: horizontal overflow 0, film budget drops to 1 concurrent video, phone cuts (`-sm`, about a quarter of the bytes per the page budget comment) are served via `__droppyFilm`, the make-it-yours viewer becomes a horizontal chip scroller with captions below, and the bento grid collapses to one column with fixed aspect ratios per tile. Touch targets measured 48px (menu), 78 to 100px by 40px (segment buttons), 42px (showcase arrows). Only the segment height in finding P4 area (item 4 above) falls short. Fix: at the 733px breakpoint change `.h3-seg__btn` from `height: 40px` to `height: 44px` and trim horizontal padding from 15px to 13px to keep labels on one line.

## Cost

Measured, not estimated. Range probes against the asset host returned these full-file sizes: hero wide AV1 2.2MB, hero tall AV1 1.9MB, bento notch 1.7MB, bento appletv 2.86MB, bento calendar 3.1MB, bento queue 3.4MB, player-morph 6.5MB, player-motion-1 5.4MB, promo film 16.9MB (click-to-play, confirmed `paused: true, readyState: 0`). Page constructs 69 video elements and 208 images. Image transfer on load plus one full scroll was 1.45MB (video bytes are range-served and report 0 in resource timing, hence the separate probes). Playback budget is 2 concurrent on desktop, 1 on phones; warming starts 150 percent viewport ahead on desktop, 50 percent on phones; scrolling pauses everything within 150ms. One 52ms long task and CLS 0 across load and a full programmatic scroll in headless Chromium. Mid-scroll showed 0 videos playing at 45 percent depth, which likely means the probe landed between play zones, so treat concurrent-playback claims as approximate. No autoplay for the promo or modal films. Verdict: the budget system is sound; the only cost note is item 5 above. Consider a per-film byte ceiling around 4MB for future additions, with poster-first loading already in place.

## Purpose check (R-19)

| Motion | Purpose | Verdict |
|---|---|---|
| Hero lake loop | Atmosphere, product-as-character | Keep, ends nowhere but the page pays off later |
| Headline sweep 2.73s | One-time emphasis on the lead word | Keep |
| Word lighting scrub | Signature: reading is the product verb | Keep |
| Island scroll scene | Shows the feature responding to scroll | Keep |
| Make-it-yours zoom | Choreographs finishes into the shelf | Keep |
| Section reveals 460ms | Single entrances | Keep, not filler |
| Headline wipes | Accent the idea, once | Keep |
| Droplet rows 84s plus | Catalog breadth | Keep, slow and pausable |
| Stamps 65s | Press proof | Keep only with the C1 reduce fix |
| Tab auto-rotate 6s | Discovery of 8 panels | Weakest purpose, see C2 |
| Dapple drift, twinkles | Light response | Keep, subtle and transform-only |
| Button morphs, thumb slides, panel swaps | State-change feedback | Keep |

No per-paragraph fade-up filler was found. Nothing bounces on controls. No parallax layers. No scroll-jacking: all scroll scenes use sticky stages and never move the scroll position.

## What works well and should be kept

* Buttons never move on hover (probe-verified), with the label-blur morph carrying feedback.
* Everything that opens closes the way it came: modal 380ms ease-out both ways, download choice swaps in place, pricing panels exit fast (230/260ms) and enter slower (440/560ms, 90ms delay) on the standard `cubic-bezier(0.22, 1, 0.36, 1)`.
* Films pause on scroll, offscreen, hidden tab, save-data and reduced motion, with per-card user toggles. The budget of 2 (1 on phones) is the right call for a page with 69 videos.
* Reduced motion is handled section by section with real end states, not a global kill switch that leaves blank stages.
* Easing is consistent: page tokens are `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)` and `--ease-out-soft: cubic-bezier(0.22, 1, 0.36, 1)` (site.css), and most components reuse them instead of inventing curves.

## Not checked

* Footer and page scrub canvases (`.footer-scrub canvas`, `.page-scrub canvas`): present in markup and CSS, drivers not traced.
* Hero lake film under save-data and on metered connections: films.js blocks its own loaders, but the hero film path was not isolated in this pass.
* Numeric count animation (`.numeric-text__slot`, 4600ms): no instances on the home page at probe time.
* Outro icon eye film trigger (`.outro__icon-wrap.is-eyes-playing`): not reached in the capture set.
* Safari and WebKit behavior, including the HEVC fallback path in dynamic-island.js: Chromium only.
* Real-device frame pacing and thermal throttle: headless numbers only.
* Keyboard operation of the tab auto-rotation while it advances: arrows and roving tabindex exist in code, not exercised.
* Cookie banner entrance: it rendered statically in every capture; no entrance animation was observed or asserted.
