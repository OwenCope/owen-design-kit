---
name: web-design
description: How to build websites that feel like apple.com product pages - layout, type, colour, real imagery, the download button, light and dark themes, phone layouts, motion, accessibility and deploy discipline. Use with apple-design whenever building, restyling or reviewing any website, landing page, docs page, release page or web component.
---

# Website design

Load `apple-design` first; this adds the web detail. For glass materials and components, load `liquid-glass`. For copy-ready CSS, load `design-patterns`.

## Look and feel

- **An Apple product page, not a SaaS template.** A big confident headline, one short line under it, one primary action, a real product picture, then generous space. No hero badges, stat rows, testimonial grids, logo walls, bento boxes or rows of identical icon cards.
- **The "AI template" look gets rejected on sight:** gradient text, colour glows behind things, uniform grids of identical cards, fake app windows, drawn browser chrome.
- **Give each product its own signature.** Shared craft (space, type, real pictures) is good; reusing another site's signature effects makes the new one read as a recolour.
- **Type:** the system stack first, `-apple-system, BlinkMacSystemFont, <web font>, "Segoe UI", sans-serif`. Tight, bold headlines; body about 17 px with line height about 1.5; lines under about 70 characters. A brand font can carry the wordmark.
- **Colour:** mostly neutral, with one accent used for the action. Dark sections are true dark, not purple-tinted.
- **Light and dark both ship.** Follow the system setting, give a visible switch in the nav that remembers the choice, and set the theme before first paint so the page never flashes.
- **Imagery:** real screenshots and recordings, crisp at 2×, with no frames or drop-shadow boxes unless they copy a real device. Every image has meaningful alt text.

## Buttons and controls

- **The download button is the signature.** A pill, a clear label ("Download for Mac"), a lively hover (the label morphs into an icon), and the same component everywhere it appears. Code is in `design-patterns`.
- **Primary:** a solid accent pill with a faint 1 px gradient rim. **Secondary:** the same pill filled with the page's ink colour, text in the background colour. Frosted or glossy glass pills read as dated.
- **Every control 44 px or shorter is a capsule:** buttons, inputs, search fields, selects, segmented controls and chips. Containers are large and concentric: cards 28 to 34, menus and popovers 16 to 20.
- Hover effects never move a button; a slight lift on hover reads as cheap. Change colour, glow or content instead.

## Motion

- Hover and press states on everything clickable: subtle, fast (about 200 to 350 ms), eased.
- No scroll-jacking, parallax, auto-advancing carousels, or fading in every element on scroll.
- Respect `prefers-reduced-motion`.

## Layout

- **Phone is first-class.** Check about 375 px wide every time you touch layout: no horizontal scroll, touch targets at least 44 px, headlines that wrap nicely (`text-wrap: balance`).
- One spacing scale and one container width across pages.
- Release pages keep the release pictures and read like the GitHub release.

## Accessibility

- Headlines are read once by screen readers (no duplicated animated text in the accessibility tree).
- Visible focus rings, correct labels, enough contrast, semantic headings.

## Engineering discipline

- Read the framework's own docs in the repo before writing framework code; versions change (for Next.js, check `node_modules/next/dist/docs/`).
- Before deploying: type-check and lint, then look at the page in a browser at desktop and phone widths.
- Deploy only when asked. Afterwards, load the live URL and confirm the change is really there.
- Secrets live in the host's environment variables, never in the repo or in chat.
