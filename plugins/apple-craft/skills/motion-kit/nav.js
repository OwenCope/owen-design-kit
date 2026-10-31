/* motion-kit nav: a global navigation bar with mega menu flyouts.
   Loads after motion.js and adds Motion.nav(root, options).
   Markup contract: top items carry data-menu ids, panels carry matching
   data-panel ids. Without JS the top links are plain links and panels are
   plain page sections, so the nav still works.
   Heights spring with the named 'island' preset. Stagger gaps are picked
   per open, never retuned per page. */
(function (global) {
  function nav(root, options) {
    const M = global.Motion;
    const o = Object.assign({ intentDelay: 150, closeDelay: 350, tone: 'auto', hideOnScroll: false }, options || {});
    const reduced = () => M.reduced();
    const abort = new AbortController();
    const on = (el, ev, fn, opts) => el.addEventListener(ev, fn, Object.assign({ signal: abort.signal }, opts || {}));
    const phone = () => matchMedia('(max-width: 833px)').matches;

    const flyout = root.querySelector('[data-flyout]');
    const flyoutInner = root.querySelector('[data-flyout-inner]') || flyout;
    const dim = root.querySelector('[data-dim]');
    const menuBtn = root.querySelector('[data-menu-btn]');
    const searchBtn = root.querySelector('[data-search-btn]');
    const items = [...root.querySelectorAll('[data-menu]')].filter((el) => !el.hasAttribute('data-panel'));
    const panelFor = (id) => root.querySelector('[data-panel="' + id + '"]');
    const triggerFor = (id) => items.find((el) => el.getAttribute('data-menu') === id);

    let current = null;
    let opener = null;
    let intentT = 0, switchT = 0, closeT = 0, searchT = 0;
    let gen = 0; // height springs check this so a newer open wins over an older one
    let lastX = 0, lastY = 0, inPanel = false;
    const clearTimers = () => { clearTimeout(intentT); clearTimeout(switchT); clearTimeout(closeT); clearTimeout(searchT); };

    const colsOf = (panel) => {
      const cols = panel.querySelectorAll('[data-stagger]');
      return cols.length ? [...cols] : [...panel.children];
    };

    // A pointer travelling diagonally down toward the open panel must not
    // switch menus on its way across. Entering the panel cancels the switch.
    function open(id, focusFirst) {
      const panel = panelFor(id);
      if (!panel) return;
      clearTimers();
      if (id === 'search' && typeof renderSearch === 'function') renderSearch(searchInput ? searchInput.value : '', false);
      const wasOpen = current !== null;
      const prev = current;
      current = id;
      opener = opener || document.activeElement;
      root.classList.add('is-open');
      root.dataset.open = id;
      items.forEach((item) => {
        const chev = item.querySelector('[data-chev]');
        if (chev) chev.setAttribute('aria-expanded', String(item.getAttribute('data-menu') === id));
      });
      if (dim) { dim.hidden = false; requestAnimationFrame(() => dim.classList.add('show')); }
      const my = ++gen;
      const show = () => {
        if (my !== gen) return;
        [...root.querySelectorAll('[data-panel]')].forEach((p) => { p.hidden = p !== panel; });
        // Focus only once the panel is visible; a hidden link cannot take focus.
        if (focusFirst) requestAnimationFrame(() => { const first = [...panel.querySelectorAll('a, button, input')].find((el) => el.offsetParent !== null); if (first && my === gen) first.focus({ preventScroll: true }); });
        // Start a first open from zero; a hidden flyout would otherwise report its full height.
        if (!wasOpen && !reduced()) flyout.style.height = '0px';
        flyout.hidden = false;
        const target = panel.offsetHeight || panel.scrollHeight;
        const from = flyout.offsetHeight || 0;
        if (reduced()) {
          flyout.style.height = '';
          M.stagger(colsOf(panel), { show: true, gap: 0 });
          return;
        }
        if (!wasOpen) {
          // First open: shape grows, then content arrives a beat later.
          flyoutInner.style.opacity = 1;
          flyoutInner.style.filter = '';
          M.spring({ h: from }, { h: target }, (v) => {
            if (my !== gen) return;
            flyout.style.height = Math.max(0, v.h) + 'px';
          }, 'island').then(() => { if (my === gen) flyout.style.height = 'auto'; });
          M.stagger(colsOf(panel), { show: true, gap: 40 });
        } else if (prev !== id) {
          // Moving between menus: one surface morphs, contents crossfade.
          M.blurSwap(flyoutInner, () => {
            if (my !== gen) return;
            [...root.querySelectorAll('[data-panel]')].forEach((p) => { p.hidden = p !== panel; });
          });
          const startH = flyout.offsetHeight || from;
          M.spring({ h: startH }, { h: target }, (v) => {
            if (my !== gen) return;
            flyout.style.height = Math.max(0, v.h) + 'px';
          }, 'island').then(() => { if (my === gen) flyout.style.height = 'auto'; });
        }
      };
      if (!wasOpen && !reduced()) {
        // Let the dim start first so the panel lands on an already quiet page.
        requestAnimationFrame(show);
      } else {
        show();
      }
    }

    function close(returnFocus) {
      clearTimers();
      if (current === null && !root.classList.contains('is-open')) return;
      const my = ++gen;
      const id = current;
      current = null;
      delete root.dataset.open;
      root.classList.remove('is-open');
      items.forEach((item) => {
        const chev = item.querySelector('[data-chev]');
        if (chev) chev.setAttribute('aria-expanded', 'false');
      });
      // The dim fades with the fold rather than after it.
      if (dim) dim.classList.remove('show');
      const hide = () => {
        if (my !== gen) return;
        flyout.hidden = true;
        flyout.style.height = '';
        if (dim) dim.hidden = true;
      };
      if (reduced() || flyout.hidden) {
        hide();
      } else {
        const from = flyout.offsetHeight || 0;
        M.spring({ h: from }, { h: 0 }, (v) => {
          if (my !== gen) return;
          flyout.style.height = Math.max(0, v.h) + 'px';
        }, 'island').then(hide);
      }
      if (returnFocus && opener && document.contains(opener)) opener.focus({ preventScroll: true });
      opener = null;
      void id;
    }

    // Hover: intent delay to open, grace delay to switch, long delay to close.
    items.forEach((item) => {
      const id = item.getAttribute('data-menu');
      on(item, 'pointerenter', (e) => {
        if (phone()) return;
        lastX = e.clientX; lastY = e.clientY;
        if (id === current) { clearTimers(); return; }
        clearTimers();
        if (!current) {
          intentT = setTimeout(() => open(id), o.intentDelay);
        } else if (inPanel) {
          open(id); // pointer came from the panel, so this is a real choice
        } else {
          switchT = setTimeout(() => open(id), 150);
        }
      });
    });
    if (flyout) {
      on(flyout, 'pointerenter', () => { inPanel = true; clearTimers(); });
      on(flyout, 'pointerleave', () => { inPanel = false; });
    }
    on(root, 'pointermove', (e) => { lastX = e.clientX; lastY = e.clientY; });
    on(root, 'pointerleave', () => {
      if (phone()) return;
      clearTimers();
      closeT = setTimeout(() => close(false), o.closeDelay);
    });
    if (dim) on(dim, 'click', () => close(true));

    // Keyboard: chevrons open, arrows travel the bar, Escape lands back home.
    const topLinks = () => items.map((item) => item.querySelector('a')).filter(Boolean);
    items.forEach((item) => {
      let chev = item.querySelector('[data-chev]');
      if (!chev) {
        // The button only exists for keyboard and touch users. Mouse users
        // hover the link itself, so it stays hidden until focused.
        chev = document.createElement('button');
        chev.type = 'button';
        chev.className = 'mk-chev';
        chev.setAttribute('data-chev', '');
        chev.innerHTML = '<svg viewBox="0 0 9 6" width="9" height="6" aria-hidden="true"><path d="M1 1.25 4.5 4.75 8 1.25" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        item.appendChild(chev);
      }
      const id = item.getAttribute('data-menu');
      const panel = panelFor(id);
      if (panel && !panel.id) panel.id = 'mk-panel-' + id;
      chev.setAttribute('aria-expanded', 'false');
      if (panel) chev.setAttribute('aria-controls', panel.id);
      chev.setAttribute('aria-label', (item.querySelector('a')?.textContent || id).trim() + ' menu');
      on(chev, 'click', () => { if (phone()) { if (sheetOpen) showSub(id, chev); return; } if (current === id) close(true); else { opener = chev; open(id); } });
      on(chev, 'keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opener = chev; open(id, true); }
      });
      const link = item.querySelector('a');
      if (link) on(link, 'keydown', (e) => {
        const links = topLinks();
        const i = links.indexOf(link);
        if (e.key === 'ArrowRight') { e.preventDefault(); links[(i + 1) % links.length].focus(); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); links[(i - 1 + links.length) % links.length].focus(); }
        else if (e.key === 'ArrowDown' && panel) { e.preventDefault(); opener = link; open(id, true); }
      });
    });
    // On the document, so Escape still works after focus has left the nav (for example onto a hidden back button).
    on(document, 'keydown', (e) => {
      if (e.key === 'Escape') {
        if (root.classList.contains('is-menu-open')) { closeSheet(true); return; }
        if (current !== null) { e.preventDefault(); close(true); }
      }
    });

    // Search lives in the same flyout surface, with the input focused.
    if (searchBtn) on(searchBtn, 'click', () => {
      if (phone()) { openSheet(); showSub('search', searchBtn); return; }
      if (current === 'search') close(true);
      else { opener = searchBtn; open('search', true); }
    });

    // Search results filter the menu links as the visitor types.
    const searchPanel = panelFor('search');
    const searchInput = searchPanel ? searchPanel.querySelector('input') : null;
    const searchBox = searchPanel ? searchPanel.querySelector('[data-search-results]') : null;
    const searchIndex = [...root.querySelectorAll('[data-panel]:not([data-panel="search"]) a')].map((a) => ({
      href: a.getAttribute('href') || '#',
      title: (a.querySelector('b') ? a.querySelector('b').textContent : a.textContent).trim(),
      desc: a.querySelector('span') ? a.querySelector('span').textContent.trim() : '',
    })).filter((r, i, arr) => r.title && arr.findIndex((x) => x.href === r.href && x.title === r.title) === i);
    let quickLinks = ['#features', '#timer', '#pair', '#contact']
      .map((h) => searchIndex.find((r) => r.href === h)).filter(Boolean);
    if (!quickLinks.length) quickLinks = searchIndex.slice(0, 4);
    let searchGen = 0;
    let activeResult = -1;
    const escMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => escMap[c]);
    function mark(text, q) {
      const needle = q.trim();
      if (!needle) return esc(text);
      const i = text.toLowerCase().indexOf(needle.toLowerCase());
      if (i < 0) return esc(text);
      return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + needle.length)) + '</mark>' + esc(text.slice(i + needle.length));
    }
    function searchItem(r, q) {
      const desc = r.desc ? '<span class="mk-search-desc">' + mark(r.desc, q) + '</span>' : '';
      return '<li><a class="mk-search-item" href="' + esc(r.href) + '"><span class="mk-search-title">' + mark(r.title, q) + '</span>' + desc + '</a></li>';
    }
    function syncSearchHeight() {
      if (reduced() || phone() || current !== 'search' || !flyout || flyout.hidden) return;
      const my = ++searchGen;
      const from = flyout.offsetHeight;
      flyout.style.height = from + 'px';
      requestAnimationFrame(() => {
        if (my !== searchGen || current !== 'search') return;
        const target = searchPanel.offsetHeight || searchPanel.scrollHeight;
        if (!target || target === from) { flyout.style.height = 'auto'; return; }
        M.spring({ h: from }, { h: target }, (v) => {
          if (my !== searchGen || current !== 'search') return;
          flyout.style.height = Math.max(0, v.h) + 'px';
        }, 'island').then(() => { if (my === searchGen && current === 'search') flyout.style.height = 'auto'; });
      });
    }
    function renderSearch(q, sync) {
      if (!searchPanel || !searchBox) return;
      const query = String(q == null ? '' : q).trim();
      activeResult = -1;
      if (!query) {
        searchBox.innerHTML = '<p class="mk-search-label">Quick links</p><ul>' +
          quickLinks.map((r) => searchItem(r, '')).join('') + '</ul>';
      } else {
        const hits = searchIndex.filter((r) => (r.title + ' ' + r.desc).toLowerCase().includes(query.toLowerCase())).slice(0, 6);
        if (!hits.length) {
          searchBox.innerHTML = '<div class="mk-search-empty"><p>No results for &ldquo;' + esc(query) + '&rdquo;</p>' +
            '<p>Try a different term or visit <a href="#contact">Support</a>.</p></div>';
        } else {
          searchBox.innerHTML = '<ul>' + hits.map((r) => searchItem(r, query)).join('') + '</ul>';
        }
      }
      if (sync !== false) syncSearchHeight();
    }
    function focusResult(dir) {
      if (!searchBox) return;
      const links = [...searchBox.querySelectorAll('.mk-search-item')];
      if (!links.length) return;
      const at = links.indexOf(document.activeElement);
      const base = at < 0 ? (dir > 0 ? -1 : 0) : at;
      const next = (base + dir + links.length) % links.length;
      activeResult = next;
      links[next].focus();
    }
    if (searchInput && searchBox) {
      renderSearch('', false);
      on(searchInput, 'input', () => {
        clearTimeout(searchT);
        searchT = setTimeout(() => renderSearch(searchInput.value), 120);
      });
      on(searchInput, 'keydown', (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          if (searchInput.value) { searchInput.value = ''; renderSearch(''); }
          else close(true);
          return;
        }
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          focusResult(e.key === 'ArrowDown' ? 1 : -1);
        } else if (e.key === 'Enter' && activeResult >= 0) {
          const links = [...searchBox.querySelectorAll('.mk-search-item')];
          if (links[activeResult]) { e.preventDefault(); links[activeResult].click(); }
        }
      });
      on(searchBox, 'keydown', (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          searchInput.value = '';
          renderSearch('');
          searchInput.focus();
          return;
        }
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          focusResult(e.key === 'ArrowDown' ? 1 : -1);
        }
      });
    }

    // Tone: follow the section under the bar, crossfading on the hover token.
    // rootMargin cannot use calc(), so read the section under the bar's midline on scroll instead.
    let toneSections = [];
    const updateTone = () => {
      const mid = root.getBoundingClientRect().height / 2 || 22;
      const hit = toneSections.find((s) => { const r = s.getBoundingClientRect(); return r.top <= mid && r.bottom > mid; });
      if (hit) root.dataset.tone = hit.getAttribute('data-nav-tone');
    };
    if (o.tone === 'auto') {
      toneSections = [...document.querySelectorAll('[data-nav-tone]')];
      if (toneSections.length) updateTone();
    } else if (o.tone) {
      root.dataset.tone = o.tone;
    }

    // Glass after scrolling past the top. Optional hide on scroll down.
    // The bar returns on any upward move and stays put while a menu is open.
    let lastYpos = scrollY;
    const onScroll = () => {
      const y = scrollY;
      root.classList.toggle('is-scrolled', y > 8);
      if (!o.hideOnScroll || reduced()) {
        root.classList.remove('is-hidden');
      } else if (current !== null || root.classList.contains('is-menu-open')) {
        root.classList.remove('is-hidden');
      } else {
        const dy = y - lastYpos;
        if (y > 72 && dy > 0) root.classList.add('is-hidden');
        else if (dy < 0 || y <= 72) root.classList.remove('is-hidden');
      }
      lastYpos = y;
      if (toneSections.length) updateTone();
    };
    on(window, 'scroll', onScroll, { passive: true });
    onScroll();

    // Phones: full screen sheet, rows stagger in, submenus slide across.
    let sheetOpen = false;
    let sheetOpener = null;
    const sheetPanels = () => [...root.querySelectorAll('[data-panel]')];
    function openSheet() {
      if (sheetOpen) return;
      sheetOpen = true;
      sheetOpener = document.activeElement;
      clearTimers();
      close(false);
      root.classList.add('is-menu-open');
      root.classList.remove('is-sub');
      if (flyout) { flyout.hidden = false; flyout.style.height = ''; }
      document.body.style.overflow = 'hidden';
      if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
      sheetPanels().forEach((p) => { p.hidden = true; });
      // Every row staggers, not only the ones with submenus.
      const rows = [...root.querySelectorAll('.mk-links > li')];
      const all = rows.length ? rows : items;
      if (!reduced()) M.stagger(all, { show: true, gap: 30 });
      else all.forEach((el) => { el.style.opacity = ''; el.style.transform = ''; });
    }
    function closeSheet(returnFocus) {
      if (!sheetOpen) return;
      sheetOpen = false;
      root.classList.remove('is-menu-open', 'is-sub');
      document.body.style.overflow = '';
      if (flyout) flyout.hidden = true;
      if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
      sheetPanels().forEach((p) => { p.hidden = true; });
      if (returnFocus && sheetOpener && document.contains(sheetOpener)) sheetOpener.focus({ preventScroll: true });
      sheetOpener = null;
    }
    function showSub(id, fromEl) {
      const panel = panelFor(id);
      if (!panel) return;
      if (id === 'search') renderSearch(searchInput ? searchInput.value : '', false);
      sheetPanels().forEach((p) => { p.hidden = p !== panel; });
      root.classList.add('is-sub');
      panel.hidden = false;
      // The submenu slides in from the trailing edge over the row list, like a pushed view.
      if (!reduced()) {
        // Move the panel, not the sheet: the sheet stays opaque so the page never shows through.
        M.spring({ x: 48, o: 0 }, { x: 0, o: 1 }, ({ x, o }) => {
          panel.style.transform = `translateX(${x}px)`; panel.style.opacity = Math.min(1, Math.max(0, o));
        }, 'island').then(() => { panel.style.transform = ''; panel.style.opacity = ''; });
        M.stagger([...panel.querySelectorAll('[data-back], a')], { show: true, gap: 24 });
      }
      const target = panel.querySelector('input, a, button');
      if (target && fromEl) target.focus({ preventScroll: true });
    }
    if (menuBtn) on(menuBtn, 'click', () => { if (sheetOpen) closeSheet(true); else openSheet(); });
    items.forEach((item) => {
      const link = item.querySelector('a');
      if (!link) return;
      on(link, 'click', (e) => {
        if (!phone() || !sheetOpen) return;
        const id = item.getAttribute('data-menu');
        if (panelFor(id)) { e.preventDefault(); showSub(id, link); }
        else closeSheet(false);
      });
    });
    root.querySelectorAll('[data-back]').forEach((back) => {
      on(back, 'click', () => {
        const panel = back.closest('[data-panel]');
        const done = () => {
          root.classList.remove('is-sub');
          sheetPanels().forEach((p) => { p.hidden = true; p.style.transform = ''; p.style.opacity = ''; });
          if (!reduced()) M.stagger([...root.querySelectorAll('.mk-links > li')], { show: true, gap: 20 });
        };
        if (reduced() || !panel) return done();
        // Back pops the submenu out the way it came in, then the rows return.
        M.spring({ x: 0, o: 1 }, { x: 48, o: 0 }, ({ x, o }) => {
          panel.style.transform = `translateX(${x}px)`; panel.style.opacity = Math.min(1, Math.max(0, o));
        }, 'snappy').then(done);
      });
    });

    return {
      open: (id) => open(id),
      close: () => close(false),
      setOption: (name, value) => {
        o[name] = value;
        if (name === 'hideOnScroll' && !value) root.classList.remove('is-hidden');
      },
      destroy: () => {
        abort.abort();
        clearTimers();
        document.body.style.overflow = '';
        root.querySelectorAll('[data-chev]').forEach((c) => c.remove());
      },
    };
  }

  global.Motion.nav = nav;
})(window);
