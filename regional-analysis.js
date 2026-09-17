(() => {
  'use strict';
  if (window.__atlasRegionalAnalysis) return;
  window.__atlasRegionalAnalysis=true;

  const data=window.AtlasDemoData;
  if(!data){console.warn('AMR Atlas: regional analysis data layer is missing');return;}

  const copy={
    ru:{launch:'Региональный анализ',eyebrow:'ОРГАНИЗМ × АНТИБИОТИК',demo:'ДЕМОНСТРАЦИОННЫЕ ДАННЫЕ',subtitle:'Детальный региональный профиль AMR',organism:'Микроорганизм',drug:'Антимикробный препарат',material:'Материал',period:'Период',allMaterials:'Все материалы',last12:'Последние 12 месяцев',threeYears:'2024–2026',fullTrend:'2020–2026',resistant:'Резистентные',susceptible:'Чувствительные',intermediate:'Чувствительные при увеличенной экспозиции',isolates:'Протестировано',mdr:'MDR · demo v0.1',trend:'Динамика резистентности',trendSub:'Доля R по годам, %',materials:'Материалы',materialsSub:'Доля R и число протестированных изолятов',compare:'к уровню страны',national:'Казахстан',sample:'Оценка выборки',phenotypes:'AMR-фенотипы · предполагаемые',good:'Выборка достаточна для демонстрационного аналитического профиля.',moderate:'Умеренная выборка: интерпретируйте различия с осторожностью.',low:'Малая выборка: показатель нельзя использовать для устойчивых выводов.',suppressed:'N < 30: процент скрыт согласно предварительной политике публикации.',method:'Паспорт показателя',definition:'R / интерпретируемые протестированные изоляты',dedup:'Первый изолят пациента × организм × отчётный период',evidence:'Фенотипический сигнал; молекулярное подтверждение не подразумевается',organismRef:'Открыть организм в справочнике',drugRef:'Открыть препарат в справочнике',mechanismRef:'Открыть справочный AMR-контекст',close:'Закрыть'},
    kk:{launch:'Өңірлік талдау',eyebrow:'МИКРООРГАНИЗМ × ПРЕПАРАТ',demo:'ДЕМОНСТРАЦИЯЛЫҚ ДЕРЕКТЕР',subtitle:'AMR өңірлік егжей-тегжейлі профилі',organism:'Микроорганизм',drug:'Микробқа қарсы препарат',material:'Материал',period:'Кезең',allMaterials:'Барлық материалдар',last12:'Соңғы 12 ай',threeYears:'2024–2026',fullTrend:'2020–2026',resistant:'Төзімді',susceptible:'Сезімтал',intermediate:'Экспозицияны арттырғанда сезімтал',isolates:'Тестіленген',mdr:'MDR · demo v0.1',trend:'Төзімділік динамикасы',trendSub:'Жылдар бойынша R үлесі, %',materials:'Материалдар',materialsSub:'R үлесі және тестіленген изоляттар саны',compare:'ел деңгейімен',national:'Қазақстан',sample:'Іріктеме бағасы',phenotypes:'AMR фенотиптері · болжамды',good:'Демонстрациялық аналитикалық профиль үшін іріктеме жеткілікті.',moderate:'Орташа іріктеме: айырмашылықтарды сақтықпен түсіндіріңіз.',low:'Іріктеме аз: көрсеткіш тұрақты қорытынды үшін жеткіліксіз.',suppressed:'N < 30: жариялаудың алдын ала саясатына сәйкес пайыз жасырылды.',method:'Көрсеткіш паспорты',definition:'R / интерпретацияланатын тестіленген изоляттар',dedup:'Пациент × организм × есепті кезең бойынша алғашқы изолят',evidence:'Фенотиптік сигнал; молекулалық растауды білдірмейді',organismRef:'Микроорганизм анықтамалығы',drugRef:'Препарат анықтамалығы',mechanismRef:'Анықтамалық AMR контекстін ашу',close:'Жабу'},
    en:{launch:'Regional analysis',eyebrow:'ORGANISM × ANTIMICROBIAL',demo:'DEMO DATA',subtitle:'Detailed regional AMR profile',organism:'Organism',drug:'Antimicrobial',material:'Specimen',period:'Period',allMaterials:'All specimens',last12:'Last 12 months',threeYears:'2024–2026',fullTrend:'2020–2026',resistant:'Resistant',susceptible:'Susceptible',intermediate:'Susceptible, increased exposure',isolates:'Tested',mdr:'MDR · demo v0.1',trend:'Resistance trend',trendSub:'R proportion by year, %',materials:'Specimens',materialsSub:'R proportion and tested isolates',compare:'vs country',national:'Kazakhstan',sample:'Sample assessment',phenotypes:'AMR phenotypes · inferred',good:'Sample size is sufficient for the demo analytical profile.',moderate:'Moderate sample size: interpret differences cautiously.',low:'Small sample: the indicator is insufficient for stable conclusions.',suppressed:'N < 30: percentage suppressed under the provisional publication policy.',method:'Indicator passport',definition:'R / interpretable tested isolates',dedup:'First isolate per patient × organism × reporting period',evidence:'Phenotypic signal; molecular confirmation is not implied',organismRef:'Open organism reference',drugRef:'Open antimicrobial reference',mechanismRef:'Open reference AMR context',close:'Close'}
  };
  const lang=()=>{const v=localStorage.getItem('atlas-preview-language');return v==='kk'||v==='en'?v:'ru'};
  const t=key=>copy[lang()]?.[key]||copy.ru[key]||key;
  const li=()=>lang()==='kk'?1:lang()==='en'?2:0;
  const locale=()=>lang()==='kk'?'kk-KZ':lang()==='en'?'en-US':'ru-RU';
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const fmt=v=>Number(v).toLocaleString(locale(),{maximumFractionDigits:1});
  const state={pcode:'KZ',organism:'eco',drug:'CRO',material:'all',period:'2026'};
  let drawer,backdrop,organismSelect,drugSelect,materialSelect,periodSelect;

  function context(){try{return window.AtlasAnalysisContext?.get?.()||JSON.parse(localStorage.getItem('atlas-analysis-context-v1')||'{}')||{}}catch(_){return{}}}
  function currentPcode(){const selected=document.querySelector('.atlas-region.selected,.command-region.selected,[data-pcode].selected');return context().pcode||selected?.dataset?.pcode||'KZ'}
  function saveContext(){window.AtlasAnalysisContext?.set?.({pcode:state.pcode,organism:state.organism,drug:state.drug,material:state.material,period:state.period,source:'regional-analysis'})}

  function mountLaunchers(){
    const targets=[];
    const clinical=document.querySelector('.page-head .head-actions');if(clinical)targets.push(clinical);
    const national=document.querySelector('.atlas-selected-card');if(national)targets.push(national);
    const command=document.querySelector('.command-region-card');if(command)targets.push(command);
    targets.forEach(target=>{
      if(target.parentElement?.querySelector?.(':scope > .regional-analysis-launch')||target.querySelector?.('.regional-analysis-launch'))return;
      const btn=document.createElement('button');btn.type='button';btn.className='regional-analysis-launch';btn.innerHTML=`↗ <span>${t('launch')}</span>`;btn.addEventListener('click',open);
      if(target.matches('.atlas-selected-card'))target.insertAdjacentElement('afterend',btn);else target.appendChild(btn);
    });
  }

  function buildDrawer(){
    if(drawer)return;
    backdrop=document.createElement('div');backdrop.className='regional-analysis-backdrop';backdrop.addEventListener('click',close);document.body.appendChild(backdrop);
    drawer=document.createElement('aside');drawer.className='regional-analysis-drawer';drawer.setAttribute('aria-hidden','true');drawer.innerHTML=`
      <header class="regional-analysis-head"><div><small id="ra-eyebrow"></small><h2 id="ra-title"></h2><p id="ra-subtitle"></p><span class="regional-analysis-demo" id="ra-demo"></span></div><button class="regional-analysis-close" type="button" aria-label="Close">×</button></header>
      <div class="regional-analysis-body">
        <section class="regional-analysis-filters">
          <label><span id="ra-label-organism"></span><select id="ra-organism"></select></label>
          <label><span id="ra-label-drug"></span><select id="ra-drug"></select></label>
          <label><span id="ra-label-material"></span><select id="ra-material"></select></label>
          <label><span id="ra-label-period"></span><select id="ra-period"></select></label>
        </section>
        <section class="regional-analysis-kpis" id="ra-kpis"></section>
        <section class="regional-analysis-grid">
          <article class="regional-analysis-panel"><h3 id="ra-trend-title"></h3><p id="ra-trend-sub"></p><div class="regional-analysis-trend" id="ra-trend"></div><div class="regional-analysis-summary" id="ra-summary"></div></article>
          <article class="regional-analysis-panel"><h3 id="ra-materials-title"></h3><p id="ra-materials-sub"></p><div class="regional-analysis-materials" id="ra-materials"></div><h3 style="margin-top:14px" id="ra-phenotypes-title"></h3><div class="regional-analysis-phenotypes" id="ra-phenotypes"></div><div class="regional-analysis-warning" id="ra-warning"></div></article>
        </section>
        <div class="regional-analysis-actions" id="ra-actions"></div>
      </div>`;
    document.body.appendChild(drawer);
    drawer.querySelector('.regional-analysis-close').addEventListener('click',close);
    organismSelect=drawer.querySelector('#ra-organism');drugSelect=drawer.querySelector('#ra-drug');materialSelect=drawer.querySelector('#ra-material');periodSelect=drawer.querySelector('#ra-period');
    organismSelect.addEventListener('change',()=>{state.organism=organismSelect.value;state.drug=data.organisms[state.organism]?.defaultDrug||'CRO';populateDrug();render();saveContext()});
    drugSelect.addEventListener('change',()=>{state.drug=drugSelect.value;render();saveContext()});
    materialSelect.addEventListener('change',()=>{state.material=materialSelect.value;render();saveContext()});
    periodSelect.addEventListener('change',()=>{state.period=periodSelect.value;render();saveContext()});
    populateControls();
  }

  function populateControls(){
    if(!drawer)return;
    organismSelect.innerHTML=data.organismOptions().map(o=>`<option value="${esc(o.code)}">${esc(o.name)}</option>`).join('');organismSelect.value=state.organism;
    populateDrug();
    materialSelect.innerHTML=data.materialOptions().map(m=>`<option value="${esc(m.code)}">${esc(m.names[li()])}</option>`).join('');materialSelect.value=state.material;
    periodSelect.innerHTML=`<option value="2026">2026 YTD</option><option value="last12">${esc(t('last12'))}</option><option value="2024-2026">${esc(t('threeYears'))}</option><option value="2020-2026">${esc(t('fullTrend'))}</option>`;periodSelect.value=state.period;
  }
  function populateDrug(){if(!drugSelect)return;drugSelect.innerHTML=data.drugOptions(state.organism).map(d=>`<option value="${esc(d.code)}">${esc(d.names[li()])} · ${esc(d.code)}</option>`).join('');if(!data.organisms[state.organism]?.drugs?.[state.drug])state.drug=data.organisms[state.organism]?.defaultDrug||drugSelect.options[0]?.value;drugSelect.value=state.drug}

  function trendSvg(profile){
    const width=620,height=112,padX=12,padY=12;const values=profile.trend.map(x=>x.value);const max=Math.max(10,Math.ceil(Math.max(...values)/10)*10);const min=Math.max(0,Math.floor(Math.min(...values)/10)*10-10);const span=Math.max(10,max-min);
    const points=profile.trend.map((x,i)=>{const px=padX+i*((width-padX*2)/(profile.trend.length-1));const py=height-padY-((x.value-min)/span)*(height-padY*2);return{x:px,y:py,value:x.value,year:x.year}});
    const grid=[.25,.5,.75].map(q=>`<line class="grid" x1="0" x2="${width}" y1="${height*q}" y2="${height*q}"/>`).join('');
    const dots=points.map(p=>`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4"><title>${p.year}: ${fmt(p.value)}%</title></circle>`).join('');
    return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">${grid}<polyline points="${points.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}"/>${dots}</svg><div class="regional-analysis-years">${profile.trend.map(x=>`<span>${x.year}</span>`).join('')}</div>`;
  }

  function render(){
    if(!drawer)return;
    const p=data.profile(state);const deltaSign=p.delta>0?'+':'';const q=p.sampleQuality;
    drawer.querySelector('#ra-eyebrow').textContent=t('eyebrow');drawer.querySelector('#ra-title').textContent=data.regionName(state.pcode,lang());drawer.querySelector('#ra-subtitle').textContent=`${t('subtitle')} · ${p.organismInfo.name} · ${data.drugName(p.drug,lang())}`;drawer.querySelector('#ra-demo').textContent=t('demo');
    drawer.querySelector('#ra-label-organism').textContent=t('organism');drawer.querySelector('#ra-label-drug').textContent=t('drug');drawer.querySelector('#ra-label-material').textContent=t('material');drawer.querySelector('#ra-label-period').textContent=t('period');
    const show=p.publishable;drawer.querySelector('#ra-kpis').innerHTML=`<article class="r"><span>${t('resistant')}</span><strong>${show?`${fmt(p.resistance)}%`:'—'}</strong><small>${show?`${p.resistantCount.toLocaleString(locale())}/${p.tested.toLocaleString(locale())} · 95% CI ${fmt(p.ci95.low)}–${fmt(p.ci95.high)}`:'N < 30'}</small></article><article class="s"><span>${t('susceptible')}</span><strong>${show?`${fmt(p.susceptible)}%`:'—'}</strong><small>S</small></article><article class="i"><span>${t('intermediate')}</span><strong>${show?`${fmt(p.intermediate)}%`:'—'}</strong><small>I · EUCAST</small></article><article><span>${t('isolates')}</span><strong>${p.tested.toLocaleString(locale())}</strong><small>N tested</small></article><article><span>${t('mdr')}</span><strong>${show?`${fmt(p.mdr)}%`:'—'}</strong><small>definition v0.1</small></article>`;
    drawer.querySelector('#ra-trend-title').textContent=t('trend');drawer.querySelector('#ra-trend-sub').textContent=t('trendSub');drawer.querySelector('#ra-trend').innerHTML=trendSvg(p);
    drawer.querySelector('#ra-summary').innerHTML=`<div><span>${t('national')}</span><strong>${fmt(p.national)}%</strong></div><div><span>${t('compare')}</span><strong>${deltaSign}${fmt(p.delta)} п.п.</strong></div><div><span>${t('sample')}</span><strong>${p.isolates.toLocaleString(locale())}</strong></div>`;
    drawer.querySelector('#ra-materials-title').textContent=t('materials');drawer.querySelector('#ra-materials-sub').textContent=t('materialsSub');drawer.querySelector('#ra-materials').innerHTML=p.materials.map(m=>`<div class="regional-analysis-material-row"><span>${esc(m.name[li()])}</span><i><b style="width:${Math.min(100,m.resistance)}%"></b></i><strong>${fmt(m.resistance)}%</strong><em>N ${m.isolates}</em></div>`).join('');
    drawer.querySelector('#ra-phenotypes-title').textContent=t('phenotypes');drawer.querySelector('#ra-phenotypes').innerHTML=p.phenotypes.length?p.phenotypes.map(x=>`<span>${esc(x)}</span>`).join(''):'<span>AST</span>';
    const warning=drawer.querySelector('#ra-warning');warning.className=`regional-analysis-warning ${q==='good'?'good':''}`;warning.innerHTML=`<strong>${esc(t('sample'))}:</strong> ${esc(t(q))}<div class="regional-analysis-method"><b>${esc(t('method'))}</b><span>${esc(p.provenance.periodLabel)} · ${esc(p.provenance.breakpointStandard)} ${esc(p.provenance.breakpointVersion)}</span><span>${esc(t('definition'))}</span><span>${esc(t('dedup'))}</span><span>${esc(t('evidence'))}</span></div>`;
    const phenotype=p.phenotypes[0]||'';drawer.querySelector('#ra-actions').innerHTML=`<a href="./reference.html?tab=organisms&organism=${encodeURIComponent(p.organism)}">${esc(t('organismRef'))} →</a><a href="./reference.html?tab=antimicrobials&drug=${encodeURIComponent(p.drug)}">${esc(t('drugRef'))} →</a>${phenotype?`<a href="./mechanisms.html?mechanism=${encodeURIComponent(phenotype)}">${esc(t('mechanismRef'))} →</a>`:''}`;
    populateControls();
  }

  function open(){buildDrawer();const ctx=context();state.pcode=currentPcode();if(data.organisms[ctx.organism])state.organism=ctx.organism;if(ctx.material&&data.materials[ctx.material])state.material=ctx.material;if(ctx.period)state.period=ctx.period;const candidate=ctx.drug;if(candidate&&data.organisms[state.organism]?.drugs?.[candidate]!=null)state.drug=candidate;else state.drug=data.organisms[state.organism]?.defaultDrug||'CRO';render();drawer.classList.add('show');backdrop.classList.add('show');drawer.setAttribute('aria-hidden','false');saveContext()}
  function close(){drawer?.classList.remove('show');backdrop?.classList.remove('show');drawer?.setAttribute('aria-hidden','true')}
  function refreshLanguage(){document.querySelectorAll('.regional-analysis-launch span').forEach(n=>n.textContent=t('launch'));if(drawer){populateControls();render()}}

  function boot(){mountLaunchers();buildDrawer();refreshLanguage()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  document.addEventListener('atlas:analysis-context',e=>{if(e.detail?.pcode)state.pcode=e.detail.pcode;if(drawer?.classList.contains('show'))render()});
  document.addEventListener('atlas:language-changed',refreshLanguage);
  document.addEventListener('click',e=>{if(e.target.closest?.('.atlas-language button'))setTimeout(refreshLanguage,0)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drawer?.classList.contains('show'))close()});
  window.AtlasRegionalAnalysis={open,close,render,setRegion:pcode=>{state.pcode=pcode||'KZ';saveContext();if(drawer?.classList.contains('show'))render()}};
})();
