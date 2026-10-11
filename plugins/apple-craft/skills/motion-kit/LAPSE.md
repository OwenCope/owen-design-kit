# Inspecting motion with Lapse

Lapse slows every animation on a page, records an interaction as a "take", and lets you scrub it frame by frame on the real page, not a video. Use it to find the frame where a motion goes wrong, and to compare before and after a fix.

It records and shows. It doesn't judge. Always watch the motion at normal speed too: feel only exists at 1x.

## Getting it

Lapse is `@aiforui/lapse`, a private package from the aiforui.dev registry (it comes with the course). It is not on npmjs.org.

    # project .npmrc (safe to commit)
    @aiforui:registry=https://aiforui.dev/npm/

    # the token stays user-level, never in the project
    npm config set "//aiforui.dev/npm/:_authToken" "$AIFORUI_TOKEN"
    npm install -D @aiforui/lapse

A 401 means the token isn't reaching npm or has expired. Never alias it to a bare `lapse`; the agent tools need the scoped name.

No access? The Lapse browser extension works on any site with no install in the project, and the `emil-ask-lapse` skill has everything else.

## Adding it to a page

Any page, no framework:

    import { mountLapse } from '@aiforui/lapse/panel'
    mountLapse({ position: 'top-right' })

Plain HTML with no build step: copy `node_modules/@aiforui/lapse/dist/panel.global.js` into the site, then put this first in `<head>`:

    <script src="/vendor/lapse-panel.global.js"></script>
    <script>lapse.mountLapse()</script>

It must load before anything that animates. Libraries that cache the clock early (GSAP, Framer Motion) otherwise keep running at full speed. With React's `<Lapse />`, put `import '@aiforui/lapse/install'` as the very first import. Development only: don't ship it.

## The loop, by hand

1. Watch it once at normal speed. Note what feels off.
2. Press Shift+S until it's at 0.25x and watch again. Most "feels off" becomes nameable here: the content leaves before the shape moves, the exit is as slow as the entrance, the scale starts too small.
3. Shift+R, do the interaction, Shift+R to stop. On a busy page, hold S and click the elements you care about first, so only they are recorded.
4. Scrub to the frame where it stops looking right. The page freezes there for real, so you can inspect it in devtools.
5. Shift+A, click the element, write the problem in plain words.
6. Shift+C copies everything for an agent: the note, the element, the moment, every value at that moment.

For entrance animations that play on load, Shift+Option+R reloads with recording already running.

## The loop, for an agent

MCP server:

    claude mcp add lapse -- npx @aiforui/lapse-mcp --launch

Then: `lapse_attach`, `lapse_goto`, `lapse_record_start`, do the interaction with your own browser tools, `lapse_record_stop`. Ask about named moments, never frame numbers: `lapse_diff { a: "click-1", b: "settle" }`, `lapse_screenshot_at`, `lapse_export`. Call `lapse_release` before interacting again.

Playwright, attached before `goto` so the clock is patched in time:

    import { attach } from '@aiforui/lapse-playwright'
    const sac = await attach(page)
    await page.goto(url)
    await sac.record()
    await page.click('#notch')
    await page.waitForTimeout(800)
    const take = await sac.stop()
    await sac.screenshotAt('anim-1-peak', { path: 'peak.png' })
    console.log(await sac.diff('click-1', 'settle'))

Moments are named for what happened: `click-1`, `hover-1`, `anim-1-start`, `anim-1-peak`, `anim-1-end`, `settle`, `jank-1`. A take that never comes to rest has no `settle`, which is itself a finding.

## Before and after a fix

Record the same interaction before and after, save both takes and diff them:

    lapse_take_save { path: "before.json" }
    lapse_take_save { path: "after.json" }
    lapse_take_diff { a: "before.json", b: "after.json" }

It reports what changed by moment ("duration 200ms to 320ms", "at settle: opacity 1 to 0.8"), including animations you didn't mean to touch. That catches the fix that quietly broke three other things.

## What to look for

- Shape and content moving together. A panel that sits empty while its content waits is the classic bug here.
- The closing motion reversing the opening one.
- A press mid-animation: does the latest input win, and is the end state right?
- The jank report: long frames, and properties that force layout (`height`, `width`) where `transform` would do.

## What it doesn't do

It doesn't say whether motion feels good. It measures what happened. Watch at 1x, and show the person.
