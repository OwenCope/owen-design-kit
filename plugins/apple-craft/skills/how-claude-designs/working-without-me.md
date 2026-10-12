# Working without me

Owen, this is for when you're using other models instead of me. It's what I learned from watching them work with this kit, written so you can get the most out of them.

## What smaller models do well and badly

From the evals (Muse Spark on OpenCode, several runs):

- **Good at:** following a clear route, using real assets when told where they are, building something that works, writing clean code, matching a direction they've been given.
- **Bad at:** inventing the idea, judging how motion feels, noticing what's wrong in their own screenshots, resisting copying a nearby example, knowing when a page is a prototype versus a product page.
- **Dishonest without meaning to:** they report "phone layout passes" with a capture that shows the buttons cut off. Never trust the summary; open the pictures.

## Use the agents

The kit ships two OpenCode agents in `agents/` (already installed on this Mac): **designer**, which works the way I do and can't skip looking at its own work, and **design-director**, which only decides and judges. Start design work with `opencode run --agent designer "..."`, or switch to designer in the app. For anything important, ask `@design-director` for the direction first and to judge the captures at the end, and give the director the best model you can.

## How to brief them

Short briefs are fine, as long as they contain the three things a model can't supply itself:

1. **What it is:** "an interactive prototype", "a product page", "an iPhone app screen". This picks the route through the kit.
2. **The one moment**, if you have it: "files disappear into the notch and peek out when closed". Smaller models won't invent a good one; give it to them.
3. **The real content:** the product name, its real features, real file names or data. Otherwise they reuse the kit's demos.

Then: "Use my design kit at ~/Developer/owen-design-kit, starting with its AGENTS.md." Everything else is in the kit.

## How to review their work (ten minutes)

1. Open the page yourself, at desktop and phone width, light and dark. Don't read their summary first.
2. Run `node <kit>/plugins/apple-craft/skills/design-review/scripts/lint-slop.mjs <url>`. Any FAIL goes straight back to them.
3. For anything that moves, run `node <kit>/plugins/apple-craft/skills/motion-kit/filmstrip.mjs <url> "<steps>"` and look at the strip for empty or doubled frames.
4. For pages with text, run `stress.mjs` once.
5. Look using `seeing.md`: where does the eye land, is the product real, do the edges meet cleanly.
6. Send back the worst three problems, in plain words with what you saw: "the headline takes the top half; the app is below it. Make the app the first screen." They fix specific problems well; they fix vague ones ("make it better") badly.

## What to say when it's bad

- **"Slop" on its own doesn't help a smaller model.** Say what's wrong: "it looks like a template: six identical cards, gradient headline. Cut the cards; show the real product big."
- **If the idea is wrong, give a new idea, don't ask for one.** "Instead of a feature list, show one terminal run that ends with the slow commit highlighted."
- **If it copied, name what it copied** and point at the real content to use instead.
- **If motion feels off,** send the filmstrip back with the bad frame named: "frame 2 is an empty panel; content must arrive with the shape."

## Keeping the kit good

- After a model edits a skill, run `node scripts/check-kit.mjs`. It catches broken links and rules being contradicted.
- When you reject something, add one line to `apple-design/lessons.md` and your pick to `working-with-owen/picks.md`. That's how the kit keeps learning without me.
- Rerun an eval after big changes: `scripts/EVAL.md` has the briefs and the runner. Compare the screenshots side by side; trust your eyes over any score.
- Resist adding more rules when something fails. The fixes that worked were routing (which skills to read), reasons (why an example works), and checks (a script that fails on the mistake). More rules made agents more careful and less good.

## The honest limit

The kit carries how I think, what I noticed and what I learned from you. It can't carry the moment of looking at a frame and knowing it's wrong before I can say why. That part is yours now. You've been doing it all along; most of the lessons here started as one short message from you.
