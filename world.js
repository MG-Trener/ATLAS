(()=>{
const GEO='https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';
const SNAPSHOT='./data/who-glass.json?v=20260921-full';
const state={data:null,geo:null,infection:null,pathogen:null,antibiotic:null,year:'latest',country:'USA',search:''};
const $=id=>document.getElementById(id);
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=v=>Number(v).toLocaleString('ru-RU',{maximumFractionDigits:1});
const int=v=>Number(v).toLocaleString('ru-RU',{maximumFractionDigits:0});
const fmtDate=v=>v?new Date(v).toLocaleString('ru-RU',{dateStyle:'medium',timeStyle:'short'}):'—';
const pretty=s=>String(s||'').replace(/_/g,' ').replace(/\s+/g,' ').trim();
async function json(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json();}
function validDataset(d){return d?.meta?.schemaVersion==='2.0'&&Array.isArray(d.records)&&d.records.length>0;}
function geoCode(f){const p=f.properties||{};return p['ISO3166-1-Alpha-3']||p.ISO_A3||p.iso_a3||p.ADM0_A3||p.ISO3||'';}
function geoName(f){const p=f.properties||{};return p.name||p.ADMIN||p.NAME||geoCode(f);}
function countryName(code){const f=state.geo?.features?.find(x=>geoCode(x)===code);return f?geoName(f):code;}
function project(pt){return[(Number(pt[0])+180)/360*1000,(90-Number(pt[1]))/180*500];}
function ringPath(ring){let d='',prev=null;for(const pt of ring){const [x,y]=project(pt);const lon=Number(pt[0]);if(prev!==null&&Math.abs(lon-prev)>180)d+=` M${x.toFixed(1)},${y.toFixed(1)}`;else d+=`${d?' L':'M'}${x.toFixed(1)},${y.toFixed(1)}`;prev=lon;}return d+' Z';}
function geometryPath(g){if(!g)return'';if(g.type==='Polygon')return g.coordinates.map(ringPath).join(' ');if(g.type==='MultiPolygon')return g.coordinates.flatMap(p=>p.map(ringPath)).join(' ');return'';}
function color(v){if(v==null)return'#d9e3e8';if(v<10)return'#79d9ba';if(v<25)return'#39b9b0';if(v<50)return'#419bc0';return'#d7a85f';}
function baseRecords(){return state.data.records.filter(r=>r.infection===state.infection&&r.pathogen===state.pathogen&&r.antibiotic===state.antibiotic);}
function recordsForMap(){const rows=baseRecords();if(state.year!=='latest')return rows.filter(r=>r.year===Number(state.year));const byCountry=new Map();for(const r of rows){const prev=byCountry.get(r.countryCode);if(!prev||r.year>prev.year)byCountry.set(r.countryCode,r);}return [...byCountry.values()];}
function currentRecord(code){return recordsForMap().find(r=>r.countryCode===code)||null;}
function trend(code){return baseRecords().filter(r=>r.countryCode===code).sort((a,b)=>a.year-b.year);}
function unique(values){return [...new Set(values)].sort((a,b)=>String(a).localeCompare(String(b),'ru'));}
function chooseBestDefaults(){
  const counts=new Map();
  for(const r of state.data.records){
    const key=[r.infection,r.pathogen,r.antibiotic].join('\u0001');
    if(!counts.has(key))counts.set(key,new Set());
    counts.get(key).add(r.countryCode);
  }
  const entries=[...counts.entries()];
  const withUsa=entries.filter(([,countries])=>countries.has('USA'));
  const pool=withUsa.length?withUsa:entries;
  const best=pool.sort((a,b)=>b[1].size-a[1].size)[0]?.[0]?.split('\u0001');
  if(best){[state.infection,state.pathogen,state.antibiotic]=best;}
}
function option(v,label,current){return`<option value="${safe(v)}" ${v===current?'selected':''}>${safe(label)}</option>`;}
function renderControls(){
  const infections=unique(state.data.records.map(r=>r.infection));
  if(!infections.includes(state.infection))state.infection=infections[0];
  const byInfection=state.data.records.filter(r=>r.infection===state.infection);
  const pathogens=unique(byInfection.map(r=>r.pathogen));
  if(!pathogens.includes(state.pathogen))state.pathogen=pathogens[0];
  const byPathogen=byInfection.filter(r=>r.pathogen===state.pathogen);
  const antibiotics=unique(byPathogen.map(r=>r.antibiotic));
  if(!antibiotics.includes(state.antibiotic))state.antibiotic=antibiotics[0];
  const years=unique(byPathogen.filter(r=>r.antibiotic===state.antibiotic).map(r=>r.year)).sort((a,b)=>b-a);
  if(state.year!=='latest'&&!years.includes(Number(state.year)))state.year='latest';
  $('infection').innerHTML=infections.map(v=>option(v,pretty(v),state.infection)).join('');
  $('pathogen').innerHTML=pathogens.map(v=>option(v,pretty(v),state.pathogen)).join('');
  $('antibiotic').innerHTML=antibiotics.map(v=>option(v,pretty(v),state.antibiotic)).join('');
  $('year').innerHTML=option('latest','Последние доступные по каждой стране',state.year)+years.map(y=>option(String(y),String(y),String(state.year))).join('');
}
function renderMeta(){const m=state.data.meta,shown=recordsForMap(),years=shown.map(r=>r.year),coverage=new Set(shown.map(r=>r.countryCode));$('dataset-meta').innerHTML=`<div class="meta-row"><span>Источник</span><b>WHO GLASS Dashboard / XMART</b></div><div class="meta-row"><span>Версия snapshot</span><b>${safe(m.version)}</b></div><div class="meta-row"><span>Период WHO GLASS</span><b>${safe(m.period?.from)}–${safe(m.period?.to)}</b></div><div class="meta-row"><span>Последняя синхронизация</span><b>${safe(fmtDate(m.checkedAt))}</b></div><div class="meta-row"><span>Весь набор</span><b>${int(m.recordCount)} комбинаций · ${int(m.countryCount)} стран/территорий</b></div><div class="meta-row"><span>На текущей карте</span><b>${coverage.size} стран${years.length?` · данные ${Math.min(...years)}–${Math.max(...years)}`:''}</b></div>${m.usaAvailable?'<div class="callout"><strong>США присутствуют в полном GLASS snapshot.</strong> Конкретное значение зависит от выбранной комбинации микроорганизм–антибиотик и контекста инфекции.</div>':''}`;}
function renderMap(){const box=$('world-map');if(!state.geo){box.innerHTML='<div class="map-empty">Загрузка геометрии карты мира…</div>';return;}const lookup=new Map(recordsForMap().map(r=>[r.countryCode,r]));const paths=state.geo.features.map(f=>{const code=geoCode(f);if(!code)return'';const r=lookup.get(code);const selected=code===state.country;return`<path tabindex="0" role="button" class="world-country${selected?' selected':''}${code==='KAZ'?' kazakhstan':''}" data-country="${safe(code)}" d="${geometryPath(f.geometry)}" fill="${color(r?.percentResistant)}"><title>${safe(geoName(f))} · ${r?`${fmt(r.percentResistant)}% R · ${r.year}`:'нет опубликованного значения для выбранной комбинации'}</title></path>`;}).join('');box.innerHTML=`<svg viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet" aria-label="Мировая карта WHO GLASS"><rect width="1000" height="500" fill="#f4f8fa"/>${paths}</svg>`;box.querySelectorAll('[data-country]').forEach(el=>{const pick=()=>{state.country=el.dataset.country;renderMap();renderCountry();renderList();};el.addEventListener('click',pick);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick();}});});}
function renderCountry(){const panel=$('country-panel'),current=currentRecord(state.country),rows=trend(state.country),name=countryName(state.country);if(!current){panel.innerHTML=`<div class="eyebrow">${safe(name)}</div><h2>Нет опубликованного значения</h2><p class="muted">Для выбранной комбинации <b>${safe(pretty(state.pathogen))}</b> × <b>${safe(pretty(state.antibiotic))}</b> WHO GLASS не публикует значение для этой страны${state.year==='latest'?'':` за ${safe(state.year)} год`}.</p><div class="callout">Это не означает отсутствие AMR. Попробуйте другой антибиотик, микроорганизм, контекст инфекции или режим «последние доступные».</div>${state.country==='KAZ'?'<a class="button" href="./index.html">Открыть национальный ATLAS Казахстана</a>':''}<h3>Страны с данными</h3><div class="country-list" id="country-list"></div>`;renderList();return;}const max=Math.max(1,...rows.map(r=>r.percentResistant));const bars=rows.map(r=>`<div class="trend-column"><div class="trend-bar" style="height:${Math.max(4,r.percentResistant/max*100)}%" title="${r.year}: ${fmt(r.percentResistant)}%"></div><span>${r.year}</span></div>`).join('');const count=current.interpretableAST!=null?`${int(current.resistant??0)} R / ${int(current.interpretableAST)} AST`:current.resistant!=null?`${int(current.resistant)} устойчивых`:'число AST не опубликовано';panel.innerHTML=`<div class="eyebrow">${safe(name)} · ${safe(current.year)}</div><h2>${safe(pretty(current.pathogen))}</h2><div class="country-value">${fmt(current.percentResistant)}<small>% R</small></div><p class="muted">${safe(pretty(current.antibiotic))}<br>${safe(pretty(current.infection))}</p><div class="callout"><strong>${safe(count)}</strong>${current.totalSpecimenIsolates!=null?`<br>Всего изолятов материала: ${int(current.totalSpecimenIsolates)}`:''}</div><h3>Динамика доступных лет</h3><div class="trend">${bars||'<span class="muted">Нет ряда</span>'}</div>${state.country==='KAZ'?'<a class="ghost-button" href="./index.html">Карта областей Казахстана</a>':''}<h3>Страны с данными</h3><div class="country-list" id="country-list"></div>`;renderList();}
function renderList(){const list=$('country-list');if(!list)return;const q=state.search.trim().toLowerCase();const rows=recordsForMap().map(r=>({...r,name:countryName(r.countryCode)})).filter(r=>!q||r.name.toLowerCase().includes(q)||r.countryCode.toLowerCase().includes(q)).sort((a,b)=>a.name.localeCompare(b.name,'ru'));list.innerHTML=rows.map(r=>`<button type="button" data-pick="${safe(r.countryCode)}" class="${r.countryCode===state.country?'active':''}"><span>${safe(r.name)}<small>${safe(r.year)}</small></span><b>${fmt(r.percentResistant)}%</b></button>`).join('')||'<div class="empty-state">Нет стран с данными по выбранной комбинации.</div>';list.querySelectorAll('[data-pick]').forEach(b=>b.addEventListener('click',()=>{state.country=b.dataset.pick;renderMap();renderCountry();}));}
function ensureSelectedCountry(){const codes=new Set(recordsForMap().map(r=>r.countryCode));if(codes.has(state.country))return;if(codes.has('USA'))state.country='USA';else if(codes.has('KAZ'))state.country='KAZ';else state.country=[...codes][0]||'USA';}
function renderAll(){renderControls();ensureSelectedCountry();renderMeta();renderMap();renderCountry();renderList();}
async function loadGeo(){try{state.geo=await json(GEO);}catch(e){console.error(e);state.geo={features:[]};}renderAll();}
async function loadSnapshot(force=false){const btn=$('refresh-who');if(btn){btn.disabled=true;btn.textContent='Обновление…';}try{const d=await json(`${SNAPSHOT}${force?`&t=${Date.now()}`:''}`);if(!validDataset(d))throw new Error('snapshot schema mismatch');state.data=d;chooseBestDefaults();renderAll();}catch(e){console.error(e);$('dataset-meta').innerHTML=`<div class="callout warning"><strong>Не удалось загрузить WHO GLASS snapshot.</strong> ${safe(e.message)}</div>`;}finally{if(btn){btn.disabled=false;btn.textContent='Перезагрузить данные';}}}
$('infection').addEventListener('change',e=>{state.infection=e.target.value;state.pathogen=null;state.antibiotic=null;state.year='latest';renderAll();});
$('pathogen').addEventListener('change',e=>{state.pathogen=e.target.value;state.antibiotic=null;state.year='latest';renderAll();});
$('antibiotic').addEventListener('change',e=>{state.antibiotic=e.target.value;state.year='latest';renderAll();});
$('year').addEventListener('change',e=>{state.year=e.target.value;renderAll();});
$('country-search').addEventListener('input',e=>{state.search=e.target.value;renderList();});
$('refresh-who').addEventListener('click',()=>loadSnapshot(true));
(async()=>{await loadSnapshot(false);await loadGeo();})();
})();
