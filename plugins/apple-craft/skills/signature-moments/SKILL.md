---
name: signature-moments
description: How to be creative without looking generic - finding the one memorable, on-brand moment a product site or app deserves (like sakura petals that drift across the page and gather into the app icon as you scroll), then building it so it feels Apple-quality - fast, purposeful, ending on the real product, with Reduce Motion handled. Includes a ready-made "gather into the icon" particle scene. Use for every landing page, product page and first-run screen, and whenever a page or app feels plain, correct but forgettable, or "the same as every other site", when asked to make something "cool", "creative" or "memorable", or before adding any showpiece animation.
---

# Signature moments

Clean and correct isn't enough: a page can pass every rule and still be forgettable. Apple's pages each have one moment people remember. Give every product one, and only one, that could only belong to it.

## Finding the idea

1. **Start from the product's own world**: its name, icon, colour, story. SakuraCord is named after cherry blossom, so the petals were obvious once someone asked "what is this product made of?" A clipboard app might stack copied snippets into its icon; a weather app might let rain fall into the page; a face-unlock app might sweep a scan line across a face.
2. **Make it carry the message.** The petals gather into the icon while the headline says "Everything you love about Discord, native on your Mac". The motion says the same thing as the words: many small pieces becoming one native app.
3. **End on the real thing.** The moment resolves into the real icon, the real window or the real feature, never just decoration that fades away.
4. **Write the idea in one sentence before building it.** If it takes a paragraph to explain, it's too much.

## Good moments

- **Gather into the icon:** particles of the brand's own shape drift, then form the app icon on scroll and dissolve into the real icon. Code in `examples/gather-into-icon.js`.
- **Zoom into the real feature:** start on the whole device, then zoom until the screen *is* the page and the real UI takes over (see `onboarding-design`).
- **The product working on the page:** copy text on the page and it appears in the clipboard app's panel; hover a song and the player shows it.
- **A statement that lights up as you read**, but only when the words are the point. It's a known Apple pattern, so it marks a site as a copy if every site you make has it.

## Rules

- **One per page.** Two showpieces fight; the second makes both feel cheap.
- **Never reuse a signature from another product you made.** A site with the same tricks as your last one reads as a recolour, and people notice.
- **Scroll-driven, not time-driven,** so the person stays in control. Never hijack the scroll; use a tall section with a sticky stage and read the scroll position.
- **Fast:** draw on a canvas, cap the pixel ratio at 2, scale the particle count to the screen width, and stop drawing when the section is off screen (IntersectionObserver).
- **Light and dark:** read the appearance and rebuild colours and images when it changes.
- **Reduce Motion:** show the end state, a still image of the real icon or feature. Never just a blank space.
- **No hover-and-wiggle filler:** bouncing icons, floating blobs, parallax layers and gradient orbs are the generic version of this. They carry no message.
- **The real end state must be pixel-perfect:** the formed icon has to line up exactly with the real icon it dissolves into, or the handover jumps. Zoom in to check.

## Building "gather into the icon"

1. A section about 300vh tall with a sticky full-screen stage inside it; a `<canvas>` fills the stage, and the headline sits on top.
2. On scroll, set `scene.progress` from 0 to 1 as the section passes.
3. First half: the shapes drift and sway across the whole screen. Second half: each flies to its own point of the icon, staggered so they don't move as one sheet, taking on the icon's colour as it arrives.
4. Last few per cent: the real icon fades in underneath while the shapes, trimmed to the icon's outline, fade out. It ends crisp, with no fuzzy ring.
5. Swap the `petal` shape for one from your brand.

## Check before showing

- Scroll through it slowly and quickly, in light and dark, on a phone, and with Reduce Motion on.
- Capture frames at the start, the middle and the end, and zoom into the end state.
- Ask: would someone describe this to a friend? Does it belong only to this product?
- Run `design-review`.
