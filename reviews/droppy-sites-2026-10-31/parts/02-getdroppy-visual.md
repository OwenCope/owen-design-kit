# getdroppy.app visual and copy review

Review of the live marketing site https://getdroppy.app (Droppy, Mac app), captured 31 Oct 2026 at 1440x900. Source: live HTML/CSS read only, Playwright screenshots, computed styles. No site code changed. Shots referenced below live in ../shots/.

## At a glance: top 5 issues

1. The hero never shows the product on a Mac. A mascot icon plus hands artwork carries the first screen, while the actual notch UI appears far down the page.
2. Two equal-weight pills in the hero ("Download for macOS", "Purchase") compete instead of one clear primary action.
3. Faded headings and small body text likely fall below WCAG AA contrast (measured values inside).
4. The extension count disagrees with itself: hero screenshot reads 43, the served HTML reads 41 everywhere, and the page never enumerates 41 items.
5. The droplets section uses twelve identical "Learn more" links, a generic CTA repeated with no destination context.

## Identity: logo-swap test (R-20)

Finding: weak identity, strong motif. Severity: Medium.
Evidence: palette measured across 400 elements is navy ink rgb(19, 21, 105), bright blue rgb(18, 25, 237), lavender bg rgb(241, 240, 254), white. Type is the system stack. Layout order is hero, showcase grid, dark interlude, tabbed features, cards carousel, price cards, review wall, droplets grid, phone sync, customizer, languages, purchase, FAQ, footer.
Why it matters: the blue-duotone engraving artwork (Michelangelo hands, swans, temples) is the only distinctive motif and it repeats across every section background. Swap the Droppy logo for another notch app and the structure reads as a standard SaaS page.
Fix: keep the engraving motif, it is the identity. Cut one template section (the "Some more highlights" carousel duplicates the droplets grid below it) so the page reads as product story, not template order.

## Nav

Finding: solid, one dead-feeling control. Severity: Low.
Evidence: items Features, iPhone, Cloud, Compare, Changelog, Docs, Support, search icon, blue "Buy" pill. Computed Buy style: white on bright blue, radius 980px. All links resolve to real pages or anchors (spot checked against link list).
Why it matters: the search icon opens an overlay search; fine. The "Buy" pill scrolls to #pricing, correct behavior.
Fix: none, except confirm the search overlay traps focus and closes with Escape (not checked, see Not checked).

## Hero

Finding: no product in the first screen. Severity: High.
Evidence: ../shots/droppy-visual-hero-light.png. First viewport: engraved hands, droplet mascot with eyes, "Updated on October 25, 2026" badge, H1 "Supercharged Dynamic Island for your Mac" at 77.6px weight 600, sub line, two pills, small "Syncs with Droppy for iPhone" line, promo film poster below the fold. No menu bar, no notch UI, no Mac.
Why it matters: apple.com product pages and mac-props both require the product shown where it lives in the hero. A menu bar/notch app must show the notch area. The mascot sells charm, not the app.
Fix: put a real MacBook notch close-up (menu bar, island expanded with Now Playing) as the dominant hero visual above the fold. Keep the mascot small beside the badge, not as the centerpiece.

Finding: headline uses an Apple logo glyph inline. Severity: Low.
Evidence: H1 renders "...for your [logo]Mac" (screenshot).
Why it matters: reads well, but the glyph depends on Apple Symbols font presence and screen readers may announce it oddly.
Fix: keep if it tests fine with VoiceOver, else set "for your Mac" in text and put the glyph in aria-hidden span. Verify, not assumed.

Finding: twin equal pills. Severity: Medium.
Evidence: "Download for macOS" (bg rgb(227, 226, 239), fg rgb(29, 29, 31), radius 999px, 17px/600) and "Purchase" identical fill, size, radius. Both measured from computed styles.
Why it matters: web-design calls for exactly one prominent action. Two identical pills split the click and "Purchase" duplicates the nav "Buy".
Fix: make "Download for macOS" the solid blue primary pill, demote purchase to plain text link "See pricing" under it. One verb-first action per screen.

