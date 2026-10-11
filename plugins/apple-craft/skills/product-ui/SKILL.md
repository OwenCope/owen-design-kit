---
name: product-ui
description: Designing the inside of a product rather than its landing page - dashboards, tables, lists, settings, search, inboxes and editors, and complete flows (sign-up, onboarding, forms with errors, checkout, empty first use) with every state and the way back from mistakes. Use when building any app screen or web app, any multi-step flow, or when a product works on the happy path but feels rough everywhere else.
---

# Product UI

Landing pages are seen once. Product screens are used a thousand times. Taste here is different: calm, dense where it helps, fast, and honest about what's happening. The question is always "what is the person trying to get done, and what's in the way?"

## Decide before polishing

For each screen, answer these from the screenshot, not from memory:

- What is the main action right now, and what leads the eye to it?
- Which visible controls repeat another one? Keep one obvious way, and move the rest to secondary or contextual places (a menu, a shortcut, drag), never removing the accessible route.
- After the action, what stays visible to show it worked and where the thing went?
- Does every container group something real, or is it a box around one item?

A notch file shelf that showed a search field, an outlined drop zone, a "browse" link and an "Add files" button all at once had four ways to add files and no clear first action. Parking files is meant to be fast: one way in that's obvious (drop on the notch), keyboard and a menu as the alternatives, search only once there are enough files to need it.

## Screens

**Lists and tables.** The most-used screen in most products.
- Scanning first: the column people compare goes left, numbers right-aligned in tabular figures, one line per row where possible.
- Density matches use: daily tools 32 to 40 px rows, occasional use 48 to 56 px. Offer a compact option only if both groups exist.
- Row actions appear on hover and are also in a context menu and the keyboard; never hover only.
- Sorting and filtering live above the list and show what's active. A filter that hides everything says so and offers "Clear filters".
- 10, 1,000 and 0 rows are three designs. Test all three (`design-review/scripts/stress.mjs` does 0 and 200).

**Dashboards.** One question per dashboard. The answer to that question is the biggest thing; everything else supports it. No chart without a sentence saying what it shows. `dataviz` for the charts themselves.

**Settings.** Group by what people are trying to do, not by how the code is organised. Most-changed first. Every setting says what it does in plain words, changes apply at once with no Save button unless the change is risky, and risky changes say what will happen before they happen. On Apple platforms, follow `macos-app-design`.

**Search.** Results as you type, the matching part highlighted, recent searches when empty, and a real "no results" message that suggests what to try. Keyboard: up, down, Enter, Escape.

**Inboxes and feeds.** Read and unread must be obvious without colour alone. Actions on the open item stay in the same place every time. Done items leave with a short motion so the person sees where they went.

**Editors.** The content is the interface; chrome stays quiet until needed. Save automatically and show that it saved. Undo works for everything, including deletes.

## Flows

A flow is only as good as its worst state. For each one, write the states before designing the screens: start, in progress, success, each error, and leaving halfway.

**Sign-up and sign-in.** Ask for the least: email first, everything else later. Passkeys or "Sign in with Apple/Google" where possible. Errors next to the field, in plain words ("That email already has an account. Sign in instead?" with the link). Never clear what they typed.

**Onboarding.** Get them to the first real result as fast as possible; teach by doing, not by slides. Every step can be skipped and resumed. `onboarding-design` for tours.

**Forms.** Labels always visible, never placeholder-only. Validate on submit and then live on the fields that failed, not while they're still typing the first time. Disable nothing silently: if a button can't be pressed, say why. Keep the input when anything fails.

**Checkout and payment.** Show the total before asking for the card. One page if possible. The pay button says the amount ("Pay $12"). After paying: what happens next, a receipt, and a way back.

**Empty first use.** The first time, the product is empty. That screen is the onboarding: one sentence on what goes here and one button to add the first thing, or a real example they can delete. Never a blank table with column headers.

**Errors and recovery.** Say what happened, whether their work is safe, and what to do next, in that order. Offer retry. Don't blame the person. Loading longer than about a second shows progress; longer than ten seconds says what it's waiting for.

**Destructive actions.** Prefer undo over "Are you sure?". When confirmation is needed, the button names the action ("Delete 3 files"), not "OK".

## Motion in product UI

Quieter than on a landing page: things people do a hundred times a day should take under 200 ms and never make them wait. Motion explains where something went (deleted, moved, archived) and that something worked. Nothing decorative. `motion-kit` for the parts.

## Check

- Run the main flow end to end, then every error you can trigger, then leave halfway and come back.
- 0, 1 and many items; a very long name; slow network (`stress.mjs`).
- Keyboard only, once, the whole flow.
- Ask: if I used this every day for a month, what would annoy me? Fix that first.
