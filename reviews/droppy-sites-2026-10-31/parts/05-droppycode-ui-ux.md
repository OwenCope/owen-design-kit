# Droppy Code site UI, copy, UX, a11y review

Review of https://getdroppycode.app (Droppy Code, Mac app) and its /changelog page, captured 31 Oct 2026. Source read only at website/ (index.html, changelog.html, changelog.json, _headers, _redirects, assets/css, assets/js). No site code changed. Method: Playwright with installed Chromium, local HTTP server, viewports 1440x900, 768x1024, 390x844, dark and light schemes; computed styles; live curl checks for links, downloads, sitemap. Motion and hover are covered by other heads and are skipped here. Shots live in ../shots/ with prefix code-ui- (14 files). Light-scheme shots render identical to dark because the site is dark only (see finding 10).

## At a glance: top 5 issues

1. The Intel download button is a dead end. /download/intel returns 404 on the live site (High).
2. The whole page blocks copy, selection, right click and Cmd+C (High).
3. The page says 10 providers in two places but lists 13 (High, factual mismatch).
4. Small footer and footnote text at 3.2:1 contrast fails WCAG AA (Medium).
5. The changelog has 22 entries with no search, no filters and no per version anchors (Medium).

## Click-through table

Element, destination, status, result. Live statuses checked 31 Oct 2026 with curl HEAD except where noted. Anchor and mailto links verified in DOM.

| Element | Destination | Status | Result |
|---|---|---|---|
| Nav Hydra | #hydra | skip (anchor) | Target section exists (index.html:149) |
| Nav Features | #features | skip (anchor) | Target section exists (index.html:403) |
| Nav Changelog | changelog.html | 200 | Renders 22 entries from changelog.json |
| Nav FAQ | #faq | skip (anchor) | Target section exists (index.html:576) |
| Nav Download | #download | skip (anchor) | Target section exists (index.html:537) |
| Hero Download for Mac | #download | skip (anchor) | Scrolls to download card |
| See what it does | #highlights | skip (anchor) | Target section exists (index.html:187) |
| Download for Apple silicon | /download/latest | 302 then 200 (GET, 5 redirects) | Lands on Droppy-Code-1.7.4.dmg on GitLab |
| Download for Intel | /download/intel | 404 (HEAD and GET, live) | Dead. See finding 1 |
| View source on GitLab | gitlab.com/droppyformac1/droppy-code | 200 | Opens repo |
| Join the Discord | discord.gg/2yAjDnVxgF | 301 to discord.com invite | Opens invite |
| AGPL-3.0 License links | GitLab LICENSE blob | 200 | Opens license |
| Footer Droppy columns | getdroppy.app pages | 200 (docs, privacy, terms, blog, ios); 301 (droplets, trench) | All resolve |
| Footer Source/Releases/Merge requests | GitLab pages | 200 | All resolve |
| Footer hi@getdroppy.app | mailto | skip | Valid mailto |
| Hero kicker | getdroppy.app | 200 | Opens Droppy site |
| Changelog footer Download | index.html#download | 200 page, anchor exists | Works |

## Visual

### Identity: logo-swap test (R-20)

Finding: specific enough to pass, carried by two motifs. Severity: Low (keep with one note).
Evidence: tokens in assets/css/site.css:22-112: bg #0b0e14, text #e8edf5, accent #4f9cff, fonts Inter body with Inter Tight and Instrument Sans display, radii 8/12/16/24/999, --shadow-card: none. Motifs: binary digit canvas field behind hero and outro, and the rainbow sheen on the word Supercharged (site.css:795). Screenshots: ../shots/code-ui-index-desktop-dark.png, ../shots/code-ui-index-mobile-dark.png.
Why it matters: swap the logo and the binary field plus the charge motif still read as a coding tool page, not a generic SaaS page. The flat dark surface with no card shadows is a deliberate sibling look to getdroppy.app.
Fix: keep. Write the motif reason down somewhere the next editor sees it (R-31): binary field reads as code, sheen reads as charge. One line in the index.html header comment is enough.

### Hero and focal point

