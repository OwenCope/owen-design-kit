# Hover, focus and press review: getdroppy.app (live site, 2026-10-31)

Research only. No site code was edited. Measured in headless Chromium (Playwright, 1440x900 desktop and 390x844 with touch) against the live page, plus selectors read from the downloaded HTML and same-origin stylesheets in /tmp/droppy-review/hover3/ (all three stylesheets are minified to a single line, so citations below are file plus selector). Companion to part 01 (motion): part 01 covers morph timing, press scales and auto-advance. This part goes element by element through what changes at rest, hover, press and keyboard focus. New screenshots use the droppy-hover2- prefix.

Two probe artifacts to know before reading. First, every element measured `cursor: none` in headless. That comes from `html.has-droppy-cursor *{cursor:none!important}` (css-site.css:1), the custom-cursor takeover, and is not a finding. On a real machine the cursor is normal. Second, pressing a link with mouse.down plus mouse.up usually navigates, so press readings on links are taken between down and up, and focus readings on links come from a fresh page with no prior click. Where programmatic focus did not match `:focus-visible` (mouse was the last input), rings were verified with keyboard-modality focus instead.

## At a glance

1. Press shrinks controls in 8 places (High). Hero pills scale to 0.98, seg tabs to 0.95, swatches to 0.9, showcase arrows to 0.96, tc arrows to 0.94, tc play buttons to 0.92, the finish pill container to 0.96 through a JS class, and the cookie banner Accept button to 0.97 through the global `.btn:active` rule. The owner rule is that buttons never move on hover or press, and tint feedback already exists everywhere, so every scale can go.
2. Showcase arrows also grow on hover to 1.06 (High). This is the only hover scale on the page, on top of the press shrink, and it breaks the same rule.
3. Testimonial cards lift 4px on hover (High). `.tc-card:hover` moves the whole card with `translateY(-4px)`. Same rule, same fix.
4. FAQ questions have no hover feedback at all (Medium). 15 buttons, measured hover changes nothing, and there is no `:hover` rule for `.faq__question` in any stylesheet. Focus ring and open state are good, which makes the hover gap stand out more.
5. The pricing controls have no hover and no press feedback (Medium). The plan options and the purchase CTA change nothing on hover or press. Only the 3px focus ring responds. These are the money buttons, and the comparable tab component elsewhere on the page (`.h3-seg__btn`) does tint on hover, so the pricing row reads as dead by comparison.

## State table

Cursor is pointer for links and buttons on real machines (headless reports none, see above), so the cursor column is omitted. Durations are measured computed values.

