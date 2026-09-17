(() => {
  'use strict';
  if (window.__atlasMechanismLayerInit) return;
  window.__atlasMechanismLayerInit = true;

  const panel = document.querySelector('.map-panel');
  const target = document.getElementById('kazakhstan-map');
  const antibioticSelect = document.getElementById('map-antibiotic');
  const caption = document.getElementById('map-caption');
  if (!panel || !target || !antibioticSelect) return;

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = './map-mechanisms.css?v=20260916-1';
  document.head.appendChild(style);

  const mechanisms = {
    ESBL:{ru:'БЛРС / ESBL',kk:'Кеңейтілген спектрлі β-лактамаза / ESBL',en:'Extended-spectrum beta-lactamase (ESBL)',base:9,spread:24},
    AMPC:{ru:'AmpC β-лактамаза',kk:'AmpC β-лактамаза',en:'AmpC beta-lactamase',base:4,spread:15},
    KPC:{ru:'KPC-карбапенемаза',kk:'KPC-карбапенемаза',en:'KPC carbapenemase',base:.8,spread:8},
    NDM:{ru:'NDM-металло-β-лактамаза',kk:'NDM металло-β-лактамаза',en:'NDM metallo-beta-lactamase',base:1.2,spread:10},
    OXA48:{ru:'OXA-48-подобная карбапенемаза',kk:'OXA-48-тәрізді карбапенемаза',en:'OXA-48-like carbapenemase',base:1.8,spread:11},
    ACIN_OXA:{ru:'OXA-карбапенемазы Acinetobacter',kk:'Acinetobacter OXA-карбапенемазалары',en:'Acinetobacter OXA carbapenemases',base:3,spread:17},
    MRSA:{ru:'MRSA / mec-резистентность',kk:'MRSA / mec арқылы төзімділік',en:'MRSA / mec-mediated resistance',base:7,spread:20},
    VRE:{ru:'VRE / van-резистентность',kk:'VRE / van арқылы төзімділік',en:'VRE / van-mediated resistance',base:1.5,spread:9},
    FQ_TARGET:{ru:'Фторхинолоновая резистентность',kk:'Фторхинолондарға төзімділік',en:'Fluoroquinolone target alteration',base:10,spread:28},
    COL_MCR:{ru:'mcr-резистентность к колистину',kk:'Колистинге mcr арқылы төзімділік',en:'mcr-mediated colistin resistance',base:.3,spread:4.5},
    PORIN_EFFLUX:{ru:'Порины / эффлюкс',kk:'Пориндер / эффлюкс',en:'Porin loss / efflux',base:6,spread:18}
  };

  const params = new URLSearchParams(location.search);
  let mode = params.get('layer') === 'mechanism' ? 'mechanism' : 'antibiotic';
  let mechanismCode = mechanisms[params.get('mechanism')] ? params.get('mechanism') : 'ESBL';
  let regions = [];

  const i18n = () => window.AtlasPreviewI18n;
  const lang = () => i18n()?.language || 'ru';
  const t = (ru,kk,en) => lang()==='en'?en:lang()==='kk'?kk:ru;
  const mechName = code => mechanisms[code]?.[lang()] || mechanisms[code]?.ru || code;
  const locale = () => lang()==='en'?'en-US':lang()==='kk'?'kk-KZ':'ru-RU';
  const decimal = value => Number(value).toLocaleString(locale(),{minimumFractionDigits:1,maximumFractionDigits:1});
  const hash = input => {let h=0;for(let i=0;i<input.length;i++)h=((h<<5)-h)+input.charCodeAt(i);return Math.abs(h);};
  const valueFor = pcode => {const p=mechanisms[mechanismCode];return Number((p.base+((hash(`${pcode}:${mechanismCode}`)%1000)/1000)*p.spread).toFixed(1));};
  const colorFor = value => value>=20?'#d95f67':value>=10?'#e6a94e':value>=5?'#58afd1':'#76c8b2';

  const head = panel.querySelector('.panel-head');
  const controls = document.createElement('div');
  controls.className = 'map-layer-controls';
  const layerSelect = document.createElement('select');
  layerSelect.id = 'map-layer-mode';
  const mechanismSelect = document.createElement('select');
  mechanismSelect.id = 'map-mechanism-select';
  controls.append(layerSelect, mechanismSelect);
  head.appendChild(controls);
  controls.appendChild(antibioticSelect);

  const nav = document.querySelector('.nav');
  if (nav && !document.querySelector('.atlas-mechanism-nav')) {
    const link = document.createElement('a');
    link.className = 'nav-item atlas-mechanism-nav';
    link.href = './mechanisms.html';
    link.innerHTML = `<span>⌬</span><span>${t('Механизмы AMR','AMR механизмдері','AMR mechanisms')}</span>`;
    const before = [...nav.children].find(el => el.dataset?.section === 'Данные и методы');
    before ? nav.insertBefore(link,before) : nav.appendChild(link);
  }

  function buildControls(){
    const currentMode=mode,currentMechanism=mechanismCode;
    layerSelect.innerHTML=`<option value="antibiotic">${t('Антибиотик','Антибиотик','Antibiotic')}</option><option value="mechanism">${t('Механизм AMR','AMR механизмі','AMR mechanism')}</option>`;
    mechanismSelect.innerHTML=Object.keys(mechanisms).map(code=>`<option value="${code}">${mechName(code)}</option>`).join('');
    layerSelect.value=currentMode; mechanismSelect.value=currentMechanism;
    const navLabel=document.querySelector('.atlas-mechanism-nav span:last-child'); if(navLabel)navLabel.textContent=t('Механизмы AMR','AMR механизмдері','AMR mechanisms');
  }

  function updateLegend(){
    const legend=panel.querySelector('.amr-map-legend'); if(!legend)return;
    if(mode==='mechanism') legend.innerHTML='<span><i style="background:#76c8b2"></i>&lt;5%</span><span><i style="background:#58afd1"></i>5–10%</span><span><i style="background:#e6a94e"></i>10–20%</span><span><i style="background:#d95f67"></i>≥20%</span>';
    else legend.innerHTML='<span><i style="background:#76c8b2"></i>&lt;20%</span><span><i style="background:#58afd1"></i>20–30%</span><span><i style="background:#e6a94e"></i>30–40%</span><span><i style="background:#d95f67"></i>≥40%</span>';
  }

  function updateUrl(){
    const url=new URL(location.href);
    if(mode==='mechanism'){url.searchParams.set('layer','mechanism');url.searchParams.set('mechanism',mechanismCode);}else{url.searchParams.delete('layer');url.searchParams.delete('mechanism');}
    history.replaceState(null,'',url);
  }

  function applyMechanismLayer(){
    if(mode!=='mechanism')return;
    const paths=[...target.querySelectorAll('.atlas-region')];
    const labels=[...target.querySelectorAll('.atlas-region-label')];
    paths.forEach((path,index)=>{const value=valueFor(path.dataset.pcode||`R${index}`);path.setAttribute('fill',colorFor(value));path.dataset.mechanismValue=String(value);path.setAttribute('aria-label',`${path.getAttribute('aria-label')?.split(':')[0]||''}: ${mechName(mechanismCode)} ${decimal(value)}%`);if(labels[index])labels[index].textContent=`${Math.round(value)}%`;});
    const demo=t('демонстрационные значения','демонстрациялық мәндер','demo values');
    if(caption)caption.textContent=`${mechName(mechanismCode)} · ${t('Казахстан','Қазақстан','Kazakhstan')} · 2026 YTD · ${demo}`;
    const source=panel.querySelector('.amr-map-source');if(source)source.textContent=t('Демонстрационный слой механизма · реальные региональные данные будут подключены позже','Механизмнің демонстрациялық қабаты · нақты өңірлік деректер кейін қосылады','Demo mechanism layer · real regional data will be connected later');
    updateLegend();
  }

  function applyMode(){
    mechanismSelect.style.display=mode==='mechanism'?'':'none';
    antibioticSelect.style.display=mode==='antibiotic'?'':'none';
    layerSelect.value=mode; mechanismSelect.value=mechanismCode;
    updateUrl();
    if(mode==='antibiotic'){
      antibioticSelect.dispatchEvent(new Event('change',{bubbles:true}));
      setTimeout(updateLegend,0);
    }else setTimeout(applyMechanismLayer,0);
  }

  target.addEventListener('pointermove',event=>{
    if(mode!=='mechanism')return;
    const path=event.target.closest?.('.atlas-region');if(!path)return;
    const region=regions.find(r=>r.pcode===path.dataset.pcode);const name=region?(i18n()?.regionName(region)||region.name_kk):path.dataset.pcode;
    const value=Number(path.dataset.mechanismValue||valueFor(path.dataset.pcode));
    const tooltip=target.querySelector('.svg-map-tooltip');if(tooltip)tooltip.innerHTML=`<strong>${name}</strong><span>${mechName(mechanismCode)} <b>${decimal(value)}%</b></span><span>${t('Демонстрационный слой','Демонстрациялық қабат','Demo layer')}</span>`;
  });

  target.addEventListener('click',event=>{
    if(mode!=='mechanism')return;
    const path=event.target.closest?.('.atlas-region');if(!path)return;
    setTimeout(()=>{
      const popup=target.querySelector('.svg-map-popup');if(!popup)return;
      const value=Number(path.dataset.mechanismValue||valueFor(path.dataset.pcode));
      const kicker=popup.querySelector('.popup-kicker');if(kicker)kicker.textContent=`${mechName(mechanismCode)} · ${t('демонстрационные данные','демонстрациялық деректер','demo data')}`;
      const first=popup.querySelector('.popup-grid div:first-child');if(first){const label=first.querySelector('span'),strong=first.querySelector('strong');if(label)label.textContent=mechanismCode;if(strong)strong.textContent=`${decimal(value)}%`;}
      const p=popup.querySelector('p');if(p)p.textContent=t('Условная распространённость механизма для прототипа. Реальные региональные данные пока не подключены.','Прототип үшін механизмнің шартты таралуы. Нақты өңірлік деректер әлі қосылмаған.','Indicative mechanism prevalence for the prototype. Real regional data are not connected yet.');
    },0);
  });

  layerSelect.addEventListener('change',()=>{mode=layerSelect.value;applyMode();});
  mechanismSelect.addEventListener('change',()=>{mechanismCode=mechanismSelect.value;updateUrl();applyMechanismLayer();});
  document.addEventListener('atlas:map-ready',event=>{regions=event.detail?.regions||[];buildControls();applyMode();if(mode==='mechanism')setTimeout(()=>panel.scrollIntoView({behavior:'smooth',block:'center'}),180);});
  document.addEventListener('atlas:language-changed',()=>{buildControls();setTimeout(()=>{if(mode==='mechanism')applyMechanismLayer();},0);});

  buildControls();
  if(target.querySelector('.atlas-region'))applyMode();
})();
