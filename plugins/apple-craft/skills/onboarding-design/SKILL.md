---
name: onboarding-design
description: A gold-standard onboarding and welcome tour that feels smooth - one full-bleed scene, a device frame that zooms into the real feature, live UI that morphs between pages, blur crossfades and one-line copy - measured frame by frame from a real app, with SwiftUI and web build notes. Use when designing, building or reviewing any onboarding, welcome tour, setup flow, feature tour, "What's New" sheet or first-run experience.
---

# Onboarding that feels smooth

Reference: the Droppy welcome tour, frames in `examples/` (start with `0-whole-sequence.png`). People who see it call it "so smooth". Build every onboarding to this bar. It uses the common tour layout (media on top, dots, title, one line, one blue button) and pushes it further. Do not reuse Droppy's art, face, pages, words or page order; derive the layout from the product (a window app may need no device frame at all — see :70-72).

## What makes it work

1. **One continuous scene, not a stack of slides.** A single full-bleed artwork fills the whole window, edge to edge, behind every page. Pages change what's *on* the scene, never the scene itself. That is why it feels like one story.
2. **Start wide, then zoom into the real thing.** Page 1 shows the scene inside a Mac device frame (`1-welcome-device-frame.png`). Continuing zooms in until the Mac's screen *is* the window and its notch becomes the product's real panel (`2-zoomed-into-notch.png`). The camera move explains where the feature lives with zero words.
3. **Show the real feature working, live.** Each page shows the actual UI with real-looking content (files appearing one by one on the shelf, a player with real album art) — animated, not a static screenshot (`3-feature-live-in-panel.png`).
4. **Morph between features in place.** The panel stays put and reshapes into the next feature; the old content blurs out as the new content blurs in (`4-blur-crossfade-between-pages.png` → `5-panel-morphed-to-next-feature.png`). Nothing slides off screen; nothing pops.
5. **Text crossfades with the same blur**, and the title/body/button stay in exactly the same place across pages, so only the words change.
6. **Readable text over art** with a soft dark gradient rising from the bottom (no box, no card behind the text).
7. **Copy:** a short title that ends with a full stop and names the benefit ("Keep files within reach.", "Your music, one glance up."), then one or two plain sentences saying exactly what it does and what it works with. The first page says how long the tour takes ("Here's a one-minute tour.").
8. **Controls:**
   - Page 1: blue "Take the tour" + quiet text "Skip tour" below. Respect people who don't want the tour.
   - Later pages: one blue "Continue", a round back chevron top-left, a round close top-right.
   - Page dots between the art and the title; the current one is a longer pill.
9. **One colour world.** The art, the panel glow and the button blue all belong together.

## The motion, beat by beat (measured at 10 frames a second)

Open `examples/timeline-1.png` … `timeline-4.png`: every tenth of a second, timestamped. Single frames are named `frame-<time>.png`.

**Page 1 → 2 (click at 1.5 s)**
- 1.5 → 1.6 s: the Mac frame is gone in about 0.1 s. The art scales up slightly so the Mac's screen now fills the window. It's fast, a cut-like zoom, not a slow push.
- 1.6 → 2.2 s: the tiny hardware notch grows into a wide black panel, dropping down and widening over about 0.6 s, with a soft blue glow along its lower edge.
- 1.6 → 1.9 s: the old title and body blur out (about 0.1 s), then the new ones blur in (about 0.2 s), in exactly the same position. The button label crossfades from "Take the tour" to "Continue", "Skip tour" fades away, and the back chevron fades in top-left.
- The active page dot slides one step and stretches into the pill.

**The live feature (2.3 → 3.1 s)**
- The files arrive one by one, about 0.25 s apart: Tahoe.jpg, Brief.pdf, Notes.txt, then a folder.
- Each starts as a small grey rounded shape, grows into its real icon, then its name fades in underneath.
- The panel's own buttons stay pinned at the right while the items arrive.

**Page 2 → 3 (click at 4.2 s), about 0.4 s in total**
- 4.2 → 4.3 s: the shelf content blurs out while the panel stays.
- 4.3 → 4.5 s: the same panel grows wider and taller to the player's size.
- 4.5 → 4.6 s: the player blurs in: album art, title, scrubber, controls, "Playing Next".
- 4.3 → 4.6 s: the text blurs out and in, as on the first transition. The art doesn't move at all.
- After that, small things keep living: the equaliser bars animate while the rest holds still.

**In this tour, what never moves:** the artwork (after the first zoom), the text position, the button position, the back and close buttons. Only the panel and the words change, and that's why it reads as smooth.

## How to build it (SwiftUI)
- A `ZStack`: full-bleed art (`.ignoresSafeArea`, `scaledToFill`), then the live feature layer, then a bottom `LinearGradient(.clear → .black.opacity(0.85))`, then the text + controls.
- Device-frame zoom: the frame leaves in about 0.1 s while the art scales up to fill the window. Then the notch grows into the panel over about 0.6 s (`matchedGeometryEffect` from notch to panel, `.animation(.smooth(duration: 0.6), value: page)` — `.smooth` is a real SwiftUI animation on macOS 14+/iOS 17+).
- Panel morph: one panel view whose size and content are driven by the page index; content swapped with `.transition(.opacity.combined(with: .blur))` (a custom blur modifier), size animated `.animation(.smooth(duration: 0.25), value: page)`. The whole page change is about 0.4 s: content out (0.1 s), resize (0.2 s), content in (0.1 s).
- Stagger live content about 250 ms apart. Each item grows from a small grey placeholder into its real icon, then its label fades in.
- Text: blur out about 0.1 s, blur in about 0.2 s, in a fixed frame so the layout never jumps. Crossfade the button label, never the button itself.
- Reduce Motion: no zoom or morph — crossfade only.
- Buttons: the `design-patterns` primary button; back/close are small glass circles.

## For the web
Same structure: fixed full-bleed art, one persistent panel element animated with FLIP or the View Transitions API, `filter: blur()` + opacity crossfades with `cubic-bezier(0.22, 1, 0.36, 1)`, and a `prefers-reduced-motion` fallback.

## Checklist
- Is there one continuous scene behind every page?
- Does the first move zoom from "the device" into "the real feature"?
- Is every feature shown live, with real-looking content?
- Do pages morph in place with blur crossfades — nothing slides or pops?
- Title ends with a full stop and names the benefit; body ≤ 2 lines?
- "Skip tour" on page 1; Continue / back / close after?
- Works with Reduce Motion?
- Keyboard: back, continue and close reachable in order and announced; Escape closes or goes back; Reduce Motion already covered above.

## Apps without a notch panel

The "zoom into the device" opening is for apps that live in the notch or menu bar. For a normal window app, open on the app's own icon instead: it scales up from the centre and the welcome window grows out of it (the same timing, about 0.6 s, eased out). For a menu bar app without a notch panel, zoom into its menu bar icon and let the popover open from it.
