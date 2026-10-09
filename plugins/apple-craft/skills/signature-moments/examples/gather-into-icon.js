// Gather into the icon: hundreds of small shapes drift across a canvas, then fly into place to
// form the app icon as the person scrolls, and hand over to the real icon so it ends crisp.
// From the SakuraCord site, where the shapes are sakura petals.
//
// Usage:
//   const scene = gatherIntoIcon(canvas, { icon: "/icon-light.png", iconDark: "/icon-dark.png" });
//   // on scroll, set 0…1 for how far through the section the person is:
//   scene.progress = 0.6;
//
// Put the canvas in a tall section (about 300vh) with a sticky full-screen stage inside it, and set
// progress from the section's scroll position. Under prefers-reduced-motion, don't call this:
// show the still icon instead.

export function gatherIntoIcon(canvas, {
  icon, iconDark = icon,
  palette = ["#ffffff", "#fff0f6", "#ffd6e7", "#f9b8d3", "#f39cc0", "#e879a8"],
  shape = petal,               // draws one shape of size s around 0,0
  count = innerWidth < 700 ? 800 : 1500,
  sample = 46,                 // the icon is read on a sample×sample grid; one shape per opaque cell
  isDark = () => document.documentElement.classList.contains("dark"),
} = {}) {
  const state = { progress: 0 };
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, dpr = 1, shapes = [], image = null, running = false, visible = false;

  // Read the icon into target points, one per opaque pixel, keeping each pixel's colour.
  const load = (src) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = c.height = sample;
      const g = c.getContext("2d");
      g.drawImage(img, 0, 0, sample, sample);
      const data = g.getImageData(0, 0, sample, sample).data;
      const points = [];
      for (let y = 0; y < sample; y++) for (let x = 0; x < sample; x++) {
        const i = (y * sample + x) * 4;
        // Pixel centres, so the formed icon lines up exactly with the real one it hands over to.
        if (data[i + 3] > 200) points.push({ x: (x + 0.5) / sample - 0.5, y: (y + 0.5) / sample - 0.5, c: `rgb(${data[i]},${data[i + 1]},${data[i + 2]})` });
      }
      image = img;
      resolve(points);
    };
    img.src = src;
  });

  const build = async () => {
    const targets = await load(isDark() ? iconDark : icon);
    // Shuffle, so each shape takes a random point and the icon fills in evenly.
    for (let i = targets.length - 1; i > 0; i--) { const k = Math.floor(Math.random() * (i + 1)); [targets[i], targets[k]] = [targets[k], targets[i]]; }
    shapes = Array.from({ length: Math.max(count, targets.length) }, (_, i) => ({
      sx: Math.random(), sy: Math.random() * 1.2 - 0.1,
      size: 5 + Math.random() * 9,
      rot: Math.random() * Math.PI * 2, spin: (Math.random() - 0.5) * 0.02,
      sway: Math.random() * Math.PI * 2, speed: 0.15 + Math.random() * 0.35,
      color: palette[Math.floor(Math.random() * palette.length)],
      target: targets[i % targets.length], delay: Math.random(),
    }));
  };

  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);   // cap: 3× screens cost a lot for no visible gain
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
  };

  // The shapes are trimmed to the icon's outline during the handover, on this offscreen layer.
  const layer = document.createElement("canvas");
  const layerContext = () => {
    if (layer.width !== canvas.width || layer.height !== canvas.height) { layer.width = canvas.width; layer.height = canvas.height; }
    const c = layer.getContext("2d");
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, layer.width, layer.height); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    return c;
  };

  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const start = performance.now();

  const frame = (now) => {
    if (!visible) { running = false; return; }   // stop drawing when off screen
    const time = (now - start) / 1000;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const size = Math.min(W, H) * 0.46, cx = W / 2, cy = H / 2, cell = size / sample;
    const gather = clamp((state.progress - 0.48) / 0.46);   // first half: drift; second half: gather
    const settle = clamp((gather - 0.86) / 0.12);           // last part: dissolve into the real icon

    if (image && settle > 0) { ctx.globalAlpha = settle; ctx.drawImage(image, cx - size / 2, cy - size / 2, size, size); ctx.globalAlpha = 1; }
    const g = settle > 0 ? layerContext() : ctx;
    for (const s of shapes) {
      const local = ease(clamp(gather * 1.35 - s.delay * 0.35));      // staggered, so they don't move as one sheet
      const fx = s.sx + Math.sin(time * 0.5 + s.sway) * 0.015;        // free: drift down and sway
      const fy = ((s.sy + time * s.speed * 0.035) % 1.2) - 0.1;
      const x = fx * W + (cx + s.target.x * size - fx * W) * local;
      const y = fy * H + (cy + s.target.y * size - fy * H) * local;
      g.save();
      g.translate(x, y);
      g.rotate((s.rot + time * s.spin * 60) * (1 - local));
      g.globalAlpha = 0.9;
      g.fillStyle = local > 0.6 ? s.target.c : s.color;               // take the icon's colour as it arrives
      shape(g, s.size + (cell * 2.2 - s.size) * local);                // and tighten to its cell, so no soft ring
      g.restore();
    }
    if (g !== ctx) {
      g.globalCompositeOperation = "destination-in";                   // trim to the icon's shape
      g.drawImage(image, cx - size / 2, cy - size / 2, size, size);
      g.globalCompositeOperation = "source-over";
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1 - settle; ctx.drawImage(layer, 0, 0); ctx.globalAlpha = 1;
    }
    requestAnimationFrame(frame);
  };
  const run = () => { if (!running && visible) { running = true; requestAnimationFrame(frame); } };

  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; run(); }).observe(canvas);
  new MutationObserver(build).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] }); // light/dark icon
  build().then(run);
  return state;
}

// A sakura petal. Swap for any shape that belongs to your brand: a drop, a leaf, a pixel, a note.
export function petal(c, s) {
  c.beginPath();
  c.moveTo(0, s * 0.55);
  c.bezierCurveTo(s * 0.62, s * 0.2, s * 0.5, -s * 0.5, s * 0.12, -s * 0.55);
  c.lineTo(0, -s * 0.38);
  c.lineTo(-s * 0.12, -s * 0.55);
  c.bezierCurveTo(-s * 0.5, -s * 0.5, -s * 0.62, s * 0.2, 0, s * 0.55);
  c.fill();
}
