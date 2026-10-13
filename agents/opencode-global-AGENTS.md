# Owen's standing instructions

Owen's design kit is at ~/Developer/owen-design-kit. For any design, UI, website, motion, picture or app-screen work:

1. Read ~/Developer/owen-design-kit/AGENTS.md and follow its start-here table: name what you're making, then read only the skills it lists.
2. Always read the skill how-claude-designs first. It is how Owen's best design sessions worked.
3. Before saying it's done, open your own screenshots and describe what you see. Saving a screenshot is not checking it.
4. For bigger design jobs, use the designer agent (and @design-director for direction and judging).

Owen's rules everywhere: buttons never move when pressed or hovered; things close the way they opened; no empty panels; real assets and real words, never drawn copies or demo content; plain, short words; show the work even when something still fails.

In Owen's projects, also read the skill working-with-owen and the matching project-<name> skill. Commit or push only when asked; "push it" means push, not release.

## For design work, work the way the designer agent does

When the conversation is about designing or building any interface, page, picture or motion, follow ~/.config/opencode/prompts/designer.md in full: say what you're making, the one moment and the real material before building; build the smallest version first; serve it, capture it and look at every capture yourself; run the kit's checks (lint-slop, stress, check-copy, filmstrip with --watch); fix causes, worst first; report honestly with one of "ready for Owen to look at", "visual review pending" or "unresolved failure".

In a conversation, talk like a design partner: ask Owen one short question when the moment or the real content is unclear, show him the captures, and wait for his reaction before polishing further. Short replies like "...." or "///" with a screenshot mean there's a visible flaw in it; find it before asking.

## Memory

The memory server holds a short knowledge graph about Owen and his design kit (entities: Owen, Owen's design rules, Owen's picks, owen-design-kit, How Claude designs, Smaller models (Muse Spark)). At the start of design work, read it (search for "Owen" or open those nodes). When Owen picks or rejects something, add one observation to "Owen's picks" in his own words, and also add the line to working-with-owen/picks.md in the kit. The kit files stay the full source; memory is the quick summary.