Finding: one clear focal point, real app shot below the fold edge. Severity: Low.
Evidence: H1 "Supercharged coding agent for Mac" at 62.4px/600 Inter Tight (measured), subtitle 20px, one primary light pill "Download for Mac" plus a quieter dark pill "See what it does" (17px/600, radius 20px, measured). Hero media is a real capture (hero.webp, alt text 100 plus chars describing the Hydra team UI). ../shots/code-ui-index-desktop-dark.png.
Why it matters: exactly one prominent action per screen (apple-design). The two pills differ in weight and fill, so they do not compete.
Fix: none.

Finding: the app is shown as a cropped window, not on a Mac. Severity: Medium.
Evidence: index.html:139-143, .hero__media renders hero.webp edge to edge with rounded corners, no menu bar, no Dock, no laptop. The captures are real and sharp (2x encoded, hero renders 1072px from 2400px natural, about 2.2x), so mac-props sharpness passes but framing does not show where the app lives.
Why it matters: mac-props and apple-design both ask for a Mac app shown inside a real Mac scene in the hero. A floating crop sells the UI but not the native Mac claim the copy makes.
Fix: place the hero capture inside the standard Mac scene (menu bar, window, glass Dock with the Droppy Code icon) at the same 2x sharpness, or record the decision (Mac window crop is the shared Droppy house style) in one line next to the hero comment.

### Type, palette, cards, buttons, footer

Finding: type hierarchy is clean and consistent. Severity: none (Keep).
Evidence: H1 62.4px, .section-heading 52px/600, tile labels 24px/600 Inter Tight, body 16px/400 Inter at line height 1.6, section subtitles 17 to 20px. Section rhythm is a uniform 80px top and bottom on desktop with hero 168/80 and outro 140/120 (measured from computed styles). Tiles vary by content (full, half, wide, tall, fade, trio), which passes R-14 and R-05: no identical card grid, no bento mosaic, no three step How It Works, no logo wall, no stat row in the hero.
Why it matters: uniform spacing scale with varied compositions is the Apple-like combination.
Fix: none.

Finding: buttons are consistent pills with verb labels. Severity: none (Keep).
Evidence: .btn--applepill light pill with dark ink (contrast 17.15:1), .btn--darkpill translucent white fill, radius 20px both, nav CTA 14px radius 999px. Labels: "Download for Mac", "See what it does", "Download for Apple silicon", "Download for Intel", "View source on GitLab", "Join the Discord". R-15 PASS, no generic Get Started or Learn More anywhere.
Why it matters: specific labels tell the user what happens before they click.
Fix: none, except finding 1 makes one of these labels a lie on Intel.

Finding: footer is long but honest. Severity: Low.
Evidence: four labeled nav columns (Menu, Droppy, Open source, Connect), every link resolves (table above), plus app icon, tagline, copyright, byline. R-05 template footer pattern does not quite apply because the columns follow the product (app, company, open source, contact). The "Built with" heart emoji breaks the product-writing no emoji rule.
Fix: replace the 💙 with plain text ("Built by Jordy Spruit" with the existing photo). One line in changelog.html:130 and index.html:741.

## Copy

Quoted headlines and CTAs, full list: H1 "Supercharged coding agent for Mac". H2s: "One chat, many heads.", "Just some of the highlights", "Bring your own agent.", "Every limit, one popover.", "Everything a coding session needs.", "Built for the Mac. Only the Mac.", "Left out on purpose." (H3), "No price.", "Frequently asked questions", "Ready to give your agents a real Mac app?", changelog H1 "Changelog". CTAs listed in Visual above.

Finding: zero em dashes, zero banned buzzwords. Severity: none (Keep).
Evidence: full text extraction of index.html contains 0 em dash characters (R-02 PASS). None of the R-16 banned terms (AI Powered, Next Generation, Revolutionary, Seamless, Cutting Edge, Intelligent, Ultimate, Powerful, Effortless) appear in page text.
Why it matters: the copy already meets the hardest antislop copy gates.
Fix: none.

Finding: provider count disagrees with itself. Severity: High.
Evidence: the agents grid renders 13 .agent entries (Codex, Claude, Cursor, OpenCode, Grok, Antigravity, Copilot, DeepSeek, Command Code, Pi, omp, Meta, Z.ai; index.html:296-348, count verified by grep). The Mac section stat says "10 agent providers" (index.html:513-514) and the outro subtitle says "Ten providers" (index.html:705). R-17, R-38.
Why it matters: a wrong number on a marketing page reads as either stale or invented, and it sits beside precise claims (100% Swift, 26 themes, 1 dependency, 0 telemetry) that invite counting.
Fix: change the stat value to 13 and the outro line to "Thirteen providers, one window, a diff for every turn and a terminal per thread." Then recount on every provider change.

