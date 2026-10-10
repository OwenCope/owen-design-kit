---
name: match-the-project
description: How to work on an existing app or website that has its own design (open-source contributions, client work, any repo you didn't design) - read its design system first, write it down as a project skill, and let it override apple-craft's picks; use before any UI change in a repo you didn't design, before opening a pull request to someone else's project, and whenever the project uses Material, GTK, Fluent, Bootstrap, Tailwind UI or a custom brand.
---

# Match the project

You are a guest in this repo. Its design wins. Your job is to blend in, not to improve its taste.

## Whose design wins

In someone else's project, their design system wins over every apple-craft pick. Their buttons, radii, colours, type and motion stay. Capsules, glass, #0071e3, signature moments and Mac scenes do not apply here.

apple-craft only fills gaps the project leaves open: spacing discipline, real pictures, copy, loading, empty and error states, accessibility. Never restyle what you were not asked to change.

## Step 1: Extract the style (10 minutes, before any change)

Read before touching UI. Record what you find, with file paths.

- CONTRIBUTING.md, design docs, existing PR review comments. Note anything reviewers enforce.
- Tokens and theme files: CSS variables, tailwind.config, theme.ts, SwiftUI Color and asset catalogs, Android colors.xml, GTK CSS.
- Fonts and type scale: families, sizes, weights, line heights.
- Corner radii and spacing scale: the actual numbers used.
- Component library in use (Material, GTK, Fluent, Bootstrap, Tailwind UI, custom) and how buttons, inputs, lists and dialogs are built.
- Icon set and sizes.
- Light and dark support: how themes switch, what you must check.
- Motion: durations, curves, what animates and what does not.
- Copy voice: sentence vs title case, tone, wording habits.

Take screenshots of the 3 existing screens closest to the one you will change. You will compare against them later.

## Step 2: Write it down

Save findings as a draft project skill using the template in new-project-setup. Path: skills/project-<name>/SKILL.md in the user's kit, or a STYLE-NOTES.md in the working folder if there is no kit.

Keep it compact:

- Tokens
- Type
- Shape
- Components
- Icons
- Motion
- Copy voice
- Screens compared
- Do not change

If anything is unclear, write the question down instead of guessing.

## Step 3: Make the change in their style

Reuse their components before writing new ones. Copy the nearest existing screen's structure. Match their naming and file layout.

One change per pull request. Keep the diff small. No drive-by refactors or restyles.

If their pattern seems worse than Apple's, mention it in the PR description. Do not change it.

## Step 4: Check

Size the check as a design-review Contribution: small change, full comparison.

- Before and after screenshots, light and dark.
- Side by side with the 3 reference screens. The new work should look like it was always there.
- Loading, empty, error and disabled states.
- Keyboard, focus, contrast, touch targets.

## Pull request

Present a UI pull request in clear steps.

- Title it in the project's style.
- Write one short paragraph saying what changed and why, per product-writing.
- Show before and after screenshots in light and dark, cropped to the changed area, side by side.
- Note what was matched deliberately: which existing screen or component.
- List how to test it in two or three steps.
- Keep the diff free of unrelated changes.
- Follow the project's PR template and commit style if they have one.

Answer review comments in their idiom, not Apple's.

## Never

- Restyle anything to the Apple look.
- Add a signature moment or glass to someone else's product.
- Introduce a new colour, font or icon set.
- Reformat files you did not change.
- Ignore their contributing guide.
