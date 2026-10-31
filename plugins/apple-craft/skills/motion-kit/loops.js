/* motion-kit loops: things that move on their own, done accessibly.
   Plain JS, no dependencies. Loads after motion.js and adds to the global `Motion`.
   Every part respects Reduce Motion (it shows the end state, never animates).
   Buttons never move; hover and press answer in tint only. */
(function (global) {
  const Motion = global.Motion;
  const reduced = () => Motion.reduced();
  const FINE = '150ms cubic-bezier(.16,1,.3,1)';

  // Small pause/play button shared by the looping parts. Tint only, never moves.
  function loopButton(label) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mk-loop-btn';
    Object.assign(btn.style, {
      border: '0', borderRadius: '999px', background: 'rgba(127,127,127,.16)',
      color: 'inherit', font: '600 13px -apple-system, BlinkMacSystemFont, sans-serif',
      minHeight: '30px', padding: '0 14px', cursor: 'pointer',
      transition: 'background-color ' + FINE + ', filter ' + FINE,
    });
    btn.addEventListener('mouseenter', () => { btn.style.background = 'rgba(127,127,127,.28)'; });
    btn.addEventListener('mouseleave', () => { btn.style.background = 'rgba(127,127,127,.16)'; });
    btn.addEventListener('focus', () => { btn.style.background = 'rgba(127,127,127,.28)'; });
    btn.addEventListener('blur', () => { btn.style.background = 'rgba(127,127,127,.16)'; });
    btn.addEventListener('mousedown', () => { btn.style.filter = 'brightness(.94)'; });
    btn.addEventListener('mouseup', () => { btn.style.filter = ''; });
    const setPlaying = (playing, what) => {
      btn.setAttribute('aria-pressed', String(playing));
      btn.textContent = playing ? 'Pause' : 'Play';
      btn.setAttribute('aria-label', (playing ? 'Pause ' : 'Play ') + what);
    };
    return { btn, setPlaying };
  }

  // True while the page is visible. One listener per part; each part removes its own.
  function onVisibleChange(fn) {
    const h = () => fn(!document.hidden);
    document.addEventListener('visibilitychange', h);
    return () => document.removeEventListener('visibilitychange', h);
  }

  /* Marquee: a seamless text loop at a constant speed.
     `el` holds the items to repeat. Options: { speed } in px per second (default 60). */
  function marquee(el, options = {}) {
    const speed = options.speed ?? 60;
    const noop = { pause() {}, play() {}, destroy() {} };
    const originals = [...el.childNodes];
    if (!originals.length) return noop;

    el.style.position = el.style.position || 'relative';
    el.style.overflow = 'hidden';
    const track = document.createElement('div');
    Object.assign(track.style, { display: 'flex', width: 'max-content', willChange: 'transform' });
    const first = document.createElement('div');
    Object.assign(first.style, { display: 'flex', alignItems: 'center', gap: '48px', paddingRight: '48px' });
    originals.forEach((n) => first.appendChild(n));
    track.appendChild(first);
    el.appendChild(track);

    const clean = (root) => {
      root.setAttribute('aria-hidden', 'true');
      if ('inert' in root) root.inert = true; else root.setAttribute('inert', '');
      root.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
      // inert covers newer browsers; tabindex covers the rest.
      root.querySelectorAll('a, button, [tabindex]').forEach((n) => n.tabIndex = -1);
    };
    let setWidth = 1;
    const measure = () => { setWidth = Math.max(1, first.getBoundingClientRect().width); };
    const ensure = () => {
      measure();
      const need = Math.max(2, Math.ceil(((el.clientWidth || innerWidth) * 2) / setWidth) + 1);
      while (track.children.length < need) { const c = first.cloneNode(true); clean(c); track.appendChild(c); }
      while (track.children.length > need) track.removeChild(track.lastChild);
      measure();
    };

    if (reduced()) {
      // A static wrapped row: every item visible, nothing moving.
      track.style.flexWrap = 'wrap';
      track.style.width = 'auto';
      first.style.flexWrap = 'wrap';
      first.style.paddingRight = '0';
      return {
        pause() {}, play() {},
        destroy() { originals.forEach((n) => el.appendChild(n)); track.remove(); },
      };
    }
    ensure();

    let x = 0, last = performance.now(), raf = 0;
    let wantPlay = true, hover = false, focus = false, seen = true, shown = !document.hidden;
    const paused = () => !wantPlay || hover || focus || !seen || !shown;
    const { btn, setPlaying } = loopButton();
    setPlaying(true, 'marquee');
    el.insertAdjacentElement('afterend', btn);
    const paint = () => setPlaying(wantPlay, 'marquee');

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      if (paused()) return;
      x -= speed * dt;
      if (x <= -setWidth) x += setWidth;
      track.style.transform = `translateX(${x}px)`;
    };
    raf = requestAnimationFrame(frame);

    const onEnter = () => { hover = true; };
    const onLeave = () => { hover = false; };
    const onFocus = () => { focus = true; };
    const onBlur = () => { focus = false; };
    const onResize = () => ensure();
    const offVisible = onVisibleChange((v) => { shown = v; last = performance.now(); });
    const io = new IntersectionObserver((es) => { seen = es[0].isIntersecting; last = performance.now(); });
    io.observe(el);
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointerleave', onLeave);
    el.addEventListener('focusin', onFocus);
    el.addEventListener('focusout', onBlur);
    addEventListener('resize', onResize);
    const toggle = () => { wantPlay = !wantPlay; last = performance.now(); paint(); };
    btn.addEventListener('click', toggle);
    paint();

    return {
      pause() { wantPlay = false; paint(); },
      play() { wantPlay = true; last = performance.now(); paint(); },
      destroy() {
        cancelAnimationFrame(raf); io.disconnect(); offVisible();
        el.removeEventListener('pointerenter', onEnter);
        el.removeEventListener('pointerleave', onLeave);
        el.removeEventListener('focusin', onFocus);
        el.removeEventListener('focusout', onBlur);
        removeEventListener('resize', onResize);
        btn.remove();
        track.style.transform = '';
        originals.forEach((n) => el.appendChild(n));
        track.remove();
      },
    };
  }

  /* Rotator: tabs that advance on their own. Starts paused unless options.autoplay.
     Options: { autoplay, interval (default 6000), panels }.
     Stops after one full pass; the visitor can still pick tabs by hand. */
  function rotator(tablist, options = {}) {
    const interval = options.interval ?? 6000;
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const noop = { select() {}, pause() {}, play() {}, destroy() {} };
    if (tabs.length < 2) return noop;
    let panels = tabs.map((t) => {
      const id = t.getAttribute('aria-controls');
      return id ? document.getElementById(id) : null;
    });
    if (panels.some((p) => !p) && Array.isArray(options.panels)) panels = [...options.panels];
    panels = panels.filter(Boolean);

    tablist.setAttribute('role', 'tablist');
    const cs = getComputedStyle(tablist);
    if (cs.position === 'static') tablist.style.position = 'relative';
    tabs.forEach((t, i) => {
      t.setAttribute('role', 'tab');
      if (!t.hasAttribute('tabindex')) t.tabIndex = i === 0 ? 0 : -1;
      if (!t.hasAttribute('aria-selected')) t.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    });
    panels.forEach((p, i) => {
      p.setAttribute('role', 'tabpanel');
      if (!p.hasAttribute('tabindex')) p.tabIndex = 0;
      if (i > 0) p.hidden = true; else p.hidden = false;
    });

    // Sliding pill behind the active tab, driven by the kit so it matches other pages.
    const pill = document.createElement('span');
    pill.setAttribute('aria-hidden', 'true');
    Object.assign(pill.style, { position: 'absolute', bottom: '0', left: '0', height: '2px', width: '0', background: 'currentColor', opacity: '.8', pointerEvents: 'none' });
    tablist.appendChild(pill);
    // Thin progress fill docked to the active tab.
    const bar = document.createElement('span');
    bar.setAttribute('aria-hidden', 'true');
    Object.assign(bar.style, { position: 'absolute', bottom: '0', left: '0', height: '2px', width: '100%', transform: 'scaleX(0)', transformOrigin: '0 50%', background: 'currentColor', pointerEvents: 'none' });

    let index = Math.max(0, tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true'));
    let wantPlay = !!options.autoplay && !reduced();
    let autoDone = false;
    let advances = 0;
    let hover = false, focus = false, held = false, seen = true, shown = !document.hidden;
    const blocked = () => hover || focus || held || !seen || !shown;
    let timer = 0, raf = 0, start = 0, remaining = interval;

    const stack = panels.length && panels[0].parentElement ? panels[0].parentElement : null;
    const show = (next) => {
      const write = () => panels.forEach((p, i) => { p.hidden = i !== next; });
      if (stack && panels.every((p) => p.parentElement === stack)) Motion.blurSwap(stack, write);
      else { write(); }
    };
    const place = (animate) => {
      const tab = tabs[index];
      tabs.forEach((t, i) => {
        t.setAttribute('aria-selected', i === index ? 'true' : 'false');
        t.tabIndex = i === index ? 0 : -1;
      });
      tab.appendChild(bar);
      bar.style.transform = 'scaleX(0)';
      if (animate && !reduced()) Motion.slideTo(pill, tab);
      else {
        const p = tablist.getBoundingClientRect(), r = tab.getBoundingClientRect();
        pill.style.left = (r.left - p.left + tablist.scrollLeft) + 'px';
        pill.style.width = r.width + 'px';
      }
    };
    const stopTimers = () => { clearTimeout(timer); timer = 0; cancelAnimationFrame(raf); raf = 0; };
    const tickBar = (t0) => {
      raf = requestAnimationFrame((now) => {
        const done = 1 - Math.max(0, remaining - (now - t0)) / interval;
        bar.style.transform = `scaleX(${Math.min(1, Math.max(0, done))})`;
        if (done < 1 && wantPlay && !blocked() && !reduced()) tickBar(t0);
      });
    };
    const schedule = () => {
      stopTimers();
      if (!wantPlay || autoDone || blocked()) return;
      start = performance.now();
      if (!reduced()) tickBar(start);
      else bar.style.transform = 'scaleX(0)';
      timer = setTimeout(() => {
        advances += 1;
        if (advances >= tabs.length - 1) {
          // One full pass ends the autoplay for good; the control offers a replay.
          index = (index + 1) % tabs.length;
          place(true); show(index);
          wantPlay = false; autoDone = true; paint();
          return;
        }
        index = (index + 1) % tabs.length;
        place(true); show(index);
        remaining = interval;
        schedule();
      }, remaining);
    };
    const pauseClock = () => {
      if (timer) remaining = Math.max(0, remaining - (performance.now() - start));
      stopTimers();
    };
    const resumeClock = () => { start = performance.now(); schedule(); };

    const { btn, setPlaying } = loopButton();
    btn.setAttribute('aria-label', 'Pause feature rotation');
    tablist.insertAdjacentElement('afterend', btn);
    const paint = () => setPlaying(wantPlay && !autoDone ? true : wantPlay, 'feature rotation');
    const userPlay = () => { wantPlay = true; autoDone = false; advances = 0; remaining = interval; paint(); schedule(); };
    const userPause = () => { wantPlay = false; stopTimers(); paint(); };
    btn.addEventListener('click', () => (wantPlay ? userPause() : userPlay()));

    const select = (next, fromUser) => {
      index = (next + tabs.length) % tabs.length;
      if (fromUser) { advances = 0; remaining = interval; }
      place(true); show(index);
      if (wantPlay && !autoDone) { remaining = interval; schedule(); }
    };
    const onClick = (i) => () => { select(i, true); };
    const fns = tabs.map((t, i) => onClick(i));
    tabs.forEach((t, i) => t.addEventListener('click', fns[i]));
    const onKey = (e) => {
      let next = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = index + 1;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = index - 1;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      else return;
      e.preventDefault();
      select(next, true);
      tabs[index].focus();
    };
    tablist.addEventListener('keydown', onKey);
    // Hover, focus and a press hold the clock; it resumes where it left off.
    const onEnter = () => { hover = true; pauseClock(); };
    const onLeave = () => { hover = false; if (wantPlay) resumeClock(); };
    const onFocus = () => { focus = true; pauseClock(); };
    const onBlur = () => { focus = false; if (wantPlay) resumeClock(); };
    const onDown = () => { held = true; pauseClock(); };
    const onUp = () => { held = false; if (wantPlay) resumeClock(); };
    tablist.addEventListener('pointerenter', onEnter);
    tablist.addEventListener('pointerleave', onLeave);
    tablist.addEventListener('focusin', onFocus);
    tablist.addEventListener('focusout', onBlur);
    tablist.addEventListener('pointerdown', onDown);
    addEventListener('pointerup', onUp);
    addEventListener('pointercancel', onUp);
    const offVisible = onVisibleChange((v) => { shown = v; if (!v) pauseClock(); else if (wantPlay) resumeClock(); });
    const io = new IntersectionObserver((es) => {
      seen = es[0].isIntersecting;
      if (!seen) pauseClock(); else if (wantPlay) resumeClock();
    });
    io.observe(tablist);

    place(false);
    paint();
    if (wantPlay) schedule();

    return {
      select(i) { select(i, true); },
      pause: userPause,
      play: userPlay,
      destroy() {
        stopTimers(); io.disconnect(); offVisible();
        tabs.forEach((t, i) => t.removeEventListener('click', fns[i]));
        tablist.removeEventListener('keydown', onKey);
        tablist.removeEventListener('pointerenter', onEnter);
        tablist.removeEventListener('pointerleave', onLeave);
        tablist.removeEventListener('focusin', onFocus);
        tablist.removeEventListener('focusout', onBlur);
        tablist.removeEventListener('pointerdown', onDown);
        removeEventListener('pointerup', onUp);
        removeEventListener('pointercancel', onUp);
        pill.remove(); bar.remove(); btn.remove();
      },
    };
  }

  /* Carousel: a scroll-snap row with dots and previous/next buttons. Starts paused.
     `track` is the scrolling element whose children are the slides.
     Options: { interval (default 5000) }. */
  function carousel(track, options = {}) {
    const interval = options.interval ?? 5000;
    const slides = [...track.children];
    const noop = { goTo() {}, pause() {}, play() {}, destroy() {} };
    if (!slides.length) return noop;

    if (!track.style.scrollSnapType) track.style.scrollSnapType = 'x mandatory';
    if (getComputedStyle(track).overflowX === 'visible') track.style.overflowX = 'auto';
    if (track.tabIndex < 0 && !track.hasAttribute('tabindex')) track.tabIndex = 0;
    slides.forEach((s) => { if (!s.style.scrollSnapAlign) s.style.scrollSnapAlign = 'center'; });

    const controls = document.createElement('div');
    Object.assign(controls.style, { display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' });
    const styleBtn = (b) => {
      Object.assign(b.style, {
        border: '0', borderRadius: '999px', background: 'rgba(127,127,127,.16)', color: 'inherit',
        font: '600 14px -apple-system, BlinkMacSystemFont, sans-serif', minHeight: '36px', minWidth: '44px',
        padding: '0 16px', cursor: 'pointer', transition: 'background-color ' + FINE + ', filter ' + FINE,
      });
      b.addEventListener('mouseenter', () => { b.style.background = 'rgba(127,127,127,.28)'; });
      b.addEventListener('mouseleave', () => { b.style.background = 'rgba(127,127,127,.16)'; b.style.filter = ''; });
      b.addEventListener('mousedown', () => { b.style.filter = 'brightness(.94)'; });
      b.addEventListener('mouseup', () => { b.style.filter = ''; });
    };
    const prev = document.createElement('button');
    prev.type = 'button'; prev.textContent = '‹'; prev.setAttribute('aria-label', 'Previous slide');
    const next = document.createElement('button');
    next.type = 'button'; next.textContent = '›'; next.setAttribute('aria-label', 'Next slide');
    const playBtn = document.createElement('button');
    playBtn.type = 'button'; playBtn.textContent = 'Play';
    playBtn.setAttribute('aria-pressed', 'false');
    playBtn.setAttribute('aria-label', 'Play slide show');
    [prev, next, playBtn].forEach(styleBtn);
    prev.style.fontSize = next.style.fontSize = '18px';
    const dots = document.createElement('div');
    Object.assign(dots.style, { display: 'flex', gap: '8px', marginLeft: '4px' });
    dots.setAttribute('role', 'tablist');
    dots.setAttribute('aria-label', 'Slides');
    const dotBtns = slides.map((s, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.setAttribute('role', 'tab');
      d.setAttribute('aria-label', `Go to slide ${i + 1}`);
      Object.assign(d.style, {
        width: '10px', height: '10px', borderRadius: '50%', border: '0', padding: '0',
        background: 'rgba(127,127,127,.35)', cursor: 'pointer', transition: 'background-color ' + FINE,
      });
      d.addEventListener('click', () => goTo(i));
      dots.appendChild(d);
      return d;
    });
    controls.append(prev, playBtn, next, dots);
    track.insertAdjacentElement('afterend', controls);

    const centre = (s) => {
      const t = track.getBoundingClientRect(), r = s.getBoundingClientRect();
      return r.left + r.width / 2 - (t.left + t.width / 2);
    };
    const current = () => {
      let best = 0, bd = Infinity;
      slides.forEach((s, i) => { const d = Math.abs(centre(s)); if (d < bd) { bd = d; best = i; } });
      return best;
    };
    const mark = (idx) => dotBtns.forEach((d, i) => {
      const on = i === idx;
      d.style.background = on ? 'currentColor' : 'rgba(127,127,127,.35)';
      if (on) d.setAttribute('aria-selected', 'true'); else d.removeAttribute('aria-selected');
    });

    let wantPlay = false, timer = 0, flight = null, raf = 0;
    const paint = () => {
      playBtn.setAttribute('aria-pressed', String(wantPlay));
      playBtn.textContent = wantPlay ? 'Pause' : 'Play';
      playBtn.setAttribute('aria-label', (wantPlay ? 'Pause' : 'Play') + ' slide show');
    };
    const targetX = (i) => track.scrollLeft + centre(slides[(i + slides.length) % slides.length]);
    function goTo(i) {
      const to = targetX(i);
      const from = track.scrollLeft;
      if (flight) flight.stop?.();
      if (reduced() || Math.abs(to - from) < 1) {
        // Snap must not fight the programmatic move, so it comes back after.
        track.style.scrollSnapType = 'none';
        track.scrollLeft = to;
        track.style.scrollSnapType = '';
        mark((i + slides.length) % slides.length);
        return;
      }
      const prevSnap = track.style.scrollSnapType;
      track.style.scrollSnapType = 'none';
      flight = Motion.spring({ x: from }, { x: to }, ({ x }) => { track.scrollLeft = x; }, 'smooth');
      flight.then(() => { track.style.scrollSnapType = prevSnap || ''; flight = null; });
      mark((i + slides.length) % slides.length);
    }
    const schedule = () => {
      clearTimeout(timer); timer = 0;
      if (!wantPlay) return;
      timer = setTimeout(() => { goTo(current() + 1); schedule(); }, interval);
    };
    const stop = () => { wantPlay = false; clearTimeout(timer); timer = 0; paint(); };

    prev.addEventListener('click', () => goTo(current() - 1));
    next.addEventListener('click', () => goTo(current() + 1));
    playBtn.addEventListener('click', () => { wantPlay = !wantPlay; paint(); schedule(); });
    // Any direct touch of the row hands control to the visitor for good.
    const handOver = () => stop();
    track.addEventListener('wheel', handOver, { passive: true });
    track.addEventListener('touchstart', handOver, { passive: true });
    track.addEventListener('pointerdown', handOver);
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => mark(current()));
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    const onKey = (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current() + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current() - 1); }
      else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
      else if (e.key === 'End') { e.preventDefault(); goTo(slides.length - 1); }
    };
    track.addEventListener('keydown', onKey);

    mark(0);
    paint();

    return {
      goTo, pause: stop,
      play() { wantPlay = true; paint(); schedule(); },
      destroy() {
        stop(); cancelAnimationFrame(raf);
        flight?.stop?.();
        track.removeEventListener('wheel', handOver);
        track.removeEventListener('touchstart', handOver);
        track.removeEventListener('pointerdown', handOver);
        track.removeEventListener('scroll', onScroll);
        track.removeEventListener('keydown', onKey);
        controls.remove();
      },
    };
  }

  /* Drift: slow ambient motion for decorative layers only, never text.
     Options: { distance (default 10), duration (default 7000) }. Transform only. */
  function drift(el, options = {}) {
    // Text must stay still, so a leaf text node opts out silently.
    const bare = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
    if (bare || reduced()) return { destroy() {} };
    const dx = options.x ?? options.distance ?? 10;
    const dy = options.y ?? (options.distance ?? 10) * 0.7;
    const duration = options.duration ?? 7000;
    let raf = 0, t0 = performance.now(), frozen = 0, seen = true, shown = !document.hidden;
    const running = () => seen && shown;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (!running()) { frozen = now; return; }
      if (frozen) { t0 += now - frozen; frozen = 0; } // hold position while paused
      const t = ((now - t0) / duration) * Math.PI * 2;
      el.style.transform = `translate3d(${(Math.sin(t) * dx).toFixed(2)}px, ${(Math.cos(t * 0.8) * dy).toFixed(2)}px, 0)`;
    };
    raf = requestAnimationFrame(frame);
    const io = new IntersectionObserver((es) => { seen = es[0].isIntersecting; });
    io.observe(el);
    const h = () => { shown = !document.hidden; };
    document.addEventListener('visibilitychange', h);
    return {
      destroy() {
        cancelAnimationFrame(raf); io.disconnect();
        document.removeEventListener('visibilitychange', h);
        el.style.transform = '';
      },
    };
  }

  Object.assign(Motion, { marquee, rotator, carousel, drift });
})(window);
