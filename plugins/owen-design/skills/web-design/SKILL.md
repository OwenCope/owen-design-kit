---
name: web-design
description: How Owen's websites must look and behave — Apple product-page feel, typography, real imagery, the download button, phone layouts, accessibility, performance and deploy discipline. Load with apple-design whenever building, restyling or reviewing any website, landing page, docs page, release page or web component.
---

# Website design

Load `apple-design` first. This adds the web detail.

## Look and feel
- **Apple product page, not a SaaS template.** Big confident headline, one short line under it, one primary action, a real product picture, then generous space. No hero badges, stat rows, testimonial grids, logo walls, bento boxes or icon-card feature grids.
- **Type:** the system stack first — `-apple-system, BlinkMacSystemFont, <web font>, "Segoe UI", sans-serif`. Tight, bold headlines; comfortable body (~17 px, line-height ~1.5); line length under ~70 characters.
- **Colour:** mostly neutral (black, white, greys), one accent (Apple blue) used for the action. Dark sections are true dark, not purple-tinted.
- **Imagery:** real screenshots and recordings of the product, crisp at 2×, no frames or drop-shadow boxes unless they mimic a real device. Every image has meaningful alt text.
- **The download button is the signature.** Pill shape, clear label ("Download for Mac"), a lively hover (label morphs into an arrow), and it's the same component everywhere it appears. The app's own buttons copy it.

## Motion
- Hover and press states on everything clickable. Subtle, fast (~200–350 ms), eased.
- No scroll-jacking, parallax, auto-carousels or elements fading in on every scroll.
- Respect `prefers-reduced-motion`.

## Layout
- **Phone first-class.** Check ~375 px wide every time you touch layout: no horizontal scroll, tap targets ≥ 44 px, headlines that wrap nicely (`text-wrap: balance`).
- Consistent spacing scale and container width across pages.
- Release/changelog pages keep the release pictures and read like the GitHub release.

## Accessibility
- Headlines read once by screen readers (no duplicated animated text in the accessibility tree).
- Visible focus rings, correct labels, sufficient contrast, semantic headings.

## Engineering discipline
- Check the framework's own docs in the repo before writing framework code (Owen's sites run a Next.js version with breaking changes — read `node_modules/next/dist/docs/`).
- Before deploying: type-check and lint (e.g. `npx tsc --noEmit`, `npx eslint src`), then look at the page in a browser at desktop and phone widths.
- Deploy only when asked. After deploying, load the live URL and confirm the change is really there.
- Private repos stay private. Secrets live in the host's environment variables, never in the repo or in chat.
