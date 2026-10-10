---
name: liquid-glass
description: Apple's Liquid Glass material and the macOS 27 components built on it, with exact values read from Apple's macOS 27 Figma kit. Load before building or reviewing Liquid Glass UI on the web (CSS) or in macOS/iOS apps (SwiftUI, AppKit), and whenever a toolbar, floating button, menu, popover, alert, sidebar, dock-like bar or notification card should look like current Apple glass.
---

# Liquid Glass

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

The kit offers five control sizes: mini (16), small (20), medium (24), large (28) and extra large (36). Mini, small and medium controls are rounded rectangles at radius about 6; large and extra large are capsules. This kit recommends the capsules and the larger, rounder containers: they read as current Apple and age better. Use these picks unless you are matching a dense native AppKit layout.

- **Capsules for controls.** Every standalone button or field in an app, and every web control 44 px high or less, is fully rounded (radius = height / 2).
- **Large sizes by default.** Large (28) for controls in content, extra large (36) for toolbars and the main action. On the web, controls are 44 px high, 52 px for the primary download button.
- **Large concentric containers.** Cards and panels 28 to 34, menus and popovers 16 to 20. Anything inside a container uses the container radius minus the inset.

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

Not preferred: radius 6 push buttons, pop-up buttons and segmented controls at mini, small and medium sizes; menus at radius 12 with radius 8 highlights; sidebar selection at radius 8; the Dock fill's radius 15. Use them only when matching dense native AppKit layouts.

## What Liquid Glass is

- **A lens, not frosted plastic.** Glass bends the content behind it (refraction), most strongly at the curved edges, and only lightly blurs it. Content stays recognisable through it. The old blur materials (Ultra Thin to Ultra Thick) still exist for big backgrounds; glass is a different, clearer thing.
- **Specular highlights.** A thin bright rim catches light along the edge, brightest at the top and bottom curves, plus a soft brighter band just inside the top and bottom edges.
- **Adaptive.** The tint reacts to what is behind it: light glass gets a bit darker over bright content, dark glass a bit lighter over dark content, so labels stay readable. Small controls are more adaptive than large panels.
- **A layer that floats on top of content.** Glass sits above the content layer for controls and navigation: toolbars, tab bars, floating buttons, menus, popovers, alerts, the Dock. Content itself (lists, documents, photos, cards in a feed) is not glass.
- **Never glass on glass.** Glass cannot sample other glass. Controls that sit on a glass bar are drawn flat (no glass of their own) and grouped into one glass shape. If two glass elements meet, merge them into one container.

See `glass-material-light.png` and `glass-material-dark.png`: the same small, medium and large glass over a grey ramp, and tinted small glass in green, yellow, orange, red, purple and blue.

## Anatomy

Every glass element in the kit has the same two layers stacked in one shape:

1. **Fill + Shadow**: the tint, the hairline rim and the drop shadow.
2. **Glass Effect**: Figma's glass effect (refraction and frost) with inner shadows for the edge highlights.

