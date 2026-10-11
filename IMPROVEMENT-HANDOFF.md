# Owen Design Kit improvement handoff

## Goal and evidence

Help lower-effort agents design faster and make better decisions without prescribing the same result every time. Separate dependable implementation, creative exploration, and evidence-based review.

These recommendations come from reading the instructions, visually sampling the assets, and reviewing example code. Runtime concerns are source-level findings until reproduced. Improvements to model judgment remain unmeasured. This document proposes work; it does not change existing guidance or authorize a release.

## 1. Make the process proportional

**Problem:** `apple-design/SKILL.md` requires a brief before any code, `design-review/SKILL.md` requires improvement rounds, and `self-improve/SKILL.md` requires five new problems each round. Small changes can become unnecessary redesigns.

**Fix:** Put one routing table in `apple-design/SKILL.md` and make other skills follow it.

| Task | Required work |
|---|---|
| Text or isolated styling fix | Relevant guidance and a focused check |
| Existing component change | Existing patterns, affected states, visual comparison |
| New screen | Short brief, layout decisions, interaction and visual review |
| New product direction | Distinct concepts, selection reasoning, prototype and refinement |
| Release | Release checks after appropriate authorization |

Remove defect quotas and minimum rounds. Stop when required behavior works and no supported significant problem remains.

**Future:** Record which guidance tasks actually need, then shorten the default reading path.

## 2. Make briefs support decisions

**Problem:** “Make it Apple-like” and “give it a signature moment” offer little help choosing between plausible designs.

**Fix:** Require a compact decision record in `design-brief/SKILL.md`:

- Who is using this, and what are they trying to accomplish?
- What must they understand or do first?
- What real content and assets are available?
- Which constraints come from the project?
- What design decision is uncertain?
- Why does the chosen approach fit?

Require multiple concepts only when a meaningful design question remains. Concepts must differ in structure or interaction, rather than color and decoration.

In `design-brief/examples.md`, show two plausible approaches, their tradeoffs, the chosen approach, and what changed after viewing it.

**Future:** Build a library of decision records across product types, including successful departures from house defaults.

## 3. Preserve creative freedom while defining correctness

**Problem:** Motion guidance mixes behavioral requirements with stylistic prescriptions. Universal arcs, catch bumps, blur, reversed endings and fixed choreography can make unrelated products look alike.

**Fix:** Distinguish these in `motion-kit/SKILL.md`:

- Behavioral requirements: latest input wins, correct final state, accessible controls, cleanup and reduced motion.
- Creative choices: timing character, spatial metaphor, shape transformation, choreography and emphasis.
- Optional techniques: fly-to-target, stagger, blur, tilt and camera zoom.

Have agents explain what motion communicates before choosing an effect. Immediate state changes remain valid. Show several successful interpretations of one interaction alongside specific failures; explain why each successful version fits its context.

**Future:** Build a comparison gallery with normal playback, replay, interruption controls and phase inspection. Teach observation rather than a single animation to copy.

## 4. Repair reusable code before expanding it

**Problem:** Agents can copy implementation defects and then spend time blaming their design.

The following are source-level concerns requiring reproduction and appropriate validation:

| File or area | Concern | Proposed correction |
|---|---|---|
| `motion-kit/motion.js` | Chaining `.then()` can lose the spring’s `stop()` method | Preserve the original animation handle; guard cleanup against superseded ownership |
| Drag and observer helpers | Incomplete teardown | Remove active listeners, disconnect observers and cancel owned work |
| Motion examples | Reduced motion is incomplete outside springs | Cover CSS transitions and scripted choreography; apply coherent final states |
| `motion-kit/notch-shelf.html` | Pointer-only items and nested button behavior | Use separate native controls and a complete keyboard path |
| `design-patterns/SKILL.md` form recipe | Submission can reach `save()` without validation | Validate on submit, focus invalid fields, prevent duplicate saves and expose failures |
| Navigation recipe | Closure depends on `transitionend` | Handle reduced motion immediately and prevent stale close callbacks |

Preserve the dependency-free runtime and existing patterns where practical. Avoid a broad controller abstraction until repeated use demonstrates its need.

**Future:** Add a small regression harness for interruption, focus, cancellation and submission. Establish behavior before subjective design review.

## 5. Replace self-criticism with supported correction

**Problem:** Numerical self-scores and mandatory new defects reward confident commentary rather than accurate judgment.

**Fix:** Add a motion branch to `self-improve/SKILL.md` with this record:

1. Intended behavior or communication.
2. Evidence inspected.
3. Observation, with timestamp or measurement.
4. Why the observation matters.
5. One proposed correction.
6. Matched before/after result.
7. Remaining uncertainty and stop decision.

