/* Motion.explorer: closer-look panels for a product page.
   Loads after motion.js and adds Motion.explorer(root, options).
   Markup contract: pills carry data-item ids, stage pictures carry matching
   data-view ids. The open pill is the same element as its panel: it grows
   from pill size into the panel and folds back, never a second box underneath.
   Shape swaps animate real width and height on the named 'island' preset.
   Options: { start } opens one item instantly (pass null for all closed). */
(function (global) {
  function explorer(root, options) {
    const M = global.Motion;
    const o = Object.assign({ start: null }, options || {});
    const reduced = () => M.reduced();
    const abort = new AbortController();
    const on = (el, ev, fn, opts) => { if (el && el.addEventListener) el.addEventListener(ev, fn, Object.assign({ signal: abort.signal }, opts || {})); };
    const wait = (ms) => new Promise((r) => setTimeout(r, reduced() ? 0 : ms));
    const phoneQuery = matchMedia('(max-width: 733px)');
    const isPhone = () => phoneQuery.matches;

    const list = root.querySelector('[data-list]');
    const slot = root.querySelector('[data-slot]');
    const prevBtn = root.querySelector('[data-prev]');
    const nextBtn = root.querySelector('[data-next]');
    const home = list ? [...list.children] : [];
    const pillFor = (id) => root.querySelector('[data-item="' + id + '"]');
    const ids = [...root.querySelectorAll('[data-item]')].map((el) => el.getAttribute('data-item'));
    const viewFor = (id) => root.querySelector('[data-view="' + id + '"]');

    let current = null;
    let variant = 'black';
    let gen = 0; // latest input wins; older runs stop writing

    const viewIdFor = (id) => (id === 'colors' ? 'colors-' + variant : id);
    const labelOf = (pill) => pill && pill.querySelector('[data-label]');
    const bodyOf = (pill) => pill && pill.querySelector('[data-body]');

    // Stage: one view visible. The incoming view crossfades and settles from 1.04 to 1.
    function showView(id) {
      const next = viewFor(id);
      root.querySelectorAll('[data-view].is-active').forEach((v) => { if (v !== next) v.classList.remove('is-active'); });
      if (!next || next.classList.contains('is-active')) return;
      next.classList.add('is-active');
      if (reduced()) return;
      M.spring({ s: 1.04 }, { s: 1 }, ({ s }) => {
        next.style.transform = 'scale(' + s.toFixed(4) + ')';
      }, 'smooth').then(() => { next.style.transform = ''; });
    }

    function fade(el, show, ms) {
      if (!el) return;
      if (reduced()) { el.style.transition = ''; el.style.opacity = ''; el.style.filter = ''; return; }
      el.style.transition = 'opacity ' + ms + 'ms ease, filter ' + ms + 'ms ease';
      el.style.opacity = show ? 1 : 0;
      el.style.filter = show ? '' : 'blur(6px)';
    }

    // Phones show the open panel in a slot under the pill row (same element, moved).
    // Desktop keeps every item in the column so FLIP can move neighbours smoothly.
    function place(next) {
      if (!list || !slot) return;
      if (isPhone() && next && pillFor(next)) {
        const li = pillFor(next).closest('li') || pillFor(next);
        // Put every other item back in the row in its original order, then lift the open one into the slot.
        home.forEach((h) => { if (h !== li) list.appendChild(h); });
        slot.hidden = false;
        slot.appendChild(li);
      } else {
        slot.hidden = true;
        home.forEach((li) => list.appendChild(li));
      }
    }

    let shown = null; // the item whose open classes are applied right now

    function applyClasses(next) {
      ids.forEach((id) => {
        const pill = pillFor(id);
        if (!pill) return;
        const isOpen = id === next;
        pill.classList.toggle('is-open', isOpen);
        pill.setAttribute('aria-expanded', String(isOpen));
      });
      root.classList.toggle('has-open', next !== null);
      place(next);
      shown = next;
    }

    // Clear every inline style a run may have left behind. CSS alone then decides what shows:
    // labels on closed pills, the paragraph on the open one. An interrupted run can never strand
    // an empty pill or a half-sized panel.
    function settle() {
      ids.forEach((id) => {
        const pill = pillFor(id);
        if (!pill) return;
        pill.classList.remove('swapping');
        pill.style.width = ''; pill.style.height = '';
        [labelOf(pill), bodyOf(pill)].forEach((el) => {
          if (!el) return;
          el.style.transition = ''; el.style.opacity = ''; el.style.filter = '';
        });
      });
    }

    // Size swap: animate real width and height so corners and text never stretch.
    // Neighbours follow through normal layout as the heights change.
    function resize(next, my) {
      const pills = ids.map(pillFor).filter(Boolean);
      const first = new Map(pills.map((el) => [el, el.getBoundingClientRect()]));
      applyClasses(next);
      const last = new Map(pills.map((el) => [el, el.getBoundingClientRect()]));
      const moving = pills.filter((el) => {
        const a = first.get(el), b = last.get(el);
        return Math.abs(a.width - b.width) > 0.5 || Math.abs(a.height - b.height) > 0.5;
      });
      if (reduced() || isPhone() || !moving.length) return Promise.resolve();
      moving.forEach((el) => {
        const a = first.get(el);
        el.classList.add('swapping');
        el.style.width = a.width + 'px'; el.style.height = a.height + 'px';
      });
      return M.spring({ t: 0 }, { t: 1 }, ({ t }) => {
        if (my !== gen) return;
        moving.forEach((el) => {
          const a = first.get(el), b = last.get(el);
          el.style.width = (a.width + (b.width - a.width) * t).toFixed(2) + 'px';
          el.style.height = (a.height + (b.height - a.height) * t).toFixed(2) + 'px';
        });
      }, 'island').then(() => {
        if (my !== gen) return;
        moving.forEach((el) => { el.classList.remove('swapping'); el.style.width = ''; el.style.height = ''; });
      });
    }

    async function go(id) {
      const my = ++gen;
      // Finish whatever was running instantly, so this run starts from a clean, correct state.
      settle();
      if (shown !== current) applyClasses(current);
      const prev = current;
      current = id;
      // Content out (~100ms): the clicked label and the open paragraph leave together.
      if (id) fade(labelOf(pillFor(id)), false, 100);
      if (prev) fade(bodyOf(pillFor(prev)), false, 100);
      if (id) showView(viewIdFor(id));
      await wait(100);
      if (my !== gen) return;
      // Shapes swap (~300ms) with the new paragraph and the returning label still hidden.
      if (id) fade(bodyOf(pillFor(id)), false, 0);
      if (prev) fade(labelOf(pillFor(prev)), false, 0);
      // Bring the text in once the shape is most of the way there (~300ms), not after the spring's long tail.
      // The paragraph has a fixed width, so it can fade in while the panel is still growing
      // and is simply revealed by the panel's edge; no empty glass box sits on screen.
      await Promise.race([resize(id, my), wait(140)]);
      if (my !== gen) return;
      // Content in (~200ms).
      if (prev) fade(labelOf(pillFor(prev)), true, 240);
      if (id) fade(bodyOf(pillFor(id)), true, 240);
      await wait(420);
      if (my === gen) settle();
    }

    function open(id) {
      if (!ids.includes(id)) return Promise.resolve();
      return go(current === id ? null : id);
    }

    function close() {
      if (current === null) return Promise.resolve();
      return go(null);
    }

    function step(dir) {
      if (!ids.length) return;
      const i = current === null ? (dir > 0 ? -1 : 0) : ids.indexOf(current);
      open(ids[(i + dir + ids.length) % ids.length]);
    }

    on(list, 'click', (e) => {
      const pill = e.target.closest && e.target.closest('[data-item]');
      if (pill && list.contains(pill)) { const id = pill.getAttribute('data-item'); open(id).then(() => { if (current === id && document.activeElement === document.body) { const p = pillFor(id); if (p) p.focus({ preventScroll: true }); } }); }
    });
    on(slot, 'click', (e) => {
      const pill = e.target.closest && e.target.closest('[data-item]');
      if (pill && !e.target.closest('[data-variant]')) open(pill.getAttribute('data-item'));
    });
    on(prevBtn, 'click', () => step(-1));
    on(nextBtn, 'click', () => step(1));

    // Swatches sit inside the Colors panel. Nested buttons are unusual markup,
    // so the swatch stops the click that would otherwise fold the panel shut.
    root.querySelectorAll('[data-variant]').forEach((btn) => {
      on(btn, 'click', (e) => {
        e.stopPropagation();
        const v = btn.getAttribute('data-variant');
        if (v === variant) return;
        variant = v;
        root.querySelectorAll('[data-variant]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        if (current === 'colors') showView(viewIdFor('colors'));
        const shown = pillFor('colors') && pillFor('colors').querySelector('[data-shown]');
        if (shown) M.blurSwap(shown, () => { shown.textContent = 'Shown in ' + btn.getAttribute('data-name') + '.'; });
      });
    });

    // Escape on the document: moving a pill during the swap can drop focus to the body.
    on(document, 'keydown', (e) => {
      if (e.key === 'Escape' && current !== null) { e.preventDefault(); const id = current; close(); const p = pillFor(id); if (p) p.focus({ preventScroll: true }); }
    });
    on(root, 'keydown', (e) => {
      const pill = e.target.closest && e.target.closest('[data-item]');
      if (!pill) return;
      // Pills that are not real buttons (the one holding swatches) still open with Enter and Space.
      if ((e.key === 'Enter' || e.key === ' ') && pill.tagName !== 'BUTTON' && e.target === pill) {
        e.preventDefault(); open(pill.getAttribute('data-item')); return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault(); step(1);
        const now = pillFor(current); if (now) now.focus({ preventScroll: true });
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault(); step(-1);
        const now = pillFor(current); if (now) now.focus({ preventScroll: true });
      }
    });

    on(phoneQuery, 'change', () => place(current));

    if (o.start && ids.includes(o.start)) {
      current = o.start;
      applyClasses(o.start);
      showView(viewIdFor(o.start));
    }

    return {
      open: (id) => open(id),
      close: () => close(),
      destroy: () => {
        abort.abort();
        gen++;
        settle();
        home.forEach((li) => { if (list) list.appendChild(li); });
        if (slot) slot.hidden = true;
        ids.forEach((id) => {
          const pill = pillFor(id);
          if (!pill) return;
          pill.classList.remove('is-open');
          pill.setAttribute('aria-expanded', 'false');
        });
      },
    };
  }

  global.Motion.explorer = explorer;
})(window);
