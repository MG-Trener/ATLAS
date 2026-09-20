import test from 'node:test';
import assert from 'node:assert/strict';
import {organisms,pcodes,profile,regionsFor,antibioticsFor,specimensFor,trendFor,publish,wilson,normalise,exportRows,toCsv} from '../../atlas-model.mjs';

test('national R/N is a weighted sum of the 20 territories for every organism and year',()=>{
  for(const organism of Object.keys(organisms))for(const year of ['2024','2025','2026']){
    const context={organism,year};const rows=regionsFor(context),p=profile(context);
    for(const field of ['r','s','i','n','labs'])assert.equal(p[field],rows.reduce((a,r)=>a+r[field],0),`${organism} ${year} ${field}`);
    assert.equal(p.rate,100*p.r/p.n);
    assert.equal(p.n,p.s+p.i+p.r);
  }
});
test('specimen counts partition the all-specimen cohort and the same pair matches the antibiotic table',()=>{
  for(const region of ['KZ',...pcodes]){
    const ctx={region,organism:'eco',drug:'CRO',material:'all'};
    const p=profile(ctx),rows=specimensFor(ctx);
    for(const field of ['r','s','i','n'])assert.equal(p[field],rows.reduce((a,r)=>a+r[field],0));
    assert.deepEqual(p,antibioticsFor(ctx).find(r=>r.drug==='CRO'));
    assert.deepEqual(p,trendFor(ctx).at(-1));
  }
});
test('period changes recompute the cohort, with a fixed and explicit YTD cutoff',()=>{
  const a=profile({year:'2025'}),b=profile({year:'2026'});
  assert.notEqual(a.n,b.n);assert.notEqual(a.rate,b.rate);
  assert.equal(a.period.complete,true);assert.equal(a.period.end,'2025-12-31');
  assert.equal(b.period.complete,false);assert.equal(b.period.end,'2026-09-20');
});
test('small cohorts never serialize counts, percentages or CI into public values',()=>{
  for(const n of [1,8,29]){
    const p=publish({n,r:1,i:0,s:n-1});assert.equal(p.status,'suppressed');
    for(const k of ['n','r','i','s','rate','sRate','iRate','ci'])assert.equal(p[k],null);
  }
  assert.equal(publish({n:30,r:10,i:3,s:17}).status,'available');
  assert.equal(publish({n:0,r:0,i:0,s:0}).status,'empty');
  assert.equal(publish({n:30,r:31,i:0,s:0}).status,'unavailable');
});
test('the exported sparse antimicrobial fixture contains no suppressed cells',()=>{
  const rows=exportRows({region:'KZ62',organism:'aba',drug:'COL',material:'blood'});
  const scarce=rows.find(r=>r.drug_code==='COL');assert.equal(scarce.status,'suppressed');
  for(const k of ['tested_n','resistant_r','susceptible_s','increased_exposure_i','resistance_percent','ci95_low','ci95_high'])assert.equal(scarce[k],'');
  assert.match(toCsv(rows),/SYNTHETIC_DEMO_NOT_OFFICIAL/);
});
test('Wilson interval handles extremes and rejects impossible counts',()=>{
  assert.ok(wilson(0,100).low<.0001);assert.ok(wilson(100,100).high>99.99);
  const ci=wilson(50,100);assert.ok(Math.abs(ci.low-40.38)<.02);assert.ok(Math.abs(ci.high-59.62)<.02);
  assert.equal(wilson(1,0),null);assert.equal(wilson(101,100),null);
});
test('URL inputs are restricted to known codes and valid organism-drug pairs',()=>{
  const p=normalise({region:'<script>',organism:'__proto__',drug:'VAN',material:'unknown',year:'2050'});
  assert.deepEqual(p,{region:'KZ',organism:'eco',drug:'CRO',material:'all',year:'2026'});
  assert.equal(normalise({organism:'sau',drug:'CRO'}).drug,'FOX');
});
test('CSV quotes delimiters and blocks spreadsheet formulas',()=>{
  const csv=toCsv([{x:'=1+1',y:'a;"b"\nline'}]);
  assert.ok(csv.startsWith('\uFEFF'));assert.match(csv,/"'=1\+1"/);assert.ok(csv.includes('"a;""b""\nline"'));
});
