---
name: web-design
description: How to build websites that feel like apple.com product pages - layout, type, colour, real imagery, the download button, light and dark themes, phone layouts, motion, accessibility and deploy discipline. Use with apple-design whenever building, restyling or reviewing any website, landing page, docs page, release page or web component.
---

# Website design

Load `apple-design` first; this adds the web detail. For glass materials and components, load `liquid-glass`. For copy-ready CSS, load `design-patterns`.

## Look and feel

- **An Apple product page, not a SaaS template.** A big confident headline, one short line under it, one primary action, a real product picture, then generous space. No hero badges, stat rows, testimonial grids, logo walls, bento boxes or rows of identical icon cards.
- **The "AI template" look gets rejected on sight:** gradient text, colour glows behind things, uniform grids of identical cards, fake app windows, drawn browser chrome.
- **Give each product its own signature.** Shared craft (space, type, real pictures) is good; reusing another site's signature effects makes the new one read as a recolour. See `signature-moments` for finding one, and `mac-props` for showing the app on a Mac.
- **Type:** the system stack first, `-apple-system, BlinkMacSystemFont, <web font>, "Segoe UI", sans-serif`. Tight, bold headlines; body about 17 px with line height about 1.5; lines under about 70 characters. A brand font can carry the wordmark.
- **Colour:** mostly neutral, with one accent used for the action. Dark sections are true dark, not purple-tinted.
- **Light and dark both ship.** Follow the system setting, give a visible switch in the nav that remembers the choice, and set the theme before first paint so the page never flashes.
- **Imagery:** real screenshots and recordings, crisp at 2×, with no frames or drop-shadow boxes unless they copy a real device. Every image has meaningful alt text.
- **Show the product where it lives.** A menu bar app is shown under the real menu bar, a notch feature at the notch, a Mac app inside a real window on a real desktop. The product fills most of the picture; the wallpaper is context, not the subject.
- **Every button does what it says.** If the product isn't out yet, the primary action is "Notify me" or "Join the beta", never a Download that goes nowhere.
- **Balance two-column sections.** A short heading beside a long list leaves an empty column: make the heading sticky (`position: sticky`) or stack it above.

## A product page, section by section

1. **Hero:** headline, one line, one action, then the product on a Mac (`mac-props`), large.
2. **The signature moment** (`signature-moments`): one section built around something only this product has.
3. **What it does:** a few features, each shown with the real UI, not a bare list.
4. **Closing:** the headline idea again in a few words, and the same action.

A text-only list of features beside an empty column is the weakest version of step 3. The next weakest is picture-left, text-right rows that swap sides all the way down: it's the most common template there is. Vary the layout to suit each feature: one full-width scene, a pair side by side, a feature shown inside the Mac scene itself.

## Buttons and controls

- **The download button is the signature.** A pill, a clear label ("Download for Mac"), a lively hover (the label morphs into an icon), and the same component everywhere it appears. Code is in `design-patterns`.
- **Primary:** a solid accent pill with a faint 1 px gradient rim. **Secondary:** the same pill filled with the page's ink colour, text in the background colour. Frosted or glossy glass pills read as dated.
- **Every control 44 px or shorter is a capsule:** buttons, inputs, search fields, selects, segmented controls and chips. Containers are large and concentric: cards 28 to 34, menus and popovers 16 to 20.
- Hover effects never move a button; a slight lift on hover reads as cheap. Change colour, glow or content instead.

## Motion

- Hover and press states on everything clickable: subtle, fast (about 200 to 350 ms), eased.
- No scroll-jacking, parallax, auto-advancing carousels, or fading in every element on scroll.
- Respect `prefers-reduced-motion`.
- **Every interactive part animates its change, both ways.** Whatever animates in also animates out: closing, collapsing, dismissing and switching back get the same motion as opening, reversed. An opening animation with an instant close fails review.
- **Not just its hover.** A static page with only a colour change on hover fails review. The minimum set on any product page:
  - **Disclosures (FAQ, "show more"):** the answer opens with a height animation (`grid-template-rows: 0fr → 1fr`, about 350 ms, ease-out), its text fades and rises a few pixels, and a chevron on the right rotates 180°. Never an instant jump. Code in `design-patterns` → FAQ disclosure.
  - **Buttons:** the label-to-symbol morph from `design-patterns`, and a pressed state (`scale(0.97)` while held, never on hover).
  - **Theme switch:** a smooth cross-fade of colours (about 300 ms), not a flash.
  - **Product pictures:** swap with a cross-fade and slight scale, never a hard cut.
  - **Sections:** headline and product enter once, together, with a short rise and fade the first time they're seen. One entrance per section, not every paragraph.
- **Focus rings belong to the control:** rounded to match it, inset or offset so they never touch dividers or neighbours (`outline-offset: 4px; border-radius` equal to the control's). A square ring cutting across the lines above and below fails review.
- **Timing:** 200 to 350 ms for controls, 500 to 800 ms for section entrances, eased out (`cubic-bezier(0.22, 1, 0.36, 1)`). Nothing linear, nothing bouncy.

## Layout

- **Phone is first-class.** Check about 375 px wide every time you touch layout: no horizontal scroll, touch targets at least 44 px, headlines that wrap nicely (`text-wrap: balance`), and no product picture that clips its own text. Give pictures a phone crop if they need one.
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
