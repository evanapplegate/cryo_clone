/* ============================================================
   panel.js: collapsible text control panel (ported from Durin site-v4).
   Groups by type role (H1 / H2 / H3 / Body); each control writes a CSS
   var on :root and persists to sessionStorage 'cryo:<var>' so picks
   carry across pages in the tab. Faces are the Google Fonts subset of
   the Durin catalog; the commercial faces licensed to Durin are left out.
   ============================================================ */
(function () {
  const root = document.documentElement.style;
  const KEY = 'cryo:';
  const save = (k, v) => { try { sessionStorage.setItem(KEY + k, v); } catch (e) {} };
  const get = (k) => { try { return sessionStorage.getItem(KEY + k); } catch (e) { return null; } };
  const cssVar = (name, fb) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fb;

  const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600;700;800&family=Ibarra+Real+Nova:wght@400;500;600;700&family=Gentium+Plus:ital,wght@0,400;0,700&family=Nanum+Myeongjo:wght@400;700;800&family=Maitree:wght@200;300;400;500;600;700&family=Piazzolla:ital,wght@0,100..900&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Zalando+Sans+SemiExpanded:ital,wght@0,400..700;1,400..700&family=Inter:ital,wght@0,100..900;1,100..900&family=Funnel+Sans:ital,wght@0,300..800;1,300..800&family=Funnel+Display:wght@300..800&family=Fustat:wght@200..800&family=Host+Grotesk:ital,wght@0,300..800;1,300..800&family=Schibsted+Grotesk:ital,wght@0,400..900;1,400..900&family=Almarai:wght@300;400;700;800&family=Saira:ital,wght@0,100..900;1,100..900&family=Tomorrow:wght@100;200;300;400;500;600;700;800;900&family=Bai+Jamjuree:wght@200;300;400;500;600;700&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=DM+Mono:ital,wght@0,300;0,400;0,500&family=IBM+Plex+Mono:wght@100;200;300;400;500;600;700&display=swap';
  function loadFonts() {
    if (document.getElementById('panel-fonts')) return;
    const l = document.createElement('link');
    l.id = 'panel-fonts'; l.rel = 'stylesheet'; l.href = FONTS_HREF;
    document.head.appendChild(l);
  }

  // display label, css family, weight
  const HEAD_FACES = [
    ['Inter Black', 'Inter', 900],
    ['Inter Bold', 'Inter', 700],
    ['Inter Semibold', 'Inter', 600],
    ['Inter Thin', 'Inter', 100],
    ['Shippori Mincho Bold', 'Shippori Mincho', 700],
    ['Shippori Mincho', 'Shippori Mincho', 400],
    ['Ibarra Real Nova Semibold', 'Ibarra Real Nova', 600],
    ['Ibarra Real Nova', 'Ibarra Real Nova', 400],
    ['Nanum Myeongjo Extrabold', 'Nanum Myeongjo', 800],
    ['Piazzolla Bold', 'Piazzolla', 700],
    ['Piazzolla Light', 'Piazzolla', 300],
    ['Maitree Semibold', 'Maitree', 600],
    ['Gentium Plus Bold', 'Gentium Plus', 700],
    ['Newsreader Bold', 'Newsreader', 700],
    ['Newsreader Medium', 'Newsreader', 500],
    ['Newsreader Light', 'Newsreader', 300],
    ['Zalando SemiExp Bold', 'Zalando Sans SemiExpanded', 700],
    ['Zalando SemiExp Semibold', 'Zalando Sans SemiExpanded', 600],
    ['Zalando SemiExp Medium', 'Zalando Sans SemiExpanded', 500],
    ['Zalando SemiExp Regular', 'Zalando Sans SemiExpanded', 400],
    ['Funnel Sans Black', 'Funnel Sans', 800],
    ['Funnel Display Black', 'Funnel Display', 800],
    ['Funnel Display Light', 'Funnel Display', 300],
    ['Fustat Black', 'Fustat', 800],
    ['Host Grotesk Bold', 'Host Grotesk', 700],
    ['Schibsted Grotesk Black', 'Schibsted Grotesk', 900],
    ['Almarai Extrabold', 'Almarai', 800],
    ['Saira Black', 'Saira', 900],
    ['Saira Thin', 'Saira', 100],
    ['Tomorrow Bold', 'Tomorrow', 700],
    ['Bai Jamjuree Semibold', 'Bai Jamjuree', 600],
    ['JetBrains Mono Bold', 'JetBrains Mono', 700],
    ['IBM Plex Mono', 'IBM Plex Mono', 400],
  ];
  const BODY_FACES = [
    ['Inter', 'Inter', 400],
    ['Shippori Mincho', 'Shippori Mincho', 400],
    ['Ibarra Real Nova', 'Ibarra Real Nova', 400],
    ['Gentium Plus', 'Gentium Plus', 400],
    ['Nanum Myeongjo', 'Nanum Myeongjo', 400],
    ['Maitree Light', 'Maitree', 300],
    ['Piazzolla', 'Piazzolla', 400],
    ['Newsreader', 'Newsreader', 400],
    ['Zalando SemiExp', 'Zalando Sans SemiExpanded', 400],
    ['Funnel Sans', 'Funnel Sans', 400],
    ['Fustat', 'Fustat', 400],
    ['Host Grotesk', 'Host Grotesk', 400],
    ['Schibsted Grotesk', 'Schibsted Grotesk', 400],
    ['Almarai', 'Almarai', 400],
    ['Saira', 'Saira', 400],
    ['Tomorrow', 'Tomorrow', 400],
    ['Bai Jamjuree', 'Bai Jamjuree', 400],
    ['JetBrains Mono', 'JetBrains Mono', 400],
    ['DM Mono', 'DM Mono', 400],
    ['IBM Plex Mono', 'IBM Plex Mono', 400],
  ];

  // dropdowns group faces by classification
  const KIND = {
    'Inter': 'Sans', 'Zalando Sans SemiExpanded': 'Sans', 'Funnel Sans': 'Sans', 'Funnel Display': 'Sans',
    'Fustat': 'Sans', 'Host Grotesk': 'Sans', 'Schibsted Grotesk': 'Sans', 'Almarai': 'Sans',
    'Saira': 'Sans', 'Tomorrow': 'Sans', 'Bai Jamjuree': 'Sans',
    'Shippori Mincho': 'Serif', 'Ibarra Real Nova': 'Serif', 'Nanum Myeongjo': 'Serif', 'Piazzolla': 'Serif',
    'Maitree': 'Serif', 'Gentium Plus': 'Serif', 'Newsreader': 'Serif',
    'JetBrains Mono': 'Mono', 'IBM Plex Mono': 'Mono', 'DM Mono': 'Mono',
  };

  // [min, max, step, default]; defaults mirror :root in site.css
  const ROLES = [
    { key: 'h1', title: 'H1', faces: HEAD_FACES, size: [0.5, 2, 0.01, 1], lead: [0.7, 1.8, 0.01, 1.02], track: [-0.08, 0.2, 0.001, -0.03] },
    { key: 'h2', title: 'H2', faces: HEAD_FACES, size: [0.5, 2, 0.01, 1], lead: [0.7, 1.8, 0.01, 1.1], track: [-0.08, 0.2, 0.001, -0.022] },
    { key: 'h3', title: 'H3', faces: HEAD_FACES, size: [0.5, 2, 0.01, 1], lead: [0.7, 1.8, 0.01, 1.3], track: [-0.08, 0.2, 0.001, -0.01] },
    { key: 'body', title: 'Body', faces: BODY_FACES, size: [0.6, 1.8, 0.01, 1], lead: [1, 2.2, 0.01, 1.6], track: [-0.05, 0.15, 0.001, 0] },
  ];
  const VARS = [];
  ROLES.forEach(r => ['-font', '-weight', '-size', '-lead', '-track'].forEach(s => VARS.push('--' + r.key + s)));
  VARS.push('--section-scale');

  function setVar(name, val) { root.setProperty(name, val); save(name, val); }

  // Re-apply this tab's picks on every page load.
  let restored = false;
  VARS.forEach(n => { const v = get(n); if (v !== null) { root.setProperty(n, v); restored = true; } });
  if (restored) loadFonts();

  function el(html) {
    const d = document.createElement('div');
    d.innerHTML = html;
    return d.firstElementChild;
  }

  function sliderRow(label, varName, [min, max, step, def], unit) {
    const row = el('<div class="prow"><label>' + label + '</label>' +
      '<input type="range" min="' + min + '" max="' + max + '" step="' + step + '">' +
      '<input type="number" min="' + min + '" max="' + max + '" step="' + step + '"></div>');
    const [range, num] = row.querySelectorAll('input');
    const sync = () => {
      const v = parseFloat(get(varName) ?? cssVar(varName, def));
      range.value = num.value = isNaN(v) ? def : v;
    };
    const apply = v => { range.value = num.value = v; setVar(varName, unit ? v + unit : v); };
    range.addEventListener('input', () => apply(range.value));
    num.addEventListener('input', () => apply(num.value));
    sync();
    row.sync = sync;
    return row;
  }

  function faceRow(role, faces) {
    const row = el('<div class="prow wide"><label>Typeface</label><select></select></div>');
    const sel = row.querySelector('select');
    ['Sans', 'Serif', 'Mono'].forEach(kind => {
      const og = document.createElement('optgroup');
      og.label = kind;
      faces.filter(([, fam]) => KIND[fam] === kind).forEach(([name, fam, wt]) => {
        const o = document.createElement('option');
        o.value = fam + '|' + wt;
        o.textContent = name;
        og.appendChild(o);
      });
      if (og.children.length) sel.appendChild(og);
    });
    const sync = () => {
      const fam = (get('--' + role + '-font') || cssVar('--' + role + '-font', 'Inter')).replace(/['"]/g, '');
      const wt = get('--' + role + '-weight') || cssVar('--' + role + '-weight', '400');
      sel.value = fam + '|' + wt;
      if (sel.selectedIndex < 0) sel.selectedIndex = 0;
    };
    sel.addEventListener('change', () => {
      applyFace(role, sel.value);
      // "Match typefaces": a heading pick carries to the other linked headings
      if (match.checked && MATCH.includes(role)) {
        MATCH.filter(r => r !== role).forEach(r => { faceSels[r].value = sel.value; applyFace(r, sel.value); });
      }
    });
    faceSels[role] = sel;
    sync();
    row.sync = sync;
    return row;
  }

  function applyFace(role, value) {
    const [fam, wt] = value.split('|');
    loadFonts();
    setVar('--' + role + '-font', "'" + fam + "'");
    setVar('--' + role + '-weight', wt);
  }

  const panel = el(
    '<div id="type-panel" class="collapsed">' +
      '<button id="type-panel-toggle" type="button">&#9656; Text control panel</button>' +
      '<div id="type-panel-body"></div>' +
    '</div>');
  const body = panel.querySelector('#type-panel-body');
  const rows = [];

  const pageGroup = el('<div class="pgroup"><div class="ptitle">Page</div></div>');
  const spaceRow = sliderRow('Section space', '--section-scale', [0.2, 2, 0.01, 1], '');
  rows.push(spaceRow);
  pageGroup.appendChild(spaceRow);
  body.appendChild(pageGroup);

  const MATCH = ['h1', 'h2'];
  const faceSels = {};
  const matchRow = el('<label class="pcheck"><input type="checkbox"> Match typefaces (H1 + H2)</label>');
  const match = matchRow.querySelector('input');
  match.checked = get('match') === '1';
  match.addEventListener('change', () => {
    save('match', match.checked ? '1' : '0');
    if (match.checked) { faceSels.h2.value = faceSels.h1.value; applyFace('h2', faceSels.h1.value); }
  });
  body.appendChild(matchRow);

  ROLES.forEach(r => {
    const g = el('<div class="pgroup"><div class="ptitle">' + r.title + '</div></div>');
    [faceRow(r.key, r.faces),
     sliderRow('Size', '--' + r.key + '-size', r.size, ''),
     sliderRow('Leading', '--' + r.key + '-lead', r.lead, ''),
     sliderRow('Tracking', '--' + r.key + '-track', r.track, 'em')].forEach(row => { rows.push(row); g.appendChild(row); });
    body.appendChild(g);
  });

  const actions = el('<div class="pactions"><button type="button" data-act="copy">Copy CSS</button><button type="button" data-act="reset">Reset</button></div>');
  actions.addEventListener('click', e => {
    const act = e.target.dataset.act;
    if (act === 'reset') {
      VARS.forEach(n => { root.removeProperty(n); try { sessionStorage.removeItem(KEY + n); } catch (err) {} });
      match.checked = false;
      try { sessionStorage.removeItem(KEY + 'match'); } catch (err) {}
      rows.forEach(r => r.sync());
    } else if (act === 'copy') {
      const css = ':root {\n' + VARS.map(n => '  ' + n + ': ' + cssVar(n, '') + ';').join('\n') + '\n}\n';
      const done = () => { e.target.textContent = 'Copied'; setTimeout(() => { e.target.textContent = 'Copy CSS'; }, 1200); };
      if (navigator.clipboard) navigator.clipboard.writeText(css).then(done, () => prompt('Copy CSS', css));
      else prompt('Copy CSS', css);
    }
  });
  body.appendChild(actions);

  function mount() {
    document.body.appendChild(panel);
    const toggle = panel.querySelector('#type-panel-toggle');
    toggle.addEventListener('click', () => {
      const collapsed = panel.classList.toggle('collapsed');
      if (!collapsed) loadFonts();
      toggle.innerHTML = (collapsed ? '&#9656;' : '&#9662;') + ' Text control panel';
    });
  }
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
