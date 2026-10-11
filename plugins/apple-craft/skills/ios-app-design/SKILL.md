---
name: ios-app-design
description: Designing iPhone and iPad apps that feel native on iOS 26 and later (current target iOS 27) - structure (tab bar, navigation, sheets), Liquid Glass bars, lists, text styles, touch, gestures, haptics, states and App Store pictures. Use when building or reviewing any iOS or iPadOS app screen in SwiftUI or UIKit, and when showing an iPhone app on a website or in a launch picture.
---

# iPhone and iPad app design

An iPhone app is judged in the first second by whether it feels like it belongs on the phone. Almost every "this feels off" comes from replacing something iOS already does well: a custom tab bar, a hand-drawn back button, a modal where a push belonged, a button too small for a thumb.

Start from the system. Change something only when the app has a real reason.

## Structure first

- **Tab bar** for the three to five places people switch between all day. It floats as a Liquid Glass capsule at the bottom; content scrolls under it, but the last row must be able to scroll fully clear of it (pad the bottom of the scroll view by the bar's height plus the home indicator). A section cut off behind the tab bar at the end of the list looks broken. Never more than five tabs; a sixth thing goes inside one of them.
- **Navigation stack** inside each tab: lists push into details, and swipe from the left edge goes back. Never break that gesture.
- **Sheets** for a short task that comes back to where you were: compose, filter, edit one thing. Sheets default to the .medium detent when people need surrounding context, .large for real work. A sheet with its own tab bar or deep navigation should have been a screen.
- **Full-screen covers** only for immersive things: camera, a player, onboarding.
- **iPad:** a sidebar instead of the tab bar when there's room, and real use of the width (two or three columns). An iPad app that is a stretched iPhone app fails review with people, if not with Apple.

## Bars and Liquid Glass

- Bars and controls float as glass over the content; the content is the background. Don't put glass on content (cards, rows).
- Large title at the top of the first screen in each tab, collapsing to a small centred title as you scroll.
- Toolbar actions are SF Symbols in glass capsules, grouped when they belong together. Text buttons only for words a symbol can't say ("Done", "Edit").
- One primary action per screen. On iOS that's often the trailing toolbar button or a single prominent button at the bottom — pick one per screen; if both appear, one is the real action and the other should move.
- **Prominent button:** one per screen, bottom within thumb reach:

    Button("Continue") {}
        .buttonStyle(.glassProminent) // already capsule-shaped; no buttonBorderShape needed
        .tint(.blue)
        .controlSize(.large)

  Press feedback per `design-patterns`: a brief tint or opacity change of the fill, never movement or scale.

## Lists and content

- Use the system list styles (inset grouped for settings and forms, plain for feeds). Rows are at least 44 pt tall, with the leading icon, title, optional detail and trailing chevron or value in Apple's order.
- Swipe actions for the two or three things people do to a row (delete, archive, pin), plus the same actions in a context menu on long press.
- Pull to refresh only where content really changes from elsewhere.
- Search lives in the navigation bar or as its own tab, with recent searches when empty.

## Text

Use the system text styles, which scale with Dynamic Type. Default sizes: Large Title 34, Title 1 28, Title 2 22, Title 3 20, Headline 17 semibold, Body 17, Callout 16, Subheadline 15, Footnote 13, Caption 1 12, Caption 2 11. Never fix a font size in points; test the largest accessibility size and make sure nothing truncates that matters. (Canonical Dynamic Type rule lives in `macos-app-design` Accessibility: text styles, rows grow, never clip.)

Colours are the semantic system colours (label, secondary label, system background, grouped background, separator, the accent), so light, dark and increased contrast all work for free.

## Touch and feel

- Every tap target is at least 44x44 pt, even if the drawn icon is smaller.
- Primary actions sit within thumb reach, at the bottom half of the screen, especially on the larger phones.
- Haptics confirm real events (a successful save, a toggle, a snap into place), never decoration. Use the system feedback types.
- Motion follows the gesture: a sheet tracks the finger and settles with a spring; a dismissed item flies to where it went. Respect Reduce Motion.
- Keyboard: the right keyboard type for each field, Return moves to the next field, and the field being typed in is never hidden behind the keyboard.

## States

Every screen has empty, loading, error and offline states (`product-ui`). On iOS the empty state is a centred SF Symbol, one line of title, one line of explanation and at most one button, using the system's unavailable-content layout.

## Permissions and onboarding

Ask for a permission at the moment it's needed, after explaining in one line why, never on first launch. Onboarding is three screens at most, skippable, and ends in the app doing something real (`onboarding-design`).

## Reading Apple's iOS 27 kit in Figma

With the Figma connector set up (`figma-mockups`), these components in the "iOS and iPadOS 27" library give exact values and every state. Search for them by name with `search_design_system`:

- Tab Bar - iPhone, Tab Bar - iPad, Toolbar - Top - iPad
- Row, Row - Button, Row with Swipe Actions, Header, Section Title, Grouped Table Footer, Sidebar Row
- Sheet - iPhone, Sheet - iPad, Action Sheet, Grabber
- Status bar - iPhone 18 Pro, Status bar and Menu bar - iPad
- Progress Bar - Determinate Linear, the circular spinner
- Text styles "Large Title/Regular", "Title1/Regular" and so on, and colour variables under Labels/ (Primary, Secondary, Tertiary, Quaternary)
- Examples/List, Examples/Tab Bars, Examples/Sheets (Modals) show whole screens

Copy their numbers; don't draw your own.

## Web mock-ups of an iPhone app

When the brief is a browser mock-up rather than SwiftUI:

- The phone is the page: centre one device at real size (393x852 pt for iPhone 18 Pro), on a calm background. No marketing headline unless asked.
- Use the real frame from `mac-props/devices/iphone.html`, not a drawn rounded rectangle.
- Status bar 9:41, the Dynamic Island clear of content, the home indicator at the bottom.
- Text in SF Pro at the iOS sizes above, colours from the system palette (label #000/#FFF, secondary label light rgba(60,60,67,0.6) / dark rgba(235,235,245,0.6), grouped background #F2F2F7 / #000000).
- Scroll inside the screen, not the page, with the tab bar fixed over it and the last row clearing it.
- Check it at 390 px wide too: the mock-up itself must fit a phone.

## Showing the app

- On a website: `mac-props/devices/iphone.html` (Apple's official iPhone 18 Pro frame) for a clean flat device, or `mac-props/devices/iphone-air/place.py` for a photographic scene.
- App Store screenshots: real screens at the exact device size, one idea per screenshot with a short caption above, in the app's own colours. No fake notifications or invented data.
- Capture with the Simulator (Cmd+S) or a real device, status bar showing 9:41 with full signal and battery (`xcrun simctl status_bar booted override --time "9:41" --batteryState charged --batteryLevel 100 --cellularBars 4 --wifiBars 3`).

## Check

- Swipe back works everywhere it should.
- The largest Dynamic Type size, dark mode, and Reduce Motion.
- One-handed on the biggest phone: can the thumb reach the main action?
- iPad in split view at its narrowest.
- Every tap target 44 pt; every state designed.
