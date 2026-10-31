/* scroll-kit: scroll-driven parts for product pages. Plain JS, no dependencies.
   Loads after motion.js and adds to the global `Motion`. Every part jumps to
   its end state under Reduce Motion. Listeners and observers clean up through
   the returned destroy functions. */
(function (global) {
  const M = global.Motion;
  const reduced = M.reduced, clamp = M.clamp;
  const REVEAL_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

  // Run `update` once per frame while scrolling, instead of once per event.
  function scrollLoop(update) {
    let raf = 0, dead = false;
    const kick = () => { if (!dead && !raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); };
    addEventListener('scroll', kick, { passive: true });
    addEventListener('resize', kick);
    kick();
    return () => { dead = true; if (raf) cancelAnimationFrame(raf); removeEventListener('scroll', kick); removeEventListener('resize', kick); };
  }

  // Word-by-word lighting tied to scroll. Words light as the element travels
  // through a band of the viewport, and dim again on scroll up. Only opacity
  // changes, so words never shift. Screen readers get one label for the whole
  // line instead of hearing each word separately.
  function wordScrub(el, { start = 0.85, end = 0.35, dim = 0.18 } = {}) {
    const text = el.textContent.trim().replace(/\s+/g, ' ');
    el.setAttribute('aria-label', text);
    el.innerHTML = text.split(' ').map((w) => `<span aria-hidden="true" style="opacity:${dim}">${w}</span>`).join(' ');
    const words = [...el.querySelectorAll('span')];
    if (reduced()) { words.forEach((w) => { w.style.opacity = 1; }); return () => {}; }
    return scrollLoop(() => {
      const r = el.getBoundingClientRect(), vh = innerHeight;
      const top = vh * start, span = vh * start - vh * end || 1;
      const p = clamp((top - (r.top + r.height / 2)) / span);
      const lit = p * words.length;
      words.forEach((w, i) => { w.style.opacity = String(dim + (1 - dim) * clamp(lit - i)); });
    });
  }

  // Like Motion.scene, but the reported progress chases the real scroll position
  // with exponential smoothing, so fast flings glide instead of jumping. The
  // loop runs only while the value is still moving. An optional toggle element
  // (a button) pauses the driven work and any video inside the section.
  function smoothProgress(section, onUpdate, { smoothing = 90, play = null } = {}) {
    if (reduced()) { onUpdate(1); return () => {}; }
    let target = 0, current = 0, raf = 0, last = 0, paused = false, dead = false;
    const measure = () => {
      const r = section.getBoundingClientRect();
      return clamp(-r.top / Math.max(1, r.height - innerHeight));
    };
    const loop = (now) => {
      if (dead || paused) { raf = 0; return; }
      if (!last) last = now;
      const dt = Math.min(100, now - last); last = now;
      current += (target - current) * (1 - Math.exp(-dt / smoothing));
      if (Math.abs(target - current) < 0.0005) current = target;
      onUpdate(current);
      if (current !== target) raf = requestAnimationFrame(loop); else { raf = 0; last = 0; }
    };
    const kick = () => {
      target = measure();
      if (paused || dead) return;
      if (!raf) { last = 0; raf = requestAnimationFrame(loop); }
    };
    addEventListener('scroll', kick, { passive: true });
    addEventListener('resize', kick);
    kick();
    const toggle = play;
    const onToggle = () => {
      paused = !paused;
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.textContent = paused ? 'Play' : 'Pause';
      section.querySelectorAll('video').forEach((v) => { if (paused) v.pause(); else v.play().catch(() => {}); });
      if (!paused) kick();
    };
    if (toggle) toggle.addEventListener('click', onToggle);
    return () => {
      dead = true; if (raf) cancelAnimationFrame(raf);
      removeEventListener('scroll', kick); removeEventListener('resize', kick);
      if (toggle) toggle.removeEventListener('click', onToggle);
    };
  }

  // Only these paint cheaply on scroll; anything else would jank the scrub.
  const ALLOWED = ['transform', 'opacity', 'filter', 'clipPath'];
  function pickAllowed(style) {
    const out = {};
    ALLOWED.forEach((k) => { if (style[k] != null) out[k] = style[k]; });
    if (style['clip-path'] != null && out.clipPath == null) out.clipPath = style['clip-path'];
    return out;
  }

  // Blend two values: numbers and matching number templates lerp, anything
  // else flips halfway so mixed units still land on the right end state.
  function mixStr(a, b, t) {
    if (typeof a === 'number' && typeof b === 'number') return a + (b - a) * t;
    if (typeof a !== 'string' || typeof b !== 'string') return t < 0.5 ? a : b;
    const nums = (s) => s.match(/-?\d*\.?\d+(?:e-?\d+)?/gi) || [];
    const na = nums(a), nb = nums(b);
    if (na.length !== nb.length || a.replace(/-?\d*\.?\d+(?:e-?\d+)?/gi, '#') !== b.replace(/-?\d*\.?\d+(?:e-?\d+)?/gi, '#')) return t < 0.5 ? a : b;
    let i = 0;
    return a.replace(/-?\d*\.?\d+(?:e-?\d+)?/gi, () => String(parseFloat(na[i]) + (parseFloat(nb[i++]) - parseFloat(na[i - 1])) * t));
  }

  // Drive an element through keyframes with scroll position. Uses a native
  // view timeline where supported, otherwise the same stops are interpolated
  // from an rAF loop. Keyframes: [{ at: 0..1, transform, opacity, filter,
  // clipPath }]. Only transform, opacity, filter and clip-path are applied.
  function timeline(el, keyframes, { start = 0.92, end = 0.08, range = null } = {}) {
    const stops = [...keyframes]
      .map((k) => ({ at: clamp(k.at ?? 0), style: pickAllowed(k.style || k) }))
      .sort((a, b) => a.at - b.at);
    const last = stops[stops.length - 1].style;
    const applyEnd = () => Object.entries(last).forEach(([k, v]) => { el.style[k] = v; });
    if (reduced()) { applyEnd(); return () => {}; }
    if (global.CSS && CSS.supports && CSS.supports('animation-timeline: view()')) {
      const name = 'mk-tl-' + Math.random().toString(36).slice(2, 9);
      const body = stops.map((s) => `${(s.at * 100).toFixed(2)}% { ${
        Object.entries(s.style).map(([k, v]) => `${k.replace('clipPath', 'clip-path')}: ${v}`).join('; ')
      } }`).join('\n');
      const tag = document.createElement('style');
      tag.textContent = `@keyframes ${name} {\n${body}\n}`;
      document.head.appendChild(tag);
      el.style.animationName = name;
      el.style.animationDuration = '1s';
      el.style.animationTimingFunction = 'linear';
      el.style.animationFillMode = 'both';
      el.style.animationTimeline = 'view()';
      if (range) el.style.animationRange = range;
      return () => {
        el.style.animationName = ''; el.style.animationTimeline = ''; el.style.animationRange = '';
        tag.remove(); applyEnd();
      };
    }
    return scrollLoop(() => {
      const r = el.getBoundingClientRect(), vh = innerHeight;
      const p = clamp((vh * start - (r.top + r.height / 2)) / (vh * (start - end) || 1));
      let a = stops[0], b = stops[stops.length - 1];
      for (let i = 0; i < stops.length - 1; i++) {
        if (p >= stops[i].at && p <= stops[i + 1].at) { a = stops[i]; b = stops[i + 1]; break; }
      }
      const t = clamp((p - a.at) / Math.max(1e-6, b.at - a.at));
      const keys = new Set([...Object.keys(a.style), ...Object.keys(b.style)]);
      keys.forEach((k) => { el.style[k] = mixStr(a.style[k] ?? b.style[k], b.style[k] ?? a.style[k], t); });
    });
  }

  // One-time accent sweep over a highlighted word: the accent layer starts
  // clipped away and wipes in from the left. The base text stays readable, so
  // screen readers just read the line once and ignore the accent copy.
  function accentWipe(el, { color = 'var(--accent)', duration = 600, delay = 0 } = {}) {
    const text = el.textContent;
    el.style.position = el.style.position || 'relative';
    el.style.display = 'inline-block';
    el.innerHTML = `<span>${text}</span><span aria-hidden="true" style="position:absolute;inset:0;color:${color};clip-path:inset(0 100% 0 0)">${text}</span>`;
    const top = el.children[1];
    if (reduced()) { top.style.clipPath = 'inset(0 0 0 0)'; top.style.transition = ''; return () => {}; }
    let gone = false;
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting || gone) return;
      gone = true; io.disconnect();
      requestAnimationFrame(() => {
        top.style.transition = `clip-path ${duration}ms ${REVEAL_EASE} ${delay}ms`;
        top.style.clipPath = 'inset(0 0 0 0)';
      });
    }), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }

  // One light sweep across a headline or button the first time it is seen.
  // A gradient strip crosses once and is removed; never loops. Off entirely
  // under Reduce Motion, leaving the content exactly as written.
  function sheen(el, { duration = 900 } = {}) {
    if (reduced()) return () => {};
    let done = false, dead = false, strip = null;
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting || done) return;
      done = true; io.disconnect();
      if (dead) return;
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      const prev = el.style.overflow;
      el.style.overflow = 'hidden';
      strip = document.createElement('span');
      strip.setAttribute('aria-hidden', 'true');
      Object.assign(strip.style, {
        position: 'absolute', inset: '-20% -60%', pointerEvents: 'none',
        background: 'linear-gradient(105deg, transparent 42%, rgba(255,255,255,.55) 50%, transparent 58%)',
        transform: 'translateX(-60%)',
      });
      el.appendChild(strip);
      requestAnimationFrame(() => {
        if (!strip) return;
        strip.style.transition = `transform ${duration}ms ${REVEAL_EASE}`;
        strip.style.transform = 'translateX(60%)';
      });
      setTimeout(() => { if (strip && strip.isConnected) strip.remove(); strip = null; el.style.overflow = prev; }, duration + 80);
    }), { threshold: 0.4 });
    io.observe(el);
    return () => { dead = true; io.disconnect(); if (strip && strip.isConnected) strip.remove(); };
  }

  Object.assign(M, { wordScrub, smoothProgress, timeline, accentWipe, sheen });
})(window);
