---
name: project-gazeunlock-site
description: Rules, commands and context for gazeunlock.com, the Gaze website (~/Developer/gaze-site, PRIVATE repo OwenCope/gaze-site, Next.js on Google Cloud Run), including its update feed and the Discord /bug bot. Load whenever working in that repo.
---

# Project: gazeunlock.com

Load `apple-design`, `web-design` and `ship-and-verify` alongside this, plus `design-patterns` (the download button, MorphLabel and the seven-step type scale come from this site), and run `design-review` before showing work.

## Facts
- Checkout `~/Developer/gaze-site`, **private** repo `OwenCope/gaze-site` — never make it public.
- Next.js with breaking changes: read `node_modules/next/dist/docs/` before writing Next code; heed deprecations.
- Hosted on Google Cloud Run since 2026-10-03 (moved off Vercel after its free tier paused the site): project `gaze-510506`, service `gaze-site`, region `us-central1`, built from the `Dockerfile` (Next standalone). Data lives in the private bucket `gs://gaze-site-data-510506` through `src/lib/object-store.ts` (`GCS_BUCKET`), which replaced Vercel Blob. Keep reads cached so the site stays inside the free tiers.
- DNS is at GoDaddy: four A records and a `www` CNAME to `ghs.googlehosted.com`. The `google-site-verification` TXT record must stay.
- Fonts: system stack then Inter (`src/app/layout.tsx`, `src/app/globals.css`).

## What lives where
- Pages: `src/app/` (home, download, dl, face-id-for-mac, releases, features, how-it-works, security, privacy, terms, credits, testers, signin, admin).
- Buttons: `src/components/ui/liquid-glass-button.tsx` (`LiquidButton`). The `solid` variant (blue with a 1 px gradient rim) is the one Owen likes; don't use the frosted `glass` variant for new secondary actions (see `web-design`).
- Theme: `next-themes` with `attribute="class"`, `defaultTheme="system"`; the switch is `src/components/theme-toggle.tsx` in the nav.
- Download button and menus: `src/components/get-buttons.tsx`, `release-menu.tsx` (install guide for every version).
- Release data: `src/lib/releases.ts` (`siteNotes` keeps pictures), `src/lib/github-releases.ts` (download counts, sha256).
- `/api/latest` — the update feed the Mac app reads. Changing its shape breaks updates for every installed copy; keep it backward compatible.
- `/api/discord/interactions` — the `/bug` command (`src/app/api/discord/interactions/route.ts`): 5-field form with file upload, posts as "Gaze", files a GitHub issue on OwenCope/Gaze.
- Credits: `src/lib/credits.ts`.

## Commands
- Checks: `npx tsc --noEmit` and `npx eslint src`.
- Deploy (only when asked): `gcloud run deploy gaze-site --source . --region us-central1` from `~/Developer/gaze-site` (gcloud is signed in as owen.o.cope@gmail.com), then load the live page to confirm. Don't use Vercel any more.
- Secrets (names only; values stay in Google Secret Manager): `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `ADMIN_EMAILS`, `DISCORD_PUBLIC_KEY`, `DISCORD_BUGS_WEBHOOK`, `GITHUB_ISSUES_TOKEN` (fine-grained, OwenCope/Gaze issues only, expires 2027-10-03; also mounted as `GITHUB_TOKEN`).

## Known to-do
- `/bug` attachments are temporary Discord CDN links; store them permanently (upload to the GitHub issue or the Cloud Storage bucket).
- `RESEND_API_KEY` and `SIGNIN_EMAIL_FROM` were never set, so email sign-in doesn't send.
- After the move, testers and roles start empty and admin uploads are switched off on Cloud Storage.
