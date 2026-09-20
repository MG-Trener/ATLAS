// Synthetic aggregate fixture. No patient records or live surveillance connection.
export const regionNames={
    KZ10:['Область Абай','Абай облысы','Abay Region'],KZ11:['Акмолинская область','Ақмола облысы','Akmola Region'],KZ15:['Актюбинская область','Ақтөбе облысы','Aktobe Region'],KZ19:['Алматинская область','Алматы облысы','Almaty Region'],KZ23:['Атырауская область','Атырау облысы','Atyrau Region'],KZ27:['Западно-Казахстанская область','Батыс Қазақстан облысы','West Kazakhstan Region'],KZ31:['Жамбылская область','Жамбыл облысы','Zhambyl Region'],KZ33:['Область Жетісу','Жетісу облысы','Zhetysu Region'],KZ35:['Карагандинская область','Қарағанды облысы','Karaganda Region'],KZ39:['Костанайская область','Қостанай облысы','Kostanay Region'],KZ43:['Кызылординская область','Қызылорда облысы','Kyzylorda Region'],KZ47:['Мангистауская область','Маңғыстау облысы','Mangystau Region'],KZ55:['Павлодарская область','Павлодар облысы','Pavlodar Region'],KZ59:['Северо-Казахстанская область','Солтүстік Қазақстан облысы','North Kazakhstan Region'],KZ61:['Туркестанская область','Түркістан облысы','Turkistan Region'],KZ62:['Область Ұлытау','Ұлытау облысы','Ulytau Region'],KZ63:['Восточно-Казахстанская область','Шығыс Қазақстан облысы','East Kazakhstan Region'],KZ71:['Астана','Астана','Astana'],KZ75:['Алматы','Алматы','Almaty'],KZ79:['Шымкент','Шымкент','Shymkent']
  };

export const organisms={
    eco:{code:'eco',name:'Escherichia coli',short:'E. coli',phenotypes:['ESBL'],defaultDrug:'CRO',drugs:{AMP:68.7,CRO:28.6,CIP:34.1,SXT:32.4,NIT:8.5,AMK:6.2,MEM:1.3}},
    kpn:{code:'kpn',name:'Klebsiella pneumoniae',short:'K. pneumoniae',phenotypes:['ESBL','CRE'],defaultDrug:'CRO',drugs:{CRO:43.2,CIP:38.7,SXT:35.5,AMK:13.4,MEM:9.6,CAZ:41.0}},
    sau:{code:'sau',name:'Staphylococcus aureus',short:'S. aureus',phenotypes:['MRSA'],defaultDrug:'FOX',drugs:{FOX:14.2,ERY:29.4,CLI:22.1,VAN:1.1,LNZ:0.5}},
    pae:{code:'pae',name:'Pseudomonas aeruginosa',short:'P. aeruginosa',phenotypes:['CRPA'],defaultDrug:'MEM',drugs:{MEM:18.4,CAZ:21.2,FEP:19.6,CIP:24.8,AMK:11.3}},
    aba:{code:'aba',name:'Acinetobacter baumannii',short:'A. baumannii',phenotypes:['CRAB'],defaultDrug:'MEM',drugs:{MEM:43.5,IPM:40.7,AMK:28.2,LVX:35.4,COL:3.2}}
  };

export const drugs={
    AMP:['Ампициллин','Ампициллин','Ampicillin'],CRO:['Цефтриаксон','Цефтриаксон','Ceftriaxone'],CIP:['Ципрофлоксацин','Ципрофлоксацин','Ciprofloxacin'],SXT:['Триметоприм/сульфаметоксазол','Триметоприм/сульфаметоксазол','Trimethoprim/sulfamethoxazole'],NIT:['Нитрофурантоин','Нитрофурантоин','Nitrofurantoin'],AMK:['Амикацин','Амикацин','Amikacin'],MEM:['Меропенем','Меропенем','Meropenem'],CAZ:['Цефтазидим','Цефтазидим','Ceftazidime'],FOX:['Цефокситин','Цефокситин','Cefoxitin'],ERY:['Эритромицин','Эритромицин','Erythromycin'],CLI:['Клиндамицин','Клиндамицин','Clindamycin'],VAN:['Ванкомицин','Ванкомицин','Vancomycin'],LNZ:['Линезолид','Линезолид','Linezolid'],FEP:['Цефепим','Цефепим','Cefepime'],IPM:['Имипенем','Имипенем','Imipenem'],LVX:['Левофлоксацин','Левофлоксацин','Levofloxacin'],COL:['Колистин','Колистин','Colistin']
  };

