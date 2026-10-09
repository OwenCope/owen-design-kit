---
name: project-sakuracord
description: Rules, commands and context for SakuraCord, the native macOS Discord client Owen contributes to (~/Developer/Sakura-Cord, public repo SakuraCordApp/SakuraCord, Swift 6.4/SwiftUI, macOS 27). Load whenever working in that repo, on its issues, or on a pull request to it.
---

# Project: SakuraCord (contributor)

Load `apple-design`, `macos-app-design` and `ship-and-verify` alongside this, plus `liquid-glass` for any glass surface, and run `design-review` before showing UI work. Owen does not own this repo: the repo's own `AGENTS.md` and `docs/` win over this kit whenever they disagree.

## Facts
- Checkout `~/Developer/Sakura-Cord`, **public** repo `SakuraCordApp/SakuraCord` (GPL-3.0), default branch `main`, plus a `nightly` branch.
- Maintainer: `super-original` (almost every commit). Owen (`OwenCope`) has no push access: work on the fork `OwenCope/SakuraCord` (remote `fork`), branch per change.
- **Work from `nightly`, not `main`.** `main` only moves at releases and lags `nightly` by hundreds of commits; every contributor PR targets `nightly`. Branch from `origin/nightly` and open PRs with `--base nightly`. Before picking an issue, `git grep` and `git log --grep` on `origin/nightly`: many open issues and roadmap items (Inbox, polls) are already built there.
- Swift 6.4, SwiftUI, macOS 27 + Xcode 27 + Metal Toolchain only. SwiftPM manifests are the build source of truth (`App/`, `Packages/`); `SakuraCord.xcworkspace` is a convenience.
- Latest shipped: v0.1.6 Beta 5 (2026-10-06, pre-release). Roadmap: roadmap.sakuracord.app. Community Discord: discord.gg/hWNwFXkUTP.

## Design rules specific to this project
- Apple reference: Messages and Mail on macOS 27 (sidebar, toolbar, Liquid Glass), while keeping Discord's familiar layout and rhythm. Never make it look like a reskinned web app.
- Newest APIs only. Migrate, don't wrap; no back-deployment branches or compatibility shims.
- Before a feature, name its model, provider and presentation owner, and keep each part with its owner (see `docs/ARCHITECTURE.md`).
- Every setting lives in the settings catalog; deep links `https://sakuracord.app/settings/<page>/<control>` come from it automatically.
- Read `docs/PROTOCOL_BASELINE.md` before touching REST, Gateway, auth or uploads.

## Commands
- Once per clone: `./script/install_git_hooks.sh`, then `git config --local --get core.hooksPath` must print `.githooks`.
- Safe run (no Discord traffic): `./script/build_and_run.sh --offline`. Focused scenes: `--offline-sign-in`, `--offline-chat-performance`, `--offline-forum-performance`, `--offline-long-server-list`, `--offline-incoming-private-call`.
- Relaunch without rebuilding: `./script/run.sh --offline`.
- Live account: `./script/build_and_run.sh run` (restores the Keychain session). Read-only unless Owen asks for a specific action; never send, edit, react or join on his account just to verify.
- Lint/format, needed before every push: `./script/code_quality.sh check`.
- Tests: `./script/test.sh protocol | app | all`. Everything CI runs: `./script/ci.sh`.
- Computer Use: run `./script/runtime.sh` and target the absolute path on its `App:` line, never the app name.

## Pull requests
- One issue per PR, branch named like `fix/...` or `feat/...`, title in plain words saying what changes for the user (match recent merged PRs such as "Show video poster frames outside the chat timeline").
- Link the issue (`Fixes #N`). Include before/after screenshots or a short video from an offline scene for any UI change.
- Tests only for critical behaviour, protocol contracts, persistence or likely regressions (`docs/TESTING.md`). No committed tests for purely visual changes.
- Report exactly which checks ran: compile, tests, lint, offline visual check, live read-only check.

## Must never change
- Never push to `main`, `nightly` or tags; releases belong to the maintainer (`docs/RELEASING.md`).
- Never commit credentials, tokens or `debug_credentials` state, and never bypass the git hooks.
- Never commit this kit's files or a `CLAUDE.md` into the repo. The local `CLAUDE.md` is listed in `.git/info/exclude`.

## Next up / open issues
Owen wants to make a large contribution. Good candidates from the confirmed issues (2026-10-07): #227 voice call crash (high), #249 DND still plays sounds, #235 DM profile stuck loading, #234 members stuck loading, #240 mark viewed channels read, #222 light/OLED/transparent themes, #224 native voice messages, #233 App Intents for Siri and Spotlight. Already built on `nightly` (don't redo): Inbox #149, polls #131. Check the issue, `origin/nightly` and open PRs (e.g. #50 by Dawsson) before starting so work isn't duplicated, and ask in the Discord or on the issue before a big feature.
