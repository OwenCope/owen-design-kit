# Stripe research notes (stripe.com, stripe.com/pricing, docs.stripe.com)

Source: desktop 1440x900 screenshots + full-page captures + computed-style measurements JSON + motion pass (motion.json, home-navmenu.png). Phone captures at 390px width.

## Home

- Typeface: `sohne-var, "SF Pro Display", sans-serif` everywhere (body 16px).
- Size scale (element counts): 16px ×2484, 10px ×107, 14px ×88, 26px (h3) ×50, 48px (h1) ×23, 22px ×20, 32px (h2/p) ×12, 18px ×11, 12px ×11.
- h1: 48px, weight 300, line-height 55.2px, letter-spacing -0.96px. h2: 32px/35.2px, weight 300, letter-spacing -0.64px. h3: 26px/29.12px, weight 300.
- Palette (hex, from measured values):
  - `#533AFD` — primary buttons, links, nav CTA background.
  - `#061B31` — h2/h3 heading text.
  - `#64748D` — large paragraph text.
  - `#50617A` — secondary text.
  - `#F8FAFD` — footer background.
  - `#E5EDF5` — light borders/fills.
  - `#7F7DFC` — gradient stops, accents.
  - `#FF6118` — accent marks.
  - `#81B81A` — computed h1 color value (headline renders with gradient overlay).
  - `#0000EE` — default link blue occurrences.
  - `#FFFFFF` — button text, card fills.
- Gradients: hero has a diagonal orange/pink/violet silk ribbon rendered on canvas over white; sections use radial-gradient meshes (violet `#7F81F3` → pink → `#F8FAFD`; one dark-navy radial `#6763E4 → #453BB3 → #141E4B`); one linear 90deg `#7232F1 → #FB76FA → #FFCF5E`.
- Content width: no centered max-width container detected (measurement null); content spans full 1440px with ~104–208px side margins. Page scroll height ~14803px.
- Section spacing: single root container; footer height 1101.77px with 0px 16px side padding.
- Corner radii: 4px ×74 (buttons, inputs), 6px ×48 (nav, small cards), 8px ×4, 100% ×3.
- Shadows: `rgba(50,50,93,0.12) 0px 16px 32px`, `rgba(0,0,0,0.1) 0px 30px 60px -50px + rgba(50,50,93,0.25) 0px 30px 60px -10px`, `rgba(23,23,23,0.08) 0px 15px 35px`.
- Buttons:
  - Nav "Contact sales": 14px, white on `#533AFD`, 40px height, radius 4px, padding 11.5px 20px 12.5px.
  - Hero "Get started": 16px, white on `#533AFD`, 48px height, radius 4px, padding 15.5px 24px 16.5px. Transition background-color/color/outline/border 0.3s `cubic-bezier(0.25,1,0.5,1)`.
  - Hero "Sign up with Google": 16px `#533AFD` on `rgba(255,255,255,0.65)`, 1px solid `#B9B9F9`, 48px, radius 4px.
