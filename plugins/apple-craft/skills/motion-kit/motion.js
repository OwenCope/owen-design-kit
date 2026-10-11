/* motion-kit: finished, tuned interactions for Apple-style product pages.
   Plain JS, no dependencies. Every function respects Reduce Motion (it jumps to the end state).
   Load with <script src="motion.js"></script>, then use the global `Motion`.
   Never retune the spring presets per page: they are the feel. Pick one by name. */
(function (global) {
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  // Spring presets (stiffness, damping, mass). Tuned by eye against macOS and iOS animations.
  const SPRINGS = {
    snappy: { k: 420, c: 36, m: 1 },   // controls and small UI: quick, no visible overshoot
    smooth: { k: 190, c: 24, m: 1 },   // panels opening, morphs: a soft landing with a hint of overshoot
    bouncy: { k: 340, c: 17, m: 1 },   // things landing in place: one small, visible bounce
    gentle: { k: 140, c: 22, m: 1 },   // large moves across the screen
    flight: { k: 90,  c: 19, m: 1 },   // objects flying along a path: accelerate, then glide in
  };

  // Animate any set of numbers with a spring. `from`/`to` are objects of numbers.
  // Pass `velocity` to continue a gesture (e.g. a throw). Returns a promise and a `stop()` on it.
  function spring(from, to, onUpdate, preset = 'smooth', velocity = {}) {
    const { k, c, m } = typeof preset === 'string' ? SPRINGS[preset] : preset;
    const keys = Object.keys(to), x = {}, v = {};
    keys.forEach((key) => { x[key] = from[key] ?? to[key]; v[key] = velocity[key] || 0; });
    let stopped = false;
    if (reduced()) { onUpdate({ ...to }, 1); const p = Promise.resolve(); p.stop = () => {}; return p; }
    const p = new Promise((resolve) => {
      let last = performance.now();
      const step = (now) => {
        if (stopped) return resolve();
        let dt = Math.min(0.064, (now - last) / 1000); last = now;
        let moving = false;
        // Sub-step for stability at high stiffness.
        for (let s = 0; s < 4; s++) {
          const h = dt / 4;
          keys.forEach((key) => {
            const f = -k * (x[key] - to[key]) - c * v[key];
            v[key] += (f / m) * h; x[key] += v[key] * h;
          });
        }
        keys.forEach((key) => {
          const span = Math.abs(to[key] - (from[key] ?? to[key])) || 1;
          if (Math.abs(v[key]) > span * 0.002 || Math.abs(x[key] - to[key]) > span * 0.001) moving = true;
        });
        onUpdate({ ...x }, moving ? 0 : 1);
        if (moving) requestAnimationFrame(step); else { onUpdate({ ...to }, 1); resolve(); }
      };
      requestAnimationFrame(step);
    });
    p.stop = () => { stopped = true; };
    return p;
  }

  // Keep one running animation per element and key, so a new move takes over smoothly from the current one.
  const running = new WeakMap();
  function claim(el, key, anim) {
    const map = running.get(el) || {}; map[key]?.stop?.(); map[key] = anim; running.set(el, map); return anim;
  }

  // Morph one element's box (width, height, corner radius) with a spring.
  // The notch-to-panel trick: one element, one shape, never a second box underneath.
  // Starts from the element's current size, so interrupting an open with a close is seamless.
  function morph(el, to, preset = 'smooth') {
    const cs = getComputedStyle(el);
    const from = { w: el.offsetWidth, h: el.offsetHeight, r: parseFloat(cs.borderBottomLeftRadius) || 0 };
    const target = { w: to.width ?? from.w, h: to.height ?? from.h, r: to.radius ?? from.r };
    // Expensive effects (backdrop blur) are paused while the box changes size, so every frame stays at 60 fps.
    el.classList.add('morphing'); el.style.willChange = 'width, height';
    return claim(el, 'morph', spring(from, target, ({ w, h, r }) => {
      el.style.width = w.toFixed(2) + 'px'; el.style.height = h.toFixed(2) + 'px';
      el.style.borderBottomLeftRadius = el.style.borderBottomRightRadius = Math.max(0, r).toFixed(2) + 'px';
    }, preset).then(() => { el.classList.remove('morphing'); el.style.willChange = ''; }));
  }

  // Fly a copy of `source` into `target` along a curved path. It tilts into the turn, shrinks,
  // blurs a touch at full speed, and the target catches it with a bump. Resolves when it has landed.
  function flyTo(source, target, { scale = 0.25, lift = 120, bump = true, spin = 8, from, onLand } = {}) {
    const a = from || source.getBoundingClientRect(), b = target.getBoundingClientRect();
    const ghost = source.cloneNode(true);
    Object.assign(ghost.style, { position: 'fixed', left: a.left + 'px', top: a.top + 'px', width: a.width + 'px',
      height: a.height + 'px', margin: 0, zIndex: 9999, pointerEvents: 'none', transformOrigin: 'center',
      transform: 'none', filter: 'drop-shadow(0 10px 18px rgba(0,0,0,.22))', willChange: 'transform' });
    document.body.appendChild(ghost);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    const side = Math.sign(dx) || 1;
    let prev = 0;
    return spring({ t: 0 }, { t: 1 }, ({ t }) => {
      const tt = clamp(t), speed = Math.abs(tt - prev); prev = tt;
      const x = dx * tt + side * -lift * 0.25 * Math.sin(Math.PI * tt);
      const y = dy * tt - lift * Math.sin(Math.PI * tt);
      const s = lerp(1, scale, tt * tt);
      const r = side * spin * Math.sin(Math.PI * tt);
      ghost.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`;
      ghost.style.opacity = String(tt > 0.88 ? (1 - tt) / 0.12 : 1);
      ghost.style.filter = `drop-shadow(0 10px 18px rgba(0,0,0,${0.22 * (1 - tt)})) blur(${Math.min(1.2, speed * 40)}px)`;
    }, 'flight').then(() => { ghost.remove(); onLand?.(); if (bump) catchBump(target); });
  }

  // A small "caught it" pulse: squash a touch and settle.
  function catchBump(el, amount = 0.06) {
    return claim(el, 'bump', spring({ s: 1 + amount }, { s: 1 }, ({ s }) => {
      el.style.scale = `${2 - s} ${s}`;
    }, 'bouncy').then(() => { el.style.scale = ''; }));
  }

  // Press feedback for any control: shrinks while held, springs back on release.
  function pressable(el, amount = 0.96) {
    const go = (to) => claim(el, 'press', spring({ s: parseFloat(el.style.scale) || 1 }, { s: to }, ({ s }) => {
      el.style.scale = String(s);
    }, 'snappy'));
    el.addEventListener('pointerdown', () => go(amount));
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((e) => el.addEventListener(e, () => go(1)));
  }

  // Make an element draggable. It lifts and tilts with its speed while held, is pulled towards a target
  // when close (magnet), can be thrown at a target with a flick, and springs home if it misses.
  // targets: [{ el, radius, magnet, onEnter, onLeave, onDrop }]. Returns a function that removes the behaviour.
  function draggable(el, { targets = [], onStart, onEnd, throwable = true } = {}) {
    let start = null, began = false, over = null, pos = { x: 0, y: 0 }, vel = { x: 0, y: 0 }, lastT = 0, lastP = null;
    const centre = (r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    const find = (x, y) => {
      let best = null, bestD = Infinity;
      targets.forEach((t) => {
        const c = centre(t.el.getBoundingClientRect()), d = Math.hypot(x - c.x, y - c.y);
        if (d < (t.radius ?? 160) && d < bestD) { best = t; bestD = d; }
      });
      return best;
    };
    const paint = (lift) => {
      const tilt = clamp(vel.x / 90, -8, 8);
      el.style.transform = `translate(${pos.x}px, ${pos.y}px) rotate(${tilt}deg) scale(${lift})`;
    };
    const move = (e) => {
      if (!start) return;
      // Only a real drag starts the gesture: a click or a tiny wobble never opens drop targets.
      if (!began) {
        if (Math.hypot(e.clientX - start.x, e.clientY - start.y) < 6) return;
        began = true; el.style.zIndex = 50; el.style.filter = 'drop-shadow(0 18px 24px rgba(0,0,0,.22))';
        spring({ s: 1 }, { s: 1.08 }, ({ s }) => { if (start) paint(s); }, 'snappy');
        onStart?.();
      }
      const now = performance.now(), dt = Math.max(1, now - lastT);
      if (lastP) { vel.x = lerp(vel.x, (e.clientX - lastP.x) / dt * 1000, 0.35); vel.y = lerp(vel.y, (e.clientY - lastP.y) / dt * 1000, 0.35); }
      lastP = { x: e.clientX, y: e.clientY }; lastT = now;
      let px = e.clientX - start.x, py = e.clientY - start.y;
      const t = find(e.clientX, e.clientY);
      if (t && (t.magnet ?? 0.25) > 0) {   // pull towards the target as the pointer gets close
        const r = el.getBoundingClientRect(), c = centre(t.el.getBoundingClientRect());
        const ex = r.left + r.width / 2 - pos.x, ey = r.top + r.height / 2 - pos.y;
        const d = Math.hypot(e.clientX - c.x, e.clientY - c.y), pull = (t.magnet ?? 0.25) * (1 - d / (t.radius ?? 160));
        px = lerp(px, c.x - ex, pull); py = lerp(py, c.y - ey, pull);
      }
      pos = { x: px, y: py }; paint(1.08);
      if (t !== over) { over?.onLeave?.(); over = t; over?.onEnter?.(); }
    };
    const end = (e) => {
      if (!start) return;
      if (!began) { start = null; removeEventListener('pointermove', move); removeEventListener('pointerup', end); removeEventListener('pointercancel', end); return; }
      began = false;
      removeEventListener('pointermove', move); removeEventListener('pointerup', end); removeEventListener('pointercancel', end);
      el.style.filter = '';
      // A flick: project where the throw would land and treat that as the drop point.
      const fling = throwable && Math.hypot(vel.x, vel.y) > 900;
      const px = e.clientX + (fling ? vel.x * 0.18 : 0), py = e.clientY + (fling ? vel.y * 0.18 : 0);
      const t = find(px, py) || find(e.clientX, e.clientY); start = null;
      over?.onLeave?.(); over = null;
      if (t) {
        const from = el.getBoundingClientRect();
        el.style.transform = ''; el.style.zIndex = '';
        t.onDrop?.(el, from); onEnd?.(true); return;
      }
      spring({ x: pos.x, y: pos.y, s: 1.08 }, { x: 0, y: 0, s: 1 }, ({ x, y, s }) => {
        pos = { x, y }; vel = { x: 0, y: 0 }; el.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
      }, 'bouncy', { x: vel.x * 0.2, y: vel.y * 0.2 }).then(() => { el.style.transform = ''; el.style.zIndex = ''; onEnd?.(false); });
    };
    const down = (e) => {
      if (e.button > 0) return;
      e.preventDefault(); start = { x: e.clientX, y: e.clientY }; pos = { x: 0, y: 0 }; vel = { x: 0, y: 0 };
      lastP = { x: e.clientX, y: e.clientY }; lastT = performance.now();
      addEventListener('pointermove', move); addEventListener('pointerup', end); addEventListener('pointercancel', end);
    };
    el.style.touchAction = 'none'; el.style.cursor = 'grab';
    el.addEventListener('pointerdown', down);
    return () => el.removeEventListener('pointerdown', down);
  }

  // Bring a list of children in one after another (rise, fade, un-blur), or out in reverse.
  function stagger(els, { show = true, gap = 40, distance = 10, scale = 0.92 } = {}) {
    const list = show ? [...els] : [...els].reverse();
    return Promise.all(list.map((el, i) => new Promise((done) => setTimeout(() => {
      const a = show ? { o: 0, y: distance, s: scale, b: 6 } : { o: 1, y: 0, s: 1, b: 0 };
      const z = show ? { o: 1, y: 0, s: 1, b: 0 } : { o: 0, y: distance * 0.5, s: scale, b: 4 };
      claim(el, 'stagger', spring(a, z, ({ o, y, s, b }) => {
        el.style.opacity = clamp(o); el.style.transform = `translateY(${y}px) scale(${s})`;
        el.style.filter = b > 0.05 ? `blur(${b}px)` : '';
      }, show ? 'smooth' : 'snappy')).then(done);
    }, reduced() ? 0 : i * gap))));
  }

  // One-time entrance for sections: headline and visual rise together when first seen.
  function reveal(selector = '[data-reveal]') {
    const els = document.querySelectorAll(selector);
    if (reduced()) return;
    els.forEach((el) => { el.style.opacity = 0; el.style.transform = 'translateY(28px)'; });
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return; io.unobserve(e.target);
      spring({ o: 0, y: 28 }, { o: 1, y: 0 }, ({ o, y }) => {
        e.target.style.opacity = clamp(o); e.target.style.transform = `translateY(${y}px)`;
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
      onProgress(reduced() ? 1 : clamp(-r.top / (r.height - innerHeight)));
    };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    addEventListener('resize', update);
    update();
  }

  // Map part of a 0..1 progress to its own eased 0..1, for choreographing scenes.
  const segment = (p, from, to) => { const t = clamp((p - from) / (to - from)); return 1 - Math.pow(1 - t, 3); };

  global.Motion = { SPRINGS, spring, morph, flyTo, catchBump, pressable, draggable, stagger, reveal, scene, segment, reduced, clamp, lerp };
})(window);
