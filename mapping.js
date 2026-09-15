(() => {
  if (window.__atlasMappingLoaded) return;
  window.__atlasMappingLoaded = true;

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = './mapping.css';
  document.head.appendChild(style);

  const normalize = (s) => String(s || '').trim().toUpperCase().replace(/\s+/g, '_');
  const candidates = {
    laboratory: ['LABORATORY','LAB','LAB_ID'],
    patient: ['PATIENT_ID','PATIENT','PAT_ID','PATIENT_NO'],
    date: ['SPEC_DATE','SPECIMEN_DATE','DATE_SPEC'],
    material: ['SPEC_TYPE','SPECIMEN','SAMPLE_TYPE','MATERIAL'],
    organism: ['ORGANISM','ORG','ORG_NAME','ORGANISM_NAME'],
  };

  function bestHeader(headers, field) {
    const upper = headers.map(normalize);
    for (const candidate of candidates[field] || []) {
      let idx = upper.findIndex(h => h === candidate);
      if (idx >= 0) return headers[idx];
      idx = upper.findIndex(h => h.includes(candidate));
      if (idx >= 0) return headers[idx];
    }
    return '';
  }

  function getCell(headers, values, selected) {
    const idx = headers.indexOf(selected);
    return idx >= 0 ? (values[idx] || '') : '';
  }

  function buildMapping(preview) {
    if (!preview || preview.hidden || preview.dataset.mappingReady === '1') return;
    const table = preview.querySelector('table');
    if (!table) return;
    const headers = [...table.querySelectorAll('thead th')].map(th => th.textContent.trim());
    const values = [...table.querySelectorAll('tbody tr:first-child td')].map(td => td.textContent.trim());
    if (!headers.length) return;
    preview.dataset.mappingReady = '1';

    const panel = document.createElement('section');
    panel.className = 'adv-panel mapping-panel';
    const options = (selected) => '<option value="">— не сопоставлено —</option>' + headers.map(h => `<option value="${h.replace(/"/g,'&quot;')}" ${h===selected?'selected':''}>${h}</option>`).join('');
    const auto = {
      laboratory: bestHeader(headers,'laboratory'),
      patient: bestHeader(headers,'patient'),
      date: bestHeader(headers,'date'),
      material: bestHeader(headers,'material'),
      organism: bestHeader(headers,'organism'),
    };
    panel.innerHTML = `
      <div class="adv-panel-head"><div><h2>Сопоставление колонок</h2><p>WHONET → внутренняя модель ATLAS</p></div><span class="mapping-status">автоопределение</span></div>
      <div class="mapping-grid">
        <label><span>Лаборатория</span><select data-map-field="laboratory">${options(auto.laboratory)}</select></label>
        <label><span>Локальный ID пациента</span><select data-map-field="patient">${options(auto.patient)}</select></label>
        <label><span>Дата образца</span><select data-map-field="date">${options(auto.date)}</select></label>
        <label><span>Материал</span><select data-map-field="material">${options(auto.material)}</select></label>
        <label><span>Микроорганизм</span><select data-map-field="organism">${options(auto.organism)}</select></label>
      </div>
      <div class="normalized-preview"><div><strong>Пример нормализованной записи</strong><small>будущий объект перед сохранением</small></div><pre id="normalized-json"></pre></div>`;
    preview.insertAdjacentElement('afterend', panel);

    function update() {
      const selected = {};
      panel.querySelectorAll('[data-map-field]').forEach(sel => selected[sel.dataset.mapField] = sel.value);
      const astHeaders = headers.filter(h => /(_NM|_ND|_MIC|_ZONE|_SIR|_INT$|AMP|CRO|CIP|AMK|MEM|VAN|LNZ|CST)/i.test(normalize(h)));
      const patientRaw = getCell(headers, values, selected.patient);
      const obj = {
        source: 'WHONET',
        laboratory_raw: getCell(headers, values, selected.laboratory),
        patient_id_raw: patientRaw,
        patient_hash: patientRaw ? 'будет рассчитан на этапе импорта' : null,
        specimen_date: getCell(headers, values, selected.date),
        specimen_type_raw: getCell(headers, values, selected.material),
        organism_raw: getCell(headers, values, selected.organism),
        ast_columns_detected: astHeaders.length,
        interpretation: 'S / I / R + MIC/zone при наличии'
      };
      panel.querySelector('#normalized-json').textContent = JSON.stringify(obj, null, 2);
      const requiredOk = selected.date && selected.material && selected.organism;
      const status = panel.querySelector('.mapping-status');
      status.textContent = requiredOk ? 'минимальные поля сопоставлены ✓' : 'нужно сопоставить обязательные поля';
      status.classList.toggle('ok', Boolean(requiredOk));
    }
    panel.querySelectorAll('select').forEach(sel => sel.addEventListener('change', update));
    update();
  }

  const observer = new MutationObserver(() => {
    const preview = document.getElementById('whonet-preview');
    if (preview && !preview.hidden) buildMapping(preview);
  });
  observer.observe(document.documentElement, {childList:true, subtree:true, attributes:true, attributeFilter:['hidden']});
})();