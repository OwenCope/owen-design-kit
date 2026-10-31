# Droppy Code hover, focus and press inventory

Source read, not edited: `/Users/owencope/Developer/droppy-code/website/` (`index.html`, `changelog.html`, `assets/css/site.css`, `assets/css/changelog.css`, `assets/css/wordscroll.css`, `assets/js/site.js`, `assets/js/code.js`). Method: grepped every `:hover`, `:active`, `:focus`, `:focus-visible`, `:focus-within` selector and every `transition` declaration with file and line, then measured computed `color`, `background-color`, `opacity`, `transform`, `box-shadow`, `filter`, `text-decoration`, `cursor`, `outline` and `transition-*` at rest, after 600 ms hover, with mouse held 300 ms, and on keyboard focus, using Playwright with Chromium at 1440x900 in dark and light schemes plus a 390x844 touch tap test. Local server copy served from the website folder.

Live vs local: `site.css` is byte identical to `https://getdroppycode.app/assets/css/site.css?v=14` (both 59061 bytes, verified with diff). The HTML differs only in copy and hrefs (provider lists drop one name, `index.html` becomes `/`, `changelog.html` becomes `/changelog`, hero download points at `/download/latest` live vs `#download` local). No hover, focus or press rule differs between live and local.

One structural note: the site declares `color-scheme: dark` only (`site.css:22`). There is no light theme, so the light-scheme run rendered the same dark values. That is a brand decision for an editor-dark canvas, recorded here so it is not mistaken for a bug.

## At a glance

1. Every button shrinks when pressed (`.btn` to 0.97, pills to 0.98, carousel arrows to 0.96). The owner rule is that buttons never move or shrink on press, with feedback in tint only. This is the largest single deviation.
2. Carousel arrows also grow to 1.06 on hover. Same rule broken in the other direction.
3. FAQ questions (11 buttons, the most-clicked control on the page) have no hover feedback at all. No selector, no transition, measured zero change.
4. Links inside FAQ answers have no hover state either. They sit at accent color and do nothing on hover.
5. Keyboard focus never triggers the blur morph that hover does. The reference pattern fires the icon swap on `focus-visible` too; here focus only paints the outline while the label stays put.

## Table

