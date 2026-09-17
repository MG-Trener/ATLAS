(() => {
  const target = document.getElementById('kazakhstan-map');
  if (!target) return;

  const dashboardReady = new Promise((resolve) => {
    if (window.__atlasDashboardLoaded) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = './dashboard.js?v=20260917-1';
    script.onload = () => {
      window.__atlasDashboardLoaded = true;
      resolve();
    };
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });

  const antibioticSelect = document.getElementById('map-antibiotic');
  const caption = document.getElementById('map-caption');
  const sourceLabel = document.querySelector('.amr-map-source');

  const sources = [
    './regions.json',
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
  let selectedRegionName = '';

  const i18n = () => window.AtlasPreviewI18n;
  const translate = (value) => i18n()?.translate(value) || value;
  const regionDisplayName = (region) => i18n()?.regionName(region) || region.name_kk || region.name_en || '';
  const locale = () => i18n()?.language === 'en' ? 'en-US' : i18n()?.language === 'kk' ? 'kk-KZ' : 'ru-RU';
  const decimal = (value) => Number(value).toLocaleString(locale(), { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const loading = document.createElement('div');
  loading.className = 'amr-map-loading';
  loading.textContent = translate('Загрузка контуров регионов Казахстана…');
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

  function activeAntibioticLabel() {
    return translate(activeAntibiotic());
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
        return { data, url };
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error('Не удалось получить карту');
  }

  function tooltipHtml(region) {
    const stats = statsFor(region);
    return `<strong>${regionDisplayName(region)}</strong><span>${activeAntibioticLabel()} · R <b>${decimal(stats.resistance)}%</b></span><span>${translate('Изолятов')} <b>${stats.isolates.toLocaleString(locale())}</b></span>`;
  }

  function popupHtml(region) {
    const stats = statsFor(region);
    const direction = stats.delta >= 0 ? '↑' : '↓';
    const pp = i18n()?.language === 'en' ? 'pp' : i18n()?.language === 'kk' ? 'т.п.' : 'п.п.';
    const baseline = i18n()?.language === 'en'
      ? 'vs indicative baseline. Demo data.'
      : i18n()?.language === 'kk'
        ? 'шартты базалық деңгейге қатысты. Деректер демонстрациялық.'
        : 'к условному базовому уровню. Данные демонстрационные.';
    return `<button class="svg-popup-close" aria-label="${translate('Закрыть')}">×</button>
      <span class="popup-kicker">E. coli · ${activeAntibioticLabel()} · ${translate('демонстрационные данные')}</span>
      <h3>${regionDisplayName(region)}</h3>
      <small>${region.pcode || region.name_en || ''}</small>
      <div class="popup-grid">
        <div><span>R</span><strong>${decimal(stats.resistance)}%</strong></div>
        <div><span>${translate('Изоляты')}</span><strong>${stats.isolates.toLocaleString(locale())}</strong></div>
        <div><span>${translate('Лаб.')}</span><strong>${stats.labs}</strong></div>
      </div>
      <p>${direction} ${decimal(Math.abs(stats.delta))} ${pp} ${baseline}</p>
      <button class="region-apply-button" type="button">${translate('Регион применён ко всему обзору ✓')}</button>`;
  }

  function applyViewBox(svg) {
    svg.setAttribute('viewBox', `${view.x} ${view.y} ${view.w} ${view.h}`);
  }

  function selectPathByRegion(name) {
    selectedRegionName = name || '';
    document.querySelectorAll('.atlas-region.selected').forEach((item) => item.classList.remove('selected'));
    if (!selectedRegionName || selectedRegionName === 'Казахстан') return;
    const path = [...document.querySelectorAll('.atlas-region')].find((item) => item.dataset.regionName === selectedRegionName);
    path?.classList.add('selected');
  }

  function render() {
    target.querySelector('.atlas-svg-map')?.remove();
    target.querySelector('.svg-map-controls')?.remove();
    popup.classList.remove('show');

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('atlas-svg-map');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', translate('Интерактивная карта регионов Казахстана'));
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
      path.dataset.regionName = region.name_kk || '';
      path.setAttribute('aria-label', `${regionDisplayName(region)}: R ${decimal(stats.resistance)}%`);
      path.setAttribute('tabindex', '0');
      path.classList.add('atlas-region');
      if (selectedRegionName === region.name_kk) path.classList.add('selected');

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
        selectPathByRegion(region.name_kk);
        popup.innerHTML = popupHtml(region);
        popup.classList.add('show');
        document.dispatchEvent(new CustomEvent('atlas:region-selected', {
          detail: { name: region.name_kk, displayName: regionDisplayName(region), nameEn: region.name_en || '', pcode: region.pcode || '' },
        }));
        popup.querySelector('.svg-popup-close')?.addEventListener('click', (event) => {
          event.stopPropagation();
          popup.classList.remove('show');
        });
      });
      path.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          path.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
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
    controls.innerHTML = `<button data-action="in" aria-label="${translate('Приблизить')}">+</button><button data-action="out" aria-label="${translate('Отдалить')}">−</button><button data-action="reset" aria-label="${translate('Сбросить масштаб')}">⌂</button>`;
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
    loading?.remove();
    target.innerHTML = `<div class="amr-map-error">${translate('Интерактивные контуры временно недоступны. Используется резервное изображение карты.')}</div>
      <img class="atlas-map-fallback" alt="${translate('Карта регионов Казахстана')}" src="https://cdn.jsdelivr.net/gh/galymorg/new_qazaqstan_GeoJSON@main/kazakhstan-regions-map-accurate.svg">`;
  }

  function updateCaption() {
    if (!caption) return;
    const demo = i18n()?.language === 'en' ? 'demo values' : i18n()?.language === 'kk' ? 'демонстрациялық мәндер' : 'демонстрационные значения';
    caption.textContent = `${activeAntibioticLabel()} · ${translate('Казахстан')} · 2026 YTD · ${demo}`;
  }

  loadRegions()
    .then(async ({ data, url }) => {
      regions = data;
      loading.remove();
      await dashboardReady;
      if (sourceLabel) sourceLabel.textContent = translate(url.startsWith('./')
        ? 'Локальная геометрия · 17 областей + 3 города · hover и клик активны'
        : 'Пробная геометрия 2024 · 17 областей + 3 города · hover и клик активны');
      updateCaption();
      render();
      document.dispatchEvent(new CustomEvent('atlas:map-ready', { detail: { regions } }));
    })
    .catch((error) => {
      console.error('AMR Atlas SVG map load failed:', error);
      renderFallback();
    });

  document.addEventListener('atlas:dashboard-region-changed', (event) => {
    selectPathByRegion(event.detail?.name || '');
  });

  document.addEventListener('atlas:language-changed', () => {
    loading.textContent = translate('Загрузка контуров регионов Казахстана…');
    updateCaption();
    if (regions.length) render();
  });

  if (antibioticSelect) {
    antibioticSelect.addEventListener('change', () => {
      updateCaption();
      if (regions.length) render();
    });
  }
})();
