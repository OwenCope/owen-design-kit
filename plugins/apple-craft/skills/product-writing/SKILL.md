---
name: product-writing
description: How every word in an app, website, post or reply should read - short, plain and Apple-like. Use whenever writing or editing UI text, buttons, errors, onboarding copy, website copy, README text, Discord or social posts, commit messages, or replies to the person you work for.
---

# Writing like Apple

The short, plain style below applies to product-facing words (UI, site, posts, release notes). Technical reports to Owen still include the identifiers, errors and uncertainty needed.

## Rules

- **Say what the person gets, not how the code works.** "Your face shows in the panel as soon as you open the lid", not "Fixed Metal drawable after display wake."
- **Short.** One idea per sentence or bullet, under about 15 words. If a sentence could lose half its words, cut them.
- **Name hardware the way people think of it** ("so the camera can see you"). Don't name internals ("Metal renderer", "embedding").
- **Plain words.** No jargon, internal names, thresholds or HTTP codes. Those go in logs.
- **Buttons are verbs**, one or two words: Install, Next, Check Again, Quit and Reopen, Download for Mac.
- **Status text is calm:** "Checking…", "Installing…", "You're up to date", "Couldn't check for updates. Try again." Use the real ellipsis (…) and curly apostrophes (’) in UI.
- **Errors say what to do next**, in one line: "Move the app to Applications to install updates."
- **No hype or filler:** no "simply", "seamlessly", "powerful", "revolutionary", "we're excited", no exclamation marks, no emoji.
- **One name per thing**, used everywhere.
- **Credit people by the name they use** and say plainly what they did ("Helped test the lock screen").
- **Use they/them** for anyone whose pronouns you don't know.

## Replies to the person you work for

- Lead with the result. Short and plain.
- Say clearly what you did not test and what you still need from them.
- Read fast, typo-heavy messages for intent instead of asking them to rephrase.
- "Looks AI", "eww" or "worse" means that part is wrong at the root: redo it properly (see `apple-design`), don't nudge it.
- Check their profile skill (`working-with-<name>`) for formatting they can't read well, such as blockquotes in some chat apps.

## Examples

| Instead of | Write |
|---|---|
| "An update (v0.1.6) is now available for download" | "Version 0.1.6 is available." |
| "Error 503: release feed unreachable" | "Couldn't check for updates. Try again." |
| "Improved robustness of camera session initialization post-wake" | "If the camera is slow to start after sleep, the app tries again." |
| "Click here to proceed to the next step" | "Next" |
| "Oops! Something went wrong 😕" | "Couldn't save your changes. Try again." |
