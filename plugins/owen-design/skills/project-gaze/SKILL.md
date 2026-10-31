---
name: project-gaze
description: Rules, commands and context for Gaze, Owen's Mac face-unlock app (~/Developer/FaceID, public repo OwenCope/Gaze). Load whenever working in that repo, on its lock screen, setup, settings, updates, releases, Homebrew cask or Discord release posts.
---

# Project: Gaze (Mac app)

Load `apple-design`, `macos-app-design`, `release-notes` and `ship-and-verify` alongside this, plus `design-patterns` (the Install morph button, progress swap, toolbar badge and release card come from this app), and run `design-review` before showing work. Full detail (exact release steps, build and test commands, lock-screen behaviour, the 0.1.8 plan, open issues, Discord bot) is in `reference.md` next to this file.

## Facts
- Checkout `~/Developer/FaceID`, **public** repo `OwenCope/Gaze`, branch `main`.
- Swift/SwiftUI/AppKit, macOS 26+. No Xcode project — `./build.sh`.
- Latest shipped: 0.1.11 (2026-10-05: approve admin prompts and sudo with your face, a more reliable nod, clearer Follow the light, a stronger photo check, Liquid Glass panels). 0.1.10 (2026-09-30) added unlock on first match, Space to retry and a Security tab; 0.1.9 (2026-09-29) App Lock, faster unlocks and Follow the light.

## Gaze-specific design rules
- Setup/onboarding uses **TourKit** (`ThirdParty/TourKit/TourKit.swift`) on every page; step counter in the footer at the bottom of the media.
- Primary button: `.glassProminent.tint(.blue)` capsule. The Install button's hover blurs the label into `arrow.down` (`InstallMorphLabel`).
- Settings panes, in the toolbar picker (`SettingsPane.toolbarPanes`): Unlock, Security, App Lock, Notch, General, About. App Lock has its own pane; never fold it back into Unlock. Owen's reference for future Settings work is the clean sidebar look of Droppy and Wick (see `macos-app-design`).
- Settings > General starts with **Updates**: version row with Check Again; release card with icon, "Gaze X.Y.Z", one Install button (becomes a progress bar), then notes via `ReleaseNotesView`. Toolbar shows a small blue "Update available" icon that only navigates.
- Setup media are real: `Resources/Art/setup-*.png` and looping videos; the Accessibility page is a real System Settings screenshot with a live Toggle.
- Lock-screen panel lives under the notch (`Sources/LockScreen/`), face drawn by Metal (`Sources/Companion/`).

