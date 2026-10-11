---
name: working-with-owen
description: How to work with Owen Cope - his taste, how he communicates, what he approves and rejects, his design picks (which override the apple-craft defaults) and his hard rules. Load at the start of any session in any of Owen's projects, together with the apple-craft skills.
---

# Working with Owen

## Who he is
Owen builds products solo with testers and agents: Gaze (a Mac face-unlock app), gazeunlock.com, his portfolio at owencope.pages.dev (`project-owencope-site`), and future projects. He judges everything by one question: **does it feel like Apple made it?**

## How he communicates
- Short, fast messages with typos ("wrok", "picutes"). Read for intent, don't ask him to rephrase.
- Screenshots are the main way he reports things. Look at every one carefully, including small text.
- "eww", "worse", "wtf", "looks AI", "not tourkit" → that part is wrong at the root; redo it properly (see `apple-design`), don't nudge it.
- "ship it", "release it" → do the full release and verify it, following the release rhythm in `ship-and-verify`. If a release already went out today, suggest bundling first.
- "push it" → push the commits. If it's unclear whether he means a release, ask.
- "keep going" → continue the current plan without asking.
- He values being told the truth: what's untested, what he must do (e.g. delete an old post).
- He reacts to screenshots, not descriptions. **Show him any visual change before you ship or deploy it**, and wait for his reaction.
- He spots generic "AI template" looks at once and rejects them: gradient text, colour glows, uniform grids of identical cards, fake app windows or drawn browser chrome.

## What he always wants
- Clean, Apple-like design and copy — every time, without being reminded.
- Real pictures, never mock-ups. A new picture for every release.
- Release notes in the exact format (`release-notes`).
- Things put where they're easy to find.
- Testers credited.
- Apple product-page patterns: one card per project, clean sections, real photos, real app icons and real Apple wallpapers, never stand-ins.
- The gazeunlock.com pill buttons (see `web-design`): solid blue with a 1 px gradient rim for the action, and a solid pill in the page's ink colour for secondary actions. He rejected glossy 2000s-style glass and the frosted glass pill as a secondary button.
- Light and dark themes both ship, follow the system setting, and have a visible switch.
- Rounded capsule controls and large rounded containers over rectangular ones (see "Recommended picks" in `liquid-glass`).

## Hard rules
- Commit/push only when asked. Ask before permanent deletes. Warn before restarting his running app.
- No blockquotes in replies. They/them for people of unknown pronouns. No em dashes in copy.
- Never add a Claude "Co-Authored-By" trailer or any Claude attribution to commits or PRs, in any of his repos. Don't rewrite old history to remove it.
- Never store his Mac password; never use dominic@creatordb.app in services; never repeat secrets.
- Stop and wait if he rejects a tool call.

## Owen's picks (override the apple-craft defaults)
- Web buttons: the gazeunlock.com LiquidButton pills (`gaze-site/src/components/ui/liquid-glass-button.module.css`, `solid` variant). The secondary is the owencope-site `.pill-neutral` ink pill in `site/glass.css`.
- Settings windows look like Droppy and Wick (2026-09-30): a sidebar with a capsule search field, coloured icon tiles, quiet grey headers, Updates pinned at the bottom, plain rounded groups, few subtitles.
- Capsules at the large control sizes and large concentric containers everywhere ("Recommended picks" in `liquid-glass` are his picks).
- No hover lift: buttons never move up on hover.
- His Mac appearance is light. Restore it after any capture that changes it.

## Starting in a project
1. Load `apple-craft:apple-design` and the matching `project-*` skill.
2. Read the project's AGENTS.md / handoff file and `DESIGN-NOTES.md` if it has them.
3. Check git status and recent commits before changing anything.

## Apple Figma kits (Owen's copies)

Use these with `figma-mockups`; they are Owen's duplicated copies, so the Figma tools can read them:
- macOS 27: https://www.figma.com/design/psmd2v7ftwhNCn0yh6JUk0/macOS-27--Community-
- iOS and iPadOS 27: https://www.figma.com/design/j2esmSA6gZA9scyN82vp5j/iOS-and-iPadOS-27--Community-

## Recording his picks

When Owen chooses between two versions, or approves or rejects something with a reason, add one line to `picks.md` next to this file: the date, what he was shown, what he picked, and his words. Keep his exact words. Over time this is the evidence of his taste; read it before guessing what he'd like, and update the picks above only when several entries agree.
