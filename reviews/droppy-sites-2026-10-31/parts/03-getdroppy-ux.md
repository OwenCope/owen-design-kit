# getdroppy.app UX, accessibility, mobile and performance review

Live site reviewed 31 Oct 2026 with Chromium (Playwright), viewports 1440, 768 and 390 wide. Static HTML plus same-origin assets were mirrored to /tmp/droppy-review/ada for reading only. Motion and hover are covered by other reviewers and appear here only where they block use.

## At a glance

1. **Download serves a 145 MB beta .dmg with no warning.** The hero "Download for macOS" resolves to `Droppy-16.2.0-beta.3.dmg` (152,146,046 bytes). No file size, no stable-vs-beta note, no progress state on the page since it is a direct file link. First-time trust issue. (High)
2. **Cookie banner covers the hero on phones.** At 390 wide it sits over the H1 and both CTAs until dismissed. It dismisses by keyboard, but it is the first thing a visitor must clear. (Medium)
3. **Several tap targets are below 44 px.** Nav chevron toggles are 14x22, the nav Buy pill is 43x24, finish swatches are 30x30, carousel dots are 24 wide, dropdown rows are 24 high. Fails R-03. (Medium)
4. **Pricing secondary text fails contrast.** "One license covers two of your Macs..." is 3.75:1 at 14 px, "Save 15/25%" is 3.54:1 at 11 px, the "Standard" badge is 1.2:1. Fails R-25. (Medium)
5. **Screen-reader noise.** 160 of 208 images have empty alt, 11 decorative `fcard__media-video` loops lack `aria-hidden`, and 3 of 6 marquee duplicate sets are exposed, so droplet names are read more than once. Needs an alt audit, not a bulk fix. (Low-Medium)

## Click-through (R-35)

Sampled 60 same-origin URLs plus 2 external key links with automated requests. All returned HTTP 200. Full page carries 281 links (116 unique same-origin); the other ~56 same-origin URLs were not individually requested.

| Element | Destination | Status | Result |
|---|---|---|---|
| Logo | / | 200 | Home |
| Features | /features | 200 | Index, real page |
| iPhone | /ios | 200 | Real page, TestFlight link present |
| Cloud | /cloud | 200 | Real page |
| Compare | /compare | 200 | Real page |
| Changelog | /changelog | 200 | Real page |
| Docs | /docs | 200 | Index, real page |
| Support menu | /contact, /docs/help, /recover-license, /claim-license | 200 | All resolve; license recovery and claim exist |
| Buy (nav) | /#pricing | n/a | Smooth scrolls to pricing card |
| Download for macOS (hero, footer) | 302 to https://dl.getdroppy.app/app-releases/beta/Droppy-16.2.0-beta.3.dmg | 200, 152 MB dmg | Starts a 145 MB download immediately, filename says beta |
| Purchase (hero + pricing) | #purchase | n/a | Reveals on-page Stripe checkout (js.stripe.com/v3, home-purchase.js). No redirect, no account creation. "Paying with Alipay or WeChat Pay? Pay in CNY instead" option shown |
| Footer Droplets, Pricing, FAQ | /features#droplets, /#pricing, /#faq | 200 / anchor | Resolve to real sections |
| Footer legal | /terms-of-service, /privacy-policy, /refund-policy, /refund-request, Cookie preferences | 200 | All resolve; 14-day refund plus a refund request form |
| Discord | https://discord.gg/droppy | 200 | Resolves |
| TestFlight | https://testflight.apple.com/join/KVP7HrYZ | 200 | Resolves, iPhone app is free |
| Activate in Droppy | href="#" until paid | n/a | Hidden (`display:none`) until purchase succeeds, then set by script. Not a dead control (R-26 pass), but confirm the deep link is set before showing it |
| Search icon | opens site search | n/a | Opens a search panel (seen in DOM as gnav search input 284x33). Results quality not checked |

No 404s found in the sample. No navbar item points nowhere (R-24 pass). No GitHub link was found on the homepage; code-minded visitors get Docs, DroppyKit, MCP and API pages instead.

## Journey

What a first-timer gets: hero with update kicker ("Updated on October 25, 2026"), one H1, one subline, Download and Purchase side by side, then product sections, pricing, reviews, FAQ, footer. Pricing and licensing are unusually clear: one-time payment, lifetime updates, one license covers two Macs, volume discounts (2 keys save 15%, 5 keys save 25%, extra-seats slider), localized price (NT$325.86 shown from this locale; page notes prices are charged in the visitor currency), Stripe checkout inline, 14-day refund with a self-serve form. System requirement is stated once: macOS 14 (Sonoma) or later. Docs, changelog, blog, support, license recovery, terms and privacy are all one or two clicks away. Keep this structure.

Fix for the download: label the channel ("Beta 16.2.0, 145 MB, macOS 14+") next to the button, or split Stable and Beta. Exact fix: add size and channel text in the button sublabel and point the main button at a stable build if one exists.

## Mobile

No page-level horizontal scroll at 390 or 768 (scrollWidth equals clientWidth at both widths). Over-wide decorative layers (`.sky-dapple__layer` up to 480 wide, `.droplets-row__set` 2544 wide, `.wordscroll__bloom` 454 wide) are clipped inside overflow containers, so nothing scrolls sideways. That is containment, not breakage, but confirm no product imagery is cropped at 390; the `.iphone-sync__hand` image renders 437 wide from x=64 at 390 width and is clipped by an ancestor, so check its crop on a real phone.