Finding: hero subtitle is one 58 word sentence block. Severity: Low.
Evidence: index.html:124. It names all 13 providers inside a single paragraph, which renders as a dense block even at 390px (see ../shots/code-ui-index-mobile-dark.png, where the provider list fills the whole first screen).
Why it matters: product-writing asks for one idea per sentence under about 15 words. The provider list is useful proof but it buries the Hydra idea.
Fix: split into two sentences and move the provider list after the core claim. Rewrite: "Hydra is on from your first chat. One chat leads a team of heads that work in parallel, each in a copy of your project, and their work lands as one merge. It drives Codex, Claude, Cursor, OpenCode, Grok, Antigravity, Copilot, Command Code, Pi, omp, DeepSeek, Meta and Z.ai in one Liquid Glass window on your own subscriptions. Free and open source."

Finding: "Supercharged" appears 5 times and is hype adjacent. Severity: Low.
Evidence: title tag, meta description, OG tags, H1, footer madeby ("the supercharged Dynamic Island for Mac"). It is not in the R-16 banned list, so this is not a gate fail, only a product-writing note (no hype words).
Why it matters: repetition dulls the one place it works (the H1).
Fix: keep "Supercharged" in the H1 only. Rewrite the footer line to "Droppy Code is made by Droppy, the Dynamic Island for Mac." Keep title tag as is (it performs in search).

## Journey

Finding: Intel download path is broken end to end. Severity: High.
Evidence: _redirects:7-8 maps /download/intel to the GitLab permalink .../downloads/Droppy-Code-Intel (no file extension). Live GET returns 404 at the Cloudflare URL, so the redirect target asset does not exist under that name. The Apple silicon path works: /download/latest 302s to the permalink and resolves (GET, 5 redirects) to Droppy-Code-1.7.4.dmg, 200. The download card also shows "Version 1.7.4, Signed and notarized", which matches changelog.json latest (1.7.4, 2026-10-07) and the live DMG name. R-26 (dead control), C-2.
Why it matters: Intel visitors get an error page after clicking a button that promises a disk image. Everything else about the download journey is unusually tidy (version shown, arch split labeled, license named), which makes this one break worse.
Fix: either attach the Intel asset under the exact permalink name Droppy-Code-Intel, or change _redirects:8 to the real Intel filename, then curl both URLs and confirm 200 before closing.

Finding: pricing and system requirements are clear. Severity: none (Keep).
Evidence: "No price." section (index.html:537-571): Free, AGPL, three requirement lines (macOS 26 or later, one signed in provider with example commands, git plus gh or glab). FAQ answers "Is it really free?", "Which Mac do I need?", "Do I need an API key?" with product specific answers, no template questions (R-28 PASS).
Why it matters: a free open source tool with provider side costs is exactly where users expect pricing tricks, and there are none here.
Fix: none.

Finding: first visit journey has no friction until download. Severity: none (Keep).
Evidence: nav has 4 links plus Download, all anchors or real pages (R-24 PASS). Skip link "Skip to content" exists and reveals on focus (site.css:180-194). No newsletter gate, no fake terminal, no modal.
Why it matters: nothing stands between arrival and the download card.
Fix: none.

## Changelog

Finding: no search, no filters, no version anchors. Severity: Medium.
Evidence: changelog.js renders all 22 entries newest first with "Show more" collapse past 5 bullets per group (changelog.js:10-11, 201-202). Entries have no id attributes and there is no hash handling, so no release can be linked. There is no text filter. Desktop evidence: ../shots/code-ui-changelog-desktop-dark.png. With about 20 releases and some over 30 bullets (1.3.0), scanning for one version means scrolling the whole list.
Why it matters: release notes are reference material. Developers link to versions from issues and updates; without anchors every reference is "scroll down a lot".
Fix: give each entry id="v-1-7-4" (dots to dashes), render a small link icon beside each version title pointing at its anchor, and add a filter input above the list that matches version numbers and words, with the count announced in the existing aria-live region.

