(()=>{
  'use strict';
  if(window.__atlasHomeShellSyncLoaded)return;
  window.__atlasHomeShellSyncLoaded=true;

  const root=document.getElementById('atlas-app');
  if(!root)return;

  const labels={
    ru:{home:'Казахстан',world:'Мир / WHO GLASS',reference:'Справочник',mechanisms:'Механизмы',glossary:'Словарь AMR',methodology:'Методология',tagline:'Антимикробная резистентность'},
    kk:{home:'Қазақстан',world:'Әлем / WHO GLASS',reference:'Анықтамалық',mechanisms:'Механизмдер',glossary:'AMR сөздігі',methodology:'Әдістеме',tagline:'Антимикробтық резистенттілік'},
    en:{home:'Kazakhstan',world:'World / WHO GLASS',reference:'Reference',mechanisms:'Mechanisms',glossary:'AMR glossary',methodology:'Methodology',tagline:'Antimicrobial resistance'}
  };

  const icon=name=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${({
    home:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15"/>',
    world:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-6 6-6 12 0 18 6-6 6-12 0-18Z"/>',
    reference:'<path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15"/>',
    mechanisms:'<path d="M12 3 4 8v8l8 5 8-5V8l-8-5Z"/><path d="m8 10 4 2 4-2M12 12v5"/>',
    glossary:'<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z"/><path d="M8 8h7M8 12h7M8 16h4"/>',
    methodology:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>'
  })[name]||''}</svg>`;

  function language(){
    try{
      const value=localStorage.getItem('atlas-preview-language');
      return ['ru','kk','en'].includes(value)?value:'ru';
    }catch{return 'ru';}
  }

  function unifiedHeader(){
    const lang=language();
    const l=labels[lang]||labels.ru;
    return `<a class="brand" href="./index.html" data-home data-atlas-brand="20260921-6"><img class="brand-symbol" src="./assets/branding/logo.png" width="48" height="48" decoding="async" fetchpriority="low" alt=""><span class="brand-copy"><b>AMR <span>Atlas</span></b><small>${l.tagline}</small></span></a><nav aria-label="AMR Atlas" data-home-shell-nav="1"><a class="active" href="./index.html" data-home>${icon('home')}<span>${l.home}</span></a><a href="./world.html">${icon('world')}<span>${l.world}</span></a><a href="./reference.html">${icon('reference')}<span>${l.reference}</span></a><a href="./mechanisms.html">${icon('mechanisms')}<span>${l.mechanisms}</span></a><a href="./glossary.html">${icon('glossary')}<span>${l.glossary}</span></a><button type="button" data-info>${icon('methodology')}<span>${l.methodology}</span></button></nav><div class="language-switch" role="group" aria-label="Language / Тіл / Язык">${[['ru','RU'],['kk','ҚАЗ'],['en','EN']].map(([code,label])=>`<button type="button" data-language="${code}" lang="${code}" aria-pressed="${lang===code}">${label}</button>`).join('')}</div>`;
  }

  function sync(){
    const header=root.querySelector('.site-header');
    if(!header)return;
    if(header.dataset.atlasHomeShell==='20260921-6')return;
    header.innerHTML=unifiedHeader();
    header.dataset.atlasHomeShell='20260921-6';
    header.dataset.atlasUnifiedHeader='1';
  }

  const observer=new MutationObserver(sync);
  observer.observe(root,{childList:true,subtree:true});
  sync();
})();