Finding: update badge is good. Severity: none, Keep.
Evidence: "Updated on October 25, 2026" with droplet glyph, white on deep blue.
Why: dates the page honestly, rare and useful. Keep.

## Showcase ("The upgrade your Mac deserves")

Finding: bento-style grid with uneven crops. Severity: Medium.
Evidence: ../shots/droppy-visual-showcase-light.png. H2 64px/600. Cards "Dynamic Glass", "Liquid Glass" with rounded 24px corners on engraved art; Now Playing pill floats over art at an angle.
Why it matters: the floating player crops overlap card art in a way that looks collaged rather than composed. Cards are same-size, same-padding (R-14 pattern).
Fix: align the player visuals to a common baseline grid inside the cards, or pull the players out of the art cards into one full-width strip with captions. Vary card heights by content.

## Dark interlude ("Your Mac can go further. Way further.")

Finding: strong moment, thin follow-through. Severity: Low.
Evidence: ../shots/droppy-visual-dynamic-island-light.png. H2 72px white on near-black navy, sub "This is just a tiny part of Droppy, there is so much more."
Why it matters: best rhythm break on the page, true dark section, not purple tint. But the sub line undersells and the island demo below it is small in frame.
Fix: rewrite sub to name what comes next ("Twelve Live Activities, a floating player, and 41 droplets follow."). Make the island demo larger, at least 480px wide, so controls read at normal size.

## "Take a closer look" tab section

Finding: artifact around the heading in capture. Severity: Low.
Evidence: ../shots/droppy-visual-closer-light.png shows a dotted box around the words "closer look." Inference: this is the wordscroll rotator's focus/selection state caught mid-animation, not real user selection (no input was sent).
Why it matters: if the rotator leaves a visible focus ring or selection box on load, it reads as a bug.
Fix: check the wordscroll words ("Finish", "Now Playing", "File Tray", "Widgets") render without outline boxes in all states; move any focus style to :focus-visible only.

Finding: tab labels are product nouns, good. Severity: none, Keep.
Evidence: Finish, Now Playing, File Tray, Widgets pills beside a large player visual.
Why: each tab shows real UI large. Keep this pattern and reuse it for the droplets section instead of the cards carousel.

## Floating player strip

Finding: horizontal carousel with clipped fourth card. Severity: Medium.
Evidence: ../shots/droppy-visual-floating-player-light.png. H2 "Meet the all-new Floating Player, wherever you need it." with non-breaking hyphen. Three sizes shown as cards on engraved art, carousel dots plus pause control.
Why it matters: the clipped card plus dots plus pause is a carousel (web-design: no auto-advancing carousels; manual ones need clear need). Three sizes could sit side by side statically at 1440px.
Fix: lay all three sizes out statically in one row at desktop width, keep swipe only under 720px. Drop the pause control.

## "Droppy is there when you need it" (Live Activities)

Finding: strongest product section. Severity: none, Keep.
Evidence: ../shots/droppy-visual-live-activities-light.png. Pill word highlight on "you", tab row (Agents, Recording, Meetings, Messages, Downloads, Devices, Calendar, Watch), large real notch UI (Claude progress "Stale cart total / Thinking... / Tracing where the cart total goes stale").
Why: real product, real data, readable at normal size, tabs match content. This is the page's signature moment: the notch as a live surface. Keep, and consider moving it directly under the hero.

## "Some more highlights" cards carousel

Finding: copy-paste cards (R-14). Severity: Medium.
Evidence: full-page capture (../shots/droppy-visual-full-light.png). H3 23px/700 white on blue, icon 88px, two-line description, small "Works with / Also on / Reads / Shows / Updates / Synced" footers, identical sizes and padding across Coding agents, Now Playing, Pomodoro, Calendar, Live Activities, Weather, System Stats, Lyrics, Notes.
Why it matters: nine identical cards with icon-title-text-footer is the exact copy-paste pattern. The footers ("Works with Apple Music, Spotify and YouTube Music") are the most useful line and are set smallest.
Fix: cut this carousel entirely. Its content already exists in the droplets grid below with more detail. If kept, vary: lead with the product visual, drop the footers into the body line, limit to six.

