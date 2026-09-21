(()=>{
  const labels={
    ru:{world:'Мир / WHO GLASS',glossary:'Словарь AMR'},
    kk:{world:'Әлем / WHO GLASS',glossary:'AMR сөздігі'},
    en:{world:'World / WHO GLASS',glossary:'AMR glossary'}
  };
  const icon=(kind)=>kind==='world'
    ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-6 6-6 12 0 18 6-6 6-12 0-18Z"/></svg>'
    : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15"/></svg>';
  const lang=()=>{try{return ['ru','kk','en'].includes(localStorage.getItem('atlas-preview-language'))?localStorage.getItem('atlas-preview-language'):'ru';}catch{return 'ru';}};
  function inject(){
    const nav=document.querySelector('.site-header nav');
    if(!nav||nav.querySelector('[data-atlas-section-nav]'))return;
    const l=lang();
    const path=location.pathname.toLowerCase();
    const world=document.createElement('a');
    world.href='./world.html';world.dataset.atlasSectionNav='world';world.innerHTML=`${icon('world')}<span>${labels[l].world}</span>`;
    if(path.endsWith('/world.html'))world.classList.add('active');
    const glossary=document.createElement('a');
    glossary.href='./glossary.html';glossary.dataset.atlasSectionNav='glossary';glossary.innerHTML=`${icon('glossary')}<span>${labels[l].glossary}</span>`;
    if(path.endsWith('/glossary.html'))glossary.classList.add('active');
    nav.append(world,glossary);
  }
  inject();
  new MutationObserver(inject).observe(document.documentElement,{childList:true,subtree:true});
})();