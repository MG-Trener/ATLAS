(() => {
  'use strict';
  const STORAGE_KEY='atlas-ui-concept';
  const LEGACY_KEY='atlas-ui-theme';
  const CONCEPTS=['clinical','atlas','command'];
  const routes={clinical:'./index.html',atlas:'./national-atlas.html',command:'./command-center.html'};
  const legacy={clinical:'clinical',research:'atlas',command:'command',dark:'command',teal:'clinical',sand:'atlas',contrast:'clinical'};
  const copy={
    ru:{button:'Концепция',title:'Модель интерфейса',hint:'Три самостоятельных способа работать с AMR Atlas',selected:'Открыта',items:{clinical:['Clinical Workspace','Рабочая медицинская панель'],atlas:['National AMR Atlas','Карта как главный интерфейс'],command:['Intelligence Center','Оперативный центр мониторинга']}},
    kk:{button:'Концепция',title:'Интерфейс моделі',hint:'AMR Atlas-пен жұмыс істеудің үш бөлек тәсілі',selected:'Ашық',items:{clinical:['Clinical Workspace','Медициналық жұмыс панелі'],atlas:['National AMR Atlas','Карта негізгі интерфейс ретінде'],command:['Intelligence Center','Жедел мониторинг орталығы']}},
    en:{button:'Concept',title:'Interface model',hint:'Three independent ways to work with AMR Atlas',selected:'Open',items:{clinical:['Clinical Workspace','Clinical working dashboard'],atlas:['National AMR Atlas','Map-first national interface'],command:['Intelligence Center','Operational monitoring center']}}
  };
  const language=()=>{const v=localStorage.getItem('atlas-preview-language');return v==='kk'||v==='en'?v:'ru'};
  const t=()=>copy[language()]||copy.ru;
  function pathConcept(){const p=location.pathname.toLowerCase();if(p.endsWith('/national-atlas.html'))return'atlas';if(p.endsWith('/command-center.html'))return'command';if(p.endsWith('/index.html')||p.endsWith('/atlas/')||p.endsWith('/atlas'))return'clinical';return null}
  function stored(){const direct=localStorage.getItem(STORAGE_KEY);if(CONCEPTS.includes(direct))return direct;const old=legacy[localStorage.getItem(LEGACY_KEY)];if(old){localStorage.setItem(STORAGE_KEY,old);localStorage.removeItem(LEGACY_KEY);return old}return'clinical'}
  function current(){return pathConcept()||stored()}
  function selectConcept(concept,navigate=true){if(!CONCEPTS.includes(concept))return;localStorage.setItem(STORAGE_KEY,concept);document.documentElement.dataset.atlasConcept=concept;document.dispatchEvent(new CustomEvent('atlas:concept-changed',{detail:{concept}}));if(navigate&&pathConcept()!==concept)location.href=routes[concept]}
  function preview(concept){return `<span class="concept-preview ${concept}"><i></i><span><b></b><em></em><em></em></span></span>`}
  function card(concept){const text=t().items[concept];const active=current()===concept;return `<button class="concept-card${active?' active':''}" type="button" data-concept="${concept}" aria-pressed="${active}">${preview(concept)}<span class="concept-copy"><strong>${text[0]}</strong><small>${text[1]}</small><span>${active?'✓ '+t().selected:'→'}</span></span></button>`}
  function renderPopover(){let p=document.querySelector('.theme-popover');if(!p){p=document.createElement('div');p.className='theme-popover';p.hidden=true;document.body.appendChild(p)}p.innerHTML=`<div class="theme-popover-head"><div><strong>${t().title}</strong><small>${t().hint}</small></div><button class="theme-popover-close" type="button" aria-label="Close">×</button></div><div class="concept-grid">${CONCEPTS.map(card).join('')}</div>`;p.querySelector('.theme-popover-close')?.addEventListener('click',()=>p.hidden=true);p.querySelectorAll('[data-concept]').forEach(btn=>btn.addEventListener('click',()=>selectConcept(btn.dataset.concept,true)));return p}
  function mount(){const actions=document.querySelector('.top-actions');if(!actions)return;let trigger=actions.querySelector('.theme-trigger');if(!trigger){trigger=document.createElement('button');trigger.type='button';trigger.className='theme-trigger';const languageSwitch=actions.querySelector('.language-switch');if(languageSwitch?.nextSibling)actions.insertBefore(trigger,languageSwitch.nextSibling);else actions.prepend(trigger)}trigger.innerHTML=`<span class="theme-dot"></span><span>${t().button}</span>`;trigger.setAttribute('aria-label',t().title);trigger.onclick=()=>{const p=renderPopover();p.hidden=!p.hidden}}
  function refresh(){mount();const p=document.querySelector('.theme-popover');if(p&&!p.hidden)renderPopover()}
  function loadClinicalWorkbench(){
    if(pathConcept()!=='clinical'||document.querySelector('link[data-atlas-clinical]'))return;
    const style=document.createElement('link');style.rel='stylesheet';style.href='./clinical-workspace.css?v=20260916-2';style.dataset.atlasClinical='1';document.head.appendChild(style);
    const script=document.createElement('script');script.src='./clinical-workspace.js?v=20260916-3';script.dataset.atlasClinical='1';document.body.appendChild(script);
  }
  function loadViewportAssets(){
    if(!pathConcept()||document.querySelector('link[data-atlas-viewport]'))return;
    const style=document.createElement('link');style.rel='stylesheet';style.href='./viewport-layout.css?v=20260916-1';style.dataset.atlasViewport='1';document.head.appendChild(style);
    const tuning=document.createElement('link');tuning.rel='stylesheet';tuning.href='./viewport-tuning.css?v=20260916-1';tuning.dataset.atlasViewport='tuning';document.head.appendChild(tuning);
    const script=document.createElement('script');script.src='./viewport-layout.js?v=20260916-1';script.dataset.atlasViewport='1';document.body.appendChild(script);
  }
  function loadReadableType(){
    if(!document.querySelector('link[data-atlas-readable]')){
      const style=document.createElement('link');style.rel='stylesheet';style.href='./atlas-readable-type.css?v=20260916-2';style.dataset.atlasReadable='1';document.head.appendChild(style);
    }
    if(document.body?.classList.contains('reference-page')&&!document.querySelector('link[data-atlas-reference-readable]')){
      const extra=document.createElement('link');extra.rel='stylesheet';extra.href='./atlas-readable-reference.css?v=20260916-1';extra.dataset.atlasReferenceReadable='1';document.head.appendChild(extra);
    }
  }
  function boot(){mount();loadClinicalWorkbench();loadViewportAssets();loadReadableType()}
  selectConcept(current(),false);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  document.addEventListener('atlas:language-changed',refresh);
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-lang]'))setTimeout(refresh,0);const p=document.querySelector('.theme-popover');const tr=document.querySelector('.theme-trigger');if(!p||p.hidden||p.contains(e.target)||tr?.contains(e.target))return;p.hidden=true});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){const p=document.querySelector('.theme-popover');if(p)p.hidden=true}});
  window.AtlasThemes={concepts:[...CONCEPTS],get concept(){return current()},setConcept:selectConcept,setTheme:selectConcept};
})();