## "One price. Everything in it." strip

Finding: faded heading fails contrast (measured). Severity: High.
Evidence: computed H2 color rgba(19, 21, 105, 0.38) on lavender, 48px/600. At 38 percent opacity the ratio against rgb(241, 240, 254) is roughly 2 to 1, below the 3:1 large-text floor (R-25). Inference on the exact ratio; the opacity value is measured.
Why it matters: a section heading as the lowest-contrast text on the page inverts hierarchy.
Fix: set the heading to full ink rgb(19, 21, 105). If a faded-then-fill scroll effect is intended, start at 0.75 opacity minimum and end at full ink.

Finding: price card stack is honest and clear. Severity: none, Keep.
Evidence: cards "NT$325.86, once", "Try it free", "Free for iPhone", "Every droplet", "Two Macs", "Free updates", "14-day refund", "Fair everywhere" with one-line explanations each.
Why: one idea per card, no tiers trick, refund and regional pricing stated up front. Keep.

## Reviews ("How people use Droppy.")

Finding: real social proof, well linked. Severity: none, Keep with one fix.
Evidence: ../shots/droppy-visual-reviews-light.png. Cards with avatar, handle, date, outlet label (X, Reddit r/macapps, YouTube, AppAddict, SlashGear, French press VVMac), quote text, "Read the original post" links.
Why: names, dates, links, mixed sentiment quotes ("could be the best $7", "a steal") pass R-18 and C-5. Strongest trust section on the page.
Fix: fix the second card's casing ("im not even joking... apple should buy this") only if the author approves; verbatim quotes should stay verbatim, so instead reduce quote length rather than editing words. Also fix the first card's clipped menu-bar image (badge "26" and icons cut mid-row).

## Droplets grid ("Just add Droplets")

Finding: twelve repeated generic CTAs (R-15). Severity: Medium.
Evidence: twelve H3 36px entries (Action Ring, Calendar, Agents, Transform, Element Capture, Cleaner, Thunderstorm, Audio Control, System Stats, Lyrics, DropClip, plus "Small tools" list) each ending in "Learn more".
Why it matters: "Learn more" repeated twelve times tells the reader nothing and fails the specific-CTA rule. Each droplet has a distinct action available.
Fix: replace each with a specific label: "See Action Ring", "See Agents", or drop the links and link the card titles directly to the droplet docs. One "Browse all Droplets" link at the section end is enough.

Finding: "Small tools. So many possibilities." list is a wall of names. Severity: Low.
Evidence: Thaw, Teleprompter, Pomodoro, Stay Awake, Meetings, Audio Control, Text Capture, Voice Transcribe, Remove Background, Obsidian, LiquidMouse, Window Snap, Emoji Picker, Termi-Notch, Lid Fold, Mechey, each one line.
Why: names without one-line function force a click per item.
Fix: add three to five words per item ("Stay Awake: keeps your Mac awake" pattern already used in body copy).

## iPhone sync wordscroll and customizer

Finding: long scroll-pinned sequences with little new information. Severity: Low.
Evidence: ../shots/droppy-visual-custom-light.png shows the pinned headline "Customize your notch, make it truly yours..." mid-sequence; section tops measured at 2880px each for iphone-sync and design-your-shelf.
Why it matters: two consecutive 2880px pinned scrolls back to back is heavy rhythm for spec lists (finish options, highlight colors, layouts) that could be static grids.
Fix: keep one pinned sequence (the iPhone sync story), convert the customizer options to a static option grid. Measure scroll jank on low-end Macs before keeping both.

## Languages ("Droppy speaks your language.")

Finding: good, short, verifiable. Severity: none, Keep.
Evidence: H2 28px "Twenty-eight languages. One familiar app."
Why: one line, checkable claim, no badges. Keep.

## Purchase ("Get Droppy.")

