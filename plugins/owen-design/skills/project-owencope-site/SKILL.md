---
name: project-owencope-site
description: Rules, commands and context for Owen's portfolio site (~/Developer/owencope-site, PRIVATE repo OwenCope/owencope-site, plain static HTML/CSS/JS on Cloudflare Pages at owencope.pages.dev). Load whenever working in that repo.
---

# Project: owencope.pages.dev (Owen's portfolio)

Load `apple-design`, `web-design` and `ship-and-verify` alongside this, plus `design-patterns` (the pill buttons and MorphLabel come from gazeunlock.com), and run `design-review` before showing work. For Liquid Glass materials, load `liquid-glass`.

## Facts
- Checkout `~/Developer/owencope-site`, **private** repo `OwenCope/owencope-site`, branch `main`. Keep it private.
- Plain static site, no build step and no framework: everything served is in `site/` (`index.html`, `styles.css`, `glass.css`, `main.js`, `assets/`).
- Hosted on Cloudflare Pages, project `owencope`, at https://owencope.pages.dev (Owen's Cloudflare account; `wrangler` is signed in on this Mac).
- `BRIEF.md` in the repo root is the original brief: project facts to confirm with Owen, and the is-a.dev steps.
- One page, one Apple product-page story: real photo, real app icons, real wallpapers. No tracking, no cookie banner.

## Sections (in `site/index.html`)
1. **Hero:** Owen's photo (`assets/owen-portrait.webp`) on the theme's wallpaper, "Owen Cope", one line ("Student developer making native Mac apps."), a blue "See my work" pill and an ink "GitHub" pill.
2. **Projects:** one Apple-style card per project. Gaze is a dark card with the real lock-screen recording playing inside a MacBook Air shell, a "Learn more" pill with the label-to-arrow morph, and a "Source on GitHub" link. Add a project as a new card, not a grid of identical tiles.
3. **About:** a short statement in Owen's voice.
4. **My setup:** a scrolling shelf of app cards (real app icon, name, one line) with previous/next buttons, then the machine line.
5. **Contact:** email, GitHub, and the Discord username as a copy button.

## Design rules specific to this project
- **Theme:** `data-theme="light|dark"` on `<html>`. An inline script in `<head>` sets it before first paint from `localStorage` or the system setting; `main.js` runs the sun/moon switch in the nav, remembers the choice, and follows the system until the visitor picks. Dark uses the **Pro Black** wallpaper (`assets/problack*.webp`), light uses **Hello Metallic Silver** (`assets/silver*.webp`), set through `--wall` / `--wall-small` in `styles.css`. Both themes must look right.
- **Buttons:** `site/glass.css`, ported from gazeunlock.com's LiquidButton. `.pill.pill-solid` is the blue action with the 1 px gradient rim; `.pill.pill-solid.pill-neutral` is the secondary pill in the ink colour. Don't use `.pill-glass` for secondary actions; Owen rejected it.
- Colours come from the variables in `styles.css` (`--bg`, `--ink`, `--accent` #0071e3). System font stack.
- The video plays only while on screen and never under Reduce Motion (`main.js`).
- After changing CSS or JS, bump the `?v=` query on the `<link>` and `<script>` tags in `index.html` so browsers fetch the new files.

## Commands
- Preview: `python3 -m http.server 4321` from `site/`, then open http://localhost:4321. Check 1440 px and 375 px, light and dark.
- Deploy (only when asked, and after Owen has seen screenshots): from the repo root,

      npx wrangler pages deploy site --project-name owencope --branch main --commit-dirty=true

  Never pass `--force` again. Then load https://owencope.pages.dev and confirm the change is live.

## Must never change
- The repo stays private. Don't list private repos as links, and never invent stars, downloads, users or quotes.

## Next up
- **owencope.is-a.dev** is planned (steps in `BRIEF.md`: a `domains/owencope.json` CNAME to `owencope.pages.dev` in a fork of `is-a-dev/register`). Don't open that PR until Owen says go.