| Group | Selector | n | Rest to hover | Duration and easing | Press feedback | Focus ring | Verdict |
|---|---|---|---|---|---|---|---|
| Nav links | `.gnav__link` | 9 | Color 0.82 white to full white | color 320ms cubic-bezier(0.4, 0, 0.6, 1) | None, act flag only | 2px solid white (paper tone: blue), offset -2px, radius 6px | Keep |
| Nav dropdown rows | `.gnav__sublink` | measured in open menu | Color to white (paper: blue) | color 320ms same curve, rows stagger 18ms from 60ms | None | Same 2px ring; focused trigger also reveals its chevron | Keep |
| Buy pill | `.gnav__buy` | 1 | Bg white to 86 percent white mix | background-color plus color 320ms same curve | None, act flag only | 2px white ring, verified with keyboard focus | Keep, press could tint but navigating makes it moot |
| Hero pills | `.download-choice__trigger` (4), `.btn--purchase` (1) | 5 | Bg rgb(227,226,239) to rgb(219,218,231), plus label blur morph (part 01) | background-color 180ms ease | Scale 0.98 plus bg to rgb(211,210,223) | 3px white ring in sky tone (CSS, not keyboard verified) | Fail, press scale |
| Choice options | `.download-choice__option` (3 visible of 12) | 12 | Bg darkens the same step; brew variant goes to #f7a52a | 180ms ease | None, act flag only | 3px accent ring (CSS) | Keep |
| Kicker link | `.hero__kicker--link` | 1 | Whole kicker incl icon fades to opacity 0.7 | opacity 150ms cubic-bezier(0.16,1,0.3,1) | None | 3px white ring, keyboard verified | Keep |
| Segmented tabs | `.h3-seg__btn` | 8 | Inactive tabs: color rgb(58,76,162) to rgb(19,21,105); active tab unchanged | color 180ms linear | Scale 0.95 | 3px accent ring, keyboard verified | Fail, press scale |
| Finish pill buttons | `.h3-pill__btn` | 7 | Plate child bg changes; button computed style unchanged | plate transition | None on button; container takes JS class `.is-pressed` at scale 0.96 | 3px ring per global rule (CSS, not keyboard verified) | Fail, container press scale |
| Round buttons | `.h3-roundbtn` | 3 | Not reachable at rest: arrows sit at opacity 0 with pointer-events none until the viewer opens | background-color 150ms linear when enabled | Scale 0.92 when enabled | Global 3px (CSS) | CSS only, unreachable at rest |
| Finish swatches | `.h3-swatch` | 3 | Nothing by design, no hover rule, hidden until pill opens | scale 120ms ease-out | Scale 0.9, measured | Global 3px (CSS) | Fail, press scale; hover absent |
| Showcase arrows | `.showcase-highlights__arrow` (1 of 4 disabled) | 4 | Scale 1.06 plus bg glass 0.72 to 0.82 | transform plus background 180ms | Scale 0.96 | 2px accent ring offset 3px (CSS) | Fail, hover grow and press shrink |
| Carousel dots | `.hlx-dot` | 4 | Track child bg to 0.56 (measured 0.55 on inactive dot); button itself unchanged | button transition all 0s, track has own fade | None | Button outline none, 2px accent ring drawn on the track child (CSS) | Keep, unusual but clear |
| Rail play buttons | `.hlx__play` (2), `.dynamic-island__play` (1) | 3 | Bg 0.10 to 0.16 white plus color to full white | background-color 200ms ease | None | Global 3px (CSS) | Keep |
| Card flip toggles | `.onep-card__toggle` (8) | 8 | Bg 0.08 to 0.13 ink | background-color 300ms ease | Press flips the card (the measured transform is the flip, not feedback) | 3px ring (CSS) | Keep, press means flip |
| Card nav arrows | `.onep__arrow` | 2 | Bg 0.08 to 0.13 ink | 300ms ease | None | 3px ring, hover state persists under focus | Keep |
| Card CTA links | `.onep-card__cta` | 8 | Unreachable: sits on the card back face, cards rest unflipped | transition all 0s | Unreachable | Unreachable at rest | CSS only |
| Pricing plan options | `.pricing2__seg button` | 3 | Nothing, hov flag only | color 250ms (unused on hover) | Nothing, act flag only | 3px accent ring, keyboard verified | Fail, no hover or press |
| Pricing CTA | `.pricing2__cta` | 2 | Nothing, hov flag only | transition all 0s | Nothing, act flag only | 3px accent ring, keyboard verified | Fail, no hover or press |
| Browse-all link | `.droplets-browse` | 1 | Bg 0.08 to 0.14 white | 150ms cubic-bezier(0.16,1,0.3,1) | None | 2px accent ring (CSS) | Keep |
| Droplet tiles | `.droplet-tile` (divs) | 72 | Bg white to rgb(234,233,253) on light cards | background 150ms same curve | None, not pressable | Not focusable, no tabindex | Keep with note, decorative tint only |
| Language cards | `.lang-card` (divs, JS rendered) | 112 | No visible change on light cards: rest bg is already white so the hover rule is a no-op | background 150ms same curve | None, not pressable | Not focusable | Keep with note, hover only affects dark variants |
| Creator cards | `.creator-voice-card.community-card` (links) | 22 | Platform label recolors to accent; card bg unchanged on light variant | background 150ms same curve | Opens post in new tab | 2px accent ring via the community-card rule | Keep |
| Press stamps | `.stamp` (links) | 36 | Opacity 0.82 to 1, and the marquee pauses | opacity 150ms same curve | None | 3px accent ring, verified with keyboard focus | Keep |
| Learn more links | `.dspot__more` (links) | 11 | Arrow glyph slides 3px right; link computed style unchanged | transition all 0s | None, tap navigates | Global 3px (CSS, not keyboard verified) | Keep, glyph nudge is content feedback |
| Device film chip | `.devices__film` | 1 | Bg rgb(227,226,239) to rgb(219,218,231) | background-color 200ms ease | None | 3px white ring (CSS) | Keep |
| FAQ questions | `.faq__question` (buttons) | 15 | Nothing, hov flag only, no hover rule exists | transition all 0s | Toggles open; plus icon fills accent | 3px accent ring, keyboard verified and screenshotted | Fail, no hover |
| Footer links | `.footer__col a` | 24 | Color 0.74 white to full white | color 150ms same curve | None | 3px white ring, keyboard verified | Keep |
| Brew copy and back | `.brew-card__copy`, `.brew-card__back` | 4 each | Copy bg 0.10 to 0.17 white; back transparent to 0.07 ink plus ink color | 200ms and 160ms ease | Copy sets the copied state with glyph morph (verified); back none | 3px and 2px rings (CSS) | Keep |
| E2EE badge | `.e2ee__badge` | 1 | Color to primary | color 150ms same curve | None | No outline by design; inner chip takes the accent-soft highlight (CSS, inner state inferred not measured) | Keep with note |
| TC arrows | `.tc__arrow` | 2 | Bg 0.08 to 0.14 ink | background plus transform 200 to 300ms ease | Scale 0.94 | Global 3px (CSS) | Fail, press scale |
| TC play buttons | `.tc-card__play` | 9 | Bg 0.22 to 0.32 white | background 200ms, transform 300ms ease | Scale 0.92 | Global 3px (CSS) | Fail, press scale |
| TC cards and links | `.tc-card`, `.tc-card__link` | 9 links | Card lifts translateY(-4px); link has its own focus ring rule | card transition in features.css | Card press scale 0.985 (CSS) | 3px white ring on link (CSS) | Fail, card lift and press scale, live check blocked (see H3) |
| Cookie Accept | `.btn--white.dac__accept` | 1 | Nothing, hov flag only | background plus color plus transform 150ms | Scale 0.97 through global `.btn:active` | Global 3px (CSS, not keyboard verified) | Fail, press scale and no hover |
| Sound toggle | `.yt-sound-toggle` | 0 on home | Bg to rgba(10,14,20,0.75) per CSS | CSS hover | Scale 0.92 per CSS | Not on this page | Not checked live |
| Purchase back link | `.purchase-back` | 1, hidden flow | Bg 0.12 ink plus primary color per CSS | CSS hover | Not reachable | 3px ring shared with pricing (CSS) | CSS only |

