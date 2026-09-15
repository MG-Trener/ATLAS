(() => {
  const target = document.getElementById('kazakhstan-map');
  if (!target || typeof L === 'undefined') return;

  const loading = document.createElement('div');
  loading.className = 'amr-map-loading';
  loading.textContent = 'Загрузка реальных границ Казахстана…';
  target.appendChild(loading);

  const antibioticSelect = document.getElementById('map-antibiotic');
  let geoLayer = null;

  const map = L.map(target, {
    zoomControl: true,
    attributionControl: true,
    minZoom: 3,
    maxZoom: 8,
    scrollWheelZoom: false,
    doubleClickZoom: true,
    boxZoom: false,
  });

  map.attributionControl.setPrefix('');
  map.attributionControl.addAttribution('Границы: geoBoundaries / OpenStreetMap');

  const boundaryApi = 'https://www.geoboundaries.org/api/current/gbOpen/KAZ/ADM1/';

  const demoOverrides = {
    'Astana': 28.6,
    'Almaty': 33.2,
    'East Kazakhstan': 36.4,
    'Karaganda': 26.1,
    'Aktobe': 21.4,
    'Pavlodar': 22.7,
    'West Kazakhstan': 14.8,
    'North Kazakhstan': 18.3,
    'South Kazakhstan': 20.6,
    'Akmola': 23.7,
    'Atyrau': 19.2,
    'Kostanay': 17.6,
    'Kyzylorda': 25.4,
    'Mangystau': 24.1,
    'Zhambyl': 29.8,
    'Almaty Region': 31.1,
  };

  const antibioticProfiles = {
    'Цефтриаксон': { factor: 1, offset: 0 },
    'Ципрофлоксацин': { factor: 1.08, offset: 3.2 },
    'Меропенем': { factor: 0.13, offset: -0.8 },
  };

  const ruNames = {
    'Astana': 'Астана',
    'Almaty': 'Алматы',
    'East Kazakhstan': 'Восточно-Казахстанская область',
    'Karaganda': 'Карагандинская область',
    'Aktobe': 'Актюбинская область',
    'Pavlodar': 'Павлодарская область',
    'West Kazakhstan': 'Западно-Казахстанская область',
    'North Kazakhstan': 'Северо-Казахстанская область',
    'South Kazakhstan': 'Южно-Казахстанская область',
    'Akmola': 'Акмолинская область',
    'Atyrau': 'Атырауская область',
    'Kostanay': 'Костанайская область',
    'Kyzylorda': 'Кызылординская область',
    'Mangystau': 'Мангистауская область',
    'Zhambyl': 'Жамбылская область',
    'Almaty Region': 'Алматинская область',
  };

  function activeAntibiotic() {
    return antibioticSelect?.value || 'Цефтриаксон';
  }

  function fallbackValue(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i += 1) hash = ((hash << 5) - hash) + name.charCodeAt(i);
    return 15 + (Math.abs(hash) % 210) / 10;
  }

  function baseResistance(name) {
    if (Object.prototype.hasOwnProperty.call(demoOverrides, name)) return demoOverrides[name];
    return Number(fallbackValue(name).toFixed(1));
  }

  function resistanceFor(name) {
    const base = baseResistance(name);
    const profile = antibioticProfiles[activeAntibiotic()] || antibioticProfiles['Цефтриаксон'];
    return Math.max(0.4, Math.min(72, Number((base * profile.factor + profile.offset).toFixed(1))));
  }

  function colorFor(value) {
    if (value >= 40) return '#d95f67';
    if (value >= 30) return '#e6a94e';
    if (value >= 20) return '#58afd1';
    return '#76c8b2';
  }

  function regionName(feature) {
    const raw = feature?.properties?.shapeName || feature?.properties?.NAME_1 || 'Регион';
    return {
      raw,
      display: ruNames[raw] || raw,
    };
  }

  function statPack(name) {
    const resistance = resistanceFor(name);
    const isolates = Math.round(1800 + baseResistance(name) * 137);
    const labs = Math.max(3, Math.round(baseResistance(name) / 2.8));
    const delta = Number(((resistance - 24.5) / 4.3).toFixed(1));
    return { resistance, isolates, labs, delta };
  }

  function baseStyle(feature) {
    const { raw } = regionName(feature);
    const stats = statPack(raw);
    return {
      color: '#ffffff',
      weight: 1.5,
      opacity: 1,
      fillColor: colorFor(stats.resistance),
      fillOpacity: 0.78,
    };
  }

  function tooltipHtml(display, stats) {
    return `<div class="amr-region-tooltip"><strong>${display}</strong><span>${activeAntibiotic()} · R <b>${stats.resistance.toFixed(1).replace('.', ',')}%</b></span><span>Изолятов <b>${stats.isolates.toLocaleString('ru-RU')}</b></span></div>`;
  }

  function popupHtml(display, stats) {
    const direction = stats.delta >= 0 ? '↑' : '↓';
    const deltaAbs = Math.abs(stats.delta).toFixed(1).replace('.', ',');
    return `
      <div class="region-popup">
        <span class="popup-kicker">E. coli · ${activeAntibiotic()} · демо</span>
        <h3>${display}</h3>
        <div class="popup-grid">
          <div><span>R</span><strong>${stats.resistance.toFixed(1).replace('.', ',')}%</strong></div>
          <div><span>Изоляты</span><strong>${stats.isolates.toLocaleString('ru-RU')}</strong></div>
          <div><span>Лаб.</span><strong>${stats.labs}</strong></div>
        </div>
        <p>${direction} ${deltaAbs} п.п. к условному базовому уровню. Показатели пока демонстрационные.</p>
      </div>`;
  }

  fetch(boundaryApi)
    .then((response) => {
      if (!response.ok) throw new Error(`geoBoundaries API HTTP ${response.status}`);
      return response.json();
    })
    .then((metadata) => {
      const geometryUrl = metadata.simplifiedGeometryGeoJSON || metadata.gjDownloadURL;
      if (!geometryUrl) throw new Error('В ответе geoBoundaries отсутствует ссылка на GeoJSON');
      return fetch(geometryUrl);
    })
    .then((response) => {
      if (!response.ok) throw new Error(`GeoJSON HTTP ${response.status}`);
      return response.json();
    })
    .then((geojson) => {
      loading.remove();

      geoLayer = L.geoJSON(geojson, {
        style: baseStyle,
        onEachFeature(feature, polygon) {
          const { raw, display } = regionName(feature);
          polygon.bindTooltip('', { sticky: true, direction: 'top', className: 'amr-hover-tooltip' });

          polygon.on({
            mouseover(event) {
              const current = event.target;
              const stats = statPack(raw);
              current.setTooltipContent(tooltipHtml(display, stats));
              current.setStyle({ weight: 3, color: '#174e72', fillOpacity: 0.92 });
              current.bringToFront();
            },
            mouseout(event) {
              geoLayer.resetStyle(event.target);
            },
            click(event) {
              const stats = statPack(raw);
              L.popup({ maxWidth: 300, closeButton: true })
                .setLatLng(event.latlng)
                .setContent(popupHtml(display, stats))
                .openOn(map);
            },
          });
        },
      }).addTo(map);

      map.fitBounds(geoLayer.getBounds(), { padding: [18, 18] });
    })
    .catch((error) => {
      console.error('AMR Atlas map load failed:', error);
      loading.className = 'amr-map-error';
      loading.textContent = 'Не удалось загрузить геометрию карты из geoBoundaries.';
      map.setView([48.1, 67.2], 4);
    });

  if (antibioticSelect) {
    antibioticSelect.addEventListener('change', () => {
      const caption = document.getElementById('map-caption');
      if (caption) caption.textContent = `${antibioticSelect.value} · Казахстан · 2026 · демонстрационные значения`;
      map.closePopup();
      if (geoLayer) geoLayer.setStyle(baseStyle);
    });
  }
})();
