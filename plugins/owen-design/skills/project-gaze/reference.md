# Gaze reference (detail for project-gaze)

Keep this file as the only place for these details. Update it when anything changes.

## 6. Shipping a release (the exact steps)

In `~/Developer/FaceID`:
1. Bump `Resources/Info.plist`: `CFBundleShortVersionString` to X.Y.Z and `CFBundleVersion` up by one. Use `/usr/libexec/PlistBuddy`.
2. Make a universal build: `GAZE_BUILD_OUTPUT="$PWD/build/dmg-launch/Gaze.app" ./build.sh`. It needs at least 5 GB free; check with `df -h /`. Confirm with `lipo -archs` that the result is x86_64 and arm64.
3. Make the DMG from the 0.1 layout (BuildDMG.sh's Finder step is broken):
   - `hdiutil convert build/installers/release-0.1/Gaze-0.1-x86_64-arm64-local-preview.dmg -format UDRW -o /tmp/gaze-rw.dmg`, then `hdiutil resize -size 400m /tmp/gaze-rw.dmg`.
   - Attach it with `-nobrowse`, replace `Gaze.app` inside it using `ditto`, rename the volume to "Gaze X.Y.Z" with `diskutil rename`, then detach.
   - `hdiutil convert /tmp/gaze-rw.dmg -format UDZO -imagekey zlib-level=9 -o build/installers/release-X.Y.Z/Gaze.dmg`.
   - Attach the result read-only, check the version and run `codesign --verify --deep --strict`.
4. Put the version and the DMG's `shasum -a 256` into `Tools/Release/Homebrew/gaze.rb`. Keep `auto_updates true`.
5. Write the notes to `~/Desktop/Gaze X.Y.Z release notes.md` (section 5). Make the release picture.
6. Commit and push to `main`, then run `gh release create vX.Y.Z build/installers/release-X.Y.Z/Gaze.dmg --target main --title "Gaze X.Y.Z" --notes-file ~/Desktop/"Gaze X.Y.Z release notes.md"`.
7. Update the tap: `git clone https://github.com/OwenCope/homebrew-gaze /tmp/tap`, copy the cask to `Casks/gaze.rb`, then commit and push.
8. Verify:
   - the downloaded DMG's sha256 matches;
   - `curl https://gazeunlock.com/api/latest` shows the new tag (can take about a minute);
   - the `discord-release` workflow succeeded.

Discord posts itself (`.github/workflows/discord-release.yml`):
- Each post has a title, summary, the picture full width, the notes including Install, and Download for Mac and Release Notes buttons. It uses Discord's component layout and falls back to a plain message if that's refused.
- To re-post: `gh workflow run discord-release.yml -f tag=vX.Y.Z`. Ask Owen to delete the old post first.

---

## 7. Building and testing

- Fast build for the Apple silicon (arm64) side only: `GAZE_ARCHS=arm64 GAZE_BUILD_OUTPUT="$PWD/build/dmg-launch/Gaze.app" ./build.sh`.
- Tests: `bash Tests/<Name>/run.sh`, with 24 suites in `Tests/`. Clean up with `rm -rf build/*-regression build/onboarding-checks.*`. Which suites to run:
  - Settings changes: SettingsInteraction, SettingsUX, SettingsSearch. SettingsInteraction regenerates a fixture from `SettingsView.swift`; new members may need stubs in `Tests/SettingsInteraction/ServiceStubs.swift` or `generate.py`.
  - Lock-screen changes: ProductBoundary, LockScreenSecurity, UnlockFlow.
  - The face drawing and setup: Onboarding, Notch.
- **Review copy**, to see UI without touching Owen's setup:
  - `ditto build/dmg-launch/Gaze.app /tmp/gut/Gaze.app`.
  - Set its version to 0.1.0 with PlistBuddy, so an update shows.
  - Re-sign: `codesign --force --preserve-metadata=entitlements,requirements,flags,runtime -s "Apple Development: owen.o.cope@gmail.com (Y6LG3Q6HV4)" /tmp/gut/Gaze.app`.
  - Run `/tmp/gut/Gaze.app/Contents/MacOS/Gaze --ui-review --settings --settings-pane=general|face|notch|about|credits`, or `--ui-review --setup --setup-step=how|capture|password|permission|done`.
- **Lock-screen pictures:** macOS blocks screenshots of the real lock screen. Run the review copy with `--shoot-lockscreen --shoot-movements` for a few seconds, take a full-screen screenshot, crop it, then kill the process. It covers the screen while running.
- Screenshots come from the `maccontrol` MCP `screenshot` tool (pass `app` = pid, `window_title`, `raise: true`). Crop with a short Swift/AppKit script; `sips --cropOffset` is unreliable.

---

## 8. How the lock screen works (read before changing `Sources/Security/LockWatcher.swift`)

- A scan starts when the screen locks with the display on, when the display wakes to a locked screen (after a 700 ms settle), or when the pointer moves after a scan has ended.
- Scanning never runs while the display is off (`CGDisplayIsAsleep`). If the display sleeps mid-scan, the scan stops and no miss is counted.
- Any key or click (checked after the settle) stops Gaze for that lock, so it can never type over the user. This is intentional.
- If the camera fails, it's restarted once. The search window is 12 s. A face must match for 2 s, then pass the movement challenge and anti-spoof, before the password is typed. Six misses lock Gaze out.
- The face in the lock-screen panel is drawn with Metal (`Sources/Companion/GazeCompanionRenderer.swift`) and restarts itself when the screen wakes or changes.
- Security first: never weaken the movement check, anti-spoof, the lockout or the input guard to make something feel smoother.

---

## 9. What's next (Owen approved these four for 0.1.8)

Nothing of this has been written yet. The design below has been decided; build it this way.

1. **Faster unlocks.** In `LockWatcher.swift`, when the movement challenge is on (`unlockMovementCount` > 0), lower `requiredMatchDuration` from 2.0 s to about 1.2 s; keep 2.0 s when it's off. Optionally lower `wakeSettle` to about 450 ms now that the camera restarts itself.
2. **Learns your face over time.**
   - Add `learnedPrints: [Faceprint]` to `FaceEnrollment` in `Sources/Recognition/FaceEnrollment.swift`. Decode it with `decodeIfPresent`, defaulting to `[]`, so old vaults still load.
   - Add `FaceEnrollmentStore.learn(_ print: Faceprint, for faceID: UUID)`. It keeps at most 8 learned prints (dropping the oldest), skips near-duplicates (similarity > 0.97 to any existing print), and only accepts a print scoring at least `matchThreshold + 0.05` against the **original** prints, so the face can't drift.
   - Clear the cached matcher whenever the prints change. Matching uses `prints + learnedPrints`.
   - Call it only after a **confirmed** Gaze unlock (`screenUnlocked()` with `didSubmitPassword`), using the print from the frame that passed. That print needs exposing from `UnlockFrameEvaluator.Result`.
   - Update `Tests/EnrollmentStorage` too.
3. **Works in the dark.**
   - New file `Sources/LockScreen/LockScreenLight.swift`: a borderless window adopted into the lock-screen space through `LockScreenSpace.shared.adopt`, just below the capsule's level. It shows a soft warm-white glow around the screen edges, like macOS's Edge Light, fading in over 0.3 s and out on hide.
   - New file `Sources/Recognition/FrameBrightness.swift` with `mean(_ CVPixelBuffer) -> Float?`, sampling the luma plane.
   - Show the light when frames are dark (mean below about 0.12) or faces keep failing as blurred for about 1 s; hide it when the scan ends.
   - Add a setting, "Light up the screen when it's dark", on by default, under Unlock.
4. **Glasses and masks.**
   - Add an upper-face embedding: an aligned crop with the lower 45% filled neutral grey, run through the same model. Expose it as a `FaceEmbedder` protocol method with a default that returns nil.
   - Enrolment saves `upperPrints` alongside `prints`.
   - A setting, "Unlock with a mask", under Unlock, off by default. It can only be turned on for faces scanned since this change; otherwise show "Scan your face again to use this."
   - When it's on and the full-face match fails, try the upper-face match with the threshold raised by 0.05. The movement challenge is always required on this path.
   - Keep the copy Apple-like, modelled on "Face ID with a Mask".

When 0.1.8 is done, ship it with notes and a new real picture (sections 5 and 6).

---

## 10. Open issues

- `/bug` screenshots are temporary Discord links (they stop working in about a day). They should be saved somewhere permanent, for example uploaded to the GitHub issue or to Vercel Blob. The code is `gaze-site/src/app/api/discord/interactions/route.ts`.
- ThereWasntA12: Test Recognition shows "Samples 0".
- An M1 Mac's face scan fails (not diagnosed).
- Owen's own Mac once hung at "Downloading… 100%" while updating (not reproduced; the installer now logs each step).
- The 0.1.6 and 0.1.7 lock-screen fixes haven't been tried on a real lid close; ask a tester to confirm.

---

## 11. Discord bot facts (no secrets)

- The bot posts through webhooks. The secret names are GitHub `DISCORD_RELEASE_WEBHOOK`, and Vercel `DISCORD_PUBLIC_KEY`, `DISCORD_BUGS_WEBHOOK` and `GITHUB_ISSUES_TOKEN` (the token expires 2027-09-27).
- `/bug` is registered to guild 1536688227761651822 for app 1553615407150141542. It opens a 5-field form with a file upload and files a GitHub issue labelled `bug` and `from-discord`.
- Posts appear as "Gaze" with the app icon.


## Planned: setup redesign
Owen wants Gaze's setup redone to the `onboarding-design` standard (the Droppy tour): the lock-screen wallpaper as one full-bleed scene, a Mac frame zooming into the notch, and the real notch panel morphing through the steps (looking for you → the movement prompt → unlocked) with blur crossfades. Keep TourKit's layout and every existing setup step and permission check.
