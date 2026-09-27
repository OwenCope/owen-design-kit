---
name: onboarding-design
description: The gold-standard onboarding/welcome tour Owen loves ("it is so smooth") — full-bleed art, a device frame that zooms into the real feature, the live UI morphing between pages, blur crossfades, one-line copy. Load when designing or reviewing any onboarding, welcome tour, setup flow, feature tour, "What's New" sheet or first-run experience, in any app or website.
---

# Onboarding that feels smooth

Reference: the Droppy welcome tour (frames in `examples/`, start with `0-whole-sequence.png`). Owen's verdict: "it is so smooth." Build every onboarding to this bar. It uses the same TourKit layout Gaze uses (media on top, dots, title, one line, one blue button) and pushes it further.

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

## How to build it (SwiftUI)
- A `ZStack`: full-bleed art (`.ignoresSafeArea`, `scaledToFill`), then the live feature layer, then a bottom `LinearGradient(.clear → .black.opacity(0.85))`, then the text + controls.
- Device-frame zoom: animate a `scaleEffect` + offset on the art-plus-frame group with `matchedGeometryEffect` for the notch → panel, `.smooth(duration: 0.6)`.
- Panel morph: one panel view whose size and content are driven by the page index; content swapped with `.transition(.opacity.combined(with: .blur))` (a custom blur modifier), size animated `.smooth(duration: 0.45)`.
- Stagger live content (e.g. files dropping in) 80–120 ms apart.
- Text: `.contentTransition(.opacity)` plus blur; keep a fixed frame so layout never jumps.
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
