---
name: design-review
description: A strict, step-by-step review of any screen, page, component, picture or post before it is shown to anyone or shipped. Catches what people reject on sight - the AI look, non-native controls, clutter, long layouts, fake pictures, weak copy, missing motion and missing states. Use after building any UI, before every release, and whenever asked "is it good?", "does it look right?" or "make it good".
---

# Design review

Build, open, screenshot, and look at the pixels at full size. Reviewing code alone does not count.

## Size the review to the change

- **Contribution to someone else's project:** follow `match-the-project`. Capture before and after screenshots in light and dark, put them next to the 3 nearby screens you compared, and check states and accessibility. Skip signature moments, Mac scenes and reference-copy checks; the project's own design is the standard.
- **Small change** (one row, one string, one colour): capture that screen in light and dark and score only items 2, 5, 6, 7, 8, 10, 11 and 12. Mark the rest N/A.
- **Fixing reported problems on a page:** fix them, then still score items 13 and 14. Doing only what was listed is how a page stays forgettable.
- **New screen or flow:** the full review below.
- **Release pictures and posts:** items 4, 6, 7 and 11, plus `release-notes`.

## Step 1: Capture

- **App:** a review copy, never the person's own configured app. Light and dark, normal and narrow window, Reduce Motion on and off. Apps can be captured with scripts/capture-app.sh <AppName>, which covers light, dark, a narrow window and Reduce Motion.
- **Web:** desktop (about 1440 px) and phone (about 375 px), light and dark if supported. Tab through it once with the keyboard. `scripts/capture.mjs` does the four captures in one go and flags console errors, sideways scrolling, buttons that move on hover and main actions that link nowhere. It also runs an axe accessibility check and writes axe-*.json; every violation of impact serious or critical must be fixed or explained:

    npm i -D playwright && npx playwright install chromium
    node scripts/capture.mjs http://localhost:3000 review
- Hover every control and watch every transition once.

## Run the slop linter

    node scripts/lint-slop.mjs http://localhost:3000

Fix every FAIL and run it again until it is clean, before any visual review. It checks letter-tile icons, tiny text, dead buttons, decorative chips, text-only theme toggles, fake Mac scenes, emoji or symbol icons, duplicate strings and phone-width overflow.

For a new screen or direction, run `self-improve` before scoring; for small changes a focused look is enough. The review scores the result.

## If you can't see images

Agents without image input, or running in CI, must say so plainly in the report. List which checks could not be done. Run every check that does not need eyes: axe results, measured numbers from the DOM or view hierarchy, lint. Never claim to have looked at a screenshot. The person then does the visual pass.

## Step 2: Look at the pixels

A full-page screenshot hides most problems. Before scoring, zoom to 200 to 300 % on every edge, corner and cut-out: jagged edges, dark fringes, halos, blur, a dark band where a shape stops short of its rim light. Read real numbers instead of guessing: window-to-Dock gap, button position before and after hover, whether two items line up. A 4 px difference is a real bug. Put the work next to its reference at the same size and list every difference before calling it done. Find the largest source asset: upscaled small files stay blurry, and catalogues often hold 1024 or 2048 px when the `.icns` stops at 256. Check light and dark separately and ship a version for each. Scroll to animated sections for real and capture mid-animation.

### Director critique

The checklist catches broken things; this catches things merely not good yet. Scrub every animation or scroll scene with at least five frames start to end (start, building, peak, resolving, end) side by side, and judge each frame as a still: composed, nothing covering text, no large empty area for no reason, no frame that looks like a bug. Moving or decorative things must never cover headlines, body text, buttons or the product. Physical things behave physically and UI behaves like the real OS. The first frame invites and the last pays off with the product big and centred enough to read. Write the friend test in one sentence: what would someone tell a friend about this page. Without that sentence the page has no moment yet. Say plainly what is weak, why, and what would fix it. Reload from scratch and judge the real page, never a report, including your own.

## Check against the brief

If a design brief exists (design-brief skill), answer each 'Done means' check with pass or fail using the screenshots, and check that the first screen shows the brief's one thing and that the product is the largest readable element. Every fail is fixed before scoring.

## Step 3: Score each item (pass or fix)

This is the full version of the short checklist in `apple-design`; when both are loaded, score this one and don't repeat the other.

