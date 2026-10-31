# Audit pairs: site findings as before and after pictures

Each pair shows one finding from the October 2026 Droppy site audit on a fictional Mac app called Tidepool. The bad picture shows the mistake, the good picture shows the fix. Sources live in `src/` (one page per pair, bad and good states toggle with `#bad` and `#good`).

1. hero-no-product: the hero shows only a mascot illustration and no product, so the fix brings the app on a Mac into the first screen. [bad](bad-hero-no-product.png) [good](good-hero-no-product.png)
2. two-equal-ctas: two equally weighted hero pills compete, so the fix makes Download the filled primary and Buy the quiet secondary. [bad](bad-two-equal-ctas.png) [good](good-two-equal-ctas.png)
3. download-label: a bare Download button hides that it serves a beta, so the fix labels it Download for Mac with version, channel and file size beneath. [bad](bad-download-label.png) [good](good-download-label.png)
4. pressed-button: the button dips smaller when pressed, so the fix keeps its size and answers the press with a darker tint and a label to check morph. [bad](bad-pressed-button.png) [good](good-pressed-button.png)
5. small-phone-clip: the fixed size headline clips at both edges on a 375px phone, so the fix scales it with clamp and lets it wrap. [bad](bad-small-phone-clip.png) [good](good-small-phone-clip.png)
6. faq-no-hover: the FAQ row shows no change on hover, so the fix adds a subtle hover tint and a focus ring for keyboard users. [bad](bad-faq-no-hover.png) [good](good-faq-no-hover.png)
