---
name: signature-moments
description: How to be creative without looking generic - finding the one memorable, on-brand moment a product site or app deserves that could only belong to that product, then building it so it feels Apple-quality - fast, purposeful, ending on the real product, with Reduce Motion handled. Use for every landing page, product page and first-run screen, and whenever a page or app feels plain, correct but forgettable, or "the same as every other site", when asked to make something "cool", "creative" or "memorable", or before adding any showpiece animation.
---

# Signature moments

Clean and correct isn't enough: a page can pass every rule and still be forgettable. Apple's pages each have one moment people remember. Give every product one, and only one, that could only belong to it.

## Finding the idea

Don't take the first idea, and don't pick from the examples below; they show the bar, not a menu.

1. **List what the product is made of**: its name, icon and colour; the physical thing it's named after; what it does as a verb (copies, unlocks, catches, stacks, forms); the feeling after using it.
2. **Write at least three different concepts**, one sentence each, built from that list. Make at least one of them uncomfortably ambitious.
3. **Score each 1 to 5 on four things:** only this product could have it; it says the headline without words; someone would describe it to a friend; it can be built well in a day. Pick the highest total, preferring the bolder one on a tie.
4. **Show the person the three concepts and your pick** in a few lines, then build it.

### From verb to moment

Start from the verb the product performs for the person: counts down, unlocks, parks, catches, translates.
Ask what that verb would look like happening to the page itself, not to a picture of the product.
Make the visitor cause it: scroll, pointer, typing, selecting text.
The page becomes the product's material.
If you remove the verb and the moment still works, it is not the moment.

SakuraCord worked because the question "what is this made of?" gave petals, and petals gathering into the icon says "many pieces, one native app" with no words.

**That idea is taken.** Particles, drops, petals or any shape drifting and gathering into an app icon is SakuraCord's moment, and using it for another product fails review, however it's reskinned. So does anything else listed below as an example. If your concept could be described as "X gathers into the icon", start again.

**The test:** cover the product's name. Could the moment belong to any other app? If yes, it isn't a signature. A countdown app's moment should be about time running out; a face unlock's about being recognised; it comes from what the product *does*, not from a decorative material.

### Worked examples (reasoning, not ideas to copy)

These are here to show the thinking. Do not reuse them.

- **Meeting countdown in the notch.** Verb: counts down. The page's own scroll length is the meeting's remaining time. A full-screen Mac scene keeps the notch visible at top; the time left in it shrinks as you scroll. At the end the chime rings visually as a soft pulse through the whole page and the call window opens. The visitor's scrolling is time passing. Only a countdown owns the feeling of time running out.
- **Clipboard manager.** Verb: keeps what you copy. The page holds real sentences worth selecting. Each time the visitor selects text, a dated slip stays pinned where it was and a copy stacks on a shelf at the edge. Scrolling back walks the shelf in order. Only a clipboard manager keeps every copy.
- **Password manager.** Verb: hides until it trusts you. The section's logins render as scrambled glyphs. While the visitor presses and holds anywhere, the glyphs settle line by line into real usernames; release and they scramble again. It ends on the open vault. Only a password manager decides what you may read.
- **Screenshot tool.** Verb: frames. The visitor drags a rectangle over the page itself. Everything outside the drag dims, edge rulers read the pixel size, and on release the real editor opens with that exact shot inside. Only a screenshot tool frames the screen.
- **Focus timer.** Verb: quiets. The section starts noisy: badges, tickers, banners at the margins. As the visitor scrolls, each metre of scroll clears one layer until only one line of work stays centred. Then the timer UI takes over. Only a focus timer trades passing time for quiet.
- **Menu bar weather app.** Verb: tells the sky. A thin hour strip sits under the headline. As the visitor drags across it, the section's light, shadows and a small street scene shift to that hour's weather. It ends on the menu bar forecast. Only a weather app owns the light.

### Red flags in your own concept

- It would still work if you swapped the product name.
- It is decoration on top of a screenshot.
- It needs a paragraph to explain.
- It ends on anything other than the real product UI.
- It only plays once on load.
- It uses the same technique as the last site you made.
- It covers the headline.

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

- **Gather into the icon** (SakuraCord's, taken; shown only so you know not to reuse it): particles drift, then form the app icon on scroll. Code in `examples/gather-into-icon.js` exists for SakuraCord's own site, not as a starting point.
- **Zoom into the real feature:** start on the whole device, then zoom until the screen *is* the page and the real UI takes over (see `onboarding-design`).
- **The product working on the page:** copy text on the page and it appears in the clipboard app's panel; hover a song and the player shows it.
- **A statement that lights up as you read**, but only when the words are the point. It's a known Apple pattern, so it marks a site as a copy if every site you make has it.

## Rules

Build the moment with `motion-kit` (morph, flyTo, draggable, scene); `motion-kit/notch-shelf.html` shows a full one working.


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

## How SakuraCord built "gather into the icon" (reference for the technique, not the idea)

1. A section about 300vh tall with a sticky full-screen stage inside it; a `<canvas>` fills the stage, and the headline sits on top.
2. On scroll, set `scene.progress` from 0 to 1 as the section passes.
3. First half: the shapes drift and sway across the whole screen. Second half: each flies to its own point of the icon, staggered so they don't move as one sheet, taking on the icon's colour as it arrives.
4. Last few per cent: the real icon fades in underneath while the shapes, trimmed to the icon's outline, fade out. It ends crisp, with no fuzzy ring.
5. The technique (sticky stage, scroll progress, staggered motion, crisp handover) carries to other ideas; the gathering-into-the-icon idea does not.

## Check before showing

- Scroll through it slowly and quickly, in light and dark, on a phone, and with Reduce Motion on.
- Capture frames at the start, the middle and the end, and zoom into the end state.
- Ask: would someone describe this to a friend? Does it belong only to this product?
- Write the friend sentence ("the page where scrolling ..."). If it does not start with the product's verb, start over.
- Capture five frames of the moment and check each is a good still.
- Run `design-review`.
