# Droppy Code motion inventory: scroll-driven and ambient animation

Home (`index.html`) and changelog (`changelog.html`) share one system: a 600ms fade-up reveal everywhere, one pinned word-illumination section, scroll-scrubbed binary canvas art, and small loops. Source read at `/Users/owencope/Developer/droppy-code/website/`. Live behavior verified locally over `http://localhost:8901` with Playwright Chromium at 1440x900 and 390x844, plus `prefers-reduced-motion: reduce`. Live versus local: asset version strings match live exactly (`site.css?v=14`, `site.js?v=5`, `wordscroll.css?v=5`, `wordscroll.js?v=5`, `code.js?v=7`), and `/changelog` serves 200, so local findings apply to live. Remote tour images and Google Fonts load from the network in both.

## At a glance

1. One 600ms fade-up is applied to 32 nodes, including whole tile grids, so sections arrive as a group with no stagger. Template filler, biggest feel issue.
2. `scroll-behavior: smooth` on `html` animates every programmatic scroll too, and stays on under reduced motion, so anchor jumps move for users who asked for none.
3. The theme picker auto-cycles every 2600ms forever while visible and preloads remote images as it goes. Motion never settles on the page's finale.
4. The changelog spinner still rotates under reduced motion (slowed to 2.4s instead of stopped).
5. The hero binary canvas redraws about 4000 text cells per scroll tick and produced 11 long tasks in one full-page sweep (CLS 0.0016, negligible). Fine on desktop, worth throttling.

## Inventory

