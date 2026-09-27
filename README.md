# Owen's design kit

Owen's standards for every project, in one plugin: Apple-quality design, writing, release notes and shipping, plus a section for each project.

## What's inside

General (every project):
- `working-with-owen` — how Owen works, the hard rules
- `apple-design` — the core method, checklist and rejected-vs-fixed history
- `macos-app-design` — Mac / SwiftUI apps
- `web-design` — websites
- `product-writing` — every word in the product and in replies
- `release-notes` — the exact release format
- `ship-and-verify` — finishing, testing, releasing, verifying
- `design-patterns` — copy-ready code and exact tokens for approved components
- `onboarding-design` — the smooth welcome-tour standard, with reference frames
- `design-review` — the strict review before showing anything
- `new-project-setup` — starting a project, and adding one to this kit

Per project:
- `project-gaze` — the Gaze Mac app
- `project-gazeunlock-site` — gazeunlock.com

## Install

Claude Code:

    /plugin marketplace add ~/Developer/owen-design-kit
    /plugin install owen-design@owen-design-kit

Other agents (Command Code, Codex, Cursor, anything that reads AGENTS.md): copy `AGENTS.md` from this folder into the project, or add this line to the project's own AGENTS.md:

    Before any work, read the skills in ~/Developer/owen-design-kit/plugins/owen-design/skills/ — start with working-with-owen and apple-design, then the matching project-* skill.

## Adding a project
See `skills/new-project-setup`.
