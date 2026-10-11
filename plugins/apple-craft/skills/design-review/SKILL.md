---
name: design-review
description: A strict, step-by-step review of any screen, page, component, picture or post before it is shown to anyone or shipped. Catches what people reject on sight - the AI look, non-native controls, clutter, long layouts, fake pictures, weak copy, missing motion and missing states. Use after building any UI, before every release, and whenever asked "is it good?", "does it look right?" or "make it good".
---

# Design review

Build, open, screenshot, and look at the pixels at full size. Reviewing code alone does not count.

## Size the review to the change

Review what changed, not the whole product: a checklist is not a reason to redesign. When you're unsure what you're seeing, or need to list a feature's states, read [Seeing clearly](../self-improve/references/evidence-judgment.md); it has worked examples.

- **Contribution to someone else's project:** follow `match-the-project`. Capture before and after screenshots in light and dark, put them next to the 3 nearby screens you compared, and check states and accessibility. Skip signature moments, Mac scenes and reference-copy checks; the project's own design is the standard.
- **Small change** (one row, one string, one colour): look at that area in light and dark and in any state it affects. Use the items that apply and mark the rest N/A.
- **Fixing reported problems on a page:** reproduce each one, fix it, and look at the states around it. Items 13 and 14 apply only if the page's direction or product scene is part of the job.
- **New screen or flow:** the full review below.
- **Release pictures and posts:** items 4, 6, 7 and 11, plus `release-notes`.

## Step 1: Capture

- **App:** a review copy, never the person's own configured app. Light and dark, normal and narrow window, Reduce Motion on and off. Apps can be captured with scripts/capture-app.sh <AppName>, which covers light, dark, a narrow window and Reduce Motion.
- **Web:** desktop (about 1440 px) and phone (about 375 px), light and dark if supported. Tab through it once with the keyboard. `scripts/capture.mjs` does the four captures in one go and flags console errors, sideways scrolling, buttons that move on hover and main actions that link nowhere. It also runs an axe accessibility check and writes axe-*.json; every violation of impact serious or critical must be fixed or explained:

    npm i -D playwright && npx playwright install chromium
    node scripts/capture.mjs http://localhost:3000 review
- Hover every control and watch every transition once.
- **Stress it** (web): `node scripts/stress.mjs http://localhost:3000 stress` refills the page with long German words, doubled text, 200 % text, right-to-left, 320 px width, empty and 200-item lists and a slow network, then reports anything that overflows, clips or overlaps. Real content breaks layouts that sample data never does.

## Run the slop linter

    node scripts/lint-slop.mjs http://localhost:3000

Fix every FAIL and run it again until it is clean, before any visual review. It checks letter-tile icons, tiny text, dead buttons, decorative chips, text-only theme toggles, fake Mac scenes, emoji or symbol icons, duplicate strings and phone-width overflow.

For a new screen or direction, run `self-improve` first; for small changes a focused look is enough. Reuse its notes here rather than writing them twice.

## If you can't see images

Agents without image input, or running in CI, must say so plainly in the report. List which checks could not be done. Run every check that does not need eyes: axe results, measured numbers from the DOM or view hierarchy, lint. Never claim to have looked at a screenshot. The person then does the visual pass.

## Step 2: Look at the pixels

Before judging, say in two or three plain sentences what you actually see: what catches the eye first, what sits on top of what, what state it's in. Keep three things apart: what you saw, what you measured, and what you think the cause is. "The heading covers the button" is seen; "a z-index bug" is a guess until you check.

A full-page screenshot hides most problems. Zoom to 200 to 300 % on every edge, corner and cut-out: jagged edges, dark fringes, halos, blur, a dark band where a shape stops short of its rim light. Read real numbers instead of guessing: window-to-Dock gap, button position before and after hover, whether two items line up. A 4 px difference is a real bug. Put the work next to its reference at the same size and list the differences that matter. Find the largest source asset: upscaled small files stay blurry, and catalogues often hold 1024 or 2048 px when the `.icns` stops at 256. Check light and dark separately. Scroll to animated sections for real and capture mid-animation.

### Director critique

The checklist catches broken things; this catches things merely not good yet. Watch every animation at normal speed first, since stills can't show feel. Then scrub it: start, building, peak, resolving, end, side by side, and judge each frame as a still. Moving or decorative things never cover headlines, body text, buttons or the product. No large empty area without a reason, no frame that looks like a bug. Physical things behave physically and UI behaves like the real OS. Things that open close the way they came. The first frame invites and the last pays off with the product big enough to read.

