# Instructions for any coding agent

## Start here: what are you making?

Name the kind of task in one line before doing anything, then read only the skills listed for it, in order.

| You are making | Read, in order |
| --- | --- |
| An interactive prototype or mock-up of an app (the app is the page; no marketing headline unless asked) | `how-claude-designs`, `mac-props` (run its asset script first; use the real file icons, Dock and wallpaper), `product-ui`, `motion-kit` if it moves, `self-improve` |
| A product or landing page for an Apple-platform app | `how-claude-designs`, `design-brief`, `web-design`, `signature-moments`, `mac-props`, `design-review` |
| A site for anything else (developer tools, web apps, services, brands) | `how-claude-designs`, `design-directions`, `site-gallery`, `web-design`, `design-review` |
| A Mac app screen | `how-claude-designs`, `macos-app-design`, `liquid-glass`, `design-patterns`, `design-review` |
| An iPhone or iPad app screen | `how-claude-designs`, `ios-app-design` (its web mock-up section if it's a browser mock-up), `product-ui`, `mac-props` (devices/ for the real iPhone frame), `design-review` |
| Improving something that exists | `improve-existing`, `match-the-project`, `design-review` |
| Someone else's project | `match-the-project`, `design-review` |
| Words only | `product-writing` |
| A release | `release-notes`, `ship-and-verify` |

Skills live at `plugins/apple-craft/skills/<name>/SKILL.md` or `plugins/owen-design/skills/<name>/SKILL.md`.

Before saying it's done, look at your own screenshots. Saving a screenshot is not checking it.

This project follows the apple-craft skills:

1. Read only the skills in your table row; don't load the rest.
2. In Owen's projects, also read `working-with-owen` and the matching `project-<name>` skill. Owen's picks override the defaults.
3. After editing any skill, run `node scripts/check-kit.mjs` and fix every FAIL.

Follow these over your own defaults. The standard: it should look and read like Apple made it.
