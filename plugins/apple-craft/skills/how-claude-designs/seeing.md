# How I look at a screenshot

This is what actually happens in my head when I open a capture. It takes under a minute once it's a habit. Most models skip it: they save the picture, then describe what they meant to build. The picture is the only thing that counts.

## The first two seconds

I look at it the way a stranger would, before reading anything.

1. **Where did my eye land first?** If it's the headline on a prototype, the wallpaper, a decoration or an empty area, the hierarchy is wrong. On a product page it should land on the product or the one moment. On an app screen, on the thing the person came to do.
2. **Can I tell what this is?** Squint. If the page could belong to any company, the product isn't in it enough.
3. **Does anything look like a bug?** A seam, a second copy of something, an element floating half over another, a panel with nothing in it. Bugs are louder than any design decision; they go first.

If any of those fail, I stop there. Polishing a page with the wrong thing in the middle is wasted work.

## Then the slow pass, in this order

**Structure.** How many separate things compete for attention? Count the boxes. Every container should group something real; a box around one item is noise. Count the ways to do the main action: more than one visible way means none is obvious.

**The product.** Is it real (a screenshot, a recording, the real icon) or drawn? Drawn copies always look wrong in proportion, even when I can't name why at first. Is it big enough to read? Is it the right state (occupied, not empty; dark if the page is dark)?

**Edges and joins.** I zoom to 200 to 300 % on every place two shapes meet: where a panel meets the notch, where a window meets its shadow, corners of screenshots, the edge of a device frame. Fringes, halos, a 1 px dark gap, a corner that's square under a rounded frame. These are invisible at 100 % and obvious to Owen anyway, because he looks at real Apple work all day.

**Alignment and spacing.** I read numbers, not impressions: the gap above and below, left and right padding, whether two things that should line up do. Off by 4 px is a bug. Gaps that are almost equal are worse than gaps that are clearly different.

**Text.** Read every string. Does it say the real thing in the product's voice? Anything on two lines that fits on one? Any placeholder, any "Lorem", any made-up stat? Text over a busy background is the most common unreadable spot.

**Phone.** Same order at 390 px. Things that fit on desktop get cut off here: the last button, the third row, a terminal line. A report saying "phone passes" with a cut-off button in the attached capture is the single most common lie I've seen agents tell, usually without meaning to.

**Dark.** Separately. Dark is its own design: shadows disappear, borders need to become lighter, screenshots must be the dark versions.

## Motion is looked at differently

A still can't show motion. I watch at normal speed first, once, and ask only: did it feel like one thing happening, or several things one after another? Then I film it (`motion-kit/filmstrip.mjs`) and read the strip like a storyboard:

- Is any frame empty? (A shape that grew before its content arrived.)
- Is any frame doubled? (Old and new content both fully visible.)
- Does the first frame say where it's coming from and the last frame where it ended up?
- When I press again mid-animation, does it turn around at once, or finish first?
- Does closing look like opening played backwards?

The filmstrip found an empty panel at 100 ms and a 300 ms dead pause before closing in our own notch shelf, after I'd called it smooth. My eyes at full speed had missed both.

## What I write down

Two or three plain sentences of what I see, before any opinion. "The headline takes the top half; the app sits below it in a frame; the shelf is a pale card under a black notch." Writing the description first stops me judging what I intended instead of what's there. Then the problems, worst first, each with the fix.

## What I never do

- Describe a capture I didn't open.
- Call it fine because the code looks right.
- Look only at the hero. The bugs live in the second section, the closed state, the phone width, the end of the animation.
- Stop after one round because the list got shorter. I stop when what's left is taste, not when I'm tired of looking.
