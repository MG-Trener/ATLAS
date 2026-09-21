(()=>{
  'use strict';
  const GEO='https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';
  const DRUGS={
    Amikacin:'Амикацин',Ampicillin:'Ампициллин','Amoxicillin-clavulanate':'Амоксициллин/клавулановая кислота',
    Azithromycin:'Азитромицин',Cefepime:'Цефепим',Cefixime:'Цефиксим',Cefotaxime:'Цефотаксим',Cefoxitin:'Цефокситин',
    Ceftazidime:'Цефтазидим',Ceftriaxone:'Цефтриаксон',Ciprofloxacin:'Ципрофлоксацин',Clindamycin:'Клиндамицин',
    Colistin:'Колистин',Doxycycline:'Доксициклин',Ertapenem:'Эртапенем',Erythromycin:'Эритромицин',Imipenem:'Имипенем',
    Levofloxacin:'Левофлоксацин',Linezolid:'Линезолид',Meropenem:'Меропенем',Nitrofurantoin:'Нитрофурантоин',
    Oxacillin:'Оксациллин',Penicillin:'Пенициллин','Piperacillin-tazobactam':'Пиперациллин/тазобактам',
    Rifampicin:'Рифампицин',Tetracycline:'Тетрациклин','Trimethoprim-sulfamethoxazole':'Триметоприм/сульфаметоксазол',
    Vancomycin:'Ванкомицин'
  };
  const COUNTRY_OVERRIDES={KAZ:'Казахстан',USA:'США',GBR:'Великобритания',RUS:'Россия',KOR:'Республика Корея',PRK:'КНДР',CZE:'Чехия',TUR:'Турция',IRN:'Иран',VNM:'Вьетнам',LAO:'Лаос',BOL:'Боливия',VEN:'Венесуэла',TZA:'Танзания',SYR:'Сирия'};
  const displayNames=typeof Intl.DisplayNames==='function'?new Intl.DisplayNames(['ru'],{type:'region'}):null;
  const countryNames=new Map();

  function isRu(){try{return (localStorage.getItem('atlas-preview-language')||'ru')==='ru'}catch{return true}}
  function clean(v){return String(v||'').replace(/_/g,' ').replace(/\s+/g,' ').trim()}
  function infectionLabel(value){
    const v=clean(value).toUpperCase();
    if(v.includes('BLOOD'))return 'Кровь';
    if(v.includes('URINE'))return 'Моча';
    if(v.includes('RESPIR')||v.includes('SPUTUM'))return 'Респираторный материал';
    if(v.includes('CSF')||v.includes('CEREBROSPINAL'))return 'Спинномозговая жидкость';
    if(v.includes('STOOL')||v.includes('FAEC')||v.includes('FEC'))return 'Кал';
    if(v.includes('GENITAL')||v.includes('GONOR'))return 'Урогенитальный материал';
    return clean(value);
  }
  function drugLabel(value){return DRUGS[clean(value)]||clean(value)}
  function countryLabel(code){return COUNTRY_OVERRIDES[code]||countryNames.get(code)||code}
  function replacePhrases(text){
    return String(text||'')
      .replaceAll('WHO GLASS standard','Стандарт WHO GLASS')
      .replaceAll('national/WHONET','национальные данные / WHONET')
      .replaceAll('global GLASS snapshot','глобальный снимок данных GLASS')
      .replaceAll('WHO GLASS snapshot','снимок данных WHO GLASS')
      .replaceAll('WHO snapshot','снимок данных WHO')
      .replaceAll('WHO GLASS Dashboard / XMART','WHO GLASS / XMART')
      .replaceAll('Расширенный каталог · ожидает national/WHONET','Расширенный каталог · ожидает национальные данные / WHONET');
  }
  function localizeOptions(){
    const infection=document.getElementById('infection');
    if(infection)for(const option of infection.options)option.textContent=infectionLabel(option.value);
    const antibiotic=document.getElementById('antibiotic');
    if(antibiotic)for(const option of antibiotic.options)option.textContent=drugLabel(option.value);
    const pathogen=document.getElementById('pathogen');
    if(pathogen)for(const option of pathogen.options)option.textContent=replacePhrases(option.textContent);
  }
  function localizeCountries(){
    document.querySelectorAll('.country-list [data-pick]').forEach(button=>{
      const code=button.dataset.pick,span=button.querySelector('span');if(!code||!span)return;
      const small=span.querySelector('small');
      const year=small?.textContent||'';
      span.textContent=countryLabel(code);
      if(small){const s=document.createElement('small');s.textContent=year;span.appendChild(s)}
    });
    document.querySelectorAll('.world-country[data-country]').forEach(path=>{
      const code=path.dataset.country,title=path.querySelector('title');if(!code||!title)return;
      const parts=title.textContent.split(' · ');parts[0]=countryLabel(code);title.textContent=parts.join(' · ');
    });
    const selected=document.querySelector('.world-country.selected[data-country]');
    const eyebrow=document.querySelector('#country-panel>.eyebrow');
    if(selected&&eyebrow){const parts=eyebrow.textContent.split(' · ');parts[0]=countryLabel(selected.dataset.country);eyebrow.textContent=parts.join(' · ')}
  }
  function localizeDynamicCopy(){
    for(const selector of ['#mode-note','#dataset-meta','#country-panel']){
      const root=document.querySelector(selector);if(!root)continue;
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
      const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
      for(const node of nodes){const next=replacePhrases(node.nodeValue);if(next!==node.nodeValue)node.nodeValue=next}
    }
    const current=document.querySelector('#country-panel .muted');
    if(current){
      const html=current.innerHTML;
      const localized=Object.entries(DRUGS).reduce((s,[en,ru])=>s.replaceAll(en,ru),html);
      current.innerHTML=localized.replace(/\bBLOOD\b/gi,'Кровь').replace(/\bURINE\b/gi,'Моча');
    }
  }
  function apply(){if(!isRu())return;localizeOptions();localizeCountries();localizeDynamicCopy()}
  async function loadCountries(){
    try{
      const r=await fetch(GEO,{cache:'force-cache'});if(!r.ok)return;const geo=await r.json();
      for(const f of geo.features||[]){const p=f.properties||{},a3=p['ISO3166-1-Alpha-3']||p.ISO_A3||p.iso_a3||p.ADM0_A3||p.ISO3,a2=p['ISO3166-1-Alpha-2']||p.ISO_A2||p.iso_a2;if(!a3)continue;let name=COUNTRY_OVERRIDES[a3];if(!name&&displayNames&&a2&&a2!=='-99'){try{name=displayNames.of(a2)}catch{}}if(name)countryNames.set(a3,name)}
    }catch{}
    apply();
  }
  function boot(){
    apply();loadCountries();
    const roots=['world-map','country-panel','country-list','dataset-meta','mode-note','infection','pathogen','antibiotic'].map(id=>document.getElementById(id)).filter(Boolean);
    const observer=new MutationObserver(()=>queueMicrotask(apply));for(const root of roots)observer.observe(root,{childList:true,subtree:true,characterData:true});
    document.addEventListener('atlas:language-changed',()=>setTimeout(apply,0));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
