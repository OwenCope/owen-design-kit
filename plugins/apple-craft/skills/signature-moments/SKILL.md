---
name: signature-moments
description: How to be creative without looking generic - finding the one memorable, on-brand moment a product site or app deserves (like sakura petals that drift across the page and gather into the app icon as you scroll), then building it so it feels Apple-quality - fast, purposeful, ending on the real product, with Reduce Motion handled. Includes a ready-made "gather into the icon" particle scene. Use for every landing page, product page and first-run screen, and whenever a page or app feels plain, correct but forgettable, or "the same as every other site", when asked to make something "cool", "creative" or "memorable", or before adding any showpiece animation.
---

# Signature moments

Clean and correct isn't enough: a page can pass every rule and still be forgettable. Apple's pages each have one moment people remember. Give every product one, and only one, that could only belong to it.

## Finding the idea

Don't take the first idea, and don't pick from the examples below; they show the bar, not a menu.

1. **List what the product is made of**: its name, icon and colour; the physical thing it's named after; what it does as a verb (copies, unlocks, catches, stacks, forms); the feeling after using it.
2. **Write at least three different concepts**, one sentence each, built from that list. Make at least one of them uncomfortably ambitious.
3. **Score each 1 to 5 on four things:** only this product could have it; it says the headline without words; someone would describe it to a friend; it can be built well in a day. Pick the highest total, preferring the bolder one on a tie.
4. **Show the person the three concepts and your pick** in a few lines, then build it.

SakuraCord worked because the question "what is this made of?" gave petals, and petals gathering into the icon says "many pieces, one native app" with no words.

## What counts

A signature moment **moves and responds**: to scroll, to the pointer, to what the person does on the page. It is the **centrepiece of its section**, full width or full screen, not a caption under a picture.

These do **not** count, and fail review:
- A static picture with "try it" under it.
- A feature you could show with a screenshot.
- Hover effects, fades on scroll, parallax, gradients, floating blobs.
- Repeating the hero picture bigger.

## Ideas at the right level, for different kinds of app

They show the ambition to aim for; don't copy them.

- **Clipboard history:** the words you select on the page peel off and fly up into the menu bar icon, which bounces; scrolling then fans the whole history out of the icon like a deck of cards, newest on top.
- **Face unlock:** the lock screen's notch reads the visitor's cursor as a face. A scan line sweeps, the padlock opens and the page itself "unlocks" into the next section.
- **Notes app:** the headline is typed live; scrolling turns the paragraphs into a tidy outline, then folds them into the app icon.
- **Weather:** the page's own background is today's sky, and scrolling moves through the day, sunrise to night.
- **Music player:** the section's colours and motion follow a song's beat as it plays when the person presses play.

## Patterns that have worked

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
- **The objects look like the thing they're named after.** Pebbles are smooth, shaded stones with a contact shadow, not grey capsules; petals are petals. Flat UI chips make a physical idea read as tags.
- **Fill the stage.** The moment is the composition: the action happens across the middle of the screen, not along one edge with empty wallpaper above it.
- **Never cover the words.** Moving objects pass behind the headline or steer around it. A pebble sitting on top of the headline makes the page look broken.
- **Physically believable.** If it's a physical thing, it behaves like one: long objects topple and lie flat instead of standing on their ends against a wall; things settle, they don't hover. Keep labels short enough to fit the object without turning it into a pill.
- **Every frame is a good still.** Scrub through the moment and judge each frame as if it were a poster. The first frame shouldn't be an empty stage, the middle shouldn't be clutter, and no frame should look like something went wrong.
- **Land the ending.** The last frame is the payoff: the product, centred and big enough to read, filling the space the moment emptied. A small window in a corner of a bare wallpaper is an anticlimax.
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
