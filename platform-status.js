(() => {
  'use strict';
  if (window.__atlasPlatformStatus) return;
  window.__atlasPlatformStatus = true;
  const KEY='atlas-preview-language';
  const copy={
    ru:{prototype:'PROTOTYPE',reference:'Справочники Supabase активны',demo:'AMR surveillance-показатели демонстрационные',official:'не официальная статистика'},
    kk:{prototype:'PROTOTYPE',reference:'Supabase анықтамалықтары белсенді',demo:'AMR surveillance көрсеткіштері демонстрациялық',official:'ресми статистика емес'},
    en:{prototype:'PROTOTYPE',reference:'Supabase reference catalogs live',demo:'AMR surveillance metrics are demo',official:'not official statistics'}
  };
  const language=()=>{const v=localStorage.getItem(KEY);return v==='kk'||v==='en'?v:'ru'};
  function render(){
    let bar=document.querySelector('.atlas-platform-status');
    if(!bar){bar=document.createElement('div');bar.className='atlas-platform-status';bar.setAttribute('role','status');bar.setAttribute('aria-live','polite');document.body.appendChild(bar)}
    const t=copy[language()]||copy.ru;
    bar.innerHTML=`<i aria-hidden="true"></i><strong>${t.prototype}</strong><span class="atlas-status-sep">•</span><span class="atlas-status-reference">${t.reference}</span><span class="atlas-status-sep">•</span><span>${t.demo}</span><span class="atlas-status-sep">•</span><span>${t.official}</span>`;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
  document.addEventListener('atlas:language-changed',render);
  window.AtlasPlatformStatus={render};
})();