(()=>{
  'use strict';
  const EXACT=new Map(Object.entries({
    'Bacteria':'Бактерии','Fungi':'Грибы','Protozoa':'Простейшие','Viruses':'Вирусы','Animalia':'Животные','Chromista':'Хромисты','Plantae':'Растения','Archaea':'Археи','Actinobacteria':'Актинобактерии',
    'Access':'Access — доступ','Watch':'Watch — наблюдение','Reserve':'Reserve — резерв',
    'Quinolones':'Хинолоны','Cephems':'Цефемы','Penicillins':'Пенициллины','Antifungals':'Противогрибковые препараты','Macrolides':'Макролиды','Aminoglycosides':'Аминогликозиды',
    'Beta-lactam+Inhibitors':'β-лактамы + ингибиторы','Beta-lactam+inhibitors':'β-лактамы + ингибиторы','Cephems-Oral':'Пероральные цефемы','Folate pathway inhibitors':'Ингибиторы фолатного пути',
    'Penems':'Пенемы','Antimycobacterials':'Противомикобактериальные препараты','Glycopeptides':'Гликопептиды','Tetracyclines':'Тетрациклины','Coccidiostats':'Кокцидиостатики',
    'Beta-lactamase inhibitors':'Ингибиторы β-лактамаз','Lipopeptides':'Липопептиды','Streptogramins':'Стрептограмины','Combinations':'Комбинации','Oxazolidinones':'Оксазолидиноны',
    'Ansamycins':'Ансамицины','Nitroimidazoles':'Нитроимидазолы','Lincosamides':'Линкозамиды','Pleuromutilins':'Плевромутилины','Nitrofurans':'Нитрофураны','Phenicols':'Фениколы',
    'Thiazolides':'Тиазолиды','Monobactams':'Монобактамы','Polypeptides':'Полипептиды','Aminocyclitols':'Аминоциклитолы','Fosfomycins':'Фосфомицины','Fluorocyclines':'Фторциклины',
    'Oligosaccharides':'Олигосахариды','Everninomycins':'Эвернимицины','Pseudomonic acids':'Псевдомоновые кислоты','Steroidals':'Стероидные соединения',
    'Fluoroquinolone':'Фторхинолон','Cephalosporin':'Цефалоспорин','Cephalosporin I':'Цефалоспорин I поколения','Cephalosporin II':'Цефалоспорин II поколения','Cephalosporin III':'Цефалоспорин III поколения','Cephalosporin IV':'Цефалоспорин IV поколения',
    'Quinolone':'Хинолон','Carbapenems':'Карбапенемы','Penicillin (Stable)':'Пенициллиназоустойчивый пенициллин','Cephamycin':'Цефамицин','Ureidopenicillin':'Уреидопенициллин','Aminopenicillin':'Аминопенициллин',
    'Carboxypenicillin':'Карбоксипенициллин','Ketolide':'Кетолид','Lipoglycopeptide':'Липогликопептид','Penem':'Пенем','Penicillin':'Пенициллин','Polymyxin':'Полимиксин','Oxacephem':'Оксацефем','Carbacephem':'Карбaцефем','Glycopeptide':'Гликопептид',
    'Anti-staphylococcal beta-lactams':'Антистафилококковые β-лактамы','Beta-lactams':'β-лактамы','Cephalosporins':'Цефалоспорины','Cephamycins':'Цефамицины','Extended-spectrum cephalosporins':'Цефалоспорины расширенного спектра',
    'Fluoroquinolones':'Фторхинолоны','Multiple classes':'Несколько классов','Polymyxins':'Полимиксины',
    'critical':'критический','Critical':'Критический','high':'высокий','High':'Высокий','medium':'средний','Medium':'Средний','low':'низкий','Low':'Низкий',
    'Core':'Ключевой','Important':'Важный','Phenotypic marker':'Фенотипический маркер','Surveillance marker':'Маркер эпиднадзора','Phenotype context':'Фенотипический контекст'
  }));
  const RING=new Map([['14-Membered ring','14-членное макролидное кольцо'],['15-Membered ring','15-членное макролидное кольцо'],['16-Membered ring','16-членное макролидное кольцо']]);
  let pending=false;
  const isRu=()=>{try{return (localStorage.getItem('atlas-preview-language')||'ru')==='ru'}catch{return true}};
  const mostlyLatin=s=>{const latin=(s.match(/[A-Za-z]/g)||[]).length,cyr=(s.match(/[А-Яа-яЁё]/g)||[]).length;return latin>=3&&latin>cyr*2};
  function translate(value){const s=String(value||'').trim();return EXACT.get(s)||RING.get(s)||s}
  function translateTextNodes(root){
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    for(const n of nodes){const raw=n.nodeValue,trim=raw.trim();if(!trim)continue;const next=translate(trim);if(next!==trim)n.nodeValue=raw.replace(trim,next)}
  }
  function localizeFilters(){
    const primary=document.getElementById('filter-primary');
    if(primary)for(const o of primary.options){const raw=o.value||o.textContent.trim();if(raw)o.textContent=translate(raw)}
  }
  function simplifyAntimicrobialEnglish(){
    const tab=document.querySelector('.reference-tabs [data-tab="antimicrobials"].active, .reference-nav [data-tab="antimicrobials"].active');
    if(!tab)return;
    document.querySelectorAll('#catalog-list .ref-name').forEach(box=>{const strong=box.querySelector('strong'),small=box.querySelector('small');if(!strong||!small)return;const original=small.textContent.trim();if(mostlyLatin(original)&&strong.textContent.trim()!==original){box.title=original;small.hidden=true;}});
    const detail=document.querySelector('#reference-detail .detail-top');if(detail){const h=detail.querySelector('h2'),p=detail.querySelector('p');if(h&&p){const original=p.textContent.trim();if(mostlyLatin(original)&&h.textContent.trim()!==original){h.title=original;p.hidden=true;}}}
  }
  function markUntranslatedProse(){
    document.querySelectorAll('#reference-detail .detail-text p, #mechanism-detail .mechanism-description').forEach(p=>{const s=p.textContent.trim();if(s.length>70&&mostlyLatin(s)){p.lang='en';p.title='Оригинальный текст источника на английском языке';}})
  }
  function apply(){pending=false;if(!isRu())return;localizeFilters();for(const selector of ['#catalog-list','#reference-detail','#mechanism-list','#mechanism-detail','#mechanism-category']){const root=document.querySelector(selector);if(root)translateTextNodes(root)}simplifyAntimicrobialEnglish();markUntranslatedProse()}
  function schedule(){if(pending)return;pending=true;queueMicrotask(apply)}
  function boot(){schedule();const roots=['catalog-list','reference-detail','filter-primary','mechanism-list','mechanism-detail','mechanism-category'].map(id=>document.getElementById(id)).filter(Boolean);const observer=new MutationObserver(schedule);for(const r of roots)observer.observe(r,{childList:true,subtree:true,characterData:true});document.addEventListener('atlas:language-changed',()=>setTimeout(schedule,0));document.addEventListener('click',e=>{if(e.target.closest?.('[data-lang],[data-tab]'))setTimeout(schedule,20)})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