For a new page, write the friend test in one sentence: what would someone tell a friend about it? No sentence means no moment yet. Say plainly what is weak, why, and what would fix it. Sort each finding: it's broken, it contradicts the brief, or it's taste. Fix the first two; offer the third to the person as a choice. Reload and judge the real page, never a report, including your own.

## Check against the brief

If a design brief exists (design-brief skill), answer each 'Done means' check from the screenshots: pass, fail, or not checked yet. Go and check anything unchecked. Check that the first screen shows the brief's one thing and the product is the largest readable element.

## Step 3: Check each item (pass, fix or N/A)

This is the full version of the short checklist in `apple-design`; when both are loaded, score this one and don't repeat the other.

1. **Apple test.** Put it next to the Apple screen it is modelled on, name it, and list the differences that matter.
2. **Native.** Every control is the platform's own, in the product's one button style and size.
3. **One primary action**, labelled with a verb, and nothing duplicated.
4. **Real pictures.** Real, new, relevant, crisp, no black frame, no nested buttons, no test data; every product picture is a real screenshot or recording, never drawn, rebuilt from shapes or magnified into a second copy; attach a 200 % crop of every edge, corner and cut-out.
5. **Hierarchy.** At a glance: what is this, and what do I do? One headline, one line of support, then the action.
6. **Space.** Nothing long, stretched, tall or crammed, with consistent spacing steps and aligned edges; write the real numbers for window-to-Dock gap, main-container side padding and button position before and after hover.
7. **Words.** Every string passes `product-writing`. Read them aloud.
8. **Motion.** Hover and press feedback on everything interactive, carried by the content, never by the button moving or shrinking; a whole-control hit area, a smooth curve, things close the way they opened, calm under Reduce Motion.
9. **States.** List the states this feature really has (default, loading, empty, error, success, interrupted, disabled) and check each one. Mark the ones it can't reach as N/A; don't invent UI to fill the list.
10. **Accessibility.** Labels, focus, contrast, text read once, touch targets at least 44 px on the web.
11. **Leftovers.** No ghost windows, stray shadows, debug text, placeholder copy or console errors.
12. **Consistency.** Matches the rest of the product; the product's existing design wins over apple-craft picks when they differ (see `match-the-project`). Anything new looks like it always existed.
13. **Signature moment.** Product, launch and first-run pages (N/A for everything else) have one memorable, on-brand, moving, responsive centrepiece (`signature-moments`); a static picture with a caption fails. Name the moment in one sentence; if it was still an open question, name the concepts that were considered (`signature-moments`).
14. **Product in place.** In heroes and product pictures (N/A for release pictures and docs, which use a tight crop), a Mac app is shown on a full Mac scene from `mac-props`: laptop, menu bar, the window just above a Dock with the app's icon; a floating panel or a lone menu bar strip fails.

## Step 4: Gates (pass or fail)

- **Not a reference copy.** For a new direction, put it next to every example and reference it used. Same wallpaper, same section order or the same signature moment with a new logo fails. Shared craft (spacing, type, native controls) is fine.
- **Moving work.** Show five frames from start to end, plus a frame just after every clip ends. A frame that freezes, goes black or holds a finished clip's last frame fails.
- **Mock-ups.** An unbuilt app is shown only from `mac-props/examples/mac-ui.css`, each part compared against `liquid-glass/reference/` with differences listed.
- **Show before done.** Never call work finished until the person has seen it. Their judgement replaces yours.
- A gate you couldn't check isn't a pass: say it's unchecked. A gate that doesn't apply is N/A.

## Step 5: Fix and capture again

Fix what's broken or off-brief, then capture again with the same steps. Finding nothing to fix is a fine result. If a problem keeps coming back, find its cause before throwing the idea away. Show the person even if something still fails, and name what fails and what you couldn't check. Their look is the final pass.

## Step 6: Report

Show the screenshots, one line per notable change, and say what could not be checked ("not tried on a real lock screen").
End with one of: **ready for Owen to look at**, **visual review pending** (you couldn't see the images or playback), or **unresolved failure** (something is still broken). Ready isn't approved; only the person approves.

## Last step: record what was rejected

When the person rejects or corrects something, keep their exact words next to the screenshot or moment they were about. Work out what they meant before fixing (see `how-claude-designs`). Once you know what worked, add one row to apple-craft's apple-design/lessons.md (what was rejected | what worked), in general words with no private names. Keep the scope honest: "too slow when used often" is not "never animate". Don't add the same lesson twice.

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