| Page | Section | Selector | What moves | Trigger and range | Timing and easing | Reduced-motion handled | Phone result | Verdict |
|---|---|---|---|---|---|---|---|---|
| Both | All | `html` (`site.css:124-128`) | Anchor-jump scrolling | Any `#` link, full distance | UA smooth duration, no author curve | No, still smooth | Same | Native pattern, but the missing reduced-motion guard is a bug (see F1) |
| Both | Top | `.skip-link` (`site.css:180-194`) | Slides down on focus | Keyboard focus only | 150ms `ease-out` (0.16,1,0.3,1) | Yes, transition none (`site.css:461-463`) | Same | Correct, keep |
| Both | Nav | `.nav__pill` (`site.css:483-496`, gate `index.html:55`) | Fades, unscales X 0.78, unblurs 8px | First page load per visit, 120ms delay | 640ms (0.32,1.22,0.36,1), one-shot | Yes, animation none | Same | Apple-like entrance, plays once, keep |
| Both | Nav | `.nav__links` phone menu (`site.css:432-452`) | max-height 0 to 360px, opacity, padding | Menu button tap | 560ms shelf curve, opacity 240ms | Transitions none, menu still opens | 390px verified working | Closes the way it opens, keep |
| Home | Hero | `.reveal[data-reveal-on-load]` (`site.js:25-50`) | opacity 0 to 1, translateY 24px to 0 | Double rAF after DOMContentLoaded | 600ms `ease-out`, delays 0, 60, 120, 180, 340ms | 1ms duration, transform none | Same stagger | Fast purposeful stagger, keep |
| Home | Hero | `.hero__charge-entry`, `.hero__charged::after`, `.hero__charged-sheen` (`site.css:829-855`) | Bolt stream wipes in, bloom scales 0.65 to 1.08 and fades, sheen sweeps forever | Starts when title gets `is-settled` (measured settled by ~1.5s) | Entry 850ms linear 340ms delay, arrival 900ms ease-out 420ms delay, sheen 3.2s linear infinite | Yes, all three removed (`site.css:856-861`) | Same | Signature moment on the real headline, keep |
| Home | Hero | `.hero__field canvas` (`code.js:22-146`, `index.html:113`) | Binary digits stream downward | Scroll, `scrollY / 480px` (`data-scroll-span="480"`) | Scrubbed, no duration; redraw guarded at 0.002 progress delta | Yes, frozen at progress 0 | Same | Scroll-scrubbed craft, ends on real page, keep |
| Home | All sections | `.reveal` on scroll (`site.js:59-80`, `site.css:272-282`) | opacity 0 to 1, translateY 24px to 0 | IntersectionObserver ratio 0.12, rootMargin bottom -8%, one-shot, unobserves after | 600ms `ease-out`, per-node `--reveal-delay` | 1ms, ends visible | Same | Template fade-up filler at this dose (see F5) |
| Home | Highlights | `[data-highlight-rail]` (`code.js:152-246`, `site.css:1025-1056`) | Horizontal scroll with snap, arrows enable/disable | Drag, arrows, arrow keys, 7 cards; snap `x mandatory` | CSS `smooth`, JS `scrollTo smooth` (auto under reduced motion) | Yes, behavior auto | Gap 14px, cards full width | Native rail pattern, keep |
| Home | Themes wordscroll | `.wordscroll` pin (`wordscroll.css:32-47`) | Stage pins while page scrolls 500vh (420vh phone) | Scroll through section (measured top 7140, height 4500 at 1440x900 local) | Scrubbed via rAF-throttled vars | Yes, static stacked layout (`ws-reduced-motion`) | Height measured 3544px, no x-overflow | Signature pinned scene, keep |
| Home | Themes wordscroll | `.w-lit` per word (`wordscroll.js:150-165`) | 21 words light 0 to 1 with 0.12em rise | Scroll progress 0.10 to 0.40, staggered per word | Scrubbed; measured 0/21 lit at 5%, 5+3 partial at 20%, 17+2 at 35%, 21/21 by 60% | Yes, forced opacity 1 | Same | The page's best scroll moment, keep |
| Home | Themes wordscroll | `.wordscroll__copy`, `.wordscroll__demo`, `.wordscroll__bloom` (`wordscroll.js:167-173`) | Copy scales 0.96 to 1 and fades 1 to 0; demo fades 0 to 1; bloom peaks mid | Copy out 0.47 to 0.55, demo in 0.52 to 0.60, bloom peak 0.53 | Scrubbed; measured copy 1/demo 0 at 35%, copy 0/demo ~1 at 60% | Static, both visible | Same | Clean handoff ending on the real picker, keep |
| Home | Themes wordscroll | `.wordscroll__bits span` (`site.css:1972-2002`) | 12 binary glyphs pulse | Always while section exists | 4.5s ease-in-out infinite, staggered delays | Static at 0.25 opacity | Same | Subtle ambient texture, keep |
| Home | Themes | `.themes__stage img` + 2600ms cycle (`code.js:314-371`, `site.css:1929-1938`) | Theme stills crossfade, caption swaps; auto-advance | Intersection 0.4 starts cycle; any chip tap stops it forever | Crossfade 420ms (0.22,1,0.36,1); cycle 2600ms | Cycle off, but manual crossfade still animates (see F4) | 92vw stage | Real product on display, but the endless cycle is decoration (see F3) |
| Home | Features | `.faq__answer` grid rows (`site.css:1659-1664`) | Answer expands 0fr to 1fr; icon fills blue; dot fades in | Tap per item, independent | 300ms `ease-out` rows, icon, dot | No guard (still animates) | Full-width pills under 760px | Opens and closes the same way, keep; add the guard |
| Home | Outro | `.outro__field canvas` (`code.js:70-78`, `index.html:699`) | Same binary stream | Scroll while outro crosses viewport (`data-progress="viewport"`) | Scrubbed, redraw on scroll + IO gate | Frozen at 0 | Same | Consistent with hero, keep |
| Home | Footer | `.footer__wordmark span` (`site.js:183-218`) | Drifts up to 24px as footer enters | Scroll while footer in view, rAF-throttled, IO-gated | Follows scroll, no duration | Not guarded (JS has no reduced-motion check); single sample at page bottom read 13.1px inline transform | Same | Subtle, but add the guard (see F6) |
| Both | Buttons | `.btn:active`, `.btn--applepill:active`, `.btn--darkpill:active` (`site.css:536,556,580`) | Scale 0.97/0.98 on press | Pointer down | 150ms `ease-out` | Not guarded | Same | Small press feedback, keep; guard it |
| Changelog | Hero | `.reveal[data-reveal-on-load]` (`changelog.html:91-96`) | Same fade-up, delays 0/70/140ms | Load | 600ms `ease-out` | 1ms | Same | Keep |
| Changelog | Loading | `.changelog-spinner` (`changelog.css:92-111`) | Rotates | While `changelog.json` fetches; gone after render (22 entries measured) | 0.8s linear infinite | Slowed to 2.4s, still spins (see F2) | Same | Standard loader, fix the guard |
| Changelog | Entries | `.changelog-entry.reveal` (`changelog.js:256-260,353-381`) | Fade-up, stagger capped at 350ms (index x 70ms) | Observer threshold 0, margin -5%; measured 2/22 visible at rest top | 600ms `ease-out` | 1ms | Same | Threshold 0 is right for long cards, keep |
| Changelog | Entries | `.changelog-entry__pin` (`changelog.css:133-136,472-481`) | Sticks date/title while notes scroll | Sticky top 108px within entry | Follows scroll | Same | Static on phone (no stick) | Product-blog pattern, keep |
| Changelog | Entries | `.changelog-entry__channel--stable::before/::after` (`changelog.css:236-274`) | Droplet streams scroll one tile down, seamless loop | Always | 4.2s and 5.4s linear infinite | Yes, animation none, opacity 0.9 | Same | Jewelry, subtle enough, keep |
| Changelog | Entries | `.clog-float-icon` handoff (`changelog.js:467-492`) | Icon glides between entries' slots, FLIP measured | Active entry change on scroll/resize | 640ms (0.22,0.61,0.36,1), skipped under reduced motion | Glide skipped, icon still reparents | Same | Physical catch-and-settle, the page's best detail, keep |
| Changelog | Entries | `.clog-float-icon__face` (`changelog.css:339-358`) | Scale 0.72 + rotate -8deg + blur 7px to sharp on handoff | Same handoff; single face so no cross-dissolve runs | Opacity 520ms, transform 640ms, filter 520ms | Opacity-only 320ms | Same | Keep |

