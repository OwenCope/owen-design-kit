---
name: design-directions
description: Picking the right visual direction for a product that isn't an Apple-style product page - precise tool (Linear, Raycast), structured trust (Stripe), warm workspace (Notion), playful consumer (Duolingo), personal and editorial - with real measured values, motion, voice and how each one fails. Use when starting a site or app whose audience isn't served by apple-craft's default look, when a page looks right but wrong for its product, or when asked for a style "like Linear", "like Stripe" or "not so Apple".
---

# Design directions

Taste starts before any pixel: it's choosing the right direction for who the product is for. Apple's product-page look is one answer (that's `apple-design`). It's the wrong answer for a payments API, a kids' learning app or a developer's issue tracker. Pick the direction first, then design inside it.

Every number below was measured from the live sites on 2026-10-11. Screenshots and full measurements are in `research/<site>/`. Open them; read the reason, then make your own version. Copying a site's layout or colours onto another product is still a copy.

## Choosing

Ask three things:

1. **Who opens this, and how often?** Daily tools reward density and speed. One-time visitors reward clarity and one strong picture.
2. **What do they need to feel?** In control (tool), safe (money), at home (workspace), delighted (consumer), curious (personal).
3. **What's the product made of?** A real UI to show, a service with no UI, a character, a person's work.

Then pick the closest direction below and say in one sentence why. If none fits, make your own from the same parts (see the end). Mixing two directions on one page is how sites end up generic: pick one.

## Apple product page

For: a consumer product people buy once and should love on sight; Mac and iPhone apps.
It's `apple-design`, `web-design` and `mac-props`. Not repeated here.

## Precise tool (Linear, Raycast)

For: professionals who live in the product daily: developers, designers, operators. They respect speed and hate fluff.

What makes it:

- **Very dark, almost no colour.** Linear's page is `#08090A` with `#F7F8F8` text, secondary `#8A8F98`, muted `#62666D`. Raycast is `#07080A`. One accent at most, used rarely (Raycast's red `#FF6363`).
- **Hairlines, not boxes.** Borders are `rgba(255,255,255,0.08)` or less. Panels are only slightly lighter than the page (`#0F1011`).
- **Inter, medium weight, tight.** Linear's h1 is 64 px, weight 510, letter-spacing about -0.022em; body 15 px / 24 px. Raycast adds a monospace face for small labels.
- **Small controls.** Buttons are 32 px (nav) and 44 px (hero), pill-shaped, light grey `#E5E5E6` with near-black text. Raycast's are 36 px with an 8 px radius and a keycap-like layered shadow.
- **The product is the hero.** Linear puts a full, real screenshot of the app straight under the headline, edge to edge. Raycast shows the real launcher window.

Motion: quick and quiet. Transitions about 160 ms on Linear's pills and 200 ms on Raycast's buttons (plus a 100 ms transform); Raycast's hover just lifts the button from `#E6E6E6` to white. Entrances are subtle fades on scroll. Ambient motion stays tiny (a slow glow, twinkling stars) and never covers text.

Voice: short, confident, a little dry. "Your shortcut to everything." "The product development system for teams and agents." No exclamation marks, no "unlock your potential".

How it fails: dark-mode-by-default on a product that isn't a tool; neon gradients and glow everywhere (that's the AI look, not Linear); grey-on-grey text below contrast; a fake dashboard instead of the real app.

## Structured trust (Stripe)

For: products that move money, data or infrastructure for businesses. The buyer needs to trust it and understand it, often with a developer and a finance person both reading.

What makes it:

- **Light, ordered, with one vivid signature.** White and `#F6F9FC` pages, dark navy text `#061B31` / `#0A2540`, body `#425466`, one violet `#533AFD` / `#635BFF` for actions. The colour lives in one place: an animated silk-ribbon gradient (a canvas) in the hero.
- **Light weights at large sizes.** Söhne at weight 300 for headlines (48 px, -0.02em). Big type that doesn't shout.
- **Small, precise corners.** 4 px on buttons and inputs, 6 to 8 px on cards. Pricing uses pills (16.5 px radius) as a deliberate change.
- **Long, soft, bluish shadows.** `rgba(50,50,93,0.25) 0 30px 60px -12px` with a darker close shadow. Cards float without heavy edges.
- **Proof everywhere.** Real dashboard and checkout UI in browser frames, a live counter ("Global GDP running on Stripe: 1.73%"), customer logos, big numbers on a navy band.
- **Mega menus and long docs.** Five-column product menu; docs in system font at 14 px with Menlo code blocks on dark navy.

Motion: smooth and expensive-feeling, never bouncy. `cubic-bezier(0.25,1,0.5,1)` at 300 ms on controls; section media eases in over about 800 ms with `cubic-bezier(0.165,0.84,0.44,1)`. Nav links fade to 60 % on hover.

Voice: specific and plain about money and outcomes. "Financial infrastructure to grow your revenue." Numbers do the convincing. Two buttons: start, or talk to sales.

How it fails: copying the ribbon gradient (it's Stripe's signature, not a style); rainbow gradients on every section; bento grids of vague icons instead of real UI; pricing that hides the price.