## Findings

### H1. Press scales on eight controls (High)

Evidence: hero pills `transform: matrix(0.98, ...)` measured 300ms after mouse down, css-site.css:1 `.btn--applepill:active{transform:scale(0.98)}` and `.btn--darkpill:active`; seg tabs `scale: [none] -> [0.95]` measured, css-home3.css:1 `.h3-seg__btn:active{scale:0.95}`; swatches `scale: [none] -> [0.9]` measured with pill open, no hover change in the same reading; showcase arrows `transform: ... -> matrix(0.96, ...)` measured on the enabled arrow, css-home.css:1 `.showcase-highlights__arrow:active:not(:disabled){transform:scale(0.96)}`; tc arrows `matrix(0.940424, ...)` measured, features.css:1 `.tc__arrow:active{transform:scale(0.94)}`; tc play `matrix(0.923997, ...)` measured, features.css:1 `.tc-card__play:active{transform:scale(0.92)}`; finish pill container css-home3.css:1 `.h3-pill.is-pressed{scale:0.96}` (JS-driven class, rule read in CSS, press not live-measured); cookie Accept `matrix(0.97, ...)` measured, css-site.css:1 `.btn:active{transform:scale(0.97)}`. Round buttons carry css-home3.css:1 `.h3-roundbtn:active{scale:0.92}` for when the viewer opens. Screenshots: ../shots/droppy-hover-hero-download-hover.png shows the hover tint that already confirms the press; no scale is needed on top.

