# Agents for OpenCode

Two agents that carry how the kit's best sessions worked.

- `designer.md`: the main design agent. Says what it's making, the one moment and the real material before building; builds the smallest version; looks at every capture and runs the kit's checks; fixes causes; reports honestly.
- `design-director.md`: decides direction, the moment and the content, and judges screenshots. It can't edit files. Give it the strongest model you have.

## Install

Copy both into OpenCode's prompts folder and add them to `~/.config/opencode/opencode.json`:

    cp agents/designer.md agents/design-director.md ~/.config/opencode/prompts/

    "agent": {
      "designer": { "description": "Design agent", "mode": "primary", "temperature": 0.3, "prompt": "{file:./prompts/designer.md}" },
      "design-director": { "description": "Decides and judges, doesn't build", "mode": "subagent", "temperature": 0.3, "prompt": "{file:./prompts/design-director.md}", "tools": { "write": false, "edit": false } }
    }

To give the director a stronger model, add `"model": "<provider>/<model-id>"` to its entry.

## Use

In OpenCode, switch to the designer agent (Tab cycles primary agents), or from the command line:

    opencode run --agent designer "Build ..."

Inside a designer session, ask `@design-director` to set the direction before building or to judge the captures after.