- Nav: header 76px, nav 64px, radius 6px, padding 10px 16px. Items: Products, Solutions, Developers, Resources (dropdowns) + Pricing (link). Right: Sign in + Contact sales.
- Menu (Products open, home-navmenu.png): full-width mega panel 1262×698px at y≈70. Five columns (Payments, Revenue, Money Management, Platforms and marketplaces, More), each with violet link + gray description lines; right promo card "Stripe Sessions 2026" with "Watch now" link; bottom row "See all products". Content transition `opacity 0.25s + transform 0.5s cubic-bezier(0.4,0,0.2,1)`; positioner/viewport `transition: all`, `animation: none`.
- Hover (measured, 400ms after): primary button — transform/background-color/color/box-shadow/opacity unchanged (`#533AFD`/white/none/1; transition gains 0.1s delay). Top-nav link — color `#533AFD → #2E2B8C`, opacity 1 → 0.6, transition `opacity 0.24s cubic-bezier(0.45,0.05,0.55,0.95)`.
- Scroll/entrance: WAAPI after load — nav `detect-scroll` (duration auto, linear); hero spans 325ms `cubic-bezier(0.33,1,0.68,1)`; stats title/gradient 1200ms `cubic-bezier(0.65,0,0.35,1)`; case-study media/image/logo 800ms `cubic-bezier(0.165,0.84,0.44,1)`. Scroll-step diffs (600px steps): bento-card borders opacity 0→1 (`opacity 0.25s linear`), border-gradient `transform 1s cubic-bezier(0.16,1,0.3,1)`; hero wave static layer opacity 0→1 with matrix→none transform. 20 changed elements recorded in motion.json.
- Canvas/WebGL: `canvas.single-wave__canvas` 1392×761 at top-right (hero ribbon); `canvas.squeezy-carousel__canvas` 300×150 (rendered 1232×460) near page bottom; WebGL available.
- Product UI presentation: dashboard screenshots inside rounded browser-frame cards in a 3-card bento row; border-glow cards; dark navy full-bleed stat band ("135+", "$1.9T", "99.999%", "200M+"); customer logo strip (amazon, NVIDIA, Ford, coinbase, Google, shopify, mindbody); full-bleed video band; dark closing CTA band with stats ($500M+, 10K+, 150K+).
- Hero copy quoted exactly:
  - Headline: "Financial infrastructure to grow your revenue."
  - Subhead: "Accept payments, handle business banking,1 and implement custom revenue models—from your first transaction to your billionth."
  - Buttons: "Get started", "Sign up with Google".
  - Eyebrow above: "Global GDP running on Stripe: 1.73037193%" (live counter value at capture).

## Pricing

- Typeface: `sohne-var, "Helvetica Neue", Arial, sans-serif`. Body 16px `#425466` on `#F6F9FC`.
- Size scale: 15px ×2437, 16px ×1798, 14px ×1196, 13px ×219, 12px ×218, 18px ×57, 26px (h2) ×16, 32px (h1) ×5, 38px ×3.
- h1: 32px weight 700. h2: 26px/36px weight 500 `#0A2540`. h3 eyebrow: 13px weight 425 `#727F96`. Body p: 14px/19.6px weight 300 `#3C4F69`.
- Palette:
  - `#635BFF` — primary buttons.
  - `#00D4FF` — alternate button background (dark text on cyan).
  - `#0A2540` — headings, dark card background.
  - `#425466` — body text.
  - `#727F96` — eyebrows, muted labels.
  - `#F6F9FC` — page background.
  - `#FAFBFD` — card fill accents.
  - `#533AFD` — links.
- Gradients: diagonal rainbow band behind hero cards (purple→pink→orange→cyan→violet); linear 270deg `#0073E6 → #16CBE1 → #48A4ED → #635BFF → #9966FF → #D187FF`; two radial white fades for card sheen.
- Content width: max-width 1112px (`PricingBottomSheetNav__container`). Page scroll height ~22313px.
- Corner radii: 8px ×83 (cards), 16.5px pill ×79 (buttons), 4px ×5.
- Shadows: layered `rgba(50,50,93,0.25) 0px 30px 60px -12px + rgba(0,0,0,0.3) 0px 18px 36px -18px` (×52, hero cards); `...0px 2px 5px -1px + ...0px 1px 3px -1px` (×23, small popovers).
- Buttons: 15px/24px weight 425, 33px height, pill radius 16.5px, padding 3px 12px 6px 16px. Variants: white on `#635BFF`; `#0A2540` on `#00D4FF`. Transitions 0.15s `cubic-bezier(0.215,0.61,0.355,1)` (bg/opacity) or 0.3s `cubic-bezier(0.25,1,0.5,1)`.
- Table structure: no `<table>` elements. Hero has two side-by-side cards: Standard (white; left description + "Get started" pill, right rate panel "2.9% + 30¢ per successful transaction for domestic cards") and Custom (dark `#0A2540`; left description + cyan "Contact sales", right four-row list: "IC+ pricing", "Volume discounts", "Multi-product discounts", "Country-specific rates"). Below: sticky pill tab bar ("Standard pricing", "Custom pricing", "FAQs"). Body: stacked per-product sections, each with product name, rate lines and link; emphasis on the large rate figure per section ("2.9% + 30¢" set as 26px h2). Comparison is sequential stacked sections, not side-by-side columns.
- Animations: ~100 finished 150ms linear SVG tick animations; carousel countdown bar 7000ms linear running; countdown container 500ms `cubic-bezier(0.165,0.84,0.44,1)`.
- Canvas: `canvas.Gradient__canvas` 300×150 stretched to 1440×556 behind hero.