Finding: loading, empty and error states all exist. Severity: none (Keep).
Evidence: changelog.js:34-84 builds loading spinner ("Loading release notes..."), error ("Couldn't load the changelog" plus retry button that refetches), and empty ("No releases yet") states, all as text, all inside aria-live polite with aria-busy toggling. R-27 PASS.
Why it matters: a JSON driven page is exactly where these states get skipped.
Fix: none.

Finding: changelog copy is specific and credited. Severity: none (Keep).
Evidence: entries name versions, dates (formatted without timezone shift, changelog.js:90-114), groups (New features, Bug fixes, Refinements), and contributors with handles and merge request numbers. No invented stats, no testimonials (R-17, R-18 PASS).
Why it matters: 22 releases of plain, checkable notes build more trust than any claims section could.
Fix: none.

## Mobile

Finding: no horizontal overflow at 390px or 768px. Severity: none (Keep).
Evidence: document scrollWidth equals clientWidth on both pages at desktop; mobile viewport shots show clean single column with balanced headlines (../shots/code-ui-index-mobile-dark.png, ../shots/code-ui-changelog-mobile-dark.png). The desktop overflow hits in the evidence run are carousel cards inside the horizontal highlights rail (expected offscreen slides in a scroll region), not page overflow. R-03 overflow PASS.
Why it matters: the page reflows instead of clipping.
Fix: none.

Finding: three tap targets under 44px. Severity: Medium.
Evidence: .nav__menu is 40x40px (site.css:385-399, only visible under 720px, see mobile shot hamburger). .nav__cta measured 99x38px in desktop Chromium (renders beside the menu on phones too). Theme picker tab buttons measured about 26px tall. R-03 requires 44px minimum.
Why it matters: the menu button is the whole navigation on phones, and it is the smallest control in the bar.
Fix: set .nav__menu to 44x44px, give .nav__cta min-height 44px, and give .themes__name min-height 44px with the existing padding. Recheck at 390px.

Finding: phone nav works but hides everything behind one 40px button. Severity: Low.
Evidence: under 720px the four nav links collapse into .nav__menu (site.css:412-431), CTA stays visible. Menu open and close behavior was not exercised here (motion head owns it).
Why it matters: with the small button fixed above, this pattern is fine for four links.
Fix: none beyond the 44px fix.

## Accessibility

Finding: dimmed text in five places fails AA. Severity: Medium.
Evidence: --text-quaternary is rgba(232,237,245,0.38), which composites to about #5f636a on the #0b0e14 background, ratio 3.2:1 (computed by relative luminance, needs 4.5 for normal text, R-25 FAIL). Used for normal size text in: .leftout__list (site.css:1468, 16 to 18px), .free__foot (site.css:1552, 13px), .footer__copyright (site.css:1855, 14px), .footer__madeby (site.css:1870, 14px), .themes__caption (site.css:1965, 13px). Everything else passes: body 16.43, secondary 8.75, tertiary 5.5, accent text 10.54, button ink on light 17.15. No light theme exists, so these numbers are the whole story in both schemes.
Why it matters: the failing strings include the license footnote and the "Left out on purpose" list, which are load bearing trust copy, not decoration.
Fix: replace var(--text-quaternary) with var(--text-tertiary) (5.5:1, passes) in those five text rules. Keep quaternary only for the FAQ icon border (site.css:1632), which is not text.

Finding: the copy lockdown harms keyboard and assistive tech users most. Severity: High (counted under Journey finding 2 for the single fix, noted here for a11y).
Evidence: site.css:152-160 (body user-select none, images pointer-events none and undraggable) plus site.js:224-235 (swallows copy, cut, selectstart, context menu, Cmd+C/S/U). A keyboard user cannot copy the `codex login` command from the agents note or FAQ. A screen reader user loses no content, but any user who selects to re-read or enlarge text through selection based tools is blocked. R-32 expects full keyboard operability; blocking the most basic keyboard editing commands breaks that expectation.
Why it matters: anti scraping guards that punish legitimate readers always cost disabled users first.
Fix: same fix as Journey finding 2: delete the guard entirely.

