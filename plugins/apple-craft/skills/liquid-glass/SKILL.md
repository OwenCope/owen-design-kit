---
name: liquid-glass
description: Apple's Liquid Glass material and the macOS 27 components built on it, with exact values read from Apple's macOS 27 Figma kit. Load before building or reviewing Liquid Glass UI on the web (CSS) or in macOS/iOS apps (SwiftUI, AppKit), and whenever a toolbar, floating button, menu, popover, alert, sidebar, dock-like bar or notification card should look like current Apple glass.
---

# Liquid Glass

Rules marked (house pick) are this kit's taste, not Apple's; change them freely if your product calls for it. Everything else follows Apple.

Source: Apple's "macOS 27 (Community)" Figma kit, pages Materials, Buttons, Toolbars, Segmented Controls, Toggles, Sliders and Dials, Sidebars, Menus, Popovers, Alerts, Sheets, Windows, Notifications. Values below were read from the layer properties unless marked *estimated*. Pictures are in `reference/`.

On Apple platforms, use the system API. Everything here is for checking that work, and for the web, where you have to build glass yourself.

## Figma files

Open these in Figma whenever you need an exact value, a state or a component this skill doesn't list. Duplicate a file to your drafts, then inspect a layer: fills, effects, radii and spacing are all in the right panel.

- **Apple's macOS 27 UI kit** (the source for this skill): https://www.figma.com/community/file/1651309434229735362/macos-27. Sidebars, toolbars, buttons, menus, popovers, alerts, sheets, windows, the menu bar, the Dock and notifications, in light and dark.
- **Apple's iOS and iPadOS 27 UI kit:** https://www.figma.com/community/file/1651309003795292092/ios-and-ipados-27
- **All of Apple's design resources** (Sketch kits, SF Symbols, fonts, product bezels): https://developer.apple.com/design/resources/
- **iOS 26 Toggle (Liquid Glass)**, a clear study of how the pressed knob turns into a glass lens: https://www.figma.com/community/file/1519712588579681470/ios-26-toggle-liquid-glass

When the kit and this skill disagree, the newer kit wins: check its change log, then update this file.

The values in this skill are already read from these kits, so work from them first. A Figma tool or connector usually needs a `figma.com/design/…` file key, which a Community link doesn't have; don't stop work to ask for one. Only ask the person to duplicate a kit when you need something this skill doesn't cover.

## Recommended picks

The kit offers five control sizes: mini (16), small (20), medium (24), large (28) and extra large (36). Mini, small and medium controls are rounded rectangles at radius about 6; large and extra large are capsules. This kit recommends the capsules and the larger, rounder containers: they read as current Apple and age better. Use these picks unless you are matching a dense native AppKit layout (house pick).

- **Capsules for controls.** Every standalone button or field in an app, and every web control 44 px high or less, is fully rounded (radius = height / 2) (house pick).
- **Large sizes by default.** Large (28) for controls in content, extra large (36) for toolbars and the main action. On the web, controls are 44 px high, 52 px for the primary download button (house pick).
- **Large concentric containers.** Cards and panels 28 to 34, menus and popovers 16 to 20 (house pick). Anything inside a container uses the container radius minus the inset.

| Component | Pick | Size | Radius | Reference |
|---|---|---|---|---|
| Buttons and pills | Capsule, large or extra large; glass prominent for the one primary action | App 28 (large) or 36 (XL); web 44, primary 52 | capsule | `glass-material-light.png` (small glass), `alert-light.png` (button shapes) |
| Pop-up and pull-down buttons | Large or extra large capsule with the chevron inside the pill | 28 or 36; web 44 | capsule | Figma kit, Buttons page (no picture in `reference/`) |
| Segmented controls | The two largest sizes: capsule track, capsule selected segment | 28 or 36; web 44 | capsule, segment concentric (capsule) | `segmented-light.png`, bottom two rows |
| Toggles | Native switch at the large size | large (fourth column) | capsule | `toggles-light.png` |
| Sliders | Large track and knob; knob turns to glass while dragging | large (bottom rows of each block) | capsule track, round knob | `sliders-light.png` |
| Text and search fields | Capsule field with leading symbol | 28 in content, 36 in a toolbar; web 44 | capsule | `window-toolbar-sidebar-light.png` (Search) |
| Menus | The largest menu: roomy rows, generous padding | rows about 24 to 28 high (*estimated*) | panel 16; highlighted item 10 (16 minus a 6 inset) | `menus-light.png`, right menu |
| Popovers | Glass panel with merged arrow | content-sized | 20; inner items concentric | `popover-light.png` |
| Alerts | Glass panel, stacked full-width capsule buttons | 260 wide, buttons 28 | panel 34, buttons capsule | `alert-light.png` |
| Sheets and windows | System sheet in apps; on the web a 28 radius dialog | content-sized | 16 native (system), 28 web | window pictures |
| Cards and panels | Large glass panel; content cards solid | any | glass 34, content cards 28 | `glass-material-light.png` (medium, large) |
| Sidebars and selection | Blur sidebar at the largest size, rounded selection row | rows about 32 high (*estimated*) | selection 10, concentric with the sidebar | `sidebar-light.png`, right column |
| Toolbars | Floating capsule groups, extra large | groups 36, inner buttons 28, icon buttons 36 circles | capsule | `window-toolbar-sidebar-light.png` |
| Dock-like bars | One floating glass shelf, icons flat on it | about 55 high | capsule (radius = height / 2) | `desktop-notifications-dock-light.png` |

