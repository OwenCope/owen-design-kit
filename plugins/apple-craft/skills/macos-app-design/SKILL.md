---
name: macos-app-design
description: How Mac apps (and Apple-platform apps generally) should look and behave on macOS 26 and later - SwiftUI and AppKit controls, Liquid Glass buttons, settings windows, update UI, onboarding, toolbars, windows, motion, and taking screenshots of the app. Use with apple-design whenever building or reviewing any macOS, iOS or SwiftUI interface.
---

# Mac app design (SwiftUI and AppKit, macOS 26 and later)

Load `apple-design` first; this adds the platform detail. For glass, load `liquid-glass`. For copy-ready SwiftUI, load `design-patterns`.

## Controls

- **Primary button:** `.buttonStyle(.glassProminent).tint(.blue)`, a capsule, one size across the app. Don't restyle it.
- **Secondary buttons:** the standard bordered or glass style with `.buttonBorderShape(.capsule)`, never custom-drawn.
- **Shape and size:** capsule controls at `.controlSize(.large)` (28 pt) or `.extraLarge` (36 pt) for buttons, pop-up buttons, segmented pickers and fields. The radius-6 rounded rectangles at smaller sizes are only for matching a dense native AppKit layout. Menus and popovers 16 to 20, panels about 34, inner items concentric.
- **Switches:** a real `Toggle(...).toggleStyle(.switch)`. When a switch must appear inside a screenshot (a picture of System Settings), place the *real* Toggle on the real screenshot; never draw one.
- **Progress:** a real `ProgressView` (linear with a percentage while downloading, indeterminate while installing), shown *in place of* the button that started it, with a smooth transition.
- **Icons:** SF Symbols only, weight matched to the text beside them. Use the symbol Apple uses for the same idea in System Settings (brightness `sun.max`, camera `camera`, lock `lock`, face `faceid`).
- **Toolbar indicators:** a normal toolbar `Label(..., systemImage:)` with `.labelStyle(.iconOnly)` and a tint. Clicking it navigates; it never performs the action.

## Hover and motion

- Every custom button has hover feedback. Native toggles, pickers and menus keep their system behaviour.
- A signature hover: the label blurs into a symbol ("Install" becomes an arrow). Code in `design-patterns`.
- The hover area is the whole control: `.contentShape(Capsule())` with `.onHover`.
- Transitions: `.smooth(duration: 0.35)`, opacity plus a slight scale (0.96). Read `@Environment(\.accessibilityReduceMotion)` and drop the animation when it's on.

## Settings windows

- Structure like System Settings: a sidebar, then titled sections of grouped rows (icon, title, short detail, one trailing control) and a short footer only where needed.
- Clean apps in this style use a sidebar with a capsule search field on top, coloured rounded-square icon tiles (about 32 pt), quiet grey group headers, and one subject per page. Cut clutter rather than add.
- The section people need most goes first (Updates at the top of General).
- Every new row is findable from Settings search.
- An update card reads like the App Store: app icon (about 72 pt), "App X.Y.Z" in bold, one Install button, then the release picture and notes. "Check Again" lives in the row above. One Install button anywhere.

## Onboarding and setup

- The bar is `onboarding-design`: a full-bleed scene, a zoom into the real feature, a live morphing panel, blur crossfades.
- Use one tour framework for **every** page: media on top, page dots at the bottom of the media, a title and one or two sentences below, the blue primary button at the bottom.
- Media is real: screenshots or short, seamless, muted loops of the actual app (`AVPlayerLooper`, no controls).
- Opening a single step from Settings ("Change password") opens **only that page** and closes when done.
- If the app must be in /Applications or needs a permission, detect it and help with one clear button ("Quit and Reopen") instead of paragraphs.

## Windows

- No transparent or ghost outer windows, stray title bars or double shadows.
- Sheets and panels are sized to their content, never long or stretched.
- Overlay panels grow out of the notch or edge; they don't fade the whole window.

## Taking pictures of the app

- Never screenshot the person's real, configured app to test UI. Run a separate copy (copy the .app, change its version so an update shows, re-sign it, launch with review flags).
- Capture only the app window and crop tightly, with no black frame. Hide test values that look wrong in public.
- What macOS won't let you capture (the real lock screen) gets a faithful staged shot of the real UI on a real screenshot.

## Words inside the app

Follow `product-writing`: "Version 0.1.7 is available.", "Check Again", "Checking…", "Installing…", "Couldn't check for updates. Try again." Never show HTTP codes, model names or thresholds; log them instead.
