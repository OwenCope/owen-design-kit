---
name: design-patterns
description: Copy-ready code and exact tokens for proven Apple-style components - the SwiftUI Liquid Glass button with a label-to-symbol hover morph, button-to-progress swap, settings rows, toolbar indicator, update card and media frame, plus the web download button, MorphLabel CSS, type scale, colours and spacing. Use whenever building a button, hover effect, settings screen, update UI, download button, headline or any component, instead of inventing one.
---

# Approved patterns (copy these, don't reinvent)

Every snippet here ships in real products (the Gaze Mac app and gazeunlock.com) and was approved after earlier versions were rejected. Copy the code and the values; the source paths are only for reference.

## Shared motion token
- Curve: `cubic-bezier(0.22, 1, 0.36, 1)` (fast out, gentle settle). Duration: **340 ms** for morphs, 350 ms for layout swaps, 150 ms for colour hovers.
- Always disable under Reduce Motion (`accessibilityReduceMotion` / `prefers-reduced-motion`).

---

## Mac app (SwiftUI)

### Primary button with the label→symbol hover morph
From Gaze (github.com/OwenCope/Gaze, `Sources/App/SettingsView.swift`).

    struct MorphButton: View {
        let title: String            // "Install"
        let symbol: String           // "arrow.down"
        var isEnabled = true
        let action: () -> Void
        @State private var hovered = false
        @Environment(\.accessibilityReduceMotion) private var reduceMotion

        var body: some View {
            let morphed = hovered && isEnabled && !reduceMotion
            Button(action: action) {
                ZStack {
                    Text(title)
                        .font(.system(size: 14, weight: .semibold))
                        .opacity(morphed ? 0 : 1)
                        .blur(radius: morphed ? 8 : 0)
                    Image(systemName: symbol)
                        .font(.system(size: 15, weight: .semibold))
                        .opacity(morphed ? 1 : 0)
                        .blur(radius: morphed ? 0 : 8)
                        .accessibilityHidden(true)
                }
                .frame(width: 160, height: 22)
                .animation(.timingCurve(0.22, 1, 0.36, 1, duration: 0.34), value: morphed)
            }
            .buttonStyle(.glassProminent)
            .buttonBorderShape(.capsule)
            .tint(.blue)
            .controlSize(.large)
            .disabled(!isEnabled)
            .contentShape(Capsule())      // hover on the whole button, not just the word
            .onHover { hovered = $0 }
            .accessibilityLabel(title)
        }
    }

Rules: one per screen; 160 pt wide label area; never restyle it.

### Button → progress swap
Replace the button *in place* with a 260 pt linear `ProgressView` + monospaced "42%", then an indeterminate bar + "Installing…". Wrap both in a `ZStack` with fixed height 36, transition `.opacity.combined(with: .scale(scale: 0.96))`, animate with `.smooth(duration: 0.35)` (nil under Reduce Motion).

### Toolbar indicator (navigates, never acts)

    ToolbarItem(placement: .navigation) {
        Button { showUpdates() } label: {
            Label("Update available", systemImage: "square.and.arrow.down")
                .labelStyle(.iconOnly)
        }
        .foregroundStyle(.blue)
        .help("Update available")
    }

Rejected before this: tall capsule, grey bubble, big blue circle.

### Settings layout
- Sections: a title above, a grouped rounded container, and a one-sentence footer only when the section needs explaining.
- Row: SF Symbol (secondary colour), title, one-line detail, one trailing control.
- Dividers inset to the text between rows that have icons; full-width only above a card or block. Match the dividers already in that section.
- Reuse the project's existing toggle row instead of building a new one.
- Every new row gets a Settings search entry with 3 to 6 keywords. A row that search can't find is unfinished.
- Most-needed section first. A new row goes in the section whose title matches what it does, next to its closest relative.

