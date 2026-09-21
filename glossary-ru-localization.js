(()=>{
  'use strict';
  const LABELS={
    'WHO GLASS manual':'WHO GLASS — руководство',
    'WHO AMR report 2025':'WHO — отчёт по AMR, 2025',
    'EUCAST breakpoints':'EUCAST — клинические пороговые значения',
    'EUCAST disk diffusion':'EUCAST — диско-диффузионный метод',
    'MDR/XDR/PDR consensus':'Консенсус MDR/XDR/PDR',
    'WHO ATC/DDD':'WHO — ATC/DDD'
  };
  function isRu(){try{return (localStorage.getItem('atlas-preview-language')||'ru')==='ru'}catch{return true}}
  function apply(){
    if(!isRu())return;
    document.querySelectorAll('.term-sources a').forEach(a=>{const next=LABELS[a.textContent.trim()];if(next&&a.textContent!==next)a.textContent=next});
    document.querySelectorAll('.term-en').forEach(el=>{if(!el.title)el.title='Международный англоязычный термин'});
  }
  function boot(){apply();const root=document.getElementById('glossary-content');if(root)new MutationObserver(()=>queueMicrotask(apply)).observe(root,{childList:true,subtree:true});document.addEventListener('atlas:language-changed',()=>setTimeout(apply,0));}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