## Commands
- Fast build: `GAZE_ARCHS=arm64 GAZE_BUILD_OUTPUT="$PWD/build/dmg-launch/Gaze.app" ./build.sh`. Universal for releases: drop `GAZE_ARCHS`. Needs ≥ 5 GB free.
- Tests: `bash Tests/<Suite>/run.sh` (29 suites). Settings → SettingsInteraction, SettingsUX, SettingsSearch. Lock screen → ProductBoundary, LockScreenSecurity, UnlockFlow. Drawing/setup → Onboarding, Notch. Clean up `build/*-regression build/onboarding-checks.*`.
- Review copy (never touch Owen's installed Gaze): `ditto` to `/tmp/gut/Gaze.app`, set version 0.1.0 with PlistBuddy, re-sign with `codesign --force --preserve-metadata=entitlements,requirements,flags,runtime -s "Apple Development: owen.o.cope@gmail.com (Y6LG3Q6HV4)"`, run with `--ui-review --settings --settings-pane=face|movements|security|attempts|apps|notch|general|about|credits` or `--ui-review --setup --setup-step=how|capture|password|permission|done`.
- Lock-screen pictures: run the copy with `--shoot-lockscreen --shoot-movements`, full-screen screenshot, crop, kill it.

## For design agents (read before any Gaze picture, page or mock-up)

- **Never draw Gaze's UI.** Its panels, the notch capsule and the face are real code (the face is Metal, `Sources/Companion/`). A vector or HTML copy always looks off. Get pictures from the app:
  - Settings and setup screens: the review copy above with `--ui-review --settings --settings-pane=…` or `--ui-review --setup --setup-step=…`.
  - Lock screen and movements: `--shoot-lockscreen --shoot-movements`.
  - App Lock: `--ui-review --app-lock-preview=<bundle id of a running app>`, plus `--app-lock-preview-success` for the unlock.
  - Screenshot the window with the `maccontrol` MCP `screenshot` tool, crop with a short Swift script (`sips --cropOffset` is unreliable).
- **Real art already exists** in `Resources/Art/`: the tour and setup pictures and loops (`tour-*.png`, `how-*.mp4`, `setup-*.png`, `onboarding-*.png`), the five movement pictures (`movement-*.png`), the lock-screen base, the backdrop and the toolbar icons (`gaze-toolbar-black/white.png`). Use these before making anything new.
- **The kit's `motion-kit/tour.html` is a Gaze welcome tour** built for the web (Welcome to Gaze, Just look, Follow the light, Nod to approve, Lock any app). It's a mechanics demo: reuse its ideas for Gaze, not for other products. Give it real art as `tour-art.jpg`; Owen's pick for Mac scenes is the dark Pro Black wallpaper.
- **If the documented way to get a picture fails, stop and tell Owen.** Never patch the app's code, tests or `build.sh` just to get a picture, and never touch the running copy (see below).
- **Check `git status` first.** Owen often has uncommitted work in progress in this repo; never revert or "clean up" files you didn't change.

## Letting Owen try a build (read this, agents get it wrong)
Owen's Mac does **not** run Gaze from /Applications. A launch agent (`~/Library/LaunchAgents/com.gazeunlock.Gaze.agent.plist`, KeepAlive) runs `~/Developer/FaceID/build/Gaze.app`. That means:
- **Building doesn't change what he sees.** Builds go to `build/dmg-launch/Gaze.app`, and the running copy stays the same.
- **Quitting Gaze doesn't help.** The agent relaunches the old copy straight away.
- **Opening another copy makes things worse.** Two Gaze processes fight over the camera and the lock screen.

To let him try your build:
1. Build: `GAZE_ARCHS=arm64 GAZE_BUILD_OUTPUT="$PWD/build/dmg-launch/Gaze.app" ./build.sh`, and run the matching tests.
2. **Tell Owen Gaze will restart**, then run `Tools/Scripts/install-local.sh`. It stops the agent, keeps the old copy as `build/Gaze previous.app`, swaps in the new one, restarts, and prints the version now running.
3. Tell him exactly what to try.
4. To undo: `Tools/Scripts/install-local.sh --restore`.

Never build unfinished work into the running copy without telling him, and never leave him on a half-built feature: he'll test it and report bugs that aren't his.

## Releasing
Exact steps in `reference.md` §6: bump `Resources/Info.plist` → universal build → DMG made from `build/installers/release-0.1/Gaze-0.1-x86_64-arm64-local-preview.dmg` (UDRW, resize 400m, swap app, rename volume, UDZO) → sha256 into `Tools/Release/Homebrew/gaze.rb` (keep `auto_updates true`) → notes at `~/Desktop/Gaze X.Y.Z release notes.md` with a new picture in `docs/images/release-X.Y.Z-*.png` → commit, push → `gh release create` → update tap `OwenCope/homebrew-gaze` → verify DMG hash, `https://gazeunlock.com/api/latest`, and the `discord-release` workflow.

## Security (never weaken)
Lock-screen flow is in `Sources/Security/LockWatcher.swift`: scans only with the display on; any key/click after the wake settle stops Gaze for that lock; 2 s match hold → movement challenge → anti-spoof → password; six misses lock out. Don't trade any of this for smoothness.

## Next up
0.1.8, 0.1.9, 0.1.10 and 0.1.11 shipped on 2026-09-28, 29, 30 and 2026-10-05. That is faster than the release rhythm in `ship-and-verify`; space the next one out. One tested release per checkpoint.

Parked by Owen after 0.1.10 (still parked after 0.1.11) (raise them when he asks what's next; don't start them unasked):
- Space to retry needs Input Monitoring, which Gaze must ask for: a Security > Permissions row that calls `IOHIDRequestAccess`. Then put the Space line back in the release notes.
- Filling macOS admin password pop-ups with the face (asked for by Rafael Reverberi on Discord). Needs a security review before anything is built.
- Reddit posts are drafted; r/MacApps needs 10 local karma and its template, title prefixed [OS].

Planned by Owen (2026-10-13, "that is sick"), for a future release, not to start unasked:
- **Bring the welcome tour into the app.** The kit's `motion-kit/tour.html` (open it served with its assets: Welcome to Gaze, Just look, Follow the light, Nod to approve, Lock any app) is the direction for Gaze's own first-run tour. Build it natively in SwiftUI inside TourKit, not as a web view: the camera move into the MacBook, the notch growing into the live panel, pages that morph the same panel while the art, text and button stay still. Use the real face (Metal) and real art from `Resources/Art/`, Pro Black behind it, Reduce Motion handled. Fix the web version's empty first frame (button with no label, no title) so the native one starts with its content. Show Owen a recording before it ships.

Older plans and open issues are in `reference.md` §9–10. Bluetooth unlock was considered and rejected: the face is the only way in.

## Code patterns specific to Gaze
### A new preference that defaults to on (`Preferences.swift`)

    // Key enum
    static let lightUpInDark = "lightUpInDark"
    // property
    var lightUpInDark: Bool {
        didSet { defaults.set(lightUpInDark, forKey: Key.lightUpInDark) }
    }
    // init(defaults:) — `as? Bool ?? true`, so missing means on
    lightUpInDark = defaults.object(forKey: Key.lightUpInDark) as? Bool ?? true

Defaults that are off use `defaults.bool(forKey:)`. Copy the nearest existing switch, such as `showNotchCaptions`.

### Settings rows in Gaze
- Toggles: use `SettingToggle(title:detail:symbol:isOn:)` in `Theme.swift`.
- Dividers: `RowDivider()` (inset to the text) between rows with icons, `RowDivider(inset: 0)` only above a full-width card.
- Search: each new row gets a `SettingsSearchItem` with its pane, section id and 3 to 6 keywords.
