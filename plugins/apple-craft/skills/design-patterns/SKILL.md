---
name: design-patterns
description: Copy-ready code and exact tokens for proven Apple-style components - the SwiftUI Liquid Glass button with a label-to-symbol hover morph, button-to-progress swap, settings rows, toolbar indicator, update card and media frame, plus the web download button, MorphLabel CSS, type scale, colours and spacing. Use whenever building a button, hover effect, settings screen, update UI, download button, headline or any component, instead of inventing one.
---

# Approved patterns (copy these, don't reinvent)

Every snippet here ships in real products (the Gaze Mac app and gazeunlock.com) and was approved after earlier versions were rejected. Copy the code and the values; the source paths are only for reference.

## Shared motion token
- Curve: `cubic-bezier(0.22, 1, 0.36, 1)` (fast out, gentle settle). Duration: **340 ms** for morphs and layout swaps, 150 ms for colour hovers.
- **Press feedback:** a brief tint or opacity change of the fill, never movement or scale. Buttons never move or shrink when pressed; feedback lives in content/tint only.
- Always disable under Reduce Motion (`accessibilityReduceMotion` / `prefers-reduced-motion`).

---

## Mac app (SwiftUI)

### Primary button with the label→symbol hover morph
From Gaze (github.com/OwenCope/Gaze, `Sources/App/SettingsView.swift`).

    struct MorphButton: View {
        let title: String            // "Install"
        let symbol: String           // "arrow.down"
        var isEnabled = true
        let action: () -> Void
        @State private var hovered = false
        @Environment(\.accessibilityReduceMotion) private var reduceMotion

        var body: some View {
            let morphed = hovered && isEnabled && !reduceMotion
            Button(action: action) {
                ZStack {
                    Text(title)
                        .font(.headline)            // a text style, so it follows Dynamic Type
                        .opacity(morphed ? 0 : 1)
                        .blur(radius: morphed ? 8 : 0)
                    Image(systemName: symbol)
                        .font(.headline)
                        .opacity(morphed ? 1 : 0)
                        .blur(radius: morphed ? 0 : 8)
                        .accessibilityHidden(true)
                }
                .frame(width: 160, height: 28)
                .animation(.timingCurve(0.22, 1, 0.36, 1, duration: 0.34), value: morphed)
            }
            .buttonStyle(.glassProminent) // already capsule-shaped; buttonBorderShape has no effect on glass styles
            .tint(.blue)
            .controlSize(.large)
            .disabled(!isEnabled)
            .contentShape(Capsule())      // hover on the whole button, not just the word
            .onHover { hovered = $0 }
            .accessibilityLabel(title)
        }
    }

Rules: one per screen; never restyle it. The 160 pt label area fits short English labels like "Install"; for longer labels or other languages measure the widest localized title up front (NSString boundingRect / NSTextField.sizeToFit) or fix the width to fit it, instead of truncating.

### Button → progress swap
Replace the button *in place* with a 260 pt linear `ProgressView` + monospaced "42%", then an indeterminate bar + "Installing…". Wrap both in a `ZStack` with fixed height 28, transition `.opacity` only, animate with `.smooth(duration: 0.34)` (nil under Reduce Motion). The button itself never moves or scales; press feedback is a brief tint or opacity change of the fill, never movement or scale.

### Toolbar indicator (navigates, never acts)

    ToolbarItem(placement: .navigation) {
        Button { showUpdates() } label: {
            Label("Update available", systemImage: "square.and.arrow.down")
                .labelStyle(.iconOnly)
        }
        .foregroundStyle(.blue)
        .help("Update available")
    }

Rejected before this: tall capsule, grey bubble, big blue circle.

### Settings layout
- Sections: a title above, a grouped rounded container, and a one-sentence footer only when the section needs explaining.
- Row: SF Symbol (secondary colour), title, one-line detail, one trailing control.
- Dividers inset to the text between rows that have icons; full-width only above a card or block. Match the dividers already in that section.
- Reuse the project's existing toggle row instead of building a new one.
- Every new row gets a Settings search entry with 3 to 6 keywords, stored in the row's search metadata. A row that search can't find is unfinished.
- Most-needed section first. A new row goes in the section whose title matches what it does, next to its closest relative.

