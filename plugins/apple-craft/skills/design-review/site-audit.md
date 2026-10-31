# Site audit

How to do a deep animation, UI and UX review of a live website. Use it for a full review of one live site or several sibling sites at once. For a single component, a single screen, or a release picture, use the main design-review skill instead. This doc does not repeat it.

## Set up the folder

Review the live site. Never edit it. Put the work under `reviews/<name>-<yyyy-mm-dd>/`:

- `README.md` is the summary and the ranked fix list.
- `parts/NN-<site>-<concern>.md` holds one concern on one site per file.
- `shots/` holds every screenshot, prefixed by part: `droppy-hover-`, `code-ui-`, and so on.

Read downloaded site files only. Keep them in their own empty temp folder. Never run them.

## Split by concern and site

Give each concern its own part file, per site:

1. Motion overview: hero, scroll scenes, loops, load motion, motion cost, reduced motion end states.
2. Hover, focus and touch: every interactive element at rest, on hover, on activation, and on keyboard focus, plus touch behavior.
3. Scroll inventory: every scroll-driven element, pin lengths, ranges, reverse scroll, phones.
4. Visual and copy: section by section, type, color, buttons, theme, every headline and CTA.
5. UX click-through: journey, links, mobile, accessibility, performance, SEO.
6. Cross-site consistency, when there are siblings: tokens, nav, footer, naming, linking both ways.
7. Outside benchmark, when the owner names one: what to borrow, where the product already wins, what not to copy.

These parts can run in parallel with one reviewer each. Keep motion, hover, and scroll as separate parts. One reviewer skims them when they share a file.

## How to measure

Use the scripts in `design-review/scripts/`:

- `capture.mjs` for the four captures plus console errors, sideways scroll, and dead main actions.
- `stress.mjs` for long words, doubled text, 200 percent text, right to left, 320 px width, empty and long lists, slow network.
- `hover-probe.mjs` for rest, hover, activation, and focus values per selector.
- `scroll-probe.mjs` for triggers, ranges, pins, and reverse behavior.
- `reduced-motion.mjs` for end states with Reduce Motion on (being added by someone else).

Measure at 1440x900, 768x1024, and 390x844. Check light and dark color schemes. Run one full pass with Reduce Motion on. Run one touch pass with `hasTouch`. Read selectors and file positions from the downloaded source.

## Evidence rules for every finding

Each finding needs all five:

- Title in plain words.
- Severity: High, Medium, or Low.
- Evidence: selector or file:line, measured value, screenshot link.
- Why it matters: who it hurts and where.
- Exact fix with values: the rule, the token, the size, the copy.

Use only measured numbers. Contrast ratios, sizes, counts, bytes, timings: read them from the browser or the source. Mark anything else as inference. Every part ends with a Keep list and a Not checked list.

Re-check the top findings yourself before they lead the summary. The example caught one this way: an Intel download 404 that only existed in unreleased source, so the live page had no dead button yet. It was downgraded to a post-deploy check.

## The summary README

`README.md` is the only file most people read. Keep it short and ranked:

- Verdict per site, two or three sentences each.
- Fix first: High items, with part links.
- Fix next: Medium items grouped as motion and hover, then UI and UX, then cross-site.
- Low: one line each, with part links.
- Keep: what to protect.
- Suggested order of work: same day, one pass per site, design work, polish.
- Parts table: part file, scope, one line.
- Not checked across the review.

Check that every relative link resolves: every part link, every shot link, every cross reference.

## What this caught

From the Droppy review that sets the pattern. Check these first on the next site:

- A hero download that serves a beta with no label and no file size.
- A script that blocks text selection, copying, and right click site-wide.
- Counts that disagree with themselves, like 41 extensions in HTML and 43 in the hero shot.
- Controls that change position on hover or activation, against the rule that buttons never move.
- An FAQ with no hover feedback at all.
- Loops and smooth scrolling that ignore Reduce Motion.
- Sibling links that run one way only.
