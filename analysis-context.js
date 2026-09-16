(() => {
  'use strict';
  if (window.__atlasAnalysisContext) return;
  window.__atlasAnalysisContext = true;

  const KEY='atlas-analysis-context-v1';
  const root=document.documentElement;
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(_){return{}}};
  const write=patch=>{
    const next={...read(),...patch,updatedAt:new Date().toISOString()};
    try{localStorage.setItem(KEY,JSON.stringify(next))}catch(_){}
    document.dispatchEvent(new CustomEvent('atlas:analysis-context',{detail:next}));
    return next;
  };

  function concept(){return root.dataset.atlasConcept||''}
  function rememberFromTarget(target){
    const region=target.closest?.('[data-pcode]');
    if(region?.dataset.pcode) write({pcode:region.dataset.pcode,source:concept()});
    const layerButton=target.closest?.('[data-layer]');
    if(layerButton?.dataset.layer) write({layer:layerButton.dataset.layer,source:concept()});
  }

  document.addEventListener('click',e=>rememberFromTarget(e.target));
  document.addEventListener('change',e=>{
    const select=e.target.closest?.('#atlas-region-select');
    if(select) write({pcode:select.value||null,source:concept()});
  });

  function applyContext(){
    const ctx=read();
    if(!ctx||(!ctx.pcode&&!ctx.layer))return true;
    let applied=false;
    if(concept()==='atlas'){
      if(ctx.layer){const layer=['resistance','esbl','cre','mrsa'].includes(ctx.layer)?ctx.layer:(ctx.layer==='ndm'||ctx.layer==='oxa48'||ctx.layer==='vre'?'cre':'resistance');const btn=document.querySelector(`.atlas-mode-switch [data-layer="${layer}"]`);if(btn&&!btn.classList.contains('active')){btn.click();applied=true}}
      if(ctx.pcode){const path=document.querySelector(`.atlas-region[data-pcode="${ctx.pcode}"]`);if(path){path.dispatchEvent(new MouseEvent('click',{bubbles:true}));applied=true}}
    }
    if(concept()==='command'){
      if(ctx.layer){const layer=['esbl','cre','mrsa','vre','ndm','oxa48'].includes(ctx.layer)?ctx.layer:(ctx.layer==='resistance'?'esbl':ctx.layer);const btn=document.querySelector(`.command-layer-switch [data-layer="${layer}"]`);if(btn&&!btn.classList.contains('active')){btn.click();applied=true}}
      if(ctx.pcode){const path=document.querySelector(`.command-region[data-pcode="${ctx.pcode}"]`);if(path){path.dispatchEvent(new MouseEvent('click',{bubbles:true}));applied=true}}
    }
    return applied;
  }

  let attempts=0;
  const timer=setInterval(()=>{
    attempts+=1;
    const hasMap=document.querySelector('.atlas-region,.command-region');
    if(hasMap){applyContext();clearInterval(timer)}
    if(attempts>30)clearInterval(timer);
  },120);

  document.addEventListener('atlas:regions-source',()=>setTimeout(applyContext,80));
  window.AtlasAnalysisContext={get:read,set:write,apply:applyContext,clear:()=>localStorage.removeItem(KEY)};
})();