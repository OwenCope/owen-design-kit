---
name: design-review
description: A strict, step-by-step review of any screen, page, component, picture or post before it is shown to anyone or shipped. Catches what people reject on sight - the AI look, non-native controls, clutter, long layouts, fake pictures, weak copy, missing motion and missing states. Use after building any UI, before every release, and whenever asked "is it good?", "does it look right?" or "make it good".
---

# Design review

Do it for real: build, open, screenshot, and look at the pixels at full size. Reviewing code alone does not count.

## Size the review to the change

- **Small change** (one row, one string, one colour): capture that screen in light and dark and score only items 2, 5, 6, 7, 8, 10, 11 and 12. Mark the rest N/A.
- **Fixing reported problems on a page:** fix them, then still score items 13 and 14. Doing only what was listed is how a page stays forgettable.
- **New screen or flow:** the full review below.
- **Release pictures and posts:** items 4, 6, 7 and 11, plus `release-notes`.

## Step 1: Capture

- **App:** a review copy, never the person's own configured app. Light and dark, normal and narrow window, Reduce Motion on and off.
- **Web:** desktop (about 1440 px) and phone (about 375 px), light and dark if supported. Tab through it once with the keyboard. `scripts/capture.mjs` does the four captures in one go and flags console errors, sideways scrolling, buttons that move on hover and main actions that link nowhere:

      npx -y -p playwright node scripts/capture.mjs http://localhost:3000 review
- Hover every control and watch every transition once.

## Step 2: Look at the pixels

A full-page screenshot hides most problems. Before scoring:

- **Zoom to 200 to 300 %** on every edge, corner and cut-out: icons, window crops, rounded corners, the outline of anything you cut out or masked. Look for jagged edges, dark fringes, halos, blur, and a dark band where a shape stops short of its own rim light.
- **Measure, don't guess.** Read real numbers from the page or app: the gap between a window and the Dock, a button's position before and after hover, whether two items line up. A 4 px difference is a real bug.
- **Compare side by side** with the reference you're copying: the real app icon, the Apple screen, the earlier approved version. Put them next to each other at the same size and list every difference before calling it done.
- **Check the source resolution.** An image scaled up from a small file is blurry however good the layout is. Find the largest version (asset catalogues often hold 1024 or 2048 px when the `.icns` stops at 256).
- **Light and dark separately.** A screenshot or colour that works in one mode often looks wrong in the other; ship a version for each.
- **Scroll-driven and animated sections:** scroll to them for real and capture mid-animation, not just the first frame.

## Step 2b: Critique like a director

The checklist catches broken things. This catches things that are merely not good yet. For anything that moves, and for every page as a whole:

- **Scrub the timeline.** Capture at least five frames from start to end of every animation or scroll scene (start, building, peak, resolving, end) and lay them side by side.
- **Judge each frame as a still.** Is it composed? Is anything sitting on top of text? Is a large area empty for no reason? Does any frame look like a bug?
- **Collisions:** moving or decorative things must never cover headlines, body text, buttons or the product itself.
- **Plausibility:** physical things behave physically (they fall, settle, topple); UI behaves like the real OS (windows open from where they belong, menus drop from the menu bar).
- **Start and end:** the first frame invites, the last frame pays off. The payoff is the product, big and centred enough to read.
- **The friend test:** in one sentence, what would someone tell a friend about this page? If you can't write that sentence, the page has no moment yet.
- **Rate it honestly out of 10**, and list exactly what would make it a 10. Fix those before reporting, or report them as the remaining gap.
- **Don't trust a report, including your own.** Reload from scratch, look at the real page, then judge. Pages edited while open can show stale or doubled animation.

## Step 3: Score each item (pass or fix)

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
13. **Signature moment.** Product pages and first-run screens have one memorable, on-brand moment (`signature-moments`) that moves and responds, and is the centrepiece of its section. A page that is only clean and correct, or whose "moment" is a static picture with a caption, **fails** this item: write three concepts, pick the boldest buildable one and build it.
14. **Product in place.** A Mac app is shown on a full Mac scene from `mac-props`: laptop, menu bar, the window just above a Dock with the app's icon. A floating panel or a lone menu bar strip **fails**.

## Step 4: Fix, then capture again

Fix every "fix", re-screenshot and re-score. Only a full pass gets shown.

## Step 5: Report

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
- A primary button that goes nowhere ("Download" linking to `#top`, with "Coming soon" under it). If the thing isn't available, the button says what it really does: "Notify me", "Join the beta".
- A product picture that doesn't show where the product lives. A menu bar app needs the menu bar in the shot; a notch feature needs the notch.
- A two-column section with a short heading beside a long list, leaving a tall empty column. Make the heading sticky, or stack it above the list.
- Content clipped on phones (text cut off with "…" inside a product picture). Use a crop or layout made for the phone width.

## Reference pictures

Real, approved examples live in `examples/` next to this file. Open them and compare side by side.

| File | What it shows | What to copy |
|---|---|---|
| `good-update-card.png` | Settings > Updates in a Mac app (a test copy, so it says 0.1.0; fine for review, never in public pictures) | Section first, one row with Check Again, a centred card: icon, name, one blue Install, a real picture, short notes |
| `good-tourkit-page.png` | A setup page | Media on top, dots at its bottom, bold title, one line of text, one full-width blue button, close in the corner |
| `good-real-screenshot-with-native-toggle.png` | Accessibility setup | A real System Settings screenshot with the real switch on it, never a drawn copy |
| `good-release-picture.png` | A release picture | A tight crop of the real UI showing the release's main change, no frame |
| `good-edge-light-glow.png` | A dark-room screen glow | One wide, soft, warm band, bright at the edge and melting inwards, with rounded inner corners |
| `review-web-product-page.png` | A product page an agent built with these skills, rated 8/10 | The good: one headline, one pill, a real wallpaper, a quiet feature list. The misses: the Download button goes nowhere, the panel floats without the menu bar it lives in, and an empty column sits beside the feature list |
| `bad-release-picture-test-version.png` | **Rejected** release picture | Shows "Version 0.1.0" test data and repeats an older picture. Never do this |
