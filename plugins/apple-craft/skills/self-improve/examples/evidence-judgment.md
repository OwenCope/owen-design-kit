# Seeing clearly: practice cases

Three made-up cases that teach one decision each. In real work, every observation comes from something you actually looked at.

## Leave it alone

A settings row: a quiet label, a switch on the right, generous space before the next group. The screenshot shows clear grouping, readable text, nothing overlapping. It only toggles a local setting, so loading, empty and error are N/A; check the switch on and off and its focus ring.

"It feels sparse" is taste, not a problem. Adding an icon, a helper line and a border would need a real reason, and a calm settings screen is the brief. Change nothing. That's the right answer here.

## Keep the idea, fix the behaviour

A music app's intro unfolds the album art around the title. At normal speed, the art covers the Play button for half a second mid-transition.

Say that first: what covers what, and when. The idea is good; the path is wrong. Bend the art's path around the button (or keep a clear zone around it), then watch the same transition again, including when it's interrupted and under Reduce Motion. If the overlap is still there, find out why (timing or geometry) rather than throwing out the unfolding.

If the person wrote "I lose the Play button here", keep those words against that moment. "The animation blocks clicks" is your guess until you try clicking during it.

## Carry the lesson, not the look

The lesson above is "protect the main action while things move", not "use that album animation". In an upload app, a progress panel might push Cancel out of place mid-upload. Check default, uploading, done, error and cancelled. Keep Cancel in a fixed spot. The fix looks nothing like the music app's, and that's the point.