### Release / update card
Centre-aligned: app icon 72 pt (6 pt below) → "App X.Y.Z" `.title2.bold` → the morph button (or progress) → release picture(s) full width with 12–14 pt continuous corners → notes (### headings semibold, bullets 13–14 pt, secondary colour). Padding 18 pt vertical. Nothing else.

### Real media in a frame

    content
        .aspectRatio(16.0 / 10.0, contentMode: .fit)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay { RoundedRectangle(cornerRadius: 14, style: .continuous).strokeBorder(.white.opacity(0.12), lineWidth: 1) }
        .shadow(color: .black.opacity(0.45), radius: 24, y: 12)

(Hairline at 12% white, never a black border. Loops with `AVPlayerLooper`, muted, no controls.)

### States (never custom)
Use the system views for every state, so empty, error, loading, disabled and success all match the OS.

    struct PanelStates: View {
        var body: some View {
            VStack(spacing: 12) {
                ContentUnavailableView("No results", systemImage: "magnifyingglass",
                    description: Text("Try a different search."))          // empty
                ContentUnavailableView("Something went wrong", systemImage: "wifi.exclamationmark",
                    description: Text("Check your connection."),
                    actions: { Button("Try Again") {} })                    // error with retry
                ProgressView("Loading…")                                    // loading
                Button("Save") {}.disabled(true)                            // disabled, system look
                Label("Saved", systemImage: "checkmark.circle.fill")       // short success confirmation
                    .foregroundStyle(.secondary)
            }
        }
    }

Rules: ContentUnavailableView for empty and error, ProgressView for loading, .disabled for disabled, a short confirmation for success. Never build custom versions of these.

### Form (grouped)
A grouped form with labelled rows, inline validation below the field, and a submit that stays enabled so it can explain what's wrong.

    Form {
        Section("Account") {
            LabeledContent("Name") {
                TextField("Ada", text: $name, prompt: Text("Your name"))
                    .multilineTextAlignment(.trailing)
            }
            LabeledContent("Email") {
                TextField("ada@example.com", text: $email, prompt: Text("you@example.com"))
                    .multilineTextAlignment(.trailing)
                    #if os(macOS)
                    .textFieldStyle(.roundedBorder)
                    #endif
            }
            if let error {
                Text(error).font(.caption).foregroundStyle(.red)    // validation below the field
            } else {
                Text("We only use this to sign you in.").font(.caption).foregroundStyle(.secondary)
            }
            Button("Continue") { submit() }     // stays enabled; on submit validate, focus first invalid field, show inline reason
        }
    }
    .formStyle(.grouped)

Rules: Form with .formStyle(.grouped), LabeledContent rows, TextField with a prompt, helper in .secondary or the error in red below. Keep submit enabled; on submit validate, focus the first invalid field, show an inline reason. Never leave a disabled button as the only signal.

---

## Website (Next.js / CSS)

### Type scale — the only seven sizes

| Class | Size | Weight | Line height | Tracking |
|---|---|---|---|---|
| `.type-display` | clamp(2.75rem, 7.5vw, 4.75rem) | 600 | 1.02 | -0.045em |
| `.type-title` | clamp(2rem, 4vw, 3rem) | 600 | 1.06 | -0.035em |
| `.type-heading` | 28px | 600 | 1.15 | -0.025em |
| `.type-subhead` | 21px | 500 | 1.35 | -0.015em |
| `.type-body` | 17px | 400 | 1.55 | -0.01em |
| `.type-caption` | 14px | 400 | 1.45 | 0 |
| `.type-micro` | 12px | 500 | 1.35 | 0.01em |

Font stack: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif`. Do not add Inter or any webfont for Apple-style surfaces. Don't add sizes; map to the nearest step.

### Colour
- Action blue on websites: `#0071e3` (`--action-fill`), apple.com's link and button blue. The only accent on a web page. Inside apps and app mock-ups use the system accent `#0088FF` (light) / `#0091FF` (dark) from `liquid-glass`, so an app screenshot and its mock-up match.
- Neutral fills from the foreground colour: `color-mix(in oklab, var(--foreground) 7%, transparent)`, 11% on hover.
- No purple/indigo, no gradient text, no neon.

### The download button (signature)
- Pill, min-height 52 px, padding 0 28 px, 18 px medium text, Apple mark + "Download", optional count chip.
- Blue fill with a faint white rim (1 px masked 135° gradient, 55% → transparent → 30%), soft shadow `0 2px 8px rgba(0,32,70,0.12)`.
- A version-menu half joined by a hairline, so it reads as one button.
- Hover: the label blurs out and the icon blurs in (MorphLabel below). Only on fine pointers, so touch never sticks.

### MorphLabel (label → icon blur morph)
As a CSS module (`morph-label.module.css`):

    .root { --morph-dur: 340ms; --morph-ease: cubic-bezier(0.22, 1, 0.36, 1); --morph-blur: 16px;
            position: relative; display: inline-grid; place-items: center; }
    .rest, .hover { grid-area: 1 / 1;
            transition: opacity var(--morph-dur) linear, filter var(--morph-dur) var(--morph-ease); }
    .rest  { opacity: 1; filter: blur(0); }
    .hover { opacity: 0; filter: blur(var(--morph-blur)); pointer-events: none; }
    .hover svg { width: var(--morph-icon, 20px); height: var(--morph-icon, 20px); }

    /* keyboard focus shows the icon too */
    :where(a, button):focus-visible > .root .rest  { opacity: 0; filter: blur(var(--morph-blur)); }
    :where(a, button):focus-visible > .root .hover { opacity: 1; filter: blur(0); }

    /* fine pointers only, so touch never sticks mid-morph */
    @media (hover: hover) and (pointer: fine) {
      :where(a, button):hover > .root .rest  { opacity: 0; filter: blur(var(--morph-blur)); }
      :where(a, button):hover > .root .hover { opacity: 1; filter: blur(0); }
    }

    /* Reduce Motion: no morph at all, the label stays */
    @media (prefers-reduced-motion: reduce) {
      .rest, .hover { transition: none; }
      .hover { display: none; }
      :where(a, button):hover > .root .rest,
      :where(a, button):focus-visible > .root .rest { opacity: 1; filter: blur(0); }
    }

Markup (`ui/morph-label.tsx`): `<MorphLabel icon={<Arrow/>}><span>Download</span></MorphLabel>` as the button's direct child.

### Secondary pill
The same pill as the blue button, filled with the page's ink colour:

    .pill-neutral { background-color: var(--ink); color: var(--bg); }
    @media (hover: hover) and (pointer: fine) {
      .pill-neutral:hover { background-color: color-mix(in srgb, var(--ink) 88%, var(--bg)); }
    }

The frosted glass pill (LiquidButton's `glass` variant) and glossy 2000s-style glass read as dated secondary buttons. The older 7% → 11% neutral-fill pill still appears on gazeunlock.com; prefer the ink pill for new work.

---

### FAQ disclosure (animated)

A row per question: the question on the left, a chevron on the right, a hairline between rows. Opening animates the height, fades the answer in and turns the chevron.

    <div class="faq">
      <details>
        <summary>What does this cost?<svg class="chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></summary>
        <div class="answer"><div><p>One plan, priced per seat. Replace with the real product's words.</p></div></div>
      </details>
    </div>

    .faq details { border-top: 1px solid var(--hairline); }
    .faq summary { list-style: none; display: flex; justify-content: space-between; align-items: center;
                   gap: 24px; padding: 22px 12px; margin: 0 -12px; border-radius: 14px; cursor: pointer;
                   font-weight: 600; transition: background-color .25s ease; }
    .faq summary::-webkit-details-marker { display: none; }
    .faq summary:hover { background: var(--fill-quaternary); }
    .faq summary:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
    .faq .chev { width: 16px; height: 16px; flex: none; color: var(--secondary-label);
                 transition: transform .35s cubic-bezier(.22,1,.36,1); }
    .faq details.shown .chev { transform: rotate(180deg); }
    .faq .answer { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .4s cubic-bezier(.22,1,.36,1); }
    .faq details.shown .answer { grid-template-rows: 1fr; }
    .faq .answer > div { overflow: hidden; }
    .faq .answer p { margin: 0 0 22px; color: var(--secondary-label); opacity: 0; transform: translateY(-6px);
                     transition: opacity .3s ease .05s, transform .4s cubic-bezier(.22,1,.36,1); }
    .faq details.shown .answer p { opacity: 1; transform: none; }
    @media (prefers-reduced-motion: reduce) { .faq * { transition: none !important; } }

`<details>` opens and closes instantly on its own, so a little script drives it. The CSS keys on a `shown` class: opening sets `open`, then adds `shown` on the next frame so the height can grow; closing removes `shown`, waits for the height to shrink, and only then removes `open`. **Closing must animate as well as opening.** An answer that slides open and then snaps shut fails review.

    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    document.querySelectorAll('.faq details').forEach((d) => {
      if (d.open) d.classList.add('shown');
      d.querySelector('summary').addEventListener('click', (e) => {
        e.preventDefault();
        if (reduce.matches) { d.open = !d.open; d.classList.toggle('shown', d.open); return; }
        if (!d.open) {
          d.open = true;
          requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('shown')));
        } else {
          const answer = d.querySelector('.answer');
          answer.addEventListener('transitionend', function done(ev) {
            if (ev.propertyName !== 'grid-template-rows') return;
            if (!d.classList.contains('shown')) d.open = false;
          }, { once: true });
          d.classList.remove('shown');
          setTimeout(() => { if (!d.classList.contains('shown')) d.open = false; }, 450);
        }
      });
    });