Finding: good price presentation. Severity: none, Keep with one fix.
Evidence: ../shots/droppy-visual-pricing-light.png. "1 key / 2 keys Save 15% / 5 keys Save 25%", slider "Extra seats per key: None", "NT$325.86" large, checklist (lifetime updates, all features and extensions, weekly features, Discord, native local-first, 2 Macs), "Purchase License" blue pill, Alipay/WeChat note, iPhone "Free" card beside it with TestFlight button.
Why: quantity discount, seat slider, regional payment note, and the free iPhone tier are all stated before payment. Exemplary.
Fix: "NT$325.86" precision reads as a currency-conversion artifact; show the rounded local price with exact charge confirmed at checkout ("NT$326" or the exact Stripe figure, one consistent number).

## FAQ

Finding: specific questions, one duplicated line. Severity: Low.
Evidence: questions cover trial, refund, Droplets definition, notchless Macs, macOS 14 Sonoma minimum, lifetime license, install/activate, Cloud limits (200 MB each, 1 GB total, 25 files, 3-day expiry), permissions, two-Mac license, settings preservation, Trench bug reports, data collection. The privacy answer ends "...See our Privacy Policy for full details. See our Privacy Policy for full details." duplicated.
Why it matters: otherwise the best FAQ on a utility page reviewed recently: limits and permissions stated numerically.
Fix: delete the duplicated sentence. Break the "What is Droppy?" answer (five clauses) into two sentences.

## Outro and footer

Finding: footer is long but honest. Severity: Low.
Evidence: ../shots/droppy-visual-footer-light.png. "Not a notch app, definitely top notch." Download pill, TryMacApps badge, copyright, KvK/VAT registration, "Built with [heart] by Jordy Spruit", columns Menu / Navigation / Connect, footer links at rgba(255, 255, 255, 0.74) on bright blue.
Why it matters: company registration and a named builder add trust. But 0.74-opacity white small text on bright blue is borderline for 4.5:1 (R-25); inference, needs a meter check.
Fix: raise footer link opacity to 0.9 or set solid #D9DBFF equivalent, then verify 4.5:1. The heart emoji in "Built with" should be a text-safe glyph or aria-hidden; minor.

## Type scale and hierarchy

Measured (1440px, light; dark identical, see Theme):
H1 77.6px/600, H2 at 72, 64, and 48px/600, H3 at 36, 23, 19px/600-700, body system stack (-apple-system, system-ui, SF Pro Text, Inter), body bg rgb(241, 240, 254), body ink rgb(19, 21, 105).
Finding: disciplined scale, one anomaly. Severity: Low.
Evidence: every heading level uses exactly one size per level except H2 which uses three (72 hero-adjacent, 64 showcase, 48 everywhere else). Letter spacing tightens with size (-2.88 to -0.14), correct direction. Line heights 1.02 to 1.08 on display, 1.16 on 48px.
Why it matters: three H2 sizes is one too many; the 64 and 72 could both be 64.
Fix: set all section H2 to 48px except one 64px display size for the two dark interludes. Keep H1 at 77.6 (renders as 78).

## Colour and palette discipline (R-29, R-01)

Finding: palette passes, decoration passes. Severity: none, Keep.
Evidence: core palette is navy ink, bright blue accent rgb(18, 25, 237), lavender section bg, white cards; neutrals excluded. No blue-purple gradient washes, no glow stacks, no grid backgrounds. Dark sections are near-black navy, not purple.
Why: stays inside 2 to 3 core plus 1 accent, and the accent is used for actions and key highlights only. Keep.

## Spacing rhythm

Finding: even to a fault. Severity: Low.
Evidence: full-page capture shows near-identical section padding top to bottom; section heights range 327px (languages) to 9407px (showcase incl. subsections) with most content sections 536 to 2881px.
Why it matters: uniform padding is calm but the page length (25,631px total incl. footer) with uniform rhythm tires. The two dark interludes are the only rhythm breaks.
Fix: halve the padding above short sections (languages, outro) and let the pricing and purchase sections sit closer together; they are one decision.

