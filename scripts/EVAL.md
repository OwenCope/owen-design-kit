# Eval: compare two OpenCode runs fairly

Run the same short brief through the OpenCode CLI into a fresh folder, then
capture the result at fixed sizes so two runs can be compared side by side.

## Run an eval

Pick a brief below, save it to a file, then run one eval per model:

    node scripts/eval-run.mjs --brief scripts/briefs/notch.txt --model <model-id> --out ~/kit-eval/notch-2
    node scripts/eval-run.mjs --brief scripts/briefs/habit.txt --model <model-id> --out ~/kit-eval/habit-1 --port 8601

The script refuses if `--out` already exists and is not empty. It writes
`brief.txt`, `run.json` (model, date, kit version, opencode version, exact
command), streams the agent's output to `agent.log` (killed after `--timeout`
seconds, default 1800), then captures `out/captures/` (desktop 1440x900 light
and dark, phone 390x844, plus a full-page desktop shot) and writes
`summary.md` with files produced, duration, exit code, and whether
`index.html` existed. Needs Playwright installed where you run it:
`npm i -D playwright && npx playwright install chromium`.

## Compare two runs

    node scripts/eval-run.mjs --compare ~/kit-eval/notch-1 ~/kit-eval/notch-2

This builds `compare.html` in the current directory with each capture name as
a row and the two runs side by side, then screenshots it to `compare.png`.

## Judging

Judging is done by looking: open the captures or `compare.png` and pick the
better run. Owen picks; the pick is recorded in
`plugins/owen-design/skills/working-with-owen/picks.md`. The model's own
self-report in `agent.log` does not count.

## Briefs

Notch brief:

    Build an interactive browser mock-up of a Mac notch app where people can store files and retrieve them later. Use my design kit at /Users/owencope/Developer/owen-design-kit, starting with its AGENTS.md. Make the design and interaction decisions yourself. Create the mock-up in the current folder without modifying the kit. Run it, inspect the result, and leave the preview running. Finish with the preview URL and a short explanation of your design choices.

Habit brief:

    Build an interactive browser mock-up of an iPhone habit tracker: see today's habits, check them off, and see a streak. Use my design kit at /Users/owencope/Developer/owen-design-kit, starting with its AGENTS.md. Make the design and interaction decisions yourself. Create it as index.html in the current folder without modifying the kit. Run it, inspect the result, and finish with a short explanation of your design choices.

## Results so far (Muse Spark 1.3, free)

| Run | Kit | Result |
|---|---|---|
| notch-1 | 3.0 | Marketing headline over the app, pale card under the notch, four add-file controls, placeholder icons, phone clipped but reported as passing |
| notch-2 | 3.3.1 | Product first, real assets, notch grows into the shelf; reused the demo's sample files and words |
| habit-1 | 3.3.1 | Native-looking iPhone screen; last section hidden under the tab bar |
| notch-3 | 3.4.0 | Own name ("Tuck") and own files, one shape grows from the notch, file visible when closed, all lint checks pass; layout still close to the reference (same desk row, same done and clear buttons) |
| devtool-1 | 3.4.0 | Real terminal output as the product, one install command, no template sections; still Apple-styled (it chose the Apple landing-page route, since fixed in 3.4.1), letter-tile logo, phone terminal line clips |
