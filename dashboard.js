(() => {
  const filters=document.querySelectorAll('.filters label select');
  const organismSelect=filters[0], materialSelect=filters[1], regionSelect=filters[2], periodSelect=filters[3];
  const applyButton=document.querySelector('.filters .apply');
  const pageTitle=document.querySelector('.title-row h1');
  const pageDescription=document.querySelector('.page-head > div:first-child > p');
  const statCards=[...document.querySelectorAll('.stats .stat')];
  const resistancePanelCaption=document.querySelector('.resistance .panel-head p');
  const resistanceRows=[...document.querySelectorAll('.resistance .ab-row')];
  const trendCaption=document.querySelector('.trend .panel-head p');
  const heatmapCaption=document.querySelector('.heatmap .panel-head p');
  if(!regionSelect) return;
  regionSelect.id='region-filter';

  const baseline={isolates:84215,resistance:28.6,mdr:8.7,esbl:18.4,alerts:3};
  const antibiotics=[
    {name:'Ампициллин',base:68.7,n:12843},{name:'Ципрофлоксацин',base:34.1,n:11927},
    {name:'Триметоприм/сульфаметоксазол',base:32.4,n:10334},{name:'Цефтриаксон',base:28.6,n:14382},
    {name:'Нитрофурантоин',base:8.5,n:9442},{name:'Амикацин',base:6.2,n:8431},{name:'Меропенем',base:1.3,n:7918}
  ];
  let activeRegion='Казахстан', activePcode='KZ', mapRegions=[];
  const i18n=()=>window.AtlasPreviewI18n;
  const translate=(value)=>i18n()?.translate(value)||value;
  const locale=()=>i18n()?.language==='en'?'en-US':i18n()?.language==='kk'?'kk-KZ':'ru-RU';
  const regionObject=(name)=>mapRegions.find(region=>region.name_kk===name||region.pcode===activePcode);
  const displayRegion=(name)=>name==='Казахстан'?translate('Казахстан'):(regionObject(name)?(i18n()?.regionName(regionObject(name))||name):translate(name));
  const hash=(input)=>{let h=0;for(let i=0;i<input.length;i++)h=((h<<5)-h)+input.charCodeAt(i);return Math.abs(h);};
  const regionFactor=(name)=>name==='Казахстан'?1:.72+(hash(name)%45)/100;
  const formatInt=(v)=>Math.round(v).toLocaleString(locale());
  const formatPct=(v)=>Number(v).toLocaleString(locale(),{minimumFractionDigits:1,maximumFractionDigits:1})+'%';
  const formatDelta=(v)=>Number(v).toLocaleString(locale(),{minimumFractionDigits:1,maximumFractionDigits:1});
  const pp=()=>i18n()?.language==='en'?'pp':i18n()?.language==='kk'?'т.п.':'п.п.';
  const barClass=(v)=>v>=40?'danger':v>=20?'warn':'safe';

  function updateStats(region){
    const shownRegion=displayRegion(region);
    const factor=regionFactor(region),rf=.83+(hash(region+'R')%34)/100;
    const isolates=region==='Казахстан'?baseline.isolates:baseline.isolates*factor/8.7;
    const resistance=baseline.resistance*rf;
    const mdr=baseline.mdr*(.82+(hash(region+'M')%35)/100);
    const esbl=baseline.esbl*(.84+(hash(region+'E')%33)/100);
    const alerts=region==='Казахстан'?3:Math.max(0,hash(region+'A')%4);
    const lang=i18n()?.language||'ru';
    const regionDelta=lang==='en'?'from region':lang==='kk'?'өңірден':'из региона';
    const demoEstimate=lang==='en'?'demo estimate':lang==='kk'?'демонстрациялық бағалау':'демонстрационная оценка';
    const multipleResistance=translate('множественная резистентность');
    const allEcoli=translate('от всех E. coli');
    const needsAttention=translate('требуют внимания');
    const noNew=lang==='en'?'no new':lang==='kk'?'жаңа жоқ':'нет новых';
    const noSignals=lang==='en'?'no active signals':lang==='kk'?'белсенді сигналдар жоқ':'активных сигналов нет';
    const values=[
      {main:formatInt(isolates),delta:region==='Казахстан'?'↑ 12%':regionDelta,sub:`${shownRegion}, 2026`},
      {main:formatPct(resistance),delta:`↑ ${formatDelta(resistance-24.5)} ${pp()}`,sub:demoEstimate},
      {main:formatPct(mdr),delta:`↑ ${formatDelta(mdr-6.4)} ${pp()}`,sub:multipleResistance},
      {main:formatPct(esbl),delta:`↑ ${formatDelta(esbl-15.3)} ${pp()}`,sub:allEcoli},
      {main:String(alerts),delta:alerts?`↑ ${alerts}`:noNew,sub:alerts?needsAttention:noSignals}
    ];
    statCards.forEach((card,i)=>{const strong=card.querySelector('strong'),small=card.querySelector('small');if(!strong||!values[i])return;const em=strong.querySelector('em');strong.firstChild.textContent=`${values[i].main} `;if(em)em.textContent=values[i].delta;if(small)small.textContent=values[i].sub;});
  }

  function updateResistance(region){
    const f=.82+(hash(region+'AB')%36)/100;
    resistanceRows.forEach((row,i)=>{const spec=antibiotics[i];if(!spec)return;const valuePct=region==='Казахстан'?spec.base:Math.max(.4,Math.min(85,spec.base*f*(.94+i*.015)));const n=region==='Казахстан'?spec.n:Math.max(80,spec.n*regionFactor(region)/7.5);const value=row.querySelector('div > b'),bar=row.querySelector('div i u'),count=row.querySelector(':scope > em');if(value)value.textContent=valuePct.toLocaleString(locale(),{minimumFractionDigits:1,maximumFractionDigits:1});if(bar){bar.style.width=`${Math.max(3,Math.min(100,valuePct))}%`;bar.className=barClass(valuePct);}if(count)count.textContent=formatInt(n);});
  }

  function updateCaptions(region){
    const organism=organismSelect?.value||'Escherichia coli',material=materialSelect?.selectedOptions?.[0]?.textContent||materialSelect?.value||translate('Все материалы'),period=periodSelect?.value||'2026';
    const shownRegion=displayRegion(region);
    if(pageTitle)pageTitle.textContent=organism;
    if(pageDescription){
      const prefix=i18n()?.language==='en'?'Interactive antimicrobial resistance overview':i18n()?.language==='kk'?'Микробқа қарсы төзімділіктің интерактивті шолуы':'Интерактивный обзор антимикробной резистентности';
      pageDescription.innerHTML=`${prefix} · <b>${shownRegion}</b> · ${translate('демонстрационные данные')}`;
    }
    if(resistancePanelCaption)resistancePanelCaption.textContent=`${organism.replace('Escherichia ','E. ')} · ${material.toLowerCase()} · ${shownRegion}`;
    if(trendCaption)trendCaption.textContent=`${translate('Цефтриаксон')} · ${shownRegion} · ${period}`;
    if(heatmapCaption)heatmapCaption.textContent=`${translate('Доля резистентных изолятов, %')} · ${shownRegion}`;
  }

  function populateRegions(){
    const current=activeRegion;
    regionSelect.innerHTML='';
    regionSelect.add(new Option(translate('Казахстан'),'Казахстан'));
    mapRegions.slice().sort((a,b)=>(i18n()?.regionName(a)||a.name_kk||'').localeCompare(i18n()?.regionName(b)||b.name_kk||'',locale())).forEach(region=>{
      if(!region?.name_kk)return;
      regionSelect.add(new Option(i18n()?.regionName(region)||region.name_kk,region.name_kk));
    });
    regionSelect.value=current;
  }

  function selectRegion(region,pcode=''){
    activeRegion=region||'Казахстан';activePcode=pcode||activePcode;
    if(![...regionSelect.options].some(o=>o.value===activeRegion))regionSelect.add(new Option(displayRegion(activeRegion),activeRegion));
    regionSelect.value=activeRegion;updateStats(activeRegion);updateResistance(activeRegion);updateCaptions(activeRegion);
    document.dispatchEvent(new CustomEvent('atlas:dashboard-region-changed',{detail:{name:activeRegion,pcode:activePcode}}));
  }

  document.addEventListener('atlas:map-ready',(event)=>{mapRegions=event.detail?.regions||[];populateRegions();regionSelect.value=activeRegion;updateStats(activeRegion);updateCaptions(activeRegion);});
  document.addEventListener('atlas:region-selected',(event)=>selectRegion(event.detail?.name||'Казахстан',event.detail?.pcode||''));
  document.addEventListener('atlas:language-changed',()=>{populateRegions();updateStats(activeRegion);updateCaptions(activeRegion);window.AtlasPreviewI18n?.applyLanguage();});
  regionSelect.addEventListener('change',()=>{const selected=mapRegions.find(region=>region.name_kk===regionSelect.value);selectRegion(regionSelect.value,selected?.pcode||'');});
  applyButton?.addEventListener('click',()=>{selectRegion(regionSelect.value,activePcode);const lang=i18n()?.language||'ru';applyButton.textContent=lang==='en'?'Applied ✓':lang==='kk'?'Қолданылды ✓':'Применено ✓';setTimeout(()=>{applyButton.textContent=translate('Применить');},900);});
  [organismSelect,materialSelect,periodSelect].forEach(select=>select?.addEventListener('change',()=>updateCaptions(activeRegion)));
  selectRegion('Казахстан','KZ');

  function injectScript(src,key){
    if(window[key]||document.querySelector(`script[data-atlas-script="${key}"]`))return;
    const s=document.createElement('script');s.src=src;s.dataset.atlasScript=key;s.onload=()=>{window[key]=true;};document.head.appendChild(s);
  }
  function loadAdvanced(){injectScript('./advanced.js','__atlasAdvancedLoaded');injectScript('./mapping.js','__atlasMappingLoaded');}

  if(!window.__atlasSectionsLoading){
    window.__atlasSectionsLoading=true;
    const s=document.createElement('script');s.src='./sections.js';s.onload=()=>{window.__atlasSectionsLoaded=true;loadAdvanced();};s.onerror=()=>{window.__atlasSectionsLoading=false;loadAdvanced();};document.head.appendChild(s);
  }else if(window.__atlasSectionsLoaded){loadAdvanced();}
  else{
    const wait=setInterval(()=>{if(window.__atlasSectionsLoaded){clearInterval(wait);loadAdvanced();}},80);
    setTimeout(()=>{clearInterval(wait);loadAdvanced();},3000);
  }
})();