---
name: project-gazeunlock-site
description: Rules, commands and context for gazeunlock.com, the Gaze website (~/Developer/gaze-site, PRIVATE repo OwenCope/gaze-site, Next.js on Vercel), including its update feed and the Discord /bug bot. Load whenever working in that repo.
---

# Project: gazeunlock.com

Load `apple-design`, `web-design` and `ship-and-verify` alongside this.

## Facts
- Checkout `~/Developer/gaze-site`, **private** repo `OwenCope/gaze-site` — never make it public.
- Next.js with breaking changes: read `node_modules/next/dist/docs/` before writing Next code; heed deprecations.
- Hosted on Vercel. Fonts: system stack then Inter (`src/app/layout.tsx`, `src/app/globals.css`).

## What lives where
- Pages: `src/app/` (home, download, releases, features, how-it-works, security, privacy, terms, credits, testers, signin, admin).
- Download button and menus: `src/components/get-buttons.tsx`, `release-menu.tsx` (install guide for every version).
- Release data: `src/lib/releases.ts` (`siteNotes` keeps pictures), `src/lib/github-releases.ts` (download counts, sha256).
- `/api/latest` — the update feed the Mac app reads. Changing its shape breaks updates for every installed copy; keep it backward compatible.
- `/api/discord/interactions` — the `/bug` command (`src/app/api/discord/interactions/route.ts`): 5-field form with file upload, posts as "Gaze", files a GitHub issue on OwenCope/Gaze.
- Credits: `src/lib/credits.ts`.

## Commands
- Checks: `npx tsc --noEmit` and `npx eslint src`.
- Deploy (only when asked): `npx -y vercel@latest deploy --prod --yes`, then load the live page to confirm.
- Env vars (names only; values stay in Vercel): `DISCORD_PUBLIC_KEY`, `DISCORD_BUGS_WEBHOOK`, `GITHUB_ISSUES_TOKEN` (expires 2027-09-27).

## Known to-do
`/bug` attachments are temporary Discord CDN links; store them permanently (upload to the GitHub issue or blob storage).
