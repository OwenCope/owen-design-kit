# Duolingo.com (home) — design measurements

Captured 2026-10-11, Chromium 1440x900 (deviceScaleFactor 1, desktop Chrome UA), load + 3 s wait. Page height 7803 px. No cookie banner encountered.

## Hero copy (exact)
- H1: "The most fun way to learn languages, chess, and more!"
- No subhead (no paragraph follows the H1; hero is H1 plus two buttons).
- Buttons: "GET STARTED" (DOM text "Get started", uppercased in render), "I ALREADY HAVE AN ACCOUNT"

## Typefaces and size scale
- Body: sans-serif fallback stack, 17 px / 20 px, #3C3C3C on white.
- Headings: duolingo-sans (H1 32 px / normal, weight 700, #4B4B4B) and feather display face (H2 48 px, weight 700, #58CC02 green).
- No H3 elements on the page (count 0).
- Size census (elements): 17 px (3922), 15 px (66), 48 px (7), 64 px (2), 14 px (2), 32 px (1).
- Button labels: 15 px, weight 700, letter-spacing 0.8 px, uppercase.

## Palette (hex, with uses)
- #FFFFFF page background and secondary-button fill.
- #3C3C3C primary text (7640 hits).
- #777777 secondary text (264 hits).
- #4B4B4B headings (34 hits).
- #58CC02 brand green: H2 text, footer background, primary CTA face (19 hits).
- #1CB0F6 bright blue: secondary CTA text, links (8 hits).
- #AFAFAF muted text (14 hits).
- #E5E5E5 hairline borders.
- #0000EE default link blue (4 hits, early-paint links).
- Section bands: #DDF4FF pale blue (feature bands), #100F3E deep navy (Super Duolingo promo band, 900 px tall), #58CC02 green footer (~827 px).
- Deep illustration blues #042C60, #000437.
- No :root custom properties surfaced (CSS-modules build, rootVars {}).

## Content width and section spacing
- Hero container width 988 px; inner content samples 473-530 px.
- 11 sections; gaps between tall sections 0, 0, 0, 96, 0, 0, 96 px (banded full-bleed sections separated by 96 px spacers in places).
- Header reserves 70 px top padding for the fixed nav.

## Radii
- 12 px only (7 uses: both hero CTAs and cards). No other radius values detected.

## Shadows
- No box-shadows detected. The signature 3D button edge is a 4 px solid bottom border (computed color transparent in headless Chromium; renders as a darker shade of the button face in screenshots).

## Buttons
- Primary CTA: 330x50 px, radius 12 px, green face (visually #58CC02 family) with darker 4 px bottom edge, white 15 px / 700 / 0.8 px-spacing uppercase label, padding 0 16 px.
- Secondary: same 330x50 size and 12 px radius, white fill, #1CB0F6 uppercase label.
- Caveat: getComputedStyle reports transparent background-color on the anchor, its child span, and ancestors in headless Chromium, so the exact green fill token could not be read from computed styles; the rendered color matches the #58CC02 brand token used for footer and H2s.
- Transition: filter 0.2 s.

## Nav
- 70 px tall transparent bar: green owl + "duolingo" wordmark left, "SITE LANGUAGE: ENGLISH" dropdown right. No cta in nav.
- Bottom course strip with flag icons: ENGLISH, CHESS, MATH, SPANISH, FRENCH, GERMAN, ITALIAN, PORTUGUESE.

## Hover behaviour
- Primary CTA hover: filter brightness(1.1); no transform, background, shadow, or border change measured 400 ms after hover.
- Nav/course-strip links: no measurable hover change on the sampled link.

## Scroll and entrance animations
- document.getAnimations at load: two DIV entrances, 300 ms, ease, 1 iteration; identical set after scrolling.
- Scroll probe (600 px steps, 500 ms pauses): one IMG changed computed opacity/transform; no broad reveal system detected.

## Illustration style
- Flat chunky cartoon: Duo the green owl plus diverse kid/adult characters, coins, gems, floating phone mockups; thick simple shapes, bright saturated fills, no outlines.
- Splash art ships as large SVGs (530x530 tiles, one 2000x1122, one 1440x949); 53 img / 8 svg total, 8 images and 4 SVGs larger than 120x120.
- No Lottie player, video, or canvas elements detected.

## Product UI presentation
- Product shown as floating illustrated phone mockups (app screens, streak/gem UI) inside the "learn anytime, anywhere" band, not as literal screenshots.
- Feature bands pair one-line green headlines ("free. fun. effective.", "backed by science", "stay motivated", "personalized learning") with a single spot illustration each.
- Social proof is press-logo and stats driven; page closes on green "learn a language with duolingo" band with coins illustration over the green footer.
