---
name: ship-and-verify
description: Owen's standard for finishing, testing, releasing and reporting work in any project — build, look, test, ship, then verify every public surface. Load before saying anything is done, before any release or deploy, and when a user reports a bug.
---

# Ship and verify

## Finishing a change
1. Build it. Run the relevant tests. Fix what fails — don't report red as done.
2. **Look at it** (screenshot, full size). UI isn't done until it's been seen.
3. Test in a copy, not in the owner's real setup (a second app copy, a preview deploy, a test account).
4. Report plainly: what changed, what you checked, what you could **not** test (e.g. "not tried on a real lid close"), and what you need from the owner.

## Bugs from users
- Read the whole report and its attachments first (download screenshots; chat-CDN links expire).
- Find the cause in the code before changing anything. State it as likely vs confirmed.
- Fix the cause, not the symptom. Never weaken security checks to make something "work".
- Credit the reporter in the release notes.

## Releasing
- Only when asked ("ship it", "release it", "push it" count as asking).
- Follow the project's exact release steps (see its `project-*` skill). Bump the version, build for every architecture, package, checksum, update the package manager, write notes per `release-notes` with a new picture, publish.
- Afterwards **verify every surface**: the download matches its checksum, the website/update feed shows the new version, the package manager points at it, the announcement posted and renders well.

## Safety rules (always)
- Ask before deleting files permanently; look before overwriting.
- Warn before restarting the owner's running app.
- Never store, type or ask for passwords. Never repeat tokens or webhook URLs; if one is pasted, advise resetting it.
- Keep private repos private. Don't put the owner's personal email into services.
- If a tool call is rejected, stop and wait for instructions.
- Anything public (a post, an issue reply) — confirm first unless already asked.