## Findings

### F1. Smooth scrolling stays on under reduced motion
Severity: Medium
Evidence: `assets/css/site.css:124-128` sets `scroll-behavior: smooth` on `html` with no reduced-motion override. Verified live: anchor and scripted `scrollTo` animate; probes had to use `behavior: instant` to sample true scroll states.
Why it matters: users who ask for no motion still get animated travel on every nav and footer link, and scripted smooth scrolls can fight assistive tech.
Exact fix in `assets/css/site.css`, next to the `html` rule:

    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
    }

### F2. Spinner keeps spinning under reduced motion
Severity: Low
Evidence: `assets/css/changelog.css:92-111` slows the loop to 2.4s instead of stopping it. The spinner is gone after load (22 entries rendered, no spinner node), so this only shows on slow networks.
Why it matters: a loading indicator is exactly where a motion-sensitive user waits longest.
Exact fix in `assets/css/changelog.css`:

    @media (prefers-reduced-motion: reduce) {
      .changelog-spinner {
        animation: none;
        border-top-color: var(--bg-well-raised);
      }
    }

### F3. Theme picker cycles forever while visible
Severity: Medium
Evidence: `assets/js/code.js:362-371` sets a 2600ms interval whenever the picker is 40% visible; captions advanced Tokyo Night to Nord across two samples 2.7s apart. A tap stops it, but hover, focus, and hidden tabs do not. Each step can fetch another remote webp.
Why it matters: the finale of the pinned scene never rests, and background tabs keep cycling.
Exact fix in `assets/js/code.js`, inside `buildThemePicker` after the observer:

    document.addEventListener("visibilitychange", function () {
      if (document.hidden && timer) { window.clearInterval(timer); timer = 0; }
    });

### F4. Manual theme crossfade animates under reduced motion
Severity: Low
Evidence: `assets/css/site.css:1929-1938` keeps `transition: opacity 420ms` on `.themes__stage img` with no reduced-motion rule; the JS cycle guard (`code.js:356`) does not cover taps.
Why it matters: reduced-motion users get a fade on every theme tap in the section built to be static for them.
Exact fix in `assets/css/site.css`:

    @media (prefers-reduced-motion: reduce) {
      .themes__stage img { transition: none; }
    }

### F5. One reveal everywhere flattens section entrances
Severity: Medium
Evidence: 32 `.reveal` nodes share 600ms fade-up; live sweep showed 5 visible at load (hero) rising to 32/32 settled after one full scroll, with whole tile grids arriving as single blocks (`site.js:59-80`, `site.css:272-279`). Frames: ../shots/code-motion-load-0ms.png through ../shots/code-motion-load-2000ms.png show the settled hero at each sample.
Why it matters: the page reads as template motion between its two genuinely crafted moments (hero charge, wordscroll). Per antislop R-19, motion needs a per-use purpose.
Exact fix direction (smallest step): put `data-reveal-on-load`-style stagger only on headline groups, and give tile grids no reveal, so the stills do the work. In `index.html`, remove the `reveal` class from the three `.tiles` containers:

    <div class="tiles">
    <div class="tile tile--agents">

(repeat for each `.tiles reveal` node; art is the real app and needs no entrance.)

### F6. Footer drift and button press ignore reduced motion
Severity: Low
Evidence: `assets/js/site.js:183-218` has no reduced-motion check before writing `translateY` every scroll frame; `assets/css/site.css:536,556,580` press scales have no guard. FAQ icon transitions also run.
Why it matters: three small gaps in an otherwise thorough reduced-motion story.
Exact fix, in `assets/js/site.js` at the top of `initWordmarkParallax`:

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