Why it matters: the owner rule for this site is that buttons never move on hover or press, and every one of these controls already has tint, morph, or state-change feedback. The scales add nothing and break the one motion rule the page otherwise follows.

Fix (apply per selector, pattern is identical):

    .btn--applepill:active, .btn--darkpill:active, .btn:active {
        transform: none;
    }

    .h3-seg__btn:active, .h3-swatch:active {
        scale: 1;
    }

    .showcase-highlights__arrow:active:not(:disabled) {
        transform: none;
    }

    .h3-pill.is-pressed {
        scale: 1;
    }

### H2. Showcase arrows grow on hover (High)

Evidence: enabled arrow measured `transform: [none] -> [matrix(1.06, ...)]` with bg `rgba(222,221,242,0.72)` to `rgba(210,209,236,0.82)`, css-home.css:1 `.showcase-highlights__arrow:hover:not(:disabled){transform:scale(1.06);background:rgb(var(--fg-rgb) / 0.14)}` with `transform, background, opacity 0.18s` transitions. Prior pair ../shots/droppy-hover-showcase-arrow-rest.png and ../shots/droppy-hover-showcase-arrow-hover.png. The first arrow is disabled at rest, so this only affects the enabled direction.

Why it matters: this is the only hover scale on the page, directly against the owner rule, and it stacks with the H1 press shrink on the same control.

Fix:

    .showcase-highlights__arrow:hover:not(:disabled) {
        transform: none;
    }

### H3. Testimonial cards lift on hover and shrink on press (High)

Evidence: css-home.css:1 has no such rule; the rule lives in features.css:1 as `.tc-card:hover{transform:translateY(-4px)}` with `.tc-card:active{transform:scale(0.985)}` beside it (verified by selector grep across the downloaded stylesheets; both files are single-line so line numbers are 1 throughout). Live verification was blocked: at probe time the card center hit an covering consent-layer element, so hover could not be applied to the measured instance. The arrows and play buttons inside the same cards were measured (H1), so the card rules are CSS-read, not live-measured.

Why it matters: a 4px whole-card lift is the largest hover movement on the page and the same owner-rule breach as H2.

Fix:

    .tc-card:hover {
        transform: none;
    }

    .tc-card:active {
        transform: none;
    }

### H4. FAQ questions have zero hover feedback (Medium)

Evidence: 15 `.faq__question` buttons measured; hover flips only the internal hov flag, every computed property identical, and no selector matching `.faq__question:hover` exists in any downloaded stylesheet. Press toggles the item open with the icon filling accent (measured bg transparent to rgb(18,25,237), ../shots/droppy-hover2-faq-focus.png shows the open state). Keyboard focus draws a 3px accent ring (verified with keyboard-modality focus, ../shots/droppy-hover2-faq-focusring.png). Prior pair ../shots/droppy-hover-faq-rest.png and ../shots/droppy-hover-faq-hover.png look identical, which is the point.

Why it matters: hover is the first thing a mouse user tries on a disclosure row, and 15 identical rows with no response read as broken even though click works.

Fix: tint the question pill backdrop on hover using the existing well token, no movement.

    .faq__question:hover::before {
        background: var(--bg-well-raised-hover, rgb(var(--fg-rgb) / 0.12));
    }

