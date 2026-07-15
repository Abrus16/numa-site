/* ===== Numa concept — interactions ===== */
(function () {
  'use strict';

  /* ---------- nav scrolled state ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- reveal on scroll ---------- */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls = document.querySelectorAll('.reveal');
  if (!prefersReduced) {
    revealEls.forEach((el) => el.classList.add('pre')); // arm hidden state
    const revObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); revObs.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => revObs.observe(el));
  }

  /* ---------- data bars ---------- */
  const bars = document.getElementById('bars');
  const barObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('.bar-fill').forEach((f, i) => {
        setTimeout(() => { f.style.width = f.dataset.w + '%'; }, 120 + i * 140);
      });
      barObs.unobserve(e.target);
    });
  }, { threshold: 0.3 });
  if (bars) barObs.observe(bars);

  /* ---------- exploded filter ---------- */
  const discsWrap = document.getElementById('discs');
  const discs = discsWrap ? Array.from(discsWrap.querySelectorAll('.fdisc')) : [];
  const layerBtns = Array.from(document.querySelectorAll('#layerPick .layer-btn'));
  // vertical spacing between layers (in px, applied along translateZ)
  const GAP = 33;
  function layoutDiscs(activeIdx) {
    discs.forEach((d, i) => {
      const z = (i - (discs.length - 1) / 2) * GAP;
      const lift = (i === activeIdx) ? 26 : 0;
      d.style.transform = `translateZ(${z + lift}px)`;
      d.style.boxShadow = `0 ${10 + i * 4}px ${20 + i * 6}px -10px oklch(0.3 0.04 240 / .45)`;
      d.classList.toggle('active', i === activeIdx);
    });
  }
  function selectLayer(idx) {
    layerBtns.forEach((b, i) => b.classList.toggle('active', i === idx));
    layoutDiscs(idx);
  }
  layerBtns.forEach((b) => b.addEventListener('click', () => selectLayer(+b.dataset.layer)));
  discs.forEach((d) => d.addEventListener('click', () => selectLayer(+d.dataset.layer)));
  // initial spread once stage is on screen
  if (discsWrap) {
    const stage = document.getElementById('explodeStage');
    const sObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { layoutDiscs(0); sObs.unobserve(e.target); } });
    }, { threshold: 0.3 });
    sObs.observe(stage);
    // collapsed initial state
    discs.forEach((d) => { d.style.transform = 'translateZ(0px)'; });
  }

  /* ---------- subscription configurator ---------- */
  const CAPACITY = 650;     // effective exposure-minutes per filter
  const PRICE_PER = 9;      // $ per filter
  const ride = document.getElementById('ride');
  const mins = document.getElementById('mins');
  const minsVal = document.getElementById('minsVal');
  const priceEl = document.getElementById('price');
  const cadenceEl = document.getElementById('cadence');
  const perfilterEl = document.getElementById('perfilter');
  const lifeRing = document.getElementById('lifeRing');
  const lifeNum = document.getElementById('lifeNum');
  const lifeDays = document.getElementById('lifeDays');
  let days = 5;

  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }

  function recompute() {
    const m = +mins.value;
    if (minsVal) minsVal.textContent = m;
    const filterLifeCommuteDays = CAPACITY / m;             // commute days per filter
    const filtersPerMonth = (days * 4.33) / filterLifeCommuteDays;
    const price = Math.max(PRICE_PER, Math.round(filtersPerMonth * PRICE_PER));
    const perMonthRounded = Math.max(1, Math.round(filtersPerMonth));
    const weeksBetween = Math.max(1, Math.round(4.33 / filtersPerMonth));

    if (priceEl) priceEl.textContent = price;
    if (cadenceEl) cadenceEl.textContent = plural(perMonthRounded, 'filter') + ' / month';
    if (perfilterEl) perfilterEl.textContent = weeksBetween === 1 ? 'auto-ships weekly' : 'auto-ships every ' + weeksBetween + ' weeks';

    // filter-life snapshot (64% of a fresh filter at this profile)
    const pct = 64;
    const daysLeft = Math.max(1, Math.round(filterLifeCommuteDays * (pct / 100)));
    if (lifeRing) lifeRing.style.setProperty('--p', pct);
    if (lifeNum) lifeNum.textContent = pct;
    if (lifeDays) lifeDays.textContent = '≈ ' + plural(daysLeft, 'day');
  }
  if (ride) {
    ride.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-days]');
      if (!btn) return;
      ride.querySelectorAll('button').forEach((b) => b.classList.remove('on'));
      btn.classList.add('on');
      days = +btn.dataset.days;
      recompute();
    });
  }
  if (mins) mins.addEventListener('input', recompute);
  recompute();

  /* ---------- tiers ---------- */
  const TIERS = [
    {
      label: 'Tier 1 · Short-term visitor',
      name: 'Light, simple, ready out of the box.',
      forText: 'For tourists and short-stay visitors. Basic, effective filtration in a lightweight body — protection for the weeks you’re here.',
      specs: { 'Filtration': 'Standard PM2.5', 'Comfort & fit': 'Lightweight body', 'Filters': 'Single-use, disposable', 'Air sensing': '—' },
      q: '“I’m only here a few weeks — but the air still matters.”',
      qd: 'Positioned on acute exposure: even short stints underground spike fine-particle intake.',
      price: 'Device $29 · filters from $9 each'
    },
    {
      label: 'Tier 2 · Medium-term resident',
      name: 'Comfort for the daily habit.',
      forText: 'For new residents settling in. Improved comfort and replaceable cartridges for the months you’ll be riding every day.',
      specs: { 'Filtration': 'Enhanced PM2.5', 'Comfort & fit': 'Improved all-day fit', 'Filters': 'Replaceable cartridges', 'Air sensing': '—' },
      q: '“This is my city now. I’m on the train every single day.”',
      qd: 'Positioned on cumulative exposure: the dose adds up over months of daily commuting.',
      price: 'Device $59 · filters from $12/mo'
    },
    {
      label: 'Tier 3 · Long-term resident',
      name: 'High-efficiency, made to disappear.',
      forText: 'For established commuters. High-efficiency filtration, premium comfort, and a refill subscription so you never think about it.',
      specs: { 'Filtration': 'High-efficiency media', 'Comfort & fit': 'Premium fit', 'Filters': 'Subscription refills', 'Air sensing': 'Optional add-on' },
      q: '“I’ve been breathing this for years. I just want it handled.”',
      qd: 'Positioned on chronic exposure: years of accumulation is where the research gets serious.',
      price: 'Device $89 · subscription from $15/mo'
    },
    {
      label: 'Tier 4 · Lifelong commuter',
      name: 'Custom-molded. Maximum protection. Fully aware.',
      forText: 'For lifers. A custom-molded fit — like professional hearing protection — with maximum filtration, in-device sensing, and app-based exposure tracking.',
      specs: { 'Filtration': 'Maximum efficiency', 'Comfort & fit': 'Custom-molded fit', 'Filters': 'Subscription refills', 'Air sensing': 'In-device + app' },
      q: '“This is my life underground. Protect it like it matters.”',
      qd: 'Positioned on a lifetime of exposure: the most protection, the best fit, and the data to prove it.',
      price: 'Device $149 · custom fit + app'
    }
  ];
  const tierTabs = document.getElementById('tierTabs');
  const tLabel = document.getElementById('tierLabel');
  const tName = document.getElementById('tierName');
  const tFor = document.getElementById('tierFor');
  const tSpecs = document.getElementById('tierSpecs');
  const tQ = document.getElementById('tierQ');
  const tQd = document.getElementById('tierQd');
  const tPrice = document.getElementById('tierPrice');

  function renderTier(i) {
    const t = TIERS[i];
    tLabel.textContent = t.label;
    tName.textContent = t.name;
    tFor.textContent = t.forText;
    tQ.textContent = t.q;
    tQd.textContent = t.qd;
    tPrice.textContent = t.price;
    tSpecs.innerHTML = '';
    Object.entries(t.specs).forEach(([k, v]) => {
      const row = document.createElement('div');
      row.className = 'row';
      row.innerHTML = '<span>' + k + '</span><span>' + v + '</span>';
      tSpecs.appendChild(row);
    });
  }
  if (tierTabs) {
    tierTabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.tier-tab');
      if (!tab) return;
      tierTabs.querySelectorAll('.tier-tab').forEach((b) => b.classList.remove('on'));
      tab.classList.add('on');
      renderTier(+tab.dataset.tier);
    });
    renderTier(0);
  }

  /* ---------- app sparkline ---------- */
  const spark = document.getElementById('spark');
  if (spark) {
    const heights = [30, 44, 38, 52, 60, 48, 66, 72, 58, 80, 74, 90, 82, 68, 55, 62, 70, 84, 76, 60, 48, 40, 34, 28];
    heights.forEach((h, i) => {
      const bar = document.createElement('i');
      bar.style.height = h + '%';
      if (i >= heights.length - 4) bar.classList.add('dim');
      spark.appendChild(bar);
    });
  }

  /* ---------- fit selector ---------- */
  const fit = document.getElementById('fit');
  const fitNote = document.getElementById('fitNote');
  const FITS = {
    S: ['Small', 'fits narrower nostrils and many smaller frames — a snug, secure seal without any spread.'],
    M: ['Medium', 'fits the majority of adult noses — the right starting point if you\u2019re unsure.'],
    L: ['Large', 'fits wider nostrils and larger frames — full contact without over-compressing.']
  };
  if (fit && fitNote) {
    fit.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-fit]');
      if (!b) return;
      fit.querySelectorAll('button').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
      const [name, desc] = FITS[b.dataset.fit];
      fitNote.innerHTML = '<b>' + name + '</b> ' + desc +
        '<span class="fsub">EVERY DEVICE SHIPS WITH S / M / L SEALS \u00b7 SWAP IN SECONDS</span>';
    });
  }

  /* ---------- pre-order capture ---------- */
  // ↓↓↓ TO RECEIVE EMAILS: replace 'your-form-id' with your real Formspree form ID
  //     (sign up free at formspree.io, create a form, paste its ID below).
  //     Until you do, the form still works as a local demo.
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mojgqodl';
  const PRE_BASE = 247; // illustrative starting count
  const preForm = document.getElementById('preForm');
  const preFormState = document.getElementById('preFormState');
  const preSuccessState = document.getElementById('preSuccessState');
  const preCount = document.getElementById('preCount');
  const prePos = document.getElementById('prePos');
  const pfError = document.getElementById('pfError');
  const KEY_RES = 'numa_reservation';
  const KEY_CNT = 'numa_extra_count';

  function getCount() { return PRE_BASE + (parseInt(localStorage.getItem(KEY_CNT) || '0', 10) || 0); }
  function showCount() { if (preCount) preCount.textContent = getCount().toLocaleString(); }

  function showSuccess(pos) {
    if (prePos) prePos.textContent = '#' + pos.toLocaleString();
    if (preFormState) preFormState.classList.add('hidden');
    if (preSuccessState) preSuccessState.classList.remove('hidden');
  }

  // restore prior reservation
  try {
    const saved = JSON.parse(localStorage.getItem(KEY_RES) || 'null');
    if (saved && saved.pos) showSuccess(saved.pos);
  } catch (e) { /* ignore */ }
  showCount();

  if (preForm) {
    preForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = (document.getElementById('pf-email').value || '').trim();
      const name = (document.getElementById('pf-name').value || '').trim();
      const tier = document.getElementById('pf-tier').value;
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!ok) {
        pfError.textContent = 'Please enter a valid email so we can reach you.';
        document.getElementById('pf-email').focus();
        return;
      }
      pfError.textContent = '';

      // Send to Formspree (skipped while the placeholder ID is still in place)
      const live = !FORMSPREE_ENDPOINT.includes('your-form-id');
      const btn = preForm.querySelector('.pre-submit');
      if (live) {
        const label = btn.textContent;
        btn.disabled = true; btn.textContent = 'Reserving…';
        try {
          const res = await fetch(FORMSPREE_ENDPOINT, {
            method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(preForm)
          });
          if (!res.ok) throw new Error('request failed');
        } catch (err) {
          pfError.textContent = 'Hmm, that didn’t go through. Please try again.';
          btn.disabled = false; btn.textContent = label;
          return;
        }
        btn.disabled = false; btn.textContent = label;
      }

      const extra = (parseInt(localStorage.getItem(KEY_CNT) || '0', 10) || 0) + 1;
      localStorage.setItem(KEY_CNT, String(extra));
      const pos = PRE_BASE + extra;
      const rec = { email, name, tier, pos, ts: Date.now() };
      try { localStorage.setItem(KEY_RES, JSON.stringify(rec)); } catch (e2) { /* ignore */ }
      showCount();
      showSuccess(pos);
    });
  }

  /* ---------- interactive dissection (hero) ---------- */
  const dStage = document.getElementById('dissectStage');
  const dStack = document.getElementById('dstack');
  const dRange = document.getElementById('dissectRange');
  const dToggle = document.getElementById('dissectToggle');
  const dReadout = document.getElementById('dissectReadout');
  if (dStage && dStack) {
    const dLayers = Array.from(dStack.querySelectorAll('.dlayer'));
    const N = dLayers.length;
    const meta = dLayers.map((el) => ({
      name: el.querySelector('.dl-name').textContent,
      tag: el.querySelector('.dl-tag').classList.contains('filter') ? 'Filter — replaceable' : 'Shell — keep for life'
    }));
    let prog = 0;

    function render(p) {
      prog = Math.max(0, Math.min(1, p));
      const spacing = 14 + prog * 44;           // px between layers
      const lo = Math.max(0, Math.min(1, (prog - 0.08) / 0.45));
      const active = Math.round(prog * (N - 1));
      dLayers.forEach((el, i) => {
        el.style.setProperty('--y', ((i - (N - 1) / 2) * spacing).toFixed(1) + 'px');
        el.style.setProperty('--lo', lo.toFixed(2));
        el.style.setProperty('--lx', (-(8) * (1 - lo)).toFixed(1) + 'px');
        el.classList.toggle('hot', prog > 0.05 && i === active);
      });
      if (dRange && document.activeElement !== dRange) dRange.value = Math.round(prog * 100);
      if (dReadout) {
        if (prog < 0.04) dReadout.innerHTML = '<b>Assembled.</b> Drag to peel it apart, outside to inside.';
        else if (prog > 0.96) dReadout.innerHTML = '<b>Fully dissected.</b> Six layers — three shell, three filter.';
        else dReadout.innerHTML = '<b>' + meta[active].name + '</b> · ' + meta[active].tag;
      }
    }

    function tween(to, dur) {
      const from = prog, t0 = performance.now();
      function step(t) {
        const k = Math.min(1, (t - t0) / dur);
        const e = 1 - Math.pow(1 - k, 3);
        render(from + (to - from) * e);
        if (k < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    function markTouched() { dStage.classList.add('touched'); }

    // range scrub
    if (dRange) dRange.addEventListener('input', () => { markTouched(); render(+dRange.value / 100); });
    // toggle button
    if (dToggle) dToggle.addEventListener('click', () => { markTouched(); tween(prog < 0.5 ? 1 : 0, 520); });

    // pointer drag + click-toggle on the stage
    let dragging = false, startY = 0, startP = 0, moved = 0;
    dStage.addEventListener('pointerdown', (e) => {
      dragging = true; moved = 0; startY = e.clientY; startP = prog;
      dStage.classList.add('grabbing');
      dStage.setPointerCapture(e.pointerId);
    });
    dStage.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dy = e.clientY - startY; moved += Math.abs(e.movementY || 0);
      markTouched();
      render(startP + dy / (dStage.clientHeight * 0.7));
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false; dStage.classList.remove('grabbing');
      if (moved < 5) { markTouched(); tween(prog < 0.5 ? 1 : 0, 520); } // treat as click
    }
    dStage.addEventListener('pointerup', endDrag);
    dStage.addEventListener('pointercancel', endDrag);

    render(0);
  }

  /* ---------- sticky pre-order bar ---------- */
  const sticky = document.getElementById('stickyCta');
  const heroSection = document.querySelector('.hero');
  const preSection = document.getElementById('preorder');
  if (sticky && heroSection && preSection) {
    let pastHero = false, nearPre = false;
    const update = () => sticky.classList.toggle('show', pastHero && !nearPre);
    new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; update(); }, { threshold: 0 }).observe(heroSection);
    new IntersectionObserver(([e]) => { nearPre = e.isIntersecting; update(); }, { rootMargin: '0px 0px -12% 0px' }).observe(preSection);
  }
})();
