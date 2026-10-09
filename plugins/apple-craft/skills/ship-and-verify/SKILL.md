---
name: ship-and-verify
description: How to finish, test, release and report work - build, look, test in a copy, ship at a calm rhythm, then verify every public surface. Use before saying anything is done, before any release or deploy, and when someone reports a bug.
---

# Ship and verify

## Finishing a change

1. Build it and run the relevant tests. Fix what fails; never report red as done.
2. **Look at it**: screenshot it and view it at full size. UI isn't done until it's been seen.
3. Test in a copy, not in the person's real setup: a second app copy, a preview deploy, a test account.
4. Report plainly: what changed, what you checked, what you could **not** test ("not tried on a real lid close"), and what you need from them.

## Bugs from users

- Read the whole report and its attachments first. Download screenshots; chat CDN links expire.
- Find the cause in the code before changing anything, and say whether it's likely or confirmed.
- Fix the cause, not the symptom. Never weaken a security check to make something "work".
- Credit the reporter in the release notes.

## Release rhythm

A real lesson: one app shipped five updates in one day. A developer in its community called it "slopcoding": it made the product harder to maintain and users got an update prompt over and over. So:

- **One release per checkpoint, not one per fix.** Collect fixes on `main` and ship them together once the build is solid and worth a restart.
- **At most one release a day**, normally a few days to a week apart. The exception is a serious problem (security, data loss, the app broken for most people): ship that fix alone, straight away.
- **Test before releasing**: on real hardware for anything hardware-related, and with a tester when you can't test it yourself. A fix nobody has tried isn't a release yet.
- **When asked to "ship it"** right after another release, or for a tiny change, say so and suggest bundling. If they still want it out, ship it.
- **Commits aren't releases.** Pushing to `main` is fine anytime. Only a release (a version bump, a GitHub release, an update prompt, an announcement) reaches users.
- **Each release reads as one update**: a clear summary line, a few grouped headings, one picture of the main change.

## Releasing

- Only when asked; "ship it", "release it" and "push it" count as asking.
- Follow the project's exact release steps (its `project-<name>` skill): bump the version, build for every architecture, package, checksum, update the package manager, write notes per `release-notes` with a new picture, publish.
- Then **verify every surface**: the download matches its checksum, the website and update feed show the new version, the package manager points at it, and the announcement posted and renders well.

## Safety, always

- Ask before deleting files permanently; look before overwriting.
- Warn before restarting the person's running app.
- Never store, type or ask for passwords. Never repeat tokens or webhook URLs; if one is pasted, suggest resetting it.
- Keep private repos private, and keep personal email addresses out of third-party services.
- If a tool call is rejected, stop and wait.
- Anything public (a post, an issue reply, a pull request) needs a yes first, unless you were already asked to do it.
