---
name: figma-mockups
description: How to design and check app mock-ups with Figma through the Figma MCP server - connect it, duplicate Apple's macOS 27 and iOS 27 kits, pull real components, screenshots, variables and measurements from them instead of guessing, and design new screens from real Apple parts. Use whenever a mock-up, product picture, settings screen, window, notch panel or any UI that "should look like Apple made it" is being built for an app that isn't finished, and whenever a control (toggle, button, segmented control, sidebar) is being drawn by hand.
---

# Designing mock-ups with Figma

Hand-drawn controls are the most common reason a mock-up looks fake: a teal toggle, a square button, a sidebar with the wrong spacing. Apple publishes every macOS and iOS component in Figma. Use them.

## 1. Connect (once)

- **Claude Code:** `claude mcp add --transport http figma https://mcp.figma.com/mcp`, then run `/mcp` and sign in to Figma.
- **OpenCode:** add to `~/.config/opencode/opencode.json`:
  `"mcp": { "figma": { "type": "remote", "url": "https://mcp.figma.com/mcp", "enabled": true } }`, restart, and sign in when asked.
- **Others:** any MCP client works with `https://mcp.figma.com/mcp` over HTTP.

Check: list the Figma tools. If none appear, it isn't connected; say so to the person instead of guessing values.

## 2. Get Apple's kits into your account

Community files have no file key, so tools can't read them directly. Ask the person once to open each link and choose **Open in Figma** (it duplicates into their drafts), then send you the new `figma.com/design/...` URL:

- macOS 27: https://www.figma.com/community/file/1651309434229735362/macos-27
- iOS and iPadOS 27: https://www.figma.com/community/file/1651309003795292092/ios-and-ipados-27

Save the URLs in the project's notes or the person's profile skill so nobody asks again. Check there first before asking.

## 3. Read before you build

For every part of the mock-up, look it up in the kit first:

1. Find the frame (Toggles, Buttons, Sidebars, Toolbars, Windows, Popovers, Menus, Notifications) and get its **screenshot** and **design context** (code, sizes, colours) through the MCP tools.
2. Read the **variables** (colours, radii, spacing) instead of picking hex values. The toggle's on colour is the system green or accent, never a brand colour.
3. Copy the exact numbers into your HTML or SwiftUI: height, radius, padding, font size, weight, shadow.
4. Put your render next to the kit's screenshot at the same size and list differences. Fix them before showing.

If the Figma server is unavailable, use the values and pictures already in `liquid-glass` and `mac-props/examples/mac-ui.css`; never invent them.

## 4. Designing a new screen in Figma

When the person wants to see a design before code:

- Build the screen in a new page of their duplicated kit, using **instances** of the kit's components, not new shapes. Change only text, icons (SF Symbols) and data.
- Keep the kit's auto layout; don't detach components.
- Light and dark: switch the kit's mode, don't recolour by hand.
- Share the frame link, then build the code from that frame's design context.

Writing to the canvas depends on what the connected Figma server allows. If it can't create frames, build in HTML from the kit's values, screenshot it, and say that the Figma step was skipped.

## Never

- A control drawn from a rectangle and a circle.
- A brand colour on a system control (toggles, checkboxes, selection).
- Values typed from memory when the kit is one call away.
