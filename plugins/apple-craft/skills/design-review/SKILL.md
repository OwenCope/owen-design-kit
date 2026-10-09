---
name: design-review
description: A strict, step-by-step review of any screen, page, component, picture or post before it is shown to anyone or shipped. Catches what people reject on sight - the AI look, non-native controls, clutter, long layouts, fake pictures, weak copy, missing motion and missing states. Use after building any UI, before every release, and whenever asked "is it good?", "does it look right?" or "make it good".
---

# Design review

Do it for real: build, open, screenshot, and look at the pixels at full size. Reviewing code alone does not count.

## Size the review to the change

- **Small change** (one row, one string, one colour): capture that screen in light and dark and score only items 2, 5, 6, 7, 8, 10, 11 and 12. Mark the rest N/A.
- **New screen or flow:** the full review below.
- **Release pictures and posts:** items 4, 6, 7 and 11, plus `release-notes`.

## Step 1: Capture

- **App:** a review copy, never the person's own configured app. Light and dark, normal and narrow window, Reduce Motion on and off.
- **Web:** desktop (about 1440 px) and phone (about 375 px), light and dark if supported. Tab through it once with the keyboard.
- Hover every control and watch every transition once.

## Step 2: Score each item (pass or fix)

1. **Apple test.** Put it next to the Apple screen it's modelled on. Would it look out of place? Name the reference.
2. **Native.** Every control is the platform's own, in the product's one button style and size.
3. **One primary action**, labelled with a verb, and nothing duplicated.
4. **Real pictures.** Real, new, relevant, crisp, no black frame, no nested buttons, no test data.
5. **Hierarchy.** At a glance: what is this, and what do I do? One headline, one line of support, then the action.
6. **Space.** Nothing long, stretched, tall or crammed. Consistent spacing steps and aligned edges.
7. **Words.** Every string passes `product-writing`. Read them aloud.
8. **Motion.** Hover and press feedback on everything interactive, a whole-control hit area, a smooth curve, off under Reduce Motion.
9. **States.** Loading, empty, error, disabled and success are all designed, not just the happy path.
10. **Accessibility.** Labels, focus, contrast, text read once, touch targets at least 44 px on the web.
11. **Leftovers.** No ghost windows, stray shadows, debug text, placeholder copy or console errors.
12. **Consistency.** Matches `design-patterns` and the rest of the product. Anything new looks like it always existed.

## Step 3: Fix, then capture again

Fix every "fix", re-screenshot and re-score. Only a full pass gets shown.

## Step 4: Report

- Show the screenshots.
- One line per notable change.
- Say what couldn't be checked ("not tried on a real lock screen").

## Hunt for these first

- A control styled by hand: replace it with the native one.
- A second button doing the same job: delete it.
- A drawn illustration of real software: use a real screenshot.
- Text on two lines that fits on one: cut it.
- A picture from an older release: capture a new one.
- Hover that only works in the middle of a button: fix the hit area (`contentShape` in SwiftUI, padding on the link on the web).
- Leftover effects from another product's design: a site or app should have its own signature pieces.

## Reference pictures

Real, approved examples live in `examples/` next to this file. Open them and compare side by side.

| File | What it shows | What to copy |
|---|---|---|
| `good-update-card.png` | Settings > Updates in a Mac app (a test copy, so it says 0.1.0; fine for review, never in public pictures) | Section first, one row with Check Again, a centred card: icon, name, one blue Install, a real picture, short notes |
| `good-tourkit-page.png` | A setup page | Media on top, dots at its bottom, bold title, one line of text, one full-width blue button, close in the corner |
| `good-real-screenshot-with-native-toggle.png` | Accessibility setup | A real System Settings screenshot with the real switch on it, never a drawn copy |
| `good-release-picture.png` | A release picture | A tight crop of the real UI showing the release's main change, no frame |
| `good-edge-light-glow.png` | A dark-room screen glow | One wide, soft, warm band, bright at the edge and melting inwards, with rounded inner corners |
| `bad-release-picture-test-version.png` | **Rejected** release picture | Shows "Version 0.1.0" test data and repeats an older picture. Never do this |