### States (one card, five variants)
One card with class modifiers for loading, empty, error, disabled and success, so every panel handles every case.

    <div class="state state-loading">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-line"></div>
      <div class="skeleton skeleton-line short"></div>
    </div>
    <div class="state state-empty">
      <svg class="state-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="m16 16 5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      <p class="state-title">No results yet</p>
      <p class="state-sub">Add your first item to get started.</p>
      <button class="pill" type="button">Add item</button>
    </div>
    <div class="state state-error" role="alert">
      <p class="state-title">We could not load this.</p>
      <p class="state-sub">Check your connection and try again.</p>
      <button class="pill" type="button">Try Again</button>
    </div>
    <button class="pill" type="button" disabled aria-disabled="true">Save</button>
    <p class="state-success"><svg viewBox="0 0 20 20" aria-hidden="true"><path class="tick" d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Saved</p>

    .state { border: 1px solid var(--hairline); border-radius: 20px; padding: 28px; text-align: center; }
    .skeleton { border-radius: 8px; background: var(--fill-quaternary); height: 14px; margin: 8px auto; max-width: 320px; position: relative; overflow: hidden; }
    .skeleton-title { height: 20px; max-width: 180px; }
    .skeleton.short { max-width: 140px; }
    .skeleton::after { content: ""; position: absolute; inset: 0;
      background: linear-gradient(100deg, transparent 20%, color-mix(in srgb, var(--foreground) 12%, transparent) 50%, transparent 80%);
      animation: shimmer 1.6s cubic-bezier(0.22, 1, 0.36, 1) infinite; }
    @keyframes shimmer { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
    .state-icon { width: 28px; height: 28px; color: var(--secondary-label); }
    .state-title { font-weight: 600; margin: 12px 0 4px; }
    .state-sub { color: var(--secondary-label); margin: 0 0 16px; }
    .pill[disabled] { opacity: .5; cursor: not-allowed; }
    .state-success .tick { stroke-dasharray: 20; stroke-dashoffset: 20; animation: draw .5s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
    @keyframes draw { to { stroke-dashoffset: 0; } }
    @media (prefers-reduced-motion: reduce) { .skeleton::after, .state-success .tick { animation: none; } .state-success .tick { stroke-dashoffset: 0; } }

Rules: loading is a skeleton with a soft shimmer, never a spinner for content. Empty is one line icon, one title, one supporting line, one button. Error says what happened in plain words with one Try Again button, no error codes up front. Disabled is 50 percent opacity plus cursor not-allowed plus aria-disabled, never hidden. Success draws the checkmark in, then shows the result.

### Form (labels above, capsule fields)
A short form with the label above each field, helper text below, validation on submit then live on failed fields, and a submit that shows progress via `aria-busy`.

    <form class="form" novalidate>
      <div class="field">
        <label for="f-email">Email</label>
        <input id="f-email" type="email" placeholder="you@example.com" aria-describedby="f-email-help f-email-err" />
        <p class="help" id="f-email-help">We only use this to sign you in.</p>
        <p class="err" id="f-email-err" hidden>Enter an email like you@example.com.</p>
      </div>
      <button class="pill pill-primary" type="submit">Continue</button>
    </form>

    .form .field { margin-bottom: 20px; }
    .form label { display: block; font-weight: 600; margin-bottom: 8px; }
    .form input { width: 100%; min-height: 44px; border-radius: 999px; border: 1px solid var(--hairline);
                  padding: 0 18px; font-size: 16px; background: var(--bg); color: var(--foreground); }
    .form input:focus { outline: 2px solid var(--accent); outline-offset: 2px; border-color: transparent; }
    .form input[aria-invalid="true"] { border-color: #d70015; }
    .form .help { color: var(--secondary-label); font-size: 14px; margin: 8px 2px 0; }
    .form .err { color: #d70015; font-size: 14px; margin: 8px 2px 0; }
    .pill-primary { background: var(--accent); background: #0071e3; color: #fff; }
    .form button[aria-busy="true"] { opacity: .7; pointer-events: none; }
    @media (prefers-reduced-motion: reduce) { .form * { transition: none !important; } }

    const form = document.querySelector('.form');
    const input = form.querySelector('input');
    const err = form.querySelector('.err');
    function validate() {
      const bad = !input.checkValidity() || !input.value;
      input.setAttribute('aria-invalid', bad);
      err.hidden = !bad;
      return !bad;
    }
    function save(){ return Promise.resolve(); } // replace with the real submitter
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if (btn.getAttribute('aria-busy') === 'true') return;
      if (!validate()) { input.focus(); return; }
      btn.setAttribute('aria-busy', 'true');
      save().then(() => {
        btn.removeAttribute('aria-busy');
      }, () => {
        btn.removeAttribute('aria-busy');
        err.textContent = 'Could not save. Try again.';
        err.hidden = false;
        btn.focus();
      });
    });

Rules: label above each field, 44 px capsule inputs at 16 px so iOS never zooms, helper below, inline error under the field on submit (then live on fields that already failed, not on first blur) with aria-describedby. Validate on submit, focus the first invalid field, prevent duplicate submits, and show a failure message.

### Table (dashboards)
A dense table with a sticky header, right-aligned numbers, hairline dividers and a scroll wrapper on phones.

    <div class="table-wrap" tabindex="0" role="region" aria-label="Usage">
      <table class="tbl">
        <thead><tr><th scope="col">Plan</th><th scope="col" class="num">Seats</th><th scope="col" class="num">Cost</th></tr></thead>
        <tbody>
          <tr><td>Starter</td><td class="num">5</td><td class="num">$49</td></tr>
          <tr><td>Team</td><td class="num">25</td><td class="num">$199</td></tr>
        </tbody>
      </table>
    </div>

    .table-wrap { overflow-x: auto; border: 1px solid var(--hairline); border-radius: 16px; }
    .tbl { width: 100%; border-collapse: collapse; font-size: 15px; }
    .tbl th, .tbl td { padding: 0 16px; height: 40px; text-align: left; white-space: nowrap; }
    .tbl td { max-width: 320px; overflow: hidden; text-overflow: ellipsis; }
    .tbl thead th { position: sticky; top: 0; background: var(--bg); font-size: 13px; color: var(--secondary-label);
                     font-weight: 600; border-bottom: 1px solid var(--hairline); }
    .tbl tbody tr + tr td { border-top: 1px solid var(--hairline); }
    .tbl tbody tr:hover td { background: var(--fill-quaternary); }
    .tbl .num { text-align: right; font-variant-numeric: tabular-nums; }
    @media (prefers-reduced-motion: reduce) { .tbl tbody tr:hover td { transition: none; } }

Rules: sticky header, tabular-nums for numbers, numeric columns right-aligned, hairline row dividers, hover tint, compact 40 px rows, horizontal scroll wrapper on phones.

### Navigation bar (transparent, then glass)
Sticky bar that starts transparent and turns to glass after scrolling, with 3 to 5 links and one action.

    <header class="nav" id="nav">
      <a class="brand" href="/">[Product]</a> <!-- replace with the real product name -->
      <nav aria-label="Primary"><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a></nav>
      <a class="pill pill-small" href="#download">Download</a>
      <button class="menu-btn" aria-expanded="false" aria-controls="nav-menu">Menu</button>
      <div class="menu" id="nav-menu" hidden><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a></div>
    </header>

    .nav { position: sticky; top: 0; z-index: 50; display: flex; align-items: center; gap: 24px;
           padding: 14px 24px; background: transparent; transition: background-color .35s cubic-bezier(0.22, 1, 0.36, 1); }
    .nav.scrolled { background: var(--bg); }
    @supports (backdrop-filter: blur(20px)) {
      .nav.scrolled { background: color-mix(in srgb, var(--bg) 72%, transparent); backdrop-filter: blur(20px) saturate(1.6); }
    }
    .nav .brand { font-weight: 700; margin-right: auto; }
    .nav nav { display: flex; gap: 20px; }
    .pill-small { border-radius: 999px; padding: 8px 18px; min-height: 44px; display: inline-flex; align-items: center; }
    .nav .menu { overflow: hidden; display: grid; grid-template-rows: 0fr; transition: grid-template-rows .35s cubic-bezier(0.22, 1, 0.36, 1); }
    .nav .menu[hidden] { display: none; }
    .nav .menu.open { grid-template-rows: 1fr; }
    @media (prefers-reduced-motion: reduce) { .nav, .nav .menu { transition: none; } }

    const nav = document.getElementById('nav');
    addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 8), { passive: true });
    const btn = nav.querySelector('.menu-btn'), menu = nav.querySelector('.menu');
    const navReduce = matchMedia('(prefers-reduced-motion: reduce)');
    btn.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      menu.hidden = false;
      btn.setAttribute('aria-expanded', open);
      if (navReduce.matches) { menu.hidden = !open; return; }
      if (!open) menu.addEventListener('transitionend', () => {
        if (!menu.classList.contains('open')) menu.hidden = true;
      }, { once: true });
    });
