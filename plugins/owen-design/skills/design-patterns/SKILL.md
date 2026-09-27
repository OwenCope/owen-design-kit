---
name: design-patterns
description: Copy-ready code for Owen's approved signature components and exact design tokens — the SwiftUI Liquid Glass morph button, settings rows, toolbar badge, progress swap, release card, and the website's download button morph, type scale, colours and spacing. Load whenever building a button, hover effect, settings screen, update UI, download button, headline or any component that should match what Owen already approved.
---

# Approved patterns (copy these, don't reinvent)

Every snippet here is live in Owen's products and was approved. Reuse them so new work matches.

## Shared motion token
- Curve: `cubic-bezier(0.22, 1, 0.36, 1)` (fast out, gentle settle). Duration: **340 ms** for morphs, 350 ms for layout swaps, 150 ms for colour hovers.
- Always disable under Reduce Motion (`accessibilityReduceMotion` / `prefers-reduced-motion`).

---

## Mac app (SwiftUI)

### Primary button with the label→symbol hover morph
Source: `FaceID/Sources/App/SettingsView.swift` (`InstallMorphLabel`).

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
- Sections: title above, grouped rounded container, one-sentence footer below.
- Row: SF Symbol (secondary colour) · title · one-line detail · one trailing control. Divider inset to the text.
- Most-needed section first. Search should find every row.

### Release / update card
Centre-aligned: app icon 72 pt (6 pt below) → "Gaze X.Y.Z" `.title2.bold` → the morph button (or progress) → release picture(s) full width with 12–14 pt continuous corners → notes (### headings semibold, bullets 13–14 pt, secondary colour). Padding 18 pt vertical. Nothing else.

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
Source: `gaze-site/src/app/globals.css`.

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
Source: `gaze-site/src/components/get-buttons.tsx` + `ui/morph-label.tsx`.
- Pill, min-height 52 px, padding 0 28 px, 18 px medium text, Apple mark + "Download", optional count chip.
- Blue fill with a faint white rim (1 px masked 135° gradient, 55% → transparent → 30%), soft shadow `0 2px 8px rgba(0,32,70,0.12)`.
- A version-menu half joined by a hairline, so it reads as one button.
- Hover: the label blurs out and the icon blurs in (MorphLabel below). Only on fine pointers, so touch never sticks.

### MorphLabel (label → icon blur morph)

    .root { --morph-dur: 340ms; --morph-ease: cubic-bezier(0.22,1,0.36,1); --morph-blur: 16px;
            position: relative; display: inline-grid; place-items: center; }
    .rest, .hover { grid-area: 1 / 1;
            transition: opacity var(--morph-dur) linear, filter var(--morph-dur) var(--morph-ease); }
    .rest  { opacity: 1; filter: blur(0); }
    .hover { opacity: 0; filter: blur(var(--morph-blur)); pointer-events: none; }
    @media (hover: hover) and (pointer: fine) {
      :where(a, button):hover > .root .rest  { opacity: 0; filter: blur(var(--morph-blur)); }
      :where(a, button):hover > .root .hover { opacity: 1; filter: blur(0); }
    }
    @media (prefers-reduced-motion: reduce) { .rest, .hover { transition: none; } }

Markup: `<MorphLabel icon={<Arrow/>}><span>Download</span></MorphLabel>` inside the button.

### Secondary pill
`inline-flex min-h-[52px] items-center gap-2 rounded-full px-[28px] text-[18px] font-medium` with the 7% → 11% neutral fill and `transition-colors duration-150`.

---

## Spacing (both platforms)
- App: 4-pt grid; common steps 4, 6, 8, 10, 14, 18, 24. Row inset matches the section's.
- Web: 4-px grid; section padding generous (≈ 96–160 px desktop, 64–96 px phone); content width capped; one column on phones.
- Corners: continuous. App cards 12–14 pt; pills fully rounded; images 12–14.
