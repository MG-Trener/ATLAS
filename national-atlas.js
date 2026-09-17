(() => {
  'use strict';
  const map = document.getElementById('national-kz-map');
  if (!map) return;

  const extraStyle=document.createElement('link');extraStyle.rel='stylesheet';extraStyle.href='./national-atlas-enhancements.css?v=20260916-1';document.head.appendChild(extraStyle);

  const canvas=document.querySelector('.atlas-map-canvas');
  const tooltip = document.getElementById('national-map-tooltip');
  const layerCaption = document.getElementById('atlas-layer-caption');
  const modes = [...document.querySelectorAll('.atlas-mode-switch button')];
  const langButtons = [...document.querySelectorAll('.atlas-language button')];
  const regionName = document.getElementById('atlas-region-name');
  const regionCode = document.getElementById('atlas-region-code');
  const rEl = document.getElementById('atlas-r');
  const mdrEl = document.getElementById('atlas-mdr');
  const isolatesEl = document.getElementById('atlas-isolates');
  const signalEl = document.getElementById('atlas-signal');
  const insightRail=document.querySelector('.atlas-insight-rail');
  let regions = [];
  let activeLayer = 'resistance';
  let activeLang = localStorage.getItem('atlas-preview-language') || 'ru';
  let selected = null;
  let regionSelect=null, compareBox=null;

  const names = {
    KZ10:['Абайская область','Абай облысы','Abay Region'],KZ11:['Акмолинская область','Ақмола облысы','Akmola Region'],KZ15:['Актюбинская область','Ақтөбе облысы','Aktobe Region'],KZ19:['Алматинская область','Алматы облысы','Almaty Region'],KZ23:['Атырауская область','Атырау облысы','Atyrau Region'],KZ27:['Западно-Казахстанская область','Батыс Қазақстан облысы','West Kazakhstan Region'],KZ31:['Жамбылская область','Жамбыл облысы','Zhambyl Region'],KZ33:['Жетысуская область','Жетісу облысы','Zhetysu Region'],KZ35:['Карагандинская область','Қарағанды облысы','Karaganda Region'],KZ39:['Костанайская область','Қостанай облысы','Kostanay Region'],KZ43:['Кызылординская область','Қызылорда облысы','Kyzylorda Region'],KZ47:['Мангистауская область','Маңғыстау облысы','Mangystau Region'],KZ55:['Павлодарская область','Павлодар облысы','Pavlodar Region'],KZ59:['Северо-Казахстанская область','Солтүстік Қазақстан облысы','North Kazakhstan Region'],KZ61:['Туркестанская область','Түркістан облысы','Turkistan Region'],KZ62:['Улытауская область','Ұлытау облысы','Ulytau Region'],KZ63:['Восточно-Казахстанская область','Шығыс Қазақстан облысы','East Kazakhstan Region'],KZ71:['Астана','Астана','Astana'],KZ75:['Алматы','Алматы','Almaty'],KZ79:['Шымкент','Шымкент','Shymkent']
  };
  const langIndex = () => activeLang === 'kk' ? 1 : activeLang === 'en' ? 2 : 0;
  const displayName = r => names[r.pcode]?.[langIndex()] || r.name_kk || r.name_en || r.pcode;
  const locale = () => activeLang === 'kk' ? 'kk-KZ' : activeLang === 'en' ? 'en-US' : 'ru-RU';
  const text=(ru,kk,en)=>activeLang==='kk'?kk:activeLang==='en'?en:ru;
  const hash = input => { let h=0; for (const ch of String(input)) h=((h<<5)-h)+ch.charCodeAt(0); return Math.abs(h); };
  const base = r => 17 + (hash(r.pcode) % 210) / 10;
  const layerValue = r => {
    const b=base(r);
    if(activeLayer==='esbl') return Math.max(4,Math.min(46,b*.78+4.2));
    if(activeLayer==='cre') return Math.max(.4,Math.min(23,b*.27-2.5));
    if(activeLayer==='mrsa') return Math.max(2,Math.min(31,b*.48+1.7));
    return b;
  };
  const nationalValue=()=>({resistance:29.8,esbl:18.4,cre:6.7,mrsa:14.2})[activeLayer]||29.8;
  const color = v => v>=34?'#d96c70':v>=26?'#d8a35c':v>=18?'#6caec5':'#9bcfc4';
  const pct = v => `${Number(v).toLocaleString(locale(),{minimumFractionDigits:1,maximumFractionDigits:1})}%`;
  const formatInt = v => Math.round(v).toLocaleString(locale());
  const ci95=(value,n)=>{const z=1.959964,p=value/100,den=1+z*z/n,mid=(p+z*z/(2*n))/den,margin=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/den;return[pct(Math.max(0,(mid-margin)*100)),pct(Math.min(100,(mid+margin)*100))]};
  const layerLabel = () => ({resistance:['Резистентность','Төзімділік','Resistance'],esbl:['ESBL','ESBL','ESBL'],cre:['CRE','CRE','CRE'],mrsa:['MRSA','MRSA','MRSA']})[activeLayer][langIndex()];
  const demoLabel = () => text('демонстрационные значения','демонстрациялық мәндер','demo values');

  function createExplorationUi(){
    const story=document.querySelector('.atlas-story');
    if(!story||document.querySelector('.atlas-region-browser'))return;
    const browser=document.createElement('div');browser.className='atlas-region-browser';browser.innerHTML=`<label>${text('Быстрый переход к территории','Өңірге жылдам өту','Jump to territory')}</label><div class="atlas-region-browser-row"><select id="atlas-region-select"></select><button id="atlas-reset-region" type="button">${text('Вся страна','Бүкіл ел','Whole country')}</button></div>`;
    document.querySelector('.atlas-mode-switch')?.insertAdjacentElement('afterend',browser);
    regionSelect=browser.querySelector('select');
    browser.querySelector('#atlas-reset-region')?.addEventListener('click',()=>updateSelected(null));

    compareBox=document.createElement('article');compareBox.className='atlas-compare-card';document.querySelector('.atlas-selected-card')?.insertAdjacentElement('afterend',compareBox);

    const controls=document.createElement('div');controls.className='atlas-map-controls2';controls.innerHTML=`<button type="button" data-map-action="labels">${text('Скрыть %','% жасыру','Hide %')}</button><button type="button" data-map-action="focus">${text('Фокус','Фокус','Focus')}</button><button type="button" data-map-action="reset">${text('Сбросить','Қалпына келтіру','Reset')}</button>`;canvas?.appendChild(controls);
    controls.addEventListener('click',e=>{const btn=e.target.closest('button');if(!btn)return;const action=btn.dataset.mapAction;if(action==='labels'){canvas.classList.toggle('labels-off');btn.classList.toggle('active');btn.textContent=canvas.classList.contains('labels-off')?text('Показать %','% көрсету','Show %'):text('Скрыть %','% жасыру','Hide %')}if(action==='focus'){canvas.classList.toggle('focused');btn.classList.toggle('active')}if(action==='reset'){canvas.classList.remove('focused');updateSelected(null)}});

    if(insightRail){const guidance=document.createElement('section');guidance.className='atlas-ranking atlas-method-note';guidance.innerHTML=`<div class="atlas-ranking-head"><strong>${text('КАК ЧИТАТЬ КАРТУ','КАРТАНЫ ҚАЛАЙ ОҚУ КЕРЕК','HOW TO READ THE MAP')}</strong><span>DEMO</span></div><div class="atlas-ranking-list"><div class="atlas-rank-row"><span>N</span><strong>${text('Минимум для публикации','Жариялау минимумы','Publication minimum')}</strong><b>≥ 30</b></div><div class="atlas-rank-row"><span>CI</span><strong>${text('Неопределённость оценки','Бағалаудың белгісіздігі','Estimate uncertainty')}</strong><b>95%</b></div><div class="atlas-rank-row"><span>AST</span><strong>${text('Стандарт и версия','Стандарт және нұсқа','Standard and version')}</strong><b>EUCAST</b></div></div>`;insightRail.appendChild(guidance)}
  }

  function populateRegionSelect(){
    if(!regionSelect)return;
    const current=selected?.pcode||'';
    regionSelect.innerHTML=`<option value="">${text('Казахстан — все территории','Қазақстан — барлық өңірлер','Kazakhstan — all territories')}</option>`;
    regions.slice().sort((a,b)=>displayName(a).localeCompare(displayName(b),locale())).forEach(r=>regionSelect.add(new Option(displayName(r),r.pcode)));
    regionSelect.value=current;
    regionSelect.onchange=()=>updateSelected(regions.find(r=>r.pcode===regionSelect.value)||null);
  }

  function updateCompare(){
    if(!compareBox)return;
    const regionVal=selected?layerValue(selected):nationalValue();
    const nat=nationalValue();
    const sorted=regions.slice().sort((a,b)=>layerValue(b)-layerValue(a));
    const median=sorted.length?layerValue(sorted[Math.floor(sorted.length/2)]):nat;
    const tested=selected?Math.round(1800+base(selected)*120):6496;
    const interval=ci95(regionVal,tested);
    const delta=regionVal-nat;
    const max=Math.max(45,regionVal,nat,median)*1.08;
    compareBox.innerHTML=`<div class="atlas-compare-title"><strong>${text('Сравнение с национальным уровнем','Ұлттық деңгеймен салыстыру','Compare with national level')}</strong><span>${layerLabel()}</span></div><div class="atlas-compare-bars"><div class="atlas-compare-row"><span>${selected?displayName(selected):text('Казахстан','Қазақстан','Kazakhstan')}</span><i><b style="width:${Math.min(100,regionVal/max*100)}%"></b></i><strong>${pct(regionVal)}</strong></div><div class="atlas-compare-row"><span>${text('Казахстан','Қазақстан','Kazakhstan')}</span><i><b style="width:${Math.min(100,nat/max*100)}%"></b></i><strong>${pct(nat)}</strong></div><div class="atlas-compare-row"><span>${text('Медиана регионов','Өңірлер медианасы','Regional median')}</span><i><b style="width:${Math.min(100,median/max*100)}%"></b></i><strong>${pct(median)}</strong></div></div><div class="atlas-compare-summary"><div><b>${interval.join('–')}</b><span>95% CI</span></div><div><b>${formatInt(tested)}</b><span>N tested</span></div><div><b>${selected?(delta>=0?'+':'')+delta.toLocaleString(locale(),{minimumFractionDigits:1,maximumFractionDigits:1})+' п.п.':'—'}</b><span>${text('без ранжирования','рейтингсіз','no ranking')}</span></div></div>`;
  }

  function updateSelected(r){
    selected=r;
    document.querySelectorAll('.atlas-region.selected').forEach(p=>p.classList.remove('selected'));
    if(r) document.querySelector(`.atlas-region[data-pcode="${r.pcode}"]`)?.classList.add('selected');
    if(regionSelect)regionSelect.value=r?.pcode||'';
    if(!r){
      regionCode.textContent='KZ'; regionName.textContent=text('Казахстан','Қазақстан','Kazakhstan');
      rEl.textContent=pct(nationalValue()); mdrEl.textContent='12,4%'; isolatesEl.textContent='186 742';
      signalEl.textContent=text('Демонстрационный национальный профиль. Выберите область или город на карте.','Ұлттық демонстрациялық профиль. Картадан облысты немесе қаланы таңдаңыз.','National demo profile. Select a region or city on the map.');
      updateCompare();return;
    }
    const value=layerValue(r), b=base(r);
    regionCode.textContent=r.pcode; regionName.textContent=displayName(r); rEl.textContent=pct(value); mdrEl.textContent=pct(Math.max(3,b*.34)); isolatesEl.textContent=formatInt(1800+b*120);
    signalEl.textContent = text(`${layerLabel()}: индикативный региональный профиль. Данные демонстрационные.`,`${layerLabel()}: өңірлік индикативті профиль. Деректер демонстрациялық.`,`${layerLabel()}: indicative regional profile. Demo data.`);
    updateCompare();
  }

  function render(){
    map.innerHTML='';
    regions.forEach(r=>{
      const path=document.createElementNS('http://www.w3.org/2000/svg','path');
      const value=layerValue(r);
      path.setAttribute('d',r.path); path.setAttribute('fill',color(value)); path.dataset.pcode=r.pcode||''; path.classList.add('atlas-region'); path.setAttribute('tabindex','0');
      path.setAttribute('aria-label',`${displayName(r)} ${pct(value)}`);
      path.addEventListener('pointerenter',e=>{tooltip.innerHTML=`<strong>${displayName(r)}</strong>${layerLabel()} · ${pct(value)}`;tooltip.classList.add('show');moveTooltip(e)});
      path.addEventListener('pointermove',moveTooltip); path.addEventListener('pointerleave',()=>tooltip.classList.remove('show'));
      path.addEventListener('click',()=>updateSelected(r)); path.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();updateSelected(r)}});
      if(selected?.pcode===r.pcode) path.classList.add('selected');
      map.appendChild(path);
      if(r.cx&&r.cy){const label=document.createElementNS('http://www.w3.org/2000/svg','text');label.setAttribute('x',r.cx);label.setAttribute('y',r.cy);label.setAttribute('text-anchor','middle');label.classList.add('atlas-region-label');label.textContent=`${Math.round(value)}%`;map.appendChild(label)}
    });
    layerCaption.textContent=`${layerLabel()} · ${demoLabel()}`;
  }
  function moveTooltip(e){const bounds=canvas.getBoundingClientRect();tooltip.style.left=`${Math.min(bounds.width-190,Math.max(10,e.clientX-bounds.left+14))}px`;tooltip.style.top=`${Math.min(bounds.height-80,Math.max(10,e.clientY-bounds.top+14))}px`}

  modes.forEach(btn=>btn.addEventListener('click',()=>{modes.forEach(b=>b.classList.toggle('active',b===btn));activeLayer=btn.dataset.layer;render();updateSelected(selected)}));
  langButtons.forEach((btn,i)=>btn.addEventListener('click',()=>{activeLang=['ru','kk','en'][i];localStorage.setItem('atlas-preview-language',activeLang);langButtons.forEach((b,j)=>b.classList.toggle('active',j===i));populateRegionSelect();render();updateSelected(selected)}));
  langButtons.forEach((b,i)=>b.classList.toggle('active',['ru','kk','en'][i]===activeLang));
  createExplorationUi();
  fetch('./regions.json').then(r=>r.json()).then(data=>{regions=data;populateRegionSelect();render();updateSelected(null)}).catch(()=>{map.outerHTML='<div style="padding:80px;text-align:center;color:#7b9098">Карта временно недоступна</div>'});
})();
