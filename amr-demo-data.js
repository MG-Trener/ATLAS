(() => {
  'use strict';
  if (window.AtlasDemoData) return;

  const years=[2020,2021,2022,2023,2024,2025,2026];
  const regionNames={
    KZ10:['Абайская область','Абай облысы','Abay Region'],KZ11:['Акмолинская область','Ақмола облысы','Akmola Region'],KZ15:['Актюбинская область','Ақтөбе облысы','Aktobe Region'],KZ19:['Алматинская область','Алматы облысы','Almaty Region'],KZ23:['Атырауская область','Атырау облысы','Atyrau Region'],KZ27:['Западно-Казахстанская область','Батыс Қазақстан облысы','West Kazakhstan Region'],KZ31:['Жамбылская область','Жамбыл облысы','Zhambyl Region'],KZ33:['Жетысуская область','Жетісу облысы','Zhetysu Region'],KZ35:['Карагандинская область','Қарағанды облысы','Karaganda Region'],KZ39:['Костанайская область','Қостанай облысы','Kostanay Region'],KZ43:['Кызылординская область','Қызылорда облысы','Kyzylorda Region'],KZ47:['Мангистауская область','Маңғыстау облысы','Mangystau Region'],KZ55:['Павлодарская область','Павлодар облысы','Pavlodar Region'],KZ59:['Северо-Казахстанская область','Солтүстік Қазақстан облысы','North Kazakhstan Region'],KZ61:['Туркестанская область','Түркістан облысы','Turkistan Region'],KZ62:['Улытауская область','Ұлытау облысы','Ulytau Region'],KZ63:['Восточно-Казахстанская область','Шығыс Қазақстан облысы','East Kazakhstan Region'],KZ71:['Астана','Астана','Astana'],KZ75:['Алматы','Алматы','Almaty'],KZ79:['Шымкент','Шымкент','Shymkent']
  };

  const organisms={
    eco:{code:'eco',name:'Escherichia coli',short:'E. coli',phenotypes:['ESBL'],defaultDrug:'CRO',drugs:{AMP:68.7,CRO:28.6,CIP:34.1,SXT:32.4,NIT:8.5,AMK:6.2,MEM:1.3}},
    kpn:{code:'kpn',name:'Klebsiella pneumoniae',short:'K. pneumoniae',phenotypes:['ESBL','CRE'],defaultDrug:'CRO',drugs:{CRO:43.2,CIP:38.7,SXT:35.5,AMK:13.4,MEM:9.6,CAZ:41.0}},
    sau:{code:'sau',name:'Staphylococcus aureus',short:'S. aureus',phenotypes:['MRSA'],defaultDrug:'FOX',drugs:{FOX:14.2,ERY:29.4,CLI:22.1,VAN:1.1,LNZ:0.5}},
    pae:{code:'pae',name:'Pseudomonas aeruginosa',short:'P. aeruginosa',phenotypes:['CRPA'],defaultDrug:'MEM',drugs:{MEM:18.4,CAZ:21.2,FEP:19.6,CIP:24.8,AMK:11.3}},
    aba:{code:'aba',name:'Acinetobacter baumannii',short:'A. baumannii',phenotypes:['CRAB'],defaultDrug:'MEM',drugs:{MEM:43.5,IPM:40.7,AMK:28.2,LVX:35.4,COL:3.2}}
  };

  const drugs={
    AMP:['Ампициллин','Ампициллин','Ampicillin'],CRO:['Цефтриаксон','Цефтриаксон','Ceftriaxone'],CIP:['Ципрофлоксацин','Ципрофлоксацин','Ciprofloxacin'],SXT:['Триметоприм/сульфаметоксазол','Триметоприм/сульфаметоксазол','Trimethoprim/sulfamethoxazole'],NIT:['Нитрофурантоин','Нитрофурантоин','Nitrofurantoin'],AMK:['Амикацин','Амикацин','Amikacin'],MEM:['Меропенем','Меропенем','Meropenem'],CAZ:['Цефтазидим','Цефтазидим','Ceftazidime'],FOX:['Цефокситин','Цефокситин','Cefoxitin'],ERY:['Эритромицин','Эритромицин','Erythromycin'],CLI:['Клиндамицин','Клиндамицин','Clindamycin'],VAN:['Ванкомицин','Ванкомицин','Vancomycin'],LNZ:['Линезолид','Линезолид','Linezolid'],FEP:['Цефепим','Цефепим','Cefepime'],IPM:['Имипенем','Имипенем','Imipenem'],LVX:['Левофлоксацин','Левофлоксацин','Levofloxacin'],COL:['Колистин','Колистин','Colistin']
  };

  const materials={
    all:['Все материалы','Барлық материалдар','All specimens'],urine:['Моча','Зәр','Urine'],blood:['Кровь','Қан','Blood'],respiratory:['Респираторный материал','Респираторлық материал','Respiratory'],wound:['Раневое отделяемое','Жара материалы','Wound']
  };
  const materialFactors={all:0,urine:2.4,blood:-1.8,respiratory:3.1,wound:1.2};
  const materialWeights={urine:.42,blood:.18,respiratory:.24,wound:.16};

  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const hash=input=>{let h=2166136261;for(const ch of String(input)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return Math.abs(h>>>0)};
  const langIndex=lang=>lang==='kk'?1:lang==='en'?2:0;
  const regionName=(pcode,lang='ru')=>pcode&&regionNames[pcode]?regionNames[pcode][langIndex(lang)]:(lang==='kk'?'Қазақстан':lang==='en'?'Kazakhstan':'Казахстан');
  const drugName=(code,lang='ru')=>drugs[code]?.[langIndex(lang)]||code;
  const materialName=(code,lang='ru')=>materials[code]?.[langIndex(lang)]||code;

  function regionAdjustment(pcode){if(!pcode||pcode==='KZ')return 0;return ((hash(`${pcode}:region`)%161)-80)/10}
  function sampleBase(pcode,organism){const base=pcode&&pcode!=='KZ'?260:4200;return base+(hash(`${pcode||'KZ'}:${organism}:n`)%Math.round(base*1.9))}
  function drugBase(organism,drug){const o=organisms[organism]||organisms.eco;return o.drugs[drug]??o.drugs[o.defaultDrug]??20}

  function profile(options={}){
    const pcode=options.pcode||'KZ';
    const organism=organisms[options.organism]?options.organism:'eco';
    const o=organisms[organism];
    const drug=o.drugs[options.drug]!=null?options.drug:o.defaultDrug;
    const material=materials[options.material]?options.material:'all';
    const period=String(options.period||'2026');
    const r=clamp(drugBase(organism,drug)+regionAdjustment(pcode)+(materialFactors[material]||0)+((hash(`${pcode}:${organism}:${drug}:${material}`)%31)-15)/10,.3,88.5);
    const i=clamp(3.2+(hash(`${organism}:${drug}:i`)%54)/10,1.5,11.5);
    const s=clamp(100-r-i,0,98);
    const materialPenalty=material==='all'?1:.54;
    const periodPenalty=period==='2026'?1:period.includes('12')?.88:period.includes('2024')?.76:1;
    const n=Math.max(28,Math.round(sampleBase(pcode,organism)*materialPenalty*periodPenalty*(.72+(hash(`${drug}:n`)%40)/100)));
    const mdr=clamp((r*.31)+(hash(`${organism}:${pcode}:mdr`)%60)/10-2,1,48);
    const trend=years.map((year,index)=>{
      const distance=years.length-1-index;
      const slope=1.05+(hash(`${organism}:${drug}:slope`)%95)/100;
      const noise=((hash(`${pcode}:${drug}:${year}`)%19)-9)/10;
      return Number(clamp(r-distance*slope+noise,.2,90).toFixed(1));
    });
    const materialRows=Object.keys(materialWeights).map(key=>{
      const local=clamp(r+(materialFactors[key]||0)+((hash(`${pcode}:${organism}:${drug}:${key}`)%25)-12)/10,.2,90);
      const count=Math.max(8,Math.round(n*materialWeights[key]));
      return {code:key,name:materials[key],resistance:Number(local.toFixed(1)),isolates:count};
    });
    const national=clamp(drugBase(organism,drug)+(materialFactors[material]||0),.3,88.5);
    const delta=Number((r-national).toFixed(1));
    const sampleQuality=n<80?'low':n<200?'moderate':'good';
    return {
      pcode,organism,drug,material,period,
      region:regionNames[pcode]||['Казахстан','Қазақстан','Kazakhstan'],organismInfo:o,
      resistance:Number(r.toFixed(1)),intermediate:Number(i.toFixed(1)),susceptible:Number(s.toFixed(1)),isolates:n,mdr:Number(mdr.toFixed(1)),
      trend:years.map((year,index)=>({year,value:trend[index]})),materials:materialRows,phenotypes:o.phenotypes,
      national:Number(national.toFixed(1)),delta,sampleQuality,
      demo:true
    };
  }

  function layerValue(pcode,layer='resistance'){
    const map={
      resistance:['eco','CRO','all'],esbl:['eco','CRO','all'],cre:['kpn','MEM','all'],mrsa:['sau','FOX','all'],
      vre:['sau','VAN','blood'],ndm:['kpn','MEM','blood'],oxa48:['kpn','MEM','all']
    };
    const spec=map[layer]||map.resistance;
    const p=profile({pcode:pcode||'KZ',organism:spec[0],drug:spec[1],material:spec[2]});
    if(layer==='esbl')return Number(clamp(p.resistance*.72,2,55).toFixed(1));
    if(layer==='vre')return Number(clamp(p.resistance*.55,0.2,30).toFixed(1));
    if(layer==='ndm')return Number(clamp(p.resistance*.52,0.2,28).toFixed(1));
    if(layer==='oxa48')return Number(clamp(p.resistance*.61,0.2,32).toFixed(1));
    return p.resistance;
  }

  function organismOptions(){return Object.values(organisms).map(o=>({code:o.code,name:o.name,short:o.short,defaultDrug:o.defaultDrug}))}
  function drugOptions(organism='eco'){const o=organisms[organism]||organisms.eco;return Object.keys(o.drugs).map(code=>({code,names:drugs[code]||[code,code,code]}))}
  function materialOptions(){return Object.entries(materials).map(([code,names])=>({code,names}))}

  window.AtlasDemoData={years,regionNames,organisms,drugs,materials,profile,layerValue,regionName,drugName,materialName,organismOptions,drugOptions,materialOptions,hash};
})();