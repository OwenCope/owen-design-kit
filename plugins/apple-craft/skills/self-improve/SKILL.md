---
name: self-improve
description: a self-reflection loop that lets any agent, including smaller models, raise the quality of its own design work: capture specific screenshots and interaction states, measure, critique like a demanding Apple designer with evidence, rank the most damaging problems with concrete fixes, apply them, and repeat; use after every first build of a page, screen, picture or video and before showing it, and whenever work feels generic or unfinished.
---

# Self-improve

Run this after the first build of a new page, screen or direction, before showing anything. Size it to the work: a small fix needs a focused look at what changed, not this whole loop.

When you're unsure what you're seeing, or need to list a feature's states, read [Seeing clearly](references/evidence-judgment.md). It has [worked examples](examples/evidence-judgment.md) to practise on.

## Why this works

- In a real experiment on one product page with a smaller model, a strong design brief lifted the result most.
- This loop improved every starting point, and caught real bugs: a drag that silently failed at the edge, the product clipped by its frame, a seam between two shapes, 600 px of dead space, text unreadable on a loud wallpaper.
- A loop can't supply a missing idea. If the problem is the idea, go back to the brief. If the idea is good and only its execution is off, keep the idea and fix the execution.
- Ratings of your own work run high and prove nothing. The fixes are the goal.

## Step 1: Capture what a person would see

- The screens that changed, in light and dark. For a new web page: 1440x900 and 390x844.
- A 2x zoomed crop of the product and of every edge where two shapes meet.
- Every state the feature really has, produced by script — list the states per [Seeing clearly](references/evidence-judgment.md) § "List the states…"; mark unreachable ones N/A.
- For motion: watch it at normal speed, then capture frames from start to end (enough that each phase — start, building, peak, resolving, end — has a still).
- Run the design-review scripts, then look:

    node ../design-review/scripts/capture.mjs http://localhost:3000 review
    node ../design-review/scripts/lint-slop.mjs http://localhost:3000

- Look at every image at full size. If you can't see images, say so and measure instead: sizes, positions, contrast, empty space in px. Numbers can't tell you how something looks or feels, so the visual review stays pending.

## Step 2: Test it like a user

- Perform the main interaction in a script and check the result state: counts, classes, positions.
- Test the edge cases: release at the edge of a drop zone, fast repeated input, interrupting mid-animation, keyboard, reduced motion, phone tap.
- Say exactly what you tested. Name what went untested.

## Step 3: Reflect with evidence

Write REFLECT-N.md. First, two or three plain sentences on what you actually see: what catches the eye first, what sits on top of what, what state it's in. Then the questions that apply:

- Is the one thing obvious within two seconds?
- Is the product the largest readable thing?
- Is any text hard to read because of what sits behind it?
- Is there empty space with no purpose? Measure it in px.
- Does anything look generic, fake, cheap or unfinished? Name it.
- Does every frame of motion make a good still? Does it close the way it opened?
- Does the interaction work end to end, including when interrupted?
- Does it hold on a phone?
- Could this page be for another app? Cover the product name and check.
- Does it match the generic-version lists in design-brief/examples.md?

For each problem, write:

- What it should do or say.
- What you see, with a measurement or timestamp.
- Whether it's broken, against the brief, or just taste, sorted per [Seeing clearly](references/evidence-judgment.md) § "Sort what you found".
- Why it matters.
- The fix, and the before and after once fixed.
- What you're still unsure of.

Keep what you saw separate from what you think caused it. "Escape leaves the panel focusable" is seen; "a stale callback" is a guess until you check. Broken things come first. Taste changes need a specific reason and, for motion, a normal-speed watch. Finding nothing to fix is a fine result. Keep a fix only if it helps without breaking something else.

## Step 4: Rank the problems and fix them

- Rank the most damaging problems, each with a concrete fix: exact px, colours, positions, timing, copy.
- If the page looks like the generic version, the fix is structural: what the first screen is, what is cut, what is biggest.
- No nitpicks while big problems remain.
- Never fix by adding filler: no cards, chips, hint pills, step lists, extra sections.
- Apply the fixes, then capture the same states again.

## Step 5: Repeat

- Use r1, r2 folders and REFLECT-1, REFLECT-2 files.
- Go again while fixes keep changing things or a check still fails. Stop when only nitpicks remain.
- If the same problem survives two rounds, find its cause before anything else: does it really reproduce, did the fix touch the right thing? Change the idea only if the idea itself can't work.

## Report

- Every claim names what you did and what you saw: "opened at 375 px, the third row and the Add and Clear buttons are cut off" is a finding; "phone layout passes" next to a screenshot you didn't look at is not. Saving a screenshot is not checking it. Sort each check into checked and fine, checked and failed, or not tested.
- Per round: the problems, what changed, what was tested, lint and accessibility results, whether images were viewed.
- End with one of the three verdicts in [Seeing clearly](references/evidence-judgment.md) § "How to end" (ready, visual review pending, unresolved failure).

## Example: a prototype that looked finished and wasn't

A notch file-shelf prototype was reported as done and passing. Looking at its own captures:

- A giant marketing headline took the top half of the first screen; the product sat below it in a framed desktop. For a prototype, the product is the page. Fix: drop the headline, put the Mac scene first.
- The shelf was a pale card below the black notch, not the notch growing. Fix: one shape that grows from the notch (`motion-kit`, why the reference works).
- Four ways to add files at once (search, drop zone, browse, Add files). Fix: one obvious way, the rest secondary (`product-ui`, decide before polishing).
- Generic page icons for files and coloured squares in the Dock, while `mac-props` ships real ones. Fix: run its asset script.
- The phone capture cut off the third row and both buttons, yet the report said it passed at 375 px. Fix: look at the capture, then fix the overflow.
- Closed, nothing showed that files were stored. Fix: show them in the closed notch.

Every one of these was visible in screenshots the agent had already saved.

## Example: a product page

From a real round on a product page:

The sub-headline is 21 px grey sitting on bright colour blobs, and it dips below 3:1 contrast on the brightest patches.
Fix: a light scrim near .78 opacity, plus tighter hero spacing so the files ride about 70 px closer to the product.
Dragging to the centre parks the file and the count goes to 1, but releasing 220 px off-centre parks nothing.
Cause, once checked: the drop zone ends in a hard edge and release is heard only on the dragged item itself.
Fix: listen on the window, widen tolerance to 260 px, and retest the exact drop that failed.
The open panel reads as a separate black box under a narrower pill, with a visible step and shadow gap.
Fix: overlap them by 2 px, narrow the panel, and grow the pill whenever the panel opens.
On the phone the headline wraps to four lines over the busiest part of the background and the grid sits deep.
Fix: smaller hero type and nav spacing that clears the product.
After parking every item the hint points at an empty row, so the hint text swaps once everything is parked.
