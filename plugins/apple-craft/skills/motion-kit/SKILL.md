---
name: motion-kit
description: Finished, tuned motion for Apple-style web pages - springs, a shape that morphs (notch into panel), things that fly along an arc into a target and land with a catch bump, drag with spring-back, staggered lists in and out, one-time section entrances and pinned scroll scenes - in one small dependency-free file, all with Reduce Motion handled. Use for any animation or interaction on a product page instead of writing timing, easing or physics by hand, and whenever motion feels mechanical, linear, stiff or "web-like".
---

# Motion kit

Motion feel (timing, springs, how two shapes become one) is the hardest thing to get right and the easiest to get wrong. This kit ships it finished. Wire it up; don't re-invent it.

## Use it

- Copy `motion.js` next to your page and load it: `<script src="motion.js"></script>`. Everything is on the global `Motion`.
- `notch-shelf.html` is a complete reference built with it: a notch you drag files into, which grows into a shelf. Open it next to `mac-assets` (from `mac-props`) and try it before building. Copy its patterns, never its page.

## The parts

- **Springs:** `Motion.spring(from, to, onUpdate, preset)` animates any numbers. Presets: `snappy` (controls), `smooth` (panels, morphs), `bouncy` (landing in place, one small bounce), `gentle` (big moves), `flight` (objects travelling along a path). Pass a starting velocity to continue a gesture. A new animation on the same element takes over from the current one smoothly, so opening and closing can interrupt each other. Pick by name. Never change the numbers per page.
- **Morph:** `Motion.morph(el, { width, height, radius })` grows one element into a new size and corner radius. Use it whenever something opens out of something else (notch into shelf, button into panel). One element, never a second box placed underneath.
- **Fly to a target:** `Motion.flyTo(source, target, { scale, lift, from })` sends a copy along an arc; it tilts into the turn, shrinks, blurs slightly at full speed, and the target catches it with a squash. Hide the source the moment the flight starts. Use a negative `lift` to drop things back down.
- **Catch bump:** `Motion.catchBump(el)` for "it arrived" or "it's back" (a quick squash and settle).
- **Press:** `Motion.pressable(button)` shrinks a control while held and springs it back.
- **Drag:** `Motion.draggable(el, { targets: [{ el, radius, magnet, onEnter, onLeave, onDrop }] })` lifts the element and tilts it with its speed, pulls it towards a target when close (`magnet`, 0 to 0.5), lets the visitor flick it at a target, tells the target when it's near (grow it a little in `onEnter`), and springs home with the throw's momentum if it misses. Works with mouse, pen and touch.
- **Stagger:** `Motion.stagger(children, { show })` brings items in one after another, and out in reverse.
- **Reveal:** `Motion.reveal('[data-reveal]')` gives each section one entrance the first time it is seen. Put `data-reveal` on the headline group and the visual, not on every paragraph.
- **Scene:** `Motion.scene(section, p => …)` gives 0 to 1 progress through a pinned scroll section; `Motion.segment(p, a, b)` turns part of it into its own eased 0 to 1 for choreography.

## Choreography rules

- **Open:** the shape grows first (morph), then its content staggers in, starting about 140 ms in, not after the spring has fully settled (that feels laggy). **Close:** content out first, then the shape shrinks. Always both ways.
- **Arrive:** things fly in on an arc, not a straight line, and the receiver reacts (catch bump, count changes).
- **Near:** a target answers when something approaches it (grows slightly), so the visitor knows a drop will work.
- **Leave:** what left comes back the same way it went, reversed.
- **One motion at a time** per area; don't start a second animation on an element that is still moving.
- **Reduce Motion:** every function jumps to the end state. Don't add your own motion around it.

## What the notch-shelf reference adds

- A drop panel that opens the moment a drag starts, with a target tile that lights up under the file.
- The real panel material: black where it meets the notch, fading into frosted glass with the page blurred behind it.
- Round glass action buttons (done, clear) instead of text links.
- The notch's own shoulders (concave curves where it meets the top edge), so the shape looks like hardware, not a rounded box.
- Parked items peeking inside the closed notch as tiny real icons with a +N count, instead of a number badge.
- Taking items out by clicking or by pulling them down out of the shelf.
- Clear sending each item home on its own arc, a beat apart, while the shelf closes.
- Keyboard (Enter or Space on files and the notch, Escape to close) and Reduce Motion (everything jumps to its end state).

## Never

- `transition: all`, linear easing, or durations picked by hand for these interactions.
- A panel that fades in under a shape instead of growing out of it.
- Motion that only plays on page load, or anything that loops for decoration.
- Writing your own spring or drag code when this kit covers it.

## Check

Run `self-improve` and capture at least: the moment of approach (target reacting), mid-flight, landed, panel open, and closing. Each frame should be a good still, with nothing duplicated, seamed or left behind.
