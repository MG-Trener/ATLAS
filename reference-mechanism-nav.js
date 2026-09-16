(() => {
  'use strict';
  const names={
    'БЛРС / ESBL':'ESBL','Кеңейтілген спектрлі β-лактамаза / ESBL':'ESBL','Extended-spectrum beta-lactamase (ESBL)':'ESBL',
    'AmpC β-лактамаза':'AMPC','AmpC beta-lactamase':'AMPC',
    'KPC-карбапенемаза':'KPC','KPC carbapenemase':'KPC',
    'NDM-металло-β-лактамаза':'NDM','NDM металло-β-лактамаза':'NDM','NDM metallo-beta-lactamase':'NDM',
    'OXA-48-подобная карбапенемаза':'OXA48','OXA-48-тәрізді карбапенемаза':'OXA48','OXA-48-like carbapenemase':'OXA48',
    'OXA-карбапенемазы Acinetobacter':'ACIN_OXA','Acinetobacter OXA-карбапенемазалары':'ACIN_OXA','Acinetobacter OXA carbapenemases':'ACIN_OXA',
    'MRSA / mec-опосредованная резистентность':'MRSA','MRSA / mec арқылы төзімділік':'MRSA','MRSA / mec-mediated resistance':'MRSA',
    'VRE / van-опосредованная резистентность':'VRE','VRE / van арқылы төзімділік':'VRE','VRE / van-mediated resistance':'VRE',
    'Резистентность к фторхинолонам: изменение мишени':'FQ_TARGET','Фторхинолондарға төзімділік: нысананың өзгеруі':'FQ_TARGET','Fluoroquinolone target alteration':'FQ_TARGET',
    'Приобретённая mcr-опосредованная резистентность к колистину':'COL_MCR','Колистинге жүре пайда болған mcr арқылы төзімділік':'COL_MCR','Acquired mcr-mediated colistin resistance':'COL_MCR',
    'Порины и эффлюкс':'PORIN_EFFLUX','Пориндер және эффлюкс':'PORIN_EFFLUX','Porin loss and efflux':'PORIN_EFFLUX'
  };
  const labels={ru:'Механизмы AMR',kk:'AMR механизмдері',en:'AMR mechanisms'};
  const language=()=>['ru','kk','en'].includes(localStorage.getItem('atlas-preview-language'))?localStorage.getItem('atlas-preview-language'):'ru';
  function enhance(){
    const nav=document.getElementById('mechanisms-nav-label'); if(nav)nav.textContent=labels[language()];
    document.querySelectorAll('.amr-mechanism').forEach(card=>{
      if(card.dataset.mechanismLinked)return;
      const title=card.querySelector('strong')?.textContent?.trim(); const code=names[title]; if(!code)return;
      card.dataset.mechanismLinked=code; card.setAttribute('role','link'); card.setAttribute('tabindex','0');
      card.addEventListener('click',()=>{location.href=`./mechanisms.html?mechanism=${encodeURIComponent(code)}`;});
      card.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();card.click();}});
    });
  }
  new MutationObserver(enhance).observe(document.getElementById('reference-detail')||document.body,{childList:true,subtree:true});
  document.querySelectorAll('[data-lang]').forEach(btn=>btn.addEventListener('click',()=>setTimeout(enhance,0)));
  enhance();
})();