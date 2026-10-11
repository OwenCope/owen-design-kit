# Notion.com (home) — design measurements

Captured 2026-10-11, Chromium 1440x900 (deviceScaleFactor 1, desktop Chrome UA), load + 3 s wait. Page height 4687 px.

## Hero copy (exact)
- H1: "Where teams and agents Ship together."
- The verb is a rotating word in a pill ("Ship" seen at measure time, "Build" in full screenshot).
- Subhead: "Capture context, find answers, and automate tasks with AI built for your team."
- Buttons: "Get Notion free", "Request a demo"

## Typefaces and size scale
- Body stack: NotionInter, Inter, -apple-system, system-ui, Segoe UI, Helvetica, Arial, sans-serif. Body 16 px / 24 px.
- H1 96 px / 100 px, weight 600, letter-spacing -4.6 px.
- H2 54 px / 56 px, weight 700, letter-spacing -1.88 px.
- H3 22 px / 28 px, weight 700, letter-spacing -0.25 px.
- Size census (elements): 16 px (535), 14 px (107), 24 px (45), 12 px (22), 20 px (12), 22 px (10), 40 px (10), 72 px (3), 18 px (3), 54 px (2), 96 px (1), 42 px (1).
- Tight negative tracking on display sizes only; body copy tracking normal.

## Palette (hex, with uses)
- #FFFFFF page background, nav, footer.
- #0D0D0D (rgba(0,0,0,0.95), 322 hits) display text.
- #141414 (rgba(0,0,0,0.898), 549 hits) body text.
- #404040 (rgba(0,0,0,0.75)) secondary text.
- #A39E98 warm gray borders/dividers (90 hits).
- #615D59 muted text (30 hits).
- #0075DE primary button blue, white text.
- #005BAB primary hover blue; also secondary-button text.
- #097FE8 link/interactive blue (17 hits).
- #E6F3FE secondary-button background.
- #F9F9F8 warm off-white surfaces.
- Accent illustrations only: #FFB110 yellow, #F64932 red, #1AAE39 green, #D0F4D8 mint, #FEF3F1 pink tint, #FFF5E0 cream, #F2F9FF blue tint.
- Full tatami token ramp exposed as :root custom properties (--tatami-color-{gray,red,orange,yellow,teal,blue,purple,green,pink,brown} 100-900, radius 0 / .25 / .3125 / .375 / .5 / .625 / .75 / .875 / 1rem, round 624.938rem).

## Content width and section spacing
- Hero container width 1252 px; other container samples 1229 px, 655 px.
- 4 main sections; gaps between tall sections 0, 0, 12 px (sections stack edge-to-edge).
- Footer padding 80 px top, 24 px bottom.

## Radii
- 8 px dominant (90: buttons, cards, inputs). 4 px (22), 12 px (18), pill 9999 px (7), 100 % (3 avatars/dots), 16 px (2).

## Shadows
- Card shadow (7 uses): layered soft `rgba(0,0,0,0.01-0.04) 0 0.175px 1px, 0 0.8px 2.9px, 0 2px 7.8px, 0 4px 18px`.
- One large hero shadow up to 36 px blur / 89 px spread on the product screenshot card.
- Buttons have no shadow.

## Buttons
- Primary: #0075DE bg, white text, 16 px / 500, radius 8 px, heights 36 px (nav, padding 4px 14px) and 38 px (hero, padding 6px 15px), 1 px transparent border.
- Secondary: #E6F3FE bg with #005BAB text, same size/radius.
- Tertiary (page bottom): white bg, #097FE8 text.
- Transition: background-color + color 0.2 s cubic-bezier(0.42, 0, 1, 1).

## Nav
- 64 px tall, white, 16 px links: Product (dropdown), Resources (dropdown), Pricing, Request a demo, Log in + blue "Get Notion free" CTA.
- Nav gains a 1 px bottom shadow on scroll (box-shadow transition 0.2 s cubic-bezier(0.42,0,1,1), keyed animation navShadowScrolled).

## Hover behaviour
- Primary button hover: background #0075DE to #005BAB, text stays white, no transform/shadow change.
- Nav links: no measurable hover change on the sampled link.

## Scroll and entrance animations
- Scroll probe (600 px steps, 500 ms pauses): zero sampled elements changed opacity or transform.
- document.getAnimations at load and after scroll identical: one 1-iteration linear NAV animation plus DIV animations including one 60000 ms linear infinite (logo marquee / rotating hero word). No scroll-triggered reveals detected.

## Illustration style
- Hand-drawn black line doodles (loose faces and figures, ~2-3 px strokes, black on white) tucked at the edges of the hero product shot.
- Small flat accent illustrations (160x170) flanking the H1.
- Testimonial cards use duotone-tinted portrait photography (solid red, blue, yellow overlays with white quote text).
- Customer logo strip in monochrome gray.

## Product UI presentation
- Full Notion app screenshot ("Ramp HQ" kanban workspace) in a rounded browser-chrome card with the large soft hero shadow, overlapping the hero and first section.
- Feature sections show cropped real product UI (Meetings table, H2 Deal Flow Dashboard with charts, Engineering Tasks board, Coding Agent chat) inside soft-gray rounded panels.
- One 958x599 hero video (MP4, CTF assets) with JPG poster; 60 img / 27 svg total, 15 images larger than 120x120.
