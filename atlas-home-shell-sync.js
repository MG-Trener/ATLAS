(()=>{
  'use strict';
  if(window.__atlasHomeShellSyncLoaded)return;
  window.__atlasHomeShellSyncLoaded=true;

  const root=document.getElementById('atlas-app');
  if(!root)return;

  let queued=false;
  function language(){
    try{
      const value=localStorage.getItem('atlas-preview-language');
      return ['ru','kk','en'].includes(value)?value:'ru';
    }catch{return 'ru';}
  }
  function needsSync(){
    const header=root.querySelector('.site-header');
    if(!header)return false;
    const brand=header.querySelector('.brand');
    return header.dataset.atlasUnifiedHeader!=='1'||brand?.dataset.atlasBrand!=='20260921-2';
  }
  function sync(){
    queued=false;
    if(!needsSync())return;
    document.dispatchEvent(new CustomEvent('atlas:language-changed',{detail:{language:language()}}));
  }
  function schedule(){
    if(queued)return;
    queued=true;
    queueMicrotask(sync);
  }

  new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
  schedule();
})();
