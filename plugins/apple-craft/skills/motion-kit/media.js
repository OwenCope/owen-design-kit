/* motion-kit media: budgeted films and scroll-scrubbed frame sequences.
   Loads after motion.js and extends the global `Motion`.
   Both parts respect Reduce Motion by showing the end state, never motion. */
(function (global) {
  const M = global.Motion || (global.Motion = {});
  const clamp = M.clamp || ((v, a, b) => Math.min(b === undefined ? 1 : b, Math.max(a === undefined ? 0 : a, v)));
  const reducedNow = () => (M.reduced ? M.reduced() : matchMedia('(prefers-reduced-motion: reduce)').matches);
  const saveData = () => !!(navigator.connection && navigator.connection.saveData);
  const PHONE_WIDTH = 834;

  /* Plays the films most in view, up to a limit, and pauses the rest.
     Films lazy-load: src is only set from data-src once a film nears the viewport.
     A film paused through its data-toggle button stays paused until it is resumed there.
     Returns { refresh(), destroy() }. */
  function videoBudget(options) {
    options = options || {};
    const selector = options.selector || 'video[data-budget]';
    const max = options.max == null ? 2 : options.max;
    const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
    const items = new Map();
    let raf = 0, dead = false;

    const limit = () => (window.innerWidth < PHONE_WIDTH ? 1 : max);

    // Only fetch a film when it comes near, so posters cover the page cost.
    const loadIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const item = items.get(entry.target);
        loadIO.unobserve(entry.target);
        if (!item || item.loaded) return;
        if (reducedNow() || saveData()) return; // poster stays until the user opts in
        const src = entry.target.dataset.src;
        if (src) { entry.target.src = src; entry.target.load(); }
        item.loaded = true;
        schedule();
      });
    }, { rootMargin: '150% 0px' });

    function syncToggle(item) {
      if (!item.toggle) return;
      const playing = !item.el.paused;
      item.toggle.setAttribute('aria-pressed', String(playing));
      item.toggle.textContent = playing ? 'Pause film' : 'Play film';
    }

    function setup(el) {
      if (items.has(el)) return items.get(el);
      const item = { el: el, toggle: null, userPaused: false, loaded: false, acting: false };
      items.set(el, item);
      el.removeAttribute('autoplay');
      el.playsInline = true;
      // play() without a gesture is only allowed while muted.
      if (!el.hasAttribute('data-sound')) el.muted = true;
      el.preload = 'none';
      if (el.getAttribute('src') || el.querySelector('source[src]')) item.loaded = true;
      const toggle = el.dataset.toggle && document.querySelector(el.dataset.toggle);
      if (toggle) {
        item.toggle = toggle;
        toggle.addEventListener('click', () => {
          if (el.paused) { item.userPaused = false; playItem(item); }
          else { item.userPaused = true; el.pause(); }
          syncToggle(item);
        });
        syncToggle(item);
      }
      // A pause the manager did not make (native controls) counts as the user pausing.
      el.addEventListener('pause', () => { if (!item.acting) { item.userPaused = true; syncToggle(item); } });
      el.addEventListener('play', () => syncToggle(item));
      if (!item.loaded) loadIO.observe(el);
      return item;
    }

    function playItem(item) {
      if (!item.el.paused) return;
      item.acting = true;
      const done = () => { item.acting = false; };
      let p;
      try { p = item.el.play(); } catch (err) { done(); return; }
      if (p && p.then) p.then(done, done);
      else setTimeout(done, 700);
    }

    function pauseItem(item) {
      if (item.el.paused) return;
      item.acting = true;
      item.el.pause();
      setTimeout(() => { item.acting = false; }, 700);
      syncToggle(item);
    }

    function update() {
      raf = 0;
      if (dead) return;
      const list = Array.from(items.values());
      // Hidden tab, save-data and Reduce Motion all pause everything.
      if (document.hidden || reducedNow() || saveData()) { list.forEach(pauseItem); return; }
      const n = limit(), vh = window.innerHeight, vw = window.innerWidth;
      const scored = [];
      list.forEach((item) => {
        if (!item.loaded || item.userPaused) { pauseItem(item); return; }
        const r = item.el.getBoundingClientRect();
        if (!r.width || !r.height) { pauseItem(item); return; }
        const visH = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
        const visW = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0));
        if ((visH * visW) / (r.width * r.height) <= 0.02) { pauseItem(item); return; }
        scored.push({ item: item, frac: (visH * visW) / (r.width * r.height), mid: Math.abs((r.top + r.bottom) / 2 - vh / 2) });
      });
      scored.sort((a, b) => (b.frac - a.frac) || (a.mid - b.mid));
      scored.forEach((s, i) => { if (i < n) playItem(s.item); else pauseItem(s.item); });
    }

    function schedule() { if (!raf && !dead) raf = requestAnimationFrame(update); }
    const onVis = () => update();
    const onReduce = () => update();

    document.querySelectorAll(selector).forEach(setup);
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    document.addEventListener('visibilitychange', onVis);
    reduceMQ.addEventListener('change', onReduce);
    if (navigator.connection && navigator.connection.addEventListener) navigator.connection.addEventListener('change', onVis);
    schedule();

    return {
      // Pick up films added after init, then re-evaluate who plays.
      refresh() { if (!dead) { document.querySelectorAll(selector).forEach(setup); schedule(); } },
      destroy() {
        dead = true;
        if (raf) cancelAnimationFrame(raf);
        loadIO.disconnect();
        removeEventListener('scroll', schedule);
        removeEventListener('resize', schedule);
        document.removeEventListener('visibilitychange', onVis);
        reduceMQ.removeEventListener('change', onReduce);
        items.forEach((item) => { try { item.el.pause(); } catch (err) {} });
        items.clear();
      },
    };
  }

  /* Draws an image sequence onto a canvas as its section scrolls past.
     Pass { pattern: 'frames/f-{i}.jpg', count, start, pad } or { urls: [...] }.
     The first frame loads first so something shows fast; the rest follow in
     the background and each scroll position draws the nearest loaded frame.
     Reduce Motion draws the last frame once and never listens to scroll.
     Returns { destroy() }. */
  function frameScrub(canvas, options) {
    options = options || {};
    const noop = () => {};
    let urls = options.urls ? Array.from(options.urls) : [];
    if (!urls.length && options.pattern && options.count) {
      const start = options.start == null ? 1 : options.start;
      const pad = options.pad == null ? 3 : options.pad;
      for (let k = 0; k < options.count; k++) {
        urls.push(options.pattern.replace('{i}', String(start + k).padStart(pad, '0')));
      }
    }
    const ctx = canvas ? canvas.getContext('2d') : null;
    if (!canvas || !ctx || !urls.length) return { destroy: noop };
    const n = urls.length;
    const section = options.section || canvas.closest('section') || canvas.parentElement;
    const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
    const imgs = new Array(n).fill(null);
    const ok = new Array(n).fill(false);
    let last = -2, raf = 0, dead = false;

    function size() {
      // Past 2x the pixels are invisible but cost 4x memory.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return false;
      const W = Math.round(w * dpr), H = Math.round(h * dpr);
      if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; last = -2; }
      return true;
    }

    function nearest(i) {
      for (let d = 0; d < n; d++) {
        if (i - d >= 0 && ok[i - d]) return i - d;
        if (i + d < n && ok[i + d]) return i + d;
      }
      return -1;
    }

    function draw(i) {
      const k = ok[i] ? i : nearest(i);
      if (k < 0 || !size()) return;
      const img = imgs[k], cw = canvas.width, ch = canvas.height;
      // Cover maths: fill the canvas, crop the overflow.
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      last = i;
    }

    function show() {
      raf = 0;
      if (dead) return;
      const r = section.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return; // off screen: leave the last frame up
      const total = r.height - vh;
      const p = total > 0 ? clamp(-r.top / total) : (r.top < vh ? 1 : 0);
      const i = Math.round(p * (n - 1));
      if (i !== last) draw(i);
    }

    function schedule() { if (!raf && !dead) raf = requestAnimationFrame(show); }

    function load(i, done) {
      const img = new Image();
      if ('decoding' in img) img.decoding = 'async';
      img.onload = () => { imgs[i] = img; ok[i] = true; if (done) done(); };
      img.onerror = () => { if (done) done(); }; // one missing frame never blocks the rest
      img.src = urls[i];
    }

    function onReduce() {
      if (!reducedNow()) { last = -2; schedule(); return; }
      if (ok[n - 1]) { last = -2; draw(n - 1); }
      else load(n - 1, () => { if (!dead) { last = -2; draw(n - 1); } });
    }

    function onResize() { last = -2; schedule(); }

    if (reducedNow()) {
      onReduce();
    } else {
      load(0, () => {
        if (dead) return;
        show();
        let k = 1;
        const next = () => {
          if (dead || k >= n) return;
          load(k, () => { if (dead) return; k += 1; last = -2; show(); next(); });
        };
        next();
      });
      addEventListener('scroll', schedule, { passive: true });
      addEventListener('resize', onResize);
    }
    reduceMQ.addEventListener('change', onReduce);

    return {
      destroy() {
        dead = true;
        if (raf) cancelAnimationFrame(raf);
        removeEventListener('scroll', schedule);
        removeEventListener('resize', onResize);
        reduceMQ.removeEventListener('change', onReduce);
      },
    };
  }

  M.videoBudget = videoBudget;
  M.frameScrub = frameScrub;
})(window);
