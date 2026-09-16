(() => {
  'use strict';
  const config = window.ATLAS_SUPABASE;
  if (!config?.url || !config?.publishableKey) return;

  const dict = {
    ru:{brandSub:'Данные сегодня.<br>Здоровье завтра.',overview:'Обзор',reference:'Справочники',mechanisms:'Механизмы AMR',map:'Карта',scopeTitle:'Назначение раздела',scopeText:'Лабораторный и эпидемиологический AMR-контекст. Не предназначен для выбора терапии.',liveDb:'Supabase подключена',backReference:'← К справочникам',title:'Механизмы антимикробной резистентности',subtitle:'Связи между механизмами, генетическими маркерами, микроорганизмами и лабораторными фенотипическими маркерами.',openMap:'Открыть на карте',mechanismCount:'Механизмов в базе',organismCount:'Связанных приоритетных организмов',agentCount:'Фенотипических маркеров',categoryCount:'Категорий механизмов',reset:'Сбросить',catalog:'Каталог механизмов',loading:'Загрузка механизмов из Supabase…',selectMechanism:'Выберите механизм',selectHint:'Справа появятся гены, связанные микроорганизмы и лабораторные маркеры.',noteTitle:'Как использовать раздел',noteText:'Механизмы и препараты здесь описаны для AMR-мониторинга и интерпретации лабораторного контекста. Они не являются рекомендацией по назначению лечения.',allCategories:'Все категории',searchPlaceholder:'Поиск механизма, гена, класса…',records:'механизмов',genes:'Гены / маркеры',affected:'Затрагиваемые классы',organismsTitle:'Связанные микроорганизмы',agentsTitle:'Фенотипические маркеры',showMap:'Показать распределение на карте',mapHint:'Демонстрационный слой до подключения реальных региональных данных',core:'Ключевой',important:'Важный',watch:'Наблюдение',surveillance_marker:'Маркер наблюдения',phenotype_context:'Фенотипический контекст',beta_lactamase:'β-лактамазы',carbapenemase:'Карбапенемазы',target_modification:'Изменение мишени',permeability_efflux:'Проницаемость / эффлюкс',loadError:'Не удалось загрузить механизмы из Supabase.'},
    kk:{brandSub:'Деректер бүгін.<br>Денсаулық ертең.',overview:'Шолу',reference:'Анықтамалықтар',mechanisms:'AMR механизмдері',map:'Карта',scopeTitle:'Бөлімнің мақсаты',scopeText:'Зертханалық және эпидемиологиялық AMR контексті. Ем таңдауға арналмаған.',liveDb:'Supabase қосылған',backReference:'← Анықтамалықтарға',title:'Микробқа қарсы төзімділік механизмдері',subtitle:'Механизмдер, генетикалық маркерлер, микроорганизмдер және зертханалық фенотиптік маркерлер арасындағы байланыстар.',openMap:'Картада ашу',mechanismCount:'Дерекқордағы механизмдер',organismCount:'Байланысты басым микроорганизмдер',agentCount:'Фенотиптік маркерлер',categoryCount:'Механизм санаттары',reset:'Тазалау',catalog:'Механизмдер каталогы',loading:'Supabase механизмдері жүктелуде…',selectMechanism:'Механизмді таңдаңыз',selectHint:'Оң жақта гендер, байланысты микроорганизмдер және зертханалық маркерлер көрсетіледі.',noteTitle:'Бөлімді қалай пайдалану керек',noteText:'Механизмдер мен препараттар AMR мониторингі және зертханалық контекстті түсіндіру үшін берілген. Бұл ем тағайындау ұсынымы емес.',allCategories:'Барлық санаттар',searchPlaceholder:'Механизм, ген, класс бойынша іздеу…',records:'механизм',genes:'Гендер / маркерлер',affected:'Әсер ететін кластар',organismsTitle:'Байланысты микроорганизмдер',agentsTitle:'Фенотиптік маркерлер',showMap:'Картада таралуын көрсету',mapHint:'Нақты өңірлік деректер қосылғанға дейін демонстрациялық қабат',core:'Негізгі',important:'Маңызды',watch:'Бақылау',surveillance_marker:'Қадағалау маркері',phenotype_context:'Фенотиптік контекст',beta_lactamase:'β-лактамазалар',carbapenemase:'Карбапенемазалар',target_modification:'Нысананың өзгеруі',permeability_efflux:'Өткізгіштік / эффлюкс',loadError:'Supabase механизмдерін жүктеу мүмкін болмады.'},
    en:{brandSub:'Data today.<br>Health tomorrow.',overview:'Overview',reference:'Reference',mechanisms:'AMR mechanisms',map:'Map',scopeTitle:'Section purpose',scopeText:'Laboratory and epidemiological AMR context. Not intended for treatment selection.',liveDb:'Supabase connected',backReference:'← Back to reference',title:'Antimicrobial resistance mechanisms',subtitle:'Links between mechanisms, genetic markers, organisms and laboratory phenotypic markers.',openMap:'Open on map',mechanismCount:'Mechanisms in database',organismCount:'Linked priority organisms',agentCount:'Phenotypic markers',categoryCount:'Mechanism categories',reset:'Reset',catalog:'Mechanism catalog',loading:'Loading mechanisms from Supabase…',selectMechanism:'Select a mechanism',selectHint:'Genes, linked organisms and laboratory markers will appear on the right.',noteTitle:'How to use this section',noteText:'Mechanisms and agents are described for AMR surveillance and laboratory interpretation context. They are not treatment recommendations.',allCategories:'All categories',searchPlaceholder:'Search mechanism, gene, class…',records:'mechanisms',genes:'Genes / markers',affected:'Affected classes',organismsTitle:'Linked organisms',agentsTitle:'Phenotypic markers',showMap:'Show distribution on map',mapHint:'Demo layer until real regional data are connected',core:'Core',important:'Important',watch:'Watch',surveillance_marker:'Surveillance marker',phenotype_context:'Phenotype context',beta_lactamase:'Beta-lactamases',carbapenemase:'Carbapenemases',target_modification:'Target modification',permeability_efflux:'Permeability / efflux',loadError:'Could not load mechanisms from Supabase.'}
  };

  const state={language:['ru','kk','en'].includes(localStorage.getItem('atlas-preview-language'))?localStorage.getItem('atlas-preview-language'):'ru',rows:[],filtered:[],selected:null,search:'',category:''};
  const $=s=>document.querySelector(s); const $$=s=>[...document.querySelectorAll(s)];
  const els={search:$('#mechanism-search'),category:$('#mechanism-category'),clear:$('#clear-mechanism-filter'),loading:$('#mechanism-loading'),error:$('#mechanism-error'),list:$('#mechanism-list'),detail:$('#mechanism-detail'),summary:$('#mechanism-summary'),heroMap:$('#hero-map-link')};
  const t=k=>dict[state.language]?.[k]??dict.ru[k]??k;
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const field=(row,base)=>row?.[`${base}_${state.language}`]||row?.[`${base}_en`]||row?.[`${base}_ru`]||row?.[base]||'';
  const localName=(item)=>state.language==='ru'?(item.title_ru||item.name_ru||item.name):state.language==='kk'?(item.title_kk||item.name_kk||item.name):(item.title_en||item.name_en||item.name);
  const note=(item)=>item?.[`note_${state.language}`]||item?.note_en||item?.note_ru||'';

  function applyLanguage(){
    document.documentElement.lang=state.language==='kk'?'kk':state.language;
    localStorage.setItem('atlas-preview-language',state.language);
    $$('[data-lang]').forEach(b=>b.classList.toggle('active',b.dataset.lang===state.language));
    $$('[data-i18n]').forEach(n=>{if(t(n.dataset.i18n)!=null)n.innerHTML=t(n.dataset.i18n);});
    els.search.placeholder=t('searchPlaceholder');
    buildCategories(); filterRows(); renderDetail();
  }

  function buildCategories(){
    const current=state.category;
    const cats=[...new Set(state.rows.map(r=>r.category).filter(Boolean))];
    els.category.innerHTML=`<option value="">${esc(t('allCategories'))}</option>`+cats.map(c=>`<option value="${esc(c)}">${esc(t(c))}</option>`).join('');
    els.category.value=current;
  }

  function filterRows(){
    const q=state.search.trim().toLowerCase();
    state.filtered=state.rows.filter(row=>{
      if(state.category&&row.category!==state.category)return false;
      if(!q)return true;
      const hay=[row.code,row.name_ru,row.name_kk,row.name_en,row.description_ru,row.description_kk,row.description_en,...(row.gene_examples||[]),...(row.affected_classes||[])].join(' ').toLowerCase();
      return hay.includes(q);
    });
    if(!state.selected||!state.filtered.some(r=>r.code===state.selected.code))state.selected=state.filtered[0]||null;
    renderList(); renderDetail();
  }

  function renderList(){
    els.summary.textContent=`${state.filtered.length} ${t('records')}`;
    if(!state.filtered.length){els.list.innerHTML=`<div class="mechanism-empty" style="min-height:420px"><span>⌕</span><strong>0</strong></div>`;return;}
    els.list.innerHTML=state.filtered.map(row=>`<button class="mechanism-row${state.selected?.code===row.code?' active':''}" type="button" data-code="${esc(row.code)}">
      <span class="mechanism-code">${esc(row.code)}</span>
      <span class="mechanism-name"><strong>${esc(field(row,'name'))}</strong><small>${esc(t(row.category))} · ${(row.gene_examples||[]).map(esc).join(', ')}</small></span>
      <span class="mechanism-counts"><b>◉ ${row.organism_count||0}</b><b>◇ ${row.antimicrobial_count||0}</b></span><span class="arrow">›</span>
    </button>`).join('');
    $$('.mechanism-row').forEach(btn=>btn.addEventListener('click',()=>selectByCode(btn.dataset.code)));
  }

  function chips(values){return `<div class="mechanism-chips">${(values||[]).map(v=>`<span>${esc(v)}</span>`).join('')}</div>`;}
  function organismCards(items){return `<div class="mechanism-links">${(items||[]).map(item=>`<a class="mechanism-link-card" href="./reference.html?tab=organisms&organism=${encodeURIComponent(item.code)}"><strong><i>${esc(localName(item))}</i></strong><small>${esc(item.priority_tag||item.code)}</small><em>${esc(t(item.relevance)||item.relevance||'')}</em></a>`).join('')}</div>`;}
  function agentCards(items){return `<div class="mechanism-links">${(items||[]).map(item=>`<a class="mechanism-link-card" href="./reference.html?tab=antimicrobials&drug=${encodeURIComponent(item.code)}"><strong>${esc(localName(item))}</strong><small>${esc([item.code,item.class_name,item.who_aware].filter(Boolean).join(' · '))}</small><em>${esc(t(item.relation_type)||item.relation_type||'')}</em></a>`).join('')}</div>`;}

  function renderDetail(){
    const row=state.selected;
    if(!row){els.detail.innerHTML=`<div class="mechanism-empty"><span>⌬</span><strong>${esc(t('selectMechanism'))}</strong><p>${esc(t('selectHint'))}</p></div>`;return;}
    const mapUrl=`./index.html?layer=mechanism&mechanism=${encodeURIComponent(row.code)}#map-section`;
    els.heroMap.href=mapUrl;
    els.detail.innerHTML=`<div class="mechanism-card">
      <div class="mechanism-card-top"><div><span class="mechanism-kicker">${esc(t(row.category))}</span><h2>${esc(field(row,'name'))}</h2><p>${esc(t('mechanisms'))} · ${esc(row.code)}</p></div><span class="mechanism-card-code">${esc(row.code)}</span></div>
      <div class="mechanism-description">${esc(field(row,'description'))}</div>
      <section class="mechanism-section"><h3>${esc(t('genes'))}</h3>${chips(row.gene_examples)}</section>
      <section class="mechanism-section"><h3>${esc(t('affected'))}</h3>${chips(row.affected_classes)}</section>
      <section class="mechanism-section"><h3>${esc(t('organismsTitle'))} · ${row.organism_count||0}</h3>${organismCards(row.organisms)}</section>
      <section class="mechanism-section"><h3>${esc(t('agentsTitle'))} · ${row.antimicrobial_count||0}</h3>${agentCards(row.antimicrobials)}</section>
      <section class="mechanism-section"><a class="mechanism-map-cta" href="${mapUrl}"><div><strong>${esc(t('showMap'))}</strong><span>${esc(t('mapHint'))}</span></div><b>⌖</b></a></section>
    </div>`;
  }

  function selectByCode(code){
    state.selected=state.rows.find(r=>r.code===code)||state.filtered[0]||null;
    const url=new URL(location.href); if(state.selected)url.searchParams.set('mechanism',state.selected.code); history.replaceState(null,'',url);
    renderList(); renderDetail();
  }

  async function load(){
    els.loading.hidden=false; els.list.hidden=true; els.error.hidden=true;
    try{
      const url=new URL(`${config.url}/rest/v1/resistance_mechanism_catalog`); url.searchParams.set('select','*'); url.searchParams.set('order','name_en.asc');
      const response=await fetch(url,{headers:{apikey:config.publishableKey}}); if(!response.ok)throw new Error(`${response.status} ${await response.text()}`);
      state.rows=await response.json();
      const wanted=new URLSearchParams(location.search).get('mechanism'); state.selected=state.rows.find(r=>r.code===wanted)||state.rows[0]||null;
      buildCategories(); filterRows(); els.list.hidden=false;
    }catch(error){console.error(error);els.error.textContent=`${t('loadError')} ${error.message||''}`;els.error.hidden=false;}
    finally{els.loading.hidden=true;}
  }

  let timer; els.search.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>{state.search=els.search.value;filterRows();},180);});
  els.category.addEventListener('change',()=>{state.category=els.category.value;filterRows();});
  els.clear.addEventListener('click',()=>{state.search='';state.category='';els.search.value='';buildCategories();filterRows();});
  $$('[data-lang]').forEach(btn=>btn.addEventListener('click',()=>{state.language=btn.dataset.lang;applyLanguage();}));
  applyLanguage(); load();
})();