### H5. Pricing controls have no hover and no press feedback (Medium)

Evidence: 3 `.pricing2__seg button` and 2 `.pricing2__cta` measured; hover and press change nothing but the internal flags. No `:hover` or `:active` selector exists for either in the stylesheets; the only state rule is the shared `:focus-visible` 3px accent ring (css-home.css:1), which was keyboard verified. The pricing CTA carries no morph faces either (markup check: plain link with glyph), so unlike the hero pills there is no label animation covering the gap. Contrast the same-page `.h3-seg__btn`, which tints inactive tabs on hover.

Why it matters: these are the purchase buttons. A control that ignores the mouse twice (hover and press) while everything around it responds feels dead at the exact moment the user decides to pay.

Fix: reuse the card CTA hover token already on the page.

    :is(.pricing2__seg button):hover {
        background: rgb(var(--fg-rgb) / 0.12);
    }

    .pricing2__cta:hover {
        background: var(--pill-light-hover);
    }

### H6. Cookie Accept has no hover feedback (Medium; press scale is H1)

Evidence: `.btn--white.dac__accept` measured after the banner was scrolled into view (../shots/droppy-hover2-consent-bar.png): hover changes nothing, press scales to 0.97 through the global `.btn:active` rule. The banner is the first interactive thing many visitors meet, and its primary button ignores hover.

Why it matters: same dead-control reading as H5, on the consent gate.

Fix: give it the same hover the download-choice options use, and let H1 remove the scale.

    .dac__accept:hover {
        filter: brightness(1.06);
    }

### H7. Tapped tabs and FAQ rows keep their hover look on touch (Low)

Evidence: at 390x844 with touch, tapping `.h3-seg__btn` and `.faq__question` leaves `hov: true` 700ms after the tap with the hover color still applied. Tapping `.dspot__more` navigates immediately, so nothing sticks there. Inference: the stuck style clears on the next tap elsewhere, standard sticky-hover behavior, not a trapped state.

Why it matters: a tapped seg tab keeps its hover tint until the next tap, which slightly overstates the selected state on phones. Small and self-clearing.

Fix: guard the two hover tints so they only apply where hover truly exists.

    @media (hover: hover) and (pointer: fine) {
        .h3-seg__btn:hover { color: var(--text-primary); }
    }

### H8. Three controls are styled for hover but unreachable at rest (Low)

Evidence: `.h3-roundbtn` arrows measured `pointer-events: none` with their container at opacity 0 (css-home3.css:1 `.h3-viewer__arrows{...pointer-events:none}`) until the viewer opens; `.h3-swatch` measured `visibility: hidden` until its pill opens, and even open it has no hover rule (measured hov flag only, press scale 0.9); `.onep-card__cta` sits on the card back face with the card unflipped (`card-flipped=false` measured), so the CSS hover tint (`background:var(--pill-light-hover)`, css-home.css:1) cannot be reached without flipping first.

Why it matters: none of these mislead anyone today, but anyone editing hover styles will test them at rest and conclude hover is broken. One line per case in a review checklist prevents that.

Fix: no style change. When testing hover, open the viewer, open the finish pill, and flip a card first.

### H9. Language-card hover is a no-op on the default cards (Low)

Evidence: an in-viewport `.lang-card` measured identical bg (white) and color before and after hover; the rule css-home.css:1 `.lang-card:hover{background:rgb(255 255 255)...}` only changes dark variants. Droplet tiles on the same pattern do visibly tint (white to rgb(234,233,253), ../shots/droppy-hover-tile-rest.png). Neither tile type is focusable (plain divs, no tabindex in markup), so hover is decoration, not a hidden action. Inference: no keyboard path is needed since the tiles expose no action.

Why it matters: a hover rule that changes nothing on most instances is dead code paths for users and a confusion source for editors.

Fix: either scope the rule to dark variants or drop it.

    .lang-card--dark:hover {
        background: rgb(255 255 255);
    }

