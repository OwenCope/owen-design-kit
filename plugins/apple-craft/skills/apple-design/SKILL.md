---
name: apple-design
description: The core standard for making any app, website or visual look like Apple made it. Use before designing, building, restyling or reviewing any UI, screen, page, component, button, picture, animation or layout, and whenever someone says the work looks "AI", "generic", "templated", "cheap", "worse", "too long" or "not Apple-like". Covers the method, the pre-show checklist, the things that always get rejected, and real rejected-to-fixed examples.
---

# Apple-quality design

The bar is simple: it should look like Apple shipped it. People notice at once when something looks generated, templated or "AI". Everything here comes from real work that was rejected and then fixed.

## The method, in order, every time

1. **Find Apple's version first.** Before designing, name where Apple already solved this: System Settings, the App Store update card, Face ID setup, the lock screen, Photo Booth, apple.com product pages, Apple's release notes and "What's New" sheets. Copy that pattern's structure, spacing, hierarchy and wording. Only invent when Apple has nothing.
2. **Use the platform's own controls before drawing anything.** Native toggles, buttons, toolbars, progress bars, sheets, SF Symbols and system fonts are right in light, dark, accessibility sizes and future OS styles for free. Hand-drawn controls are the most common reason work gets called "AI".
3. **Use real content.** Real screenshots and recordings, the real app icon, real names, real version numbers, real text. Never placeholders, stock photos, generated illustrations, fake people, or drawn imitations of another app or the OS. If a real picture can't be captured, ask for one.
4. **One job per screen, one primary action.** Exactly one prominent button per view, labelled with a verb (Install, Next, Download for Mac). Everything else is plain. If two controls do the same thing, delete one.
5. **Remove before you add.** Cut the extra label, the explanation, the border, the second heading, the badge, the divider. Apple UI is mostly calm space and a few confident things.
6. **Keep one visual language.** The same button shape and size everywhere, one corner-radius family, one spacing scale, one animation curve. Capsule controls and large concentric containers read as current Apple (see `liquid-glass`). A new screen should look like it was always there.
7. **Make motion alive but quiet.** Hover and press feedback on everything interactive, covering the whole control, not just its centre. Transitions morph instead of popping. Always honour Reduce Motion.
8. **Put important things where people look.** What a person came for goes first (Updates at the top of Settings). A badge or indicator takes you to the thing; it never does the action behind your back.
9. **Look at it before calling it done.** Build it, run it, screenshot it and look at the image at full size. Check light and dark, Reduce Motion, small windows and, on the web, a phone width. Most rejections would have been caught by looking.
10. **Show the real result**, a screenshot, not a description of it.

## Before showing anything

- Does it look like Apple shipped it, or like a template? If a template, go back to step 1.
- Is every control native, and the same size and shape as the rest of the product?
- Is there exactly one prominent button, with a one- or two-word verb?
- Is every picture real, new for this context, uncluttered, with no black frame, and no test data such as "Version 0.1.0"?
- Could any sentence lose half its words? (See `product-writing`.)
- Does anything look long, stretched, tall, crowded or empty? Tighten it.
- Do hover, press and transitions exist, cover the whole control, and switch off under Reduce Motion?
- Is anything duplicated: two buttons, two headings, a picture of the thing inside the thing?
- Are there leftover windows, stray shadows, transparent layers or ghost frames?

## Never

- Decorative gradients, glows, neon or glass you drew yourself; emoji as icons; sparkles; purple and indigo "AI" palettes. A glow or gradient that *is* the feature and copies an Apple original (macOS Edge Light, the fade that keeps text readable over art) is fine.
- Drawn mock-ups of real software (System Settings, a browser, Discord). Use a screenshot.
- Tall capsules, grey bubbles or giant circles as badges. Use a normal icon button.
- A transparent or blank outer window behind a sheet or panel.
- Two buttons for one action, or an action button shown inside a picture of itself.
- Black borders or outlines around screenshots.
- Reusing an old picture for new work.
- Stretching a layout to fill space.

## Rejected → fixed (real examples)

| Rejected | Why | What worked |
|---|---|---|
| A drawn SwiftUI copy of System Settings | "looks too AI, use a real image" | A real screenshot with the real native Toggle placed on it |
| Onboarding pages built outside the app's tour framework | inconsistent with the rest of setup | Every page rebuilt in the framework's layout |
| Custom-styled buttons | "so bad and AI" | The plain native blue Liquid Glass capsule, the same everywhere |
| An update badge as a tall capsule, then a grey bubble, then a big blue circle | "worse" each time | A standard toolbar icon button, tinted blue |
| A transparent window behind the setup window | a ghost frame | Removed entirely |
| A long update card | "why does it look long" | Icon, name, one button, then notes, nothing else |
| Two Install buttons | confusing | One |
| A release picture with a black outline and the Install button inside it | cluttered, nested | A clean crop, no frame, nothing nested |
| A release picture reused from an older release | stale | A new picture of this release's main change |
| A product picture with a window cut too high and a grey band under it | it no longer sat on the Dock like the others | Measure the gap to the Dock and match it exactly |
| An icon edited from the 256 px `.icns` and blown up | "extremely blurry" | The 2048 px version from the asset catalogue |
| A cut-out shape whose outline sat outside its own rim light | a dark outline around it | Trace the outline from the rim itself, then check at 300 % |
| Buttons that lift a few pixels on hover | "not needed" | Change colour, glow or content instead; never move the button |
| A website that copied another product's signature effects | "it looks like that other site with a new colour" | Keep the shared craft (space, type, real pictures) but give the product its own signature pieces |

## Apple references to study

- Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines, especially Buttons, Toggles, Settings, Onboarding, Motion, Writing and Materials.
- Apple's Figma kits, for exact values and every component state: macOS 27 https://www.figma.com/community/file/1651309434229735362/macos-27 and iOS and iPadOS 27 https://www.figma.com/community/file/1651309003795292092/ios-and-ipados-27. More are listed in `liquid-glass`.
- Apple's own apps: System Settings (structure), App Store (update cards), Face ID setup (onboarding), Photos and Music (media), apple.com product pages (web), release notes and "What's New" sheets (copy).

## Related skills

- `design-patterns`: copy-ready code and tokens for proven components. Use it instead of inventing.
- `design-review`: the strict review to run before showing anything, with real approved and rejected pictures.
- `macos-app-design` and `web-design`: platform detail.
- `liquid-glass`: Apple's glass material and components, with exact values.
- `onboarding-design`: welcome tours and first-run flows.
- `mac-props`: showing an app on a believable Mac.
- `signature-moments`: the one creative, on-brand moment that makes a product memorable.
- `product-writing` and `release-notes`: every word the product shows.
- `ship-and-verify`: proving it works before saying so.
- If the person you work for has a profile skill (`working-with-<name>`) or the project has a `project-<name>` skill, load it too. Their picks override the defaults here.
