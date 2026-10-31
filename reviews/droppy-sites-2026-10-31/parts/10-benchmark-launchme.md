# Benchmark: launchmeapp.com against getdroppy.app and getdroppycode.app

Reviewed live on 2026-10-31 with Playwright Chromium at 1440x900 and 390x844, plus a read of LaunchMe's `css/style.css` (3193 lines) and its five same-origin scripts. LaunchMe is a good Apple-style reference: restrained, light, product-first. Droppy is still the stronger site overall, with more motion craft, a clearer identity and about a tenth of the page weight. The value here is a short list of specific things to borrow.

## At a glance

Worth borrowing:

1. **The product on a Mac, in the first viewport.** LaunchMe's hero puts a MacBook with the real launcher on screen directly under the CTA ([hero](../shots/bench-launchme-hero-1440.png)). getdroppy.app opens on a mascot and hands, and the product first appears a scroll later (Walter's High finding in part 02).
2. **Carousels that start paused.** LaunchMe's Explore carousel only autoplays after the user presses play, and it stops on wheel, touch or pointer down (`js/sections.js:93-109`). getdroppy.app rotates its tabs every 6s on its own (Hank, part 01).
3. **A nav that hides on scroll down and returns on any scroll up**, skipped entirely under Reduce Motion (`js/header-scroll.js`, 6px threshold, always visible in the top 72px, `transform 0.28s cubic-bezier(.22,.61,.36,1)`). Verified: the header got `is-hidden` after a 400px wheel down and lost it after a 200px wheel up.
4. **One calm hero line plus a feature strip.** One H1, one sentence, one button, then a dot-separated strip ("Customizable · Live wallpapers · Automations · Widgets · Spaces"). getdroppycode.app's hero subtitle runs to 5 lines at 1440 and lists 13 provider names ([hero](../shots/bench-code-hero-1440.png)).
5. **A cursor-reactive footer that respects Reduce Motion.** A canvas reveals a second image layer in liquid drops under the cursor. Each drop fades over 2600ms and there is a cap of 110 drops. With Reduce Motion on, only the static top layer shows (`js/interactive-footer.js:20`). It's a small signature moment at the end of the page, not at the start.

Where Droppy already wins:

1. **Motion with a purpose.** Droppy's scroll scenes scrub real product UI and end on it, and its buttons stay put on hover (part 01). LaunchMe's main motion is a generic 30px fade-up on 125 elements (see Do not copy).
2. **Page weight.** Measured transfer on first load at 1440: LaunchMe 18.4MB over 121 requests, getdroppy.app 1.7MB over 44 requests. On a phone, getdroppy.app sent 616KB.
3. **Identity.** Swap the logo on LaunchMe and it reads as any Apple-style app page (antislop R-20). Droppy's blue world, the drop mascot and the "Supercharged" wordmark treatment belong to Droppy.

## Comparison

| | launchmeapp.com | getdroppy.app | getdroppycode.app |
|---|---|---|---|
| Theme | White, `#1d1d1f` text, `#f5f5f7` cards | Saturated blue hero, lavender `rgb(241,240,254)` page | Dark `rgb(11,14,20)` with a binary-digit backdrop |
| H1 at 1440 | 60px / 800 / -1.2px, system font | 77.6px / 600 / -2.33px, SF Pro Display | 62.4px / 600 / -2.81px, Inter Tight |
| H1 at 390 | 60px (not scaled down) | 44px | 40px |
| Body copy | 24px / 600 at 1440, unusually heavy | 17px on phone | 20px / 400 / 29px |
| Nav | 57px, fixed, white glass, auto-hides | 44px full-width gnav | 64px floating pill |
| Product in first viewport | Yes, MacBook frame | No, mascot scene | Partly, app window starts at y=694 |
| Hero CTA | One: "Download for macOS" | Two equal pills: Download, Purchase | Two: Download, "See what it does" |
| Hover feel | Colour shifts in 0.15s; primary button opacity snaps | Buttons never move (part 01) | See part 09 |
| Scroll motion | Laptop scale and blur scrub over 200vh, fade-up on 125 elements | Scrubbed product scenes, frame sequences | See part 04 |
| Reduce Motion | Handled: reveals shown (0 of 125 hidden), nav auto-hide off, footer canvas off | Handled almost everywhere, except the press marquee | See part 04 |
| Horizontal overflow at 390 | 0px | 0px | 0px |
| First-load transfer at 1440 | 18.4MB, 121 requests | 1.7MB, 44 requests | Not reliable in this run (opaque cross-origin sizes) |

## Findings

### 1. Show the Mac in the hero (High for getdroppy.app)

**What LaunchMe does:** a 60px headline, one sentence, one button and a feature strip all fit above y=560. A MacBook running the product starts at y=636, so the frame's top edge sits inside the first viewport and pulls the eye down ([hero](../shots/bench-launchme-hero-1440.png)). On scroll, the laptop scales and centres while a blur and a 0.4-opacity overlay clear (`js/main.js`, gallery stage, 200vh container), and it ends on the real screen ([scroll 900](../shots/bench-launchme-scroll-900.png)).

**Why it works:** a visitor knows what the product looks like before reading a word of feature copy.

**For getdroppy.app:** keep the mascot scene, which is the brand, but bring the first island state into view. Either put a MacBook top edge with the notch and a live island at the bottom of the hero (`mac-props` rules: real capture, notch-aware menu bar), or shorten the hero so the first product scene starts by about y=820 at 1440x900. Don't copy the blur-in. Droppy's scrubs are already better.