All corners use 60% corner smoothing (Apple's continuous "squircle" corner).

### Figma glass effect settings

| Use | Frost | Refraction | Depth | Light intensity | Dispersion | Splay |
|---|---|---|---|---|---|---|
| Small controls (buttons, toolbar groups, search) | 6 | 0.7 | 30 | 0.25 | 0.2 | 0.2 |
| Medium and large panels, alerts | 16 | 0.7 | 30 | 0.25 | 0.2 | 0.2 |
| Dock | 16 | 0.7 | 30 | 0.10 | 0.2 | 0.2 |
| Menus | 25 | 0.7 | 40 | 0.20 | 0.4 | 0.2 |
| Notifications | 25 | 0.7 | 30 | 0.25 | 0.2 | 0.2 |
| Popovers | 26 | 0.7 | 40 | 0.15 | 0.2 | 0.4 |
| Pressed toggle or slider knob | 0 | 0.9 | 4 | 0 | 0 | 0.2 |

Light angle reads 0 on every node. So: controls are nearly clear (frost 6), panels a bit frostier (16), and text-heavy surfaces (menus, popovers, notifications) frostiest (25 to 26) so text reads well.

### Fill (tint)

| Element | Light | Dark |
|---|---|---|
| Panel (large, medium, alert) | white 70% (Lighten) + #BFBFBF 10% (Darken) | #1A1A1A 70% and 90% (Luminosity) + #1A1A1A 100% (Lighten): close to solid #1A1A1A |
| Small control (toolbar button, group, search) | black 25% + white 25% + #444444 60% (Linear Dodge) + #F8F8F8 20% (Luminosity) | #999999 17% (Luminosity) |
| Menu | #D9D9D9 55% (Luminosity) + #D9D9D9 40% | white 20% (Overlay) + #404040 80% (Luminosity) |
| Popover | white 70% (Lighten) + #BFBFBF 10% (Darken); body #E2E2E2 35% with background blur 81.5 | #1A1A1A 50% + 50% (Luminosity) + #1A1A1A (Lighten) |
| Notification | #BFBFBF 25% (Lighten) + #1A1A1A (Linear Dodge) | same component, adapts via blend modes |
| Dock | #4D4D4D 30% (Luminosity) + #1A1A1A 10% (Linear Burn) + white 8% (Lighten) | same |
| Prominent (tinted) control | white backing at 94% opacity, then accent #0088FF (Linear Burn) on top | same |

The Luminosity and Lighten blend modes are what make the tint adapt to the background. On the web you approximate this with a translucent fill plus `saturate()`.

### Rim (edge light)

Drawn as hard drop shadows (0 blur) under the glass:

- Hairline all round: spread 0.5, light #DBDBDB, dark #A6A6A6 (small controls: light #E8E8E8, dark #A6A6A6), Linear Burn.
- Side rims: x offset ±1.25, spread −0.75, same colours (small controls light #D0D0D0). This makes the left and right curves read slightly thicker than top and bottom.
- Popover rim is finer: x ±0.5, plus y ±0.5 lines in dark (#CCCCCC).
- Popover body also has a 0.5 px outside stroke, black 6%.

### Inner highlight

- Top and bottom brightening band: two inner shadows, y offset ±40, spread −40, blur 10, colour #282828 (light) or #1A1A1A (dark), Linear Dodge. Linear Dodge adds, so this lifts the inside of the top and bottom edges by roughly 10 to 16% white over about 10 px.
- Small controls add a third inner shadow, #E6E6E6, y +40, spread −40, blur 30, Linear Burn: a soft shade so the capsule reads as a solid drop.
- Menus add a 0.5 px inner rim: #262626 (light) or #404040 (dark), Linear Dodge.
- Popovers use a tight 1 px rim: inner shadows y ±1, blur 1, #333333, Color Dodge and Linear Dodge, plus body inner shadow 0 0.5 1 spread 0.5, white 50%.
- Pressed knob: specular inner shadows y ±3, spread −2.25, blur 0.5, #282828 Linear Dodge.

### Outer shadow

| Element | Light | Dark |
|---|---|---|
| Large and medium panels, alerts | 0 18 48, black 25% | 0 18 48, black 45% |
| Menus, popovers, notifications | 0 8 48, black 25% | 0 8 48, black 45% |
| Popover body (extra) | 0 8 15 spread 6, black 18%; 0 2 4, black 15% | same |
| Small controls | 0 8 15, black 2% | 0 8 15, black 4% |
| Dock | hairline only (spread 0.5, black 25%) | same |

Small controls barely cast a shadow. They lean on the rim and refraction.

### Corner radii

Radii are concentric: inner radius = outer radius minus the inset between them. The kit values are listed; where Recommended differs, it comes first (see "Recommended picks").

| Element | Size | Radius |
|---|---|---|
| Window, sheet | any | 16 |
| Large and medium glass panel, alert | any | 34 |
| Popover, notification | 200 wide, 344 x 56 | 20 |
| Menu | any | Recommended: 16, highlighted item 10. Kit: 12, highlighted item 8 (not preferred) |
| Dock | 1152 x 55 | Recommended: capsule (the outer frame). Kit fill layer: 15 (*estimated*, not preferred) |
| Toolbar button, group, segmented control, search field | 36 (XL) high; 24 (medium) not preferred | capsule |
| Buttons inside a toolbar group | 28 high in a 36 group (4 inset) | capsule |
| Alert buttons | 28 high, full width | capsule |
| Push buttons in content | Recommended: 28 (large) or 36 (XL) high | capsule. Kit 24 high at radius 6: not preferred |
| Segmented control in content | Recommended: 28 or 36 high | capsule. Small sizes at radius 6: not preferred |
| Pop-up and pull-down buttons | Recommended: 28 or 36 high | capsule. Mini, small, medium at radius 6: not preferred |
| Sidebar selection | Recommended: large size | 10. Kit 24 high at radius 8: not preferred |

### Blur materials (not glass)

Still used for backgrounds such as the sidebar. All use background blur 60. See `blur-materials-light.png`, `blur-materials-dark.png`.

| Material | Light | Dark |
|---|---|---|
| Ultra Thick | #ECECEC 88% + #333333 (Linear Dodge) | black 50% |
| Thick | #F6F6F6 72% | black 40% |
| Medium | #F6F6F6 60% | black 29% |
| Thin | #F6F6F6 48% | black 20% |
| Ultra Thin | #F6F6F6 36% | black 10% |

Sidebar background: background blur 80, then a Luminosity layer (#DAE6F2 at 92% active, #EDF4FA at 97% inactive, its own blur 120), then a Saturation layer #808080 at 85%. Result: a calm, slightly cool, desaturated panel that hints at the wallpaper.

## Components

**Glass material.** `glass-material-light.png`, `glass-material-dark.png`. Small glass is a 48 pt capsule, medium and large are 34-radius panels. Tinted small glass keeps the rim and highlight; only the fill changes colour.

**Toolbar.** `window-toolbar-sidebar-light.png`, `window-toolbar-sidebar-dark.png`. Items are grouped into glass capsules: a 36 pt group holds 28 pt icon buttons that are flat (no glass of their own), separated by 1 x 20 hairlines (#D9D9D9 light). The selected item gets a flat #E6E6E6 capsule inside the group. Single icon buttons are 36 pt glass circles. Search is a 36 pt glass capsule. Title sits on the window, not in glass. The toolbar has no bar background; the groups float.

**Icon button.** 36 pt (XL) glass circle (Recommended; 24 pt medium is not preferred), SF Symbol in #1A1A1A (light) or #F5F5F5 (dark). Same glass as small controls. See the toolbar pictures.

**Push buttons (content area).** Recommended: large (28 pt) or extra large (36 pt) capsules, not glass, in SwiftUI `.controlSize(.large)` with `.buttonBorderShape(.capsule)`. The kit's `buttons-push-light.png` and `buttons-push-dark.png` show the medium size, 24 pt high at radius 6: not preferred, only for dense native AppKit layouts. The styles carry over to the capsule. Bordered: black 8% fill, label black 85%. Tinted: accent at 20%, accent label. Prominent: solid accent #0088FF, white label. Destructive uses red the same way. Rows: idle, pressed (darker), disabled (faded).

**Text and search fields.** Recommended: capsule fields with a leading symbol, 36 pt in a toolbar (glass) and 28 pt in content (not glass, bordered fill); 44 px on the web. Rectangular fields at radius 6 are not preferred. See the Search field in the toolbar pictures.

**Pop-up and pull-down buttons.** Not in `reference/`; see the Buttons page of the Figma kit. Recommended: the large (28) or extra large (36) capsule with the chevron inside the pill, styled like a bordered push button. The mini, small and medium sizes at radius about 6 are not preferred.

**Prominent glass button.** In the small glass set: a 48 pt capsule with white backing at 94% and the accent laid over it, then the glass effect on top. It keeps the rim and refraction, so it reads as tinted glass rather than a flat blue pill. Use exactly one per view.

**Segmented control.** `segmented-light.png`, `segmented-dark.png`. Track black 8% (light) over the content, segments separated by 1 x 14 hairlines at black 25%, selected segment is solid accent with white text. Recommended: the large (28) or extra large (36) size, where the track and the selected segment are both capsules (bottom two rows of the picture). The mini, small and medium sizes at radius 6 are not preferred. In a toolbar it becomes a glass capsule group (see the toolbar pictures) with the selected segment as a flat grey capsule.

**Toggles.** `toggles-light.png`, `toggles-dark.png`. Recommended: the native switch at the large size (fourth column). Rows: off, off pressed, off disabled, on, on pressed, on disabled, at five sizes. At rest the knob is a white capsule. While pressed the knob grows and turns into clear glass (frost 0, refraction 0.9, white 9% fill, 0.5 px #CCCCCC rim, specular inner shadows), so you see the track bend through it.

**Sliders.** `sliders-light.png`, `sliders-dark.png`. Recommended: the large size, capsule track. Same idea: a white knob at rest becomes a glass lens while dragging, magnifying the filled accent track under it. Ticks sit below the track.

**Sidebar.** `sidebar-light.png`, `sidebar-dark.png`, and the window pictures. The sidebar is the blur material described above, not glass. Its toggle button is a 36 pt glass circle. Recommended: the largest sidebar size (right column), selection a flat row at radius 10, concentric with the sidebar (#F2F2F2 Linear Burn light, #0D0D0D Linear Dodge dark). The kit's 24 pt row at radius 8 is not preferred.

**Menus.** `menus-light.png`, `menus-dark.png`. Recommended: the largest menu (right), panel radius 16, roomy rows with generous padding, highlighted item radius 10 (concentric with a 6 inset). The kit's radius 12 panel with radius 8 highlights is not preferred. Frost 25, highlighted item in accent with white text, separators as thin lines inset from the edges, section headers in secondary text. Submenus are separate glass panels that overlap the parent edge.

**Popovers.** `popover-light.png`, `popover-dark.png`. Radius 20 with an arrow (the "cartouche") merged into the same shape. Frost 26, light intensity 0.15, splay 0.4: frostier and softer than controls, because popovers hold content.

**Alerts.** `alert-light.png`, `alert-dark.png`. A 260 wide glass panel at radius 34, app icon, bold title, body text at black 85%, then stacked full-width capsule buttons 28 high: prominent accent, destructive (red text on red tint), cancel (#E6E6E6 flat). Buttons inside are flat, not glass.

**Sheets and windows.** Not glass. Solid background (white or #1E1E1E), radius 16, shadow 0 18 54 black 30% (light) or 57% (dark), plus a 1 px black 80% outline shadow; dark adds a 1 px inside stroke white 20%. Inactive windows drop to 0 7 21 at 20% or 35%.

**Notifications and Dock (cards and tiles).** `desktop-notifications-dock-light.png`, `desktop-notifications-dock-dark.png`. Notification cards are 344 wide glass at radius 20, frost 25, stacked with 8 to 12 pt gaps (estimated). The Dock is one long glass shelf. Recommended for Dock-like bars: a full capsule (radius = height / 2), as the kit's outer frame draws it; the fill layer's radius about 15 is not preferred. It has light intensity 0.10 and strong 16 px top and bottom inner highlights; app icons sit on it without glass of their own.

## Web recipe

The web cannot do Apple's lensing with plain CSS. True refraction needs an SVG displacement filter in `backdrop-filter: url(#lens)`, which only Chromium supports. So the default is blur-based glass: backdrop blur plus saturation, a translucent fill, a 1 px gradient rim and an inner top highlight. Add the SVG lens only as a Chromium-only enhancement behind `@supports`.

Figma blur radii are about twice CSS `blur()` values (estimated), so frost 6 maps to about `blur(3px)` to `blur(4px)`, frost 16 to `blur(8px)`, frost 25 to `blur(12px)`, and the old materials (60) to `blur(30px)`. Real glass looks clearer than you expect; resist adding more blur.

```css
:root {
  --accent: #0088ff;
  --glass-fill: rgb(255 255 255 / 0.55);
  --glass-text: rgb(0 0 0 / 0.85);
  --glass-rim-strong: rgb(255 255 255 / 0.95);
  --glass-rim-soft: rgb(255 255 255 / 0.35);
  --glass-hairline: rgb(0 0 0 / 0.10);
  --glass-highlight: rgb(255 255 255 / 0.60);
  --glass-shadow: 0 18px 48px rgb(0 0 0 / 0.25);
  --glass-shadow-small: 0 8px 15px rgb(0 0 0 / 0.04);
  --glass-solid: #f2f2f2;
  color-scheme: light dark;
}

@media (prefers-color-scheme: dark) {
  :root {
    --glass-fill: rgb(26 26 26 / 0.60);
    --glass-text: rgb(255 255 255 / 0.92);
    --glass-rim-strong: rgb(255 255 255 / 0.45);
    --glass-rim-soft: rgb(255 255 255 / 0.12);
    --glass-hairline: rgb(0 0 0 / 0.50);
    --glass-highlight: rgb(255 255 255 / 0.18);
    --glass-shadow: 0 18px 48px rgb(0 0 0 / 0.45);
    --glass-shadow-small: 0 8px 15px rgb(0 0 0 / 0.08);
    --glass-solid: #262626;
  }
}

/* Glass surface: panels, popovers, menus, toolbar groups. */
.glass {
  --glass-radius: 34px;
  --glass-blur: 8px;
  position: relative;
  isolation: isolate;
  border-radius: var(--glass-radius);
  color: var(--glass-text);
  background: var(--glass-fill);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(1.8);
  backdrop-filter: blur(var(--glass-blur)) saturate(1.8);
  box-shadow:
    inset 0 1px 0 var(--glass-highlight),        /* top specular line */
    inset 0 10px 12px -10px var(--glass-highlight), /* soft band under the top edge */
    0 0 0 0.5px var(--glass-hairline),           /* outer hairline */
    var(--glass-shadow);
}

/* 1px gradient rim: bright at top and bottom, faint on the sides. */
.glass::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(
    180deg,
    var(--glass-rim-strong),
    var(--glass-rim-soft) 30%,
    transparent 50%,
    var(--glass-rim-soft) 75%,
    var(--glass-rim-strong)
  );
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
  pointer-events: none;
}

.glass--menu    { --glass-radius: 16px; --glass-blur: 12px; }
.glass--popover { --glass-radius: 20px; --glass-blur: 13px; }

/* Glass pill button: toolbar and floating actions. */
.glass-button {
  --glass-radius: 999px;
  --glass-blur: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 44px;
  padding: 0 18px;
  border: 0;
  border-radius: var(--glass-radius);
  background: var(--glass-fill);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(1.6);
  backdrop-filter: blur(var(--glass-blur)) saturate(1.6);
  color: inherit;
  font: 500 13px/1 system-ui, -apple-system, sans-serif;
  cursor: pointer;
  box-shadow:
    inset 0 1px 0 var(--glass-highlight),
    0 0 0 0.5px var(--glass-hairline),
    var(--glass-shadow-small);
  transition: transform 0.2s ease, background-color 0.2s ease;
}
.glass-button:hover  { background: color-mix(in srgb, var(--glass-fill), white 12%); }
.glass-button:active { transform: scale(0.97); }
.glass-button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

/* Prominent: tinted glass, one per view. */
.glass-button--prominent {
  --glass-fill: color-mix(in srgb, var(--accent) 90%, transparent);
  --glass-highlight: rgb(255 255 255 / 0.45);
  color: #fff;
}

/* Icon button: a circle with the same glass. */
.glass-button--icon { width: 44px; padding: 0; }

/* Controls sitting on a glass bar are flat. Never glass on glass. */
.glass .glass-button {
  background: transparent;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  box-shadow: none;
}

/* No backdrop-filter support, or the user asks for less transparency: go solid. */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass { background: var(--glass-solid); }
}
@media (prefers-reduced-transparency: reduce) {
  .glass {
    background: var(--glass-solid);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
  .glass-button--prominent { --glass-fill: var(--accent); }
}

/* Windows High Contrast and other forced colours. */
@media (forced-colors: active) {
  .glass {
    background: Canvas;
    color: CanvasText;
    border: 1px solid CanvasText;
    box-shadow: none;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
  .glass::before { content: none; }
  .glass-button--prominent { background: Highlight; color: HighlightText; }
}

@media (prefers-reduced-motion: reduce) {
  .glass-button { transition: none; }
  .glass-button:active { transform: none; }
}
```

Notes:

- Use `.glass` on the element that floats over content. Put `.glass-button` either on its own over content, or inside a `.glass` group where it goes flat automatically.
- The `mask` shorthand with `exclude` is the standard; `-webkit-mask-composite: xor` covers Safari.
- `prefers-reduced-transparency` is not supported everywhere yet. The solid fallback must still look finished, because it is what some people always see.
- Glass needs something behind it to be glass. Over a flat white page it looks like a grey pill; check it over real content and imagery, in light and dark.
- Optional Chromium lens: an SVG `<filter>` with `feTurbulence` or a pre-rendered displacement map into `feDisplacementMap`, referenced as `backdrop-filter: url(#lens) blur(4px)` inside `@supports (backdrop-filter: url(#x))`. Keep the blur fallback as the default.

## SwiftUI recipe

Use the system. It handles refraction, adaptive tint, accessibility settings and future OS changes for free.

```swift
// One floating control: glass in a capsule (the default shape).
Label("Share", systemImage: "square.and.arrow.up")
    .padding(.horizontal, 14).padding(.vertical, 8)
    .glassEffect()

// Custom shape, tint and touch response.
content
    .glassEffect(.regular.tint(.blue).interactive(), in: .rect(cornerRadius: 20))

// Several glass shapes near each other: group them so they blend, morph
// and never sample each other.
@Namespace private var glass
GlassEffectContainer(spacing: 8) {
    HStack(spacing: 8) {
        Button("Bold", systemImage: "bold") {}
            .glassEffect()
            .glassEffectID("bold", in: glass)
        Button("Italic", systemImage: "italic") {}
            .glassEffect()
            .glassEffectID("italic", in: glass)
    }
}

// Buttons
Button("Cancel") {}.buttonStyle(.glass)            // secondary
Button("Install") {}.buttonStyle(.glassProminent)  // the one primary action
```

When to use which:

- **Standard controls first.** Toolbars, `.toolbar` items, menus, popovers, sheets, alerts, `Toggle`, `Slider`, `Picker(.segmented)` and search fields already get Liquid Glass. Do not add `.glassEffect()` to them.
- **`.buttonStyle(.glass)`** for secondary buttons that float over content. **`.buttonStyle(.glassProminent)`** for the single primary action; it takes the app's tint.
- **`.glassEffect()`** for a custom floating element (a media control, a map overlay, a floating pill). Add `.interactive()` when it responds to touch or clicks, and `.tint(_:)` only to carry meaning.
- **`GlassEffectContainer`** whenever two or more glass elements are close. It renders them as one glass layer so they merge and morph instead of stacking glass on glass. Use `.glassEffectID(_:in:)` with a `@Namespace` to animate one shape into another, and `.glassEffectUnion(id:namespace:)` to join separate views into one shape.
- **AppKit:** `NSGlassEffectView` and `NSGlassEffectContainerView` are the equivalents.

## Rules

- **Glass is for controls and navigation that float over content.** Toolbars, floating buttons, menus, popovers, alerts, the Dock. Not for content: no glass cards in a list, no glass page sections, no glass behind body text.
- **Never glass on glass.** Controls on a glass bar are flat. Group neighbours in one container.
- **One tint colour.** Use the app's accent (#0088FF in the kit; websites use apple.com's #0071e3 instead, see `design-patterns`) for the one prominent action and for selection. Everything else stays untinted glass. Do not colour glass for decoration.
- **Keep text readable over anything.** Text and symbols on glass must hit WCAG AA (4.5:1 for body text, 3:1 for large text and icons) over the worst background they can float over. Test over white, black and a busy photo. If it fails, raise the fill opacity or frost before you change the text colour.
- **Respect Reduce Transparency, Increase Contrast and Reduce Motion.** Native APIs do this for you. On the web, ship the solid, forced-colours and reduced-motion fallbacks above.
- **Concentric corners.** Inner radius = outer radius minus inset. Capsules inside capsules stay capsules.
- **Capsules and large sizes.** Follow "Recommended picks": capsule controls at the large sizes, containers at 16 to 34. Radius 6 controls only to match dense native AppKit layouts.
- **Clear before frosty.** Small controls are nearly clear (frost 6); only text-heavy surfaces get heavier frost (25). If it looks like frosted plastic, there is too much blur.
- **Look at it over real content**, in light and dark, before showing it (see `apple-design`).
