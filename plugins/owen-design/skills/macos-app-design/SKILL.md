---
name: macos-app-design
description: How Owen's Mac apps (and Apple-platform apps in general) must look and behave — SwiftUI/AppKit controls, Liquid Glass buttons, settings, onboarding, toolbars, update UI, windows, animation and screenshots. Load with apple-design whenever building or reviewing any macOS, iOS or SwiftUI interface.
---

# Mac app design (SwiftUI / AppKit, macOS 26 "Tahoe" and later)

Load `apple-design` first. This adds the platform detail.

## Controls
- **Primary button:** `.buttonStyle(.glassProminent).tint(.blue)`, capsule, one size across the app. Owen: "just use straight up blue liquid glass button with the same shape and size."
- **Secondary buttons:** the app's standard bordered/glass style, never custom-drawn.
- **Switches:** a real `Toggle(...).toggleStyle(.switch)`. When a switch must appear inside a screenshot (e.g. a picture of System Settings), place the *real* Toggle on top of the real screenshot at the right pixel position — don't draw one.
- **Progress:** real `ProgressView` (linear with a percentage while downloading, indeterminate while installing), shown *in place of* the button that started it, with a smooth transition.
- **Icons:** SF Symbols only, matching weight to the text beside them.
- **Toolbar badges/indicators:** a normal `ToolbarItem` `Label(..., systemImage:)` with `.labelStyle(.iconOnly)` and a tint. Clicking it navigates; it never performs the action.

## Hover and motion
- Every button has hover feedback. The signature pattern: on hover the label blurs/morphs into a symbol (e.g. "Install" → `arrow.down`), copied from the website's download button.
- The hover area is the whole control: `.contentShape(Capsule())` + `.onHover`. A hover that only triggers in the middle was rejected.
- Transitions: `.smooth(duration: 0.35)`, opacity + slight scale (0.96). Read `@Environment(\.accessibilityReduceMotion)` and drop the animation when it's on.

## Settings windows
- Structure like System Settings: titled sections, grouped rows (icon, title, detail, trailing control), a short footer sentence.
- The section people need most goes first (Updates sits at the top of General).
- One trailing control per row. Detail text is one short line.
- An update card reads like an App Store / GitHub release: app icon (~72 pt), "App X.Y.Z" in bold, one Install button, then the release pictures and notes rendered cleanly. A "Check Again" control lives in the row above. Only one Install button anywhere.

## Onboarding / setup
- The bar to hit is in `onboarding-design` (full-bleed scene, zoom into the real feature, live morphing panel, blur crossfades).
- Use the project's tour framework (in Gaze: TourKit) for **every** page. Layout: media on top, page dots or step counter at the bottom of the media, title and one or two sentences below, the blue primary button at the bottom.
- Media is real: screenshots or short looping muted recordings of the actual app or macOS. Loops must be seamless (`AVPlayerLooper`), no playback controls.
- Opening a single step from Settings (e.g. "Change password") opens **only that page** and closes when done — never the whole tour.
- If the app must live in /Applications (or needs a permission), detect it and help with one clear button (e.g. "Quit and Reopen"), rather than explaining in paragraphs.

## Windows
- No transparent/ghost outer windows, no stray title bars, no double shadows.
- Sheets and panels are sized to their content — nothing long or stretched.
- Lock-screen or overlay panels: grow out of the notch/edge, don't fade the window itself.

## Taking pictures of the app (for review and release notes)
- Never screenshot the owner's real, configured app to test UI. Run a separate copy (e.g. copy the .app to /tmp, change its version so an update shows, re-sign it, launch with the project's review flags).
- Capture only the app window; crop tightly; no black frame; hide test values that look wrong in public (like a fake old version number) unless that's the point.
- Things macOS won't let you capture (the real lock screen) get a faithful staged shot using the real UI on a real screenshot backdrop.

## Writing inside the app
Follow `product-writing`: "Gaze 0.1.7 is available.", "Check Again", "Checking…", "Installing…", "Couldn't check for updates. Try again." Security prompt reasons are plain actions ("add a face"). Never show HTTP codes, model names or thresholds — log them instead.
