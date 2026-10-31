# 12. Apple showcase gallery study

Date: 2026-10-31. Live probes with Playwright Chromium on https://www.apple.com/iphone/ at 1440x900 and 390x844. Behaviour and timings only. No site code, class names, or copy is reused in the kit part built from this.

Shots: `shots/showcase-study-hero-1440.png`, `shots/showcase-study-hero-390.png`, `shots/showcase-study-change-1.png` through `shots/showcase-study-change-4.png` (one slide change: settled, then mid flight), `shots/showcase-study-dot-1.png` through `shots/showcase-study-dot-4.png` (the active dot bar filling).

The pattern studied is the hero MediaCardGallery: a light page, large white cards where the current card fills most of the width and the neighbours peek in at both edges, and under the cards a grey rounded pill holding dots plus a separate round grey play/pause button. The lineup and feature tile galleries on the same page were measured for card size only.

## Measured values, desktop 1440x900

| # | What | Value |
|---|---|---|
| a | Card size | 1260 by 612, offset x 90. That is 87.5 percent of the viewport wide, peeking 90px on each side. Next card starts at x 1370, so the gap is 20px. |
| b | Card radius | 28px on the inner card tile. Same 28px on the 372px feature tiles and on phones. |
| c | Tile galleries | Cards 372 wide (product tiles 768 tall, feature cards 516 tall), same 20px rhythm between them. |
| d | Dots at rest | Inactive dots are 8 by 8 circles. The active dot stretches to a 48 by 8 bar with fully round ends. Dot grey is rgba(0, 0, 0, 0.42), dot colour change over 0.25s linear. |
| e | Dot fill | A dark fill (rgb(41, 41, 42)) grows left to right inside the active bar, sampled from about 8px to about 55px, linear, over the dwell. It resets to near 1px the moment the slide changes and starts growing on the new slide at once. |
| f | Pill and button | Pill background rgb(232, 232, 237) with 28px radius and a 14px backdrop blur. Dots row measured 120 by 24 for two dots. The play/pause button is a 56 by 56 circle sitting about 16px right of the pill. Its label toggles between Pause Hero Gallery and Play Hero Gallery. |
| g | Autoplay interval | About 5.2s of dwell while the bar fills, then about 1.0s of travel, so about 6.2s per slide. This matches the running progress animation found on the page at 6150ms linear. |
| h | Slide travel | scrollLeft moves one full card pitch (1280px here) in about 990ms. Samples show an S curve: slow start, fastest in the middle, soft landing (roughly 5 percent done at 10 percent of the time, 51 percent at half time, 95 percent at 86 percent of the time). The current marker flips to the new slide at travel start, not at the landing. |
| i | Pause and resume | Keyboard focus into the gallery pauses (state class changes to paused). Scrolling the gallery out of view freezes the fill and it resumes where it left off when scrolled back. Clicking a dot jumps to that slide and pauses for good. The play button toggles between playing and paused. |
| j | One pass | With two slides the gallery advances once, then the state class changes to ended and it stays on the last slide. It never wraps on its own. Pressing play again replays. |
| k | Hover and swipe | Hovering the card does not pause the fill (it kept growing across two 1.2s hover samples). A scripted drag did not pause it either; it stayed in playing state. Real swipe handling could not be confirmed headlessly. |
| l | Keyboard and screen reader | Dots live in a ul with role tablist labelled Hero tablist. Each dot is a link with role tab, aria-controls pointing at its slide, roving tabindex, and aria-selected on the current one, with a visually hidden name per slide. ArrowRight from a dot advanced to the next slide. No live region was found near the gallery. |
| m | Reduce Motion | With reduce requested the gallery loads in paused state, the fill stays static, and nothing advances over 8s. |

## Measured values, phone 390x844

| # | What | Value |
|---|---|---|
| n | Card size | 321 wide at x 24: about 82 percent of the viewport, 24px peek, 21px gap to the next card. Radius still 28px. Headline stacks above the buttons, picture below, same order as desktop. |
| o | Dots | Active bar is 32 by 8 here instead of 48, inactive still 8. Pill and round pause button sit centred over the picture, same arrangement as desktop. |

Not measured: tab hidden behaviour (headless keeps the page visible), exact travel easing name (script driven, read as instant in computed style), and the swipe pause path for a real finger drag.

## What makes it feel good

1. The card owns the screen. At 87 percent width with small peeks the current story fills the view while the edges promise more, and the 20px rhythm matches the rest of the page grid.
2. One control cluster, always in the same place. The pill plus the round button sit centred under the card (over the picture on phones) so the eye never hunts for navigation.
3. The bar is the timer. The active dot stretches and fills linearly, so the wait reads as progress instead of guessing when the slide will move.
4. Travel is quick but soft. About a second per move with a slow start and landing feels deliberate, and flipping the current marker at the start keeps dots and slide in step.
5. It stops on its own. One pass and it ends, so the loop never fights someone reading the last slide, and replay is one tap away.
6. Access travels with it. Roving tabindex, named tabs, and arrow keys mean the gallery works without a pointer, and Reduce Motion gets a still gallery instead of a broken one.

## What to improve

1. Hover does nothing. A pointer resting on the card keeps the timer running, so reading a slide can lose it mid sentence. Pausing on hover and focus together would fix it.
2. A dot click ends autoplay silently. Jumping to a slide stops the show with no hint; keeping the timer running from the picked slide would match what the bar promises.
3. No announcement. There is no live region, so screen reader users get no title change when slides advance on their own.
4. The dots are links to nowhere. They carry tab roles but behave as buttons; real buttons with pressed state would say what they are.
5. Phone bar is shorter for no clear reason. The 32px active bar on phones versus 48px on desktop looks like a breakpoint leftover rather than a choice.
