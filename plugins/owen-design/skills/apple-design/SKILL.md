---
name: apple-design
description: Owen's core design standard for every app, website and visual, in any project. Load before designing, building, restyling or reviewing any UI, screen, page, component, button, picture, animation or layout — and whenever the owner says something looks "AI", "eww", "worse", "long", "not Apple-like" or "not good". Covers the method, the pre-show checklist, and the mistakes that were rejected before.
---

# Apple-quality design

The bar: it should look like Apple built it. The owner notices instantly when something looks generated, templated or "AI". Everything here was learned from real rejections and approvals.

## The method — do these in order, every time

1. **Find Apple's version first.** Before designing, name where Apple already solved this problem: System Settings, the App Store update card, Face ID setup, iOS lock screen, Photo Booth, Edge Light, apple.com product pages, Apple release notes. Copy that pattern's structure, spacing, hierarchy and wording. Only invent when Apple has nothing.
2. **Use the platform's own controls before drawing anything.** Native toggles, buttons, toolbars, progress bars, sheets, SF Symbols, system fonts. They are correct in light, dark, accessibility sizes and future OS styles for free. Hand-drawn controls are the #1 reason work gets called "AI".
3. **Use real content.** Real screenshots, real recordings, the real app icon, real names, real version numbers, real text. Never placeholders, stock photos, generated illustrations, fake people or drawn imitations of another app or of the OS. If a real picture can't be captured, ask for one — don't fake it.
4. **One job per screen, one primary action.** Exactly one prominent button per view, labelled with a verb (Install, Next, Download for Mac). Everything else is plain. If two controls do the same thing, delete one.
5. **Remove before you add.** Cut the extra label, the explanation, the border, the second heading, the badge, the divider. Apple UI is mostly calm space and a few confident things.
6. **Keep a single visual language.** Same button shape and size everywhere. Same corner radius family. Same spacing scale. Same animation curve (a smooth ~0.35 s ease). A new screen should look like it was always there.
7. **Make motion feel alive but quiet.** Hover and press feedback on every interactive element, covering the whole control (not just its centre). Transitions morph rather than pop. Always honour Reduce Motion.
8. **Put important things where people look.** The thing a person came for goes first (e.g. Updates at the top of Settings). A badge or indicator should *take you* to the thing, never perform the action behind your back.
9. **Look at it before calling it done.** Build it, run it, screenshot it and look at the image at full size. Check light and dark, Reduce Motion, small windows and — for the web — a phone width. Most rejections would have been caught by simply looking.
10. **Show the owner the real result** (a screenshot), not a description of it.

## Before showing anything — the checklist

- Does this look like Apple shipped it, or like a template? If a template, go back to step 1.
- Is every control native, and the same size and shape as the rest of the product?
- Is there exactly one prominent button, with a one- or two-word verb?
- Is every picture real, new for this context, uncluttered, with no black frame or outline, and no test data (like "Version 0.1.0")?
- Could any sentence lose half its words? (See `product-writing`.)
- Does anything look long, stretched, tall, crowded or empty? Tighten it.
- Do hover, press and transitions exist, feel smooth, cover the whole control, and switch off under Reduce Motion?
- Is anything duplicated — two buttons, two headings, a picture of the thing inside the thing?
- Are there any leftover windows, shadows, transparent layers or ghost frames behind the UI?

## Never

- Gradients, glows, neon, glassmorphism *effects you drew yourself*, emoji as icons, sparkles, purple/indigo "AI" palettes.
- Drawn mock-ups of real software (System Settings, a browser, Discord…). Use a screenshot.
- Tall capsules, grey bubbles or giant circles as badges. Use a normal icon button.
- A transparent or blank outer window behind a sheet or panel.
- Two buttons for one action, or an action button shown inside a picture of itself.
- Black borders or outlines around screenshots.
- Reusing an old picture for new work.
- Stretching a layout to fill space.

## Rejected → fixed (real history, learn from it)

| Rejected | Why | What worked |
|---|---|---|
| A drawn SwiftUI copy of System Settings | "looks too AI, use a real image" | A real screenshot with the real native Toggle placed on it |
| Onboarding pages built outside the tour framework | "this is not TourKit, use it fully" | Rebuild every page in the framework's layout |
| Custom-styled buttons | "look so bad and AI" | The plain native blue Liquid Glass capsule, same everywhere |
| Update badge as tall capsule → grey bubble → huge blue circle | "eww", "worse" | A standard toolbar icon button, tinted blue |
| Transparent window behind the setup window | ghost frame | Remove it entirely |
| A long update card | "why does it look long" | Icon, name, one button, then notes — nothing else |
| Two Install buttons | confusing | One |
| Release picture with a black outline / showing the Install button inside the card | cluttered, nested | Clean crop, no frame, nothing nested |
| A release picture that repeated an older release's picture | "that is from 0.1.4" | A new picture of this release's main change |
| A plain Discord card | "not as pretty as the release page" | Match the release page: title, summary, full-width picture, notes, real buttons |

## Related skills

- `macos-app-design` — specifics for Mac/SwiftUI apps.
- `web-design` — specifics for websites.
- `product-writing` and `release-notes` — every word the product shows.
- `ship-and-verify` — how to prove it works before saying so.
- `project-*` — the rules for one specific project. Always load the matching one.
