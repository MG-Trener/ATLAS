(() => {
  const target = document.getElementById('kazakhstan-map');
  if (!target) return;

  const antibioticSelect = document.getElementById('map-antibiotic');
  const caption = document.getElementById('map-caption');
  const sourceLabel = document.querySelector('.amr-map-source');

  const sources = [
    'https://cdn.jsdelivr.net/gh/galymorg/new_qazaqstan_GeoJSON@main/regions.json',
    'https://raw.githubusercontent.com/galymorg/new_qazaqstan_GeoJSON/main/regions.json',
  ];

  const antibioticProfiles = {
    'Цефтриаксон': { factor: 1, offset: 0 },
    'Ципрофлоксацин': { factor: 1.12, offset: 2.8 },
    'Меропенем': { factor: 0.16, offset: -1.2 },
  };

  let regions = [];
  let view = { x: 0, y: 0, w: 620, h: 340 };

  const loading = document.createElement('div');
  loading.className = 'amr-map-loading';
  loading.textContent = 'Загрузка контуров регионов Казахстана…';
  target.appendChild(loading);

  const tooltip = document.createElement('div');
  tooltip.className = 'svg-map-tooltip';
  target.appendChild(tooltip);

  const popup = document.createElement('div');
  popup.className = 'svg-map-popup';
  target.appendChild(popup);

  function activeAntibiotic() {
    return antibioticSelect?.value || 'Цефтриаксон';
  }

  function hash(input) {
    let value = 0;
    for (let i = 0; i < input.length; i += 1) value = ((value << 5) - value) + input.charCodeAt(i);
    return Math.abs(value);
  }

  function baseResistance(region) {
    return 14 + (hash(region.pcode || region.name_en || region.name_kk) % 230) / 10;
  }

  function resistanceFor(region) {
    const profile = antibioticProfiles[activeAntibiotic()] || antibioticProfiles['Цефтриаксон'];
    return Math.max(0.5, Math.min(72, Number((baseResistance(region) * profile.factor + profile.offset).toFixed(1))));
  }

  function colorFor(value) {
    if (value >= 40) return '#d95f67';
    if (value >= 30) return '#e6a94e';
    if (value >= 20) return '#58afd1';
    return '#76c8b2';
  }

  function statsFor(region) {
    const resistance = resistanceFor(region);
    const base = baseResistance(region);
    return {
      resistance,
      isolates: Math.round(1200 + base * 155),
      labs: Math.max(2, Math.round(base / 3.1)),
      delta: Number(((resistance - 25) / 4.2).toFixed(1)),
    };
  }

  async function loadRegions() {
    let lastError;
    for (const url of sources) {
      try {
        const response = await fetch(url, { cache: 'force-cache' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data) || !data.length) throw new Error('Пустой набор регионов');
        return data;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error('Не удалось получить карту');
  }

  function tooltipHtml(region) {
    const stats = statsFor(region);
    return `<strong>${region.name_kk}</strong><span>${activeAntibiotic()} · R <b>${stats.resistance.toFixed(1).replace('.', ',')}%</b></span><span>Изолятов <b>${stats.isolates.toLocaleString('ru-RU')}</b></span>`;
  }

  function popupHtml(region) {
    const stats = statsFor(region);
    const direction = stats.delta >= 0 ? '↑' : '↓';
    return `<button class="svg-popup-close" aria-label="Закрыть">×</button>
      <span class="popup-kicker">E. coli · ${activeAntibiotic()} · демо</span>
      <h3>${region.name_kk}</h3>
      <small>${region.name_en || ''}</small>
      <div class="popup-grid">
        <div><span>R</span><strong>${stats.resistance.toFixed(1).replace('.', ',')}%</strong></div>
        <div><span>Изоляты</span><strong>${stats.isolates.toLocaleString('ru-RU')}</strong></div>
        <div><span>Лаб.</span><strong>${stats.labs}</strong></div>
      </div>
      <p>${direction} ${Math.abs(stats.delta).toFixed(1).replace('.', ',')} п.п. к условному базовому уровню. Данные демонстрационные.</p>`;
  }

  function applyViewBox(svg) {
    svg.setAttribute('viewBox', `${view.x} ${view.y} ${view.w} ${view.h}`);
  }

  function render() {
    target.querySelector('.atlas-svg-map')?.remove();
    target.querySelector('.svg-map-controls')?.remove();
    popup.classList.remove('show');

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('atlas-svg-map');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Интерактивная карта регионов Казахстана');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    applyViewBox(svg);

    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    background.setAttribute('x', '0');
    background.setAttribute('y', '0');
    background.setAttribute('width', '620');
    background.setAttribute('height', '340');
    background.setAttribute('fill', 'transparent');
    svg.appendChild(background);

    regions.forEach((region) => {
      const stats = statsFor(region);
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', region.path);
      path.setAttribute('fill', colorFor(stats.resistance));
      path.setAttribute('data-pcode', region.pcode || '');
      path.classList.add('atlas-region');

      path.addEventListener('pointerenter', (event) => {
        path.classList.add('hovered');
        tooltip.innerHTML = tooltipHtml(region);
        tooltip.classList.add('show');
        moveTooltip(event);
      });
      path.addEventListener('pointermove', moveTooltip);
      path.addEventListener('pointerleave', () => {
        path.classList.remove('hovered');
        tooltip.classList.remove('show');
      });
      path.addEventListener('click', () => {
        document.querySelectorAll('.atlas-region.selected').forEach((item) => item.classList.remove('selected'));
        path.classList.add('selected');
        popup.innerHTML = popupHtml(region);
        popup.classList.add('show');
        popup.querySelector('.svg-popup-close')?.addEventListener('click', (event) => {
          event.stopPropagation();
          popup.classList.remove('show');
          path.classList.remove('selected');
        });
      });

      svg.appendChild(path);

      if (region.cx && region.cy) {
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', region.cx);
        label.setAttribute('y', region.cy);
        label.setAttribute('text-anchor', 'middle');
        label.classList.add('atlas-region-label');
        label.textContent = `${Math.round(stats.resistance)}%`;
        svg.appendChild(label);
      }
    });

    const controls = document.createElement('div');
    controls.className = 'svg-map-controls';
    controls.innerHTML = '<button data-action="in" aria-label="Приблизить">+</button><button data-action="out" aria-label="Отдалить">−</button><button data-action="reset" aria-label="Сбросить масштаб">⌂</button>';
    controls.addEventListener('click', (event) => {
      const button = event.target.closest('button');
      if (!button) return;
      const action = button.dataset.action;
      if (action === 'reset') view = { x: 0, y: 0, w: 620, h: 340 };
      if (action === 'in') zoom(0.82);
      if (action === 'out') zoom(1.22);
      applyViewBox(svg);
    });

    target.insertBefore(svg, tooltip);
    target.appendChild(controls);
  }

  function zoom(factor) {
    const nextW = Math.max(260, Math.min(620, view.w * factor));
    const nextH = nextW * 340 / 620;
    const cx = view.x + view.w / 2;
    const cy = view.y + view.h / 2;
    view = { x: cx - nextW / 2, y: cy - nextH / 2, w: nextW, h: nextH };
  }

  function moveTooltip(event) {
    const bounds = target.getBoundingClientRect();
    const x = Math.min(bounds.width - 190, Math.max(10, event.clientX - bounds.left + 12));
    const y = Math.min(bounds.height - 90, Math.max(10, event.clientY - bounds.top + 12));
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  }

  function renderFallback() {
    target.innerHTML = `<div class="amr-map-error">Не удалось загрузить интерактивные регионы. Показываю резервную карту.</div>
      <img class="atlas-map-fallback" alt="Карта регионов Казахстана" src="https://cdn.jsdelivr.net/gh/galymorg/new_qazaqstan_GeoJSON@main/kazakhstan-regions-map-accurate.svg">`;
  }

  loadRegions()
    .then((data) => {
      regions = data;
      loading.remove();
      if (sourceLabel) sourceLabel.textContent = 'Пробная геометрия: административные границы 2024 · MIT · 17 областей + 3 города';
      render();
    })
    .catch((error) => {
      console.error('AMR Atlas SVG map load failed:', error);
      renderFallback();
    });

  if (antibioticSelect) {
    antibioticSelect.addEventListener('change', () => {
      if (caption) caption.textContent = `${activeAntibiotic()} · Казахстан · 2026 · демонстрационные значения`;
      if (regions.length) render();
    });
  }
})();