Rules: sticky, transparent at the top and glass (backdrop-filter blur with a solid fallback) after scrolling, product name left, 3 to 5 links, one action right. The phone menu opens and closes with the same animation.

### Footer (one row)
One row of small links with the product name and year, in light and dark.

    <footer class="footer">
      <p class="fine">© 2026 [Product] — replace with the real product name</p>
      <nav aria-label="Footer"><a href="#privacy">Privacy</a><a href="#terms">Terms</a><a href="#contact">Contact</a></nav>
    </footer>

    .footer { display: flex; justify-content: space-between; align-items: center; gap: 16px;
              padding: 24px; border-top: 1px solid var(--hairline); font-size: 13px; color: var(--secondary-label); }
    .footer nav { display: flex; gap: 16px; }
    .footer a { color: inherit; text-decoration: none; }
    .footer a:hover { color: var(--foreground); }

Rules: one row of small links, product name and year, secondary colour so it reads in light and dark.

## Spacing and shape (measured from the code)

App (keep these as named constants in one `Theme` file):
- Existing apps (Gaze, Droppy) use radius 16 for grouped sections and 14 for media. **New work does not:** it follows "Recommended picks" in `liquid-glass`: capsule controls at the large sizes, cards 28 to 34, menus and popovers 16 to 20, inner items concentric.
- Row inset 18 pt horizontal padding inside rows; section spacing 16 between sections.
- Stack spacing in use: 6 (label/detail pairs, most common), 8–10 (controls in a row), 12–16 (groups).
- Use the named constants; never type raw numbers when a constant exists.

Web:
- Sections: `py-16` on phones, `sm:py-24` above (64 px / 96 px); a hero may go to `sm:py-32`.
- Content widths: `max-w-[1000px]`–`[1100px]` for page sections, `max-w-[760px]` for reading text.
- Pills fully rounded (`rounded-full`), min height 52 px for primary actions, 44 px for other controls; small chips `py-0.5 px-2`, also `rounded-full`. Fields, segmented controls and selects are capsules too; no small-radius rectangular controls.
- 4-px grid (Tailwind's scale). Don't invent one-off pixel values.
