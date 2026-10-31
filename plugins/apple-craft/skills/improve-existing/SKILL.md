---
name: improve-existing
description: How to make an existing site, app or screen better without throwing it away - find the one thing hurting it most, fix structure before polish, keep what already works, and show before and after. Use whenever asked to "improve", "redesign", "make it better", "fix the design" or "make it look good" on something that already exists, including your own earlier work.
---

# Improving something that exists

Most real design work is this, not a blank page. Every bad redesign we've seen started by throwing the old one away: the new version lost what people liked and kept what was wrong, just restyled.

## 1. Use it before you touch it

Open it like a first-time visitor and like a daily user. Do the main task once. Capture what you see now (`<kit>/plugins/apple-craft/skills/design-review/scripts/capture.mjs` for web, `<kit>/plugins/apple-craft/skills/design-review/scripts/capture-app.sh` for apps): these are the "before" pictures you'll show at the end.

Write down, in plain sentences:

- What it's for, and the one moment it should land (`how-claude-designs`, section 1).
- What already works. Be specific: "the product screenshot is real and sharp", "the pricing is honest". This list is protected.
- What hurts most. One thing, not ten. The usual suspects, in order of damage:
  1. You can't tell what it is or what to do within a few seconds.
  2. The product isn't visible, or is fake.
  3. The main action is hidden, duplicated or goes nowhere.
  4. It breaks: phone layout, contrast, long text, empty states (`<kit>/plugins/apple-craft/skills/design-review/scripts/stress.mjs` finds these fast).
  5. It looks generic: could be any product.
  6. Polish: spacing, type, motion.

## 2. Fix in that order

Structure before polish. Changing fonts on a page whose first screen says nothing is wasted work. If the problem is number 1 or 2, the fix is what the first screen shows, not how it looks.

Keep the project's own design language unless it is the problem (`match-the-project`). Improving a site in its own style reads as "better". Swapping its style reads as "different", and people notice what they lost.

## 3. Change the least that fixes the most

- One structural fix, then look again before the next.
- Reuse the existing components; fix them in place rather than adding new ones next to them.
- Cut before adding. Most pages improve by removing a section, a second button, a decorative chip.
- If the same problem keeps coming back after a fix, the cause is elsewhere: find it (`how-claude-designs`, section 4).

## 4. Show before and after

Same viewport, same scroll position, same data, side by side. One line per change saying what was wrong and why the new version is better. Include the things you deliberately kept.

If you can only see small wins, say so honestly, and say what bigger change would be needed and why you didn't make it without asking.

## When it really does need starting over

Sometimes the idea itself is wrong: the page sells the wrong thing, or the app's structure fights the task. Then say so before redesigning, with the reason, and agree on it with the person first. A full redesign is a new direction (`design-brief`), not an improvement.