1. **Apple test.** Put it next to the Apple screen it is modelled on and name the reference; list at least three differences found, even if fixed.
2. **Native.** Every control is the platform's own, in the product's one button style and size.
3. **One primary action**, labelled with a verb, and nothing duplicated.
4. **Real pictures.** Real, new, relevant, crisp, no black frame, no nested buttons, no test data; every product picture is a real screenshot or recording, never drawn, rebuilt from shapes or magnified into a second copy; attach a 200 % crop of every edge, corner and cut-out.
5. **Hierarchy.** At a glance: what is this, and what do I do? One headline, one line of support, then the action.
6. **Space.** Nothing long, stretched, tall or crammed, with consistent spacing steps and aligned edges; write the real numbers for window-to-Dock gap, main-container side padding and button position before and after hover.
7. **Words.** Every string passes `product-writing`. Read them aloud.
8. **Motion.** Hover and press feedback on everything interactive, a whole-control hit area, a smooth curve, off under Reduce Motion.
9. **States.** Loading, empty, error, disabled and success are all designed, not just the happy path.
10. **Accessibility.** Labels, focus, contrast, text read once, touch targets at least 44 px on the web.
11. **Leftovers.** No ghost windows, stray shadows, debug text, placeholder copy or console errors.
12. **Consistency.** Matches the rest of the product; the product's existing design wins over apple-craft picks when they differ (see `match-the-project`). Anything new looks like it always existed.
13. **Signature moment.** Product, launch and first-run pages (N/A for everything else) have one memorable, on-brand, moving, responsive centrepiece (`signature-moments`); a static picture with a caption fails. Name the moment in one sentence; if it was still an open question, name the concepts that were considered (`signature-moments`).
14. **Product in place.** In heroes and product pictures (N/A for release pictures and docs, which use a tight crop), a Mac app is shown on a full Mac scene from `mac-props`: laptop, menu bar, the window just above a Dock with the app's icon; a floating panel or a lone menu bar strip fails.

## Step 4: Hard gates (pass or fail, no judgement)

- **Not a reference copy.** Put the page next to `web-design/examples/product-page.html` and every example it used and list five real differences (layout order, hero picture, wallpaper and colours, feature visuals, signature moment). Fewer than five, or the same wallpaper or section order, fails.
- **Moving work.** Show five frames from start to end, plus a frame just after every clip ends. A frame that freezes, goes black or holds a finished clip's last frame fails.
- **Mock-ups.** An unbuilt app is shown only from `mac-props/examples/mac-ui.css`, each part compared against `liquid-glass/reference/` with differences listed.
- **Show before done.** Never call work finished until the person has seen it. Their judgement replaces yours.
- Any gate without written evidence fails.

## Step 5: Fix and capture again

Fix every "fix", re-screenshot and re-score. Then show the person, even if something still fails: list what fails and what could not be checked instead of hiding it. Their look is the final pass.

## Step 6: Report

Show the screenshots, one line per notable change, and say what could not be checked ("not tried on a real lock screen").

## Last step: record what was rejected

When the person rejects or corrects something, add one row to apple-craft's apple-design/lessons.md in the right table (what was rejected | what worked). Write it in general words with no private names. Keep it to one line. If the same lesson is already there, do not add it twice.

## Hunt for these first

- Text on two lines that fits on one: cut it.
- A primary button that goes nowhere ("Download" linking to `#top`, with "Coming soon" under it). If the thing is not available, the button says what it really does: "Notify me", "Join the beta".
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
| `bad-drawn-ui-copy.png` | **Rejected** launch-video frame | The app's panel rebuilt from shapes: wrong proportions, eyes in the wrong place, flat. The person asked "use real panels" |
| `good-real-ui-footage.png` | The fix for the frame above | A real recording of the same panel, cropped close, with one centred title. Real UI always beats a drawn copy |
| `bad-duplicate-magnified-panel.png` | **Rejected** "zoom" effect | A magnified copy of the panel laid over the real one, so the UI appears twice and looks glitched. Zoom the camera instead |
| `bad-frozen-last-frame.png` | **Rejected** edit | A clip's last frame held on screen for the rest of the video after the clip ended. Check a frame just after every clip's end |
