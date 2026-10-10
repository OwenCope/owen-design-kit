---
name: mac-props
description: How to show a Mac app on a believable Mac - a MacBook frame with a real macOS desktop inside it (wallpaper, menu bar that clears the notch, the app's window sitting just above a glass Dock), for websites, README images and release pictures. Covers capturing clean window screenshots, light and dark versions, the exact layout rules, and copy-ready HTML and CSS. Use for every landing page, product page, hero or release picture of a Mac app, whenever a page shows an app "on a Mac", or when a product shot looks fake, cropped wrong, blurry or badly placed.
---

# Mac props

A product picture sells the app when it looks like a real Mac someone just photographed. It looks fake the moment one detail is off: a window covering the Dock, a cut-off title bar, a blurry icon, a dark screenshot on a light page. Every rule here comes from one of those mistakes.

## What ships with this skill

Don't stop to ask for assets or Figma files. Build the scene from these:

- `assets/macbook-air-shell.webp`: the laptop frame (1920×1280, transparent screen). The CSS below is measured for it.
- `scripts/make-assets.swift`: run it on any Mac to make the rest from the system itself, the real Dock icons, menu bar SF Symbols and a macOS wallpaper:

      swift scripts/make-assets.swift ./mac-assets --app /Applications/YourApp.app

  No app or icon yet? Make a temporary icon from an SF Symbol on a tinted rounded square, and say it's temporary:

      swift scripts/make-assets.swift ./mac-assets --symbol doc.on.clipboard --tint "#0A84FF"

- `examples/mac.html`: a complete, working scene (laptop, menu bar, window, Dock with the app and a running dot, light and dark). Copy it, drop in your window screenshots, and adapt.
- `examples/mac-ui.css` and `examples/mac-ui.html`: working macOS 27 parts measured from Apple's Figma kit, in light and dark: window with traffic lights, inset glass sidebar, toolbar with glass capsule groups and search, inset grouped rows with icons and values, switch, segmented control, capsule buttons, popover, menu, notch panel and notification. Copy the markup and change only the content. Don't write your own window, row or toggle CSS.

## Building the scene

The layers, back to front:

1. **The laptop shell**: `assets/macbook-air-shell.webp`, or another MacBook image with a transparent screen. Other sources: the free Figma mockup https://www.figma.com/community/file/1210198565936992993/free-macbook-air-m2-frontview-mockup (export the frame as PNG at 2× and measure where its screen sits), Apple's product bezels at https://developer.apple.com/design/resources/, or a device-frame tool such as MacProps if you have it. The menu bar and Dock sizes below are already measured; Apple's macOS 27 Figma kit (linked in `liquid-glass`) is only needed for something not covered here.
2. **A black plate** behind the screen, so the bezel never shows the page through.
3. **The wallpaper**: a real macOS or brand wallpaper, filling the screen. Pick one that lets the product read: calm, low contrast behind the window. A loud, saturated wallpaper (the bright blue macOS default) drowns the UI. Don't reuse the same wallpaper as the last site you made.
4. **The menu bar**: the Apple logo on the left; battery, Wi-Fi, Control Center and the time on the right, starting *after* the notch. The right side must be the real SF Symbols from `make-assets.swift` (battery, Wi-Fi, Control Center, Spotlight), exported as images at 2x and drawn at the real size: about 15 pt tall glyphs, 18 to 22 pt apart, the clock in SF Pro Medium 13 pt. Hand-drawn or emoji-like icons, wrong weights, or symbols floating at different heights fail review. Compare with a real screenshot of your own menu bar at the same scale. Menu bar text follows the wallpaper: dark on a light wallpaper, white on a dark one, as macOS does. Size it from the screen *width* (`cqw`) so it clears the notch at every size.
5. **The app's window**: a real screenshot, sitting between the menu bar and the Dock, just above the Dock with the same small gap on every screen. If several screenshots rotate through the same Mac, give them all the same height so none jumps. Measure the gap in pixels; don't eyeball it.
6. **The Dock**: a glass capsule of real app icons, with the product's icon in it and a running dot under it. Keep real proportions: small icons (about 3.6 % of the screen width), tight padding. A chunky Dock reads as a toy.

**Build the screen at real size, then scale it.** Lay out the desktop at a real 1470 x 956 pt and scale the whole thing to the laptop's screen with one `transform: scale()` (see `web-design/examples/product-page.html`). Sizing UI parts in `cqw` or percentages squashes them: fonts, toolbars and rows stop matching macOS.

**Narrow windows** (settings, a welcome screen) keep their own shape: size them by height to fill the space from the menu bar to just above the Dock, and centre them.

**Even padding around the laptop.** Laptop images have wide transparent margins; crop them with negative margins so the laptop, not the empty PNG, sets the spacing. Then the gap from the card edge to the laptop is equal on all sides.

HTML and CSS:

    <div class="mac">
      <div class="plate" aria-hidden="true"></div>
      <div class="screen">
        <div class="mbar" aria-hidden="true">
          <svg class="apple">…</svg>
          <span class="gap"></span>
          <span class="right">…battery, wifi, control center… <b>Thu 9:41 AM</b></span>
        </div>
        <img class="window light" src="shot-light.webp" alt="What the window shows">
        <img class="window dark" src="shot-dark.webp" alt="" aria-hidden="true">
        <div class="dock" aria-hidden="true">
          <img src="dock/finder.png" alt=""> … <span class="run"><img src="dock/app.png" alt=""></span>
        </div>
      </div>
      <img class="shell" src="macbook-shell.webp" alt="" aria-hidden="true">
    </div>

    /* Percentages are measured for one 1920×1280 MacBook Air shell. Measure yours:
       the screen's left, top, width and height as a share of the image. */
    .mac { position: relative; aspect-ratio: 1920 / 1280; }
    .mac .plate  { position: absolute; left: 19.1%; top: 18.7%; width: 61.8%; height: 59.6%; background: #000; }
    .mac .screen { position: absolute; left: 19.444%; top: 19.067%; width: 61.111%; height: 58.933%;
                   overflow: hidden; container-type: size; background: url(wallpaper.jpg) center / cover;
                   display: flex; justify-content: center; align-items: flex-start; padding: 4% 4% 7.5%; }
    .mac .shell  { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }

    .mbar { position: absolute; inset: 0 0 auto; height: 2.5cqw; padding: 0 1.6cqw; display: flex; align-items: center;
            gap: 1.6cqw; font: 500 1.2cqw/1 -apple-system, BlinkMacSystemFont, sans-serif; color: #1d1d1f; }
    .mbar .gap { width: 22cqw; }            /* the notch */
    .mbar .right { margin-left: auto; display: flex; gap: 1.4cqw; }
    .dark .mbar { color: #fff; }

    .mac .window { width: 100%; height: auto; border-radius: 1.6cqh; }
    .mac .window.dark, .dark .mac .window.light { display: none; }
    .dark .mac .window.dark { display: block; }

    .dock { position: absolute; left: 50%; bottom: 0.8cqw; transform: translateX(-50%); display: flex; gap: 0.15cqw;
            padding: 0.35cqw 0.45cqw; border-radius: 1.5cqw; background: rgb(255 255 255 / 0.28);
            backdrop-filter: blur(16px) saturate(170%);
            box-shadow: inset 0 0 0 0.5px rgb(255 255 255 / 0.55), 0 1cqh 3cqh rgb(0 0 0 / 0.18); }
    .dock img { width: 3.6cqw; height: 3.6cqw; }
    .dock .run { position: relative; }
    .dock .run::after { content: ""; position: absolute; left: 50%; bottom: -0.25cqw; width: 0.3cqw; height: 0.3cqw;
                        margin-left: -0.15cqw; border-radius: 50%; background: rgb(0 0 0 / 0.55); }

    /* A narrow window (settings, welcome) keeps its shape and fills the height above the Dock. */
    .mac .window.narrow { width: auto; height: 100%; max-width: 100%; }

    /* In a card: crop the shell's empty margins so the padding around the laptop is even. */
    .card .mac { width: 131.8%; margin: -14.9% -15.9% -12.6% -15.9%; }

## Mock-ups of unbuilt apps

If the app isn't built yet, build its main window as real HTML or SwiftUI and screenshot that; never draw a fake one.

**If Figma is connected, start there** (`figma-mockups`): pull each part's screenshot and values from Apple's kit. Otherwise start from the parts kit, every time.

**Build the mock-up from Apple's parts, not boxes.** When the app isn't built, its window and panels are assembled from real macOS 27 components, taken from Apple's macOS 27 Figma kit (linked in `liquid-glass`) or rebuilt to its exact measurements:
- a real window: traffic lights, a toolbar with Liquid Glass buttons and SF Symbols, the title in the toolbar, the system corner radius and shadow;
- real content structure: a sidebar with SF Symbol rows, grouped list rows or an inset form, segmented controls, switches, the system fonts and secondary label colours;
- for notch or menu bar apps, the real shapes: the notch's black, its exact corner curve, a menu bar extra, a popover with an arrow, glass material;
- real-looking data: names, times and icons, never "Lorem" or one line of text in an empty card.

A rounded rectangle with a few words in it is not a mock-up and fails review.

If SwiftUI is available, building the view in SwiftUI and screenshotting it beats any HTML copy.

## Screenshots of real apps

**Crop window screenshots to the window's exact edge.** A window's shadow is uneven (mostly below), so trimming the same amount from every side cuts the title bar off the top and leaves a grey band at the bottom. Crop to where the alpha is fully opaque instead.

**Light and dark versions of every screenshot.** A dark screenshot on a light page looks broken. Swap them with the page's appearance.

**Use the largest source image you have.** An icon or screenshot scaled up from a small file is blurry however good the layout is. App icons: asset catalogues hold 1024 to 2048 px versions even when the `.icns` stops at 256.

**Show what the app does, not just that it exists.** A welcome screen, the feature in use, the window people will actually see.

### Capturing clean window screenshots (macOS)

- Run a separate copy of the app with demo data, never the person's own account or data.
- Capture one window with its alpha: `screencapture -l <windowID> shot.png` (find the ID with `CGWindowListCopyWindowInfo`). Add `-o` to drop the shadow.
- Set the window to the same size for every shot so they line up.
- Capture light, then switch the app (not the whole Mac) to dark and capture again. If you do switch the Mac's appearance, switch it back afterwards.
- Quit the demo copy by its process ID, never by bundle ID, which also quits the person's real copy.

## Full-screen desktop scenes

When a section *becomes* the Mac's desktop (a signature moment that fills the screen):
- Keep the Dock, with the app's icon in it; the scene is a Mac, not a wallpaper.
- Don't stack the website's own nav on top of the scene's menu bar. Hide or fade the site nav while the scene is pinned, so there's one bar at the top.

## Check before showing

**Then compare, part by part.** Before showing a mock-up, open the matching picture and put your render next to it at the same size:

| You built | Compare with (in `liquid-glass/reference/`) |
|---|---|
| Any window, sidebar, toolbar | `window-toolbar-sidebar-light.png` / `-dark.png`, `sidebar-*.png` |
| Switches, segmented controls, sliders | `toggles-*.png`, `segmented-*.png`, `sliders-*.png` |
| Buttons | `buttons-push-*.png` |
| Popovers, menus, alerts | `popover-*.png`, `menus-*.png`, `alert-*.png` |
| Notifications, Dock | `desktop-notifications-dock-*.png` |
| Glass surfaces | `glass-material-*.png`, `blur-materials-*.png` |
| The whole parts kit | `mac-ui-parts-light.png`, `mac-ui-parts-dark.png` |

List the differences you see (radius, padding, font size, colour, shadow) and fix them. A part with no comparison listed in the report fails review.

- Zoom to 300 % on the window's corners and the laptop edge: no cut-off title bar, no grey band, no dark fringe, no blur.
- Measure the gap from each window to the Dock; they should match.
- **The product is the hero of the shot.** Its UI must be readable at the page's normal size: at least 13 px text on screen, not a tiny card lost in the wallpaper. If the app lives in the notch or menu bar, add a close-up of that area next to or after the full Mac, so the actual feature can be read.
- **No notes to yourself on the page.** Captions like "icon is temporary" or "window art is a concept" are leftovers and fail review.
- Look at light and dark, and at phone width.
- Run `design-review`.
