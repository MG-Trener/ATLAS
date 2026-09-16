(() => {
  'use strict';
  if (window.__atlasPlatformStatus) return;
  window.__atlasPlatformStatus = true;
  const KEY='atlas-preview-language';
  const copy={
    ru:{
      prototype:'PROTOTYPE',reference:'Справочники Supabase активны',demo:'AMR surveillance-показатели демонстрационные',official:'не официальная статистика',details:'О данных',title:'Происхождение и статус данных',close:'Закрыть',
      referenceTitle:'Реальные reference-данные',referenceText:'Справочник микроорганизмов, антимикробных препаратов и AMR knowledge layer загружается из Supabase. Активный WHONET / AMRIE snapshot: 15.09.2026.',
      surveillanceTitle:'Surveillance / аналитические показатели',surveillanceText:'Региональные проценты R, MDR, ESBL, CRE, MRSA, сигналы, тренды и размеры выборок в текущем публичном прототипе являются детерминированными демонстрационными значениями.',
      officialTitle:'Статус публикации',officialText:'Прототип не является официальным источником национальной статистики и не должен использоваться для клинических решений, назначения терапии или официальной эпидемиологической отчётности.',
      futureTitle:'Целевое состояние',futureText:'После подключения валидированных WHONET/LIS-наборов demo-provider будет заменён агрегатами surveillance с версией breakpoint, периодом, N, лабораторным охватом и правилами дедупликации.'
    },
    kk:{
      prototype:'PROTOTYPE',reference:'Supabase анықтамалықтары белсенді',demo:'AMR surveillance көрсеткіштері демонстрациялық',official:'ресми статистика емес',details:'Деректер туралы',title:'Деректердің шығу тегі және мәртебесі',close:'Жабу',
      referenceTitle:'Нақты reference-деректер',referenceText:'Микроорганизмдер, микробқа қарсы препараттар және AMR knowledge layer анықтамалығы Supabase-тен жүктеледі. Белсенді WHONET / AMRIE snapshot: 15.09.2026.',
      surveillanceTitle:'Surveillance / аналитикалық көрсеткіштер',surveillanceText:'Қазіргі қоғамдық прототиптегі өңірлік R, MDR, ESBL, CRE, MRSA пайыздары, сигналдар, трендтер және үлгі көлемдері детерминирленген демонстрациялық мәндер болып табылады.',
      officialTitle:'Жариялау мәртебесі',officialText:'Прототип ұлттық ресми статистика көзі емес және клиникалық шешімдер, ем тағайындау немесе ресми эпидемиологиялық есептілік үшін қолданылмауы тиіс.',
      futureTitle:'Мақсатты күй',futureText:'Валидацияланған WHONET/LIS деректері қосылғаннан кейін demo-provider breakpoint нұсқасы, кезеңі, N, зертханалық қамтуы және дедупликация ережелері бар surveillance агрегаттарымен ауыстырылады.'
    },
    en:{
      prototype:'PROTOTYPE',reference:'Supabase reference catalogs live',demo:'AMR surveillance metrics are demo',official:'not official statistics',details:'About data',title:'Data provenance and status',close:'Close',
      referenceTitle:'Live reference data',referenceText:'The organism, antimicrobial and AMR knowledge catalogs are loaded from Supabase. Active WHONET / AMRIE snapshot: 15 Sep 2026.',
      surveillanceTitle:'Surveillance / analytical metrics',surveillanceText:'Regional R, MDR, ESBL, CRE and MRSA percentages, signals, trends and sample sizes in the current public prototype are deterministic demonstration values.',
      officialTitle:'Publication status',officialText:'This prototype is not an official source of national statistics and must not be used for clinical decisions, treatment selection or official epidemiological reporting.',
      futureTitle:'Target state',futureText:'After validated WHONET/LIS datasets are connected, the demo provider will be replaced by surveillance aggregates with breakpoint version, period, N, laboratory coverage and deduplication rules.'
    }
  };
  const language=()=>{const v=localStorage.getItem(KEY);return v==='kk'||v==='en'?v:'ru'};
  const esc=s=>String(s).replace(/[&<>\"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  function ensureDrawer(){
    let backdrop=document.querySelector('.atlas-provenance-backdrop');
    let drawer=document.querySelector('.atlas-provenance-drawer');
    if(!backdrop){backdrop=document.createElement('div');backdrop.className='atlas-provenance-backdrop';document.body.appendChild(backdrop)}
    if(!drawer){drawer=document.createElement('aside');drawer.className='atlas-provenance-drawer';drawer.setAttribute('role','dialog');drawer.setAttribute('aria-modal','true');document.body.appendChild(drawer)}
    backdrop.onclick=closeDrawer;
    return {backdrop,drawer};
  }
  function openDrawer(){
    const t=copy[language()]||copy.ru;
    const {backdrop,drawer}=ensureDrawer();
    drawer.innerHTML=`<div class="atlas-provenance-head"><div><small>${esc(t.prototype)}</small><h2>${esc(t.title)}</h2></div><button type="button" class="atlas-provenance-close" aria-label="${esc(t.close)}">×</button></div><div class="atlas-provenance-body"><section class="live"><span>01</span><div><strong>${esc(t.referenceTitle)}</strong><p>${esc(t.referenceText)}</p></div></section><section class="demo"><span>02</span><div><strong>${esc(t.surveillanceTitle)}</strong><p>${esc(t.surveillanceText)}</p></div></section><section class="warning"><span>03</span><div><strong>${esc(t.officialTitle)}</strong><p>${esc(t.officialText)}</p></div></section><section><span>04</span><div><strong>${esc(t.futureTitle)}</strong><p>${esc(t.futureText)}</p></div></section></div>`;
    drawer.querySelector('.atlas-provenance-close')?.addEventListener('click',closeDrawer);
    backdrop.classList.add('show');drawer.classList.add('show');
    drawer.querySelector('.atlas-provenance-close')?.focus();
  }
  function closeDrawer(){document.querySelector('.atlas-provenance-backdrop')?.classList.remove('show');document.querySelector('.atlas-provenance-drawer')?.classList.remove('show')}
  function render(){
    let bar=document.querySelector('.atlas-platform-status');
    if(!bar){bar=document.createElement('div');bar.className='atlas-platform-status';bar.setAttribute('role','status');bar.setAttribute('aria-live','polite');document.body.appendChild(bar)}
    const t=copy[language()]||copy.ru;
    bar.innerHTML=`<i aria-hidden="true"></i><strong>${esc(t.prototype)}</strong><span class="atlas-status-sep">•</span><span class="atlas-status-reference">${esc(t.reference)}</span><span class="atlas-status-sep">•</span><span>${esc(t.demo)}</span><span class="atlas-status-sep">•</span><span>${esc(t.official)}</span><button type="button" class="atlas-status-details">${esc(t.details)} →</button>`;
    bar.querySelector('.atlas-status-details')?.addEventListener('click',openDrawer);
    if(document.querySelector('.atlas-provenance-drawer.show'))openDrawer();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
  document.addEventListener('atlas:language-changed',render);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer()});
  window.AtlasPlatformStatus={render,open:openDrawer,close:closeDrawer};
})();