| Page | Component | Selector | n | Rest to hover (measured) | Duration and easing | Press feedback | Focus ring | Verdict |
|---|---|---|---|---|---|---|---|---|
| index | Skip link | `.skip-link` | 1 | Offscreen to onscreen on focus only | 150 ms `cubic-bezier(0.16,1,0.3,1)` (`site.css:192`) | None | Itself is the focus indicator (verified: Tab lands on it, transform goes to shown) | Pass |
| index | Nav logo | `.nav__logo` | 1 | None (no hover rule) | None | None | 3 px `#7ab8ff` (nav override `site.css:178`) | Pass, logo is identity, not a control that needs hover |
| index | Nav links | `.nav__link` | 4 | `rgba(230,235,243,0.68)` to `rgb(230,235,243)` (`site.css:373`) | 150 ms color (`site.css:370`) | None on desktop; `rgba(255,255,255,0.08)` background only at 720 px and below (`site.css:458`) | 3 px `#7ab8ff` | Pass on desktop; mobile press tint is fine |
| index | Nav Download | `.btn.nav__cta` + morph | 1 | Background `#e8edf5` to `#fff` plus blur morph to glyph (`site.css:382`, `:626`) | 150 ms bg; morph faces 340 ms, opacity linear, filter `(0.22,1,0.36,1)` (`site.css:607`) | Background to `#cdd5e1` (`site.css:383`) plus generic `.btn:active` shrink to 0.97 (`site.css:536`, measured matrix 0.97) | 3 px `#7ab8ff`, and focus also paints hover bg (measured) | Fail, press shrink |
| index | Mobile menu button | `.nav__menu` | 1 | None (no hover rule) | Bars animate 320 ms on open, unrelated to hover (`site.css:406`) | None | Global 3 px accent | Acceptable, but a hover tint would help affordance; Low |
| index | Hero kicker link | `.hero__kicker` | 1 | Text and arrow to `--accent-text` `#8cc4ff` (`site.css:745`) | 150 ms, but declared on child spans not the link (`site.css:744`, comment at `:740` explains a link-level transition broke the reveal) | None measured | 3 px accent | Pass |
| index | Hero download pill | `.btn--applepill` + morph | 1 | Background to `#fff` plus 16 px blur morph to Apple mark (`site.css:555`, `:626`) | 150 ms bg; 340 ms morph | Shrink to 0.98 (`site.css:556`, measured) | 3 px accent | Fail, press shrink; hover itself is good, see shot |
| index | Hero secondary pill | `.btn--darkpill` + morph | 1 | `rgba(255,255,255,0.08)` to `0.12` plus morph (`site.css:579`) | 150 ms bg; 340 ms morph | Shrink to 0.98 (`site.css:580`, measured) | 3 px accent; focus also paints hover bg (measured) | Fail, press shrink |
| index | Free section buttons | `.btn--applepill`, 2x `.free__source` darkpill | 3 | Same rules as hero pills | Same | Same shrink | Same | Fail, same press shrink (shared selectors) |
| index | Carousel arrows | `.showcase-highlights__arrow` | 2 | Scale to 1.06 plus bg to `rgba(255,255,255,0.14)` (`site.css:1087`) | 180 ms transform, background, opacity (`site.css:1085`) | Scale to 0.96 (`site.css:1091`, measured) | 2 px accent offset 3 px (`site.css:1092`); disabled arrow gets opacity 0.28 and no hover (`site.css:1093`, hover/press guarded with `:not(:disabled)`) | Fail, hover grow and press shrink |
| index | Highlight rail | `[data-highlight-rail]` (tabindex 0, drag via pointerdown/move in `code.js:215`) | 1 | None (no hover rule) | None | Drag scrolls, no visual press state | Global 3 px accent | Pass with note: region is keyboard-focusable and draggable, no hover expected |
| index | Theme name pills | `.themes__name` (JS-rendered, 26 per comment `site.css:1916`) | 26 | Tertiary `rgba(232,237,245,0.55)` to primary `#e8edf5`, background unchanged (`site.css:1959`, measured after demo activation) | 150 ms background, color (`site.css:1957`) | None (click swaps `.is-current`, verified caption becomes `System · Follows your Mac`) | Global 3 px accent | Pass, with a caveat below |
| index | FAQ questions | `.faq__question` | 11 | None. Zero. No `:hover` selector exists for this class; measured all properties identical | None | None (icon fills accent on open, `site.css:1653`, 300 ms, open-state not press) | Global 3 px accent (measured outline to accent on focus) | Fail, missing hover |
| index | FAQ answer links | `.faq__answer-content a` | ~10 | None. Color fixed at `--accent-text` (`site.css:1716`), no hover rule | None | None | Global 3 px accent | Fail, missing hover |
| index | Free foot links | `.free__foot a` | 2 | Tertiary to primary, underline kept (`site.css:1555`) | None declared (measured duration 0 s, change is instant) | None | Outline to accent, color also shifts to primary on focus (measured) | Borderline: hover exists but snaps; add the standard 150 ms |
| index, changelog | Footer CTA | `.footer__cta` + morph | 1 | Background to `#fff` plus 11 px blur morph (`site.css:1853`, `:689`) | 150 ms bg; 340 ms morph | None. No `:active` rule exists for this class and it is not a `.btn`, so press does nothing at all (measured zero change) | 3 px accent | Inconsistent: every other button shrinks (bad) while this one does nothing (also no tint). Fix is a tint, not movement |
| index, changelog | Footer links | `.footer__madeby a`, `.footer__col a` | 30 in footer | Tertiary/secondary to primary (`site.css:1876`, `:1890`) | 150 ms color (`site.css:1874`, `:1888`) | None | 3 px accent | Pass |
| changelog | Thanks handles | `.changelog-thanks__handle` (JS-rendered from `changelog.json`, 22 releases) | varies | `none` to `underline`, color unchanged (`changelog.css:426`) | None declared (measured instant) | None | Global 3 px accent; focus also underlines (measured) | Borderline: underline-only hover that snaps; Low |
| changelog | Show more buttons | `.changelog-more` (JS-rendered, `changelog.js:209`) | varies | Tertiary to primary (`changelog.css:468`) | 150 ms color (`changelog.css:465`) | None | Global 3 px accent | Pass, though a press tint would match the future token set |

Counts for JS-rendered rows are structural (selectors and templates), not per-release hand counts.

## Findings

