(()=>{
  'use strict';
  function loadScript(src,key,ready){
    const existing=document.querySelector(`script[data-atlas-module="${key}"]`);
    if(existing){if(existing.dataset.loaded==='1')ready?.();else existing.addEventListener('load',()=>ready?.(),{once:true});return}
    const script=document.createElement('script');script.src=src;script.async=false;script.dataset.atlasModule=key;script.addEventListener('load',()=>{script.dataset.loaded='1';ready?.()},{once:true});script.addEventListener('error',()=>ready?.(),{once:true});document.body.appendChild(script);
  }
  function loadUnifiedShell(){
    if(!document.querySelector('link[data-atlas-unified]')){const style=document.createElement('link');style.rel='stylesheet';style.href='./atlas-unified.css?v=20260921-4';style.dataset.atlasUnified='1';document.head.appendChild(style)}
    if(!document.querySelector('script[data-atlas-module="unified-nav"]'))loadScript('./atlas-sections-nav.js?v=20260921-6','unified-nav');
  }
  function loadGlobalI18n(){
    if(!document.querySelector('link[data-atlas-global-i18n]')){const style=document.createElement('link');style.rel='stylesheet';style.href='./atlas-global-i18n.css?v=20260916-1';style.dataset.atlasGlobalI18n='1';document.head.appendChild(style)}
    const extensions=()=>{if(!window.__atlasI18nExtensions)loadScript('./atlas-i18n-extensions.js?v=20260916-4','i18n-extensions',()=>window.AtlasI18nExtensions?.apply?.())};
    if(window.AtlasGlobalI18n){window.AtlasGlobalI18n.applyLanguage?.();extensions()}else loadScript('./atlas-global-i18n.js?v=20260917-1','global-i18n',()=>{window.AtlasGlobalI18n?.applyLanguage?.();extensions()});
  }
  function loadPlatformStatus(){
    if(!document.querySelector('link[data-atlas-platform-status]')){const style=document.createElement('link');style.rel='stylesheet';style.href='./platform-status.css?v=20260916-1';style.dataset.atlasPlatformStatus='1';document.head.appendChild(style)}
    if(!window.AtlasPlatformStatus)loadScript('./platform-status.js?v=20260916-1','platform-status',()=>window.AtlasPlatformStatus?.render?.());else window.AtlasPlatformStatus.render?.();
  }
  function loadReadableType(){
    // Canonical pages load the shared typography layer explicitly. Move it to
    // the end after dynamically injected shell styles so its scale stays final.
    const typography=document.querySelector('link[href*="atlas-typography.css"]');
    if(typography){document.head.appendChild(typography);return}
    if(!document.querySelector('link[data-atlas-readable]')){const style=document.createElement('link');style.rel='stylesheet';style.href='./atlas-readable-type.css?v=20260916-2';style.dataset.atlasReadable='1';document.head.appendChild(style)}
    if(document.body?.classList.contains('reference-page')&&!document.querySelector('link[data-atlas-reference-readable]')){const extra=document.createElement('link');extra.rel='stylesheet';extra.href='./atlas-readable-reference.css?v=20260916-1';extra.dataset.atlasReferenceReadable='1';document.head.appendChild(extra)}
  }
  function boot(){
    try{localStorage.removeItem('atlas-ui-concept');localStorage.removeItem('atlas-ui-theme')}catch{}
    delete document.documentElement.dataset.atlasConcept;
    delete document.documentElement.dataset.atlasTheme;
    loadUnifiedShell();loadGlobalI18n();loadPlatformStatus();loadReadableType();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  document.addEventListener('atlas:language-changed',()=>{window.AtlasGlobalI18n?.applyLanguage?.();window.AtlasI18nExtensions?.apply?.();window.AtlasPlatformStatus?.render?.()});
  window.AtlasThemes={concepts:['unified'],get concept(){return'unified'},setConcept(){},setTheme(){}};
})();