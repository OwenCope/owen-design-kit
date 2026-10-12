# A worked session: the Tally home page

The brief two agents were given: "Build the home page for Tally, a command-line tool that tracks how long your test suite takes on every commit and tells you which change made it slower. The audience is backend developers."

This is how I work through it, step by step, with what I'm thinking at each point. The agents' real results are in `eye/` (example 3), so you can compare. Copy the thinking, not the page.

## 1. What is this, and who's it for? (a minute)

It's a product page for a developer tool. The visitor is a backend developer, probably arriving from a link in a pull request or a README, slightly sceptical, with a real problem: CI got slow and nobody knows why.

So: not an Apple product page. Developers trust pages that look like their tools, show real output, and don't oversell. That points to the precise-tool direction in `design-directions`: dark, quiet, monospace where it's code, no hype.

*What I'm avoiding: the default landing-page skeleton (hero, three feature cards, testimonials, pricing). None of that answers "will this find my slow commit?"*

## 2. The one moment (a few minutes)

What does Tally do as a verb? It **points**. It points at one commit and says "this one".

So the moment is: you see a run of normal test times, then one jumps, and the page points at the guilty commit and the exact test. If I had to describe it to a friend: "the page shows your test history and then just names the commit that did it."

Can the page itself do the verb? Yes: the visitor can hover along the timing line, and the jump is already highlighted with the blame line underneath. Maybe the line draws in once as you arrive, then stops. No looping animation.

## 3. Real material (before any layout)

- The headline is the developer's own question: "Which commit slowed your tests?" Short, theirs, not ours.
- The install command, because that's the only action that matters: `brew install tally`.
- Real-looking output. I write it first and check every number adds up: 14 commits around 6.2 s, then one at 8.6 s, so the jump is +2.4 s (+38 %), blamed on one commit and one test that went from 1.1 s to 3.4 s. Every place the number appears says the same thing.
- What it works with (pytest, go test, vitest), because that's the first objection.

*This is where agent 2 went wrong without noticing: its summary said 2.4 s slower and its table said +2m24s. Writing the data first and checking it catches that.*

## 4. Smallest version that shows the moment

Headline, one line of support, the install command with a copy button, and the terminal panel with the timing line and the blame line. Nothing else yet. I build that, serve it, and look.

## 5. First look (what I'd expect to see, and check for)

- Where does my eye land? It should be the headline, then the red point on the line. If the chart is too faint, the moment is lost.
- Is there one action? Install. Agent 2 had both an "Install" button and the copy command. I keep the command (developers copy, they don't click), and make the nav "Install" scroll to it.
- Does the logo look like a real mark, or a letter in a square? The linter fails letter tiles; I'd use a simple drawn mark or just the word.
- Phone: does the terminal line wrap or scroll sideways inside its panel, rather than pushing the page wide or cutting text?
- Read every string and every number aloud.

## 6. Only then, the rest of the page

What does a sceptical developer need next, in order?

1. How it finds the commit: one short paragraph and a second terminal snippet (`tally blame`), not three icon cards.
2. Setup: the three lines it takes in CI.
3. What it costs in overhead, as one honest number.
4. A plain footer with docs, changelog and GitHub.

Each section is there because it answers the next question, not because pages have sections.

## 7. Final pass and report

Lint, stress, phone, dark (the page is dark already; check the light version if offered), and a filmstrip if the line draws in. Then report: what it is, the moment in one line, what I checked with what I saw, anything still off.

## What made the difference

Not the code. Three decisions before any code: who it's for (so the direction is right), what the verb is (so there's a moment), and writing the real data first (so it's believable). The agents built well; they skipped one or more of those three.
