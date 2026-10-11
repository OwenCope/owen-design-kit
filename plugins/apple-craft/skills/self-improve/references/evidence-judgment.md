# Seeing clearly

Most bad fixes come from judging something you didn't really look at. Read this when you're unsure what a screenshot or recording shows, or when you need to list a feature's states.

## Say what you see before you judge it

Two or three plain sentences, from the actual image or playback:

- What catches the eye first, and what comes next.
- What sits on top of what. Is all the text readable, every control reachable?
- What state it's in, and what just happened to get there.

Keep three things apart:

- **Seen:** "the heading covers the Play button during the transition."
- **Measured:** "the DOM says their boxes overlap." Boxes overlapping doesn't mean the overlap is visible.
- **Guessed:** "a stacking bug." It stays a guess until you check.

A screenshot can't show timing, and numbers can't show feel. If you can't see the images or the playback, say so; never describe them from the code.

## Sort what you found

- **Broken:** it doesn't do what it must (a drop that parks nothing, focus lost, text covered). Find the cause, fix it, retest the exact case.
- **Against the brief:** it contradicts what was decided (the product isn't the biggest thing). Fix it and keep the idea.
- **Taste:** another choice might be nicer, but nothing is wrong. Offer it to the person; don't call it a bug.
- **Not sure:** you're missing the evidence. Go and get it before changing anything.

Finding nothing to fix is a fine result. A problem that keeps coming back needs its cause found, not a new idea.

## List the states the feature really has

A short table: state, what triggers it, what the person should see, checked or not. Consider default, loading, empty, error, success, interrupted and disabled, plus focus, Reduce Motion, phone and dark where they matter. Mark the ones it can't reach as N/A with a reason, and don't invent UI to fill the list. Check the moments between states too: that's where focus gets lost and panels sit empty.

## Feedback from the person

Keep their exact words next to the screenshot or moment they were about. Their words describe what they saw; your idea of the cause is separate. Work out what they meant (`how-claude-designs`, section 5) before fixing.

## How to end

- **Ready for Owen to look at:** you looked at everything that matters and nothing is broken. Ready isn't approved.
- **Visual review pending:** you couldn't see the images or playback.
- **Unresolved failure:** something is still broken. Name it.

Practice cases: [examples/evidence-judgment.md](../examples/evidence-judgment.md).
