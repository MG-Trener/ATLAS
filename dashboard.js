(() => {
  const filters = document.querySelectorAll('.filters label select');
  const organismSelect = filters[0];
  const materialSelect = filters[1];
  const regionSelect = filters[2];
  const periodSelect = filters[3];
  const applyButton = document.querySelector('.filters .apply');
  const pageTitle = document.querySelector('.title-row h1');
  const pageDescription = document.querySelector('.page-head > div:first-child > p');
  const statCards = [...document.querySelectorAll('.stats .stat')];
  const resistancePanelCaption = document.querySelector('.resistance .panel-head p');
  const resistanceRows = [...document.querySelectorAll('.resistance .ab-row')];
  const trendCaption = document.querySelector('.trend .panel-head p');
  const heatmapCaption = document.querySelector('.heatmap .panel-head p');

  if (!regionSelect) return;
  regionSelect.id = 'region-filter';

  const countryBaseline = {
    isolates: 84215,
    resistance: 28.6,
    mdr: 8.7,
    esbl: 18.4,
    alerts: 3,
  };

  const antibiotics = [
    { name: 'Ампициллин', base: 68.7, n: 12843 },
    { name: 'Ципрофлоксацин', base: 34.1, n: 11927 },
    { name: 'Триметоприм/сульфаметоксазол', base: 32.4, n: 10334 },
    { name: 'Цефтриаксон', base: 28.6, n: 14382 },
    { name: 'Нитрофурантоин', base: 8.5, n: 9442 },
    { name: 'Амикацин', base: 6.2, n: 8431 },
    { name: 'Меропенем', base: 1.3, n: 7918 },
  ];

  let activeRegion = 'Казахстан';
  let activePcode = 'KZ';

  function hash(input) {
    let h = 0;
    for (let i = 0; i < input.length; i += 1) h = ((h << 5) - h) + input.charCodeAt(i);
    return Math.abs(h);
  }

  function regionFactor(name) {
    if (name === 'Казахстан') return 1;
    return 0.72 + (hash(name) % 45) / 100;
  }

  function formatInt(value) {
    return Math.round(value).toLocaleString('ru-RU');
  }

  function formatPct(value) {
    return Number(value).toFixed(1).replace('.', ',') + '%';
  }

  function barClass(value) {
    if (value >= 40) return 'danger';
    if (value >= 20) return 'warn';
    return 'safe';
  }

  function updateStats(region) {
    const factor = regionFactor(region);
    const resistanceFactor = 0.83 + (hash(region + 'R') % 34) / 100;
    const isolates = region === 'Казахстан' ? countryBaseline.isolates : countryBaseline.isolates * factor / 8.7;
    const resistance = countryBaseline.resistance * resistanceFactor;
    const mdr = countryBaseline.mdr * (0.82 + (hash(region + 'M') % 35) / 100);
    const esbl = countryBaseline.esbl * (0.84 + (hash(region + 'E') % 33) / 100);
    const alerts = region === 'Казахстан' ? 3 : Math.max(0, hash(region + 'A') % 4);

    const values = [
      { main: formatInt(isolates), delta: region === 'Казахстан' ? '↑ 12%' : `из региона`, sub: `${region}, 2026` },
      { main: formatPct(resistance), delta: `↑ ${(resistance - 24.5).toFixed(1).replace('.', ',')} п.п.`, sub: 'демонстрационная оценка' },
      { main: formatPct(mdr), delta: `↑ ${(mdr - 6.4).toFixed(1).replace('.', ',')} п.п.`, sub: 'множественная резистентность' },
      { main: formatPct(esbl), delta: `↑ ${(esbl - 15.3).toFixed(1).replace('.', ',')} п.п.`, sub: 'от всех E. coli' },
      { main: String(alerts), delta: alerts ? `↑ ${alerts}` : 'нет новых', sub: alerts ? 'требуют внимания' : 'активных сигналов нет' },
    ];

    statCards.forEach((card, index) => {
      const strong = card.querySelector('strong');
      const small = card.querySelector('small');
      if (!strong || !values[index]) return;
      const em = strong.querySelector('em');
      strong.firstChild.textContent = `${values[index].main} `;
      if (em) em.textContent = values[index].delta;
      if (small) small.textContent = values[index].sub;
    });
  }

  function updateResistance(region) {
    const f = 0.82 + (hash(region + 'AB') % 36) / 100;
    resistanceRows.forEach((row, index) => {
      const spec = antibiotics[index];
      if (!spec) return;
      const pct = region === 'Казахстан' ? spec.base : Math.max(0.4, Math.min(85, spec.base * f * (0.94 + index * 0.015)));
      const n = region === 'Казахстан' ? spec.n : Math.max(80, spec.n * regionFactor(region) / 7.5);
      const value = row.querySelector('div > b');
      const bar = row.querySelector('div i u');
      const count = row.querySelector(':scope > em');
      if (value) value.textContent = pct.toFixed(1).replace('.', ',');
      if (bar) {
        bar.style.width = `${Math.max(3, Math.min(100, pct))}%`;
        bar.className = barClass(pct);
      }
      if (count) count.textContent = formatInt(n);
    });
  }

  function updateCaptions(region) {
    const organism = organismSelect?.value || 'Escherichia coli';
    const material = materialSelect?.value || 'Все материалы';
    const period = periodSelect?.value || '2026';
    if (pageTitle) pageTitle.textContent = organism;
    if (pageDescription) pageDescription.innerHTML = `Интерактивный обзор антимикробной резистентности · <b>${region}</b> · демонстрационные данные`;
    if (resistancePanelCaption) resistancePanelCaption.textContent = `${organism.replace('Escherichia ', 'E. ')} · ${material.toLowerCase()} · ${region}`;
    if (trendCaption) trendCaption.textContent = `Цефтриаксон · ${region} · ${period}`;
    if (heatmapCaption) heatmapCaption.textContent = `Доля резистентных изолятов, % · ${region}`;
  }

  function selectRegion(region, pcode = '') {
    activeRegion = region || 'Казахстан';
    activePcode = pcode || activePcode;
    if (![...regionSelect.options].some((option) => option.value === activeRegion)) {
      regionSelect.add(new Option(activeRegion, activeRegion));
    }
    regionSelect.value = activeRegion;
    updateStats(activeRegion);
    updateResistance(activeRegion);
    updateCaptions(activeRegion);
    document.dispatchEvent(new CustomEvent('atlas:dashboard-region-changed', { detail: { name: activeRegion, pcode: activePcode } }));
  }

  document.addEventListener('atlas:map-ready', (event) => {
    const regions = event.detail?.regions || [];
    const keep = new Set(['Казахстан']);
    regionSelect.innerHTML = '<option value="Казахстан">Казахстан</option>';
    regions
      .slice()
      .sort((a, b) => (a.name_kk || '').localeCompare(b.name_kk || '', 'ru'))
      .forEach((region) => {
        if (!region?.name_kk || keep.has(region.name_kk)) return;
        keep.add(region.name_kk);
        regionSelect.add(new Option(region.name_kk, region.name_kk));
      });
    regionSelect.value = activeRegion;
  });

  document.addEventListener('atlas:region-selected', (event) => {
    selectRegion(event.detail?.name || 'Казахстан', event.detail?.pcode || '');
  });

  regionSelect.addEventListener('change', () => {
    selectRegion(regionSelect.value, '');
  });

  applyButton?.addEventListener('click', () => {
    selectRegion(regionSelect.value, activePcode);
    applyButton.textContent = 'Применено ✓';
    setTimeout(() => { applyButton.textContent = 'Применить'; }, 900);
  });

  [organismSelect, materialSelect, periodSelect].forEach((select) => {
    select?.addEventListener('change', () => updateCaptions(activeRegion));
  });

  selectRegion('Казахстан', 'KZ');
})();