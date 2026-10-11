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


  // Shared-element expand (FLIP): `el` grows from where `from` is into its own final place, e.g. a card into a detail view.
  // Call after making `el` visible in its final layout. Corner radius and content fade are animated too.
  function expand(el, from, { radiusFrom = 16, radiusTo = 28, preset = 'smooth' } = {}) {
    const a = from.getBoundingClientRect(), b = el.getBoundingClientRect();
    const sx = a.width / b.width, sy = a.height / b.height, dx = a.left - b.left, dy = a.top - b.top;
    el.style.transformOrigin = '0 0';
    return claim(el, 'expand', spring({ t: 0 }, { t: 1 }, ({ t }) => {
      const k = clamp(t, 0, 1.08);
      el.style.transform = `translate(${dx * (1 - k)}px, ${dy * (1 - k)}px) scale(${lerp(sx, 1, k)}, ${lerp(sy, 1, k)})`;
      el.style.borderRadius = lerp(radiusFrom, radiusTo, clamp(t)) + 'px';
    }, preset).then(() => { el.style.transform = ''; }));
  }
  // The reverse: shrink `el` back into `to`'s place. Resolves when it has landed, then hide `el` yourself.
  function collapse(el, to, { radiusFrom = 28, radiusTo = 16, preset = 'snappy' } = {}) {
    const a = to.getBoundingClientRect(), b = el.getBoundingClientRect();
    const sx = a.width / b.width, sy = a.height / b.height, dx = a.left - b.left, dy = a.top - b.top;
    el.style.transformOrigin = '0 0';
    return claim(el, 'expand', spring({ t: 0 }, { t: 1 }, ({ t }) => {
      const k = clamp(t);
      el.style.transform = `translate(${dx * k}px, ${dy * k}px) scale(${lerp(1, sx, k)}, ${lerp(1, sy, k)})`;
      el.style.borderRadius = lerp(radiusFrom, radiusTo, k) + 'px';
    }, preset).then(() => { el.style.transform = ''; }));
  }

  // A sliding selection pill (segmented controls, tabs): moves and resizes to sit behind `target`.
  function slideTo(indicator, target, preset = 'smooth') {
    const p = indicator.offsetParent.getBoundingClientRect(), r = target.getBoundingClientRect();
    const from = { x: indicator.offsetLeft, w: indicator.offsetWidth };
    return claim(indicator, 'slide', spring(from, { x: r.left - p.left, w: r.width }, ({ x, w }) => {
      indicator.style.left = x + 'px'; indicator.style.width = Math.max(0, w) + 'px';
    }, preset));
  }

  // Roll a number to a new value (counts, prices, stats). Uses tabular figures so it never jitters.
  function countTo(el, to, { decimals = 0, preset = 'gentle' } = {}) {
    el.style.fontVariantNumeric = 'tabular-nums';
    const from = parseFloat(el.dataset.value ?? el.textContent.replace(/[^\d.-]/g, '')) || 0;
    el.dataset.value = to;
    return claim(el, 'count', spring({ v: from }, { v: to }, ({ v }) => {
      el.textContent = v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }, preset));
  }

  // Open a popover or menu out of the control that opened it: scales from the control's edge, content follows.
  function popIn(panel, anchor, { show = true, preset } = {}) {
    const a = anchor.getBoundingClientRect(), b = panel.getBoundingClientRect();
    panel.style.transformOrigin = `${a.left + a.width / 2 - b.left}px ${a.top + a.height / 2 - b.top}px`;
    return claim(panel, 'pop', spring(show ? { s: 0.6, o: 0 } : { s: 1, o: 1 }, show ? { s: 1, o: 1 } : { s: 0.7, o: 0 }, ({ s, o }) => {
      panel.style.transform = `scale(${s})`; panel.style.opacity = clamp(o);
    }, preset || (show ? 'bouncy' : 'snappy')));
  }

  // Toast or banner: drops in from the top edge with a little overshoot, leaves upward.
  function toast(el, { ms = 2200 } = {}) {
    el.style.display = '';
    return spring({ y: -80, o: 0 }, { y: 0, o: 1 }, ({ y, o }) => {
      el.style.transform = `translateY(${y}px)`; el.style.opacity = clamp(o);
    }, 'bouncy').then(() => new Promise((r) => setTimeout(r, ms))).then(() =>
      spring({ y: 0, o: 1 }, { y: -60, o: 0 }, ({ y, o }) => { el.style.transform = `translateY(${y}px)`; el.style.opacity = clamp(o); }, 'snappy'));
  }

  // Hover tilt for cards and product pictures: follows the pointer in 3D, springs back flat on leave.
  function tilt(el, { max = 6 } = {}) {
    let cur = { x: 0, y: 0 };
    const go = (x, y) => claim(el, 'tilt', spring(cur, { x, y }, (v) => {
      cur = v; el.style.transform = `perspective(900px) rotateX(${v.y}deg) rotateY(${v.x}deg)`;
    }, 'smooth'));
    el.addEventListener('pointermove', (e) => {
      if (reduced()) return;
      const r = el.getBoundingClientRect();
      go(((e.clientX - r.left) / r.width - 0.5) * 2 * max, -((e.clientY - r.top) / r.height - 0.5) * 2 * max);
    });
    el.addEventListener('pointerleave', () => go(0, 0));
  }


  // Blur crossfade: swap an element's content in place. Old content blurs out (~100 ms), new blurs in (~200 ms).
  // The element never moves; only what's inside changes. Pass a function that writes the new content.
  async function blurSwap(el, write, { out = 100, inn = 200 } = {}) {
    if (reduced()) { write(); return; }
    el.style.transition = `opacity ${out}ms ease, filter ${out}ms ease`;
    el.style.opacity = 0; el.style.filter = 'blur(8px)';
    await new Promise((r) => setTimeout(r, out));
    write();
    el.style.transition = `opacity ${inn}ms cubic-bezier(.22,1,.36,1), filter ${inn}ms cubic-bezier(.22,1,.36,1)`;
    requestAnimationFrame(() => { el.style.opacity = 1; el.style.filter = 'blur(0)'; });
    await new Promise((r) => setTimeout(r, inn));
    el.style.transition = '';
  }

  // Camera zoom: scale and move a stage so that `focus` (an element inside it) fills `frame`.
  // Used for "start on the whole device, then zoom into the real feature".
  function zoomTo(stage, focus, frame, { preset = 'smooth', pad = 0 } = {}) {
    const f = frame.getBoundingClientRect(), t = focus.getBoundingClientRect(), s0 = stage.getBoundingClientRect();
    const cur = { k: parseFloat(stage.dataset.k || 1), x: parseFloat(stage.dataset.x || 0), y: parseFloat(stage.dataset.y || 0) };
    const k = cur.k * Math.max((f.width + pad) / t.width, (f.height + pad) / t.height);
    // Position relative to the stage's untransformed origin.
    const ox = (t.left - s0.left) / cur.k, oy = (t.top - s0.top) / cur.k;
    const x = f.left - (s0.left - cur.x) - ox * k + (f.width - (t.width / cur.k) * k) / 2;
    const y = f.top - (s0.top - cur.y) - oy * k + (f.height - (t.height / cur.k) * k) / 2;
    stage.style.transformOrigin = '0 0';
    return claim(stage, 'zoom', spring(cur, { k, x, y }, (v) => {
      stage.dataset.k = v.k; stage.dataset.x = v.x; stage.dataset.y = v.y;
      stage.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.k})`;
    }, preset));
  }

  global.Motion = { SPRINGS, spring, morph, flyTo, catchBump, pressable, draggable, stagger, reveal, scene, segment, expand, collapse, slideTo, countTo, popIn, toast, tilt, blurSwap, zoomTo, reduced, clamp, lerp };
})(window);
