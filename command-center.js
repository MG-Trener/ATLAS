(() => {
  'use strict';
  const map=document.getElementById('command-kz-map'); if(!map)return;
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
  let regions=[]; let layer='esbl'; let selected=null;
  const names={KZ10:'ABAY',KZ11:'AKMOLA',KZ15:'AKTOBE',KZ19:'ALMATY REGION',KZ23:'ATYRAU',KZ27:'WEST KZ',KZ31:'ZHAMBYL',KZ33:'ZHETYSU',KZ35:'KARAGANDA',KZ39:'KOSTANAY',KZ43:'KYZYLORDA',KZ47:'MANGYSTAU',KZ55:'PAVLODAR',KZ59:'NORTH KZ',KZ61:'TURKISTAN',KZ62:'ULYTAU',KZ63:'EAST KZ',KZ71:'ASTANA',KZ75:'ALMATY',KZ79:'SHYMKENT'};
  const hash=s=>{let h=0;for(const ch of String(s))h=((h<<5)-h)+ch.charCodeAt(0);return Math.abs(h)};
  const base=r=>11+(hash(r.pcode)%300)/10;
  function value(r){const b=base(r);return {esbl:b*.72+4,cre:b*.24, mrsa:b*.42+2, vre:b*.18+1.4, ndm:b*.12, oxa48:b*.15}[layer]||b}
  function color(v){if(v>=28)return'#8f3140';if(v>=20)return'#9b5b2d';if(v>=12)return'#17607a';return'#17485c'}
  function pct(v){return `${v.toFixed(1)}%`}
  function render(){map.innerHTML='';regions.forEach(r=>{const v=value(r);const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',r.path);p.setAttribute('fill',color(v));p.dataset.pcode=r.pcode;p.classList.add('command-region');if(selected?.pcode===r.pcode)p.classList.add('selected');p.addEventListener('pointerenter',e=>{tooltip.innerHTML=`<strong>${names[r.pcode]||r.pcode}</strong>${layer.toUpperCase()} ${pct(v)}<br>DEMO SURVEILLANCE LAYER`;tooltip.classList.add('show');move(e)});p.addEventListener('pointermove',move);p.addEventListener('pointerleave',()=>tooltip.classList.remove('show'));p.addEventListener('click',()=>select(r));map.appendChild(p);if(r.cx&&r.cy){const t=document.createElementNS('http://www.w3.org/2000/svg','text');t.setAttribute('x',r.cx);t.setAttribute('y',r.cy);t.setAttribute('text-anchor','middle');t.classList.add('command-label');t.textContent=Math.round(v);map.appendChild(t)}});layerTitle.textContent=`${layer.toUpperCase()} · NATIONAL SURVEILLANCE LAYER`;updateNational()}
  function move(e){const b=document.querySelector('.command-map-stage').getBoundingClientRect();tooltip.style.left=`${Math.min(b.width-185,Math.max(8,e.clientX-b.left+12))}px`;tooltip.style.top=`${Math.min(b.height-70,Math.max(8,e.clientY-b.top+12))}px`}
  function select(r){selected=r;render();const b=base(r),v=value(r);const n=1800+b*145;regionTitle.textContent=names[r.pcode]||r.pcode;selectedName.textContent=regionTitle.textContent;layerValueEl.textContent=pct(v);isolatesEl.textContent=Math.round(n).toLocaleString('en-US');labsEl.textContent=String(Math.max(2,Math.round(b/3.3)));noteEl.textContent=`${layer.toUpperCase()} INDICATIVE PROFILE · DEMO DATA · ${r.pcode}`;rEl.textContent=pct(Math.min(49,b*.9));mdrEl.textContent=pct(Math.min(28,b*.38))}
  function updateNational(){if(selected)return;layerValueEl.textContent={esbl:'18.4%',cre:'6.7%',mrsa:'14.2%',vre:'4.8%',ndm:'3.1%',oxa48:'3.8%'}[layer]||'—';selectedName.textContent='KAZAKHSTAN';regionTitle.textContent='Kazakhstan'}
  buttons.forEach(btn=>btn.addEventListener('click',()=>{buttons.forEach(b=>b.classList.toggle('active',b===btn));layer=btn.dataset.layer;render();if(selected)select(selected)}));
  setInterval(()=>{const d=new Date();document.getElementById('command-clock').textContent=d.toLocaleTimeString('en-GB',{hour12:false})},1000);
  fetch('./regions.json').then(r=>r.json()).then(data=>{regions=data;render()}).catch(()=>{map.outerHTML='<div style="padding:80px;text-align:center;color:#496b7e">MAP OFFLINE</div>'});
})();