Not preferred: radius 6 push buttons, pop-up buttons and segmented controls at mini, small and medium sizes; menus at radius 12 with radius 8 highlights; sidebar selection at radius 8; the Dock fill's radius 15. Use them only when matching dense native AppKit layouts (house pick).

## What Liquid Glass is

- **A lens, not frosted plastic.** Glass bends the content behind it (refraction), most strongly at the curved edges, and only lightly blurs it. Content stays recognisable through it. The old blur materials (Ultra Thin to Ultra Thick) still exist for big backgrounds; glass is a different, clearer thing.
- **Specular highlights.** A thin bright rim catches light along the edge, brightest at the top and bottom curves, plus a soft brighter band just inside the top and bottom edges.
- **Adaptive.** The tint reacts to what is behind it: light glass gets a bit darker over bright content, dark glass a bit lighter over dark content, so labels stay readable. Small controls are more adaptive than large panels.
- **A layer that floats on top of content.** Glass sits above the content layer for controls and navigation: toolbars, tab bars, floating buttons, menus, popovers, alerts, the Dock. Content itself (lists, documents, photos, cards in a feed) is not glass.
- **Never glass on glass.** Glass cannot sample other glass. Controls that sit on a glass bar are drawn flat (no glass of their own) and grouped into one glass shape. If two glass elements meet, merge them into one container.

See `glass-material-light.png` and `glass-material-dark.png`: the same small, medium and large glass over a grey ramp, and tinted small glass in green, yellow, orange, red, purple and blue.

## Where the details are

- `values.md` — exact numbers per component: glass effect settings, fills, rims, highlights, shadows, radii, blur materials, per-component specs, and the SwiftUI recipe.
- `web.md` — copy-ready CSS (`.glass`, `.glass--menu` / `.glass--popover`, `.glass-button`) with solid, reduced-transparency, forced-colours and reduced-motion fallbacks, plus usage notes.
- `reference/` — kit component pictures in light and dark, including `mac-ui-parts-light.png` and `mac-ui-parts-dark.png` for overall Mac UI context.

## Rules

- **Glass is for controls and navigation that float over content.** Toolbars, floating buttons, menus, popovers, alerts, the Dock. Not for content: no glass cards in a list, no glass page sections, no glass behind body text.
- **Never glass on glass.** Controls on a glass bar are flat. Group neighbours in one container.
- **One tint colour.** Use the app's accent (#0088FF in the kit; websites use apple.com's #0071e3 instead, see `design-patterns`) for the one prominent action and for selection (house pick). Everything else stays untinted glass. Do not colour glass for decoration.
- **Keep text readable over anything.** Text and symbols on glass must hit WCAG AA (4.5:1 for body text, 3:1 for large text and icons) over the worst background they can float over. Test over white, black and a busy photo. If it fails, raise the fill opacity or frost before you change the text colour.
- **Respect Reduce Transparency, Increase Contrast and Reduce Motion.** Native APIs do this for you. On the web, ship the solid, forced-colours and reduced-motion fallbacks in `web.md`.
- **Concentric corners.** Inner radius = outer radius minus inset. Capsules inside capsules stay capsules.
- **Capsules and large sizes.** Follow "Recommended picks": capsule controls at the large sizes, containers at 16 to 34. Radius 6 controls only to match dense native AppKit layouts (house pick).
- **Clear before frosty.** Small controls are nearly clear (frost 6, see `values.md`); only text-heavy surfaces get heavier frost (25). If it looks like frosted plastic, there is too much blur.
- **Look at it over real content**, in light and dark, before showing it (see `apple-design`).
