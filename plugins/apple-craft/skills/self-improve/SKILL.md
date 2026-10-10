---
name: self-improve
description: a self-reflection loop that lets any agent, including smaller models, raise the quality of its own design work: capture specific screenshots and interaction states, measure, critique like a demanding Apple designer with evidence, rank the five most damaging problems with concrete fixes, apply them, and repeat; use after every first build of a page, screen, picture or video and before showing it, and whenever work feels generic or unfinished.
---

# Self-improve

Run this after every first build, before showing anything.
Two rounds minimum. No first build is shown without them.

## Why this works

- In a real experiment on one product page with a smaller model, a strong design brief lifted the result most: about +2.5 out of 10.
- This loop added +1 to +2 for every starting point, and caught real bugs: a drag that silently failed at the edge, the product clipped by its frame, a seam between two shapes, 600 px of dead space, text unreadable on a loud wallpaper.
- A loop on a page with no idea only polishes it. The fix has to be structural: what the first screen is, what is cut, what is biggest.
- Agents still over-score themselves by about one point. The score is never the goal. The five fixes are.

## Step 1: Capture what a person would see

- The first screen at 1440x900 and 390x844, in light and dark.
- A 2x zoomed crop of the product and of every edge where two shapes meet.
- Every interaction state, produced by script: after a drag, panel open, hover, end of a scroll scene. For scroll scenes, five frames from start to end.
- One full page.
- Run the design-review scripts, then look:

    node scripts/capture.mjs http://localhost:3000 review
    node scripts/lint-slop.mjs http://localhost:3000

- If you can view images, look at every one at full size. If you cannot, say so and measure instead: sizes, positions, contrast against what sits behind, empty space in px, font sizes after scaling.

## Step 2: Test it like a user

- Perform the main interaction in a script and check the result state: counts, classes, positions.
- Test the edge cases: release at the edge of a drop zone, fast passes, keyboard, reduced motion, phone tap.
- Say exactly what you tested. Name what went untested.

## Step 3: Reflect with evidence

- Write REFLECT-N.md. Answer each question with evidence from the captures, never from memory of the code.
- Is the one thing obvious within two seconds?
- Is the product the largest readable thing?
- Is any text hard to read because of what sits behind it?
- Is there empty space with no purpose? Measure it in px.
- Does anything look generic, fake, cheap or unfinished? Name it.
- Does every frame of motion make a good still?
- Does the interaction work end to end?
- Does it hold on a phone?
- Could this page be for another app? Cover the product name and check.
- Compare with the generic-version lists in design-brief/examples.md and list every match.

## Step 4: Rank five problems and fix them

- Rank the five most damaging problems, each with a concrete fix: exact px, colours, positions, timing, copy.
- When the page matches the generic version, at least two of the five must be structural: what the first screen is, what is cut, what is bigger.
- No nitpicks while big problems remain.
- Never fix by adding filler: no cards, chips, hint pills, step lists, extra sections.
- Apply all five before the next round.

## Step 5: Repeat

- Do at least two rounds: r1 and r2 folders, REFLECT-1 and REFLECT-2.
- Each round must find five new problems. The same five twice means you did not look.
- Stop after round 3, or when only nitpicks remain.
- If the same structural problem survives two rounds, the idea is the problem. Go back to design-brief and choose a different concept.

## Report

- Per round: the five problems, what changed, what was tested, lint and accessibility results, whether images were viewed.
- End with a score out of 10, with the reminder that it is probably one point too high.

## Example

The sub-headline is 21 px grey sitting on bright colour blobs, and it dips below 3:1 contrast on the brightest patches.
Fix: a light scrim near .78 opacity, plus tighter hero spacing so the files ride about 70 px closer to the product.
Dragging to the centre parks the file and the count goes to 1, but releasing 220 px off-centre parks nothing.
Cause: the drop zone ends in a hard edge and release is heard only on the dragged item itself.
Fix: listen on the window, widen tolerance to 260 px, and retest the exact drop that failed.
The open panel reads as a separate black box under a narrower pill, with a visible step and shadow gap.
Fix: overlap them by 2 px, narrow the panel, and grow the pill whenever the panel opens.
On the phone the headline wraps to four lines over the busiest part of the background and the grid sits deep.
Fix: smaller hero type and nav spacing that clears the product.
After parking every item the hint points at an empty row, so the hint text swaps once everything is parked.