export const materials={
    all:['Все материалы','Барлық материалдар','All specimens'],urine:['Моча','Зәр','Urine'],blood:['Кровь','Қан','Blood'],respiratory:['Респираторный материал','Респираторлық материал','Respiratory'],wound:['Раневое отделяемое','Жара материалы','Wound']
  };

export const MODEL_VERSION = 'synthetic-aggregate-v1';
export const CUTOFF = '2026-09-20';
// A conservative Atlas precision rule, not a statutory anonymisation threshold.
export const MIN_N = 30;
export const YEARS = ['2024', '2025', '2026'];
export const pcodes = Object.keys(regionNames);
export const cityCodes = ['KZ71', 'KZ75', 'KZ79'];
const specimens = ['urine', 'blood', 'respiratory', 'wound'];
const weights = {urine: .42, blood: .18, respiratory: .24, wound: .16};
const factors = {urine: 2.4, blood: -1.8, respiratory: 3.1, wound: 1.2};
const cache = new Map();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const hash = input => {let h=2166136261;for(const ch of String(input)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0;};
export const langIndex = lang => lang==='kk'?1:lang==='en'?2:0;
export const regionName = (pcode,lang='ru') => regionNames[pcode]?.[langIndex(lang)] || ['Казахстан','Қазақстан','Kazakhstan'][langIndex(lang)];
export const drugName = (code,lang='ru') => drugs[code]?.[langIndex(lang)] || code;
export const materialName = (code,lang='ru') => materials[code]?.[langIndex(lang)] || code;
export function normalise(input={}) {
  const organism = Object.hasOwn(organisms,input.organism)?input.organism:'eco';
  return {region: pcodes.includes(input.region)?input.region:'KZ', organism,
    drug: Object.hasOwn(organisms[organism].drugs,input.drug)?input.drug:organisms[organism].defaultDrug,
    material: Object.hasOwn(materials,input.material)?input.material:'all',
    year: YEARS.includes(String(input.year))?String(input.year):'2026'};
}
export function period(year) {
  return {start:`${year}-01-01`,end:year==='2026'?CUTOFF:`${year}-12-31`,complete:year!=='2026'};
}
export function wilson(r,n) {
  if (!Number.isSafeInteger(n)||!Number.isSafeInteger(r)||n<=0||r<0||r>n) return null;
  const z=1.95996398454, p=r/n, d=1+z*z/n, c=(p+z*z/(2*n))/d;
  const m=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;
  return {low:Math.max(0,(c-m)*100),high:Math.min(100,(c+m)*100)};
}
function fixture(region, organism, drug, material, year) {
  const seed=`${region}:${organism}:${drug}:${material}`;
  const base=780+hash(`${region}:${organism}:size`)%2700;
  const testing=.63+(hash(`${drug}:testing`)%33)/100;
  const time=(year==='2026'?263/365:1)*(1+(Number(year)-2024)*.06);
  const scarce=(drug==='COL'||drug==='LNZ')?.10:1;
  const n=Math.max(3,Math.round(base*weights[material]*testing*time*scarce));
  const rate=clamp(organisms[organism].drugs[drug]+((hash(`${region}:r`)%171)-85)/10+
    factors[material]+(Number(year)-2026)*1.2+((hash(seed)%21)-10)/10,.3,88);
  const r=Math.round(n*rate/100), i=Math.min(n-r,Math.round(n*(3+(hash(`${seed}:i`)%50)/10)/100));
  return {n,r,i,s:n-r-i};
}
function totals(options) {
  const state=normalise(options), key=JSON.stringify(state);
  if(cache.has(key))return cache.get(key);
  const regions=state.region==='KZ'?pcodes:[state.region];
  const materialList=state.material==='all'?specimens:[state.material];
  const sum={n:0,r:0,i:0,s:0,labs:0};
  for(const region of regions){
    sum.labs+=2+hash(`${region}:labs`)%9;
    for(const material of materialList){const x=fixture(region,state.organism,state.drug,material,state.year);for(const k of ['n','r','i','s'])sum[k]+=x[k];}
  }
  cache.set(key,Object.freeze(sum));return sum;
}
// Public serialization allowlist: never return suppressed numerators or percentages.
export function publish(counts) {
  if(!counts||!['n','r','i','s'].every(k=>Number.isSafeInteger(counts[k])&&counts[k]>=0)||counts.r+counts.i+counts.s!==counts.n) {
    return {status:'unavailable',n:null,r:null,i:null,s:null,rate:null,ci:null,sRate:null,iRate:null};
  }
  if(counts.n===0)return {status:'empty',n:0,r:null,i:null,s:null,rate:null,ci:null,sRate:null,iRate:null};
  if(counts.n<MIN_N)return {status:'suppressed',n:null,r:null,i:null,s:null,rate:null,ci:null,sRate:null,iRate:null};
  return {status:'available',n:counts.n,r:counts.r,i:counts.i,s:counts.s,rate:100*counts.r/counts.n,
    sRate:100*counts.s/counts.n,iRate:100*counts.i/counts.n,ci:wilson(counts.r,counts.n)};
}
export function profile(options) {
  const state=normalise(options), x=totals(state);
  return {...publish(x),...state,labs:x.labs,demo:true,version:MODEL_VERSION,period:period(state.year)};
}
export function regionsFor(options) {return pcodes.map(region=>profile({...options,region}));}
export function antibioticsFor(options) {const state=normalise(options);return Object.keys(organisms[state.organism].drugs).map(drug=>profile({...state,drug}));}
// The specimen section always describes all specimens and is explicitly labelled as such.
export function specimensFor(options) {return specimens.map(material=>profile({...options,material}));}
export function trendFor(options) {const state=normalise(options);return YEARS.filter(year=>year<=state.year).map(year=>profile({...state,year}));}
export function exportRows(options,lang='ru') {
  const state=normalise(options), data=state.region==='KZ'?regionsFor(state):antibioticsFor(state);
  const num=v=>v===null?'':Number(v.toFixed(3));
  return data.map(p=>({data_mode:'SYNTHETIC_DEMO_NOT_OFFICIAL',model_version:MODEL_VERSION,region_code:p.region,
    region:regionName(p.region,lang),organism:organisms[p.organism].name,drug_code:p.drug,drug:drugName(p.drug,lang),
    specimen:materialName(p.material,lang),period_start:p.period.start,period_end:p.period.end,period_complete:p.period.complete,
    status:p.status,min_n:MIN_N,tested_n:p.n??'',resistant_r:p.r??'',susceptible_s:p.s??'',increased_exposure_i:p.i??'',
    resistance_percent:num(p.rate),ci95_low:num(p.ci?.low??null),ci95_high:num(p.ci?.high??null),
    source:'Synthetic UI fixture; no clinical observations',breakpoints:'Not applied to synthetic counts',
    deduplication:'Not applied; synthetic aggregates',ci_method:'Wilson 95%'}));
}
export function toCsv(rows) {
  if(!rows.length)return '';
  const quote=v=>{let s=String(v??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
  const keys=Object.keys(rows[0]);
  return '\uFEFF'+[keys.map(quote).join(';'),...rows.map(row=>keys.map(k=>quote(row[k])).join(';'))].join('\r\n');
}
