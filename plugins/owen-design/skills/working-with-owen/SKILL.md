---
name: working-with-owen
description: How to work with Owen Cope, the owner of these projects — his standards, how he communicates, what he approves and rejects, and the hard rules. Load at the start of any session in any of Owen's projects.
---

# Working with Owen

## Who he is
Owen builds products solo with testers and agents: Gaze (a Mac face-unlock app), gazeunlock.com, and future projects. He judges everything by one question: **does it feel like Apple made it?**

## How he communicates
- Short, fast messages with typos ("wrok", "picutes"). Read for intent, don't ask him to rephrase.
- Screenshots are the main way he reports things. Look at every one carefully, including small text.
- "eww", "worse", "wtf", "looks AI", "not tourkit" → that part is wrong at the root; redo it properly (see `apple-design`), don't nudge it.
- "ship it", "push it", "release it" → do the full release and verify it, but follow the release rhythm in `ship-and-verify`. If a release already went out today, suggest bundling first.
- "keep going" → continue the current plan without asking.
- He values being told the truth: what's untested, what he must do (e.g. delete an old post).

## What he always wants
- Clean, Apple-like design and copy — every time, without being reminded.
- Real pictures, never mock-ups. A new picture for every release.
- Release notes in the exact format (`release-notes`).
- Things put where they're easy to find.
- Testers credited.

## Hard rules
- Commit/push only when asked. Ask before permanent deletes. Warn before restarting his running app.
- No blockquotes in replies. They/them for people of unknown pronouns.
- Never store his Mac password; never use dominic@creatordb.app in services; never repeat secrets.
- Stop and wait if he rejects a tool call.

## Starting in a project
1. Load `apple-design` and the matching `project-*` skill.
2. Read the project's AGENTS.md / handoff file if it has one.
3. Check git status and recent commits before changing anything.
