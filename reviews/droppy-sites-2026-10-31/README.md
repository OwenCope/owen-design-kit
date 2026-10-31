# getdroppy.app and getdroppycode.app: animation, UI and UX review

Date: 2026-10-31. Both sites were reviewed live with Playwright Chromium at 1440x900, 768x1024 and 390x844, in light and dark colour schemes and with Reduce Motion on. getdroppycode.app was also read from its source in `droppy-code/website/`. Findings are scored against the antislop filter (rule ids such as R-19 and R-25) and the apple-craft standards in this kit. launchmeapp.com is included as an outside benchmark.

This file is the summary and the ranked fix list. Every finding, with selectors, measured values, file:line references and screenshots, is in the parts:

| Part | Scope |
|---|---|
| [01 getdroppy.app motion](parts/01-getdroppy-motion.md) | Hero, scroll scenes, frame sequences, nav, loops, reduced motion, motion cost |
| [07 getdroppy.app hover, focus, press](parts/07-getdroppy-hover.md) | 36 component groups probed at rest, hover, press and focus, plus touch |
| [08 getdroppy.app scroll inventory](parts/08-getdroppy-scroll.md) | Every scroll-driven element, pin lengths, flings, reverse scroll, phones |
| [02 getdroppy.app visual and copy](parts/02-getdroppy-visual.md) | Section by section, type, colour, buttons, theme, every headline and CTA |
| [03 getdroppy.app UX](parts/03-getdroppy-ux.md) | Click-through, journey, mobile, accessibility, performance, SEO |
| [04 getdroppycode.app motion](parts/04-droppycode-motion.md) | Inventory of every animation, scroll and load motion, reduced motion, token set |
| [09 getdroppycode.app hover, focus, press](parts/09-droppycode-hover.md) | Every interactive element on / and /changelog, touch behaviour |
| [05 getdroppycode.app UI and UX](parts/05-droppycode-ui-ux.md) | Visual, copy, journey, changelog, mobile, accessibility, performance |
| [06 Cross-site](parts/06-cross-site.md) | Token-by-token comparison, nav, footer, linking, naming |
| [10 Benchmark: launchmeapp.com](parts/10-benchmark-launchme.md) | What to borrow, where Droppy already wins, what not to copy |

Screenshots for all parts are in [shots/](shots/).

## Verdict

**getdroppy.app** has the best motion of the three sites. Scroll scenes scrub real product UI and end on it, buttons give feedback without moving, video playback is budgeted (2 at a time on desktop, 1 on phones), and Reduce Motion shows true end states almost everywhere. CLS measured 0. The weak points are not motion. The hero never shows the product on a Mac, the two hero buttons compete, the download quietly serves a 145MB beta, and contrast and tap targets slip in pricing, nav and footer.

**getdroppycode.app** has a stronger product shot (the real app window starts in the first viewport) but weaker motion discipline. One 600ms fade-up is reused on 32 nodes, several loops ignore Reduce Motion, every button shrinks when pressed, and the FAQ has no hover state at all. It also blocks text selection, copying and right click across the whole page. That hurts a developer audience directly.

**Together**, the sites share a radius scale, type steps, content width and footer pattern, but their navs, button shapes and download labels have drifted apart. The link between them only runs one way: Droppy Code points to Droppy, and Droppy never mentions Droppy Code.

**Against launchmeapp.com**, Droppy is ahead on motion purpose, identity and weight (1.7MB against 18.4MB on desktop first load). Three LaunchMe ideas are worth borrowing: show the Mac in the hero, start carousels paused, and keep the hero to one sentence.

## Fix first (High)