### Release / update card
Centre-aligned: app icon 72 pt (6 pt below) → "App X.Y.Z" `.title2.bold` → the morph button (or progress) → release picture(s) full width with 12–14 pt continuous corners → notes (### headings semibold, bullets 13–14 pt, secondary colour). Padding 18 pt vertical. Nothing else.

### Real media in a frame

    content
        .aspectRatio(16.0 / 10.0, contentMode: .fit)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay { RoundedRectangle(cornerRadius: 14, style: .continuous).strokeBorder(.white.opacity(0.12), lineWidth: 1) }
        .shadow(color: .black.opacity(0.45), radius: 24, y: 12)

(Hairline at 12% white, never a black border. Loops with `AVPlayerLooper`, muted, no controls.)

---

## Website (Next.js / CSS)

### Type scale — the only seven sizes

| Class | Size | Weight | Line height | Tracking |
|---|---|---|---|---|
| `.type-display` | clamp(2.75rem, 7.5vw, 4.75rem) | 600 | 1.02 | -0.045em |
| `.type-title` | clamp(2rem, 4vw, 3rem) | 600 | 1.06 | -0.035em |
| `.type-heading` | 28px | 600 | 1.15 | -0.025em |
| `.type-subhead` | 21px | 500 | 1.35 | -0.015em |
| `.type-body` | 17px | 400 | 1.55 | -0.01em |
| `.type-caption` | 14px | 400 | 1.45 | 0 |
| `.type-micro` | 12px | 500 | 1.35 | 0.01em |

Font stack: `-apple-system, BlinkMacSystemFont, var(--font-inter), "Segoe UI", sans-serif`. Don't add sizes; map to the nearest step.

### Colour
- Action blue: `#0071e3` (`--action-fill`). The only accent.
- Neutral fills from the foreground colour: `color-mix(in oklab, var(--foreground) 7%, transparent)`, 11% on hover.
- No purple/indigo, no gradient text, no neon.

### The download button (signature)
- Pill, min-height 52 px, padding 0 28 px, 18 px medium text, Apple mark + "Download", optional count chip.
- Blue fill with a faint white rim (1 px masked 135° gradient, 55% → transparent → 30%), soft shadow `0 2px 8px rgba(0,32,70,0.12)`.
- A version-menu half joined by a hairline, so it reads as one button.
- Hover: the label blurs out and the icon blurs in (MorphLabel below). Only on fine pointers, so touch never sticks.

### MorphLabel (label → icon blur morph)
As a CSS module (`morph-label.module.css`):

    .root { --morph-dur: 340ms; --morph-ease: cubic-bezier(0.22, 1, 0.36, 1); --morph-blur: 16px;
            position: relative; display: inline-grid; place-items: center; }
    .rest, .hover { grid-area: 1 / 1;
            transition: opacity var(--morph-dur) linear, filter var(--morph-dur) var(--morph-ease); }
    .rest  { opacity: 1; filter: blur(0); }
    .hover { opacity: 0; filter: blur(var(--morph-blur)); pointer-events: none; }
    .hover svg { width: var(--morph-icon, 20px); height: var(--morph-icon, 20px); }

    /* keyboard focus shows the icon too */
    :where(a, button):focus-visible > .root .rest  { opacity: 0; filter: blur(var(--morph-blur)); }
    :where(a, button):focus-visible > .root .hover { opacity: 1; filter: blur(0); }

    /* fine pointers only, so touch never sticks mid-morph */
    @media (hover: hover) and (pointer: fine) {
      :where(a, button):hover > .root .rest  { opacity: 0; filter: blur(var(--morph-blur)); }
      :where(a, button):hover > .root .hover { opacity: 1; filter: blur(0); }
    }

    /* Reduce Motion: no morph at all, the label stays */
    @media (prefers-reduced-motion: reduce) {
      .rest, .hover { transition: none; }
      .hover { display: none; }
      :where(a, button):hover > .root .rest,
      :where(a, button):focus-visible > .root .rest { opacity: 1; filter: blur(0); }
    }

Markup (`ui/morph-label.tsx`): `<MorphLabel icon={<Arrow/>}><span>Download</span></MorphLabel>` as the button's direct child.

### Secondary pill
The same pill as the blue button, filled with the page's ink colour:

    .pill-neutral { background-color: var(--ink); color: var(--bg); }
    @media (hover: hover) and (pointer: fine) {
      .pill-neutral:hover { background-color: color-mix(in srgb, var(--ink) 88%, var(--bg)); }
    }

The frosted glass pill (LiquidButton's `glass` variant) and glossy 2000s-style glass read as dated secondary buttons. The older 7% → 11% neutral-fill pill still appears on gazeunlock.com; prefer the ink pill for new work.

---

## Spacing and shape (measured from the code)

App (keep these as named constants in one `Theme` file):
- Corner radius 16 for grouped sections and surfaces (continuous corners); media 14; small chips are capsules.
- New work follows "Recommended picks" in `liquid-glass`: capsule controls at the large sizes, cards 28 to 34, menus and popovers 16 to 20, inner items concentric.
- Row inset 18 pt horizontal padding inside rows; section spacing 16 between sections.
- Stack spacing in use: 6 (label/detail pairs, most common), 8–10 (controls in a row), 12–16 (groups).
- Use the named constants; never type raw numbers when a constant exists.

Web:
- Sections: `py-16` on phones, `sm:py-24` above (64 px / 96 px); a hero may go to `sm:py-32`.
- Content widths: `max-w-[1000px]`–`[1100px]` for page sections, `max-w-[760px]` for reading text.
- Pills fully rounded (`rounded-full`), min height 52 px for primary actions, 44 px for other controls; small chips `py-0.5 px-2`, also `rounded-full`. Fields, segmented controls and selects are capsules too; no small-radius rectangular controls.
- 4-px grid (Tailwind's scale). Don't invent one-off pixel values.
