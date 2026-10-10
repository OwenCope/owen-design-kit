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
                        .font(.headline)            // a text style, so it follows Dynamic Type
                        .opacity(morphed ? 0 : 1)
                        .blur(radius: morphed ? 8 : 0)
                    Image(systemName: symbol)
                        .font(.headline)
                        .opacity(morphed ? 1 : 0)
                        .blur(radius: morphed ? 0 : 8)
                        .accessibilityHidden(true)
                }
                .frame(minWidth: 160, minHeight: 22)
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

Rules: one per screen; never restyle it. The 160 pt label area fits short English labels like "Install"; for longer labels or other languages size it to the widest label (`.fixedSize()` on a hidden copy, or measure) instead of truncating.

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
- Action blue on websites: `#0071e3` (`--action-fill`), apple.com's link and button blue. The only accent on a web page. Inside apps and app mock-ups use the system accent `#0088FF` (light) / `#0091FF` (dark) from `liquid-glass`, so an app screenshot and its mock-up match.
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

### FAQ disclosure (animated)

A row per question: the question on the left, a chevron on the right, a hairline between rows. Opening animates the height, fades the answer in and turns the chevron.

    <div class="faq">
      <details>
        <summary>What happens at two minutes?<svg class="chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></summary>
        <div class="answer"><div><p>One soft chime, then the countdown turns blue.</p></div></div>
      </details>
    </div>

    .faq details { border-top: 1px solid var(--hairline); }
    .faq summary { list-style: none; display: flex; justify-content: space-between; align-items: center;
                   gap: 24px; padding: 22px 12px; margin: 0 -12px; border-radius: 14px; cursor: pointer;
                   font-weight: 600; transition: background-color .25s ease; }
    .faq summary::-webkit-details-marker { display: none; }
    .faq summary:hover { background: var(--fill-quaternary); }
    .faq summary:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
    .faq .chev { width: 16px; height: 16px; flex: none; color: var(--secondary-label);
                 transition: transform .35s cubic-bezier(.22,1,.36,1); }
    .faq details.shown .chev { transform: rotate(180deg); }
    .faq .answer { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .4s cubic-bezier(.22,1,.36,1); }
    .faq details.shown .answer { grid-template-rows: 1fr; }
    .faq .answer > div { overflow: hidden; }
    .faq .answer p { margin: 0 0 22px; color: var(--secondary-label); opacity: 0; transform: translateY(-6px);
                     transition: opacity .3s ease .05s, transform .4s cubic-bezier(.22,1,.36,1); }
    .faq details.shown .answer p { opacity: 1; transform: none; }
    @media (prefers-reduced-motion: reduce) { .faq * { transition: none !important; } }

`<details>` opens and closes instantly on its own, so a little script drives it. The CSS keys on a `shown` class: opening sets `open`, then adds `shown` on the next frame so the height can grow; closing removes `shown`, waits for the height to shrink, and only then removes `open`. **Closing must animate as well as opening.** An answer that slides open and then snaps shut fails review.

    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    document.querySelectorAll('.faq details').forEach((d) => {
      if (d.open) d.classList.add('shown');
      d.querySelector('summary').addEventListener('click', (e) => {
        e.preventDefault();
        if (reduce.matches) { d.open = !d.open; d.classList.toggle('shown', d.open); return; }
        if (!d.open) {
          d.open = true;
          requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('shown')));
        } else {
          const answer = d.querySelector('.answer');
          answer.addEventListener('transitionend', function done(ev) {
            if (ev.propertyName !== 'grid-template-rows') return;
            answer.removeEventListener('transitionend', done);
            if (!d.classList.contains('shown')) d.open = false;
          });
          d.classList.remove('shown');
        }
      });
    });

## Spacing and shape (measured from the code)

App (keep these as named constants in one `Theme` file):
- Existing apps (Gaze, Droppy) use radius 16 for grouped sections and 14 for media. **New work does not:** it follows "Recommended picks" in `liquid-glass`: capsule controls at the large sizes, cards 28 to 34, menus and popovers 16 to 20, inner items concentric.
- Row inset 18 pt horizontal padding inside rows; section spacing 16 between sections.
- Stack spacing in use: 6 (label/detail pairs, most common), 8–10 (controls in a row), 12–16 (groups).
- Use the named constants; never type raw numbers when a constant exists.

Web:
- Sections: `py-16` on phones, `sm:py-24` above (64 px / 96 px); a hero may go to `sm:py-32`.
- Content widths: `max-w-[1000px]`–`[1100px]` for page sections, `max-w-[760px]` for reading text.
- Pills fully rounded (`rounded-full`), min height 52 px for primary actions, 44 px for other controls; small chips `py-0.5 px-2`, also `rounded-full`. Fields, segmented controls and selects are capsules too; no small-radius rectangular controls.
- 4-px grid (Tailwind's scale). Don't invent one-off pixel values.
