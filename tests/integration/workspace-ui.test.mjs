import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM, VirtualConsole} from 'jsdom';

const read = name => readFileSync(new URL(`../../${name}`,import.meta.url),'utf8');
const flush = () => new Promise(resolve => setTimeout(resolve,0));
function setup(page){
  const errors=[];
  const virtualConsole=new VirtualConsole();
  virtualConsole.on('jsdomError',error=>errors.push(error.message));
  const dom=new JSDOM(read(page),{url:`https://atlas.test/${page}`,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole});
  const w=dom.window;
  w.scrollTo=()=>{};w.matchMedia=()=>({matches:false});
  w.HTMLElement.prototype.scrollIntoView=()=>{};
  w.SVGElement.prototype.getBBox=()=>({x:0,y:0,width:600,height:320});
  w.CSS={escape:value=>value};
  const $=selector=>w.document.querySelector(selector);
  const click=selector=>{assert.ok($(selector),`Missing ${selector}`);$(selector).dispatchEvent(new w.MouseEvent('click',{bubbles:true}));};
  const change=(selector,value)=>{$(selector).value=value;$(selector).dispatchEvent(new w.Event('change',{bubbles:true}));};
  return {dom,w,$,click,change,errors};
}
async function explorer(){
  const ui=setup('index.html');
  ui.w.fetch=async()=>({ok:true,json:async()=>JSON.parse(read('regions.json'))});
  const source=['atlas-model.mjs','atlas-copy.mjs','atlas-shell.mjs','atlas-explorer.mjs'].map(file=>read(file).replace(/^import .+;\n/gm,'').replace(/^export /gm,'')).join('\n');
  ui.w.eval(source);await flush();return ui;
}

test('region preview preserves country context; full profile and history remain available',async()=>{
  const {dom,w,$,click,errors}=await explorer();
  try{
    const total=$('.metric strong').textContent;
    click('[data-open-region="KZ71"]');
    assert.equal($('#preview-title').textContent,'Астана');
    assert.equal($('#filter-region').value,'KZ');
    assert.equal($('.metric strong').textContent,total);
    assert.equal(w.document.querySelectorAll('#territory-shapes path').length,20);
    click('[data-dismiss-preview]');
    assert.ok($('#region-search'));
    click('[data-region="KZ71"]');
    click('[data-full-region="KZ71"]');
    assert.equal($('#filter-region').value,'KZ71');
    assert.ok($('#regional-geo-map'));
    assert.equal($('#territory-map'),null);
    assert.ok(w.document.querySelectorAll('.geo-tile').length>0);
    assert.match($('.geo-attribution').textContent,/OpenStreetMap/);
    const mapZoom=Number($('#regional-geo-map').dataset.zoom);
    click('[data-geo-zoom="in"]');
    assert.equal(Number($('#regional-geo-map').dataset.zoom),mapZoom+1);
    click('[data-geo-zoom="reset"]');
    assert.equal(Number($('#regional-geo-map').dataset.zoom),mapZoom);
    assert.match(w.location.search,/region=KZ71/);
    click('.brand[data-home]');
    assert.equal($('#filter-region').value,'KZ');
    assert.deepEqual(errors,[]);
  }finally{dom.window.close();}
});

test('analytics tabs, keyboard, density, languages and cohort filters work together',async()=>{
  const {dom,w,$,click,change,errors}=await explorer();
  try{
    click('[data-panel="materials"]');
    assert.match($('#analysis-panel').textContent,/Структура по материалам/);
    $('#tab-materials').dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));
    assert.equal($('#tab-source').getAttribute('aria-selected'),'true');
    assert.match($('#analysis-panel').textContent,/synthetic-aggregate-v1/);
    click('[data-density]');
    assert.ok($('#main').classList.contains('is-compact'));
    change('#filter-organism','sau');
    assert.equal($('#tab-source').getAttribute('aria-selected'),'true');
    assert.equal($('#filter-organism').value,'sau');
    click('[data-language="en"]');
    assert.equal(w.document.documentElement.lang,'en');
    assert.match($('#analysis-panel').textContent,/Synthetic/);
    click('[data-language="kk"]');
    assert.equal(w.document.documentElement.lang,'kk');
    click('[data-language="ru"]');
    assert.equal(w.document.querySelectorAll('.site-header').length,1);
    assert.match($('#filter-year').textContent,/с начала года/);
    assert.deepEqual(errors,[]);
  }finally{dom.window.close();}
});

async function reference(){
  const ui=setup('reference.html');let fail=false;
  const organisms=[{whonet_code:'eco',organism:'Escherichia coli',genus:'Escherichia',family:'Enterobacteriaceae',kingdom:'Bacteria',taxonomic_status:'C'}, {whonet_code:'kpn',organism:'Klebsiella pneumoniae',kingdom:'Bacteria',taxonomic_status:'C'}];
  const drugs=[{whonet_code:'CRO',antimicrobial:'Ceftriaxone',name_ru:'Цефтриаксон',who_aware:'Watch',human:true}];
  ui.w.ATLAS_SUPABASE={url:'https://catalog.test',publishableKey:'test-fixture'};
  ui.w.fetch=async url=>{if(fail)throw Error('offline');const rows=url.includes('antimicrobial_catalog')?drugs:organisms;return {ok:true,json:async()=>rows,headers:{get:()=>`0-${rows.length-1}/${rows.length}`}};};
  ui.w.eval(read('reference.js'));
  ui.w.eval(read('atlas-shell.mjs').replace(/^export /gm,''));
  await flush();return {...ui,fail:()=>{fail=true;}};
}

test('catalog switches language and type, and mobile detail returns to selected row',async()=>{
  const {dom,w,$,click,errors}=await reference();
  try{
    const header=$('.site-header');
    assert.ok(header.classList.contains('workspace-header'));
    assert.equal(w.document.querySelectorAll('.catalog-row').length,2);
    w.matchMedia=()=>({matches:true});
    click('[data-code="kpn"]');
    assert.ok($('#catalog-workspace').classList.contains('show-detail'));
    assert.match($('#reference-detail').textContent,/Klebsiella pneumoniae/);
    click('#back-to-catalog');
    assert.equal($('#catalog-workspace').classList.contains('show-detail'),false);
    assert.equal(w.document.activeElement.dataset.code,'kpn');
    click('[data-language="en"]');
    assert.equal($('.site-header'),header);
    assert.equal(w.document.documentElement.lang,'en');
    assert.equal(w.document.querySelector('h1').textContent,'AMR reference');
    assert.equal(header.querySelector('nav a[aria-current="page"]').textContent,'Reference');
    click('[data-tab="antimicrobials"]');await flush();
    assert.match($('#reference-detail').textContent,/Ceftriaxone/);
    assert.equal($('[data-tab="antimicrobials"]').getAttribute('aria-pressed'),'true');
    click('[data-language="ru"]');
    assert.equal($('.site-header'),header);
    assert.match($('#reference-detail').textContent,/Цефтриаксон/);
    assert.deepEqual(errors,[]);
  }finally{dom.window.close();}
});

test('failed catalog request clears obsolete record details',async()=>{
  const {dom,$,change,fail}=await reference();
  try{
    assert.match($('#reference-detail').textContent,/Escherichia coli/);
    fail();change('#filter-primary','Bacteria');await flush();
    assert.equal($('#catalog-error').hidden,false);
    assert.doesNotMatch($('#reference-detail').textContent,/Escherichia coli/);
    assert.equal($('#next-page').disabled,true);
  }finally{dom.window.close();}
});