1. **getdroppy.app: the hero download serves a beta.** "Download for macOS" goes to `/download/latest`, which 302s to `Droppy-16.2.0-beta.3.dmg` (152,146,046 bytes, re-checked). There's no beta label and no file size. Point it at the latest stable build, or label it "Download beta" and show the size. [03]
2. **getdroppycode.app: copying is blocked site-wide.** `assets/js/site.js:226` cancels `contextmenu`, `copy`, `cut`, `dragstart` and `selectstart`. Developers copy commands, provider names and changelog lines. Remove the guard. [05]
3. **getdroppy.app: the hero shows no product.** The mascot and hands scene carries the first screen, and the notch UI arrives a scroll later. Keep the scene, but bring a real Mac with a live island into the first viewport (see LaunchMe's hero, [10] finding 1). [02, 10]
4. **Numbers that disagree with themselves.** getdroppy.app says 41 extensions in its HTML and 43 in the hero screenshot, and never lists them. getdroppycode.app says 10 providers twice while listing 13. Fix the counts, or drop them (R-17). [02, 05]
5. **getdroppycode.app: the Intel download must ship with its redirect.** The local source adds a "Download for Intel" button (`index.html:559`) pointing at `/download/intel`, and `_redirects:8` maps it to GitLab. Live, `/download/intel` returns 404 today (re-checked). The live page doesn't show the button yet, so this only becomes a dead end if the HTML deploys without the redirect. Verify it after the next deploy. [05]
6. **Contrast below WCAG AA on both sites.** getdroppy.app: the faded "One price" H2 at 0.38 opacity, pricing helper text at 3.75:1, "Save 15/25%" at 3.54:1, the "Standard" badge at 1.2:1. getdroppycode.app: footer and footnote text at 3.2:1 (R-25). [02, 03, 05]

## Fix next (Medium)

Motion and hover:

- **Reduce Motion gaps.** getdroppy.app's press-logo marquee keeps scrolling (31px measured in 600ms) [01]. getdroppycode.app has four gaps: `scroll-behavior: smooth` on `html` stays on, the changelog spinner only slows to 2.4s, the manual theme crossfade still animates, and the footer drift and button press still run [04]. Each fix is one rule inside `@media (prefers-reduced-motion: reduce)`. The marquee gap was confirmed independently in [08] (about 40px moved in 600ms).
- **Buttons move on press or hover, against the house rule that buttons never move.** getdroppycode.app: `.btn` scales to 0.97, pills to 0.98 and carousel arrows to 0.96 on press, and the arrows grow to 1.06 on hover [09]. getdroppy.app does it in 8 places: hero pills 0.98, segmented tabs 0.95, swatches 0.9, showcase arrows 0.96 (and 1.06 on hover), testimonial arrows 0.94, play buttons 0.92, and the cookie Accept button 0.97. Testimonial cards also lift 4px on hover [01, 07]. Replace the scales with a tint change.
- **Both FAQs have no hover state.** getdroppy.app's 15 questions and getdroppycode.app's 11 questions, plus the links inside its answers, show zero change on hover [07, 09].
- **getdroppy.app: the pricing plan options and purchase button have no hover or press feedback**, only a focus ring. These are the buttons that make money, and the segmented tabs elsewhere on the page do tint on hover [07].
- **getdroppy.app: hover sticks after a tap on phones** on the segmented tabs and FAQ. Wrap hover rules in `@media (hover: hover)` [07].
- **getdroppycode.app: keyboard focus skips the blur morph** that hover runs. Fire it on `:focus-visible` too [09].
- **getdroppycode.app: one fade-up for everything.** 600ms on 32 nodes, whole grids arriving as one block (R-19). Keep the reveal on section heads, stagger tiles by 40 to 60ms, and drop it from body copy [04].
- **Things that never stop moving.** The getdroppycode.app theme picker cycles every 2600ms for as long as it's on screen, preloading images as it goes [04]. getdroppy.app's spotlight tabs rotate every 6s [01]. Start both paused, or stop them after one pass, as LaunchMe does [10].

UI and UX:

- **getdroppy.app: two equal hero pills.** Make Download the filled primary and turn Purchase into a secondary style [02].
- **getdroppy.app: twelve identical "Learn more" links** in the droplets grid. Name the destination in each ("See Clipboard", for example) (R-15) [02].
- **getdroppy.app: the page ignores the system dark setting.** Computed colours and screenshots are identical in both schemes. Either support dark mode, or declare `color-scheme: light` and a `theme-color` on purpose [02, 06].
- **getdroppy.app: the cookie banner covers the H1 and both CTAs on phones** until it's dismissed [03].
- **Tap targets under 44px.** getdroppy.app: nav chevrons 14x22, nav Buy 43x24, finish swatches 30x30, carousel dots 24 wide, segmented tabs 40 tall on phones (R-03) [01, 03]. getdroppycode.app: see [05].
- **getdroppycode.app: the changelog has 22 entries with no search, filters or per-version anchors** [05].
- **getdroppycode.app: the hero subtitle runs 5 lines** and lists 13 providers. Keep one sentence and move the providers into a strip below the buttons [10].

Cross-site:

- **Link Droppy to Droppy Code.** Add a footer column entry and one mention near Droppy's feature tour [06].
- **One nav component.** Droppy's 44px full-width gnav and Code's 56px notch pill are two designs, and the Code CSS comment that calls it "same notch dock as getdroppy.app" is out of date [06].
- **One meaning per class name.** `.btn--applepill` is 999px radius on Droppy and 20px on Code [06].
- **One download label.** "Download for macOS" on Droppy against "Download for Mac" on Code (the live Code site currently says "macOS", while the local source says "Mac"). Pick one [06].

## Low

Scroll: the Make-it-yours pin travels about 1980px but the tile flight only runs between progress 0.65 and 0.95, so the first half of the pin barely changes. Shorten the pin or start the flight earlier [08]. The wordscroll demo films autoplay with no play/pause toggle, unlike the Dynamic Island demo above them [08]. Two long tasks (217ms and 70ms) appeared during a full scroll pass, likely from video decode [08].

Motion cost: two floating-player films at 6.5MB and 5.4MB need a byte ceiling [01]. getdroppycode.app's binary hero canvas redraws about 4000 cells per scroll tick, causing 11 long tasks in one sweep [04]. Also screen-reader noise on getdroppy.app (160 of 208 images with empty alt, 11 decorative loops without `aria-hidden`, duplicated marquee sets exposed) [03], dead keyframes shipped on getdroppycode.app [04], and instant hover snaps on footer links and changelog handles [09]. Each part has the full Low list.

## Keep

- getdroppy.app's scroll scenes: the wordscroll scrub, the Dynamic Island section with its play toggle, and the Make-it-yours zoom on real scroll timelines with an rAF fallback [01].
- getdroppy.app's hover feedback that changes content rather than position, and its fixed nav's tone crossfade [01].
- Video budgeting and pausing on scroll, off screen, save-data and Reduce Motion [01].
- getdroppycode.app's real app window in the first viewport [05, 10].
- The shared radius scale, type steps, glass blur, container width and footer pattern. Freeze them as tokens [06].

## Suggested order of work

1. Same day: stable download link (or a beta label with the size), remove the copy guard, fix the counts, add the Reduce Motion rules.
2. One pass on each site: contrast, tap targets, the button-scale removal and FAQ hover.
3. Design work: the getdroppy.app hero with a real Mac, a single hero CTA, a shorter Droppy Code subtitle, a shared nav and button component, and the Droppy to Droppy Code link.
4. Polish: changelog search and anchors, stagger instead of one fade-up, motion and hover tokens (proposed in [04] and [09]), byte budgets for films.

## Not checked across the review

Safari and real-device frame pacing, HEVC and alpha video paths, purchase and checkout flows (nothing was bought or installed), and screen-reader output beyond markup inspection. Each part lists its own gaps.
