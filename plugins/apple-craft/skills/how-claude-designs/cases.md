# Real cases

Every one of these happened. Each has what Owen said, what was really wrong, why, and the lesson that carries to other work. When something new goes wrong, look here first; it's usually one of these again.

## The launch video

- **"Use real panels."** I had rebuilt Gaze's panel from shapes in EffectCraft. Proportions slightly off, eyes in the wrong place, flat. A screen recording of the real panel, cropped close, beat it immediately. *Lesson: if it exists, record it. Never redraw your own product.*
- **"It just stays there for the rest of the video."** A clip's out-point had drifted when I retimed the edit, so its last frame froze on screen. *Lesson: after any retime, check a frame just after every clip ends.*
- **A magnified copy of the panel laid over the real one** to fake a zoom. It read as a glitch: two of the same thing. *Lesson: zoom the camera, never duplicate the subject.*
- **"I don't want a Blender file."** A 3D scene doesn't help a product whose whole point is its real UI. *Lesson: the tool follows what the product is, not what's impressive.*
- **We scrapped it.** Some things don't come right in a session, and saying so honestly was better than polishing a 5 into a 6.

## The notch shelf (motion kit)

- **"When I hover it opens, then waits before showing the items."** The content waited for the spring to fully settle; springs have a long, nearly invisible tail. *Fix: start content about 30 ms after the shape starts, not when it ends.*
- **"Not smooth enough."** Three causes together: the backdrop blur recalculating every frame during the morph, content leaving before the shape moved, and a spring tuned too stiff. *Lesson: "not smooth" is almost never one thing. Film it and look for every frame that's wrong.*
- **Empty panel when closing.** Items faded one by one while the big shape hung there empty. *Fix: shape and content leave together.*
- **Clicking a file opened the drop panel; dragging selected text.** *Fix: drag needs 6 px of movement before it counts; `user-select: none` on draggable things.*
- **Pressing the notch while a file was still flying in did nothing.** The shelf thought it was empty. Found by the capture tool, not by me. *Lesson: test what happens when people are faster than your animation.*
- **Long file names overlapped under the icons.** Found by the stress test. *Lesson: sample data is always short; real data never is.*

## The tour

- **Dots touching the Mac.** Spacing measured from the wrong element.
- **Loud background.** A bright wallpaper fought the product. *Lesson: the background is there so the product reads.*
- **An empty panel between pages.** The old content left, then the shape changed, then the new content came. *Fix: layered swap; old and new cross while the shape reshapes.*
- **Two notches.** The panel was drawn as a notch-shaped thing below the real one. *Lesson: there is only ever one notch; the panel grows out of it at the top edge.*
- **"Why are you copying Droppy's when we have our own?"** I'd built the tour around another app's content. *Lesson: never borrow another product's story; use your own product's real features.*
- **"What is the button press animation?"** Buttons shrank when pressed, a web habit. Owen hates it. *Rule: buttons never move. Feedback lives in colour or content.*

## The gallery

- **"Some of these are broken and some don't have animation."** Cards that only moved on hover looked dead in a gallery; some had controls overlapping. *Fix: every card plays on its own; hover hands control to the person.*
- **"This is not a motion library, more a plain example of one thing."** A component list isn't what he wanted. He wanted it to feel like Apple's demos. *Lesson: a demo should show motion that means something, not inventory.*

## The kit itself

- **The wallpaper "isn't good."** The asset script picked the first wallpaper alphabetically, which was a loud blue. *Lesson: fix the cause in the script, so every future page gets it right.*
- **An infinite loop that broke every animation.** A head rewrote `claim()`; `Promise.resolve(handle)` returns the same promise, so assigning `.stop` on it overwrote the spring's own stop. Caught only because I ran the tests after the head finished. *Lesson: always run the tests after someone else's change, however small.*
- **Another model's rewrite read like a legal document.** "Supported significant correction", "provenance", "sidecar contract". It softened concrete rules into "consider context". *Lesson: a design guide should sound like someone who knows, not someone covering themselves. Concrete rules beat careful ones.*
- **Agents copied the demo.** The notch eval reused the demo's sample files and words. *Fix: a note at the top of every demo file saying it's for mechanics only, and what not to copy.*

## The evals with a smaller model

- **First notch run, rated slop.** A giant marketing headline over the app, a pale card under the notch, four ways to add a file, coloured squares for Dock icons, a phone layout cut off but reported as passing. Every one of these was visible in screenshots the agent had saved itself.
- **What fixed it** wasn't more rules. It was: a table telling the agent which three to five skills to read for its kind of task; one sentence saying a prototype is not a product page; a linter that fails on exactly those mistakes; and explaining *why* the notch reference works instead of just showing it.
- **Third run:** its own name, its own files, the notch growing into the shelf, all checks passing. Still close to the reference's layout. *Lesson: smaller models get better with routing, reasons and checks. They still don't invent ideas; give them the idea in the brief.*

## Owen's settings, site and releases

- **Settings like Droppy and Wick:** a clean sidebar, few rows, nothing extra. Cut clutter before adding anything.
- **Capsule controls and big rounded containers** read as current Apple; sharp rectangles read as old.
- **Release notes:** the version as a short header, one real picture of the change, a few short bullets. Never test data like "Version 0.1.0" in a public picture.
- **No blockquotes in replies.** They render badly where he reads them.