Finding: focus, headings, landmarks are solid. Severity: none (Keep).
Evidence: :focus-visible 3px accent outline with 3px offset on all interactive elements (site.css:174-178). Skip link present and focus revealing. Heading outline is clean: one H1 per page, H2 per release on changelog, H3 per group, no skips. Landmarks: nav, main, footer, labeled footer navs (Menu, Droppy, Open source, Connect), carousel region with labeled slides. R-32 focus indicator PASS, R-24 PASS.
Why it matters: keyboard traversal has the structure it needs once the copy block is gone.
Fix: add aria-controls from each .faq__question to its answer panel (small, do while touching the FAQ).

Finding: informative images have real alt, decorative ones are hidden. Severity: none (Keep).
Evidence: hero and all seven highlight captures carry specific alt describing the UI state (index.html:141-270, sampled 14 images, all present). Fade tiles and sidebar art sit inside aria-hidden containers with empty alt, which is the correct treatment. Brand icons and the author photo are empty alt beside adjacent text names.
Why it matters: a screenshot heavy page is only accessible with this discipline.
Fix: none.

## Performance and SEO

Finding: payload is modest and honest. Severity: none (Keep).
Evidence (local, no cache, desktop): index HTML 70KB, site.css 58KB, three JS files about 41KB total, changelog.json 56KB, 18 requests on index and 15 on changelog. Remote hero.webp is 179KB (live, 200) rendering at 1072px from 2400px natural (about 2.2x, correct for retina). Usage limits.webp is 49KB. Fonts load from Google with display=swap and preconnect. No render blocking JS (all defer). LCP and CLS were not measured in the field (see Not checked), but the hero image has width, height, fetchpriority high and eager loading, which is the right setup.
Why it matters: a page of 20 plus large captures could easily be megabytes; lazy loading plus right sized remotes keep it lean.
Fix: none, except consider preloading the hero webp on slow connections if field LCP disappoints.

Finding: caching headers split correctly. Severity: none (Keep).
Evidence: _headers: versioned /assets cache a week, HTML and root must revalidate. changelog.json sits at root so it revalidates, which is correct for release freshness. The ?v= busting params match the linked CSS and JS versions.
Why it matters: assets stay fast while release notes never go stale.
Fix: none.

Finding: meta, OG, sitemap, robots all present with one stale date. Severity: Low.
Evidence: canonical on both pages, unique descriptions, theme-color, OG image 1200x630 with alt, Twitter summary card, JSON-LD SoftwareApplication, robots.txt allowing all with sitemap pointer. Sitemap lists both URLs but lastmod 2026-09-15 and 2026-09-16 while the newest release is 2026-10-07.
Why it matters: stale lastmod is a small crawl signal and a small honesty signal.
Fix: update sitemap.xml lastmod to the changelog.json generated_at date (2026-10-07) whenever releases ship, ideally in the same script that writes changelog.json.

## Keep

* Real 2x app captures with specific alt text throughout hero, Hydra, highlights, usage and features.
* One primary action per screen with specific verb labels (R-15 PASS).
* No em dashes, no banned buzzwords, FAQ specific to the product (R-02, R-16, R-28 PASS).
* Varied tile compositions, no identical card grid or template section order (R-05, R-14 PASS).
* Visible focus ring, skip link, clean heading outline, labeled landmarks.
* Changelog loading, error with retry, and empty states (R-27 PASS).
* Download card shows version 1.7.4, matching changelog.json and the live Apple silicon DMG name.
* _headers asset versus HTML caching split; canonical, OG with alt, JSON-LD, robots, sitemap all present.
* Dark only design is consistent: color-scheme dark in head and CSS, identical rendering under light emulation, legitimate R-21 reason (native code tool matching its sibling product).

## Not checked

* Motion, hover, scroll choreography, theme picker animation, wordscroll behavior (other heads).
* Keyboard walkthrough beyond static inspection, VoiceOver or NVDA pass, Windows high contrast mode.
* Field LCP, CLS, INP numbers (no real user data; lab numbers not run).
* Intel DMG contents (cannot download it; the URL 404s).
* Behavior with changelog.json missing or malformed beyond the existing error state (code read only).
* Print styles, reader mode, no-JS experience beyond the noscript reveal fallback.
* GitLab release page and Discord invite contents.
* Full page stitch shots (code-ui-index-full-dark.png, code-ui-changelog-full-dark.png) show duplicated sections; this is a screenshot stitch artifact from pinned and sticky sections, confirmed against the DOM where each section exists once, not a site bug.
