# apple-craft

Skills that make coding agents build apps and websites that look like Apple made them. They were written from real work on shipping Mac apps and their websites, and every rule comes from something that was rejected and then fixed.

Works with Claude Code as a plugin, and with any agent that reads `AGENTS.md` (Codex, Cursor, Command Code and others).

## What's inside

| Skill | Use it for |
|---|---|
| `how-claude-designs` | How the best design sessions think: the moment first, real before invented, compare against the real thing, find the cause, read feedback precisely. Load first. |
| `apple-design` | The core method, the pre-show checklist, what always gets rejected, and real rejected-to-fixed examples |
| `design-review` | A strict review before showing anything, with real approved and rejected pictures |
| `design-patterns` | Copy-ready SwiftUI and CSS for proven components: the glass button with a hover morph, progress swap, settings rows, update card, download button, type scale |
| `liquid-glass` | Apple's Liquid Glass and the macOS 27 components, with exact values from Apple's Figma kit, reference pictures, and web and SwiftUI recipes |
| `macos-app-design` | Mac and SwiftUI apps: controls, settings, update UI, onboarding, windows, screenshots |
| `web-design` | Websites that feel like apple.com: layout, type, buttons, light and dark, phones, accessibility |
| `mac-props` | Showing a Mac app on a believable Mac: the laptop, menu bar, window above the Dock, clean window screenshots, copy-ready CSS |
| `signature-moments` | Being creative without looking generic: one on-brand moment per product, found from what the app does, with worked examples |
| `figma-mockups` | Connecting the Figma MCP and building mock-ups from Apple's macOS 27 and iOS 27 kits instead of drawing controls |
| `design-brief` | The decisions to write down before building: the one thing, the hero frame, what moves, what's cut, concepts only when the idea is still open, and worked examples of the reasoning |
| `motion-kit` | Finished, tuned motion in one small file: springs, morphs, fly-to-target, drag, stagger, reveal and pinned scroll scenes, with a working notch-shelf reference, how to approach new or broken motion, and a filmstrip tool that slows motion down and lays the frames side by side |
| `self-improve` | A self-reflection loop that lets any agent, including smaller models, raise its own design quality: capture, test, say what you see, fix what's broken or off-brief, repeat while it helps |
| `match-the-project` | Working on someone else's app or site: read its design system first, write it down, and match it instead of restyling |
| `improve-existing` | Making an existing site or app better: what works, the one thing hurting it most, structure before polish, before and after |
| `product-ui` | The inside of a product: tables, dashboards, settings, search, editors, and full flows with every state, error and way back |
| `onboarding-design` | A welcome tour that feels smooth, measured frame by frame from a real app |
| `product-writing` | Every word in the product and in the agent's replies |
| `release-notes` | A clean release format with a header, one real picture, short bullets, credits and install steps |
| `ship-and-verify` | Finishing, testing, a calm release rhythm, and verifying every public surface |
| `new-project-setup` | Starting a project, and making the kit yours with a profile skill and project skills |

## With other design skills

apple-craft is specific: on Apple-platform products and Apple-style sites it overrides general design skills (antislop, ui-ux-pro-max and similar). On anything else, the project's own design wins and the general skills fill the gaps.

## Install

### Claude Code

Add the marketplace, then install the plugin.

    claude plugin marketplace add OwenCope/owen-design-kit
    claude plugin install apple-craft@owen-design-kit

To update later, update the marketplace, then update the plugin, then restart Claude Code.

    claude plugin marketplace update owen-design-kit
    claude plugin update apple-craft@owen-design-kit

Only apple-craft is for sharing; owen-design is the author's private layer.

### OpenCode

OpenCode does not read Claude Code plugins. Clone the repo, then copy every folder in plugins/apple-craft/skills/ into ~/.config/opencode/skills/.

    for d in plugins/apple-craft/skills/*/; do cp -R "$d" ~/.config/opencode/skills/; done

Copy, because symlinks may not be followed. Quit OpenCode fully (Cmd+Q) and reopen, because skills load at start. Copies do not update themselves: pull the repo and copy again after updates.

### Other agents (Codex, Cursor and others)

Copy the same folders into that tool's skills folder if it supports SKILL.md skills, or point the agent at plugins/apple-craft/skills/*/SKILL.md and ask it to read apple-design first.

Check it works: ask the agent "load the apple-design skill and tell me its first rule"; if it says the skill is not found, it was not installed or the app was not restarted.

The design-review capture scripts need Playwright and axe-core in the project: `npm i -D playwright axe-core` (then `npx playwright install chromium`).

## Make it yours

The skills talk about "the person you work for". To teach the agent your own taste and projects, follow `new-project-setup`:

- a `working-with-<you>` skill with your picks and rules, which override the defaults
- a `project-<name>` skill per repo, with its commands and release steps

The `owen-design` plugin in this repo is a real example of both: it's Owen's private layer and isn't meant to be installed by anyone else.

## Updating

    /plugin marketplace update owen-design-kit

## Checking the kit

`node scripts/check-kit.mjs` checks every skill for broken links, missing skills and lines that contradict the kit's own rules (`scripts/check-kit.rules.json`). Run it after editing any skill.
