(() => {
  'use strict';
  const map = document.getElementById('national-kz-map');
  if (!map) return;
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
  let regions = [];
  let activeLayer = 'resistance';
  let activeLang = localStorage.getItem('atlas-preview-language') || 'ru';
  let selected = null;

  const names = {
    KZ10:['Абайская область','Абай облысы','Abay Region'],KZ11:['Акмолинская область','Ақмола облысы','Akmola Region'],KZ15:['Актюбинская область','Ақтөбе облысы','Aktobe Region'],KZ19:['Алматинская область','Алматы облысы','Almaty Region'],KZ23:['Атырауская область','Атырау облысы','Atyrau Region'],KZ27:['Западно-Казахстанская область','Батыс Қазақстан облысы','West Kazakhstan Region'],KZ31:['Жамбылская область','Жамбыл облысы','Zhambyl Region'],KZ33:['Жетысуская область','Жетісу облысы','Zhetysu Region'],KZ35:['Карагандинская область','Қарағанды облысы','Karaganda Region'],KZ39:['Костанайская область','Қостанай облысы','Kostanay Region'],KZ43:['Кызылординская область','Қызылорда облысы','Kyzylorda Region'],KZ47:['Мангистауская область','Маңғыстау облысы','Mangystau Region'],KZ55:['Павлодарская область','Павлодар облысы','Pavlodar Region'],KZ59:['Северо-Казахстанская область','Солтүстік Қазақстан облысы','North Kazakhstan Region'],KZ61:['Туркестанская область','Түркістан облысы','Turkistan Region'],KZ62:['Улытауская область','Ұлытау облысы','Ulytau Region'],KZ63:['Восточно-Казахстанская область','Шығыс Қазақстан облысы','East Kazakhstan Region'],KZ71:['Астана','Астана','Astana'],KZ75:['Алматы','Алматы','Almaty'],KZ79:['Шымкент','Шымкент','Shymkent']
  };
  const langIndex = () => activeLang === 'kk' ? 1 : activeLang === 'en' ? 2 : 0;
  const displayName = r => names[r.pcode]?.[langIndex()] || r.name_kk || r.name_en || r.pcode;
  const locale = () => activeLang === 'kk' ? 'kk-KZ' : activeLang === 'en' ? 'en-US' : 'ru-RU';
  const hash = input => { let h=0; for (const ch of String(input)) h=((h<<5)-h)+ch.charCodeAt(0); return Math.abs(h); };
  const base = r => 17 + (hash(r.pcode) % 210) / 10;
  const layerValue = r => {
    const b=base(r);
    if(activeLayer==='esbl') return Math.max(4,Math.min(46,b*.78+4.2));
    if(activeLayer==='cre') return Math.max(.4,Math.min(23,b*.27-2.5));
    if(activeLayer==='mrsa') return Math.max(2,Math.min(31,b*.48+1.7));
    return b;
  };
  const color = v => v>=34?'#d96c70':v>=26?'#d8a35c':v>=18?'#6caec5':'#9bcfc4';
  const pct = v => `${Number(v).toLocaleString(locale(),{minimumFractionDigits:1,maximumFractionDigits:1})}%`;
  const formatInt = v => Math.round(v).toLocaleString(locale());
  const layerLabel = () => ({resistance:['Резистентность','Төзімділік','Resistance'],esbl:['ESBL','ESBL','ESBL'],cre:['CRE','CRE','CRE'],mrsa:['MRSA','MRSA','MRSA']})[activeLayer][langIndex()];
  const demoLabel = () => activeLang==='en'?'demo values':activeLang==='kk'?'демонстрациялық мәндер':'демонстрационные значения';

  function updateSelected(r){
    selected=r;
    document.querySelectorAll('.atlas-region.selected').forEach(p=>p.classList.remove('selected'));
    if(r) document.querySelector(`.atlas-region[data-pcode="${r.pcode}"]`)?.classList.add('selected');
    if(!r){
      regionCode.textContent='KZ'; regionName.textContent=activeLang==='en'?'Kazakhstan':activeLang==='kk'?'Қазақстан':'Казахстан';
      rEl.textContent='29,8%'; mdrEl.textContent='12,4%'; isolatesEl.textContent='186 742';
      signalEl.textContent=activeLang==='en'?'National demo profile. Select a region or city on the map.':activeLang==='kk'?'Ұлттық демонстрациялық профиль. Картадан облысты немесе қаланы таңдаңыз.':'Демонстрационный национальный профиль. Выберите область или город на карте.';
      return;
    }
    const value=layerValue(r), b=base(r);
    regionCode.textContent=r.pcode; regionName.textContent=displayName(r); rEl.textContent=pct(value); mdrEl.textContent=pct(Math.max(3,b*.34)); isolatesEl.textContent=formatInt(1800+b*120);
    signalEl.textContent = activeLang==='en' ? `${layerLabel()}: indicative regional profile. Demo data.` : activeLang==='kk' ? `${layerLabel()}: өңірлік индикативті профиль. Деректер демонстрациялық.` : `${layerLabel()}: индикативный региональный профиль. Данные демонстрационные.`;
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
  function moveTooltip(e){const bounds=document.querySelector('.atlas-map-canvas').getBoundingClientRect();tooltip.style.left=`${Math.min(bounds.width-190,Math.max(10,e.clientX-bounds.left+14))}px`;tooltip.style.top=`${Math.min(bounds.height-80,Math.max(10,e.clientY-bounds.top+14))}px`}

  modes.forEach(btn=>btn.addEventListener('click',()=>{modes.forEach(b=>b.classList.toggle('active',b===btn));activeLayer=btn.dataset.layer;render();updateSelected(selected)}));
  langButtons.forEach((btn,i)=>btn.addEventListener('click',()=>{activeLang=['ru','kk','en'][i];localStorage.setItem('atlas-preview-language',activeLang);langButtons.forEach((b,j)=>b.classList.toggle('active',j===i));render();updateSelected(selected)}));
  langButtons.forEach((b,i)=>b.classList.toggle('active',['ru','kk','en'][i]===activeLang));
  fetch('./regions.json').then(r=>r.json()).then(data=>{regions=data;render();updateSelected(null)}).catch(()=>{map.outerHTML='<div style="padding:80px;text-align:center;color:#7b9098">Карта временно недоступна</div>'});
})();