and in `assets/css/site.css`:

    @media (prefers-reduced-motion: reduce) {
      .btn:active, .btn--applepill:active, .btn--darkpill:active { transform: none; }
    }

### F7. Dead keyframes ship unused
Severity: Low
Evidence: `channel-breathe-a/b` (`changelog.css:253-261`) are overridden by `stable-drizzle-a/b` on the same pseudos (`changelog.css:236-251`), so they never run; `.wordscroll__sparks` and `ws-twinkle` (`wordscroll.css:155-178`) have no markup (the page uses `.wordscroll__bits`).
Why it matters: confusion for the next editor, small weight.
Exact fix: delete `assets/css/changelog.css:253-261` and `assets/css/wordscroll.css:155-178`.

## Distinct durations and easings, and one token set

Measured on the site: 150ms, 300ms, 420ms, 560ms, 600ms, 640ms, 850ms, 900ms, 1100ms settle timer, 2600ms cycle, 3.2s, 4.2s, 5.4s, 4.5s, 0.8s (2.4s reduced). Curves: `ease-out` (0.16,1,0.3,1), `ease-out-soft` (0.22,1,0.36,1), shelf (0.32,1.22,0.36,1), glide (0.22,0.61,0.36,1), linear loops, ease-in-out twinkle.
Proposed tokens (covers everything above, drops the one-offs):

    --motion-instant: 150ms ease-out
    --motion-panel: 300ms ease-out
    --motion-entrance: 600ms cubic-bezier(0.16, 1, 0.3, 1)
    --motion-shelf: 560ms cubic-bezier(0.32, 1.22, 0.36, 1)
    --motion-glide: 640ms cubic-bezier(0.22, 0.61, 0.36, 1)
    --motion-loop: linear infinite (spinner 0.8s, drizzle 4.2s/5.4s, sheen 3.2s)

Map: buttons, chips, skip to instant; FAQ to panel; reveals to entrance; nav dock and phone menu to shelf; float handoff to glide; charge entry/arrival keep their authored 850/900ms as the single signature exception.

## Frames

All under `../shots/`, prefix `code-motion-` (21 files):

Load: ../shots/code-motion-load-0ms.png, ../shots/code-motion-load-200ms.png, ../shots/code-motion-load-500ms.png, ../shots/code-motion-load-1000ms.png and ../shots/code-motion-load-2000ms.png show the hero already settled at the load event, since the reveal fires on double rAF.
Hero settled with sheen running: ../shots/code-motion-hero-settled.png shows the headline after settle.
Wordscroll pin: ../shots/code-motion-wordscroll-start.png shows copy entering, ../shots/code-motion-wordscroll-mid.png shows all 21 words lit, ../shots/code-motion-wordscroll-end.png shows the picker handed off with Dracula current.
Theme cycle two samples 2.7s apart: ../shots/code-motion-themes-a.png and ../shots/code-motion-themes-b.png show the caption advancing.
FAQ closed and open: ../shots/code-motion-faq-closed.png and ../shots/code-motion-faq-open.png show the grid-rows expansion.
Rail after one Next press: ../shots/code-motion-rail-next.png shows the second card snapped in. Footer drift rest state: ../shots/code-motion-footer.png shows the wordmark at page bottom.
Reduced motion desktop: ../shots/code-motion-reduced-top.png and ../shots/code-motion-reduced-mid.png show the static stacked wordscroll with all words lit.
Phone 390px: ../shots/code-motion-mobile-top.png and ../shots/code-motion-mobile-mid.png show no x-overflow.
Changelog: ../shots/code-motion-changelog-top.png and ../shots/code-motion-changelog-mid.png show the sticky pin with the float icon in its slot and the Stable pill.

## Keep

Reveal settle (`is-settled` drops `will-change`, transform, and transition after 1100ms or on `transitionend`, `site.js:36-42,82-88`); nav intro gated to once per visit (`index.html:55`); wordscroll unpins fully under reduced motion with all words lit (verified `ws-ready ws-reduced-motion`, lit opacity 1); rail honors reduced motion and keeps arrow/keyboard/drag working; changelog pin goes static on phones; float-icon handoff degrades to instant reparent; binary canvases are IO-gated and idle when offscreen; scroll-back-up and wheel flings leave all reveals settled with no re-trigger (32/32 after both); CLS 0.0016 over a full-page sweep.

## Not checked

Hover morphs and tap morphs (owned by the hover review); keyboard focus order and screen-reader narration of the pinned section; print; `prefers-contrast`; what happens with JS disabled beyond the `noscript` reveal fallback; video decode cost of remote webp on low-end hardware (only inferred from the 11 long tasks); live analytics-gated differences (none found in markup versions).