### 1. Buttons shrink on press
Severity: High.
Evidence: `site.css:536` (`.btn:active { transform: scale(0.97); }`), `site.css:556` and `site.css:580` (`scale(0.98)` on both hero pills), `site.css:1091` (`scale(0.96)` on arrows). Measured matrix 0.97/0.98/0.96 under held mouse. Screenshot: `../shots/code-hover-04-applepill-hover.png` shows the hover end state; press was measured, not shot, since a held-press crop is identical minus scale.
Why it matters: the owner house rule, stated in both motion-kit and design-patterns, is that buttons never move or shrink when pressed and feedback lives in tint only. Every primary action on both pages breaks it.
Exact fix (remove movement, keep a tint; inferences: none, values reuse existing tokens):

    .btn:active { transform: none; filter: brightness(0.94); }
    .btn--applepill:active { transform: none; }
    .btn--darkpill:active { transform: none; }
    .showcase-highlights__arrow:hover:not(:disabled) { background: rgba(255, 255, 255, 0.14); transform: none; }
    .showcase-highlights__arrow:active:not(:disabled) { transform: none; filter: brightness(0.94); }

### 2. Carousel arrows grow on hover
Severity: High.
Evidence: `site.css:1087` (`transform: scale(1.06)` on hover). Measured `none` to `matrix(1.06, ...)` at 180 ms.
Why it matters: same owner rule as finding 1, and these are the only elements on the site that translate hover into size. Nothing else grows.
Exact fix: covered by the arrow rules in finding 1 (drop the scale, keep the background step).

