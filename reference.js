(() => {
  'use strict';

  const config = window.ATLAS_SUPABASE;
  if (!config?.url || !config?.publishableKey) {
    console.error('AMR Atlas: Supabase config is missing');
    return;
  }

  const dict = {
    ru: {
      brandSub:'Данные сегодня.<br>Здоровье завтра.',dashboard:'Обзор',organisms:'Микроорганизмы',antimicrobials:'Антимикробные препараты',map:'Карта',sourceTitle:'Источник справочника',liveDb:'Supabase подключена',back:'← В обзор',atlas:'AMR Atlas',reference:'Справочники',title:'Справочник микроорганизмов и антимикробных препаратов',subtitle:'Полный структурированный каталог WHONET с таксономией, кодами, классификацией AWaRe и расширенными клиническими описаниями.',activeVersion:'Активная версия',organismCodes:'WHONET-кодов микроорганизмов',drugCodes:'Кодов антимикробных препаратов',fullSource:'полный источник',accessMode:'Доступ с сайта',readOnly:'Только чтение',searchOrganisms:'Код, название, род, семейство…',searchDrugs:'Код, препарат, класс, ATC…',reset:'Сбросить',perPage:'На странице',loading:'Загрузка справочника из Supabase…',prev:'Назад',next:'Далее',selectRecord:'Выберите запись',selectRecordText:'Справа появятся описание, классификация, коды и клиническая значимость.',descriptionPolicy:'Как устроены описания',descriptionPolicyText:'Для всех записей доступно структурированное описание из WHONET. Для ключевых AMR-патогенов и препаратов мы постепенно добавляем расширенный клинический текст на русском, казахском и английском языках.',allKingdoms:'Все царства',allStatuses:'Все статусы',commonOnly:'Только распространённые',currentOnly:'Текущая номенклатура',obsoleteOnly:'Устаревшие/заменённые',allAware:'Все WHO AWaRe',allScopes:'Все области применения',human:'Для человека',veterinary:'Ветеринария',results:'записей',page:'Страница',of:'из',noResults:'Ничего не найдено',loadError:'Не удалось получить справочник из Supabase.',code:'WHONET-код',taxonomy:'Таксономия',identifiers:'Идентификаторы',clinical:'Клиническая значимость',amr:'Значение для AMR',aliases:'Синонимы / варианты',status:'Статус',common:'Распространённый',yes:'Да',no:'Нет',kingdom:'Царство',phylum:'Тип',class:'Класс',order:'Порядок',family:'Семейство',genus:'Род',snomed:'SNOMED CT',gbif:'GBIF Taxon ID',replacedBy:'Заменён на',agentClass:'Класс препарата',subclass:'Подкласс',aware:'WHO AWaRe',atc:'ATC',scope:'Применение',guidelines:'Стандарты / источники',potencies:'Варианты дисков / концентраций',mechanism:'Механизм действия',clinicalNote:'Клиническая / AMR-заметка',structured:'Структурированная запись WHONET',priority:'Приоритет AMR',humanVet:'Человек / ветеринария',unknown:'—',current:'Текущий',obsolete:'Устаревший / альтернативный',all:'Все'
    },
    kk: {
      brandSub:'Деректер бүгін.<br>Денсаулық ертең.',dashboard:'Шолу',organisms:'Микроорганизмдер',antimicrobials:'Микробқа қарсы препараттар',map:'Карта',sourceTitle:'Анықтамалық дереккөзі',liveDb:'Supabase қосылған',back:'← Шолуға',atlas:'AMR Atlas',reference:'Анықтамалықтар',title:'Микроорганизмдер мен микробқа қарсы препараттар анықтамалығы',subtitle:'Таксономиясы, кодтары, AWaRe жіктемесі және кеңейтілген клиникалық сипаттамалары бар толық WHONET каталогы.',activeVersion:'Белсенді нұсқа',organismCodes:'WHONET микроорганизм кодтары',drugCodes:'Микробқа қарсы препарат кодтары',fullSource:'толық дереккөз',accessMode:'Сайттан қолжетімділік',readOnly:'Тек оқу',searchOrganisms:'Код, атау, туыс, тұқымдас…',searchDrugs:'Код, препарат, класс, ATC…',reset:'Тазалау',perPage:'Бетте',loading:'Supabase анықтамалығы жүктелуде…',prev:'Артқа',next:'Келесі',selectRecord:'Жазбаны таңдаңыз',selectRecordText:'Оң жақта сипаттама, жіктеу, кодтар және клиникалық маңыз көрсетіледі.',descriptionPolicy:'Сипаттамалар қалай құрылған',descriptionPolicyText:'Барлық жазбаларда WHONET-тен құрылымдық сипаттама бар. Негізгі AMR патогендері мен препараттары үшін орыс, қазақ және ағылшын тілдерінде кеңейтілген клиникалық мәтін біртіндеп қосылады.',allKingdoms:'Барлық патшалықтар',allStatuses:'Барлық мәртебелер',commonOnly:'Тек жиі кездесетіндер',currentOnly:'Ағымдағы номенклатура',obsoleteOnly:'Ескірген / ауыстырылған',allAware:'Барлық WHO AWaRe',allScopes:'Барлық қолданылу салалары',human:'Адам медицинасы',veterinary:'Ветеринария',results:'жазба',page:'Бет',of:'ішінен',noResults:'Ештеңе табылмады',loadError:'Supabase анықтамалығын алу мүмкін болмады.',code:'WHONET коды',taxonomy:'Таксономия',identifiers:'Идентификаторлар',clinical:'Клиникалық маңыз',amr:'AMR үшін маңызы',aliases:'Синонимдер / нұсқалар',status:'Мәртебе',common:'Жиі кездесетін',yes:'Иә',no:'Жоқ',kingdom:'Патшалық',phylum:'Тип',class:'Класс',order:'Қатар',family:'Тұқымдас',genus:'Туыс',snomed:'SNOMED CT',gbif:'GBIF Taxon ID',replacedBy:'Ауыстырылған',agentClass:'Препарат класы',subclass:'Кіші класс',aware:'WHO AWaRe',atc:'ATC',scope:'Қолданылуы',guidelines:'Стандарттар / дереккөздер',potencies:'Диск / концентрация нұсқалары',mechanism:'Әсер ету механизмі',clinicalNote:'Клиникалық / AMR ескертпе',structured:'WHONET құрылымдық жазбасы',priority:'AMR басымдығы',humanVet:'Адам / ветеринария',unknown:'—',current:'Ағымдағы',obsolete:'Ескірген / балама',all:'Барлығы'
    },
    en: {
      brandSub:'Data today.<br>Health tomorrow.',dashboard:'Overview',organisms:'Microorganisms',antimicrobials:'Antimicrobials',map:'Map',sourceTitle:'Reference source',liveDb:'Supabase connected',back:'← Back to overview',atlas:'AMR Atlas',reference:'Reference',title:'Microorganism and antimicrobial reference catalog',subtitle:'Complete structured WHONET catalog with taxonomy, codes, AWaRe classification and expanded clinical descriptions.',activeVersion:'Active version',organismCodes:'WHONET organism codes',drugCodes:'Antimicrobial codes',fullSource:'complete source',accessMode:'Website access',readOnly:'Read only',searchOrganisms:'Code, name, genus, family…',searchDrugs:'Code, agent, class, ATC…',reset:'Reset',perPage:'Per page',loading:'Loading reference data from Supabase…',prev:'Previous',next:'Next',selectRecord:'Select a record',selectRecordText:'Description, classification, identifiers and clinical relevance will appear here.',descriptionPolicy:'How descriptions work',descriptionPolicyText:'Every record includes structured WHONET metadata. Expanded clinical text in Russian, Kazakh and English is being added progressively for priority AMR pathogens and agents.',allKingdoms:'All kingdoms',allStatuses:'All statuses',commonOnly:'Common only',currentOnly:'Current nomenclature',obsoleteOnly:'Obsolete / replaced',allAware:'All WHO AWaRe',allScopes:'All scopes',human:'Human',veterinary:'Veterinary',results:'records',page:'Page',of:'of',noResults:'No results found',loadError:'Could not load the Supabase reference catalog.',code:'WHONET code',taxonomy:'Taxonomy',identifiers:'Identifiers',clinical:'Clinical significance',amr:'AMR relevance',aliases:'Aliases / variants',status:'Status',common:'Common',yes:'Yes',no:'No',kingdom:'Kingdom',phylum:'Phylum',class:'Class',order:'Order',family:'Family',genus:'Genus',snomed:'SNOMED CT',gbif:'GBIF Taxon ID',replacedBy:'Replaced by',agentClass:'Agent class',subclass:'Subclass',aware:'WHO AWaRe',atc:'ATC',scope:'Scope',guidelines:'Guidelines / sources',potencies:'Disk / concentration variants',mechanism:'Mechanism of action',clinicalNote:'Clinical / AMR note',structured:'Structured WHONET record',priority:'AMR priority',humanVet:'Human / veterinary',unknown:'—',current:'Current',obsolete:'Obsolete / alternative',all:'All'
    }
  };
  Object.assign(dict.ru,{priorityCrab:'WHO BPPL 2024: карбапенем-резистентный A. baumannii · критический приоритет',astContext:'Важно: breakpoint, категория S/I/R и допустимый метод зависят от пары организм × препарат, стандарта и его версии. Перечень дисков ниже — справочная метаинформация WHONET, а не универсальная инструкция по тестированию.'});
  Object.assign(dict.kk,{priorityCrab:'WHO BPPL 2024: карбапенемге төзімді A. baumannii · критикалық басымдық',astContext:'Маңызды: breakpoint, S/I/R санаты және рұқсат етілген әдіс организм × препарат жұбына, стандартқа және оның нұсқасына тәуелді. Төмендегі дискілер тізімі — әмбебап тестілеу нұсқауы емес, WHONET анықтамалық метадеректері.'});
  Object.assign(dict.en,{priorityCrab:'WHO BPPL 2024: carbapenem-resistant A. baumannii · critical priority',astContext:'Important: breakpoints, S/I/R categories and valid methods depend on the organism × agent pair, standard and version. Disk variants below are WHONET reference metadata, not universal testing instructions.'});

  Object.assign(dict.ru,{workspaceTitle:'Справочник AMR',workspaceSubtitle:'Микроорганизмы, препараты и их клинический контекст.',knowledgeBase:'БАЗА ЗНАНИЙ · WHONET',sourceVersion:'Источник и версия',backToCatalog:'← К списку',skipSearch:'Перейти к поиску'});
  Object.assign(dict.kk,{workspaceTitle:'AMR анықтамалығы',workspaceSubtitle:'Микроорганизмдер, препараттар және олардың клиникалық контексті.',knowledgeBase:'БІЛІМ БАЗАСЫ · WHONET',sourceVersion:'Дереккөз және нұсқа',backToCatalog:'← Тізімге',skipSearch:'Іздеуге өту'});
  Object.assign(dict.en,{workspaceTitle:'AMR reference',workspaceSubtitle:'Organisms, antimicrobials and their clinical context.',knowledgeBase:'KNOWLEDGE BASE · WHONET',sourceVersion:'Source and version',backToCatalog:'← Back to list',skipSearch:'Skip to search'});

  const state = {
    language: ['ru','kk','en'].includes(localStorage.getItem('atlas-preview-language')) ? localStorage.getItem('atlas-preview-language') : 'ru',
    tab: new URLSearchParams(location.search).get('tab') === 'antimicrobials' ? 'antimicrobials' : 'organisms',
    search: '', primary: '', secondary: '', page: 1, pageSize: 50, total: 0, rows: [], selected: null, requestId: 0
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const els = {
    search: $('#reference-search'), primary: $('#filter-primary'), secondary: $('#filter-secondary'), clear: $('#clear-filters'),
    pageSize: $('#page-size'), loading: $('#catalog-loading'), error: $('#catalog-error'), list: $('#catalog-list'), detail: $('#reference-detail'),
    summary: $('#result-summary'), pageLabel: $('#page-label'), prev: $('#prev-page'), next: $('#next-page'), listTitle: $('#list-title')
  };

  const t = (key) => dict[state.language]?.[key] ?? dict.ru[key] ?? key;
  const esc = (value) => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const clean = (value) => value == null || value === '' ? t('unknown') : value;
  const list = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
  const langField = (row, base) => row[`${base}_${state.language}`] || row[`${base}_en`] || row[`${base}_ru`] || row[base] || '';
  const priorityLabel = row => row.whonet_code === 'aba' && /critical/i.test(row.priority_tag || '') ? t('priorityCrab') : row.priority_tag;

  function applyLanguage() {
    document.documentElement.lang = state.language === 'kk' ? 'kk' : state.language;
    localStorage.setItem('atlas-preview-language', state.language);
    $$('[data-lang]').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === state.language));
    $$('[data-i18n]').forEach(node => { const value = t(node.dataset.i18n); if (value != null) node.innerHTML = value; });
    $$('[data-i18n-placeholder]').forEach(node => node.setAttribute('placeholder', t(node.dataset.i18nPlaceholder)));
    els.search.setAttribute('aria-label',t(state.tab==='organisms'?'searchOrganisms':'searchDrugs'));
    configureFilters(false);
    renderList();
    renderDetail();
    updateSummary();
  }

  function configureFilters(reset = true) {
    if (reset) { state.primary = ''; state.secondary = ''; state.page = 1; }
    const primaryValue = state.primary;
    const secondaryValue = state.secondary;
    if (state.tab === 'organisms') {
      els.primary.innerHTML = `<option value="">${esc(t('allKingdoms'))}</option><option value="Bacteria">Bacteria</option><option value="Fungi">Fungi</option><option value="Protozoa">Protozoa</option>`;
      els.secondary.innerHTML = `<option value="">${esc(t('allStatuses'))}</option><option value="common">${esc(t('commonOnly'))}</option><option value="current">${esc(t('currentOnly'))}</option><option value="obsolete">${esc(t('obsoleteOnly'))}</option>`;
      els.search.setAttribute('placeholder', t('searchOrganisms'));
      els.search.setAttribute('aria-label', t('searchOrganisms'));
    } else {
      els.primary.innerHTML = `<option value="">${esc(t('allAware'))}</option><option value="Access">Access</option><option value="Watch">Watch</option><option value="Reserve">Reserve</option>`;
      els.secondary.innerHTML = `<option value="">${esc(t('allScopes'))}</option><option value="human">${esc(t('human'))}</option><option value="veterinary">${esc(t('veterinary'))}</option>`;
      els.search.setAttribute('placeholder', t('searchDrugs'));
      els.search.setAttribute('aria-label', t('searchDrugs'));
    }
    els.primary.value = primaryValue;
    els.secondary.value = secondaryValue;
  }

  function apiUrl() {
    const table = state.tab === 'organisms' ? 'organism_catalog' : 'antimicrobial_catalog';
    const params = new URLSearchParams();
    params.set('select', '*');
    params.set('limit', String(state.pageSize));
    params.set('offset', String((state.page - 1) * state.pageSize));
    params.set('order', state.tab === 'organisms' ? 'organism.asc' : 'antimicrobial.asc');

    if (state.search.trim()) {
      const q = state.search.trim().replace(/[,*()]/g, ' ');
      if (state.tab === 'organisms') params.set('or', `(whonet_code.ilike.*${q}*,organism.ilike.*${q}*,genus.ilike.*${q}*,family.ilike.*${q}*,sct_text.ilike.*${q}*)`);
      else params.set('or', `(whonet_code.ilike.*${q}*,antimicrobial.ilike.*${q}*,class_name.ilike.*${q}*,atc_code.ilike.*${q}*)`);
    }

    if (state.tab === 'organisms') {
      if (state.primary) params.set('kingdom', `eq.${state.primary}`);
      if (state.secondary === 'common') params.set('is_common', 'eq.true');
      if (state.secondary === 'current') params.set('taxonomic_status', 'eq.C');
      if (state.secondary === 'obsolete') params.set('taxonomic_status', 'eq.O');
    } else {
      if (state.primary) params.set('who_aware', `eq.${state.primary}`);
      if (state.secondary === 'human') params.set('human', 'eq.true');
      if (state.secondary === 'veterinary') params.set('veterinary', 'eq.true');
    }
    return `${config.url}/rest/v1/${table}?${params.toString()}`;
  }

  async function loadCatalog({ keepSelection = false } = {}) {
    const requestId = ++state.requestId;
    els.loading.hidden = false;
    els.list.hidden = true;
    els.error.hidden = true;
    try {
      const response = await fetch(apiUrl(), {
        headers: { apikey: config.publishableKey, Prefer: 'count=exact' }
      });
      if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
      const rows = await response.json();
      if (requestId !== state.requestId) return;
      const range = response.headers.get('content-range') || '';
      const total = Number(range.split('/')[1]);
      state.total = Number.isFinite(total) ? total : rows.length;
      state.rows = rows;
      if (!keepSelection || !state.selected || !rows.some(row => row.whonet_code === state.selected.whonet_code)) state.selected = rows[0] || null;
      renderList();
      renderDetail();
      updateSummary();
      els.list.hidden = false;
    } catch (error) {
      console.error('AMR Atlas reference load failed:', error);
      if (requestId !== state.requestId) return;
      els.error.textContent = `${t('loadError')} ${error?.message || ''}`;
      els.error.hidden = false;
      state.rows = [];
      state.selected = null;
      state.total = 0;
      renderDetail();
      updateSummary();
    } finally {
      if (requestId === state.requestId) els.loading.hidden = true;
    }
  }

  function organismBadge(row) {
    if (row.priority_tag) return `<span class="ref-badge priority">${esc(row.priority_tag)}</span>`;
    if (row.is_common) return `<span class="ref-badge">${esc(t('common'))}</span>`;
    return `<span class="ref-badge">${esc(row.organism_type || row.taxonomic_status || t('structured'))}</span>`;
  }

  function antimicrobialBadge(row) {
    const cls = row.who_aware === 'Reserve' ? 'reserve' : row.who_aware === 'Watch' ? 'watch' : '';
    return `<span class="ref-badge ${cls}">${esc(row.who_aware || row.profile_class || t('structured'))}</span>`;
  }

  function renderList() {
    if (!els.list || !state.rows) return;
    els.listTitle.textContent = state.tab === 'organisms' ? t('organisms') : t('antimicrobials');
    if (!state.rows.length) {
      els.list.innerHTML = `<div class="detail-empty" style="min-height:360px"><span>⌕</span><strong>${esc(t('noResults'))}</strong></div>`;
      return;
    }
    els.list.innerHTML = state.rows.map(row => {
      const active = state.selected?.whonet_code === row.whonet_code ? ' active' : '';
      if (state.tab === 'organisms') {
        return `<button class="catalog-row${active}" type="button" aria-pressed="${Boolean(active)}" data-code="${esc(row.whonet_code)}"><span class="ref-code">${esc(row.whonet_code)}</span><span class="ref-name"><strong><i>${esc(row.organism)}</i></strong><small>${esc([row.genus,row.family].filter(Boolean).join(' · '))}</small></span><span class="ref-meta">${esc(row.kingdom || row.organism_type || '')}</span>${organismBadge(row)}<span class="arrow">›</span></button>`;
      }
      const displayName = state.language === 'ru' ? (row.name_ru || row.antimicrobial) : state.language === 'kk' ? (row.name_kk || row.antimicrobial) : (row.name_en || row.antimicrobial);
      return `<button class="catalog-row${active}" type="button" aria-pressed="${Boolean(active)}" data-code="${esc(row.whonet_code)}"><span class="ref-code">${esc(row.whonet_code)}</span><span class="ref-name"><strong>${esc(displayName)}</strong><small>${esc(row.antimicrobial)}</small></span><span class="ref-meta">${esc(row.class_name || row.profile_class || '')}</span>${antimicrobialBadge(row)}<span class="arrow">›</span></button>`;
    }).join('');
    $$('.catalog-row').forEach(button => button.addEventListener('click', () => {
      state.selected = state.rows.find(row => row.whonet_code === button.dataset.code) || null;
      renderList();
      renderDetail();
      els.detail.scrollTop=0;
      document.getElementById('catalog-workspace').classList.add('show-detail');
      if(matchMedia('(max-width:760px)').matches){els.detail.focus({preventScroll:true});document.getElementById('back-to-catalog').scrollIntoView({block:'start'});}
      else document.querySelector(`.catalog-row[data-code="${CSS.escape(button.dataset.code)}"]`)?.focus({preventScroll:true});
    }));
  }

  function grid(items) {
    return `<div class="detail-grid">${items.map(([label,value]) => `<div><span>${esc(label)}</span><strong>${esc(clean(value))}</strong></div>`).join('')}</div>`;
  }

  function chips(items) {
    const values = list(items);
    return values.length ? `<div class="chip-list">${values.map(item => `<span>${esc(item)}</span>`).join('')}</div>` : `<span>${esc(t('unknown'))}</span>`;
  }

  function renderDetail() {
    const row = state.selected;
    if (!row) {
      els.detail.innerHTML = `<div class="detail-empty"><span>◎</span><strong>${esc(t('selectRecord'))}</strong><p>${esc(t('selectRecordText'))}</p></div>`;
      return;
    }

    if (state.tab === 'organisms') {
      const description = langField(row, 'description');
      const clinical = langField(row, 'clinical_significance');
      const amr = langField(row, 'amr_relevance');
      const statusLabel = row.taxonomic_status === 'C' ? t('current') : row.taxonomic_status === 'O' ? t('obsolete') : row.taxonomic_status;
      els.detail.innerHTML = `<div class="detail-card">
        <div class="detail-top"><div><span class="detail-kicker">${esc(t('structured'))}</span><h2><i>${esc(row.organism)}</i></h2><p>${esc(priorityLabel(row) || [row.kingdom,row.family].filter(Boolean).join(' · '))}</p></div><span class="detail-code">${esc(row.whonet_code)}</span></div>
        <div class="detail-description">${esc(description || `${t('code')}: ${row.whonet_code}`)}</div>
        <section class="detail-section"><h3>${esc(t('taxonomy'))}</h3>${grid([[t('status'),statusLabel],[t('common'),row.is_common?t('yes'):t('no')],[t('kingdom'),row.kingdom],[t('phylum'),row.phylum],[t('class'),row.taxonomic_class],[t('order'),row.taxonomic_order],[t('family'),row.family],[t('genus'),row.genus]])}</section>
        <section class="detail-section"><h3>${esc(t('identifiers'))}</h3>${grid([[t('code'),row.whonet_code],[t('snomed'),row.sct_code],[t('gbif'),row.gbif_taxon_id],[t('replacedBy'),row.replaced_by]])}</section>
        <section class="detail-section"><h3>${esc(t('aliases'))}</h3>${chips(row.aliases)}</section>
        ${(clinical || amr) ? `<section class="detail-section"><h3>${esc(t('clinical'))}</h3><div class="detail-text">${clinical?`<div><span>${esc(t('clinical'))}</span><p>${esc(clinical)}</p></div>`:''}${amr?`<div><span>${esc(t('amr'))}</span><p>${esc(amr)}</p></div>`:''}</div></section>` : ''}
      </div>`;
      return;
    }

    const displayName = state.language === 'ru' ? (row.name_ru || row.antimicrobial) : state.language === 'kk' ? (row.name_kk || row.antimicrobial) : (row.name_en || row.antimicrobial);
    const description = langField(row, 'description');
    const mechanism = langField(row, 'mechanism');
    const note = langField(row, 'clinical_note');
    const scope = [row.human ? t('human') : '', row.veterinary ? t('veterinary') : ''].filter(Boolean).join(' + ');
    els.detail.innerHTML = `<div class="detail-card">
      <div class="detail-top"><div><span class="detail-kicker">${esc(t('structured'))}</span><h2>${esc(displayName)}</h2><p>${esc(row.antimicrobial)}</p></div><span class="detail-code">${esc(row.whonet_code)}</span></div>
      <div class="detail-description">${esc(description)}</div>
      <div class="detail-description detail-method-warning">${esc(t('astContext'))}</div>
      <section class="detail-section"><h3>${esc(t('agentClass'))}</h3>${grid([[t('code'),row.whonet_code],[t('agentClass'),row.class_name],[t('subclass'),row.subclass],[t('aware'),row.who_aware],[t('atc'),row.atc_code],[t('scope'),scope || t('unknown')]])}</section>
      <section class="detail-section"><h3>${esc(t('guidelines'))}</h3>${grid([[t('guidelines'),row.guidelines],[t('priority'),row.profile_class],[t('humanVet'),scope || t('unknown')]])}</section>
      <section class="detail-section"><h3>${esc(t('potencies'))}</h3>${chips(row.potencies)}</section>
      ${(mechanism || note) ? `<section class="detail-section"><h3>${esc(t('clinical'))}</h3><div class="detail-text">${mechanism?`<div><span>${esc(t('mechanism'))}</span><p>${esc(mechanism)}</p></div>`:''}${note?`<div><span>${esc(t('clinicalNote'))}</span><p>${esc(note)}</p></div>`:''}</div></section>` : ''}
    </div>`;
  }

  function updateSummary() {
    const pages = Math.max(1, Math.ceil(state.total / state.pageSize));
    if (state.page > pages) state.page = pages;
    els.summary.textContent = `${state.total.toLocaleString(state.language === 'en' ? 'en-US' : state.language === 'kk' ? 'kk-KZ' : 'ru-RU')} ${t('results')}`;
    els.pageLabel.textContent = `${t('page')} ${state.page} ${t('of')} ${pages}`;
    els.prev.disabled = state.page <= 1;
    els.next.disabled = state.page >= pages;
  }

  async function switchTab(tab) {
    if (!['organisms','antimicrobials'].includes(tab)) return;
    state.tab = tab; state.page = 1; state.search = ''; state.selected = null;
    els.search.value = '';
    configureFilters(true);
    $$('[data-tab]').forEach(button => {button.classList.toggle('active', button.dataset.tab === tab);button.setAttribute('aria-pressed',String(button.dataset.tab===tab));});
    document.getElementById('catalog-workspace').classList.remove('show-detail');
    const url = new URL(location.href); url.searchParams.set('tab', tab); history.replaceState(null, '', url);
    await loadCatalog();
  }

  let searchTimer;
  els.search.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { state.search = els.search.value; state.page = 1; loadCatalog(); }, 280);
  });
  els.primary.addEventListener('change', () => { state.primary = els.primary.value; state.page = 1; loadCatalog(); });
  els.secondary.addEventListener('change', () => { state.secondary = els.secondary.value; state.page = 1; loadCatalog(); });
  els.pageSize.addEventListener('change', () => { state.pageSize = Number(els.pageSize.value) || 50; state.page = 1; loadCatalog(); });
  els.clear.addEventListener('click', () => { state.search=''; state.primary=''; state.secondary=''; state.page=1; els.search.value=''; configureFilters(false); loadCatalog(); });
  els.prev.addEventListener('click', () => { if (state.page > 1) { state.page--; loadCatalog({keepSelection:false}); } });
  els.next.addEventListener('click', () => { if (state.page < Math.ceil(state.total/state.pageSize)) { state.page++; loadCatalog({keepSelection:false}); } });
  $$('[data-tab]').forEach(button => button.addEventListener('click', () => switchTab(button.dataset.tab)));
  $$('[data-lang]').forEach(button => button.addEventListener('click', () => { state.language = button.dataset.lang; applyLanguage(); }));

  document.addEventListener('atlas:language-changed',event=>{const language=event.detail?.language;if(['ru','kk','en'].includes(language)){state.language=language;applyLanguage();}});
  document.getElementById('back-to-catalog').addEventListener('click',()=>{document.getElementById('catalog-workspace').classList.remove('show-detail');document.querySelector('.catalog-row.active')?.focus();});
  configureFilters(true);
  $$('[data-tab]').forEach(button => {button.classList.toggle('active', button.dataset.tab === state.tab);button.setAttribute('aria-pressed',String(button.dataset.tab===state.tab));});
  applyLanguage();
  loadCatalog();
})();
