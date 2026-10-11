# Devices beyond the Mac

For a Mac app, use the full Mac scene in `../examples/mac.html`. These are for everything else.

## Which frame

- **iPhone app or a phone view of a site:** `iphone.html`. Apple's real iPhone 18 Pro bezel with the screenshot under it, cut to the exact screen shape. Size it with `--device-width`.
- **An iPhone app's hero or launch picture:** `iphone-air/`. A photographic scene of three floating iPhone Airs. Run from this `devices/` directory: `python3 iphone-air/place.py shot.png out.jpg` puts real screenshots on both screens in perspective.
- **A website:** `browser.html`. A Safari-style window, light and dark (add class `dark` or `light` to `<html>` to force one).
- **The link preview when someone shares the site:** `og-image.html`, rendered by `make-og.mjs`.
- **Favicons and home-screen icons:** `make-icons.sh`.

## Swapping in a screenshot

- iPhone: take it on a real iPhone or the Simulator (Cmd+S) at full resolution, 1206x2622 for the 18 Pro, status bar included. Save as `screenshot-iphone.png`.
- Browser: capture the page at 1440 px wide, 2x, just the page (no browser chrome). Save as `screenshot-site.png`.

The screenshot is always real and at the device's own resolution. Never a drawn copy, never a stretched one. If the app doesn't exist yet, say so and use the parts kit instead.

## Link preview

    node make-og.mjs --title "Gaze" --line "Unlock your Mac with a look." --image ./shot.png --out public/og.png

Then in `<head>`:

    <meta property="og:image" content="https://example.com/og.png">
    <meta name="twitter:card" content="summary_large_image">

Keep the line short: it's read at thumbnail size.

## Icons

    sh make-icons.sh icon-1024.png public

It prints the `<link>` tags to paste.