### 3. FAQ questions have no hover feedback
Severity: Medium.
Evidence: no `:hover` selector targets `.faq__question` anywhere in `site.css` (grep confirms; the class appears at `site.css:1585` with `cursor: pointer` but no hover or transition). Measured rest and hover identical across all properties. Screenshot: `../shots/code-hover-10-faq-rest.png` (rest), `../shots/code-hover-11-faq-focus.png` (focus works, hover does not).
Why it matters: 11 buttons with pointer cursors that ignore the mouse read as dead until clicked. This is also the page's furthest departure from its own pattern, since every nav, footer and pill link answers hover in 150 ms.
Exact fix (tint the existing pill wash and icon on hover, reusing the icon's own 300 ms token; inference: exact hover wash value is proposed, everything else is existing):

    .faq__question::before { transition: background 150ms cubic-bezier(0.16, 1, 0.3, 1); }
    .faq__question:hover::before { background: #232c3f; }
    .faq__question:hover .faq__question-icon { border-color: var(--text-secondary); color: var(--text-primary); }

The `#232c3f` wash is a proposal (one step above `--bg-well-raised` `#1a2030` on the dark canvas), marked as inference. If the owner prefers, any single-step lift of the existing token works.

### 4. FAQ answer links do nothing on hover
Severity: Medium.
Evidence: `site.css:1716` sets `color: var(--accent-text)` with no hover rule and no transition. Measured identical at rest and hover; focus only paints the outline. These links sit inside answers that otherwise respond (the answer opens in 300 ms).
Why it matters: accent-colored text promises a link; a link that ignores hover breaks that promise at the exact moment the reader decides to click.
Exact fix (inference: hover color `#fff` is proposed; duration reuses `--dur-fast`):

    .faq__answer-content a { transition: color 150ms cubic-bezier(0.16, 1, 0.3, 1); }
    .faq__answer-content a:hover { color: #fff; }

### 5. Keyboard focus skips the blur morph
Severity: Low.
Evidence: the morph hover block is gated on `(hover: hover) and (pointer: fine)` at `site.css:625`, with no `focus-visible` counterpart. Measured: focusing the nav CTA paints the hover background and the `#7ab8ff` ring, but the label stays and the glyph never appears. The reference `MorphLabel` pattern fires the swap on focus too.
Why it matters: keyboard users get a flatter, less complete version of the site's signature interaction, and focus/hover parity is the stated reason the pattern exists.
Exact fix (mirrors the existing hover block; no new values):

    :where(a, button):focus-visible.btn-morph--icon .btn-morph__face--rest { opacity: 0; filter: blur(var(--morph-blur)); }
    :where(a, button):focus-visible.btn-morph--icon .btn-morph__face--hover { opacity: 1; filter: blur(0); }

### 6. Instant hovers: free-foot links and changelog thanks-handles snap
Severity: Low.
Evidence: `.free__foot a:hover` (`site.css:1555`) and `.changelog-thanks__handle:hover` (`changelog.css:426`) change color/decoration with no `transition` declared; measured duration 0 s. The thanks-handle also changes nothing but underline. Screenshots: `../shots/code-hover-14-freefoot-hover.png`, `../shots/code-hover-15-changelog-entry.png`.
Why it matters: everything around them eases in 150 ms, so the snap reads as unfinished rather than intentional.
Exact fix (reuses the standard duration; hover colors are proposals, marked inference):

    .free__foot a { transition: color 150ms cubic-bezier(0.16, 1, 0.3, 1); }
    .changelog-thanks__handle { transition: color 150ms cubic-bezier(0.16, 1, 0.3, 1); }
    .changelog-thanks__handle:hover { color: #fff; }

### 7. Footer CTA press does nothing
Severity: Low.
Evidence: `site.css:1841` has no `:active` rule and the element is not a `.btn`, so the generic press rule misses it. Measured zero change with mouse held. Screenshot: `../shots/code-hover-12-footercta-hover.png`.
Why it matters: inconsistent with every other button once findings 1 and 2 are fixed (all buttons will tint on press except this one).
Exact fix:

    .footer__cta:active { background: #cdd5e1; }

Value reuses the nav CTA press background (`site.css:383`); no movement added.

## Proposed hover/press token set

One set for both pages, built only from values already on the site:

    --hover-dur: 150ms;
    --hover-ease: cubic-bezier(0.16, 1, 0.3, 1);
    --morph-dur: 340ms;
    --morph-ease: cubic-bezier(0.22, 1, 0.36, 1);
    --press-tint: brightness(0.94);

Rules: hover answers in color, background-color or blur only, never transform; press answers in tint only (`filter: brightness(0.94)` or one background step darker), never transform or scale; focus-visible always shows the 3 px accent outline and, on morph buttons, the glyph swap; every color or decoration hover carries the 150 ms transition; nothing animates `all`.

## Keep

* The blur morph itself: silhouette identical at rest and hover, content only, 340 ms faces, fine-pointer gating so touch never sticks, full `prefers-reduced-motion` fallback (`site.css:696`). Verified mid-hover: `../shots/code-hover-04-applepill-hover.png` shows only the Apple mark, centered, no resize.
* Touch behavior: at 390x844 with touch, tapping the hero pill plays the one-shot `is-tapmorph` round trip (620 ms) and returns to rest opacity 1 with the class cleared. No stuck hover. `../shots/code-hover-17-touch-tap.png`, `../shots/code-hover-18-touch-after.png`, `../shots/code-hover-19-touch-nav.png`.
* Theme picker: hover is color-only with no layout shift, click swaps the current pill and caption (verified `System · Follows your Mac`), keyboard focusable. Caveat, measured: the names carry `pointer-events: none` until the scroll section marks the demo active (`wordscroll.css:111`, `wordscroll.js` demoValue >= 0.99), so hover and click are dead unless the user has scrolled the stage into its active range. That gating is by design (only the visible demo takes input) and the demo container is `inert` until then, but it means any synthetic scroll that lands without driving scroll progress shows dead buttons. Not a bug, recorded so a future retest does not misread it.
* Skip link, focus rings (3 px accent, `#7ab8ff` in nav, 2 px on arrows), disabled arrow guard (`:not(:disabled)` on hover and press), `prefers-reduced-motion` coverage on morph, arrows, reveal and nav.
* Hero kicker transition living on child spans: deliberate (comment at `site.css:740`), keep as is.
* Nav logo and mobile menu button having no hover: acceptable as is; a 150 ms tint on the menu button would be a nice-to-have, not a finding.
* Live/local parity on all interaction CSS.

## Not checked

* Real-device Safari and iOS Safari (Chromium only); `backdrop-filter` hover interplay on physical glass rendering.
* Windows high-contrast / forced-colors rendering of the focus rings and morph faces.
* Full keyboard tab order timing through all 11 FAQ items and 26 theme names.
* The 390 px open mobile menu: links there use a press-only background (`site.css:458`), not hovered individually.
* Changelog float icon hand-off (decorative, `pointer-events: none`, `changelog.css:325`).
* Anything behind `#download` anchors (download behavior itself is another part's scope).
* Shots 01, 02, 03, 05, 06, 08, 12, 13, 16 are rest/hover crops supporting the table rows above: `../shots/code-hover-01-nav-rest.png`, `../shots/code-hover-02-navlink-hover.png`, `../shots/code-hover-03-applepill-rest.png`, `../shots/code-hover-05-darkpill-hover.png`, `../shots/code-hover-06-kicker-hover.png`, `../shots/code-hover-08-themes-rest.png`, `../shots/code-hover-12-footercta-hover.png`, `../shots/code-hover-13-footerlinks-hover.png`, `../shots/code-hover-16-clmore-hover.png`.
