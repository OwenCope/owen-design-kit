/* motion-kit showcase: a peeking card gallery with a dot pill and play button.
   Plain JS, no dependencies. Loads after motion.js and adds Motion.showcase.
   Sizes follow the Apple gallery study in reviews/droppy-sites-2026-10-31/parts/12-apple-showcase-study.md:
   card up to 1260 wide with 90px peeks and 20px gaps on desktop, 24px side
   margins on phones, 28px radius, dots 8px growing to a 48px bar (32px on
   phones) that fills over about 5200ms, travel about 1000ms, one pass only.
   Buttons never move; hover and press answer in tint only. */
(function (global) {
  const Motion = global.Motion;
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const TINT = '150ms cubic-bezier(.16,1,.3,1)';
  const DOT_GAP = 8, DOT_REST = 8, DOT_WIDE = 48, DOT_NARROW = 32, PILL_H = 56, BTN = 56;

  const ICON_PAUSE = '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><rect x="4" y="3" width="4.5" height="14" rx="2"/><rect x="11.5" y="3" width="4.5" height="14" rx="2"/></svg>';
  const ICON_PLAY = '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M6 3.8c0-1 1.1-1.6 2-1.1l8.4 5.4c.8.5.8 1.7 0 2.2L8 15.7c-.9.5-2-.1-2-1.1V3.8z"/></svg>';

  /* Expected markup: root holds one track whose children are the slides.
     <div data-showcase><div data-showcase-track><section>…</section>…</div></div>
     Controls, dots and live region are built here. Returns { go, play, pause, destroy }. */
  function showcase(root, options) {
    const opts = options || {};
    const interval = opts.interval ?? 5200; // measured dwell; travel adds about 1000ms
    const track = root.querySelector('[data-showcase-track]') || root.children[0];
    const slides = track ? [...track.children] : [];
    const noop = { go() {}, play() {}, pause() {}, destroy() {} };
    if (!track || slides.length < 1) return noop;

    const n = slides.length;
    const narrow = matchMedia('(max-width: 480px)');
    const barW = () => (narrow.matches ? DOT_NARROW : DOT_WIDE);

    // Structural layout lives here so the part works on any page; surface
    // styling (card background, shadows) stays with the page.
    root.style.position = root.style.position || 'relative';
    Object.assign(track.style, {
      display: 'flex', gap: '20px', overflowX: 'auto', scrollbarWidth: 'none',
      scrollSnapType: 'x mandatory', paddingTop: '0', paddingBottom: '0',
    });
    track.tabIndex = 0;
    slides.forEach((s) => {
      Object.assign(s.style, {
        flex: '0 0 auto', scrollSnapAlign: 'center', borderRadius: '28px',
        overflow: 'hidden', cursor: 'pointer',
      });
    });

    const layout = () => {
      // Desktop: 90px side margins with the card capped at 1260. Phones: 24px
      // margins with the card 20px short of the content box so the next card peeks.
      const pad = Math.max(24, (root.clientWidth - 1260) / 2);
      track.style.paddingLeft = track.style.paddingRight = pad + 'px';
      const content = root.clientWidth - pad * 2;
      const w = content < 1260 ? content - 20 : 1260;
      slides.forEach((s) => { s.style.width = Math.max(200, w) + 'px'; });
    };
    layout();

    // Controls: grey pill with dots, round play button, polite live region.
    const controls = document.createElement('div');
    Object.assign(controls.style, { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '20px' });
    const pill = document.createElement('div');
    pill.setAttribute('role', 'group');
    pill.setAttribute('aria-label', 'Slides');
    Object.assign(pill.style, {
      display: 'flex', alignItems: 'center', gap: DOT_GAP + 'px', height: PILL_H + 'px',
      padding: '0 20px', borderRadius: '999px', background: 'var(--showcase-pill, #e8e8ed)',
      transition: 'background-color ' + TINT,
    });
    const dots = slides.map((s, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.setAttribute('aria-label', 'Item ' + (i + 1) + ' of ' + n);
      Object.assign(d.style, {
        position: 'relative', overflow: 'hidden', border: '0', padding: '0', cursor: 'pointer',
        width: DOT_REST + 'px', height: DOT_REST + 'px', borderRadius: '999px',
        background: 'var(--showcase-dot, rgba(0,0,0,.35))',
        transition: 'width 300ms ease-out, background-color ' + TINT,
      });
      const fill = document.createElement('span');
      fill.setAttribute('aria-hidden', 'true');
      Object.assign(fill.style, {
        position: 'absolute', left: '0', top: '0', width: '100%', height: '100%',
        borderRadius: 'inherit', background: 'var(--showcase-fill, #29292a)',
        transform: 'scaleX(0)', transformOrigin: '0 50%',
      });
      d.appendChild(fill);
      d.addEventListener('click', () => userGo(i));
      pill.appendChild(d);
      return { btn: d, fill };
    });
    const playBtn = document.createElement('button');
    playBtn.type = 'button';
    Object.assign(playBtn.style, {
      border: '0', padding: '0', cursor: 'pointer', color: 'inherit',
      width: BTN + 'px', height: BTN + 'px', borderRadius: '50%',
      background: 'var(--showcase-pill, #e8e8ed)', display: 'grid', placeItems: 'center',
      transition: 'background-color ' + TINT + ', filter ' + TINT,
    });
    const icon = document.createElement('span');
    Object.assign(icon.style, { display: 'grid', placeItems: 'center', fill: 'currentColor' });
    icon.innerHTML = ICON_PAUSE;
    playBtn.appendChild(icon);
    const live = document.createElement('div');
    live.setAttribute('aria-live', 'polite');
    Object.assign(live.style, {
      position: 'absolute', width: '1px', height: '1px', overflow: 'hidden',
      clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap',
    });
    controls.append(pill, playBtn);
    root.append(controls, live);

    // Tint only, never a move or shrink.
    [[pill, 0.96], [playBtn, 0.96]].forEach(([el]) => {
      el.addEventListener('pointerenter', () => { el.style.filter = 'brightness(.96)'; });
      el.addEventListener('pointerleave', () => { el.style.filter = ''; });
    });
    playBtn.addEventListener('pointerdown', () => { playBtn.style.filter = 'brightness(.9)'; });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((e) => playBtn.addEventListener(e, () => { playBtn.style.filter = ''; }));

    const titleOf = (i) => slides[i].dataset.title ||
      (slides[i].querySelector('h1, h2, h3') || {}).textContent?.trim().slice(0, 80) || ('Item ' + (i + 1));

    let index = 0, wantPlay = (opts.autoplay ?? true) && !Motion.reduced(), autoDone = false;
    let hover = false, focus = false, held = false, seen = false, shown = !document.hidden;
    let timer = 0, raf = 0, start = 0, remaining = interval, flight = null, moving = false;
    const blocked = () => hover || focus || held || !seen || !shown;

    const paint = () => {
      const playing = wantPlay && !autoDone;
      playBtn.setAttribute('aria-pressed', String(playing));
      playBtn.setAttribute('aria-label', (playing ? 'Pause' : 'Play') + ' gallery');
      Motion.blurSwap(icon, () => { icon.innerHTML = playing ? ICON_PAUSE : ICON_PLAY; });
    };

    const mark = () => {
      dots.forEach(({ btn, fill }, i) => {
        const on = i === index;
        btn.style.width = (on ? barW() : DOT_REST) + 'px';
        if (on) btn.setAttribute('aria-current', 'true'); else btn.removeAttribute('aria-current');
        if (!on) fill.style.transform = 'scaleX(0)';
      });
    };

    const centre = (i) => {
      const t = track.getBoundingClientRect(), r = slides[i].getBoundingClientRect();
      return track.scrollLeft + (r.left + r.width / 2) - (t.left + t.width / 2);
    };

    function go(i) {
      index = Math.min(n - 1, Math.max(0, i));
      const to = centre(index);
      const from = track.scrollLeft;
      moving = true;
      if (flight) flight.stop?.();
      if (Motion.reduced() || Math.abs(to - from) < 1) {
        // Reduce Motion jumps straight to the end state.
        const prev = track.style.scrollSnapType;
        track.style.scrollSnapType = 'none';
        track.scrollLeft = to;
        track.style.scrollSnapType = prev;
        moving = false;
      } else {
        const prev = track.style.scrollSnapType;
        track.style.scrollSnapType = 'none';
        flight = Motion.spring({ x: from }, { x: to }, ({ x }) => { track.scrollLeft = x; }, 'gentle');
        flight.then(() => { track.style.scrollSnapType = prev || ''; flight = null; moving = false; });
      }
      mark();
      live.textContent = titleOf(index);
    }

    const paintFill = (p) => { dots[index].fill.style.transform = 'scaleX(' + clamp01(p) + ')'; };
    const hold = () => {
      if (timer) { remaining = Math.max(0, remaining - (performance.now() - start)); clearTimeout(timer); timer = 0; }
      cancelAnimationFrame(raf); raf = 0;
    };
    const schedule = () => {
      clearTimeout(timer); timer = 0; cancelAnimationFrame(raf); raf = 0;
      if (!wantPlay || autoDone || blocked() || Motion.reduced()) return;
      start = performance.now();
      const tick = () => {
        if (!wantPlay || autoDone || blocked() || Motion.reduced()) return;
        const p = 1 - Math.max(0, remaining - (performance.now() - start)) / interval;
        paintFill(p);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      timer = setTimeout(() => {
        if (index >= n - 1) {
          // One full pass ends autoplay for good; the button offers a replay.
          autoDone = true; wantPlay = false; paintFill(0); paint();
          return;
        }
        remaining = interval;
        go(index + 1);
        schedule();
      }, remaining);
    };

    function userGo(i) {
      autoDone = false;
      remaining = interval;
      go(i);
      schedule();
      if (!wantPlay) { wantPlay = true; paint(); schedule(); }
    }
    const toggle = () => {
      if (wantPlay && !autoDone) { wantPlay = false; hold(); paint(); return; }
      // Replay starts over from the first slide.
      if (autoDone) { autoDone = false; remaining = interval; go(0); }
      wantPlay = true; paint(); schedule();
    };
    playBtn.addEventListener('click', toggle);

    // Any direct touch of the row hands control to the visitor for this stop:
    // adopt the nearest slide, then the timer carries on from it.
    let settle = 0;
    const onScroll = () => {
      if (moving) return;
      clearTimeout(settle);
      settle = setTimeout(() => {
        const t = track.getBoundingClientRect();
        let best = 0, bd = Infinity;
        slides.forEach((s, i) => {
          const r = s.getBoundingClientRect();
          const d = Math.abs(r.left + r.width / 2 - (t.left + t.width / 2));
          if (d < bd) { bd = d; best = i; }
        });
        if (best !== index) { index = best; remaining = interval; mark(); live.textContent = titleOf(index); }
        paintFill(0);
        schedule();
      }, 140);
    };
    track.addEventListener('scroll', onScroll, { passive: true });

    slides.forEach((s, i) => s.addEventListener('click', (e) => {
      if (e.target.closest('a, button')) return;
      if (i !== index) userGo(i);
    }));

    const onKey = (e) => {
      let next = -1;
      if (e.key === 'ArrowRight') next = index + 1;
      else if (e.key === 'ArrowLeft') next = index - 1;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = n - 1;
      else return;
      e.preventDefault();
      userGo(Math.min(n - 1, Math.max(0, next)));
      if (!wantPlay) { wantPlay = true; paint(); schedule(); }
    };
    root.addEventListener('keydown', onKey);

    // Hover, focus and a press hold the clock; it resumes where it left off.
    const onEnter = () => { hover = true; hold(); };
    const onLeave = () => { hover = false; schedule(); };
    const onFocus = () => { focus = true; hold(); };
    const onBlur = () => { focus = false; schedule(); };
    const onDown = () => { held = true; hold(); };
    const onUp = () => { held = false; schedule(); };
    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('focusin', onFocus);
    root.addEventListener('focusout', onBlur);
    root.addEventListener('pointerdown', onDown);
    addEventListener('pointerup', onUp);
    addEventListener('pointercancel', onUp);
    const onVis = () => { shown = !document.hidden; if (shown) schedule(); else hold(); };
    document.addEventListener('visibilitychange', onVis);
    const io = new IntersectionObserver((es) => {
      seen = es[0].isIntersecting;
      if (!seen) hold(); else schedule();
    }, { threshold: 0.35 });
    io.observe(root);
    const onResize = () => { layout(); go(index); };
    addEventListener('resize', onResize);

    mark();
    track.scrollLeft = centre(0); // first slide starts centred, no animation
    paint();
    schedule();

    return {
      go(i) { userGo(i); },
      play() { if (Motion.reduced()) return; if (autoDone) { autoDone = false; remaining = interval; go(0); } wantPlay = true; paint(); schedule(); },
      pause() { wantPlay = false; hold(); paint(); },
      destroy() {
        hold(); io.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        removeEventListener('pointerup', onUp);
        removeEventListener('pointercancel', onUp);
        removeEventListener('resize', onResize);
        root.removeEventListener('pointerenter', onEnter);
        root.removeEventListener('pointerleave', onLeave);
        root.removeEventListener('focusin', onFocus);
        root.removeEventListener('focusout', onBlur);
        root.removeEventListener('pointerdown', onDown);
        track.removeEventListener('scroll', onScroll);
        root.removeEventListener('keydown', onKey);
        clearTimeout(settle);
        flight?.stop?.();
        controls.remove();
        live.remove();
      },
    };
  }

  Motion.showcase = showcase;
})(window);
