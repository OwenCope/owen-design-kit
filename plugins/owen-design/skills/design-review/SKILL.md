---
name: design-review
description: A strict step-by-step review to run on any screen, page, component, picture or post before showing it to Owen or shipping it — catches the things he rejects (AI look, non-native controls, clutter, long layouts, fake pictures, weak copy, missing motion). Load after building any UI, before every release, and whenever asked "is it good?", "does it look right?" or "make it good".
---

# Design review — run this before Owen sees anything

Do it for real: build, open, screenshot, and look at the actual pixels at full size. Reviewing code alone does not count.

## Step 1 — Capture
- App: a review copy (never the owner's configured app), in light **and** dark, normal and narrow window, Reduce Motion on and off.
- Web: desktop (~1440 px) and phone (~375 px), light and dark if supported, keyboard-tab through it once.
- Hover every control; watch every transition once.

## Step 2 — Score each item (pass / fix)
1. **Apple test.** Put it next to the Apple screen it's modelled on. Would it look out of place? Name the Apple reference.
2. **Native.** Every control is the platform's own, in the product's one button style and size.
3. **One primary action**, labelled with a verb, and nothing duplicated.
4. **Real pictures.** Real, new, relevant, crisp, no black frame, no nested buttons, no test data.
5. **Hierarchy.** At a glance: what is this, what do I do? One headline, one line of support, then the action.
6. **Space.** Nothing long, stretched, tall or crammed. Consistent spacing steps. Aligned edges.
7. **Words.** Every string passes `product-writing` (short, plain, verbs, no jargon). Read them all aloud.
8. **Motion.** Hover/press feedback on all interactive things, whole-control hit area, smooth curve, off under Reduce Motion.
9. **States.** Loading, empty, error, disabled and success all designed — not just the happy path.
10. **Accessibility.** Labels, focus, contrast, text read once, tap targets ≥ 44 px on web.
11. **Leftovers.** No ghost windows, stray shadows, debug text, placeholder copy, console noise.
12. **Consistency.** Matches the approved patterns in `design-patterns`. Anything new looks like it always existed.

## Step 3 — Fix, then re-capture
Fix every "fix", re-screenshot, re-score. Only a full pass goes to Owen.

## Step 4 — Report to Owen
- Show the screenshot(s).
- One line per notable change.
- Say what couldn't be checked (e.g. "not tried on a real lock screen").

## Common failures to hunt for first
- A control you styled by hand → replace with native.
- A second button doing the same job → delete.
- A drawn illustration of real software → real screenshot.
- Text over two lines where one would do → cut.
- Picture from an older release → capture a new one.
- Hover only works in the middle of the button → `contentShape`.
