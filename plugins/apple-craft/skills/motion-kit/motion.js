/* motion-kit: finished, tuned interactions for Apple-style product pages.
   Plain JS, no dependencies. Every function respects Reduce Motion (it jumps to the end state).
   Load with <script src="motion.js"></script>, then use the global `Motion`.
   Never retune the spring presets per page: they are the feel. Pick one by name. */
(function (global) {
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Spring presets (stiffness, damping, mass). Tuned by eye against macOS animations.
  const SPRINGS = {
    snappy: { k: 420, c: 34, m: 1 },   // controls, small UI: quick, no visible overshoot
    smooth: { k: 220, c: 26, m: 1 },   // panels opening, morphs: settles with a soft landing
    bouncy: { k: 300, c: 18, m: 1 },   // things landing in place: one small, visible bounce
    gentle: { k: 120, c: 20, m: 1 },   // large moves across the screen
  };

  // Animate any set of numbers with a spring. `from`/`to` are objects of numbers; `onUpdate(values)`.
  function spring(from, to, onUpdate, preset = 'smooth') {
    const { k, c, m } = typeof preset === 'string' ? SPRINGS[preset] : preset;
    const keys = Object.keys(to);
    const x = {}, v = {};
    keys.forEach((key) => { x[key] = from[key]; v[key] = 0; });
    if (reduced()) { onUpdate({ ...to }); return Promise.resolve(); }
    return new Promise((resolve) => {
      let last = performance.now();
      const step = (now) => {
        const dt = Math.min(0.032, (now - last) / 1000); last = now;
        let moving = false;
        keys.forEach((key) => {
          const f = -k * (x[key] - to[key]) - c * v[key];
          v[key] += (f / m) * dt; x[key] += v[key] * dt;
          if (Math.abs(v[key]) > 0.01 || Math.abs(x[key] - to[key]) > 0.01) moving = true;
        });
        onUpdate({ ...x });
        if (moving) requestAnimationFrame(step); else { onUpdate({ ...to }); resolve(); }
      };
      requestAnimationFrame(step);
    });
  }

  // Morph one element's box (width, height, corner radius) with a spring.
  // The notch-to-panel trick: one element, one shape, never a second box underneath.
  function morph(el, to, preset = 'smooth') {
    const cs = getComputedStyle(el);
    const from = { w: el.offsetWidth, h: el.offsetHeight, r: parseFloat(cs.borderBottomLeftRadius) || 0 };
    const target = { w: to.width ?? from.w, h: to.height ?? from.h, r: to.radius ?? from.r };
    return spring(from, target, ({ w, h, r }) => {
      el.style.width = w + 'px'; el.style.height = h + 'px';
      el.style.borderBottomLeftRadius = el.style.borderBottomRightRadius = r + 'px';
    }, preset);
  }

  // Fly a copy of `source` into `target` along a curved path, shrinking as it goes.
  // The target gets a small catch bump when it lands. Resolves when it has landed.
  function flyTo(source, target, { scale = 0.25, lift = 120, bump = true, preset = 'smooth' } = {}) {
    const a = source.getBoundingClientRect(), b = target.getBoundingClientRect();
    const ghost = source.cloneNode(true);
    Object.assign(ghost.style, { position: 'fixed', left: a.left + 'px', top: a.top + 'px', width: a.width + 'px',
      height: a.height + 'px', margin: 0, zIndex: 9999, pointerEvents: 'none', transformOrigin: 'center' });
    document.body.appendChild(ghost);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    return spring({ t: 0 }, { t: 1 }, ({ t }) => {
      const tt = Math.max(0, Math.min(1, t));
      const x = dx * tt, y = dy * tt - lift * Math.sin(Math.PI * tt);   // arc up, then in
      const s = 1 + (scale - 1) * tt;
      ghost.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
      ghost.style.opacity = String(tt > 0.85 ? (1 - tt) / 0.15 : 1);
    }, preset).then(() => { ghost.remove(); if (bump) catchBump(target); });
  }

  // A small "caught it" pulse: scale up a touch and settle.
  function catchBump(el, amount = 0.06) {
    return spring({ s: 1 + amount }, { s: 1 }, ({ s }) => { el.style.transform = `scale(${s})`; }, 'bouncy')
      .then(() => { el.style.transform = ''; });
  }

  // Make an element draggable. Lifts while held, springs home if not dropped on a target.
  // targets: [{ el, radius, onEnter, onLeave, onDrop }]. Returns a function that removes the behaviour.
  function draggable(el, { targets = [], onStart, onEnd } = {}) {
    let start = null, over = null;
    const centre = (r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    const near = (x, y) => targets.find((t) => {
      const c = centre(t.el.getBoundingClientRect());
      return Math.hypot(x - c.x, y - c.y) < (t.radius ?? 160);
    });
    const move = (e) => {
      if (!start) return;
      const x = e.clientX - start.x, y = e.clientY - start.y;
      el.style.transform = `translate(${x}px, ${y}px) scale(1.06)`;
      const t = near(e.clientX, e.clientY);
      if (t !== over) { over?.onLeave?.(); over = t; over?.onEnter?.(); }
    };
    const up = (e) => {
      if (!start) return;
      removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
      el.style.zIndex = ''; el.style.filter = '';
      const t = near(e.clientX, e.clientY); start = null;
      if (t) { over?.onLeave?.(); over = null; el.style.transform = ''; t.onDrop?.(el); onEnd?.(true); return; }
      over?.onLeave?.(); over = null;
      const m = /translate\(([-\d.]+)px, ([-\d.]+)px\)/.exec(el.style.transform) || [0, 0, 0];
      spring({ x: +m[1], y: +m[2], s: 1.06 }, { x: 0, y: 0, s: 1 }, ({ x, y, s }) => {
        el.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
      }, 'bouncy').then(() => { el.style.transform = ''; onEnd?.(false); });
    };
    const down = (e) => {
      if (e.button > 0) return;
      e.preventDefault(); start = { x: e.clientX, y: e.clientY };
      el.style.zIndex = 50; el.style.filter = 'drop-shadow(0 14px 22px rgba(0,0,0,.25))';
      onStart?.();
      addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', up);
    };
    el.style.touchAction = 'none'; el.style.cursor = 'grab';
    el.addEventListener('pointerdown', down);
    return () => el.removeEventListener('pointerdown', down);
  }

  // Bring a list of children in one after another (rise and fade), or out in reverse.
  function stagger(els, { show = true, gap = 45, distance = 10 } = {}) {
    const list = show ? [...els] : [...els].reverse();
    return Promise.all(list.map((el, i) => new Promise((done) => setTimeout(() => {
      spring({ o: show ? 0 : 1, y: show ? distance : 0 }, { o: show ? 1 : 0, y: show ? 0 : distance }, ({ o, y }) => {
        el.style.opacity = Math.max(0, Math.min(1, o)); el.style.transform = `translateY(${y}px)`;
      }, 'snappy').then(done);
    }, reduced() ? 0 : i * gap))));
  }

  // One-time entrance for sections: headline and visual rise together when first seen.
  function reveal(selector = '[data-reveal]') {
    const els = document.querySelectorAll(selector);
    if (reduced()) return;
    els.forEach((el) => { el.style.opacity = 0; el.style.transform = 'translateY(24px)'; });
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return; io.unobserve(e.target);
      spring({ o: 0, y: 24 }, { o: 1, y: 0 }, ({ o, y }) => {
        e.target.style.opacity = Math.min(1, o); e.target.style.transform = `translateY(${y}px)`;
      }, 'gentle');
    }), { threshold: 0.2 });
    els.forEach((el) => io.observe(el));
  }

  // A pinned scroll scene: calls onProgress(p) with 0..1 while the section scrolls past a sticky stage.
  // Markup: <section style="height:300vh"><div style="position:sticky;top:0;height:100vh">…</div></section>
  function scene(section, onProgress) {
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = section.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
      onProgress(reduced() ? 1 : p);
    };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    update();
  }

  // Map part of a 0..1 progress to its own 0..1 with an ease, for choreographing scenes.
  const segment = (p, from, to) => {
    const t = Math.min(1, Math.max(0, (p - from) / (to - from)));
    return 1 - Math.pow(1 - t, 3);
  };

  global.Motion = { SPRINGS, spring, morph, flyTo, catchBump, draggable, stagger, reveal, scene, segment, reduced };
})(window);
