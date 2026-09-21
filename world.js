(()=>{
const GEO='https://raw.githubusercontent.com/PublicaMundi/MappingAPI/refs/heads/master/data/geojson/countries.geojson';
const SNAPSHOT='./data/who-glass.json?v=20260921-compact';
const state={data:null,geo:null,mode:'standard',infection:null,pathogen:null,antibiotic:null,year:'latest',country:'USA',search:''};
const $=id=>document.getElementById(id);
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=v=>Number(v).toLocaleString('ru-RU',{maximumFractionDigits:1});
const int=v=>Number(v).toLocaleString('ru-RU',{maximumFractionDigits:0});
const fmtDate=v=>v?new Date(v).toLocaleString('ru-RU',{dateStyle:'medium',timeStyle:'short'}):'—';
const pretty=s=>String(s||'').replace(/_/g,' ').replace(/\s+/g,' ').trim();
const norm=s=>pretty(s).toUpperCase();

const EXTENDED={
  blood:['Acinetobacter spp.','Enterobacter cloacae complex','Enterococcus faecalis','Enterococcus faecium','Escherichia coli','Haemophilus influenzae','Klebsiella pneumoniae','Neisseria meningitidis','Pseudomonas aeruginosa','Salmonella spp.','Staphylococcus aureus','Stenotrophomonas maltophilia','Streptococcus agalactiae','Streptococcus pneumoniae'],
  urine:['Acinetobacter spp.','Citrobacter freundii complex','Enterobacter cloacae complex','Enterococcus faecalis','Enterococcus faecium','Escherichia coli','Klebsiella pneumoniae','Proteus mirabilis','Pseudomonas aeruginosa','Staphylococcus aureus','Staphylococcus saprophyticus'],
  respiratory:['Acinetobacter spp.','Enterobacter cloacae complex','Escherichia coli','Haemophilus influenzae','Klebsiella pneumoniae','Moraxella catarrhalis','Pseudomonas aeruginosa','Staphylococcus aureus','Stenotrophomonas maltophilia','Streptococcus pneumoniae'],
  csf:['Escherichia coli','Haemophilus influenzae','Klebsiella pneumoniae','Listeria monocytogenes','Neisseria meningitidis','Staphylococcus aureus','Streptococcus agalactiae','Streptococcus pneumoniae'],
  stool:['Campylobacter spp.','Escherichia coli','Salmonella spp.','Shigella spp.','Vibrio cholerae'],
  genital:['Neisseria gonorrhoeae','Streptococcus agalactiae'],
  general:['Acinetobacter spp.','Enterobacter cloacae complex','Enterococcus faecalis','Enterococcus faecium','Escherichia coli','Klebsiella pneumoniae','Pseudomonas aeruginosa','Staphylococcus aureus','Streptococcus pneumoniae']
};
const EXTENDED_DRUGS={
  'Pseudomonas aeruginosa':['Amikacin','Cefepime','Ceftazidime','Ciprofloxacin','Imipenem','Meropenem','Piperacillin-tazobactam'],
  'Enterococcus faecalis':['Ampicillin','Linezolid','Vancomycin'],
  'Enterococcus faecium':['Ampicillin','Linezolid','Vancomycin'],
  'Enterobacter cloacae complex':['Amikacin','Cefepime','Ciprofloxacin','Ertapenem','Meropenem'],
  'Proteus mirabilis':['Amikacin','Cefotaxime','Ceftriaxone','Ciprofloxacin','Meropenem'],
  'Haemophilus influenzae':['Ampicillin','Amoxicillin-clavulanate','Ceftriaxone'],
  'Neisseria meningitidis':['Ceftriaxone','Penicillin'],
  'Stenotrophomonas maltophilia':['Levofloxacin','Trimethoprim-sulfamethoxazole'],
  'Streptococcus agalactiae':['Penicillin','Vancomycin'],
  'Staphylococcus saprophyticus':['Cefoxitin','Trimethoprim-sulfamethoxazole'],
  'Citrobacter freundii complex':['Amikacin','Cefepime','Ciprofloxacin','Meropenem'],
  'Moraxella catarrhalis':['Amoxicillin-clavulanate','Ceftriaxone'],
  'Listeria monocytogenes':['Ampicillin','Penicillin'],
  'Campylobacter spp.':['Azithromycin','Ciprofloxacin','Erythromycin'],
  'Shigella spp.':['Azithromycin','Ceftriaxone','Ciprofloxacin'],
  'Vibrio cholerae':['Azithromycin','Ciprofloxacin','Doxycycline'],
  'Neisseria gonorrhoeae':['Azithromycin','Cefixime','Ceftriaxone','Ciprofloxacin']
};

async function json(url,force=false){const r=await fetch(url,{cache:force?'no-store':'force-cache'});if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json();}
function normalizeDataset(d){
  if(d?.meta?.schemaVersion!=='2.1'||!Array.isArray(d.records)||!Array.isArray(d.records[0]))return d;
  const dimensions=d.dimensions||{}, infections=dimensions.infections||[], pathogens=dimensions.pathogens||[], antibiotics=dimensions.antibiotics||[];
  return {...d,records:d.records.map(r=>({countryCode:r[0],year:r[1],infection:infections[r[2]],pathogen:pathogens[r[3]],antibiotic:antibiotics[r[4]],percentResistant:r[5],resistant:r[6],interpretableAST:r[7],totalSpecimenIsolates:r[8]}))};
}
function validDataset(d){return ['2.0','2.1'].includes(d?.meta?.schemaVersion)&&Array.isArray(d.records)&&d.records.length>0;}
function geoCode(f){const p=f.properties||{};return f.id||p['ISO3166-1-Alpha-3']||p.ISO_A3||p.iso_a3||p.ADM0_A3||p.ISO3||'';}
function geoName(f){const p=f.properties||{};return p.name||p.ADMIN||p.NAME||geoCode(f);}
function countryName(code){const f=state.geo?.features?.find(x=>geoCode(x)===code);return f?geoName(f):code;}
function project(pt){return[(Number(pt[0])+180)/360*1000,(90-Number(pt[1]))/180*500];}
function ringPath(ring){let d='',prev=null;for(const pt of ring){const [x,y]=project(pt);const lon=Number(pt[0]);if(prev!==null&&Math.abs(lon-prev)>180)d+=` M${x.toFixed(1)},${y.toFixed(1)}`;else d+=`${d?' L':'M'}${x.toFixed(1)},${y.toFixed(1)}`;prev=lon;}return d+' Z';}
function geometryPath(g){if(!g)return'';if(g.type==='Polygon')return g.coordinates.map(ringPath).join(' ');if(g.type==='MultiPolygon')return g.coordinates.flatMap(p=>p.map(ringPath)).join(' ');return'';}
function color(v){if(v==null)return'#d9e3e8';if(v<10)return'#79d9ba';if(v<25)return'#39b9b0';if(v<50)return'#419bc0';return'#d7a85f';}
function unique(values){return [...new Set(values.filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'ru'));}
function infectionKind(value){const v=norm(value);if(v.includes('BLOOD'))return'blood';if(v.includes('URINE'))return'urine';if(v.includes('RESPIR')||v.includes('SPUTUM'))return'respiratory';if(v.includes('CSF')||v.includes('CEREBROSPINAL'))return'csf';if(v.includes('STOOL')||v.includes('FAEC')||v.includes('FEC'))return'stool';if(v.includes('GENITAL')||v.includes('GONOR'))return'genital';return'general';}
function whoRowsForInfection(){return state.data.records.filter(r=>r.infection===state.infection);}
function whoPathogens(){return unique(whoRowsForInfection().map(r=>r.pathogen));}
function extendedPathogens(){return unique([...whoPathogens(),...(EXTENDED[infectionKind(state.infection)]||EXTENDED.general)]);}
function pathogenHasWhoData(pathogen=state.pathogen){return whoRowsForInfection().some(r=>r.pathogen===pathogen);}
function baseRecords(){return state.data.records.filter(r=>r.infection===state.infection&&r.pathogen===state.pathogen&&r.antibiotic===state.antibiotic);}
function recordsForMap(){const rows=baseRecords();if(state.year!=='latest')return rows.filter(r=>r.year===Number(state.year));const byCountry=new Map();for(const r of rows){const prev=byCountry.get(r.countryCode);if(!prev||r.year>prev.year)byCountry.set(r.countryCode,r);}return [...byCountry.values()];}
function currentRecord(code){return recordsForMap().find(r=>r.countryCode===code)||null;}
function trend(code){return baseRecords().filter(r=>r.countryCode===code).sort((a,b)=>a.year-b.year);}
function chooseBestDefaults(){const counts=new Map();for(const r of state.data.records){const key=[r.infection,r.pathogen,r.antibiotic].join('\u0001');if(!counts.has(key))counts.set(key,new Set());counts.get(key).add(r.countryCode);}const entries=[...counts.entries()],withUsa=entries.filter(([,countries])=>countries.has('USA')),pool=withUsa.length?withUsa:entries,best=pool.sort((a,b)=>b[1].size-a[1].size)[0]?.[0]?.split('\u0001');if(best){[state.infection,state.pathogen,state.antibiotic]=best;}}
function option(v,label,current){return`<option value="${safe(v)}" ${v===current?'selected':''}>${safe(label)}</option>`;}
function antibioticOptions(){const rows=whoRowsForInfection().filter(r=>r.pathogen===state.pathogen),who=unique(rows.map(r=>r.antibiotic));if(who.length)return who;return state.mode==='expanded'?(EXTENDED_DRUGS[state.pathogen]||['AST по данным национального/WHONET набора']):[];}
function renderMode(){document.querySelectorAll('[data-amr-mode]').forEach(b=>{const active=b.dataset.amrMode===state.mode;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});const note=$('mode-note');if(!note)return;const standard=whoPathogens(),expanded=extendedPathogens();if(state.mode==='standard')note.innerHTML=`<strong>WHO GLASS standard.</strong> Для материала <b>${safe(pretty(state.infection))}</b> показаны только ${standard.length} микроорганизмов, для которых текущий глобальный GLASS snapshot содержит сопоставимые данные.`;else note.innerHTML=`<strong>Расширенный AMR.</strong> ${expanded.length} микроорганизмов: WHO-позиции показаны обычным названием, дополнительные — с меткой <b>national/WHONET</b>. Для дополнительных позиций глобальный процент не рассчитывается без реальных национальных данных.`;}
function renderControls(){
  const infections=unique(state.data.records.map(r=>r.infection));if(!infections.includes(state.infection))state.infection=infections[0];
  const standard=whoPathogens(),pathogens=state.mode==='expanded'?extendedPathogens():standard;if(!pathogens.includes(state.pathogen))state.pathogen=pathogens[0];
  const whoSet=new Set(standard);$('infection').innerHTML=infections.map(v=>option(v,pretty(v),state.infection)).join('');
  $('pathogen').innerHTML=pathogens.map(v=>option(v,`${pretty(v)}${state.mode==='expanded'&&!whoSet.has(v)?' · national/WHONET':''}`,state.pathogen)).join('');
  const antibiotics=antibioticOptions();if(!antibiotics.includes(state.antibiotic))state.antibiotic=antibiotics[0]||null;$('antibiotic').innerHTML=antibiotics.map(v=>option(v,pretty(v),state.antibiotic)).join('');
  const years=unique(baseRecords().map(r=>r.year)).sort((a,b)=>b-a);if(state.year!=='latest'&&!years.includes(Number(state.year)))state.year='latest';
  $('year').innerHTML=option('latest','Последние доступные по каждой стране',state.year)+years.map(y=>option(String(y),String(y),String(state.year))).join('');
  $('year').disabled=!years.length;$('antibiotic').disabled=!antibiotics.length;renderMode();
}
function renderMeta(){const m=state.data.meta,shown=recordsForMap(),years=shown.map(r=>r.year),coverage=new Set(shown.map(r=>r.countryCode)),source=pathogenHasWhoData()?'WHO GLASS Dashboard / XMART':'Расширенный каталог · ожидает national/WHONET';$('dataset-meta').innerHTML=`<div class="meta-row"><span>Режим</span><b>${state.mode==='standard'?'WHO GLASS standard':'Расширенный AMR'}</b></div><div class="meta-row"><span>Источник текущей комбинации</span><b>${safe(source)}</b></div><div class="meta-row"><span>Версия WHO snapshot</span><b>${safe(m.version)}</b></div><div class="meta-row"><span>Период WHO GLASS</span><b>${safe(m.period?.from)}–${safe(m.period?.to)}</b></div><div class="meta-row"><span>Последняя синхронизация</span><b>${safe(fmtDate(m.checkedAt))}</b></div><div class="meta-row"><span>На текущей карте</span><b>${coverage.size} стран${years.length?` · данные ${Math.min(...years)}–${Math.max(...years)}`:''}</b></div>${!pathogenHasWhoData()?'<div class="callout warning"><strong>Глобального WHO-агрегата для этой позиции нет.</strong> Микроорганизм оставлен в расширенном каталоге для подключения национальных и WHONET-наборов. Проценты не моделируются.</div>':''}`;}
function renderMap(){const box=$('world-map');if(!state.geo){box.innerHTML='<div class="map-empty">Загрузка геометрии карты мира…</div>';return;}const lookup=new Map(recordsForMap().map(r=>[r.countryCode,r]));const paths=state.geo.features.map(f=>{const code=geoCode(f);if(!code)return'';const r=lookup.get(code);const selected=code===state.country;return`<path tabindex="0" role="button" class="world-country${selected?' selected':''}${code==='KAZ'?' kazakhstan':''}" data-country="${safe(code)}" d="${geometryPath(f.geometry)}" fill="${color(r?.percentResistant)}"><title>${safe(geoName(f))} · ${r?`${fmt(r.percentResistant)}% R · ${r.year}`:'нет опубликованного значения для выбранной комбинации'}</title></path>`;}).join('');box.innerHTML=`<svg viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet" aria-label="Мировая карта AMR"><rect width="1000" height="500" fill="#f4f8fa"/>${paths}</svg>`;box.querySelectorAll('[data-country]').forEach(el=>{const pick=()=>{state.country=el.dataset.country;renderMap();renderCountry();renderList();};el.addEventListener('click',pick);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick();}});});}
function renderCountry(){const panel=$('country-panel'),current=currentRecord(state.country),rows=trend(state.country),name=countryName(state.country),whoAvailable=pathogenHasWhoData();if(!current){const explanation=whoAvailable?`Для выбранной комбинации <b>${safe(pretty(state.pathogen))}</b> × <b>${safe(pretty(state.antibiotic))}</b> WHO GLASS не публикует значение для этой страны${state.year==='latest'?'':` за ${safe(state.year)} год`}.`:`<b>${safe(pretty(state.pathogen))}</b> входит в расширенный клинический каталог, но для выбранного материала текущий глобальный WHO GLASS snapshot не содержит сопоставимого агрегата.`;panel.innerHTML=`<div class="eyebrow">${safe(name)}</div><h2>${whoAvailable?'Нет опубликованного значения':'Расширенный AMR · national/WHONET'}</h2><p class="muted">${explanation}</p><div class="callout ${whoAvailable?'':'warning'}">${whoAvailable?'Это не означает отсутствие AMR. Попробуйте другую комбинацию или режим «последние доступные».':'Значение появится после подключения валидированного национального или WHONET-набора. AMR Atlas намеренно не подставляет демо-данные в мировую карту.'}</div>${state.country==='KAZ'?'<a class="button" href="./index.html">Открыть национальный ATLAS Казахстана</a>':''}<h3>Страны с данными WHO</h3><div class="country-list" id="country-list"></div>`;renderList();return;}const max=Math.max(1,...rows.map(r=>r.percentResistant));const bars=rows.map(r=>`<div class="trend-column"><div class="trend-bar" style="height:${Math.max(4,r.percentResistant/max*100)}%" title="${r.year}: ${fmt(r.percentResistant)}%"></div><span>${r.year}</span></div>`).join('');const count=current.interpretableAST!=null?`${int(current.resistant??0)} R / ${int(current.interpretableAST)} AST`:current.resistant!=null?`${int(current.resistant)} устойчивых`:'число AST не опубликовано';panel.innerHTML=`<div class="eyebrow">${safe(name)} · ${safe(current.year)} · WHO GLASS</div><h2>${safe(pretty(current.pathogen))}</h2><div class="country-value">${fmt(current.percentResistant)}<small>% R</small></div><p class="muted">${safe(pretty(current.antibiotic))}<br>${safe(pretty(current.infection))}</p><div class="callout"><strong>${safe(count)}</strong>${current.totalSpecimenIsolates!=null?`<br>Всего изолятов материала: ${int(current.totalSpecimenIsolates)}`:''}</div><h3>Динамика доступных лет</h3><div class="trend">${bars||'<span class="muted">Нет ряда</span>'}</div>${state.country==='KAZ'?'<a class="ghost-button" href="./index.html">Карта областей Казахстана</a>':''}<h3>Страны с данными</h3><div class="country-list" id="country-list"></div>`;renderList();}
function renderList(){const list=$('country-list');if(!list)return;const q=state.search.trim().toLowerCase();const rows=recordsForMap().map(r=>({...r,name:countryName(r.countryCode)})).filter(r=>!q||r.name.toLowerCase().includes(q)||r.countryCode.toLowerCase().includes(q)).sort((a,b)=>a.name.localeCompare(b.name,'ru'));list.innerHTML=rows.map(r=>`<button type="button" data-pick="${safe(r.countryCode)}" class="${r.countryCode===state.country?'active':''}"><span>${safe(r.name)}<small>${safe(r.year)}</small></span><b>${fmt(r.percentResistant)}%</b></button>`).join('')||'<div class="empty-state">Нет глобальных WHO-данных по выбранной комбинации.</div>';list.querySelectorAll('[data-pick]').forEach(b=>b.addEventListener('click',()=>{state.country=b.dataset.pick;renderMap();renderCountry();}));}
function ensureSelectedCountry(){const codes=new Set(recordsForMap().map(r=>r.countryCode));if(!codes.size)return;if(codes.has(state.country))return;if(codes.has('USA'))state.country='USA';else if(codes.has('KAZ'))state.country='KAZ';else state.country=[...codes][0];}
function renderAll(){renderControls();ensureSelectedCountry();renderMeta();renderMap();renderCountry();renderList();}
async function loadGeo(){try{state.geo=await json(GEO);}catch(e){console.error(e);state.geo={features:[]};}if(state.data)renderAll();}
async function loadSnapshot(force=false){const btn=$('refresh-who');if(btn){btn.disabled=true;btn.textContent='Обновление…';}try{const raw=await json(`${SNAPSHOT}${force?`&t=${Date.now()}`:''}`,force);const d=normalizeDataset(raw);if(!validDataset(d))throw new Error('snapshot schema mismatch');state.data=d;chooseBestDefaults();renderAll();}catch(e){console.error(e);$('dataset-meta').innerHTML=`<div class="callout warning"><strong>Не удалось загрузить WHO GLASS snapshot.</strong> ${safe(e.message)}</div>`;}finally{if(btn){btn.disabled=false;btn.textContent='Перезагрузить данные';}}}
document.querySelectorAll('[data-amr-mode]').forEach(b=>b.addEventListener('click',()=>{state.mode=b.dataset.amrMode;state.year='latest';renderAll();}));
$('infection').addEventListener('change',e=>{state.infection=e.target.value;state.pathogen=null;state.antibiotic=null;state.year='latest';renderAll();});
$('pathogen').addEventListener('change',e=>{state.pathogen=e.target.value;state.antibiotic=null;state.year='latest';renderAll();});
$('antibiotic').addEventListener('change',e=>{state.antibiotic=e.target.value;state.year='latest';renderAll();});
$('year').addEventListener('change',e=>{state.year=e.target.value;renderAll();});
$('country-search').addEventListener('input',e=>{state.search=e.target.value;renderList();});
$('refresh-who').addEventListener('click',()=>loadSnapshot(true));
loadSnapshot(false);loadGeo();
})();
