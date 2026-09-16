(() => {
  'use strict';

  const config = window.ATLAS_SUPABASE;
  const detailRoot = document.getElementById('reference-detail');
  if (!config?.url || !config?.publishableKey || !detailRoot) return;

  const labels = {
    ru: {mechanisms:'Механизмы резистентности', mechanismsHint:'Справочный AMR-контекст · не рекомендация по лечению', genes:'Гены / маркеры', classes:'Затрагиваемые классы', related:'Связанные препараты и маркеры', relatedHint:'Нажмите препарат, чтобы открыть его карточку', organisms:'Связанные микроорганизмы в AMR-мониторинге', core:'Ключевой', important:'Важный', watch:'Наблюдение', marker:'Маркер наблюдения', context:'AMR-контекст', phenotype:'Фенотипический контекст', loading:'Загрузка AMR-контекста…', empty:'Для этой записи расширенный AMR-контекст пока не добавлен.'},
    kk: {mechanisms:'Төзімділік механизмдері', mechanismsHint:'Анықтамалық AMR контексті · емдеу ұсынымы емес', genes:'Гендер / маркерлер', classes:'Әсер ететін кластар', related:'Байланысты препараттар мен маркерлер', relatedHint:'Карточкасын ашу үшін препаратты басыңыз', organisms:'AMR мониторингіндегі байланысты микроорганизмдер', core:'Негізгі', important:'Маңызды', watch:'Бақылау', marker:'Қадағалау маркері', context:'AMR контексті', phenotype:'Фенотиптік контекст', loading:'AMR контексті жүктелуде…', empty:'Бұл жазба үшін кеңейтілген AMR контексті әзірге қосылмаған.'},
    en: {mechanisms:'Resistance mechanisms', mechanismsHint:'Reference AMR context · not a treatment recommendation', genes:'Genes / markers', classes:'Affected classes', related:'Related agents and markers', relatedHint:'Select an agent to open its reference card', organisms:'Related organisms in AMR surveillance', core:'Core', important:'Important', watch:'Watch', marker:'Surveillance marker', context:'AMR context', phenotype:'Phenotype context', loading:'Loading AMR context…', empty:'Expanded AMR context has not yet been added for this record.'}
  };

  const cache = new Map();
  let requestNo = 0;
  const lang = () => ['ru','kk','en'].includes(localStorage.getItem('atlas-preview-language')) ? localStorage.getItem('atlas-preview-language') : 'ru';
  const t = (key) => labels[lang()]?.[key] || labels.ru[key] || key;
  const esc = (value) => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const field = (row, base) => row?.[`${base}_${lang()}`] || row?.[`${base}_en`] || row?.[`${base}_ru`] || row?.[base] || '';
  const headers = () => ({ apikey: config.publishableKey });
  const activeTab = () => document.querySelector('.reference-tabs [data-tab].active')?.dataset.tab || 'organisms';
  const activeCode = () => document.querySelector('#catalog-list .catalog-row.active')?.dataset.code || '';

  async function get(path, params = {}) {
    const url = new URL(`${config.url}/rest/v1/${path}`);
    Object.entries(params).forEach(([key,value]) => url.searchParams.set(key, value));
    const response = await fetch(url, { headers: headers() });
    if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
    return response.json();
  }

  async function organismContext(code) {
    const key = `organism:${code}`;
    if (cache.has(key)) return cache.get(key);
    const [mechanismRows, agentRows] = await Promise.all([
      get('organism_amr_context', { select:'mechanisms', organism_code:`eq.${code}` }),
      get('organism_antimicrobial_context', { select:'antimicrobials', organism_code:`eq.${code}` })
    ]);
    const data = { mechanisms: mechanismRows[0]?.mechanisms || [], antimicrobials: agentRows[0]?.antimicrobials || [] };
    cache.set(key, data);
    return data;
  }

  async function antimicrobialContext(code) {
    const key = `antimicrobial:${code}`;
    if (cache.has(key)) return cache.get(key);
    const links = await get('organism_antimicrobial_links', { select:'organism_code,relation_type,note_ru,note_kk,note_en', antimicrobial_code:`eq.${code}` });
    if (!links.length) {
      const empty = { organisms: [] };
      cache.set(key, empty);
      return empty;
    }
    const codes = [...new Set(links.map(item => item.organism_code))];
    const organisms = await get('organism_catalog', { select:'whonet_code,organism,title_ru,title_kk,title_en,priority_tag', whonet_code:`in.(${codes.join(',')})` });
    const linkByCode = new Map(links.map(item => [item.organism_code, item]));
    const data = { organisms: organisms.map(item => ({ ...item, ...(linkByCode.get(item.whonet_code) || {}) })) };
    cache.set(key, data);
    return data;
  }

  function miniChips(items) {
    const values = Array.isArray(items) ? items.filter(Boolean) : [];
    return values.length ? `<div class="amr-mini-chips">${values.map(value => `<b>${esc(value)}</b>`).join('')}</div>` : '';
  }

  function relevanceClass(value) {
    return ['core','important','watch'].includes(value) ? value : 'watch';
  }

  function relationLabel(value) {
    if (value === 'surveillance_marker') return t('marker');
    if (value === 'phenotype_context') return t('phenotype');
    return t('context');
  }

  function renderMechanisms(mechanisms) {
    if (!mechanisms.length) return '';
    return `<section class="detail-section amr-context">
      <div class="amr-context-head"><h3>${esc(t('mechanisms'))}</h3><span>${esc(t('mechanismsHint'))}</span></div>
      <div class="amr-mechanisms">${mechanisms.map(item => {
        const note = field(item, 'note');
        return `<article class="amr-mechanism">
          <div class="amr-mechanism-top"><strong>${esc(field(item, 'name'))}</strong><span class="amr-relevance ${relevanceClass(item.relevance)}">${esc(t(item.relevance))}</span></div>
          <p>${esc(field(item, 'description'))}</p>
          ${note ? `<p class="amr-mechanism-note">${esc(note)}</p>` : ''}
          ${item.gene_examples?.length ? `<div class="amr-subline"><span>${esc(t('genes'))}</span>${miniChips(item.gene_examples)}</div>` : ''}
          ${item.affected_classes?.length ? `<div class="amr-subline"><span>${esc(t('classes'))}</span>${miniChips(item.affected_classes)}</div>` : ''}
        </article>`;
      }).join('')}</div>
    </section>`;
  }

  function renderAgents(agents) {
    if (!agents.length) return '';
    return `<section class="detail-section amr-context">
      <div class="amr-context-head"><h3>${esc(t('related'))}</h3><span>${esc(t('relatedHint'))}</span></div>
      <div class="amr-agent-list">${agents.map(item => {
        const name = lang() === 'ru' ? (item.name_ru || item.name) : lang() === 'kk' ? (item.name_kk || item.name) : (item.name_en || item.name);
        const marker = item.relation_type === 'surveillance_marker' ? ' marker' : '';
        return `<button type="button" class="amr-agent${marker}" data-atlas-drug="${esc(item.code)}">
          <span class="amr-agent-top"><strong>${esc(name)}</strong><code>${esc(item.code)}</code></span>
          <small>${esc([item.class_name,item.who_aware].filter(Boolean).join(' · '))}</small>
          <em>${esc(relationLabel(item.relation_type))}</em>
        </button>`;
      }).join('')}</div>
    </section>`;
  }

  function renderOrganisms(organisms) {
    if (!organisms.length) return '';
    return `<section class="detail-section amr-context">
      <div class="amr-context-head"><h3>${esc(t('organisms'))}</h3><span>${esc(t('mechanismsHint'))}</span></div>
      <div class="amr-organism-list">${organisms.map(item => {
        const name = lang() === 'ru' ? (item.title_ru || item.organism) : lang() === 'kk' ? (item.title_kk || item.organism) : (item.title_en || item.organism);
        return `<button type="button" class="amr-organism-link" data-atlas-organism="${esc(item.whonet_code)}"><i>${esc(name)}</i> · ${esc(relationLabel(item.relation_type))}</button>`;
      }).join('')}</div>
    </section>`;
  }

  async function enhanceDetail() {
    const card = detailRoot.querySelector('.detail-card');
    const code = activeCode();
    const tab = activeTab();
    if (!card || !code) return;
    const marker = `${tab}:${code}:${lang()}`;
    if (card.dataset.amrEnhanced === marker) return;
    card.dataset.amrEnhanced = marker;
    const token = ++requestNo;
    const loading = document.createElement('section');
    loading.className = 'detail-section amr-context';
    loading.innerHTML = `<div class="amr-context-loading">${esc(t('loading'))}</div>`;
    card.appendChild(loading);
    try {
      const data = tab === 'organisms' ? await organismContext(code) : await antimicrobialContext(code);
      if (token !== requestNo || !card.isConnected || card.dataset.amrEnhanced !== marker) return;
      loading.remove();
      const html = tab === 'organisms'
        ? `${renderMechanisms(data.mechanisms)}${renderAgents(data.antimicrobials)}`
        : renderOrganisms(data.organisms);
      if (html) card.insertAdjacentHTML('beforeend', html);
      else card.insertAdjacentHTML('beforeend', `<section class="detail-section amr-context"><div class="amr-context-empty">${esc(t('empty'))}</div></section>`);
    } catch (error) {
      console.error('AMR Atlas context load failed:', error);
      if (loading.isConnected) loading.innerHTML = `<div class="amr-context-empty">${esc(t('empty'))}</div>`;
    }
  }

  detailRoot.addEventListener('click', event => {
    const drug = event.target.closest('[data-atlas-drug]');
    if (drug) {
      location.href = `./reference.html?tab=antimicrobials&drug=${encodeURIComponent(drug.dataset.atlasDrug)}`;
      return;
    }
    const organism = event.target.closest('[data-atlas-organism]');
    if (organism) location.href = `./reference.html?tab=organisms&organism=${encodeURIComponent(organism.dataset.atlasOrganism)}`;
  });

  const observer = new MutationObserver(() => enhanceDetail());
  observer.observe(detailRoot, { childList:true });

  function applyDeepLink() {
    const params = new URLSearchParams(location.search);
    const wanted = params.get(activeTab() === 'antimicrobials' ? 'drug' : 'organism');
    if (!wanted) return;
    const search = document.getElementById('reference-search');
    if (!search || search.dataset.deepLinked === wanted) return;
    search.dataset.deepLinked = wanted;
    search.value = wanted;
    search.dispatchEvent(new Event('input', { bubbles:true }));
  }

  setTimeout(() => { applyDeepLink(); enhanceDetail(); }, 650);
  setTimeout(applyDeepLink, 1200);
})();
