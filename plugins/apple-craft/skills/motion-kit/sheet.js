/* motion-kit sheet: a product switcher sheet that opens from the local product nav.
   Loads after motion.js and adds Motion.sheet(root, { trigger }).
   The sheet rises about 24px and fades in on the named 'smooth' preset while the
   backdrop fades its dim and blur in with CSS (~320ms); closing uses 'snappy'.
   Without JS the trigger is a plain link to the lineup, so it still goes somewhere.
   Every open and close stops any running animation first and bumps a generation
   counter, so the latest input always wins and rapid clicks cannot strand the UI
   half visible, keep the scroll lock, or lose focus. */
(function (global) {
  function sheet(root, options) {
    const M = global.Motion;
    const o = options || {};
    const reduced = () => M.reduced();
    const abort = new AbortController();
    const on = (el, ev, fn, opts) => { if (el) el.addEventListener(ev, fn, Object.assign({ signal: abort.signal }, opts || {})); };

    const trigger = o.trigger || document.querySelector('[data-sheet-trigger]');
    const backdrop = root.querySelector('[data-sheet-backdrop]');
    const panel = root.querySelector('[data-sheet]');
    const closeBtn = root.querySelector('[data-sheet-close]');
    const scroller = root.querySelector('[data-sheet-tiles]');
    const tilesWrap = root.querySelector('[data-tiles-wrap]');
    const prevBtn = root.querySelector('[data-tiles-prev]');
    const nextBtn = root.querySelector('[data-tiles-next]');
    const ovBtn = root.querySelector('[data-overview-btn]');
    const ovGrid = root.querySelector('[data-overview-grid]');

    let gen = 0, ovGen = 0;
    let isOpen = false, ovOpen = false;
    let prevOverflow = '';
    let sheetAnim = null, ovAnim = null;
    // Current sheet position, so a close mid open continues from there, not from a jump.
    let cur = { y: 0, o: 1 };
    const stopSheet = () => { try { sheetAnim && sheetAnim.stop(); } catch (e) {} sheetAnim = null; };
    const stopOv = () => { try { ovAnim && ovAnim.stop(); } catch (e) {} ovAnim = null; };

    function setInteractive(on) {
      [root, backdrop, panel].forEach((el) => { if (el) el.style.pointerEvents = on ? '' : 'none'; });
    }

    // The page behind is inert while open: no focus, clicks or screen reader reach it.
    const behind = () => [...document.body.children].filter((el) => !el.contains(root) && el.tagName !== 'SCRIPT');
    function setInert(on) { behind().forEach((el) => { el.inert = on; }); }

    function open() {
      const my = ++gen;
      stopSheet();
      // Reopening mid close carries on from where the sheet is, instead of jumping back.
      const from = panel.hidden ? { y: 24, o: 0 } : { y: cur.y, o: cur.o };
      cur = from;
      setInteractive(true);
      setInert(true);
      panel.hidden = false;
      if (backdrop) backdrop.hidden = false;
      if (!isOpen) { prevOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; }
      isOpen = true;
      syncTiles();
      if (backdrop) { void backdrop.offsetWidth; backdrop.classList.add('show'); }
      if (reduced()) {
        panel.style.opacity = '';
        panel.style.transform = '';
        if (my === gen && closeBtn) closeBtn.focus({ preventScroll: true });
        return Promise.resolve();
      }
      sheetAnim = M.spring(from, { y: 0, o: 1 }, (v) => {
        if (my !== gen) return;
        cur = { y: v.y, o: v.o };
        panel.style.opacity = M.clamp(v.o);
        panel.style.transform = 'translateY(' + v.y + 'px)';
      }, 'smooth');
      sheetAnim.then(() => {
        if (my !== gen) return;
        panel.style.opacity = '';
        panel.style.transform = '';
        sheetAnim = null;
      });
      requestAnimationFrame(() => { if (my === gen && isOpen && closeBtn) closeBtn.focus({ preventScroll: true }); });
      return sheetAnim;
    }

    function close(returnFocus) {
      if (!isOpen && panel.hidden) return Promise.resolve();
      const my = ++gen;
      stopSheet();
      isOpen = false;
      // A closing sheet must not catch clicks: the next click goes to whatever is underneath,
      // including the trigger, so reopening during the fade works.
      setInteractive(false);
      setInert(false);
      if (backdrop) backdrop.classList.remove('show');
      const hide = () => {
        if (my !== gen) return;
        panel.hidden = true;
        panel.style.opacity = '';
        panel.style.transform = '';
        cur = { y: 0, o: 1 };
        if (backdrop) backdrop.hidden = true;
        document.body.style.overflow = prevOverflow;
        setInteractive(true);
      };
      if (returnFocus !== false) {
        requestAnimationFrame(() => { if (my === gen && trigger) trigger.focus({ preventScroll: true }); });
      }
      if (reduced()) {
        hide();
        return Promise.resolve();
      }
      sheetAnim = M.spring({ y: cur.y, o: cur.o }, { y: 16, o: 0 }, (v) => {
        if (my !== gen) return;
        cur = { y: v.y, o: v.o };
        panel.style.opacity = M.clamp(v.o);
        panel.style.transform = 'translateY(' + v.y + 'px)';
      }, 'snappy');
      sheetAnim.then(() => { if (my === gen) { sheetAnim = null; hide(); } });
      // The backdrop fades out with CSS; hide it once that fade has finished.
      setTimeout(hide, 340);
      return sheetAnim;
    }

    // The disclosure animates real height, never a scale, with the links fading in.
    function setOverview(show) {
      if (!ovBtn || !ovGrid) return;
      const my = ++ovGen;
      stopOv();
      ovOpen = show;
      ovBtn.setAttribute('aria-expanded', String(show));
      if (reduced()) {
        ovGrid.hidden = !show;
        ovGrid.style.height = '';
        ovGrid.classList.toggle('in', show);
        return;
      }
      const links = () => [...ovGrid.querySelectorAll('a')];
      if (show) {
        ovGrid.hidden = false;
        ovGrid.classList.remove('in');
        links().forEach((a) => { a.style.opacity = 0; });
        const target = ovGrid.scrollHeight || 0;
        ovGrid.style.height = '0px';
        ovAnim = M.spring({ h: 0 }, { h: target }, (v) => {
          if (my !== ovGen) return;
          ovGrid.style.height = Math.max(0, v.h) + 'px';
        }, 'snappy').then(() => {
          if (my !== ovGen) return;
          ovGrid.style.height = '';
          ovGrid.classList.add('in');
          links().forEach((a) => { a.style.opacity = ''; });
          ovAnim = null;
        });
      } else {
        const from = ovGrid.offsetHeight || 0;
        ovGrid.classList.remove('in');
        ovAnim = M.spring({ h: from }, { h: 0 }, (v) => {
          if (my !== ovGen) return;
          ovGrid.style.height = Math.max(0, v.h) + 'px';
        }, 'snappy').then(() => {
          if (my !== ovGen) return;
          ovGrid.hidden = true;
          ovGrid.style.height = '';
          ovAnim = null;
        });
      }
    }

    function syncTiles() {
      if (!scroller || !tilesWrap) return;
      const max = scroller.scrollWidth - scroller.clientWidth;
      tilesWrap.classList.toggle('has-prev', scroller.scrollLeft > 8);
      tilesWrap.classList.toggle('has-next', max > 8 && scroller.scrollLeft < max - 8);
    }
    function pageTiles(dir) {
      if (!scroller) return;
      scroller.scrollBy({ left: dir * scroller.clientWidth * 0.9, behavior: reduced() ? 'auto' : 'smooth' });
    }

    on(trigger, 'click', (e) => { e.preventDefault(); if (isOpen) close(true); else open(); });
    on(closeBtn, 'click', () => close(true));
    on(backdrop, 'click', (e) => { if (e.target === backdrop) close(true); });
    on(ovBtn, 'click', () => setOverview(!ovOpen));
    on(prevBtn, 'click', () => pageTiles(-1));
    on(nextBtn, 'click', () => pageTiles(1));
    on(scroller, 'scroll', syncTiles, { passive: true });
    on(window, 'resize', syncTiles);
    on(scroller, 'keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const tiles = [...scroller.querySelectorAll('a, button')];
      const i = tiles.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      const n = e.key === 'ArrowRight' ? Math.min(tiles.length - 1, i + 1) : Math.max(0, i - 1);
      tiles[n].focus({ preventScroll: true });
      tiles[n].scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' });
    });
    // Focus stays inside while open; Escape closes and returns focus to the trigger.
    on(panel, 'keydown', (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') { e.preventDefault(); close(true); return; }
      if (e.key !== 'Tab') return;
      const f = [...panel.querySelectorAll('a[href], button:not([disabled])')]
        .filter((el) => el.getBoundingClientRect().width > 0);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    // Safari's Tab skips links by default, so the first and last checks above can miss.
    // Catch focus anywhere outside the open sheet and bring it back inside.
    on(document, 'focusin', (e) => {
      if (!isOpen || panel.contains(e.target)) return;
      const f = [...panel.querySelectorAll('button:not([disabled]), a[href]')].filter((el) => el.getBoundingClientRect().width > 0);
      if (f.length) f[0].focus({ preventScroll: true });
    });
    on(document, 'keydown', (e) => { if (isOpen && e.key === 'Escape' && !panel.contains(document.activeElement)) { e.preventDefault(); close(true); } });

    return {
      open,
      close: () => close(true),
      destroy: () => {
        abort.abort();
        gen++;
        ovGen++;
        stopSheet();
        stopOv();
        document.body.style.overflow = prevOverflow;
        setInert(false);
        if (backdrop) { backdrop.classList.remove('show'); backdrop.hidden = true; }
        if (panel) { panel.hidden = true; panel.style.opacity = ''; panel.style.transform = ''; }
        if (ovGrid) { ovGrid.hidden = true; ovGrid.style.height = ''; ovGrid.classList.remove('in'); }
        if (ovBtn) ovBtn.setAttribute('aria-expanded', 'false');
        isOpen = false;
        ovOpen = false;
      },
    };
  }

  global.Motion.sheet = sheet;
})(window);
