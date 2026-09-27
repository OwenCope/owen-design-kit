---
name: project-gaze
description: Rules, commands and context for Gaze, Owen's Mac face-unlock app (~/Developer/FaceID, public repo OwenCope/Gaze). Load whenever working in that repo, on its lock screen, setup, settings, updates, releases, Homebrew cask or Discord release posts.
---

# Project: Gaze (Mac app)

Load `apple-design`, `macos-app-design`, `release-notes` and `ship-and-verify` alongside this, plus `design-patterns` (the Install morph button, progress swap, toolbar badge and release card come from this app), and run `design-review` before showing work. Full detail (exact release steps, build and test commands, lock-screen behaviour, the 0.1.8 plan, open issues, Discord bot) is in `reference.md` next to this file.

## Facts
- Checkout `~/Developer/FaceID`, **public** repo `OwenCope/Gaze`, branch `main`.
- Swift/SwiftUI/AppKit, macOS 26+. No Xcode project — `./build.sh`.
- Latest shipped: 0.1.7 (2026-09-27).

## Gaze-specific design rules
- Setup/onboarding uses **TourKit** (`ThirdParty/TourKit/TourKit.swift`) on every page; step counter in the footer at the bottom of the media.
- Primary button: `.glassProminent.tint(.blue)` capsule. The Install button's hover blurs the label into `arrow.down` (`InstallMorphLabel`).
- Settings > General starts with **Updates**: version row with Check Again; release card with icon, "Gaze X.Y.Z", one Install button (becomes a progress bar), then notes via `ReleaseNotesView`. Toolbar shows a small blue "Update available" icon that only navigates.
- Setup media are real: `Resources/Art/setup-*.png` and looping videos; the Accessibility page is a real System Settings screenshot with a live Toggle.
- Lock-screen panel lives under the notch (`Sources/LockScreen/`), face drawn by Metal (`Sources/Companion/`).

## Commands
- Fast build: `GAZE_ARCHS=arm64 GAZE_BUILD_OUTPUT="$PWD/build/dmg-launch/Gaze.app" ./build.sh`. Universal for releases: drop `GAZE_ARCHS`. Needs ≥ 5 GB free.
- Tests: `bash Tests/<Suite>/run.sh` (24 suites). Settings → SettingsInteraction, SettingsUX, SettingsSearch. Lock screen → ProductBoundary, LockScreenSecurity, UnlockFlow. Drawing/setup → Onboarding, Notch. Clean up `build/*-regression build/onboarding-checks.*`.
- Review copy (never touch Owen's installed Gaze): `ditto` to `/tmp/gut/Gaze.app`, set version 0.1.0 with PlistBuddy, re-sign with `codesign --force --preserve-metadata=entitlements,requirements,flags,runtime -s "Apple Development: owen.o.cope@gmail.com (Y6LG3Q6HV4)"`, run with `--ui-review --settings --settings-pane=general|face|notch|about|credits` or `--ui-review --setup --setup-step=how|capture|password|permission|done`.
- Lock-screen pictures: run the copy with `--shoot-lockscreen --shoot-movements`, full-screen screenshot, crop, kill it.

## Releasing
Exact steps in `reference.md` §6: bump `Resources/Info.plist` → universal build → DMG made from `build/installers/release-0.1/Gaze-0.1-x86_64-arm64-local-preview.dmg` (UDRW, resize 400m, swap app, rename volume, UDZO) → sha256 into `Tools/Release/Homebrew/gaze.rb` (keep `auto_updates true`) → notes at `~/Desktop/Gaze X.Y.Z release notes.md` with a new picture in `docs/images/release-X.Y.Z-*.png` → commit, push → `gh release create` → update tap `OwenCope/homebrew-gaze` → verify DMG hash, `https://gazeunlock.com/api/latest`, and the `discord-release` workflow.

## Security (never weaken)
Lock-screen flow is in `Sources/Security/LockWatcher.swift`: scans only with the display on; any key/click after the wake settle stops Gaze for that lock; 2 s match hold → movement challenge → anti-spoof → password; six misses lock out. Don't trade any of this for smoothness.

## Next up
The approved 0.1.8 plan (faster unlocks, learning the face over time, a dark-room edge light, glasses/mask mode) and open issues are in `reference.md` §9–10.