## Proposed single hover/press token set

Reuse what the page already does. Hover is always a tint, a recolor, or content motion under 4px on a glyph, never a move of the control. Durations on this page run 150ms for tints (footer, kicker, tiles), 180 to 200ms for pills and chips, 300 to 320ms for nav and card toggles, all on `--ease-out` or the nav curve. Press is the same tint one step darker plus, for copy buttons, the glyph morph. Focus is a 3px accent outline with 3px offset on light surfaces, 3px white on dark surfaces, 2px on nav and small arrows.

    :root {
        --hover-tint: rgb(var(--fg-rgb) / 0.12);
        --hover-tint-strong: rgb(var(--fg-rgb) / 0.14);
        --press-tint: rgb(var(--fg-rgb) / 0.2);
        --focus-ring: 3px solid var(--accent);
        --focus-ring-offset: 3px;
        --focus-ring-dark: 3px solid #ffffff;
        --hover-dur: 150ms;
        --hover-dur-pill: 180ms;
        --hover-ease: cubic-bezier(0.16, 1, 0.3, 1);
    }

Concretely: delete every press and hover scale (H1, H2, H3), add the two missing hover tints (H4, H5, H6), and leave everything else alone. Focus already follows one pattern except the two deliberate exceptions below, which should stay.

## Keep

* Nav links, dropdown rows, Buy pill, kicker, seg tabs (inactive), card toggles and arrows, browse link, stamps, footer links, brew buttons, device chip, island and rail play buttons: hover is a color or background tint at 150 to 320ms, press adds nothing or a darker tint, focus is a 2 or 3px ring. All match the rule.
* Hero pills: hover tint plus the label blur morph carries the feedback; keep both, drop only the press scale.
* Kicker fade to 0.7 reads as one fading unit including the icon; keep.
* Learn-more arrow nudge (glyph translates 3px, link itself static, ../shots/droppy-hover-learnmore-hover.png): content motion on a 14px glyph, not control movement; keep.
* Droplet tile tint and marquee pause on hover; stamp tint plus marquee pause; creator platform-label recolor: small, content-level, keep.
* Brew copy morph to the copied state on press (verified `.is-copied` set in live probe); back-button tint: keep.
* FAQ open state (icon fills accent) and 3px focus ring: keep, add hover per H4.
* E2EE badge replaces the focus outline with an inner-chip highlight by explicit CSS (`outline:0` plus `.e2ee__badge:focus-visible .e2ee__badge-inner` recolor): deliberate, keep, but recheck the inner state live before calling it done.
* Carousel dot focus ring drawn on the track child instead of the button: unusual, visible, keep.
* Consent dialog itself: compact card, plain copy, two clear buttons (../shots/droppy-hover2-consent-bar.png); keep, fix the Accept hover per H6.

## Not checked

* `.yt-sound-toggle` live: zero instances on home; the rule exists for feature pages with video embeds.
* Download modal close, Discord, and meta-link hovers: the modal is absent from home markup, reviewed from CSS only.
* `.purchase-back` and the rest of the purchase flow: hidden flow, CSS only.
* `.tc-card` lift and `.tc-card__link` hover: CSS-read only; the probe instance sat under a covering consent-layer element so hover could not be applied live.
* Mobile nav sheet links and gnav dropdowns at 390px: desktop menu does not exist there; sheet choreography belongs to part 01.
* The "No thanks" consent button and "Cookie preferences" / "Privacy & cookies" links: seen in the banner screenshot, states not probed.
* Focus rings marked CSS above (hero pills, choice options, swatches, round buttons, showcase arrows, rail play, card toggles, browse link, Learn more, device chip, consent buttons): defined in stylesheets, not driven with keyboard modality in this pass.
* Safari and WebKit rendering of the rings and the color-mix Buy hover: Chromium only.
* `prefers-reduced-motion` interplay with hover transitions: not exercised; hover fades are opacity and color only, so risk is low (inference).
