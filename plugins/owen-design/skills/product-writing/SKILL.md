---
name: product-writing
description: How every word in Owen's products, sites, posts and replies must read — short, plain, Apple-like. Load whenever writing or editing UI text, buttons, errors, onboarding copy, website copy, Discord/social posts, README text, commit messages or replies to the owner.
---

# Writing like Apple

## Rules
- **Say what the person gets, not how the code works.** "The face in the panel now appears when you open the lid." — not "Fixed Metal drawable after display wake."
- **Short.** One idea per sentence or bullet, under ~15 words. If a sentence could lose half its words, cut them.
- **Plain words.** No jargon, no internal names, no thresholds, no HTTP codes. Those go in logs.
- **Buttons are verbs**, one or two words: Install, Next, Check Again, Quit and Reopen, Download for Mac.
- **Status text is calm:** "Checking…", "Installing…", "Gaze is up to date", "Couldn't check for updates. Try again." Use the real ellipsis character (…) and curly apostrophes (’) in UI.
- **Errors say what to do next**, in one line: "Move Gaze to Applications to install updates."
- **No hype or filler:** no "simply", "seamlessly", "powerful", "revolutionary", "we're excited", no exclamation marks, no emoji.
- **Consistent names.** Pick one word for a thing and use it everywhere.
- **Credit people by the name they use**, and describe what they did plainly ("Helped develop Gaze and set up the Discord").
- **Pronouns:** they/them for anyone whose pronouns you don't know.

## Replies to Owen
- Lead with the result. Short. Plain.
- Never use Markdown blockquotes (`>`) — they render almost invisible in his app. Use plain paragraphs, lists, or a code block for text he'll copy.
- Say clearly what you did not test and what you still need from him.
- Owen writes fast with typos; read for intent. "eww", "worse", "looks AI" mean start that part over.

## Examples
| Instead of | Write |
|---|---|
| "An update (v0.1.6) is now available for download — Gaze 0.1.6" | "Gaze 0.1.6 is available." |
| "Error 503: release feed unreachable" | "Couldn't check for updates. Try again." |
| "Improved robustness of camera session initialization post-wake" | "If the camera is slow to start after sleep, Gaze tries it again." |
| "Click here to proceed to the next step" | "Next" |