## Icons

Finding: droplet icons are real product icons, good. Severity: none, Keep.
Evidence: 88px droplet icons (agents, now-playing, pomodoro, calendar) render as designed app icons in cards.
Why: relevant, product-specific, consistent size. Not Lucide-style generics (R-04 pass). Keep.

## Buttons and CTAs

Finding: shape system consistent, hierarchy flat. Severity: Medium.
Evidence: radius 999px pills everywhere, card radius 22 to 24px, one family. But hero pairs two identical fills; review cards use text links; droplets repeat "Learn more" twelve times.
Why it matters: consistent shapes (R-11 pass) but equal visual weight on competing actions confuses the click.
Fix: one blue solid primary per section, secondary as text link. Rewrite the twelve "Learn more" links per the droplets fix above.

## Light and dark theme (R-21, R-34)

Finding: no theme support; page ignores prefers-color-scheme. Severity: Medium.
Evidence: with colorScheme dark, every measured heading color, body bg, and section bg was byte-identical to light; three screenshot pairs (custom, footer, sec7) are pixel-identical MD5. There is no theme toggle. The design instead mixes dark hero/interlude sections into a light page.
Why it matters: a fixed design is allowed and the mixed light/dark composition works, but a notch/status product shown only on deep blue hides how the UI reads on a light desktop. macOS users in light mode never see their context.
Fix: either add a light/dark toggle (both modes must pass contrast, R-34), or add one light-desktop notch close-up to the "closer look" section so light-mode users see their setup. The cheaper fix is the latter.

## Cookie banner

Finding: banner blocks content on load and appears in captures. Severity: Medium.
Evidence: "Cookies, your call" card bottom-left overlays the showcase section in five of six early screenshots; buttons "No thanks" / "Allow analytics", "Privacy and cookies" link. Dismissal worked via the "No thanks" button.
Why it matters: copy is plain and honest (anonymous counting without OK, change anytime), which is good. But size and position cover product visuals on first paint at 1440x900.
Fix: shrink to a bottom bar, or delay slide-in until first scroll. Keep the wording.

## Copy review

All headlines and CTAs quoted from served HTML on 31 Oct 2026.

Headlines in order: "Supercharged Dynamic Island for your Mac" / "The upgrade your Mac deserves" / "Your Mac can go further. Way further." / "Take a closer look." / "Meet the all-new Floating Player, wherever you need it." / "Droppy is there when you need it." / "Some more highlights." / "One price. Everything in it. Pay once, and Droppy is yours." / "How people use Droppy." / "Just add Droplets" / "Glass, color, shape. Your call." / "Customize your notch, make it truly yours." / "Droppy speaks your language. Twenty-eight languages. One familiar app." / "Get Droppy." / "Ready to delete all other apps?"
CTAs: "Download for macOS", "Purchase", "Buy", "Purchase License", "Get it on TestFlight", "Browse all Droplets", "See them all.", "Learn more" x12, "See pricing", "Watch the film".
Support lines: "Like a Swiss Army knife for your Mac. Think of it, and Droppy already does it." / "Notch or not, one beautiful app replaces a dock full of utilities, with 41 free extensions, for one small price." / "Syncs with Droppy for iPhone. 100% free, forever." / "No subscription, lifetime access and updates to Droppy on your Mac." / "Not a notch app, definitely top notch."

Finding: zero em dashes in visible copy (R-02 pass). Severity: none. The four U+2014 characters in the file sit in JSON-LD script blocks, not rendered text.

Finding: no banned buzzwords in visible copy (R-16 pass). Severity: none. "powerful" and "seamless" appear only in JSON-LD metadata. Borderline hype that remains: "Supercharged" (H1, doubles as brand voice, acceptable if kept to one use, but it also heads the FAQ answer and title), "Blazing fast" (iPhone sync), "staggering amount of potential" (inside a quoted review, fine verbatim), "So many possibilities", "Way further". These are mild. Fix: replace "Blazing fast" with the measured claim ("Files land in under a second on Wi-Fi", or drop the adverb). Keep "Supercharged" only in the H1.

