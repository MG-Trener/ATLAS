(() => {
  'use strict';
  if (window.__atlasSurveillanceP0) return;
  window.__atlasSurveillanceP0 = true;

  const nav = document.querySelector('.nav');
  const content = document.querySelector('.content');
  const view = document.getElementById('atlas-section-view');
  const breadcrumb = content?.querySelector('.breadcrumb');
  if (!nav || !content || !view) return;

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = './surveillance-p0.css?v=20260917-1';
  style.dataset.atlasSurveillanceP0 = '1';
  document.head.appendChild(style);

  const copy = {
    ru: {
      nav:{overview:'Обзор',surveillance:'Surveillance',pathogens:'Патогены',regions:'Регионы',signals:'Сигналы',quality:'Качество и охват',reference:'Справочник',methods:'Методология',reports:'Отчёты'},
      surveillanceTitle:'Surveillance', surveillanceSub:'Стандартизированные режимы эпидемиологического наблюдения за антимикробной резистентностью.',
      caesar:['CAESAR','Инвазивные изоляты · национальная сопоставимость'], glass:['GLASS','Расширенный routine surveillance'], hospital:['Hospital antibiogram','Локальная клиническая аналитика'],
      caesarTitle:'CAESAR · инвазивный AMR-surveillance', caesarText:'Приоритетный национальный профиль для сопоставимой оценки резистентности инвазивных бактериальных изолятов.',
      glassTitle:'GLASS · расширенный surveillance', glassText:'Расширенный профиль для анализа приоритетных инфекций с материалом, демографией и происхождением инфекции.',
      hospitalTitle:'Hospital antibiogram', hospitalText:'Локальный профиль медицинской организации для stewardship и внутренней лабораторной аналитики; не заменяет национальный surveillance.',
      scope:'Материал', dedup:'Дедупликация', population:'Контекст пациента', output:'Основной результат',
      caesarScope:'Кровь + спинномозговая жидкость', caesarDedup:'Первый изолят пациента × организм × год', caesarPopulation:'Инвазивная инфекция', caesarOutput:'R% + N + 95% ДИ',
      glassScope:'Кровь, моча, кал, урогенитальный материал', glassDedup:'Версионируемое правило GLASS', glassPopulation:'Возраст · пол · происхождение инфекции', glassOutput:'R/S/I + N + стратификация',
      hospitalScope:'Материалы по политике учреждения', hospitalDedup:'Первый клинически значимый изолят по локальной методике', hospitalPopulation:'Стационар · отделение · ОРИТ · амбулатория', hospitalOutput:'Антибиограмма + N + период',
      profile:'Профиль', standard:'Стандартизация', status:'Статус', priorityGroups:'Приоритетных групп', territories:'Территорий в модели', breakpoint:'Breakpoint context', source:'Источник данных',
      nine:'9 групп', twenty:'20', required:'обязателен', whonet:'WHONET / LIS', prototype:'PROTOTYPE · demo provider',
      pathogensTitle:'Приоритетные патогены', pathogensSub:'Surveillance-набор отделён от полного справочника WHONET. Полный каталог остаётся доступен отдельно.', target:'целевая группа',
      note:'Все показатели этого экрана пока демонстрационные. Профили задают структуру будущего расчёта, а не утверждают наличие официальных национальных данных.',
      pathogens:'Патогены', pathogensPageSub:'Приоритетные бактериальные группы для национального surveillance. Справочник WHONET остаётся отдельным полным каталогом.', openReference:'Открыть полный справочник WHONET →', marker:'Surveillance-маркер', evidence:'Интерпретация', phenotype:'фенотипический показатель', notMechanism:'не молекулярный механизм',
      qualityTitle:'Качество и охват', qualitySub:'Насколько данные пригодны для интерпретации как региональные и национальные показатели AMR.',
      qTerritories:'Территории с данными', qLabs:'Активные лаборатории', qAst:'Интерпретируемый AST', qRejected:'Отклонённые записи', qDuplicates:'Кандидаты в дубли', demo:'demo',
      qualityDimensions:'Контроль качества surveillance', qualityDimensionsSub:'Каждый агрегат в production должен сопровождаться этими измерениями качества.',
      geo:'Географический охват', completeness:'Полнота обязательных полей', timeliness:'Своевременность передачи', dedupQuality:'Дедупликация', eqa:'Участие в EQA', bloodCulture:'Blood culture rate', standards:'Стандарт breakpoint',
      configured:'настроено', planned:'планируется', mandatory:'обязательно',
      readiness:'Готовность данных · demo', readinessSub:'Пример того, как Atlas будет показывать пригодность набора к интерпретации. Значения не являются показателями Казахстана.',
      geoDemo:'18 / 20 demo', completenessDemo:'96,4% demo', timelyDemo:'91,2% demo', astDemo:'94,1% demo',
      qualityNote:'Для Казахстана этот раздел должен быть равноправным с AMR-показателями: высокий R% без информации об охвате, N и качестве данных не должен трактоваться как национальная оценка.',
      methodology:'Методология', reports:'Отчёты'
    },
    kk: {
      nav:{overview:'Шолу',surveillance:'Surveillance',pathogens:'Патогендер',regions:'Өңірлер',signals:'Сигналдар',quality:'Сапа және қамту',reference:'Анықтамалық',methods:'Әдістеме',reports:'Есептер'},
      surveillanceTitle:'Surveillance', surveillanceSub:'Микробқа қарсы төзімділікті эпидемиологиялық бақылаудың стандартталған режимдері.',
      caesar:['CAESAR','Инвазиялық изоляттар · ұлттық салыстырмалылық'], glass:['GLASS','Кеңейтілген routine surveillance'], hospital:['Hospital antibiogram','Жергілікті клиникалық аналитика'],
      caesarTitle:'CAESAR · инвазиялық AMR-surveillance', caesarText:'Инвазиялық бактериялық изоляттардың төзімділігін салыстырмалы бағалауға арналған басым ұлттық профиль.',
      glassTitle:'GLASS · кеңейтілген surveillance', glassText:'Материал, демография және инфекцияның шығу тегі бойынша басым инфекцияларды талдауға арналған кеңейтілген профиль.',
      hospitalTitle:'Hospital antibiogram', hospitalText:'Stewardship және ішкі зертханалық аналитикаға арналған медициналық ұйымның жергілікті профилі; ұлттық surveillance-ті алмастырмайды.',
      scope:'Материал', dedup:'Дедупликация', population:'Пациент контексті', output:'Негізгі нәтиже',
      caesarScope:'Қан + жұлын сұйықтығы', caesarDedup:'Пациент × организм × жыл бойынша бірінші изолят', caesarPopulation:'Инвазиялық инфекция', caesarOutput:'R% + N + 95% СА',
      glassScope:'Қан, зәр, нәжіс, урогениталдық материал', glassDedup:'Нұсқаланатын GLASS ережесі', glassPopulation:'Жас · жыныс · инфекцияның шығу тегі', glassOutput:'R/S/I + N + стратификация',
      hospitalScope:'Ұйым саясатына сәйкес материалдар', hospitalDedup:'Жергілікті әдістеме бойынша бірінші клиникалық маңызды изолят', hospitalPopulation:'Стационар · бөлімше · ЖИА · амбулатория', hospitalOutput:'Антибиограмма + N + кезең',
      profile:'Профиль', standard:'Стандарттау', status:'Мәртебе', priorityGroups:'Басым топтар', territories:'Модельдегі аумақтар', breakpoint:'Breakpoint контексті', source:'Дерек көзі',
      nine:'9 топ', twenty:'20', required:'міндетті', whonet:'WHONET / LIS', prototype:'PROTOTYPE · demo provider',
      pathogensTitle:'Басым патогендер', pathogensSub:'Surveillance жиыны WHONET толық анықтамалығынан бөлек. Толық каталог жеке қолжетімді.', target:'мақсатты топ',
      note:'Бұл экрандағы барлық көрсеткіштер әзірше демонстрациялық. Профильдер болашақ есептеу құрылымын анықтайды, ресми ұлттық деректер бар екенін білдірмейді.',
      pathogens:'Патогендер', pathogensPageSub:'Ұлттық surveillance үшін басым бактериялық топтар. WHONET анықтамалығы жеке толық каталог болып қалады.', openReference:'WHONET толық анықтамалығын ашу →', marker:'Surveillance-маркер', evidence:'Интерпретация', phenotype:'фенотиптік көрсеткіш', notMechanism:'молекулалық механизм емес',
      qualityTitle:'Сапа және қамту', qualitySub:'Деректердің өңірлік және ұлттық AMR көрсеткіштері ретінде интерпретацияға қаншалықты жарамды екені.',
      qTerritories:'Дерегі бар аумақтар', qLabs:'Белсенді зертханалар', qAst:'Интерпретацияланатын AST', qRejected:'Қабылданбаған жазбалар', qDuplicates:'Ықтимал дубльдер', demo:'demo',
      qualityDimensions:'Surveillance сапасын бақылау', qualityDimensionsSub:'Production режимінде әр агрегат осы сапа өлшемдерімен бірге жүруі тиіс.',
      geo:'Географиялық қамту', completeness:'Міндетті өрістердің толықтығы', timeliness:'Деректерді уақытылы беру', dedupQuality:'Дедупликация', eqa:'EQA-ға қатысу', bloodCulture:'Blood culture rate', standards:'Breakpoint стандарты',
      configured:'бапталған', planned:'жоспарда', mandatory:'міндетті',
      readiness:'Деректер дайындығы · demo', readinessSub:'Atlas деректер жиынының интерпретацияға жарамдылығын қалай көрсететінінің мысалы. Мәндер Қазақстан көрсеткіштері емес.',
      geoDemo:'18 / 20 demo', completenessDemo:'96,4% demo', timelyDemo:'91,2% demo', astDemo:'94,1% demo',
      qualityNote:'Қазақстан үшін бұл бөлім AMR көрсеткіштерімен тең дәрежеде маңызды болуы тиіс: қамту, N және деректер сапасы көрсетілмеген жоғары R% ұлттық баға ретінде түсіндірілмеуі керек.',
      methodology:'Әдістеме', reports:'Есептер'
    },
    en: {
      nav:{overview:'Overview',surveillance:'Surveillance',pathogens:'Pathogens',regions:'Regions',signals:'Signals',quality:'Quality & coverage',reference:'Reference',methods:'Methodology',reports:'Reports'},
      surveillanceTitle:'Surveillance', surveillanceSub:'Standardized epidemiological surveillance modes for antimicrobial resistance.',
      caesar:['CAESAR','Invasive isolates · national comparability'], glass:['GLASS','Extended routine surveillance'], hospital:['Hospital antibiogram','Local clinical analytics'],
      caesarTitle:'CAESAR · invasive AMR surveillance', caesarText:'Priority national profile for comparable assessment of resistance in invasive bacterial isolates.',
      glassTitle:'GLASS · extended surveillance', glassText:'Extended profile for priority infections with specimen, demographic and infection-origin stratification.',
      hospitalTitle:'Hospital antibiogram', hospitalText:'Local facility profile for stewardship and internal laboratory analytics; it does not replace national surveillance.',
      scope:'Specimens', dedup:'Deduplication', population:'Patient context', output:'Primary output',
      caesarScope:'Blood + cerebrospinal fluid', caesarDedup:'First isolate per patient × organism × year', caesarPopulation:'Invasive infection', caesarOutput:'R% + N + 95% CI',
      glassScope:'Blood, urine, stool, urogenital specimens', glassDedup:'Versioned GLASS rule', glassPopulation:'Age · sex · infection origin', glassOutput:'R/S/I + N + stratification',
      hospitalScope:'Specimens per facility policy', hospitalDedup:'First clinically significant isolate by local method', hospitalPopulation:'Inpatient · ward · ICU · outpatient', hospitalOutput:'Antibiogram + N + period',
      profile:'Profile', standard:'Standardization', status:'Status', priorityGroups:'Priority groups', territories:'Territories in model', breakpoint:'Breakpoint context', source:'Data source',
      nine:'9 groups', twenty:'20', required:'required', whonet:'WHONET / LIS', prototype:'PROTOTYPE · demo provider',
      pathogensTitle:'Priority pathogens', pathogensSub:'The surveillance set is separate from the full WHONET reference. The complete catalog remains available independently.', target:'target group',
      note:'All metrics on this screen are currently demonstrations. Profiles define the future calculation structure and do not imply official national data are available.',
      pathogens:'Pathogens', pathogensPageSub:'Priority bacterial groups for national surveillance. The WHONET reference remains a separate complete catalog.', openReference:'Open full WHONET reference →', marker:'Surveillance marker', evidence:'Interpretation', phenotype:'phenotypic indicator', notMechanism:'not a molecular mechanism',
      qualityTitle:'Quality & coverage', qualitySub:'How suitable the data are for interpretation as regional and national AMR indicators.',
      qTerritories:'Territories with data', qLabs:'Active laboratories', qAst:'Interpretable AST', qRejected:'Rejected records', qDuplicates:'Duplicate candidates', demo:'demo',
      qualityDimensions:'Surveillance quality control', qualityDimensionsSub:'In production, every aggregate should be accompanied by these quality dimensions.',
      geo:'Geographic coverage', completeness:'Required-field completeness', timeliness:'Reporting timeliness', dedupQuality:'Deduplication', eqa:'EQA participation', bloodCulture:'Blood culture rate', standards:'Breakpoint standard',
      configured:'configured', planned:'planned', mandatory:'required',
      readiness:'Data readiness · demo', readinessSub:'Example of how Atlas will communicate fitness for interpretation. Values are not Kazakhstan indicators.',
      geoDemo:'18 / 20 demo', completenessDemo:'96.4% demo', timelyDemo:'91.2% demo', astDemo:'94.1% demo',
      qualityNote:'For Kazakhstan, this section should be as prominent as AMR metrics: a high R% without coverage, N and data-quality context must not be interpreted as a national estimate.',
      methodology:'Methodology', reports:'Reports'
    }
  };

  const priority = [
    ['Escherichia coli','3GC-R · FQ-R'],['Klebsiella pneumoniae','3GC-R · Carb-R'],['Pseudomonas aeruginosa','Carb-R'],['Acinetobacter spp.','Carb-R'],['Staphylococcus aureus','MRSA'],['Streptococcus pneumoniae','PNSP · macrolide-R'],['Enterococcus faecalis','VRE · HLAR'],['Enterococcus faecium','VRE'],['Salmonella spp.','FQ-R · 3GC-R']
  ];

  const language = () => window.AtlasPreviewI18n?.language || localStorage.getItem('atlas-preview-language') || 'ru';
  const t = () => copy[language()] || copy.ru;
  let activeCustom = null;
  let activeProfile = 'caesar';

  function labelButton(button, icon, label){ if (!button) return; button.innerHTML = `<span>${icon}</span>${label}`; }
  function existing(section){ return nav.querySelector(`[data-section="${section}"]`); }
  function makeNav(key, icon){ const b=document.createElement('button');b.type='button';b.className='nav-item';b.dataset.p0Section=key;b.innerHTML=`<span>${icon}</span><span class="p0-nav-label"></span>`;return b; }

  const overview = existing('Обзор');
  const organisms = existing('Микроорганизмы');
  const antimicrobials = existing('Антибиотики');
  const map = existing('Карта');
  const analytics = existing('Аналитика');
  const comparison = existing('Сравнение');
  const signals = existing('Сигналы');
  const methods = existing('Данные и методы');
  const publications = existing('Публикации');
  if (organisms) organisms.style.display='none';
  if (antimicrobials) antimicrobials.style.display='none';
  if (analytics) analytics.style.display='none';
  if (comparison) comparison.style.display='none';

  const surveillanceBtn=makeNav('surveillance','◎');
  const pathogensBtn=makeNav('pathogens','◉');
  const qualityBtn=makeNav('quality','✓');
  const referenceBtn=makeNav('reference','▦');
  overview?.insertAdjacentElement('afterend',surveillanceBtn);
  surveillanceBtn.insertAdjacentElement('afterend',pathogensBtn);
  methods?.insertAdjacentElement('beforebegin',qualityBtn);
  qualityBtn.insertAdjacentElement('afterend',referenceBtn);

  function updateNav(){
    const n=t().nav;
    labelButton(overview,'⌂',n.overview); labelButton(map,'⌖',n.regions); labelButton(signals,'♢',n.signals);
    labelButton(methods,'≡',n.methods); labelButton(publications,'▤',n.reports);
    surveillanceBtn.querySelector('.p0-nav-label').textContent=n.surveillance;
    pathogensBtn.querySelector('.p0-nav-label').textContent=n.pathogens;
    qualityBtn.querySelector('.p0-nav-label').textContent=n.quality;
    referenceBtn.querySelector('.p0-nav-label').textContent=n.reference;
  }

  function setActive(button){ document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active')); button?.classList.add('active'); }
  function prepareCustom(button, title){
    existing('Обзор')?.click();
    [...content.children].filter(node=>!node.classList.contains('breadcrumb')&&!node.classList.contains('footer')&&node!==view).forEach(node=>{node.style.display='none'});
    view.hidden=false; view.innerHTML=''; setActive(button); activeCustom=button?.dataset.p0Section||null;
    if (breadcrumb) breadcrumb.innerHTML=`AMR Atlas <span>›</span> ${title}`;
  }
  function head(title, subtitle, action=''){ return `<div class="section-head"><div><span class="section-kicker">AMR Atlas · surveillance</span><h1>${title}</h1><p>${subtitle}</p></div>${action?`<div class="section-actions">${action}</div>`:''}</div>`; }

  function profileData(profile){
    const c=t();
    if(profile==='glass')return{title:c.glassTitle,text:c.glassText,scope:c.glassScope,dedup:c.glassDedup,population:c.glassPopulation,output:c.glassOutput};
    if(profile==='hospital')return{title:c.hospitalTitle,text:c.hospitalText,scope:c.hospitalScope,dedup:c.hospitalDedup,population:c.hospitalPopulation,output:c.hospitalOutput};
    return{title:c.caesarTitle,text:c.caesarText,scope:c.caesarScope,dedup:c.caesarDedup,population:c.caesarPopulation,output:c.caesarOutput};
  }

  function renderSurveillance(){
    const c=t(),p=profileData(activeProfile);
    prepareCustom(surveillanceBtn,c.surveillanceTitle);
    view.innerHTML=head(c.surveillanceTitle,c.surveillanceSub)+`
      <div class="surveillance-profile-tabs">
        ${[['caesar',c.caesar],['glass',c.glass],['hospital',c.hospital]].map(([key,text])=>`<button type="button" data-profile="${key}" class="${key===activeProfile?'active':''}"><strong>${text[0]}</strong><small>${text[1]}</small></button>`).join('')}
      </div>
      <div class="surveillance-hero">
        <article class="surveillance-summary"><h2>${p.title}</h2><p>${p.text}</p><div class="surveillance-tags"><span>${c.breakpoint}: ${c.required}</span><span>${c.source}: ${c.whonet}</span><span class="demo">${c.prototype}</span></div></article>
        <article class="surveillance-contract"><h3>${c.profile}</h3><dl><dt>${c.scope}</dt><dd>${p.scope}</dd><dt>${c.dedup}</dt><dd>${p.dedup}</dd><dt>${c.population}</dt><dd>${p.population}</dd><dt>${c.output}</dt><dd>${p.output}</dd></dl></article>
      </div>
      <div class="surveillance-kpis"><article><span>${c.priorityGroups}</span><strong>${activeProfile==='caesar'?c.nine:'—'}</strong><small>${c.target}</small></article><article><span>${c.territories}</span><strong>${c.twenty}</strong><small>${c.prototype}</small></article><article><span>${c.breakpoint}</span><strong>EUCAST / CLSI</strong><small>${c.required}</small></article><article><span>${c.source}</span><strong>WHONET</strong><small>LIS later</small></article></div>
      <div class="surveillance-pathogens"><div class="surveillance-pathogens-head"><h3>${c.pathogensTitle}</h3><span>${c.pathogensSub}</span></div><div class="surveillance-pathogen-grid">${priority.map(([name,marker])=>`<div class="surveillance-pathogen"><strong>${name}</strong><small>${marker}</small><em>${c.target}</em></div>`).join('')}</div></div>
      <div class="surveillance-note"><strong>PROTOTYPE:</strong> ${c.note}</div>`;
    view.querySelectorAll('[data-profile]').forEach(button=>button.addEventListener('click',()=>{activeProfile=button.dataset.profile;renderSurveillance()}));
  }

  function renderPathogens(){
    const c=t(); prepareCustom(pathogensBtn,c.pathogens);
    view.innerHTML=head(c.pathogens,c.pathogensPageSub,`<button class="btn secondary" id="open-whonet">${c.openReference}</button>`)+`
      <div class="surveillance-pathogens"><div class="surveillance-pathogens-head"><h3>${c.pathogensTitle}</h3><span>${c.priorityGroups}: 9</span></div><div class="surveillance-pathogen-grid">${priority.map(([name,marker])=>`<div class="surveillance-pathogen"><strong>${name}</strong><small>${c.marker}: ${marker}</small><em>${c.phenotype} · ${c.notMechanism}</em></div>`).join('')}</div></div>
      <div class="surveillance-note"><strong>Atlas:</strong> ${c.pathogensSub}</div>`;
    view.querySelector('#open-whonet')?.addEventListener('click',()=>{location.href='./reference.html?tab=organisms'});
  }

  function renderQuality(){
    const c=t(); prepareCustom(qualityBtn,c.qualityTitle);
    view.innerHTML=head(c.qualityTitle,c.qualitySub)+`
      <div class="quality-kpis"><article><span>${c.qTerritories}</span><strong>18 / 20</strong><small>${c.demo}</small></article><article><span>${c.qLabs}</span><strong>86</strong><small>${c.demo}</small></article><article><span>${c.qAst}</span><strong>94,1%</strong><small>${c.demo}</small></article><article><span>${c.qRejected}</span><strong>2,4%</strong><small>${c.demo}</small></article><article><span>${c.qDuplicates}</span><strong>1,8%</strong><small>${c.demo}</small></article></div>
      <div class="quality-grid">
        <article class="quality-overview"><h3>${c.readiness}</h3><p>${c.readinessSub}</p><div class="quality-bars">
          <div class="quality-bar-row"><div><span>${c.geo}</span><b>${c.geoDemo}</b></div><div class="quality-bar"><i style="width:90%"></i></div></div>
          <div class="quality-bar-row"><div><span>${c.completeness}</span><b>${c.completenessDemo}</b></div><div class="quality-bar"><i style="width:96.4%"></i></div></div>
          <div class="quality-bar-row"><div><span>${c.timeliness}</span><b>${c.timelyDemo}</b></div><div class="quality-bar"><i style="width:91.2%"></i></div></div>
          <div class="quality-bar-row"><div><span>${c.qAst}</span><b>${c.astDemo}</b></div><div class="quality-bar"><i style="width:94.1%"></i></div></div>
        </div></article>
        <article class="quality-matrix"><h3>${c.qualityDimensions}</h3><p>${c.qualityDimensionsSub}</p><div class="quality-dimensions">
          <div class="quality-dimension"><span>${c.geo}</span><b>N + labs + territories</b><em>${c.configured}</em></div>
          <div class="quality-dimension"><span>${c.completeness}</span><b>required fields</b><em>${c.configured}</em></div>
          <div class="quality-dimension"><span>${c.timeliness}</span><b>last load + delay</b><em>${c.mandatory}</em></div>
          <div class="quality-dimension"><span>${c.dedupQuality}</span><b>rule version + duplicates</b><em>${c.mandatory}</em></div>
          <div class="quality-dimension"><span>${c.standards}</span><b>EUCAST / CLSI + version</b><em>${c.mandatory}</em></div>
          <div class="quality-dimension"><span>${c.eqa}</span><b>participation / result</b><em class="planned">${c.planned}</em></div>
          <div class="quality-dimension"><span>${c.bloodCulture}</span><b>per 1000 patient-days</b><em class="planned">${c.planned}</em></div>
        </div></article>
      </div><div class="surveillance-note"><strong>QC:</strong> ${c.qualityNote}</div>`;
  }

  surveillanceBtn.addEventListener('click',renderSurveillance);
  pathogensBtn.addEventListener('click',renderPathogens);
  qualityBtn.addEventListener('click',renderQuality);
  referenceBtn.addEventListener('click',()=>{location.href='./reference.html'});
  document.querySelectorAll('.nav-item[data-section]').forEach(button=>button.addEventListener('click',()=>{activeCustom=null;setActive(button)}));

  function patchRegionNames(){
    const api=window.AtlasPreviewI18n; if(!api?.pcodeNames)return;
    api.pcodeNames.KZ10={ru:'область Абай',kk:'Абай облысы',en:'Abay Region'};
    api.pcodeNames.KZ33={ru:'область Жетісу',kk:'Жетісу облысы',en:'Zhetysu Region'};
    api.pcodeNames.KZ62={ru:'область Ұлытау',kk:'Ұлытау облысы',en:'Ulytau Region'};
  }
  function normalizeVisibleRegionNames(){
    if(language()!=='ru')return;
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;
    while((node=walker.nextNode())){
      const old=node.nodeValue; if(!old)continue;
      const next=old.replaceAll('Абайская область','область Абай').replaceAll('Жетысуская область','область Жетісу').replaceAll('Улытауская область','область Ұлытау');
      if(next!==old)node.nodeValue=next;
    }
  }
  function refresh(){ updateNav();patchRegionNames();setTimeout(normalizeVisibleRegionNames,0); if(activeCustom==='surveillance')renderSurveillance(); if(activeCustom==='pathogens')renderPathogens(); if(activeCustom==='quality')renderQuality(); }
  updateNav(); patchRegionNames(); normalizeVisibleRegionNames();
  document.addEventListener('atlas:language-changed',()=>setTimeout(refresh,0));
})();