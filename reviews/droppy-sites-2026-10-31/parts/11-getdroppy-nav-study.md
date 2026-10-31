# 11. getdroppy.app global nav study

Date: 2026-10-31. Live probes with Playwright Chromium at 1440x900 and 390x844, cookie banner dismissed. Behaviour and timings only. No site code, class names, or menu content is reused in the kit part built from this.

Shots: `shots/nav-study-top-1440.png`, `shots/nav-study-mob-closed.png`, `shots/nav-study-mob-open.png`, `shots/nav-study-mob-submenu.png`, `shots/nav-study-strip-desktop.png` (8 frames, closed plus first 350ms of the Features open), `shots/nav-study-strip-mobile.png` (8 frames, closed plus phone menu open).

## Measured values, desktop 1440x900

| # | What | Value |
|---|---|---|
| a | Hover intent, pointer enters Features to flyout starting | Panel gets going about 150ms after the pointer enters. The link tint itself starts at once (color animation visible within one poll frame). The `is-open` state landed ~260ms after the mouse started moving, including mouse travel time. |
| a | Open shape | One background element grows: height 44px to 614px (Features panel) over 400ms, curve cubic-bezier(0.52, 0.16, 0.24, 1). Background color shifts rgba(8,11,112,0.6) to rgba(8,11,100,0.97) over 320ms, curve cubic-bezier(0.4, 0, 0.6, 1). |
| a | Open content | Panel visibility flips at open start, so the box never sits empty. Links animate opacity and translateY(-4px) to none over 280ms with delay calc(60ms + index * 18ms). Index runs 0 to 18 in Features, so the last link starts near 380ms. Rest state is 120ms with no delay. |
| a | Top links | Color tint over 320ms, same 0.4, 0, 0.6, 1 curve. |
| a | Page dim | A curtain element fades in: rgba(4,6,64,0.34) fill plus 20px backdrop blur, opacity over 0.32s with the same standard curve. |
| b | Moving Features to iPhone | No close and reopen. The nav keeps one open state and the background height morphs (614px through 563px mid flight to 354px) while content crossfades. |
| c | Leaving the nav | Long grace delay: the open state lasts about 850ms after the pointer leaves the nav before closing starts. Then the background collapses 614px to 44px with the same height animation. |
| d | Keyboard | Each menu top item is a real link plus a small chevron button (14px wide, opacity 0 at rest, opacity 1 on focus). Enter or Space on the chevron opens the panel and sets aria-expanded true; focus stays on the chevron. Tab walks the panel links in order. Escape closes and returns focus to the top link. Arrow keys do nothing between top items. |
| e | Search | The magnifier button toggles a search panel inside the same surface (background 387px tall) and moves focus into the input. |
| f | Tone and scroll | Nav carries data-tone sky at top, paper once past the hero (changed between 1600px and 2400px scroll). Ink stays rgb(19,21,105) in both; the scrolled bar background reads rgba(247,246,255,0.8). The bar stays pinned while scrolling. No hide on scroll down. |

## Measured values, phone 390x844

| # | What | Value |
|---|---|---|
| g | Menu button | Two stacked lines. Span transitions: transform 0.36s with the open curve, background color 0.32s. They morph into an X when open. |
| g | Sheet open | Tap grows the background to full height (844px). Rows stagger in with scripted animation: 360ms duration, first row delay 60ms, then about 24ms per row. |
| g | Submenu drill | Tapping Features slides in its submenu (nav gains an is-sub state, a back button appears). Back slides out to the top level menu. Escape and the X close the sheet. |

Not measured: whether body scroll locks while the sheet is open, and the exact submenu slide curve (both read as instant in computed style, so they are script driven).

## What makes it feel good

1. One surface, never two boxes. The background grows and shrinks; content swaps inside it. Moving between top items morphs the height instead of closing, so the eye never loses the panel.
2. Content never waits for the shape. Visibility flips at open start and links begin staggering at 60ms, while the height still has 300ms to run. Nothing reads empty.
3. Intent has a delay, commitment does not. The 150ms hover delay stops flyouts from flashing as the pointer crosses the bar, and the generous 850ms leave delay forgives a pointer that slips off on the way down into the panel.
4. The dim sells the layer. A dark tint plus a real 20px blur drops the page back in one 320ms move, so the panel reads as above everything without a hard edge.
5. Keyboard users get the same panel. The chevron only appears on focus, opens with both Enter and Space, Tab order runs through the links, and Escape lands focus back on the top link.

## What to improve

1. The leave delay is generous to a fault at 850ms. A pointer travelling diagonally toward the panel is fine, but a pointer leaving for the page keeps a full screen dim up for nearly a second. An aim check (closing at once when the pointer moves away from the panel, keeping the delay only toward it) would fix it.
2. Arrow keys do nothing. With six menu items in a row, Left and Right should move between top items and Down should drop into the open panel.
3. Focus stays on the chevron when the panel opens instead of moving to the first link, which costs every keyboard user extra Tabs on every menu.
4. Tone only knows two states and the ink never changes, so the bar can only sit on pages that suit dark blue text. A light text tone for dark sections would widen where the bar works.
5. The phone rows animate with scripted delays while their CSS transition reads 0s, which means Reduce Motion depends on the script path doing the right thing rather than the style sheet. A single transition with per row delay degrades more safely.
