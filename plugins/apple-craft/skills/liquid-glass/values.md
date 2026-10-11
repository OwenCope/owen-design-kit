# Liquid Glass values

Exact numbers per component, read from Apple's "macOS 27 (Community)" Figma kit unless marked *estimated*. Pictures are in `reference/`. For the short rulebook, see `SKILL.md`.

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

Radii are concentric: inner radius = outer radius minus the inset between them. The kit values are listed; where Recommended differs, it comes first (see "Recommended picks" in `SKILL.md`).

| Element | Size | Radius |
|---|---|---|
| Window, sheet | any | 16 |
| Large and medium glass panel, alert | any | 34 |
| Popover | content-sized | 20 |
| Notification | 344 x 56 | 20 |
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

**Pop-up and pull-down buttons.** No picture yet — verify in Figma kit before building; see the Buttons page of the Figma kit. Recommended: the large (28) or extra large (36) capsule with the chevron inside the pill, styled like a bordered push button. The mini, small and medium sizes at radius about 6 are not preferred.

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
