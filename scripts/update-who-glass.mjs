import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const API=process.env.WHO_GHO_API||'https://ghoapi.azureedge.net/api';
const OUT='data/who-glass.json';
const MIN_RECORDS=500,MIN_COUNTRIES=50;

async function fetchJson(url,attempt=1){
  const c=new AbortController();const timer=setTimeout(()=>c.abort(),30000);
  try{const r=await fetch(url,{signal:c.signal,headers:{accept:'application/json','user-agent':'AMR-Atlas/1.0'}});if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.json();}
  catch(e){if(attempt<3){await new Promise(r=>setTimeout(r,1000*attempt));return fetchJson(url,attempt+1);}throw new Error(`WHO fetch failed: ${url}: ${e.message}`);}
  finally{clearTimeout(timer);}
}
async function allPages(url){const out=[];let next=url,guard=0;while(next&&guard<100){const b=await fetchJson(next);if(!Array.isArray(b.value))throw new Error(`Unexpected WHO schema at ${next}`);out.push(...b.value);next=b['@odata.nextLink']||b['odata.nextLink']||null;guard++;}return out;}
const norm=s=>String(s||'').toLowerCase().replace(/–|—/g,'-').replace(/\s+/g,' ');
function pickIndicators(rows){const en=rows.filter(r=>!r.Language||r.Language==='EN');const mrsa=en.find(r=>{const n=norm(r.IndicatorName);return n.includes('methicillin-resistant')&&n.includes('staphylococcus aureus');});const ecoli=en.find(r=>{const n=norm(r.IndicatorName);return n.includes('escherichia coli')&&n.includes('third-generation cephalospor');});if(!mrsa||!ecoli)throw new Error('WHO SDG 3.d.2 indicators not found');return{mrsa,ecoli};}
function num(r){const n=Number(r.NumericValue);if(Number.isFinite(n))return n;const m=String(r.Value||'').replace(',','.').match(/-?\d+(?:\.\d+)?/);return m?Number(m[0]):NaN;}
function year(r){const y=Number(r.TimeDim);if(Number.isInteger(y))return y;const m=String(r.TimeDimensionBegin||r.Date||'').match(/(20\d{2}|19\d{2})/);return m?Number(m[1]):NaN;}

const [catalog,countries]=await Promise.all([allPages(`${API}/Indicator`),allPages(`${API}/DIMENSION/COUNTRY/DimensionValues`)]);
const found=pickIndicators(catalog);
const countryMap=new Map(countries.map(c=>[c.Code,{name:c.Title||c.Code,region:c.ParentTitle||''}]));
const defs=[['mrsa',found.mrsa],['ecoli3gc',found.ecoli]];
const blocks=await Promise.all(defs.map(async([key,ind])=>[key,ind,await allPages(`${API}/${encodeURIComponent(ind.IndicatorCode)}`)]));
const dedupe=new Map();
for(const [key,ind,rows] of blocks){for(const r of rows){if(r.Dim1!=null||r.Dim2!=null||r.Dim3!=null)continue;const meta=countryMap.get(r.SpatialDim);if(!meta)continue;const value=num(r),y=year(r);if(!Number.isFinite(value)||value<0||value>100||!Number.isInteger(y)||y<2015||y>2100)continue;const k=`${key}|${r.SpatialDim}|${y}`;if(dedupe.has(k))throw new Error(`Duplicate WHO record: ${k}`);dedupe.set(k,{indicator:key,indicatorCode:ind.IndicatorCode,countryCode:r.SpatialDim,country:meta.name,whoRegion:meta.region,year:y,value:+value.toFixed(4),low:Number.isFinite(Number(r.Low))?Number(r.Low):null,high:Number.isFinite(Number(r.High))?Number(r.High):null});}}
const records=[...dedupe.values()].sort((a,b)=>a.indicator.localeCompare(b.indicator)||a.country.localeCompare(b.country)||a.year-b.year);
const countrySet=new Set(records.map(r=>r.countryCode));const years=records.map(r=>r.year);
if(records.length<MIN_RECORDS||countrySet.size<MIN_COUNTRIES)throw new Error(`Quality gate failed: ${records.length} records, ${countrySet.size} countries`);
const minYear=Math.min(...years),maxYear=Math.max(...years),stable=JSON.stringify(records);
const hash=crypto.createHash('sha256').update(stable).digest('hex').slice(0,12),now=new Date().toISOString();
const dataset={meta:{source:'WHO Global Health Observatory / GLASS',checkedAt:now,generatedAt:now,version:`glass-${maxYear}-${hash}`,contentSha256:crypto.createHash('sha256').update(stable).digest('hex'),period:{from:minYear,to:maxYear},recordCount:records.length,countryCount:countrySet.size,refreshEveryDays:7,indicators:{mrsa:{code:found.mrsa.IndicatorCode,name:found.mrsa.IndicatorName},ecoli3gc:{code:found.ecoli.IndicatorCode,name:found.ecoli.IndicatorName}},sourceUrls:{glass:'https://www.who.int/data/gho/data/themes/topics/topic-details/GHO/global-antimicrobial-resistance-surveillance-system-glass',api:API},limitations:['Public indicator feed may not expose denominator/sample size for each row.','Absence of a country-year value means no published value in this feed, not absence of AMR.','National representativeness depends on country surveillance coverage and reporting.']},records};
await fs.mkdir('data',{recursive:true});await fs.writeFile(OUT,JSON.stringify(dataset,null,2)+'\n','utf8');
console.log(`WHO GLASS snapshot written: ${dataset.meta.version}; ${records.length} records; ${countrySet.size} countries; ${minYear}-${maxYear}`);
