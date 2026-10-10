# Liquid Glass web recipe

Copy-ready CSS for blur-based glass on the web. For the short rulebook, see `SKILL.md`; for exact Figma numbers per component, see `values.md`.

## Web recipe

The web cannot do Apple's lensing with plain CSS. True refraction needs an SVG displacement filter in `backdrop-filter: url(#lens)`, which only Chromium supports. So the default is blur-based glass: backdrop blur plus saturation, a translucent fill, a 1 px gradient rim and an inner top highlight. Add the SVG lens only as a Chromium-only enhancement behind `@supports`.

Figma blur radii are about twice CSS `blur()` values (estimated), so frost 6 maps to about `blur(3px)` to `blur(4px)`, frost 16 to `blur(8px)`, frost 25 to `blur(12px)`, and the old materials (60) to `blur(30px)`. Real glass looks clearer than you expect; resist adding more blur.

```css
:root {
  --accent: #0088ff;
  --glass-fill: rgb(255 255 255 / 0.55);
  --glass-text: rgb(0 0 0 / 0.85);
  --glass-rim-strong: rgb(255 255 255 / 0.95);
  --glass-rim-soft: rgb(255 255 255 / 0.35);
  --glass-hairline: rgb(0 0 0 / 0.10);
  --glass-highlight: rgb(255 255 255 / 0.60);
  --glass-shadow: 0 18px 48px rgb(0 0 0 / 0.25);
  --glass-shadow-small: 0 8px 15px rgb(0 0 0 / 0.04);
  --glass-solid: #f2f2f2;
  color-scheme: light dark;
}

@media (prefers-color-scheme: dark) {
  :root {
    --glass-fill: rgb(26 26 26 / 0.60);
    --glass-text: rgb(255 255 255 / 0.92);
    --glass-rim-strong: rgb(255 255 255 / 0.45);
    --glass-rim-soft: rgb(255 255 255 / 0.12);
    --glass-hairline: rgb(0 0 0 / 0.50);
    --glass-highlight: rgb(255 255 255 / 0.18);
    --glass-shadow: 0 18px 48px rgb(0 0 0 / 0.45);
    --glass-shadow-small: 0 8px 15px rgb(0 0 0 / 0.08);
    --glass-solid: #262626;
  }
}

/* Glass surface: panels, popovers, menus, toolbar groups. */
.glass {
  --glass-radius: 34px;
  --glass-blur: 8px;
  position: relative;
  isolation: isolate;
  border-radius: var(--glass-radius);
  color: var(--glass-text);
  background: var(--glass-fill);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(1.8);
  backdrop-filter: blur(var(--glass-blur)) saturate(1.8);
  box-shadow:
    inset 0 1px 0 var(--glass-highlight),        /* top specular line */
    inset 0 10px 12px -10px var(--glass-highlight), /* soft band under the top edge */
    0 0 0 0.5px var(--glass-hairline),           /* outer hairline */
    var(--glass-shadow);
}

/* 1px gradient rim: bright at top and bottom, faint on the sides. */
.glass::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(
    180deg,
    var(--glass-rim-strong),
    var(--glass-rim-soft) 30%,
    transparent 50%,
    var(--glass-rim-soft) 75%,
    var(--glass-rim-strong)
  );
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
  pointer-events: none;
}

.glass--menu    { --glass-radius: 16px; --glass-blur: 12px; }
.glass--popover { --glass-radius: 20px; --glass-blur: 13px; }

/* Glass pill button: toolbar and floating actions. */
.glass-button {
  --glass-radius: 999px;
  --glass-blur: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 44px;
  padding: 0 18px;
  border: 0;
  border-radius: var(--glass-radius);
  background: var(--glass-fill);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(1.6);
  backdrop-filter: blur(var(--glass-blur)) saturate(1.6);
  color: inherit;
  font: 500 13px/1 system-ui, -apple-system, sans-serif;
  cursor: pointer;
  box-shadow:
    inset 0 1px 0 var(--glass-highlight),
    0 0 0 0.5px var(--glass-hairline),
    var(--glass-shadow-small);
  transition: transform 0.2s ease, background-color 0.2s ease;
}
.glass-button:hover  { background: color-mix(in srgb, var(--glass-fill), white 12%); }
.glass-button:active { transform: scale(0.97); }
.glass-button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

/* Prominent: tinted glass, one per view. */
.glass-button--prominent {
  --glass-fill: color-mix(in srgb, var(--accent) 90%, transparent);
  --glass-highlight: rgb(255 255 255 / 0.45);
  color: #fff;
}

/* Icon button: a circle with the same glass. */
.glass-button--icon { width: 44px; padding: 0; }

/* Controls sitting on a glass bar are flat. Never glass on glass. */
.glass .glass-button {
  background: transparent;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  box-shadow: none;
}

/* No backdrop-filter support, or the user asks for less transparency: go solid. */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass { background: var(--glass-solid); }
}
@media (prefers-reduced-transparency: reduce) {
  .glass {
    background: var(--glass-solid);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
  .glass-button--prominent { --glass-fill: var(--accent); }
}

/* Windows High Contrast and other forced colours. */
@media (forced-colors: active) {
  .glass {
    background: Canvas;
    color: CanvasText;
    border: 1px solid CanvasText;
    box-shadow: none;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
  .glass::before { content: none; }
  .glass-button--prominent { background: Highlight; color: HighlightText; }
}

@media (prefers-reduced-motion: reduce) {
  .glass-button { transition: none; }
  .glass-button:active { transform: none; }
}
```

Notes:

- Use `.glass` on the element that floats over content. Put `.glass-button` either on its own over content, or inside a `.glass` group where it goes flat automatically.
- The `mask` shorthand with `exclude` is the standard; `-webkit-mask-composite: xor` covers Safari.
- `prefers-reduced-transparency` is not supported everywhere yet. The solid fallback must still look finished, because it is what some people always see.
- Glass needs something behind it to be glass. Over a flat white page it looks like a grey pill; check it over real content and imagery, in light and dark.
- Optional Chromium lens: an SVG `<filter>` with `feTurbulence` or a pre-rendered displacement map into `feDisplacementMap`, referenced as `backdrop-filter: url(#lens) blur(4px)` inside `@supports (backdrop-filter: url(#x))`. Keep the blur fallback as the default.
