---
name: web-design
description: How to build websites that feel like apple.com product pages - layout, type, colour, real imagery, the download button, light and dark themes, phone layouts, motion, accessibility and deploy discipline. Use with apple-design whenever building, restyling or reviewing any website, landing page, docs page, release page or web component.
---

# Website design

Rules marked (house pick) are this kit's taste, not Apple's; change them freely if your product calls for it. Everything else follows Apple.

Load `apple-design` first; this adds the web detail. For glass materials and components, load `liquid-glass`. For copy-ready CSS, load `design-patterns`.

## Start here
- Read `apple-design` and its lessons.md first.
- Copy the craft from `examples/product-page.html` but never the page; see `examples/README.md`.
- Design the signature moment with `signature-moments`.
- Working on a site you didn't design? Use `match-the-project` first; its design wins.

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
- **Primary:** a solid accent pill with a faint 1 px gradient rim (house pick). **Secondary:** the same pill filled with the page's ink colour, text in the background colour. Frosted or glossy glass pills read as dated *as page buttons on a plain background* (house pick). Glass belongs only where something floats over moving content: a sticky nav over scrolling pictures, controls laid over a video or a Mac scene. There, use the `.glass` and `.glass-button` recipe from `liquid-glass`.
- **Every control 44 px or shorter is a capsule:** buttons, inputs, search fields, selects, segmented controls and chips (house pick). Containers are large and concentric: cards 28 to 34, menus and popovers 16 to 20 (house pick).
- Hover effects never move a button; a slight lift on hover reads as cheap. Change colour, glow or content instead (house pick).

## Motion

### Every page

- **Every interactive part animates its change, both ways.** Whatever animates in also animates out: closing, collapsing, dismissing and switching back get the same motion as opening, reversed. An opening animation with an instant close fails review.
- Hover and press states on everything clickable: subtle, fast (about 200 to 350 ms), eased (house pick).
- **More than hover.** A static page with only a colour change on hover fails review. The minimum set on any product page:
  - **Disclosures (FAQ, "show more"):** the answer opens with a height animation (`grid-template-rows: 0fr → 1fr`, about 350 ms, ease-out), its text fades and rises a few pixels, and a chevron on the right rotates 180°. Never an instant jump. Code in `design-patterns` → FAQ disclosure (house pick).
  - **Buttons:** the label-to-symbol morph from `design-patterns`, and a pressed state (`scale(0.97)` while held, never on hover) (house pick).
  - **Theme switch:** a smooth cross-fade of colours (about 300 ms), not a flash (house pick).
  - **Product pictures:** swap with a cross-fade and slight scale, never a hard cut.
  - **Sections:** headline and product enter once, together, with a short rise and fade the first time they're seen. One entrance per section, not every paragraph.
- **Timing:** 200 to 350 ms for controls, 500 to 800 ms for section entrances, eased out (`cubic-bezier(0.22, 1, 0.36, 1)`) (house pick). Nothing linear, nothing bouncy (house pick).
- Respect `prefers-reduced-motion`.

### Where it earns its place

Restraint means no filler, not no motion. Good product pages have rich, crafted animation where it carries meaning, like the SakuraCord site. Aim for that level everywhere it earns its place:

- **One signature moment** per page (`signature-moments`), scroll-driven, filling the screen.
- **Product reveals:** the Mac scene assembles as it enters (wallpaper, then menu bar, then the window rising onto the Dock), or the camera zooms from the whole laptop into the feature.
- **Live UI on the page:** the mock-up actually works: countdowns tick, toggles switch, panels open from the notch when the section comes into view.
- **Scroll-linked storytelling:** a sticky stage where scrolling steps through the feature's states, the copy changing beside it.
- **Transitions between states** that morph (size, position, corner radius) instead of fading.
- Craft rules: canvas or transforms only, 60 fps, scroll-driven not time-driven, every frame a good still, Reduce Motion shows the end state.

### Never

- Scroll-jacking.
- Parallax layers.
- Auto-advancing carousels.
- Fading in every paragraph on scroll.
- Hover lifts (house pick).
- Floating blobs.

## Layout

- **Phone is first-class.** Check about 375 px wide every time you touch layout: no horizontal scroll, touch targets at least 44 px, headlines that wrap nicely (`text-wrap: balance`), and no product picture that clips its own text. Give pictures a phone crop if they need one.
- One spacing scale and one container width across pages.
- Release pages keep the release pictures and read like the GitHub release.

## Other kinds of sites

### Not a Mac app
- Show web services in a real browser window, physical products photographed, people and places in their real context.
- The Mac scene rules do not apply outside Mac software.
- Still one clear action per page.

### Docs sites
- Left navigation with on-page contents; search first.
- Body 16 to 17 px with 1.6 line height and about 70 character lines.
- Code blocks with copy buttons.
- No signature moment, and no hero beyond a title and one line.
- Previous/next links at the bottom.

### Dashboards and apps
- Density is allowed; tables use aligned numbers (tabular figures) with sticky headers.
- Filters sit above the table.
- One primary action per view; secondary actions live in menus.
- Navigation goes in a sidebar.
- Every panel has loading, empty and error states; no decorative motion.

### Shops
- Real product photos on a neutral background.
- Price and the add button sit next to each other.
- A clear basket count, and a checkout with as few steps as possible.
- Trust details (delivery, returns) sit near the button.

### Brands with their own look
- The brand's colours, fonts and imagery win over Apple's.
- Keep the craft: spacing scale, type hierarchy, real pictures, states, motion discipline.
- If there are brand guidelines, they are the spec.
- One accent still means one.

## Accessibility

- Headlines are read once by screen readers (no duplicated animated text in the accessibility tree).
- Visible focus rings, correct labels, enough contrast, semantic headings.
- **Focus rings belong to the control:** rounded to match it, inset or offset so they never touch dividers or neighbours (`outline-offset: 4px; border-radius` equal to the control's). A square ring cutting across the lines above and below fails review.

## Engineering discipline

- Read the framework's own docs in the repo before writing framework code; versions change (for Next.js, check `node_modules/next/dist/docs/`).
- Before deploying: type-check and lint, then look at the page in a browser at desktop and phone widths.
- Deploy only when asked. Afterwards, load the live URL and confirm the change is really there.
- Secrets live in the host's environment variables, never in the repo or in chat.