Finding: unverifiable number (R-17). Severity: High.
Evidence: hero screenshot reads "43 free extensions"; served HTML reads "41 free extensions" in five places ("Just add Droplets: 41 free extensions", pricing checklist "All features and 41 free extensions included", FAQ "What is Droppy", outro). The page names roughly 27 droplets (12 detailed plus ~15 in "Small tools"). Neither 41 nor 43 is enumerated on the page.
Why it matters: two different counts on the same day means no single source of truth, and the reader cannot verify the count.
Fix: set one number from the shipping extension manifest, render it from that manifest if possible, and list or link the full list ("Browse all 41 Droplets" should open all 41). Until then, write "40-plus free extensions" only if the manifest confirms 40 or more, else name the exact shipped count.

Finding: "one small price" without the price. Severity: Low.
Evidence: hero sub "for one small price" with no figure; price (NT$325.86 / EUR 8.78 observed) appears screens later.
Why: coy pricing next to a "Purchase" button creates a click without information.
Fix: "with 41 free extensions, for a one-time payment." Price lives one scroll down in "One price", which is fine.

Finding: "Think of it, and Droppy already does it." Severity: Low.
Evidence: showcase sub line.
Why: unprovable universal claim, and it sits beside a Swiss Army knife cliché.
Fix: "Eleven Live Activities, a file tray, clipboard history, and 41 droplets in one app." (adjust numbers to the verified count).

Finding: tone is otherwise plain and specific. Severity: none, Keep.
Evidence: "Drop files in, then zip or convert them right where they sit." / "Mute, camera and screen share for Zoom, Teams, Google Meet, WhatsApp and Telegram, right at the notch." / "Files are capped at 200 MB each (1 GB total, 25 files max) and auto-expire after 3 days." Limits, app names, numbers stated.
Why: this is the product-writing standard. Keep.

Rewritten lines (drop-in):
- "Your Mac can go further. Way further." becomes "The notch is now the busiest part of your Mac." (names the change, keeps the punch).
- "This is just a tiny part of Droppy, there is so much more." becomes "Below: the floating player, Live Activities, and every droplet."
- "Some more highlights." becomes "Nine droplets, switched on separately." (adjust to the real shown count).
- "Take a closer look." stays. Good.
- "Ready to delete all other apps?" stays, but only directly above the trial button. Good placement already.
- "Not a notch app, definitely top notch." stays in the footer. Do not promote it higher; puns date fast.

## Keep

1. Real notch UI shown large with readable data (Agents progress, Now Playing, Pomodoro 24:59) across closer-look, live-activities, and floating-player sections.
2. Review wall with names, handles, dates, outlets, and outbound links. Verifiable social proof.
3. Pricing honesty: trial terms, refund window, two-Mac license, regional pricing in 126 countries, payment methods, exact Cloud caps.
4. FAQ with numeric limits (macOS 14 minimum, 200 MB / 1 GB / 25 files / 3 days, 14-day refund).
5. "Updated on October 25, 2026" freshness badge.
6. Cookie copy: plain, states the anonymous fallback, no dark pattern in wording.
7. Palette discipline and the engraving motif, the page's one distinctive visual asset.
8. Footer company registration and named builder credit.

## Not checked

- Phone widths (375px): overflow, tap targets, carousel behavior. The brief scoped desktop captures; mobile needs its own pass.
- Keyboard path: focus visibility, tab order, Escape on search overlay and film modal, carousel controls.
- Motion: autoplay films, wordscroll timing, scroll-pinned sections under prefers-reduced-motion. Stills only.
- Axe or contrast-meter run: contrast findings above use measured opacity/color values with estimated ratios, marked as inference.
- Purchase flow, download link target, TestFlight link, license recovery pages: links recorded but not clicked (read-only brief, no transactions).
- Screen-reader announcement of the Apple logo glyph in the H1 and the emoji in community quotes.
- Performance: page ships six CSS files and multiple 2400px images; no timing measured.
