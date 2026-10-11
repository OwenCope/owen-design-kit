---
name: new-project-setup
description: How to start a new app or website so it meets the apple-craft standard from day one, and how to teach the agent about you and your projects with a profile skill (working-with-<name>) and per-project skills (project-<name>). Use when starting a new project, when a project has no project skill yet, or when someone wants to make this kit their own.
---

# Starting a project, and making the kit yours

## 1. Starting any new product

- Load `apple-design`, plus `macos-app-design` or `web-design`.
- Pick the Apple reference first (which Apple app or page is this closest to?) and write it in the project skill.
- Use native controls and the system font from the first screen. Choose one button style, one spacing scale and one animation curve, and reuse them (`design-patterns` has proven ones).
- Plan real pictures: how will you capture real screenshots for the site and release notes?
- Write releases in the `release-notes` format from version one.
- Start a `DESIGN-NOTES.md` at the project root and keep it short. It is the first thing every later session reads, so the design stays one design instead of drifting:

      # Design notes
      Moment: the one thing someone should remember.
      Direction: Apple product page / precise tool / ... and why.
      Type, colour, corners, motion: the choices, with values.
      Kept on purpose: things that look odd but are deliberate.
      Rejected: what was tried and turned down, and why.

  Add a line whenever a decision is made or something is rejected. Read it before changing anything.

## 2. A profile skill: teach the agent about you

The general skills say "the person you work for". A profile skill fills that in. Create it in your own plugin or in `~/.claude/skills/working-with-<name>/SKILL.md`:

    ---
    name: working-with-<name>
    description: How to work with <Name> - their taste, how they communicate, what they approve and reject, and their hard rules. Load at the start of any session in <Name>'s projects.
    ---

    # Working with <Name>

    ## Who they are
    - What they build, for whom, and the one question they judge work by.

    ## How they communicate
    - Message style, what short reactions mean ("eww" = redo it), how they report bugs.
    - Formatting their chat app shows badly (for example blockquotes).

    ## Their picks (these override apple-craft defaults)
    - Button style, colours, corner radii, fonts, reference apps they love.

    ## Hard rules
    - When to commit, push, release or post. What never to touch. Privacy rules.

Keep it short and concrete. Every rule should come from something they actually said or rejected.

## 3. A project skill: one per repo

Create `project-<name>/SKILL.md` next to your profile skill:

    ---
    name: project-<name>
    description: Rules, commands and context for <Name> (<path>, <public|private> repo <owner/repo>, <stack>). Load whenever working in that repo.
    ---

    # Project: <Name>

    Load apple-design, <macos-app-design|web-design>, ship-and-verify (and release-notes if it ships releases).

    ## Facts
    - Checkout path, repo, branch, stack, hosting, latest version shipped.

    ## Design rules for this project
    - The Apple reference it follows, its signature components, framework rules.

    ## Commands
    - Exact build, test, preview and release commands.

    ## Releasing
    - Exact steps, and every surface to verify afterwards.

    ## Must never change
    - Security rules, public APIs and feeds other apps depend on, privacy promises.

    ## Next up

## 4. Point the project at the skills

Add to the project's `CLAUDE.md` or `AGENTS.md`:

    Before any work, load the apple-craft skills apple-design and design-review,
    plus working-with-<name> and project-<name>.

Agents that don't load plugins can read the files directly from the kit's `skills/*/SKILL.md`.