### 2. Start carousels and tab rotators paused (Medium for getdroppy.app)

**What LaunchMe does:** `stopAuto()` runs at init. A visible play/pause button starts a 5000ms interval, and any wheel, touchstart or pointerdown on the track stops it. Slides move with an 800ms cubic ease-in-out, and scroll snapping is turned off for the duration so the snap doesn't fight the animation (`js/sections.js:51-70`).

**For getdroppy.app:** stop the 6s auto-rotation on the feature tabs. If rotation stays, add a visible pause control (WCAG 2.2.2 requires one for anything that moves for more than 5s), stop it on hover, focus and pointerdown, and disable it under Reduce Motion:

    @media (prefers-reduced-motion: reduce) { /* and in JS: skip setInterval when matchMedia matches */ }

### 3. Hide the nav on scroll down, return it on scroll up (Low, both sites)

**What LaunchMe does:** see At a glance item 3. The bar closes its own menu when it hides (it dispatches `lp-header:close-menu`).

**For getdroppycode.app:** the 64px floating pill covers long code and changelog content. Reusing LaunchMe's thresholds fits it well:

    .nav { transition: transform 280ms cubic-bezier(.22,.61,.36,1); }
    .nav.is-hidden { transform: translateY(calc(-100% - 12px)); pointer-events: none; }
    @media (prefers-reduced-motion: reduce) { .nav { transition: none; } }

getdroppy.app's 44px gnav is thin enough to leave as it is.

### 4. Shorten the Droppy Code hero subtitle (Medium for getdroppycode.app)

**What LaunchMe does:** one sentence of 25 words under the H1.

**For getdroppycode.app:** the subtitle at `website/index.html:124` is 3 sentences and about 55 words, and its middle sentence lists 13 providers. Keep the first sentence, then move the provider list into a logo or name strip under the buttons, styled like LaunchMe's feature strip. Suggested copy:

    Hydra is on from your first chat: one chat leads a team of heads, each in its own copy of your project, and their work lands as one merge. Free and open source.

### 5. Give the end of the page one small moment (Low, both sites)

**What LaunchMe does:** the footer's liquid reveal follows the cursor, then dissolves (450ms hold, 2600ms total life). The canvas is capped at 2x device pixel ratio, it only animates while drops exist, and an IntersectionObserver keeps it off screen otherwise (`js/interactive-footer.js:143-160`).

**For Droppy:** an end-of-page moment should be Droppy's own, for example the island in the footer reacting to the cursor or opening into a "Download" state. Copy the engineering pattern (paused when off screen, a cap on work, off under Reduce Motion), not the visual.

### 6. One primary CTA in the hero (Medium for getdroppy.app)

**What LaunchMe does:** one dark pill, "Download for macOS", 38px tall in the nav and larger in the hero. Pricing sits in the nav.

**For getdroppy.app:** "Download for macOS" and "Purchase" are equal-weight light pills ([hero](../shots/bench-droppy-hero-1440.png)). Make Download the filled primary and turn Purchase into a text link or secondary style, as Walter recommends in part 02.

## Where Droppy is better

- **Hover discipline.** LaunchMe's `.lp-btn` declares `transition: color 0.15s` but hover changes `opacity` to 0.85, so the button blinks instead of fading (measured: rest opacity 1, hover 0.85, no opacity transition). Droppy's buttons have consistent hover states that don't move the button (part 01).
- **Scroll storytelling.** LaunchMe has one scrubbed scene (the laptop). getdroppy.app has several, each ending on real UI.
- **Responsive type.** LaunchMe's H1 stays at 60px on a 390px phone, where getdroppy.app steps down to 44px and getdroppycode.app to 40px.
- **Copy voice.** LaunchMe uses "seamlessly integrated" and "It works just like magic!" ([scroll 900](../shots/bench-launchme-scroll-900.png)), and its page title puts an em dash between "LaunchMe" and "Customizable App Launcher for Mac". Droppy's copy is plainer.
- **Weight and speed.** 1.7MB against 18.4MB on desktop first load.

## Do not copy

- **The blanket fade-up.** `js/sections.js:111-141` adds `.reveal` (opacity 0, translateY 30px, 700ms) to 125 elements: every title, card, tile, FAQ item and list row, with up to 350ms of stagger. This is the template motion antislop R-19 warns about, and it delays reading on every section.
- **50px and 85px radii on every card** (`.lm-card { border-radius: 50px }`, `.cta-pill { border-radius: 85px }`). It reads soft but generic. Droppy's radius scale is already consistent across both sites (part 06).
- **24px / 600 body copy.** It's heavy for paragraphs and makes the long notch section read like a headline.
- **18MB of media on load.** Lazy-load anything below the fold.

## Not checked

- Safari rendering and HEVC or alpha video paths.
- LaunchMe's pricing, blog and help pages: only the homepage was reviewed.
- Lighthouse scores: transfer sizes come from the Resource Timing API in one cold headless run.
- getdroppycode.app transfer size: the run reported 69KB, which is not credible for a page with images. Cross-origin assets reported 0 bytes, so this figure is left out.
- Real-device frame pacing for LaunchMe's laptop blur scrub, which animates `filter: blur()` and `backdrop-filter` every scroll frame and is likely costly on older Macs (inference from the code, not measured).
