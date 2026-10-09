# apple-craft

Skills that make coding agents build apps and websites that look like Apple made them. They were written from real work on shipping Mac apps and their websites, and every rule comes from something that was rejected and then fixed.

Works with Claude Code as a plugin, and with any agent that reads `AGENTS.md` (Codex, Cursor, Command Code and others).

## What's inside

| Skill | Use it for |
|---|---|
| `apple-design` | The core method, the pre-show checklist, what always gets rejected, and real rejected-to-fixed examples |
| `design-review` | A strict review before showing anything, with real approved and rejected pictures |
| `design-patterns` | Copy-ready SwiftUI and CSS for proven components: the glass button with a hover morph, progress swap, settings rows, update card, download button, type scale |
| `liquid-glass` | Apple's Liquid Glass and the macOS 27 components, with exact values from Apple's Figma kit, reference pictures, and web and SwiftUI recipes |
| `macos-app-design` | Mac and SwiftUI apps: controls, settings, update UI, onboarding, windows, screenshots |
| `web-design` | Websites that feel like apple.com: layout, type, buttons, light and dark, phones, accessibility |
| `onboarding-design` | A welcome tour that feels smooth, measured frame by frame from a real app |
| `product-writing` | Every word in the product and in the agent's replies |
| `release-notes` | A clean release format with a header, one real picture, short bullets, credits and install steps |
| `ship-and-verify` | Finishing, testing, a calm release rhythm, and verifying every public surface |
| `new-project-setup` | Starting a project, and making the kit yours with a profile skill and project skills |

## Install

Claude Code:

    /plugin marketplace add OwenCope/owen-design-kit
    /plugin install apple-craft@owen-design-kit

The skills load on their own when the work matches. You can also ask for one by name, for example "run design-review on this page".

Other agents: add this to your project's `AGENTS.md`, pointing at wherever you cloned the kit:

    Before any UI work, read <kit>/plugins/apple-craft/skills/apple-design/SKILL.md
    and run <kit>/plugins/apple-craft/skills/design-review/SKILL.md before showing results.
    Load the other skills in that folder when the work matches their description.

## Make it yours

The skills talk about "the person you work for". To teach the agent your own taste and projects, follow `new-project-setup`:

- a `working-with-<you>` skill with your picks and rules, which override the defaults
- a `project-<name>` skill per repo, with its commands and release steps

The `owen-design` plugin in this repo is a real example of both: it's Owen's private layer and isn't meant to be installed by anyone else.

## Updating

    /plugin marketplace update owen-design-kit
