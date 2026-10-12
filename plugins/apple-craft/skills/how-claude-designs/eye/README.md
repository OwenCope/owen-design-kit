# Training the eye

Real screenshots from agents using this kit, with what I see in each. Open each picture, decide what you think is wrong before reading my notes, then compare. After a few of these you'll catch the same mistakes in your own work.

Don't copy any of these layouts. They're here to teach looking, not designing.

## 1. A prototype built like a landing page

`01-before-prototype-as-landing-page.jpg`

What I see: a huge headline takes the top half. The actual product sits below it, framed. The "shelf" is a pale card hanging under a black notch, so it reads as a dropdown, not the notch growing. Inside: a search field, a dashed drop zone, a "browse" link and an "Add files" button, four ways to do one thing. File icons are generic grey pages.

Why it's wrong: the brief asked for a working mock-up of a notch app, so the app should be the whole first screen. The card breaks the idea that files go *into* the notch. Four add buttons mean no obvious first action.

`01-after-product-is-the-page.jpg`

What I see: a full Mac desktop, no headline. The notch itself has grown down into a dark shelf; one shape. One parked file inside, real file icons on the desk, real Dock icons, calm wallpaper, its own app name.

What still isn't great: the desk row of four files and the tick and bin buttons are close to the kit's reference layout. Fine for a prototype, but an agent with its own idea would find its own arrangement.

## 2. A phone layout reported as passing

`02-before-phone-cut-off-but-reported-pass.jpg`

What I see: the shelf runs off the bottom of its frame; the third file is half cut off and the Add and Clear buttons aren't visible at all. Dock icons are pastel squares.

Why it matters: the agent's report said "panel fully readable at 375 px". It saved this exact picture and never looked at it. Saving a screenshot is not checking it.

## 3. The right content in the wrong direction

`03-before-devtool-in-apple-style.jpg`

What I see: a home page for a command-line tool. Good: a short question as the headline, one install command, real-looking terminal output as the product, a red line blaming the slow commit. Wrong for the audience: it's an Apple product page (pale grey, huge centred SF headline, a blue pill button) for backend developers who live in a dark terminal. The "T" logo is a letter tile.

`03-after-devtool-precise-tool-direction.jpg`

What I see: dark, quiet, monospace details, the terminal and a small chart as the hero. This direction fits the audience.

What's still wrong, and easy to miss: the numbers contradict each other. The summary says "8.6s now, 6.2s before" (about 2.4 seconds slower) but the row and the chart say "+2m24s". A developer would spot that instantly and stop trusting the page. There are also two install actions side by side ("Install Tally" and the copyable command). *Real-looking data has to be internally consistent; read every number.*

## 4. Native structure, one broken edge

`04-mostly-right-list-under-tab-bar.jpg`

What I see: an iPhone habit tracker that looks native: large "Today" title, a progress card, a week row, grouped rows with tick circles, a floating glass tab bar. Then at the bottom a "Done" section disappears behind the tab bar and can't be scrolled clear.

Lesson: the last thing on a scrolling screen must be able to clear floating bars. Check the end of every list, not just the top.

## 5. A closed state that does its job

`05-good-closed-state-shows-what-it-holds.jpg`

What I see: the notch is closed, but a tiny file icon and a count peek out of it. Without opening anything you know your file is still there.

Lesson: after any action, something visible should say it worked and where the thing went. An empty closed notch would leave people wondering.

## The pattern behind all of these

Every mistake above was visible in a picture the agent had already taken. None needed a better model to see; each needed someone to look at the picture as a stranger would, and to read every word and number in it.

## 6. An empty frame the agent missed

`06-almost-empty-frame-at-291ms.jpg`

What I see: a filmstrip of the notch opening. At 291 ms the notch has grown into a black shape with nothing inside; the file and buttons only appear at 418 ms. Every other frame is good.

Why it matters: the agent's own report said "no empty or doubled frames". It ran the filmstrip but read it quickly. For about a tenth of a second the panel is empty, which is exactly what reads as "laggy" at full speed. Content must start appearing as soon as the shape starts growing.

This came from the designer agent on Muse Spark. It looked like the best run so far, but its page turned out to be 63 % identical to the kit's own notch-shelf demo: a reskin, not a design. Check for copying before praising a result. The last 10 % is looking at every frame.

## 7. Small details Owen caught with "///"

`07-menu-bar-details.png`, `07-dock-details.png` (crops from the same best run as example 6)

What I missed the first time, and he didn't:
- The clock is bold. A real menu bar clock is regular weight.
- The menu bar icons are tiny and uneven, the battery is an empty outline, and Control Center is missing.
- Safari in the Dock has a little alias arrow. That came from the kit's own asset script exporting the icon of a link; the script is fixed.
- No divider before the Trash.

Lesson: a short reply like "///" or "...." with a crop means the flaw is in that crop. Zoom in on every piece of a Mac scene and compare it, piece by piece, with a screenshot of your own real menu bar and Dock. See `mac-props`, "The details people notice".
