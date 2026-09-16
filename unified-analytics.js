(() => {
  'use strict';
  if (window.__atlasUnifiedAnalytics) return;
  window.__atlasUnifiedAnalytics = true;

  const data = window.AtlasDemoData;
  if (!data) {
    console.warn('AMR Atlas: unified analytics requires AtlasDemoData');
    return;
  }

  const root = document.documentElement;
  const body = document.body;
  const concept = () => root.dataset.atlasConcept || (body.classList.contains('national-atlas-page') ? 'atlas' : body.classList.contains('command-page') ? 'command' : 'clinical');
  const lang = () => { const v = localStorage.getItem('atlas-preview-language'); return v === 'kk' || v === 'en' ? v : 'ru'; };
  const locale = () => lang() === 'kk' ? 'kk-KZ' : lang() === 'en' ? 'en-US' : 'ru-RU';
  const pct = v => `${Number(v).toLocaleString(locale(), { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
  const num = v => Math.round(Number(v) || 0).toLocaleString(locale());
  const pp = () => lang() === 'en' ? 'pp' : lang() === 'kk' ? 'т.п.' : 'п.п.';
  const text = (ru, kk, en) => lang() === 'kk' ? kk : lang() === 'en' ? en : ru;
  const readContext = () => { try { return window.AtlasAnalysisContext?.get?.() || JSON.parse(localStorage.getItem('atlas-analysis-context-v1') || '{}') || {}; } catch (_) { return {}; } };
  const writeContext = patch => window.AtlasAnalysisContext?.set?.(patch);
  const color = v => v >= 40 ? '#d95f67' : v >= 30 ? '#e6a94e' : v >= 20 ? '#58afd1' : '#76c8b2';
  const commandColor = v => v >= 28 ? '#8f3140' : v >= 20 ? '#9b5b2d' : v >= 12 ? '#17607a' : '#17485c';

  const organismByName = {
    'Escherichia coli': 'eco', 'E. coli': 'eco',
    'Klebsiella pneumoniae': 'kpn', 'K. pneumoniae': 'kpn',
    'Staphylococcus aureus': 'sau', 'S. aureus': 'sau',
    'Pseudomonas aeruginosa': 'pae', 'P. aeruginosa': 'pae',
    'Acinetobacter baumannii': 'aba', 'A. baumannii': 'aba'
  };
  const drugByLabel = Object.fromEntries(Object.entries(data.drugs).flatMap(([code, names]) => names.map(name => [String(name).toLowerCase(), code])));
  const materialByLabel = Object.fromEntries(Object.entries(data.materials).flatMap(([code, names]) => names.map(name => [String(name).toLowerCase(), code])));
  const layerSpecs = {
    resistance: ['eco', 'CRO', 'all'], esbl: ['eco', 'CRO', 'all'], cre: ['kpn', 'MEM', 'all'], mrsa: ['sau', 'FOX', 'all'],
    vre: ['sau', 'VAN', 'blood'], ndm: ['kpn', 'MEM', 'blood'], oxa48: ['kpn', 'MEM', 'all']
  };
  const phenotypeLayer = { ESBL: 'esbl', CRE: 'cre', MRSA: 'mrsa', VRE: 'vre', NDM: 'ndm', 'OXA-48': 'oxa48' };

  function profileForLayer(pcode, layer) {
    const spec = layerSpecs[layer] || layerSpecs.resistance;
    return data.profile({ pcode: pcode || 'KZ', organism: spec[0], drug: spec[1], material: spec[2], period: '2026' });
  }

  function currentNationalLayer() { return document.querySelector('.atlas-mode-switch [data-layer].active')?.dataset.layer || 'resistance'; }
  function currentCommandLayer() { return document.querySelector('.command-layer-switch [data-layer].active')?.dataset.layer || 'esbl'; }
  function selectedPcode(selector) { return document.querySelector(`${selector}.selected`)?.dataset.pcode || readContext().pcode || 'KZ'; }
  function regionName(pcode) { return data.regionName(pcode || 'KZ', lang()); }

  function setSvgTrend(svg, trend, width, height, xPad = 0, yPad = 10) {
    if (!svg || !trend?.length) return;
    const line = svg.querySelector('polyline:not(.world):not(.city)') || svg.querySelector('polyline');
    if (!line) return;
    const vals = trend.map(x => x.value);
    const min = Math.max(0, Math.min(...vals) - 4);
    const max = Math.max(min + 8, Math.max(...vals) + 3);
    const span = max - min;
    const usableW = width - xPad * 2;
    const usableH = height - yPad * 2;
    const points = trend.map((x, i) => {
      const px = xPad + i * (usableW / Math.max(1, trend.length - 1));
      const py = height - yPad - ((x.value - min) / span) * usableH;
      return `${px.toFixed(1)},${py.toFixed(1)}`;
    }).join(' ');
    line.setAttribute('points', points);
  }

  function syncNationalMap() {
    if (concept() !== 'atlas') return;
    const layer = currentNationalLayer();
    const paths = [...document.querySelectorAll('.atlas-region[data-pcode]')];
    const labels = [...document.querySelectorAll('.atlas-region-label')];
    paths.forEach((path, index) => {
      const v = data.layerValue(path.dataset.pcode, layer);
      path.setAttribute('fill', color(v));
      path.setAttribute('aria-label', `${regionName(path.dataset.pcode)} ${pct(v)}`);
      if (labels[index]) labels[index].textContent = `${Math.round(v)}%`;
    });

    const pcode = selectedPcode('.atlas-region');
    const profile = profileForLayer(pcode, layer);
    const layerValue = data.layerValue(pcode, layer);
    const nationalProfile = profileForLayer('KZ', layer);
    const nationalValue = data.layerValue('KZ', layer);

    const stats = document.querySelectorAll('.atlas-national-stats > div');
    if (stats[0]) { stats[0].querySelector('strong').textContent = pct(nationalValue); stats[0].querySelector('span').textContent = layer === 'resistance' ? text('средняя R','орташа R','mean R') : layer.toUpperCase(); }
    if (stats[1]) { stats[1].querySelector('strong').textContent = pct(nationalProfile.mdr); }
    if (stats[2]) { stats[2].querySelector('strong').textContent = '20/20'; }

    const rEl = document.getElementById('atlas-r'); if (rEl) rEl.textContent = pct(layerValue);
    const mdrEl = document.getElementById('atlas-mdr'); if (mdrEl) mdrEl.textContent = pct(profile.mdr);
    const nEl = document.getElementById('atlas-isolates'); if (nEl) nEl.textContent = num(profile.isolates);
    const nameEl = document.getElementById('atlas-region-name'); if (nameEl && pcode !== 'KZ') nameEl.textContent = regionName(pcode);
    const signal = document.getElementById('atlas-signal');
    if (signal) signal.textContent = `${layer.toUpperCase()}: ${pcode === 'KZ' ? text('национальный профиль','ұлттық профиль','national profile') : text('региональный профиль','өңірлік профиль','regional profile')} · ${text('демонстрационные данные','демонстрациялық деректер','demo data')}.`;

    const pcodes = Object.keys(data.regionNames);
    const ranked = pcodes.map(code => ({ pcode: code, value: data.layerValue(code, layer) })).sort((a,b) => b.value - a.value);
    const ranking = document.querySelector('.atlas-ranking-list');
    if (ranking) {
      ranking.innerHTML = ranked.slice(0,5).map((item,i) => `<div class="atlas-rank-row" data-pcode="${item.pcode}"><span>${i+1}</span><strong>${regionName(item.pcode)}</strong><b>${pct(item.value)}</b></div>`).join('');
      ranking.querySelectorAll('[data-pcode]').forEach(row => row.addEventListener('click', () => document.querySelector(`.atlas-region[data-pcode="${row.dataset.pcode}"]`)?.dispatchEvent(new MouseEvent('click', { bubbles:true }))));
    }

    const compare = document.querySelector('.atlas-compare-card');
    if (compare) {
      const vals = ranked.map(x => x.value).sort((a,b) => a-b);
      const median = vals[Math.floor(vals.length/2)] || nationalValue;
      const rank = pcode === 'KZ' ? null : ranked.findIndex(x => x.pcode === pcode) + 1;
      const delta = layerValue - nationalValue;
      const max = Math.max(45, layerValue, nationalValue, median) * 1.08;
      compare.innerHTML = `<div class="atlas-compare-title"><strong>${text('Сравнение с национальным уровнем','Ұлттық деңгеймен салыстыру','Compare with national level')}</strong><span>${layer.toUpperCase()}</span></div><div class="atlas-compare-bars"><div class="atlas-compare-row"><span>${regionName(pcode)}</span><i><b style="width:${Math.min(100,layerValue/max*100)}%"></b></i><strong>${pct(layerValue)}</strong></div><div class="atlas-compare-row"><span>${text('Казахстан','Қазақстан','Kazakhstan')}</span><i><b style="width:${Math.min(100,nationalValue/max*100)}%"></b></i><strong>${pct(nationalValue)}</strong></div><div class="atlas-compare-row"><span>${text('Медиана регионов','Өңірлер медианасы','Regional median')}</span><i><b style="width:${Math.min(100,median/max*100)}%"></b></i><strong>${pct(median)}</strong></div></div><div class="atlas-compare-summary"><div><b>${rank ? `${rank} / 20` : '—'}</b><span>${text('место по слою','қабат бойынша орын','rank for layer')}</span></div><div><b>${pcode === 'KZ' ? '—' : `${delta >= 0 ? '+' : ''}${delta.toFixed(1)} ${pp()}`}</b><span>${text('к уровню страны','ел деңгейіне','vs country')}</span></div><div><b>${profile.sampleQuality === 'good' ? '✓' : profile.sampleQuality === 'moderate' ? '!' : '⚠'}</b><span>${text('оценка выборки','іріктеме бағасы','sample quality')}</span></div></div>`;
    }

    const trendSvg = document.querySelector('.band-trend svg');
    if (trendSvg) {
      const line = trendSvg.querySelector('polyline');
      if (line) {
        const vals = nationalProfile.trend.map(x => x.value); const min = Math.min(...vals)-2, max = Math.max(...vals)+2, span = Math.max(1,max-min);
        line.setAttribute('points', nationalProfile.trend.map((x,i) => `${(i*500/6).toFixed(1)},${(78-((x.value-min)/span)*66).toFixed(1)}`).join(' '));
      }
      document.querySelectorAll('.band-trend > div b').forEach((b,i) => { if (nationalProfile.trend[i]) b.textContent = pct(nationalProfile.trend[i].value); });
    }

    const rail = document.querySelectorAll('.atlas-insight-rail article');
    const focus = [
      ['KZ63','cre','K. pneumoniae'],['KZ10','esbl','ESBL Enterobacterales'],['KZ75','mrsa','S. aureus']
    ];
    rail.forEach((article,i) => { const spec=focus[i]; if(!spec)return; const b=article.querySelector('b'); if(b)b.textContent=pct(data.layerValue(spec[0],spec[1])); const small=article.querySelector('small'); if(small)small.textContent=regionName(spec[0]); });
  }

  function nationalPointer(target) {
    const path = target.closest?.('.atlas-region[data-pcode]');
    if (!path) return;
    const layer = currentNationalLayer(); const v = data.layerValue(path.dataset.pcode, layer);
    const tip = document.getElementById('national-map-tooltip');
    if (tip) tip.innerHTML = `<strong>${regionName(path.dataset.pcode)}</strong>${layer.toUpperCase()} · ${pct(v)}`;
  }

  function syncCommand() {
    if (concept() !== 'command') return;
    const layer = currentCommandLayer();
    const paths = [...document.querySelectorAll('.command-region[data-pcode]')];
    const labels = [...document.querySelectorAll('.command-label')];
    paths.forEach((path,index) => { const v=data.layerValue(path.dataset.pcode,layer); path.setAttribute('fill',commandColor(v)); path.setAttribute('aria-label',`${regionName(path.dataset.pcode)} ${pct(v)}`); if(labels[index])labels[index].textContent=Math.round(v); });
    const pcode = selectedPcode('.command-region');
    const profile = profileForLayer(pcode, layer);
    const layerValue = data.layerValue(pcode, layer);
    const r=document.getElementById('cc-r');if(r)r.textContent=pct(profile.resistance);
    const m=document.getElementById('cc-mdr');if(m)m.textContent=pct(profile.mdr);
    const lv=document.getElementById('cc-layer-value');if(lv)lv.textContent=pct(layerValue);
    const iso=document.getElementById('cc-isolates');if(iso)iso.textContent=num(profile.isolates);
    const labs=document.getElementById('cc-labs');if(labs)labs.textContent=String(Math.max(2,Math.round(profile.isolates/520)));
    const title=document.getElementById('cc-region');if(title)title.textContent=regionName(pcode);
    const selected=document.getElementById('cc-selected-name');if(selected)selected.textContent=regionName(pcode).toUpperCase();
    const kpiIso=document.querySelector('.command-kpis article:nth-child(4) strong');if(kpiIso)kpiIso.textContent=profile.isolates>=1000?`${(profile.isolates/1000).toFixed(1)}K`:String(profile.isolates);

    const pcodes=Object.keys(data.regionNames); const national=data.layerValue('KZ',layer);
    const ranked=pcodes.map(code=>({pcode:code,value:data.layerValue(code,layer)})).sort((a,b)=>b.value-a.value);
    const active=ranked.filter(x=>x.value-national>=3).length;
    const signalKpi=document.querySelector('.command-kpis article:nth-child(3) strong');if(signalKpi)signalKpi.textContent=String(active).padStart(2,'0');

    const trendSvg=document.querySelector('.command-trend-panel svg');if(trendSvg){const line=trendSvg.querySelector('polyline');if(line){const vals=profile.trend.map(x=>x.value);const min=Math.min(...vals)-2,max=Math.max(...vals)+2,span=Math.max(1,max-min);line.setAttribute('points',profile.trend.map((x,i)=>`${(i*700/6).toFixed(1)},${(126-((x.value-min)/span)*102).toFixed(1)}`).join(' '));}}

    const alerts=[...document.querySelectorAll('.command-alerts article')];
    alerts.forEach((article,i)=>{
      const item=ranked[i];if(!item)return;const delta=item.value-national;
      article.dataset.pcode=item.pcode;article.dataset.value=item.value;article.dataset.delta=delta.toFixed(1);article.dataset.layer=layer;
      const severity=delta>=7?'CRITICAL':delta>=4?'HIGH':'WATCH';
      article.className=severity==='CRITICAL'?'critical':severity==='HIGH'?'high':'medium';
      const badge=article.querySelector(':scope > span');if(badge)badge.textContent=severity;
      const strong=article.querySelector('strong');if(strong)strong.textContent=`${layer.toUpperCase()} regional signal`;
      const p=article.querySelector('p');if(p)p.textContent=`${regionName(item.pcode)} · ${profileForLayer(item.pcode,layer).organismInfo.short}`;
      const b=article.querySelector('b');if(b)b.textContent=`${delta>=0?'+':''}${delta.toFixed(1)} ${pp()}`;
    });
  }

  function commandPointer(target) {
    const path=target.closest?.('.command-region[data-pcode]');if(!path)return;const layer=currentCommandLayer(),v=data.layerValue(path.dataset.pcode,layer);const tip=document.getElementById('command-map-tooltip');if(tip)tip.innerHTML=`<strong>${regionName(path.dataset.pcode)}</strong>${layer.toUpperCase()} ${pct(v)}<br>DEMO SURVEILLANCE LAYER`;
  }

  function syncIncident(article) {
    if (!article?.dataset.pcode) return;
    const pcode=article.dataset.pcode,layer=article.dataset.layer||currentCommandLayer(),p=profileForLayer(pcode,layer);const national=data.layerValue('KZ',layer),current=data.layerValue(pcode,layer);
    setTimeout(()=>{
      const title=document.getElementById('incident-title');if(title)title.textContent=`${layer.toUpperCase()} regional signal`;
      const currentEl=document.getElementById('incident-current');if(currentEl)currentEl.textContent=pct(current);
      const base=document.getElementById('incident-baseline');if(base)base.textContent=pct(national);
      const n=document.getElementById('incident-n');if(n)n.textContent=num(p.isolates);
      const org=document.getElementById('incident-org');if(org)org.textContent=p.organismInfo.name;
      const reg=document.getElementById('incident-region');if(reg)reg.textContent=regionName(pcode);
      const d=document.getElementById('incident-delta');if(d)d.textContent=`${current-national>=0?'+':''}${(current-national).toFixed(1)} ${pp()}`;
      const summary=document.getElementById('incident-summary');if(summary)summary.textContent=text('Демонстрационный сигнал, рассчитанный из единого аналитического слоя Atlas. Перед эскалацией требуется проверка лаборатории, материала, периода и интерпретации AST.','Atlas бірыңғай аналитикалық қабатынан есептелген демонстрациялық сигнал. Эскалация алдында зертхана, материал, кезең және AST интерпретациясын тексеру қажет.','Demo signal calculated from the shared Atlas analytical layer. Validate laboratory, specimen, period and AST interpretation before escalation.');
      const mech=document.getElementById('incident-mechanism');if(mech)mech.href=`./mechanisms.html?mechanism=${encodeURIComponent(layer.toUpperCase()==='OXA48'?'OXA-48':layer.toUpperCase())}`;
    },0);
  }

  function clinicalState() {
    const filters=[...document.querySelectorAll('.filters label select')];
    const ctx=readContext();
    const orgValue=filters[0]?.value||filters[0]?.selectedOptions?.[0]?.textContent||'';
    const organism=organismByName[orgValue]||ctx.organism||'eco';
    const materialLabel=(filters[1]?.selectedOptions?.[0]?.textContent||filters[1]?.value||'').toLowerCase();
    const material=materialByLabel[materialLabel]||ctx.material||'all';
    const periodValue=filters[3]?.value||ctx.period||'2026';
    const period=String(periodValue).includes('12')?'last12':String(periodValue).includes('2020')?'2020-2026':String(periodValue).includes('2024')?'2024-2026':'2026';
    const pcode=ctx.pcode||'KZ';
    const drugLabel=(document.getElementById('map-antibiotic')?.value||'').toLowerCase();
    const drug=drugByLabel[drugLabel]||ctx.drug||data.organisms[organism]?.defaultDrug||'CRO';
    return {pcode,organism,material,period,drug};
  }

  function ensureClinicalOrganisms() {
    const select=document.querySelector('.filters label select');if(!select)return;
    const existing=new Set([...select.options].map(o=>o.value));
    data.organismOptions().forEach(o=>{if(!existing.has(o.name))select.add(new Option(o.name,o.name));});
  }

  function syncClinicalMap(state) {
    const mapSelect=document.getElementById('map-antibiotic');
    if(mapSelect){
      const opts=data.drugOptions(state.organism);const selectedCode=drugByLabel[String(mapSelect.value).toLowerCase()]||state.drug;
      mapSelect.innerHTML=opts.map(d=>`<option value="${d.names[0]}" data-code="${d.code}">${data.drugName(d.code,lang())}</option>`).join('');
      const desired=opts.some(x=>x.code===selectedCode)?selectedCode:data.organisms[state.organism].defaultDrug;
      const option=[...mapSelect.options].find(o=>o.dataset.code===desired);if(option)mapSelect.value=option.value;
      state.drug=desired;
    }
    const paths=[...document.querySelectorAll('.atlas-svg-map .atlas-region[data-pcode]')];const labels=[...document.querySelectorAll('.atlas-svg-map .atlas-region-label')];
    paths.forEach((path,i)=>{const p=data.profile({...state,pcode:path.dataset.pcode});path.setAttribute('fill',color(p.resistance));path.setAttribute('aria-label',`${regionName(path.dataset.pcode)}: R ${pct(p.resistance)}`);if(labels[i])labels[i].textContent=`${Math.round(p.resistance)}%`;});
    const caption=document.getElementById('map-caption');if(caption)caption.textContent=`${data.drugName(state.drug,lang())} · ${regionName(state.pcode)} · ${text('демонстрационные значения','демонстрациялық мәндер','demo values')}`;
  }

  function syncClinical() {
    if (concept() !== 'clinical') return;
    ensureClinicalOrganisms();
    const state=clinicalState(); const org=data.organisms[state.organism]||data.organisms.eco;
    const profiles=data.drugOptions(state.organism).map(d=>({code:d.code,p:data.profile({...state,drug:d.code})}));
    const mean=profiles.reduce((sum,x)=>sum+x.p.resistance,0)/Math.max(1,profiles.length);
    const main=data.profile({...state,drug:org.defaultDrug});
    const phenotype=org.phenotypes[0]||'AST'; const phLayer=phenotypeLayer[phenotype]; const phenotypeValue=phLayer?data.layerValue(state.pcode,phLayer):main.resistance;
    const stats=[...document.querySelectorAll('.stats .stat')];
    const values=[
      [num(main.isolates),text('текущий срез','ағымдағы кесінді','current slice'),`${regionName(state.pcode)}, 2026`],
      [pct(mean),`${mean-main.national>=0?'+':''}${(mean-main.national).toFixed(1)} ${pp()}`,text('среднее по панели препаратов','препараттар панелі бойынша орташа','mean across agent panel')],
      [pct(main.mdr),'MDR',text('множественная резистентность','көптік төзімділік','multidrug resistance')],
      [pct(phenotypeValue),phenotype,text('фенотипический индикатор','фенотиптік индикатор','phenotype indicator')],
      ['', '', '']
    ];
    const pcodes=Object.keys(data.regionNames);const ranked=pcodes.map(code=>{const p=data.profile({...state,pcode:code,drug:org.defaultDrug});return{pcode:code,value:p.resistance,delta:p.delta,profile:p}}).sort((a,b)=>b.delta-a.delta);
    const alertCount=ranked.filter(x=>x.delta>=4).length;values[4]=[String(alertCount),alertCount?`↑ ${alertCount}`:text('нет новых','жаңа жоқ','no new'),alertCount?text('требуют внимания','назар аударуды қажет етеді','need attention'):text('активных сигналов нет','белсенді сигналдар жоқ','no active signals')];
    stats.forEach((card,i)=>{const v=values[i];if(!v)return;const strong=card.querySelector('strong'),small=card.querySelector('small'),em=strong?.querySelector('em');if(strong){strong.firstChild.textContent=`${v[0]} `;if(em)em.textContent=v[1];}if(small)small.textContent=v[2];});
    if(stats[3]){const label=stats[3].querySelector('span:not(.stat-icon)')||stats[3].querySelector('.stat > div span');if(label)label.textContent=phenotype;}

    const rows=[...document.querySelectorAll('.resistance .ab-row')];
    rows.forEach((row,i)=>{const item=profiles[i];row.style.display=item?'':'none';if(!item)return;const name=row.querySelector(':scope > span');if(name)name.textContent=data.drugName(item.code,lang());const val=row.querySelector('div > b');if(val)val.textContent=Number(item.p.resistance).toLocaleString(locale(),{minimumFractionDigits:1,maximumFractionDigits:1});const bar=row.querySelector('div i u');if(bar){bar.style.width=`${Math.max(3,Math.min(100,item.p.resistance))}%`;bar.className=item.p.resistance>=40?'danger':item.p.resistance>=20?'warn':'safe';}const count=row.querySelector(':scope > em');if(count)count.textContent=num(item.p.isolates);});
    const head=document.querySelector('.resistance .panel-head p');if(head)head.textContent=`${org.short} · ${data.materialName(state.material,lang()).toLowerCase()} · ${regionName(state.pcode)}`;

    const pageTitle=document.querySelector('.title-row h1');if(pageTitle)pageTitle.textContent=org.name;
    const phenotypeTag=document.querySelectorAll('.title-row .tag')[1];if(phenotypeTag)phenotypeTag.textContent=phenotype;

    const trend=document.querySelector('.trend svg');
    if(trend){const selectedLine=trend.querySelector('.country');const nationalLine=trend.querySelector('.world');const selectedProfile=data.profile({...state,drug:state.drug});const nationalProfile=data.profile({...state,pcode:'KZ',drug:state.drug});const all=[...selectedProfile.trend.map(x=>x.value),...nationalProfile.trend.map(x=>x.value)];const min=Math.min(...all)-3,max=Math.max(...all)+3,span=Math.max(1,max-min);const points=p=>p.trend.map((x,i)=>`${(i*720/6).toFixed(1)},${(220-((x.value-min)/span)*180).toFixed(1)}`).join(' ');if(selectedLine)selectedLine.setAttribute('points',points(selectedProfile));if(nationalLine)nationalLine.setAttribute('points',points(nationalProfile));}
    const trendCaption=document.querySelector('.trend .panel-head p');if(trendCaption)trendCaption.textContent=`${data.drugName(state.drug,lang())} · ${regionName(state.pcode)} · ${state.period}`;

    const heatRows=[...document.querySelectorAll('.heat-table .heat-row')];const heatHead=heatRows[0];const topDrugs=data.drugOptions(state.organism).slice(0,5);if(heatHead)[...heatHead.querySelectorAll('b')].forEach((b,i)=>{b.textContent=topDrugs[i]?.code||'—';});
    const heatPcodes=['KZ71','KZ75','KZ79','KZ35','KZ15'];heatRows.slice(1).forEach((row,i)=>{const code=heatPcodes[i];const region=row.querySelector('span');if(region)region.textContent=regionName(code);[...row.querySelectorAll('b')].forEach((b,j)=>{const d=topDrugs[j];if(!d){b.textContent='—';return;}const v=data.profile({...state,pcode:code,drug:d.code}).resistance;b.textContent=Math.round(v);b.className=v>=55?'h5':v>=38?'h4':v>=25?'h3':v>=12?'h2':'h1';});});

    const alerts=[...document.querySelectorAll('.alerts .alert-item')];alerts.forEach((article,i)=>{const item=ranked[i];if(!item)return;const strong=article.querySelector('strong');if(strong)strong.textContent=`${text('Повышенный R','Жоғары R','Elevated R')}: ${data.drugName(org.defaultDrug,lang())}`;const p=article.querySelector('p');if(p)p.textContent=`${regionName(item.pcode)} · ${item.delta>=0?'+':''}${item.delta.toFixed(1)} ${pp()}`;const em=article.querySelector('em');if(em)em.textContent=item.delta>=7?text('Высокий','Жоғары','High'):item.delta>=4?text('Средний','Орташа','Medium'):text('Наблюдение','Бақылау','Watch');});

    syncClinicalMap(state);
  }

  function clinicalPointer(target) {
    const path=target.closest?.('.atlas-svg-map .atlas-region[data-pcode]');if(!path)return;const state=clinicalState();const p=data.profile({...state,pcode:path.dataset.pcode});const tip=document.querySelector('.svg-map-tooltip');if(tip)tip.innerHTML=`<strong>${regionName(path.dataset.pcode)}</strong><span>${data.drugName(state.drug,lang())} · R <b>${pct(p.resistance)}</b></span><span>${text('Изолятов','Изоляттар','Isolates')} <b>${num(p.isolates)}</b></span>`;
  }

  function clinicalPopup(target) {
    const path=target.closest?.('.atlas-svg-map .atlas-region[data-pcode]');if(!path)return;setTimeout(()=>{const state=clinicalState();state.pcode=path.dataset.pcode;const p=data.profile(state);const popup=document.querySelector('.svg-map-popup');if(!popup?.classList.contains('show'))return;const kicker=popup.querySelector('.popup-kicker');if(kicker)kicker.textContent=`${p.organismInfo.short} · ${data.drugName(p.drug,lang())} · ${text('демонстрационные данные','демонстрациялық деректер','demo data')}`;const h=popup.querySelector('h3');if(h)h.textContent=regionName(path.dataset.pcode);const cells=popup.querySelectorAll('.popup-grid strong');if(cells[0])cells[0].textContent=pct(p.resistance);if(cells[1])cells[1].textContent=num(p.isolates);if(cells[2])cells[2].textContent=String(Math.max(2,Math.round(p.isolates/520)));const para=popup.querySelector('p');if(para)para.textContent=`${p.delta>=0?'↑':'↓'} ${Math.abs(p.delta).toFixed(1)} ${pp()} ${text('к национальному демонстрационному уровню','ұлттық демонстрациялық деңгейге','vs national demo baseline')}.`;},0);
  }

  let scheduled=false;
  function syncAll(){scheduled=false;syncNationalMap();syncCommand();syncClinical();}
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>setTimeout(syncAll,0));}

  document.addEventListener('atlas:analysis-context',schedule);
  document.addEventListener('atlas:language-changed',schedule);
  document.addEventListener('atlas:map-ready',schedule);
  document.addEventListener('atlas:regions-source',schedule);
  document.addEventListener('atlas:dashboard-region-changed',event=>{if(event.detail?.pcode)writeContext({pcode:event.detail.pcode,source:'clinical'});schedule();});
  document.addEventListener('atlas:region-selected',event=>{if(event.detail?.pcode)writeContext({pcode:event.detail.pcode,source:'clinical-map'});schedule();});
  document.addEventListener('pointerover',e=>{nationalPointer(e.target);commandPointer(e.target);clinicalPointer(e.target);});
  document.addEventListener('click',e=>{
    const layer=e.target.closest?.('[data-layer]');if(layer?.dataset.layer)writeContext({layer:layer.dataset.layer,source:concept()});
    const mapPath=e.target.closest?.('[data-pcode]');if(mapPath?.dataset.pcode)writeContext({pcode:mapPath.dataset.pcode,source:concept()});
    const alert=e.target.closest?.('.command-alerts article');if(alert)syncIncident(alert);
    clinicalPopup(e.target);
    schedule();
  });
  document.addEventListener('change',e=>{
    if(concept()==='clinical'&&e.target.matches('.filters select,#map-antibiotic')){
      const state=clinicalState();
      writeContext({...state,source:'clinical-filters'});
    }
    schedule();
  });

  const observer=new MutationObserver(records=>{if(records.some(r=>r.addedNodes.length||r.removedNodes.length))schedule();});
  observer.observe(document.body,{childList:true,subtree:true});
  setTimeout(syncAll,120);setTimeout(syncAll,600);setTimeout(syncAll,1500);
  window.AtlasUnifiedAnalytics={sync:syncAll,profileForLayer};
})();
