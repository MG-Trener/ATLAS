(() => {
  'use strict';
  const map=document.getElementById('command-kz-map'); if(!map)return;
  const extraStyle=document.createElement('link');extraStyle.rel='stylesheet';extraStyle.href='./command-center-enhancements.css?v=20260916-1';document.head.appendChild(extraStyle);

  const tooltip=document.getElementById('command-map-tooltip');
  const buttons=[...document.querySelectorAll('.command-layer-switch button')];
  const layerTitle=document.getElementById('cc-layer-title');
  const selectedName=document.getElementById('cc-selected-name');
  const regionTitle=document.getElementById('cc-region');
  const layerValueEl=document.getElementById('cc-layer-value');
  const isolatesEl=document.getElementById('cc-isolates');
  const labsEl=document.getElementById('cc-labs');
  const noteEl=document.getElementById('cc-region-note');
  const rEl=document.getElementById('cc-r'); const mdrEl=document.getElementById('cc-mdr');
  let regions=[]; let layer='esbl'; let selected=null; let streamPaused=false; let streamIndex=0;
  const names={KZ10:'ABAY',KZ11:'AKMOLA',KZ15:'AKTOBE',KZ19:'ALMATY REGION',KZ23:'ATYRAU',KZ27:'WEST KZ',KZ31:'ZHAMBYL',KZ33:'ZHETYSU',KZ35:'KARAGANDA',KZ39:'KOSTANAY',KZ43:'KYZYLORDA',KZ47:'MANGYSTAU',KZ55:'PAVLODAR',KZ59:'NORTH KZ',KZ61:'TURKISTAN',KZ62:'ULYTAU',KZ63:'EAST KZ',KZ71:'ASTANA',KZ75:'ALMATY',KZ79:'SHYMKENT'};
  const hash=s=>{let h=0;for(const ch of String(s))h=((h<<5)-h)+ch.charCodeAt(0);return Math.abs(h)};
  const base=r=>11+(hash(r.pcode)%300)/10;
  function value(r){const b=base(r);return {esbl:b*.72+4,cre:b*.24,mrsa:b*.42+2,vre:b*.18+1.4,ndm:b*.12,oxa48:b*.15}[layer]||b}
  function color(v){if(v>=28)return'#8f3140';if(v>=20)return'#9b5b2d';if(v>=12)return'#17607a';return'#17485c'}
  function pct(v){return `${v.toFixed(1)}%`}

  const incidents=[
    {severity:'CRITICAL',title:'Carbapenem resistance',organism:'K. pneumoniae',region:'East Kazakhstan',delta:'+5.4 pp',current:'16.8%',baseline:'11.4%',n:'184',summary:'Rapid increase in the demo carbapenem-resistance signal. Requires validation by laboratory, specimen and period before escalation.',mechanism:'NDM'},
    {severity:'HIGH',title:'ESBL cluster',organism:'Enterobacterales',region:'Abay',delta:'34.8%',current:'34.8%',baseline:'27.1%',n:'392',summary:'Indicative ESBL concentration above the national demo baseline. Review E. coli and K. pneumoniae contributions separately.',mechanism:'ESBL'},
    {severity:'WATCH',title:'MRSA trend',organism:'S. aureus',region:'Almaty',delta:'+2.8 pp',current:'14.2%',baseline:'11.4%',n:'216',summary:'Moderate upward MRSA trend in the demo layer. Sample size is sufficient for continued surveillance, not a clinical recommendation.',mechanism:'MRSA'},
    {severity:'WATCH',title:'NDM signal',organism:'K. pneumoniae',region:'Astana',delta:'↑',current:'7.4%',baseline:'4.9%',n:'126',summary:'Possible NDM-related increase in the demo surveillance layer. Molecular confirmation is not implied by this prototype.',mechanism:'NDM'}
  ];
  const streamEvents=[
    ['10:04:12','AST FEED','KARAGANDA','312 new records staged'],
    ['10:03:41','AMR RADAR','EAST KZ','CRE signal score increased'],
    ['10:02:18','QUALITY','ABAY','completeness recovered to 94%'],
    ['10:00:55','WATCHLIST','ASTANA','NDM layer entered watch threshold'],
    ['09:58:27','REFERENCE','WHONET','catalog snapshot active']
  ];

  function setupOperationsUi(){
    const main=document.querySelector('.command-main');const grid=document.querySelector('.command-grid');
    if(main&&grid&&!document.querySelector('.command-event-strip')){
      const strip=document.createElement('section');strip.className='command-event-strip';strip.innerHTML=`<span class="command-event-live"><i></i> LIVE EVENT STREAM</span><div class="command-event-window"><div class="command-event-track" id="cc-event-track"></div></div><button class="command-event-toggle" id="cc-event-toggle" type="button">PAUSE</button>`;grid.insertAdjacentElement('beforebegin',strip);strip.querySelector('#cc-event-toggle').addEventListener('click',e=>{streamPaused=!streamPaused;e.currentTarget.textContent=streamPaused?'RESUME':'PAUSE'});updateEventStream();
    }
    const alerts=document.querySelector('.command-alerts');
    if(alerts&&!alerts.querySelector('.command-threat-summary')){const summary=document.createElement('div');summary.className='command-threat-summary';summary.innerHTML=`<div class="critical"><strong>01</strong><span>CRITICAL</span></div><div class="high"><strong>02</strong><span>HIGH</span></div><div class="watch"><strong>04</strong><span>WATCH</span></div>`;alerts.querySelector('.section-label')?.insertAdjacentElement('afterend',summary)}
    document.querySelectorAll('.command-alerts article').forEach((article,i)=>{article.tabIndex=0;article.dataset.incident=String(i);article.addEventListener('click',()=>openIncident(i));article.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openIncident(i)}})});
    buttons.forEach((btn,i)=>btn.dataset.key=String(i+1));
    buildIncidentDrawer();
  }

  function updateEventStream(){const track=document.getElementById('cc-event-track');if(!track)return;const e=streamEvents[streamIndex%streamEvents.length];track.innerHTML=`<span><b>${e[0]}</b><em>${e[1]}</em><b>${e[2]}</b>${e[3]}</span>`}
  setInterval(()=>{if(streamPaused)return;streamIndex=(streamIndex+1)%streamEvents.length;updateEventStream()},3600);

  function buildIncidentDrawer(){
    if(document.querySelector('.command-incident-drawer'))return;
    const backdrop=document.createElement('div');backdrop.className='command-incident-backdrop';backdrop.addEventListener('click',closeIncident);document.body.appendChild(backdrop);
    const drawer=document.createElement('aside');drawer.className='command-incident-drawer';drawer.innerHTML=`<div class="incident-head"><div><small>AMR SIGNAL INVESTIGATION</small><h2 id="incident-title">Signal</h2></div><button class="incident-close" type="button">×</button></div><span class="incident-severity" id="incident-severity">HIGH</span><div class="incident-summary" id="incident-summary"></div><div class="incident-metrics"><div><span>CURRENT</span><strong id="incident-current">—</strong></div><div><span>BASELINE</span><strong id="incident-baseline">—</strong></div><div><span>N</span><strong id="incident-n">—</strong></div></div><div class="incident-section"><span>CONTEXT</span><div class="incident-timeline"><div><b id="incident-org">—</b> · organism / phenotype context</div><div><b id="incident-region">—</b> · selected territory</div><div><b id="incident-delta">—</b> · change versus demo baseline</div><div>Validation path: laboratory → material → period → AST interpretation.</div></div></div><div class="incident-actions"><a id="incident-mechanism" class="primary" href="./mechanisms.html">OPEN MECHANISM</a><button id="incident-close-bottom" type="button">CLOSE</button></div>`;document.body.appendChild(drawer);drawer.querySelector('.incident-close').addEventListener('click',closeIncident);drawer.querySelector('#incident-close-bottom').addEventListener('click',closeIncident);
  }
  function openIncident(index){const d=incidents[index]||incidents[0];document.getElementById('incident-title').textContent=d.title;document.getElementById('incident-severity').textContent=d.severity;document.getElementById('incident-summary').textContent=d.summary;document.getElementById('incident-current').textContent=d.current;document.getElementById('incident-baseline').textContent=d.baseline;document.getElementById('incident-n').textContent=d.n;document.getElementById('incident-org').textContent=d.organism;document.getElementById('incident-region').textContent=d.region;document.getElementById('incident-delta').textContent=d.delta;document.getElementById('incident-mechanism').href=`./mechanisms.html?mechanism=${encodeURIComponent(d.mechanism)}`;document.querySelector('.command-incident-backdrop').classList.add('show');document.querySelector('.command-incident-drawer').classList.add('show')}
  function closeIncident(){document.querySelector('.command-incident-backdrop')?.classList.remove('show');document.querySelector('.command-incident-drawer')?.classList.remove('show')}

  function render(){map.innerHTML='';regions.forEach(r=>{const v=value(r);const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',r.path);p.setAttribute('fill',color(v));p.dataset.pcode=r.pcode;p.classList.add('command-region');p.setAttribute('tabindex','0');if(selected?.pcode===r.pcode)p.classList.add('selected');p.addEventListener('pointerenter',e=>{tooltip.innerHTML=`<strong>${names[r.pcode]||r.pcode}</strong>${layer.toUpperCase()} ${pct(v)}<br>DEMO SURVEILLANCE LAYER`;tooltip.classList.add('show');move(e)});p.addEventListener('pointermove',move);p.addEventListener('pointerleave',()=>tooltip.classList.remove('show'));p.addEventListener('click',()=>select(r));p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(r)}});map.appendChild(p);if(r.cx&&r.cy){const t=document.createElementNS('http://www.w3.org/2000/svg','text');t.setAttribute('x',r.cx);t.setAttribute('y',r.cy);t.setAttribute('text-anchor','middle');t.classList.add('command-label');t.textContent=Math.round(v);map.appendChild(t)}});layerTitle.textContent=`${layer.toUpperCase()} · NATIONAL SURVEILLANCE LAYER`;updateNational()}
  function move(e){const b=document.querySelector('.command-map-stage').getBoundingClientRect();tooltip.style.left=`${Math.min(b.width-185,Math.max(8,e.clientX-b.left+12))}px`;tooltip.style.top=`${Math.min(b.height-70,Math.max(8,e.clientY-b.top+12))}px`}
  function select(r){selected=r;render();const b=base(r),v=value(r);const n=1800+b*145;regionTitle.textContent=names[r.pcode]||r.pcode;selectedName.textContent=regionTitle.textContent;layerValueEl.textContent=pct(v);isolatesEl.textContent=Math.round(n).toLocaleString('en-US');labsEl.textContent=String(Math.max(2,Math.round(b/3.3)));noteEl.textContent=`${layer.toUpperCase()} INDICATIVE PROFILE · DEMO DATA · ${r.pcode}`;rEl.textContent=pct(Math.min(49,b*.9));mdrEl.textContent=pct(Math.min(28,b*.38))}
  function updateNational(){if(selected)return;layerValueEl.textContent={esbl:'18.4%',cre:'6.7%',mrsa:'14.2%',vre:'4.8%',ndm:'3.1%',oxa48:'3.8%'}[layer]||'—';selectedName.textContent='KAZAKHSTAN';regionTitle.textContent='Kazakhstan'}
  buttons.forEach(btn=>btn.addEventListener('click',()=>{buttons.forEach(b=>b.classList.toggle('active',b===btn));layer=btn.dataset.layer;render();if(selected)select(selected)}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeIncident();if(/^[1-6]$/.test(e.key)&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){const btn=buttons[Number(e.key)-1];if(btn)btn.click()}});
  setInterval(()=>{const d=new Date();document.getElementById('command-clock').textContent=d.toLocaleTimeString('en-GB',{hour12:false})},1000);
  setupOperationsUi();
  fetch('./regions.json').then(r=>r.json()).then(data=>{regions=data;render()}).catch(()=>{map.outerHTML='<div style="padding:80px;text-align:center;color:#496b7e">MAP OFFLINE</div>'});
})();