---
name: new-project-setup
description: How to add a new project of Owen's to this design kit, and how to start any new app or website so it meets his standard from day one. Load when starting a new project, or when working in a project that has no project-* skill yet.
---

# Starting or adding a project

## 1. Starting any new product
- Load `working-with-owen` and `apple-design`, plus `macos-app-design` or `web-design`.
- Pick the Apple reference first (which Apple app/page is this closest to?) and write it down in the project skill.
- Use native controls and the system font from the first screen. Set one button style, one spacing scale, one animation curve, and reuse them.
- Plan real pictures: how will you capture real screenshots for the site and release notes?
- Set up releases to follow `release-notes` from version one.

## 2. Adding a project skill to this kit
Create `plugins/owen-design/skills/project-<name>/SKILL.md` using this template, then bump the plugin version in both manifests.

    ---
    name: project-<name>
    description: Rules, commands and context for <Name> (<path>, <public|private> repo <owner/repo>, <stack>). Load whenever working in that repo.
    ---

    # Project: <Name>

    Load apple-design, <macos-app-design|web-design>, ship-and-verify (and release-notes if it ships releases).

    ## Facts
    - Checkout, repo (public/private), branch, stack, hosting.
    - Latest version shipped.

    ## Design rules specific to this project
    - Apple reference it follows.
    - Signature components (e.g. the download button) and where they live.
    - Framework rules (e.g. "every onboarding page uses TourKit").

    ## Commands
    - Build, test, preview/review copy, deploy/release — exact commands.

    ## Releasing
    - Exact steps and every surface to verify afterwards.

    ## Must never change
    - Security rules, public APIs/feeds other apps depend on, privacy promises.

    ## Next up / open issues

## 3. Pointing the project at the kit
Add to the project's `AGENTS.md` (or `CLAUDE.md`):

    Before any work, load the owen-design skills: working-with-owen, apple-design, and project-<name>.
    If skills aren't available, read ~/Developer/owen-design-kit/plugins/owen-design/skills/*/SKILL.md directly.
