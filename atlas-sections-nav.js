(()=>{
  'use strict';
  const labels={
    ru:{home:'Казахстан',world:'Мир / WHO GLASS',reference:'Справочник',mechanisms:'Механизмы',glossary:'Словарь AMR',methodology:'Методология'},
    kk:{home:'Қазақстан',world:'Әлем / WHO GLASS',reference:'Анықтамалық',mechanisms:'Механизмдер',glossary:'AMR сөздігі',methodology:'Әдістеме'},
    en:{home:'Kazakhstan',world:'World / WHO GLASS',reference:'Reference',mechanisms:'Mechanisms',glossary:'AMR glossary',methodology:'Methodology'}
  };
  const pages={home:'index.html',world:'world.html',reference:'reference.html',mechanisms:'mechanisms.html',glossary:'glossary.html'};
  const icon=name=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${({home:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15"/>',world:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-6 6-6 12 0 18 6-6 6-12 0-18Z"/>',reference:'<path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15"/>',mechanisms:'<path d="M12 3 4 8v8l8 5 8-5V8l-8-5Z"/><path d="m8 10 4 2 4-2M12 12v5"/>',glossary:'<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z"/><path d="M8 8h7M8 12h7M8 16h4"/>',methodology:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>'})[name]||''}</svg>`;
  function lang(){try{const v=localStorage.getItem('atlas-preview-language');return ['ru','kk','en'].includes(v)?v:'ru'}catch{return'ru'}}
  function currentPage(){const p=(location.pathname.split('/').pop()||'index.html').toLowerCase();return Object.entries(pages).find(([,file])=>file===p)?.[0]||'home'}
  function ensureStyle(selector,href,key){if(document.querySelector(selector))return;const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.dataset[key]='1';document.head.appendChild(l)}
  function loadCss(){ensureStyle('link[data-atlas-unified]','./atlas-unified.css?v=20260921-2','atlasUnified');ensureStyle('link[data-atlas-branding]','./assets/branding/branding.css?v=20260921-1','atlasBranding')}
  function ensureFavicons(){
    const href='./assets/branding/favicon.png';
    let iconLink=document.querySelector('link[data-atlas-favicon]');
    if(!iconLink){iconLink=document.createElement('link');iconLink.rel='icon';iconLink.type='image/png';iconLink.dataset.atlasFavicon='1';document.head.appendChild(iconLink)}
    iconLink.href=href;
    let apple=document.querySelector('link[data-atlas-apple-icon]');
    if(!apple){apple=document.createElement('link');apple.rel='apple-touch-icon';apple.dataset.atlasAppleIcon='1';document.head.appendChild(apple)}
    apple.href=href;
  }
  function brandHtml(){return '<img class="brand-wordmark" src="./assets/branding/logo-wordmark.png" alt="AMR Atlas — антибиотикорезистентность Казахстана и мира">'}
  function navHtml(){const l=labels[lang()]||labels.ru,active=currentPage();return Object.entries(pages).map(([key,file])=>`<a href="./${file}" class="${active===key?'active':''}" data-atlas-nav="${key}">${icon(key)}<span>${l[key]}</span></a>`).join('')+(active==='home'?`<button type="button" data-info data-atlas-methodology>${icon('methodology')}<span>${l.methodology}</span></button>`:'')}
  function languageHtml(){const current=lang();return `<div class="language-switch" role="group" aria-label="Language / Тіл / Язык">${[['ru','RU'],['kk','ҚАЗ'],['en','EN']].map(([code,label])=>`<button type="button" data-lang="${code}" aria-pressed="${current===code}">${label}</button>`).join('')}</div>`}
  function makeHeader(){const h=document.createElement('header');h.className='site-header';h.dataset.atlasUnifiedHeader='1';h.innerHTML=`<a class="brand" href="./index.html">${brandHtml()}</a><nav aria-label="AMR Atlas">${navHtml()}</nav>${languageHtml()}`;document.body.prepend(h);return h}
  function shouldCreateHeader(){if(document.getElementById('atlas-app'))return false;return document.body?.classList.contains('reference-page')||document.body?.classList.contains('mechanism-page')}
  function normalizeHeader(){
    ensureFavicons();
    let h=document.querySelector('.site-header');if(!h&&shouldCreateHeader())h=makeHeader();if(!h)return false;
    h.dataset.atlasUnifiedHeader='1';let brand=h.querySelector('.brand');if(!brand){brand=document.createElement('a');brand.className='brand';h.prepend(brand)}
    brand.href='./index.html';if(brand.dataset.atlasBrand!=='20260921'){brand.innerHTML=brandHtml();brand.dataset.atlasBrand='20260921'}
    let nav=h.querySelector('nav');if(!nav){nav=document.createElement('nav');h.appendChild(nav)}nav.setAttribute('aria-label','AMR Atlas');
    const signature=`${lang()}|${currentPage()}`,html=navHtml();if(nav.dataset.atlasNavSignature!==signature){nav.innerHTML=html;nav.dataset.atlasNavSignature=signature}
    if((document.body.classList.contains('reference-page')||document.body.classList.contains('mechanism-page'))&&!h.querySelector('.language-switch'))h.insertAdjacentHTML('beforeend',languageHtml());
    return true;
  }
  function bindLanguage(){document.addEventListener('click',e=>{const b=e.target.closest?.('.site-header [data-lang]');if(!b)return;const code=b.dataset.lang;if(!['ru','kk','en'].includes(code))return;try{localStorage.setItem('atlas-preview-language',code)}catch{}document.querySelectorAll('.site-header [data-lang]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.lang===code)));document.dispatchEvent(new CustomEvent('atlas:language-changed',{detail:{language:code}}));setTimeout(normalizeHeader,0)});}
  loadCss();ensureFavicons();bindLanguage();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',normalizeHeader,{once:true});else normalizeHeader();
  new MutationObserver(()=>normalizeHeader()).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('atlas:language-changed',()=>setTimeout(normalizeHeader,0));
})();