## Docs (docs.stripe.com landing)

- Typeface: `-apple-system, system-ui, Segoe UI, Roboto, Helvetica Neue, Ubuntu` 14px `#3C4257`. Headings same stack: h1 32px/40px weight 700 `#414552`; h2 21px weight 700. Code: `Menlo, Consolas, monospace` 13px/19px, text `#F5FBFF`, radius 4px.
- Palette:
  - `#414552` — headings.
  - `#3C4257` — body text.
  - `#5469D4` — links, primary buttons.
  - `#273951` — dark button backgrounds.
  - `#1A2C44` — dark code-panel background tone.
  - `#D4DEE9` — 1px ring borders.
  - `#F7FAFC` — task-list panel fill.
  - `#FFFFFF` — page background.
- Gradients: dotted-grid pastel band across hero (red/orange/yellow/blue/purple dots, radial dots over white); code panel linear 205.64deg white→`#F5F5F5` sheen.
- Layout: hub landing page, no left sidebar on this view. Top bar: "stripe DOCS" wordmark, centered search pill (200×32, radius 8px) + "Ask AI" button (32px, radius 8px), right "Create account" link + "Sign in" (28px, radius 6px, 1px `#D4DEE9` ring). Second row: product nav (Get started, Payments, Revenue, Risk, Data, Money management, Stablecoins, Embedded finance, Developer resources; right APIs & SDKs, Help dropdowns). Hero: "Documentation" + subhead "Explore our guides and examples to integrate Stripe." + solid indigo "Get started with Stripe ›" button + "Explore all products" underline link + tilted test-card illustration with tooltip "Sign in or create an account to load your test API keys."
- Content: three link columns (Payments: Accept payments online / Collect payments with invoices / Accept payments in-person; Revenue: Sell subscriptions / Offer usage-based pricing / Set up the customer portal; Developers: Set up your development environment / Build on Stripe with AI / Integration quickstarts). "Try it out" split panel: left task list (Start a payment / Start a checkout session / Create a customer / Sell a product — active row white on `#F7FAFC`), right dark code block showing `stripe products create --name "Red T-shirt" ...` CLI with JSON response, copy icon top-right.
- Sidebar width: none on this landing view (nav-based, not a doc page). Content width: no centered max-width container detected (measurement null).
- Corner radii: 4px ×33 (code, chips), 8px ×10 (buttons, panels), 6px ×4, 14px ×2.
- Shadows: 1px ring pattern `... rgb(212,222,233) 0px 0px 0px 1px ...` (borders as shadows); card `rgba(60,66,87,0.08) 0px 7px 14px + rgba(0,0,0,0.12) 0px 3px 6px`.
- Hover/transitions: search/buttons `box-shadow/background-color 0.15s cubic-bezier(0,0.09,0.4,1)`.
- Phone (390px): hamburger replaces nav; hero stacks full-width buttons; pricing cards stack vertically with rate panel below description; docs collapses to "Browse by product" accordion list.

## Motion files

- `motion.json`: hover before/after for first primary button and first top-nav link; Products mega-menu capture metadata + menu transition/animation values; 20 scroll-step changed elements with before/after opacity+transform; `document.getAnimations()` after load (1) and after scroll (36, targets/durations/easings); canvas list + WebGL renderer string.
- `home-navmenu.png`: Products mega-menu open at 1440×900.