Separate observations from hypotheses. “Escape leaves the panel focusable” is an observation; “a stale callback caused it” is a hypothesis.

Functional failures come first. Subjective changes need normal-speed playback and a specific reason. Zero corrections is valid. Compare identical inputs and retain a correction only if it improves the targeted issue without introducing required failures.

Use explicit outcomes: ready for human review, visual review pending, or unresolved required failure. Measurements alone cannot approve motion feel.

**Future:** Record corrections that helped, regressed or lacked evidence. Use those records to improve guidance instead of collecting general rules.

## 6. Make visual examples teach specific lessons

**Problem:** Broad good/bad labels obscure what matters. Some comparisons use different screens. Onboarding examples strongly reflect one product’s identity.

**Fix:** In `design-review/examples`, `onboarding-design/examples` and `liquid-glass/reference`:

- Label exactly what each example demonstrates.
- Prefer matched before/after examples with the same content.
- Separate product-specific choices from transferable principles.
- Add light/dark, focus, loading, error, larger-text and reduced-transparency examples.
- Correct confusing labels, including dark material samples labeled “Light Mode.”
- Provide a thumbnail index with intended use and source information.

Add an asset manifest recording origin, capture/export date, modifications and reuse terms. Missing provenance is a documentation gap, not evidence of misuse.

**Future:** Organize examples by decisions: hierarchy, contrast, continuity, state feedback or content density.

## 7. Resolve contradictory and overly broad rules

**Problem:** Instructions can produce conflicting behavior.

**Fix:**

- Reconcile button press scaling in `web-design` with no-moving-buttons guidance in `motion-kit`.
- Distinguish requested prototypes from screenshots offered as real product evidence across `apple-design`, `figma-mockups` and `design-review`.
- Remove rules requiring animation merely to avoid a static page.
- Scope product-copy restrictions in `product-writing` to product-facing language. Technical reports need relevant identifiers, errors and uncertainty.
- Separate push commits, deploy and release in `ship-and-verify` and `working-with-owen`. Infer broader actions only when the request’s context supports them.

Give each rule one authoritative location and link to it elsewhere.

## 8. Make the kit portable and easier to load

**Problem:** `AGENTS.md` hardcodes the original checkout, sibling references are ambiguous, and shared Figma guidance depends on personal files.

**Fix:** Use complete repo-relative entry-point paths and document one convention for resolving sibling skills. Keep personal Figma URLs in `owen-design`. Shared guidance should use project/profile references or bundled references. Load the core router plus task-specific sections instead of the whole kit.

**Future:** Add a compact task index identifying what to read. Start with documentation; automatic routing can come later.

## 9. Keep lessons from becoming permanent clutter

**Problem:** Automatically appending every rejection to shared `lessons.md` makes routine work modify the kit and increases mandatory reading.

**Fix:** Record candidate lessons within the project. Promote them during explicit kit maintenance only when they add reusable knowledge. Merge duplicates, retain exceptions and link readers to relevant sections.

A useful lesson contains context, rejected decision, evidence, correction and limits. “Never do this” is often too broad.

## 10. Make review tools reproducible

**Problem:** Capture tooling assumes dependency resolution that may fail in consuming projects. Accessibility checks use a floating CDN dependency, and failures can become warnings.

**Fix:** Document where scripts and dependencies belong. Pin dependencies locally, distinguish skipped checks from passes, close browsers reliably and expose required-check failures.

For app capture, pass names as data rather than interpolated source code. Restore changed window bounds and appearance.

**Future:** Produce one evidence bundle containing captures, replay steps, environment, state assertions and inspection capability. Agents unable to inspect playback must disclose that limitation rather than approve motion feel.

## Implementation order

1. Resolve conflicting rules, proportional routing and path problems.
2. Repair reusable runtime and component defects.
3. Replace quotas and scores with evidence-based reflection.
4. Add worked decision examples and matched visual comparisons.
5. Measure the result before adding rules or effects.

Keep changes focused. Preserve Owen’s visual direction, real product imagery, existing-project conventions and screenshot approval. Do not turn creative examples into mandatory choreography.

## Measure whether it helps

Use the same held-out briefs with the current and revised kits. Record actual model/provider settings, tool and inspection capabilities, time, cost, functional failures and anonymous human preferences. Use fresh sessions and unfamiliar tasks to distinguish transferable judgment from copied examples.

Separate the effects of better guidance from reflection where practical. A stronger-model reference under comparable conditions is needed to claim closure of that gap; comparing kit versions alone establishes only workflow improvement.

Success means better outputs, fewer unsupported decisions and less wasted work. More reflection text, more effects or higher self-scores do not establish progress.