Mobile nav works: hamburger opens a full menu with large links (screenshot `droppy-ux-mobile-390-menu.png`). The search icon (31x48) and logo (36x44) are narrow but adjacent to other controls. Language list items render at 11.52 px at 390, below comfortable reading size. The pricing card reflows to one column correctly.

Exact fixes: enlarge chevron toggles and Buy pill to 44 px minimum height; make swatches and carousel dots 44 px targets (keep the visual small, grow the hit area); raise tiny labels to 12 px minimum.

## Accessibility

Keyboard (R-32): full Tab pass follows visual order, every stop shows a visible outline (2 px white on dark, 3 px blue skip link). Skip link targets an existing `#main-content`. Nav chevron buttons expose `aria-label`, `aria-expanded` and `aria-controls`. No traps seen in 60 stops. Cookie banner buttons are native buttons and Enter on "No thanks" dismisses it. Escape handling for the banner and search panel was not verified.

Structure: `lang="en"`, one H1, logical H2/H3 order, `header/nav/main/footer` landmarks with four navs all labeled (Global, Menu, Navigation, Connect). Two empty H2 elements exist in the rendered DOM (likely JS-injected decorative headings); give them text or demote them.

Contrast (R-25, computed from real colors): body and price text pass strongly (up to 21:1). Failures: 14 px secondary pricing text 3.75:1 (needs 4.5), 11 px "Save 15/25%" 3.54:1, "Standard" badge 1.2:1. Hero text sits over video and cannot be measured statically; spot-check it over the lightest frame. Exact fix: darken `#6778B9`-on-lavender secondary text to reach 4.5:1, and restyle the "Standard" badge (white at 62% on lavender) to solid dark text.

Media: decorative loops are muted, `playsinline`, no controls, and most carry `aria-hidden="true"` with `tabindex="-1"`. Gaps: 11 `fcard__media-video` loops and the hero film have no `aria-hidden`. The promo film dialog has `role="dialog"` with an accessible label and a controlled video, which is correct; caption availability was not checked. Marquee rows mark only alternating duplicate sets `aria-hidden`, so exposed duplicates repeat droplet names to screen readers; hide all but one set.

Images: 0 of 208 missing the alt attribute, but 160 are empty. Many are frame-sequence stills where empty is right, but product screenshots among them would then have no name. Audit image by image rather than filling bulk text.

## Performance

Measured on a fast connection, so treat times as best case. HTML document transfers 84 KB, `DOMContentLoaded` 1.6 to 2.4 s, load 2.2 to 3.4 s across runs. Largest Contentful Paint is the hero poster image at about 1.9 s. Total transfer is about 9.6 MB across 122 resources. The 15 largest files are all WebP images between 276 KB and 1,074 KB (`lock-20261018b.webp` is the largest). Several rendered-size checks show images served at more than twice their displayed size (counted as oversized in the audit detail).

Fonts: Inter and Inter Tight show as requested but still `unloaded` at query time with zero `@font-face` rules in inline styles, so they come from stylesheets; confirm `font-display: swap` and a system fallback so headlines never sit invisible. Caching is sensible: HTML `max-age=0, must-revalidate`, CSS `max-age=3600` with ETag, OG image 7 days, the .dmg immutable for a year. Lighthouse was not run (not installed); numbers above come from Resource Timing and PerformanceObserver instead.

Exact fixes: compress or responsive-size the top five WebPs (`lock`, `widgets`, `live`, `tray`, `media` images total about 3.5 MB), add `loading="lazy"` below the fold where missing, and serve widths closer to rendered size.

## SEO

Title, meta description, canonical (`https://getdroppy.app/`), OG tags (1200x630 JPEG, returns 200), Twitter card and `SoftwareApplication` JSON-LD with $9.99 offer are all present and consistent. `robots.txt` (200) points at a sitemap (200, 86 KB) and the site also serves `llms.txt`, per-page Markdown and an API page. Nothing to fix here.

## Keep

Skip link with visible focus on every stop. Labeled nav landmarks and disclosure buttons. Muted, inline, mostly hidden decorative video. Zero horizontal scroll at 390 and 768 with a working mobile menu. Clear one-time pricing, two-Mac license, localized currency, inline Stripe checkout without an account, 14-day refund with a form. Stated macOS 14 requirement. Docs, changelog, support, license recovery, terms, privacy and cookie preferences all resolve. Cookie banner offers a real decline ("No thanks") plus anonymous-only counting. Full structured data and crawler files.

## Not checked

Lighthouse score, field data and CLS. Screen-reader pass (NVDA/VoiceOver). Escape on the cookie banner and search panel. Promo-film captions. Hero text contrast over video frames. The remaining ~56 same-origin URLs beyond the 60 sampled. Completing a real payment. Non-Mac or Windows visitors. Reduced motion (covered by others).

Screenshots: ../shots/droppy-ux-hero-1440.png, ../shots/droppy-ux-pricing.png, ../shots/droppy-ux-faq.png, ../shots/droppy-ux-footer.png, ../shots/droppy-ux-full-1440.png, ../shots/droppy-ux-mobile-390-top.png, ../shots/droppy-ux-mobile-390-mid.png, ../shots/droppy-ux-mobile-390-menu.png, ../shots/droppy-ux-mobile-768-top.png, ../shots/droppy-ux-mobile-768-mid.png, ../shots/droppy-ux-mobile-768-menu.png, ../shots/droppy-ux-top-1440.png.