## Warm workspace (Notion)

For: tools people organise their life or team in. Many kinds of users, not all technical. It should feel like a friendly room, not a machine.

What makes it:

- **White with warm greys.** Text is near-black at partial opacity (`rgba(0,0,0,0.9)`), dividers a warm `#A39E98`, surfaces `#F9F9F8`. One calm blue `#0075DE` for actions.
- **Very large, very tight headlines.** h1 96 px, weight 600, letter-spacing about -0.05em. Body stays a plain 16 px / 24 px.
- **Hand-drawn character.** Loose black line doodles of faces and figures at the edges of the product shot, small flat spot illustrations in yellow, red and green, duotone portraits in testimonials.
- **Real product, softly framed.** The actual app in a rounded card with a large soft shadow, overlapping the hero.
- **Plain controls.** 8 px corners everywhere, no button shadows, 36 to 38 px buttons. Secondary button is a pale blue `#E6F3FE` with blue text.

Motion: almost none. No scroll reveals were found; a rotating word in the headline, a slow logo marquee and a nav shadow that appears on scroll. The warmth comes from drawing, not movement.

Voice: friendly, short, human. "It's time." "Where teams and agents ship together." Buttons say what you get: "Get Notion free".

Figma: a recreated Notion UI kit is at https://www.figma.com/design/YvEDWpVXFX07ajCvh2ypJo/Notion-UI---Free-UI-Kit--Recreated---Community- for reading exact spacing and components through the Figma MCP.

How it fails: doodles with no point (stickers on a layout); cartoon style on a serious product; warm greys that drop text contrast; copying the illustration style itself, which is Notion's identity.

## Playful consumer (Duolingo)

For: everyday consumers, including kids, where habit and fun are the product.

What makes it:

- **One loud brand colour, used boldly.** Green `#58CC02` for headlines, the main button and the whole footer; bright blue `#1CB0F6` for secondary actions; full-width bands in pale blue `#DDF4FF` and deep navy `#100F3E`.
- **A custom rounded typeface** for headings, chunky and friendly; body at 17 px.
- **Chunky, tactile buttons.** 50 px tall, 12 px radius, uppercase bold labels with letter-spacing, and a 4 px darker bottom edge that makes them look pressable. No shadows anywhere else.
- **A mascot and flat characters.** Thick simple shapes, saturated fills, no outlines. The product (a phone app) is shown in illustrated phone mockups, not screenshots.
- **One idea per band.** Each section is one short green headline ("free. fun. effective.") and one illustration.

Motion: bouncy and celebratory inside the app; on the site, short entrances (300 ms) and a brightness lift on hover. Delight comes from characters, not effects.

Voice: enthusiastic and simple, even an exclamation mark. "The most fun way to learn languages, chess, and more!" Buttons in caps: "GET STARTED".

How it fails: playful styling on a product people use for serious work; a mascot that's decoration, not character; five bright colours fighting instead of one owning the page.

## Personal and editorial (rauno.me, Teenage Engineering)

For: a person's portfolio, a studio, a brand that sells taste itself. See `site-gallery`.

What makes it: one unexpected idea carried all the way. Rauno's page is a giant headline with one yellow circle and a crosshair cursor. Teenage Engineering is black-and-white photography with thin line icons and tiny type. Rules are broken on purpose, and everything else is held very still so the one idea reads.

How it fails: breaking rules with no idea behind it; experimental navigation that hides the content; this direction used for a product people need to understand quickly.

## Making your own

When no direction fits, build one from the same parts, in this order:

1. **Background and text:** how light or dark, warm or cool. Body text needs at least 4.5:1 contrast against what's behind it, large headlines 3:1; check with the browser's contrast picker. Build greys in OKLCH (same hue, step the lightness) so they stay even, and make dark mode its own palette, not an inverted one.
2. **One action colour.** Only one.
3. **Typeface and headline treatment:** one family is usually enough; two at most (one for headings). Body 15 to 18 px with line-height about 1.5. Headlines get tighter tracking as they grow (about -0.02em at 48 px, -0.04em at 96 px) and tighter line-height (1.0 to 1.1). Use tabular figures for numbers that change or line up.
4. **Corners and edges:** sharp, soft or round; hairlines or shadows.
5. **How the product is shown:** real UI, illustration, photography, or a person.
6. **Motion character:** quiet, smooth, bouncy, or none.
7. **Voice:** write the hero line before designing the hero.

Write these seven lines into the project's `DESIGN-NOTES.md` (see `new-project-setup`) so later sessions keep to them.

## Voice by direction

| Direction | Sounds like | Never |
|---|---|---|
| Apple product page | "Unlock your Mac with a look." | Jargon, feature lists in the hero |
| Precise tool | "Your shortcut to everything." | Hype, emoji, exclamation marks |
| Structured trust | "Accept payments online, in person, and around the world." | Vague promises, hidden prices |
| Warm workspace | "It's time." | Cold technical language |
| Playful consumer | "The most fun way to learn languages, chess, and more!" | Corporate tone, long sentences |
| Personal | Whatever the person actually sounds like | Generic bio lines ("passionate about design") |
