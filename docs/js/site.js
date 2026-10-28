/* Cryo X Co site: nav, lazy video, D3 charts. Colors come from CSS custom properties. */
(function () {
  const css = getComputedStyle(document.documentElement);
  const C = {};
  ['orange', 'orange-dark', 'orange-tint', 'blue', 'blue-dark', 'blue-tint', 'ink', 'ink-2', 'bg', 'surface', 'rule']
    .forEach(k => { C[k] = css.getPropertyValue('--' + k).trim(); });

  /* ---------- Nav ---------- */
  const btn = document.querySelector('.menu-btn');
  const nav = document.querySelector('.nav');
  if (btn && nav) {
    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
  }

  /* ---------- Click-to-load YouTube ---------- */
  document.querySelectorAll('.video[data-yt]').forEach(el => {
    el.addEventListener('click', () => {
      const f = document.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${el.dataset.yt}?autoplay=1&rel=0`;
      f.allow = 'autoplay; encrypted-media; picture-in-picture';
      f.allowFullscreen = true;
      f.title = el.getAttribute('aria-label') || 'Video';
      el.replaceChildren(f);
    }, { once: true });
  });

  /* ---------- FAQ filter ---------- */
  const search = document.querySelector('.faq-search');
  if (search) {
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      document.querySelectorAll('.faq-group').forEach(g => {
        let any = false;
        g.querySelectorAll('details').forEach(d => {
          const hit = !q || d.textContent.toLowerCase().includes(q);
          d.hidden = !hit;
          d.open = !!q && hit;
          any = any || hit;
        });
        g.hidden = !any;
      });
    });
  }

  if (typeof d3 === 'undefined') return;

  /* Re-render a chart whenever its container width changes; animate once when it scrolls into view. */
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]static\b/.test(location.search);
  function responsive(sel, draw) {
    const el = document.querySelector(sel);
    if (!el) return;
    let last = 0;
    new ResizeObserver(entries => {
      const w = Math.round(entries[0].contentRect.width);
      if (w && w !== last) { last = w; draw(el, w, false); }
    }).observe(el);
    if (REDUCE) return;
    const io = new IntersectionObserver(es => {
      if (!es[0].isIntersecting || !last) return;
      io.disconnect();
      draw(el, last, true);
    }, { rootMargin: '0px 0px -15% 0px' });
    io.observe(el);
  }

  /* ---------- How CryoPaint compares (range bars) ---------- */
  const ROOFS = [
    { name: 'Dark shingle roof', desc: 'A normal dark asphalt roof', lo: 167, hi: 179 },
    { name: 'Bare metal roof', desc: 'Unpainted galvanized or Galvalume', lo: 150, hi: 165 },
    { name: 'White paint on metal', desc: 'Ordinary white paint or factory-white metal', lo: 128, hi: 138 },
    { name: 'Elastomeric cool roof coating', desc: 'The white roof coating sold in buckets', lo: 115, hi: 140 },
    { name: 'White TPO or PVC roof', desc: 'The white membrane a roofer installs', lo: 109, hi: 124 },
    { name: 'CryoPaint', desc: 'Water-based radiative cooling paint', lo: 85, hi: 105, us: true },
  ];

  responsive('#compare-chart', (el, W, anim) => {
    const narrow = W < 640;
    const labelW = narrow ? 0 : Math.min(260, W * 0.3);
    const rowH = narrow ? 76 : 60;
    const barH = 14;
    const m = { top: 40, right: narrow ? 4 : 92, bottom: 52, left: labelW };
    const H = m.top + ROOFS.length * rowH + m.bottom;
    const x = d3.scaleLinear().domain([80, 180]).range([m.left, W - m.right]);

    const svg = d3.select(el).html('').append('svg')
      .attr('width', W).attr('height', H).attr('viewBox', `0 0 ${W} ${H}`)
      .attr('role', 'img')
      .attr('aria-label', 'Peak roof surface temperatures on a 100°F day: ' +
        ROOFS.map(d => `${d.name} ${d.lo} to ${d.hi}°F`).join('; '));

    // Grid + axis. On narrow screens labels sit above each bar, so rules only span the bar bands.
    const ticks = [80, 100, 120, 140, 160, 180];
    const gy = H - m.bottom;
    const barY = narrow ? 48 : (rowH - barH) / 2;
    const bands = narrow
      ? ROOFS.map((d, i) => [m.top + i * rowH + barY - 8, m.top + i * rowH + barY + barH + 8])
      : [[m.top - 8, gy]];
    bands.forEach(([y1, y2]) => {
      svg.append('g').attr('class', 'grid').selectAll('line').data(ticks).join('line')
        .attr('x1', d => x(d)).attr('x2', d => x(d)).attr('y1', y1).attr('y2', y2);
    });
    svg.append('g').attr('class', 'axis').selectAll('text').data(ticks).join('text')
      .attr('x', d => x(d)).attr('y', gy + 20).attr('text-anchor', 'middle').text(d => d + '°');
    svg.append('text').attr('class', 'axis-title')
      .attr('x', x(130)).attr('y', gy + 44).attr('text-anchor', 'middle')
      .style('font-size', '11px').style('font-weight', 600).style('letter-spacing', '0.09em')
      .style('fill', C['ink-2']).text('SURFACE TEMPERATURE (°F)');

    // Rows
    const row = svg.selectAll('g.row').data(ROOFS).join('g').attr('class', 'row')
      .attr('transform', (d, i) => `translate(0,${m.top + i * rowH})`);

    row.filter(d => d.us).append('rect')
      .attr('x', narrow ? -8 : 0).attr('y', 2).attr('width', narrow ? W + 8 : W).attr('height', rowH - 4)
      .attr('fill', C['blue-tint']).attr('opacity', 0.55).attr('rx', 2);

    const nameY = narrow ? 20 : rowH / 2 - 3;
    const lx = narrow ? 0 : 16;
    row.append('text').attr('x', lx).attr('y', nameY)
      .style('font-size', '15px').style('font-weight', d => d.us ? 700 : 600)
      .style('fill', d => d.us ? C.blue : C.ink).text(d => d.name);
    row.append('text').attr('x', lx).attr('y', nameY + 17)
      .style('font-size', '13px').style('fill', C['ink-2']).text(d => d.desc);

    const bars = row.append('rect')
      .attr('x', d => x(d.lo)).attr('y', barY).attr('height', barH).attr('rx', 2)
      .attr('fill', d => d.us ? C.blue : C.orange)
      .attr('width', d => x(d.hi) - x(d.lo));
    if (anim) {
      bars.attr('width', 0).transition().duration(700).delay((d, i) => 80 * i).ease(d3.easeCubicOut)
        .attr('width', d => x(d.hi) - x(d.lo));
    }

    row.append('text')
      .attr('y', barY + barH / 2 + 4.5)
      .style('font-size', '13px').style('font-weight', 600).attr('class', 'num')
      .style('fill', d => d.us ? C.blue : C.ink)
      .each(function (d) {
        const label = `${d.lo}–${d.hi}°F`;
        const roomRight = (W - m.right + (narrow ? 0 : m.right)) - x(d.hi) > 78;
        d3.select(this).text(label)
          .attr('x', roomRight ? x(d.hi) + 8 : x(d.lo) - 8)
          .attr('text-anchor', roomRight ? 'start' : 'end');
      });

    // Air temperature reference
    const ax = x(100);
    (narrow ? [[m.top - 14, m.top - 4], ...bands] : [[m.top - 14, gy]]).forEach(([y1, y2]) => {
      svg.append('line').attr('x1', ax).attr('x2', ax).attr('y1', y1).attr('y2', y2)
        .attr('stroke', C.ink).attr('stroke-width', 1.5).attr('stroke-dasharray', '4 4');
    });
    svg.append('text').attr('x', ax + 6).attr('y', m.top - 18)
      .style('font-size', '12px').style('font-weight', 600).text('Air temperature 100°F');
  });

  /* ---------- CryoPaint vs insulation (24 h, illustrative) ---------- */
  function airAt(t) {
    t = ((t % 24) + 24) % 24;
    if (t >= 5.5 && t <= 15.5) return 0.5 - 0.5 * Math.cos(Math.PI * (t - 5.5) / 10);
    const tt = ((t - 15.5) % 24 + 24) % 24;
    return 0.5 + 0.5 * Math.cos(Math.PI * tt / 14);
  }
  function sunAt(t) {
    t = ((t % 24) + 24) % 24;
    return t >= 6 && t <= 19.5 ? Math.max(0, Math.sin(Math.PI * (t - 6) / 13.5)) : 0;
  }
  // Insulated surface = first-order lag of (air + solar gain), run to periodic steady state.
  const DAY = (() => {
    const dt = 0.02, tau = 8, S = 0.5, out = [];
    let T = 0.5;
    for (let i = 0; i <= 24 * 8 / dt; i++) {
      const t = i * dt;
      T += dt * (airAt(t) + S * sunAt(t) - T) / tau;
      if (t >= 168 && Math.round((t - 168) / dt) % 5 === 0) {
        const h = t - 168;
        out.push({ h, air: airAt(h), ins: T, cryo: airAt(h) - 0.24 });
      }
    }
    return out;
  })();
  const AVG = d3.mean(DAY, d => d.air);

  responsive('#insulation-chart', (el, W, anim) => {
    const narrow = W < 640;
    const legend = document.querySelector('#insulation-legend');
    if (legend) legend.hidden = !narrow;
    const m = { top: 28, right: narrow ? 8 : 132, bottom: 40, left: narrow ? 8 : 16 };
    const H = narrow ? 320 : Math.min(460, W * 0.46);
    const x = d3.scaleLinear().domain([0, 24]).range([m.left, W - m.right]);
    const y = d3.scaleLinear().domain([-0.34, 1.1]).range([H - m.bottom, m.top]);

    const svg = d3.select(el).html('').append('svg')
      .attr('width', W).attr('height', H).attr('viewBox', `0 0 ${W} ${H}`)
      .attr('role', 'img')
      .attr('aria-label', 'Illustrative 24-hour surface temperatures. Insulation lags and averages the air temperature and absorbs sun, ending up hotter than the air for much of the day. CryoPaint tracks the air temperature about 15°F below it, day and night.');

    // Night shading
    [[0, 6], [19.5, 24]].forEach(([a, b]) => {
      svg.append('rect').attr('x', x(a)).attr('y', m.top - 8).attr('width', x(b) - x(a))
        .attr('height', H - m.bottom - m.top + 8).attr('fill', C.ink).attr('opacity', 0.045);
    });
    svg.append('text').attr('x', x(3)).attr('y', m.top + 6).attr('text-anchor', 'middle')
      .style('font-size', '11px').style('font-weight', 600).style('letter-spacing', '0.09em')
      .style('fill', C['ink-2']).text('NIGHT');
    svg.append('text').attr('x', x(12.75)).attr('y', m.top + 6).attr('text-anchor', 'middle')
      .style('font-size', '11px').style('font-weight', 600).style('letter-spacing', '0.09em')
      .style('fill', C['ink-2']).text('SUN');

    // Reference lines
    const refs = [
      { v: 1, label: 'Maximum air temperature', color: C.orange, dash: '6 5' },
      { v: AVG, label: 'Average air temperature', color: C['ink-2'], dash: '1 5' },
      { v: 0, label: 'Minimum air temperature', color: C.blue, dash: '6 5' },
    ];
    refs.forEach(r => {
      svg.append('line').attr('x1', m.left).attr('x2', W - m.right).attr('y1', y(r.v)).attr('y2', y(r.v))
        .attr('stroke', r.color).attr('stroke-width', r.dash === '1 5' ? 2 : 1.25)
        .attr('stroke-dasharray', r.dash).attr('stroke-linecap', 'round');
      svg.append('text').attr('x', narrow ? W - m.right : x(24) + 8).attr('y', y(r.v) + (narrow ? -6 : 4))
        .attr('text-anchor', narrow ? 'end' : 'start')
        .style('font-size', '11.5px').style('fill', r.color)
        .style('font-weight', 500)
        .style('paint-order', 'stroke').style('stroke', C.bg).style('stroke-width', 4).style('stroke-linejoin', 'round').text(narrow ? r.label.replace(' temperature', ' temp') : r.label.replace(' temperature', ''));
    });

    // Gap between air and CryoPaint
    svg.append('path').datum(DAY)
      .attr('fill', C['blue-tint']).attr('opacity', 0.7)
      .attr('d', d3.area().x(d => x(d.h)).y0(d => y(d.air)).y1(d => y(d.cryo)).curve(d3.curveBasis));

    const series = [
      { k: 'ins', label: 'Insulation', color: C.orange, w: 2.5 },
      { k: 'air', label: 'Air temperature', color: C.ink, w: 3.5 },
      { k: 'cryo', label: 'CryoPaint', color: C.blue, w: 3.5 },
    ];
    series.forEach(s => {
      const p = svg.append('path').datum(DAY).attr('fill', 'none')
        .attr('stroke', s.color).attr('stroke-width', s.w).attr('stroke-linecap', 'round')
        .attr('d', d3.line().x(d => x(d.h)).y(d => y(d[s.k])).curve(d3.curveBasis));
      if (!anim) return;
      const len = p.node().getTotalLength();
      p.attr('stroke-dasharray', `${len} ${len}`).attr('stroke-dashoffset', len)
        .transition().duration(1400).ease(d3.easeCubicInOut).attr('stroke-dashoffset', 0)
        .on('end', function () { d3.select(this).attr('stroke-dasharray', null); });
    });

    // Direct labels at the right edge (desktop) - spread to avoid collisions
    if (!narrow) {
      const end = DAY[DAY.length - 1];
      const ys = series.map(s => ({ s, y: y(end[s.k]) })).sort((a, b) => a.y - b.y);
      for (let i = 1; i < ys.length; i++) ys[i].y = Math.max(ys[i].y, ys[i - 1].y + 18);
      ys.forEach(({ s, y: yy }) => {
        svg.append('text').attr('x', x(24) + 8).attr('y', yy + 4)
          .style('font-size', '13px').style('font-weight', 700).style('fill', s.color).text(s.label);
      });
      // Push reference labels clear of series labels
      svg.selectAll('text').filter(function () { return /Maximum|Average|Minimum/.test(this.textContent); })
        .each(function () {
          const t = d3.select(this), ty = +t.attr('y');
          if (ys.some(o => Math.abs(o.y + 4 - ty) < 14)) t.attr('y', ty + 15);
        });
    }

    // Annotation on the gap
    const ann = DAY.find(d => d.h >= 10.5);
    const tx = x(ann.h), ty = (y(ann.air) + y(ann.cryo)) / 2;
    if (!narrow) {
      svg.append('text').attr('x', tx + 10).attr('y', ty + 30)
        .style('font-size', '12.5px').style('font-weight', 600).style('fill', C.blue)
        .text('About 15°F below air, day and night');
      svg.append('line').attr('x1', tx + 8).attr('x2', tx + 1).attr('y1', ty + 20).attr('y2', ty + 2)
        .attr('stroke', C.blue).attr('stroke-width', 1);
    }

    // Time axis
    const ticks = [0, 6, 12, 18, 24];
    const fmt = h => ({ 0: '12 AM', 6: '6 AM', 12: '12 PM', 18: '6 PM', 24: '12 AM' }[h]);
    svg.append('g').attr('class', 'axis').selectAll('text').data(ticks).join('text')
      .attr('x', d => x(d)).attr('y', H - m.bottom + 22)
      .attr('text-anchor', (d, i) => i === 0 ? 'start' : i === ticks.length - 1 ? 'end' : 'middle')
      .text(fmt);
    svg.append('line').attr('x1', m.left).attr('x2', W - m.right)
      .attr('y1', H - m.bottom + 4).attr('y2', H - m.bottom + 4).attr('stroke', C.rule);
  });

  /* ---------- How radiative cooling works (diagram) ---------- */
  responsive('#how-diagram', (el, W) => {
    const narrow = W < 520;
    const H = narrow ? 380 : Math.round(W * 0.62);
    const ground = H - (narrow ? 64 : 76);
    const atmoY = ground - (narrow ? 70 : 92);
    const svg = d3.select(el).html('').append('svg')
      .attr('width', W).attr('height', H).attr('viewBox', `0 0 ${W} ${H}`)
      .attr('role', 'img')
      .attr('aria-label', 'Diagram: CryoPaint reflects incoming sunlight and radiates heat at 8 to 13 micrometers through the atmosphere to deep space.');
    const defs = svg.append('defs');

    const sky = defs.append('linearGradient').attr('id', 'sky').attr('x1', 0).attr('x2', 0).attr('y1', 0).attr('y2', 1);
    sky.append('stop').attr('offset', 0).attr('stop-color', C['blue-dark']);
    sky.append('stop').attr('offset', 0.55).attr('stop-color', C.blue);
    sky.append('stop').attr('offset', 1).attr('stop-color', C['blue-tint']);
    const sun = defs.append('radialGradient').attr('id', 'sunglow');
    sun.append('stop').attr('offset', 0.35).attr('stop-color', C.orange).attr('stop-opacity', 0.55);
    sun.append('stop').attr('offset', 1).attr('stop-color', C.orange).attr('stop-opacity', 0);
    const heat = defs.append('radialGradient').attr('id', 'heat');
    heat.append('stop').attr('offset', 0).attr('stop-color', C.orange).attr('stop-opacity', 0.5);
    heat.append('stop').attr('offset', 1).attr('stop-color', C.orange).attr('stop-opacity', 0);
    const arrow = (id, color) => defs.append('marker').attr('id', id).attr('viewBox', '0 0 10 10')
      .attr('refX', 5).attr('refY', 5).attr('markerWidth', 3.2).attr('markerHeight', 3.2).attr('orient', 'auto-start-reverse')
      .append('path').attr('d', 'M0,0 L10,5 L0,10 z').attr('fill', color);
    arrow('a-orange', C.orange); arrow('a-white', '#fff'); arrow('a-light', C.bg);

    svg.append('rect').attr('width', W).attr('height', ground).attr('fill', 'url(#sky)');
    // Atmosphere band
    svg.append('rect').attr('x', 0).attr('y', atmoY).attr('width', W).attr('height', ground - atmoY)
      .attr('fill', C['orange-tint']).attr('opacity', 0.55);
    // Ground + heat glow
    svg.append('rect').attr('x', 0).attr('y', ground).attr('width', W).attr('height', H - ground).attr('fill', C.surface);
    const ux = Math.max(W * 0.3, 150);
    svg.append('ellipse').attr('cx', ux).attr('cy', ground + 26).attr('rx', W * 0.18).attr('ry', 34).attr('fill', 'url(#heat)');
    svg.append('rect').attr('x', 0).attr('y', ground - 3).attr('width', W).attr('height', 6).attr('fill', '#fff');

    const fs = narrow ? 11.5 : 13;
    const lab = (x, y, t, o = {}) => svg.append('text').attr('x', x).attr('y', y)
      .attr('text-anchor', o.anchor || 'start').style('font-size', (o.size || fs) + 'px')
      .style('font-weight', o.weight || 600).style('fill', o.fill || '#fff').text(t);

    lab(14, 24, 'Deep space, about 3 K');
    lab(14, atmoY + 20, 'Atmosphere', { fill: C['orange-dark'] });
    lab(14, atmoY + 20 + fs + 4, narrow ? 'absorbs other IR' : 'absorbs other infrared', { fill: C['orange-dark'], weight: 400, size: fs - 1 });
    lab(ux, ground + 30, 'Heat in the surface', { anchor: 'middle', fill: C['orange-dark'] });
    lab(W * 0.72, ground + 30, 'CryoPaint reflects 94%', { anchor: 'middle', fill: C.blue });

    // Sun + incoming
    const sx = W * 0.84, sy = narrow ? 70 : H * 0.16, sr = narrow ? 22 : Math.max(26, W * 0.04);
    svg.append('circle').attr('cx', sx).attr('cy', sy).attr('r', sr * 3).attr('fill', 'url(#sunglow)');
    svg.append('circle').attr('cx', sx).attr('cy', sy).attr('r', sr).attr('fill', C.orange);
    const hitX = W * 0.68;
    svg.append('line').attr('x1', sx - sr * 0.5).attr('y1', sy + sr * 0.9).attr('x2', hitX + 4).attr('y2', ground - 14)
      .attr('stroke', C.orange).attr('stroke-width', narrow ? 9 : 12).attr('marker-end', 'url(#a-orange)');
    lab(sx - sr - 10, sy + sr * 2.6, 'Sunlight in', { anchor: 'end' });

    // Reflected fan
    [-62, -40, -18, 16, 38].forEach(a => {
      const r = (narrow ? 64 : 96), rad = (a - 90) * Math.PI / 180;
      svg.append('line').attr('x1', hitX).attr('y1', ground - 8)
        .attr('x2', hitX + r * Math.cos(rad)).attr('y2', ground - 8 + r * Math.sin(rad))
        .attr('stroke', '#fff').attr('stroke-width', 3).attr('stroke-opacity', 0.9).attr('marker-end', 'url(#a-white)');
    });

    // 8-13 um window to space
    svg.append('line').attr('x1', ux).attr('y1', ground - 10).attr('x2', ux).attr('y2', narrow ? 52 : 56)
      .attr('stroke', C.bg).attr('stroke-width', narrow ? 9 : 12).attr('marker-end', 'url(#a-light)');
    lab(ux + 14, narrow ? 64 : 72, '8–13 µm heat', { size: fs + 1 });
    lab(ux + 14, (narrow ? 64 : 72) + fs + 4, 'escapes to space', { weight: 400 });
    // Other IR absorbed in atmosphere
    const cx0 = ux + 18;
    svg.append('path')
      .attr('d', `M${cx0},${ground - 10} Q${cx0 + W * 0.05},${atmoY + 10} ${cx0 + W * 0.13},${atmoY + 6}`)
      .attr('fill', 'none').attr('stroke', C.bg).attr('stroke-opacity', 0.75).attr('stroke-width', 4)
      .attr('stroke-dasharray', '2 5').attr('stroke-linecap', 'round');
  });

  /* ---------- Customer map ---------- */
  const mapEl = document.querySelector('#customer-map');
  if (mapEl && typeof topojson !== 'undefined') {
    Promise.all([
      d3.json(mapEl.dataset.world),
      d3.json(mapEl.dataset.points),
    ]).then(([world, pts]) => {
      const land = topojson.feature(world, world.objects.countries).features
        .filter(f => f.id !== '010'); // drop Antarctica
      const fc = { type: 'FeatureCollection', features: land };
      const hit = new Set();
      pts.forEach(p => { const f = land.find(c => d3.geoContains(c, p)); if (f) hit.add(f.id); });
      const borders = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);
      const countEl = document.querySelector('#country-count');
      if (countEl) countEl.textContent = hit.size;

      responsive('#customer-map', (el, W) => {
        const proj = d3.geoNaturalEarth1().rotate([-10, 0]).fitWidth(W, fc);
        const path = d3.geoPath(proj);
        const b = path.bounds(fc);
        const H = Math.ceil(b[1][1] + 2);
        const r = Math.max(2.2, Math.min(4, W / 300));
        const svg = d3.select(el).html('').append('svg')
          .attr('width', W).attr('height', H).attr('viewBox', `0 0 ${W} ${H}`)
          .attr('role', 'img')
          .attr('aria-label', `World map of CryoPaint customer locations across ${hit.size} countries in North America, Europe, South America, Asia and Australia.`);
        svg.append('g').selectAll('path').data(land).join('path')
          .attr('d', path)
          .attr('fill', d => hit.has(d.id) ? C['blue-tint'] : C.surface);
        svg.append('path').datum(borders).attr('d', path)
          .attr('fill', 'none').attr('stroke', C.rule).attr('stroke-width', 0.6);
        svg.append('g').selectAll('circle').data(pts).join('circle')
          .attr('cx', d => proj(d)[0]).attr('cy', d => proj(d)[1]).attr('r', r)
          .attr('fill', C.orange).attr('stroke', C.surface).attr('stroke-width', W < 500 ? 0.6 : 1);
      });
    });
  }
})();
