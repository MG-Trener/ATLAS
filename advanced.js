(() => {
  if (window.__atlasAdvancedLoaded) return;
  window.__atlasAdvancedLoaded = true;

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = './advanced.css?v=20260916-2';
  document.head.appendChild(style);

  const qualityStyle = document.createElement('link');
  qualityStyle.rel = 'stylesheet';
  qualityStyle.href = './whonet-quality.css?v=20260916-2';
  document.head.appendChild(qualityStyle);

  const navButtons = [...document.querySelectorAll('.nav-item')];
  const sectionView = () => document.getElementById('atlas-section-view');
  const breadcrumb = () => document.querySelector('.breadcrumb');

  const organismDetails = {
    'Escherichia coli': { group:'Enterobacterales', gram:'Грамотрицательная', isolates:84215, r:28.6, mdr:8.7, phenotype:'ESBL', phenotypeRate:18.4, topMaterial:'Моча', materialRate:61, trend:4.1 },
    'Klebsiella pneumoniae': { group:'Enterobacterales', gram:'Грамотрицательная', isolates:47820, r:34.8, mdr:14.2, phenotype:'CRE', phenotypeRate:7.8, topMaterial:'Дыхательный материал', materialRate:38, trend:6.2 },
    'Staphylococcus aureus': { group:'Staphylococcaceae', gram:'Грамположительная', isolates:31540, r:19.7, mdr:9.1, phenotype:'MRSA', phenotypeRate:14.2, topMaterial:'Раны', materialRate:44, trend:1.6 },
    'Pseudomonas aeruginosa': { group:'Pseudomonadaceae', gram:'Грамотрицательная', isolates:22115, r:31.4, mdr:11.5, phenotype:'MDR', phenotypeRate:11.5, topMaterial:'Дыхательный материал', materialRate:46, trend:3.8 },
    'Acinetobacter baumannii': { group:'Moraxellaceae', gram:'Грамотрицательная', isolates:16780, r:49.3, mdr:36.4, phenotype:'CRAB', phenotypeRate:32.1, topMaterial:'ОРИТ', materialRate:58, trend:8.9 },
    'Enterococcus faecium': { group:'Enterococcaceae', gram:'Грамположительная', isolates:12460, r:27.9, mdr:12.6, phenotype:'VRE', phenotypeRate:9.6, topMaterial:'Моча', materialRate:42, trend:2.7 },
    'Streptococcus pneumoniae': { group:'Streptococcaceae', gram:'Грамположительная', isolates:10330, r:16.8, mdr:4.7, phenotype:'PNSP', phenotypeRate:7.1, topMaterial:'Дыхательный материал', materialRate:71, trend:-0.8 },
    'Salmonella spp.': { group:'Enterobacterales', gram:'Грамотрицательная', isolates:6940, r:13.6, mdr:4.3, phenotype:'MDR', phenotypeRate:4.3, topMaterial:'Кишечный материал', materialRate:87, trend:1.2 },
  };

  const drugDetails = {
    'Ампициллин': { code:'AMP', cls:'Пенициллины', tested:128430, r:68.7, trend:5.4, spectrum:'Enterobacterales', organisms:[['E. coli',68.7],['K. pneumoniae',74.2],['Enterococcus faecium',81.6],['Salmonella spp.',19.4]] },
    'Цефтриаксон': { code:'CRO', cls:'Цефалоспорины III поколения', tested:143820, r:28.6, trend:4.1, spectrum:'Грам− / Грам+', organisms:[['E. coli',28.6],['K. pneumoniae',41.2],['Salmonella spp.',8.7],['S. pneumoniae',6.4]] },
    'Ципрофлоксацин': { code:'CIP', cls:'Фторхинолоны', tested:119270, r:34.1, trend:3.7, spectrum:'Широкий', organisms:[['E. coli',34.1],['K. pneumoniae',38.9],['P. aeruginosa',27.6],['Salmonella spp.',12.3]] },
    'Амикацин': { code:'AMK', cls:'Аминогликозиды', tested:84310, r:6.2, trend:0.4, spectrum:'Грам−', organisms:[['E. coli',6.2],['K. pneumoniae',9.8],['P. aeruginosa',12.6],['A. baumannii',34.7]] },
    'Меропенем': { code:'MEM', cls:'Карбапенемы', tested:79180, r:1.3, trend:0.2, spectrum:'Широкий', organisms:[['E. coli',1.3],['K. pneumoniae',7.8],['P. aeruginosa',16.4],['A. baumannii',32.1]] },
    'Ванкомицин': { code:'VAN', cls:'Гликопептиды', tested:51280, r:4.8, trend:0.9, spectrum:'Грам+', organisms:[['S. aureus',0.6],['E. faecium',9.6],['E. faecalis',3.1],['S. pneumoniae',0.2]] },
    'Линезолид': { code:'LNZ', cls:'Оксазолидиноны', tested:28440, r:1.1, trend:0.1, spectrum:'Грам+', organisms:[['S. aureus',0.7],['E. faecium',1.8],['E. faecalis',0.9],['S. pneumoniae',0.3]] },
    'Колистин': { code:'CST', cls:'Полимиксины', tested:18620, r:3.7, trend:1.5, spectrum:'Грам−', organisms:[['K. pneumoniae',5.1],['P. aeruginosa',2.8],['A. baumannii',4.6],['E. coli',1.9]] },
  };

  const signals = [
    {severity:'Высокий', org:'Klebsiella pneumoniae', drug:'Карбапенемы', region:'Астана', delta:8.4, current:16.8, baseline:8.4, n:184, date:'16 сен 2026', note:'Рост доли карбапенем-резистентных изолятов за последние 30 дней.'},
    {severity:'Высокий', org:'Acinetobacter baumannii', drug:'Меропенем', region:'Алматы', delta:11.7, current:39.6, baseline:27.9, n:126, date:'15 сен 2026', note:'Выраженное увеличение CRAB-профиля в стационарных образцах.'},
    {severity:'Средний', org:'Escherichia coli', drug:'Цефтриаксон', region:'Караганда', delta:5.1, current:32.8, baseline:27.7, n:432, date:'15 сен 2026', note:'Устойчивый рост в трёх последовательных недельных окнах.'},
    {severity:'Средний', org:'Enterococcus faecium', drug:'Ванкомицин', region:'Павлодар', delta:3.8, current:11.2, baseline:7.4, n:91, date:'14 сен 2026', note:'Увеличение VRE выше демонстрационного порога наблюдения.'},
    {severity:'Низкий', org:'Pseudomonas aeruginosa', drug:'Амикацин', region:'Шымкент', delta:2.2, current:14.1, baseline:11.9, n:77, date:'13 сен 2026', note:'Небольшое отклонение, рекомендуется продолжить наблюдение.'},
  ];

  const fmt = (n) => Math.round(n).toLocaleString('ru-RU');
  const pct = (n) => Number(n).toFixed(1).replace('.', ',') + '%';
  const riskClass = (n) => n >= 40 ? 'adv-high' : n >= 20 ? 'adv-mid' : 'adv-low';
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));

  function showView(html, crumb) {
    const view = sectionView();
    if (!view) return;
    document.querySelectorAll('.content > *').forEach((node) => {
      if (node.id !== 'atlas-section-view' && !node.classList.contains('breadcrumb') && !node.classList.contains('footer')) node.style.display = 'none';
    });
    view.hidden = false;
    view.innerHTML = html;
    if (breadcrumb()) breadcrumb().innerHTML = crumb;
    window.scrollTo({top:0, behavior:'smooth'});
  }

  function backButton(section) {
    return `<button class="btn secondary adv-back" data-back-section="${section}">← Назад</button>`;
  }

  function organismAntibiotics(name) {
    const seed = [...name].reduce((a,c)=>a+c.charCodeAt(0),0);
    const names = ['Ампициллин','Цефтриаксон','Ципрофлоксацин','Триметоприм/сульфаметоксазол','Амикацин','Меропенем','Нитрофурантоин'];
    return names.map((drug,i) => {
      const value = Math.max(.5, Math.min(82, ((seed*(i+3))%610)/10 + (i===0?18:0)));
      return [drug, Number(value.toFixed(1)), 900 + ((seed*(i+7))%9800)];
    }).sort((a,b)=>b[1]-a[1]);
  }

  function openOrganismDetail(name) {
    const d = organismDetails[name] || organismDetails['Escherichia coli'];
    const abs = organismAntibiotics(name);
    showView(`
      <div class="adv-head"><div><span class="adv-kicker">Карточка микроорганизма</span><h1><i>${name}</i></h1><p>${d.group} · ${d.gram} · демонстрационный профиль Казахстана</p></div>${backButton('Микроорганизмы')}</div>
      <div class="adv-kpis">
        <article><span>Изолятов</span><strong>${fmt(d.isolates)}</strong><small>2026</small></article>
        <article><span>Средняя R</span><strong class="${riskClass(d.r)}">${pct(d.r)}</strong><small>↑ ${Math.abs(d.trend).toFixed(1).replace('.', ',')} п.п.</small></article>
        <article><span>MDR</span><strong>${pct(d.mdr)}</strong><small>множественная резистентность</small></article>
        <article><span>${d.phenotype}</span><strong>${pct(d.phenotypeRate)}</strong><small>ключевой фенотип</small></article>
        <article><span>Главный материал</span><strong>${d.topMaterial}</strong><small>${d.materialRate}% изолятов</small></article>
      </div>
      <div class="adv-grid-2">
        <section class="adv-panel"><div class="adv-panel-head"><div><h2>Антибиотикограмма</h2><p>Доля резистентных изолятов</p></div><button class="text-button">Экспорт CSV</button></div>
          <div class="adv-ab-table">${abs.map(([drug,r,n])=>`<div class="adv-ab-row"><span>${drug}</span><b class="${riskClass(r)}">${pct(r)}</b><i><u style="width:${Math.max(2,r)}%"></u></i><em>${fmt(n)}</em></div>`).join('')}</div>
        </section>
        <section class="adv-panel"><div class="adv-panel-head"><div><h2>Профиль изолятов</h2><p>Структура выборки</p></div></div>
          <div class="donut-wrap"><div class="fake-donut" style="--a:${d.materialRate};--b:${Math.max(8,70-d.materialRate)}"></div><div class="donut-legend"><span><i></i>${d.topMaterial}<b>${d.materialRate}%</b></span><span><i></i>Кровь<b>${Math.max(8,Math.round((100-d.materialRate)*.34))}%</b></span><span><i></i>Другие материалы<b>${100-d.materialRate-Math.max(8,Math.round((100-d.materialRate)*.34))}%</b></span></div></div>
          <div class="adv-note"><strong>Интерпретация</strong><p>Здесь будет автоматически формироваться краткое описание тренда на основе реальных данных WHONET и выбранного периода.</p></div>
        </section>
      </div>
      <section class="adv-panel"><div class="adv-panel-head"><div><h2>Динамика 2020–2026</h2><p>Средняя резистентность, %</p></div><div class="adv-chip">${name}</div></div>
        <div class="adv-line-chart"><div class="chart-bars">${[.68,.72,.76,.81,.86,.92,1].map((m,i)=>`<div><i style="height:${Math.min(90,d.r*m+20)}%"></i><span>${2020+i}</span></div>`).join('')}</div></div>
      </section>`, `AMR Atlas <span>›</span> Микроорганизмы <span>›</span> ${name}`);
  }

  function openDrugDetail(name) {
    const d = drugDetails[name] || drugDetails['Цефтриаксон'];
    showView(`
      <div class="adv-head"><div><span class="adv-kicker">Карточка антибиотика</span><div class="drug-title"><span>${d.code}</span><div><h1>${name}</h1><p>${d.cls} · ${d.spectrum}</p></div></div></div>${backButton('Антибиотики')}</div>
      <div class="adv-kpis">
        <article><span>AST результатов</span><strong>${fmt(d.tested)}</strong><small>в демо-наборе</small></article>
        <article><span>Средняя R</span><strong class="${riskClass(d.r)}">${pct(d.r)}</strong><small>по всем организмам</small></article>
        <article><span>Изменение</span><strong>↑ ${d.trend.toFixed(1).replace('.', ',')} п.п.</strong><small>к базовому периоду</small></article>
        <article><span>Класс</span><strong>${d.code}</strong><small>${d.cls}</small></article>
      </div>
      <div class="adv-grid-2">
        <section class="adv-panel"><div class="adv-panel-head"><div><h2>Резистентность по организмам</h2><p>${name}</p></div></div>
          <div class="org-bars">${d.organisms.map(([org,r])=>`<button data-open-organism="${org.replace('E. coli','Escherichia coli').replace('K. pneumoniae','Klebsiella pneumoniae').replace('P. aeruginosa','Pseudomonas aeruginosa').replace('A. baumannii','Acinetobacter baumannii').replace('S. aureus','Staphylococcus aureus').replace('E. faecium','Enterococcus faecium').replace('S. pneumoniae','Streptococcus pneumoniae')}"><span>${org}</span><i><u style="width:${Math.max(2,r)}%"></u></i><b class="${riskClass(r)}">${pct(r)}</b></button>`).join('')}</div>
        </section>
        <section class="adv-panel"><div class="adv-panel-head"><div><h2>AST и breakpoint</h2><p>Будущий интерпретационный слой</p></div></div>
          <div class="method-stack"><div><span>Стандарт</span><strong>EUCAST / CLSI</strong></div><div><span>Версия</span><strong>хранится с результатом</strong></div><div><span>Исходное значение</span><strong>MIC / zone diameter</strong></div><div><span>Категория</span><strong>S / I / R</strong></div></div>
          <div class="adv-note"><strong>Важно</strong><p>В рабочей версии карточка будет разделять исходное измерение AST и рассчитанную категорию интерпретации.</p></div>
        </section>
      </div>`, `AMR Atlas <span>›</span> Антибиотики <span>›</span> ${name}`);
  }

  function renderRadarAdvanced() {
    const rows = signals.map((s,i)=>`<article class="radar-row" data-radar-index="${i}"><span class="sev ${s.severity==='Высокий'?'sev-high':s.severity==='Средний'?'sev-mid':'sev-low'}">${s.severity}</span><div><strong>${s.org}</strong><small>${s.drug}</small></div><div><strong>${s.region}</strong><small>${s.date}</small></div><div><strong>+${s.delta.toFixed(1).replace('.', ',')} п.п.</strong><small>${pct(s.current)} сейчас</small></div><button>Подробнее →</button></article>`).join('');
    showView(`
      <div class="adv-head"><div><span class="adv-kicker">Раннее предупреждение</span><h1>AMR Radar</h1><p>Автоматические сигналы необычных изменений в структуре резистентности.</p></div><div class="radar-live"><i></i>Мониторинг активен</div></div>
      <div class="radar-summary"><article><strong>5</strong><span>активных сигналов</span></article><article><strong>2</strong><span>высокого приоритета</span></article><article><strong>4</strong><span>региона</span></article><article><strong>14:37</strong><span>последний анализ</span></article></div>
      <div class="radar-toolbar"><div class="segmented"><button class="active">Все</button><button>Высокие</button><button>Средние</button></div><select><option>Последние 30 дней</option><option>Последние 7 дней</option></select></div>
      <section class="adv-panel"><div class="radar-head"><span>Приоритет</span><span>Организм / препарат</span><span>Регион</span><span>Изменение</span><span></span></div>${rows}</section>
      <div id="radar-detail"></div>`, `AMR Atlas <span>›</span> AMR Radar`);
    sectionView()?.querySelectorAll('[data-radar-index]').forEach(row => row.addEventListener('click', () => {
      const s = signals[Number(row.dataset.radarIndex)];
      const host = sectionView().querySelector('#radar-detail');
      host.innerHTML = `<section class="adv-panel radar-detail"><div class="adv-panel-head"><div><span class="sev ${s.severity==='Высокий'?'sev-high':s.severity==='Средний'?'sev-mid':'sev-low'}">${s.severity}</span><h2>${s.org} · ${s.drug}</h2><p>${s.region} · ${s.date}</p></div><button id="close-radar">×</button></div><div class="radar-detail-grid"><div><span>Текущий уровень</span><strong>${pct(s.current)}</strong></div><div><span>Базовый уровень</span><strong>${pct(s.baseline)}</strong></div><div><span>Изменение</span><strong>+${s.delta.toFixed(1).replace('.', ',')} п.п.</strong></div><div><span>Изолятов</span><strong>${fmt(s.n)}</strong></div></div><p>${s.note}</p><div class="adv-note"><strong>Рабочий процесс</strong><p>В будущем сигнал можно будет подтвердить, отклонить, назначить ответственному эпидемиологу и добавить комментарий.</p></div></section>`;
      host.querySelector('#close-radar')?.addEventListener('click', ()=> host.innerHTML='');
      host.scrollIntoView({behavior:'smooth', block:'center'});
    }));
  }

  function renderMethodsAdvanced() {
    showView(`
      <div class="adv-head"><div><span class="adv-kicker">Данные и методы</span><h1>Импорт WHONET</h1><p>Предварительная проверка лабораторной выгрузки до подключения постоянного хранилища.</p></div><div class="adv-chip">Frontend-only</div></div>
      <div class="pipeline"><div><b>1</b><strong>WHONET / BacLink</strong><small>CSV, TXT, TSV</small></div><i>→</i><div><b>2</b><strong>Проверка структуры</strong><small>колонки и типы</small></div><i>→</i><div><b>3</b><strong>Нормализация</strong><small>организм / материал / AST</small></div><i>→</i><div><b>4</b><strong>ATLAS</strong><small>пока без сохранения</small></div></div>
      <div class="adv-grid-2 whonet-grid">
        <section class="adv-panel"><div class="adv-panel-head"><div><h2>Загрузить файл</h2><p>Обработка выполняется только локально в браузере</p></div></div>
          <label class="drop-zone" id="whonet-drop"><input id="whonet-file" type="file" accept=".csv,.txt,.tsv,text/csv,text/plain"><span>⇧</span><strong>Выберите WHONET/CSV файл</strong><small>или перетащите его сюда</small></label>
          <button class="btn secondary full-button" id="whonet-demo">Использовать демонстрационный файл</button>
          <div class="privacy-note">🔒 Файл не загружается на сервер и не покидает устройство.</div>
        </section>
        <section class="adv-panel" id="whonet-status"><div class="empty-check"><span>✓</span><strong>Ожидание файла</strong><p>После выбора здесь появятся количество записей, найденные WHONET-поля и предупреждения.</p></div></section>
      </div>
      <section class="adv-panel preview-panel" id="whonet-preview" hidden></section>
      <section class="adv-panel"><div class="adv-panel-head"><div><h2>Что будет проверяться</h2><p>Минимальный набор для первой версии импортера</p></div></div><div class="check-grid"><div><b>Организм</b><span>ORGANISM / ORG</span></div><div><b>Дата образца</b><span>SPEC_DATE</span></div><div><b>Материал</b><span>SPEC_TYPE</span></div><div><b>AST</b><span>MIC / zone / S-I-R</span></div><div><b>Лаборатория</b><span>LABORATORY</span></div><div><b>Пациент</b><span>локальный ID → hash позже</span></div></div></section>`, `AMR Atlas <span>›</span> Данные и методы <span>›</span> Импорт WHONET`);
    wireWhonetImporter();
  }

  function detectDelimiter(line) {
    const candidates = ['\t',';',','];
    return candidates.sort((a,b)=>(line.split(b).length-line.split(a).length))[0];
  }
  function parseDelimitedLine(line, delimiter) {
    const out=[]; let cur=''; let quoted=false;
    for (let i=0;i<line.length;i++) {
      const ch=line[i];
      if (ch==='"') { if (quoted && line[i+1]==='"') { cur+='"'; i++; } else quoted=!quoted; }
      else if (ch===delimiter && !quoted) { out.push(cur.trim()); cur=''; }
      else cur+=ch;
    }
    out.push(cur.trim()); return out;
  }
  function analyzeText(text, fileName='demo-whonet.csv') {
    const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/).filter(l=>l.trim()).slice(0,5001);
    if (lines.length<2) throw new Error('В файле нет строк данных');
    const delimiter=detectDelimiter(lines[0]);
    const headers=parseDelimitedLine(lines[0], delimiter);
    const rows=lines.slice(1).map(line=>parseDelimitedLine(line,delimiter));
    const upper=headers.map(h=>h.toUpperCase().replace(/\s+/g,'_'));
    const find=(cands)=>{ const i=upper.findIndex(h=>cands.some(c=>h===c || h.includes(c))); return i>=0?headers[i]:null; };
    const patient=find(['PATIENT_ID','PATIENT','PAT_ID']);
    const organism=find(['ORGANISM','ORG','ORG_NAME']);
    const date=find(['SPEC_DATE','DATE_SPEC','SPECIMEN_DATE']);
    const material=find(['SPEC_TYPE','SPECIMEN','SAMPLE_TYPE']);
    const lab=find(['LABORATORY','LAB','LAB_ID']);
    const ast=headers.filter((h,i)=>/(_NM|_ND|_MIC|_ZONE|_SIR|_INT$|AMP|CRO|CIP|AMK|MEM|VAN|LNZ|CST)/i.test(upper[i]));
    const warnings=[];
    if(!organism) warnings.push('Не найдена колонка микроорганизма');
    if(!date) warnings.push('Не найдена дата образца');
    if(!material) warnings.push('Не найден тип материала');
    if(ast.length===0) warnings.push('Не обнаружены AST-колонки');
    const indexOf=(header)=>header ? headers.indexOf(header) : -1;
    const indexes={patient:indexOf(patient),organism:indexOf(organism),date:indexOf(date),material:indexOf(material),lab:indexOf(lab)};
    const knownOrganisms=new Set(['ESCHERICHIA COLI','E. COLI','ECOL','KLEBSIELLA PNEUMONIAE','K. PNEUMONIAE','KPNE','STAPHYLOCOCCUS AUREUS','S. AUREUS','SAUR','PSEUDOMONAS AERUGINOSA','P. AERUGINOSA','PAER','ACINETOBACTER BAUMANNII','A. BAUMANNII','ABAUM','ENTEROCOCCUS FAECIUM','E. FAECIUM','EFAE','STREPTOCOCCUS PNEUMONIAE','S. PNEUMONIAE','SPNE','SALMONELLA SPP.','SALMONELLA']);
    const knownMaterials=new Set(['URINE','BLOOD','SPUTUM','RESPIRATORY','WOUND','STOOL','CSF','OTHER','МОЧА','КРОВЬ','МОКРОТА','РАНА','КАЛ','ЛИКВОР','ДРУГОЕ']);
    const sirColumns=ast.filter((header)=>/(_NM|_SIR|_INT)$/i.test(header));
    const measureColumns=ast.filter((header)=>/(_MIC|_ZONE|_ND)$/i.test(header));
    const columnAt=(row,index)=>index >= 0 ? String(row[index] ?? '').trim() : '';
    const normalizedDate=(value)=>{
      const match=String(value).trim().match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$|^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
      if(!match) return null;
      const year=Number(match[1]||match[6]), month=Number(match[2]||match[5]), day=Number(match[3]||match[4]);
      const parsed=new Date(Date.UTC(year,month-1,day));
      return parsed.getUTCFullYear()===year && parsed.getUTCMonth()===month-1 && parsed.getUTCDate()===day ? `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}` : null;
    };
    const issueMap={duplicate:[],unknownOrganism:[],unknownMaterial:[],invalidDate:[],invalidSir:[],sirWithoutMeasurement:[],missingRequired:[]};
    const rowIssues=rows.map(()=>[]);
    const seen=new Map();
    rows.forEach((row,rowIndex)=>{
      const displayRow=rowIndex+2;
      const org=columnAt(row,indexes.organism);
      const specimen=columnAt(row,indexes.material);
      const specimenDate=columnAt(row,indexes.date);
      const laboratory=columnAt(row,indexes.lab);
      const patientId=columnAt(row,indexes.patient);
      [['organism',org],['date',specimenDate],['material',specimen],['lab',laboratory]].forEach(([field,value])=>{
        if(indexes[field] >= 0 && !value) { issueMap.missingRequired.push(displayRow); rowIssues[rowIndex].push('Пустое обязательное поле'); }
      });
      if(org && !knownOrganisms.has(org.toUpperCase())) { issueMap.unknownOrganism.push(displayRow); rowIssues[rowIndex].push(`Неизвестный организм: ${org}`); }
      if(specimen && !knownMaterials.has(specimen.toUpperCase())) { issueMap.unknownMaterial.push(displayRow); rowIssues[rowIndex].push(`Неизвестный материал: ${specimen}`); }
      if(specimenDate && !normalizedDate(specimenDate)) { issueMap.invalidDate.push(displayRow); rowIssues[rowIndex].push(`Некорректная дата: ${specimenDate}`); }
      const sirValues=sirColumns.map((header)=>({header,value:columnAt(row,headers.indexOf(header)).toUpperCase()})).filter(item=>item.value);
      const invalid=sirValues.filter(item=>!['S','I','R','SDD','NS'].includes(item.value));
      if(invalid.length) { issueMap.invalidSir.push(displayRow); rowIssues[rowIndex].push(`Некорректный S/I/R: ${invalid.map(item=>item.value).join(', ')}`); }
      const hasMeasurement=measureColumns.some((header)=>columnAt(row,headers.indexOf(header)));
      if(sirValues.length && !hasMeasurement) { issueMap.sirWithoutMeasurement.push(displayRow); rowIssues[rowIndex].push('S/I/R без MIC или диаметра зоны'); }
      const duplicateKey=[patientId,specimenDate,org,specimen,laboratory].map(value=>value.toUpperCase()).join('|');
      if(patientId && specimenDate && org) {
        if(seen.has(duplicateKey)) { issueMap.duplicate.push(displayRow); rowIssues[rowIndex].push(`Возможный дубликат строки ${seen.get(duplicateKey)}`); }
        else seen.set(duplicateKey,displayRow);
      }
    });
    const labs=new Map();
    rows.forEach((row,rowIndex)=>{
      const name=columnAt(row,indexes.lab)||'Не указана';
      const current=labs.get(name)||{name,rows:0,issues:0};
      current.rows+=1;
      if(rowIssues[rowIndex].length) current.issues+=1;
      labs.set(name,current);
    });
    const issueCounts=Object.fromEntries(Object.entries(issueMap).map(([key,value])=>[key,value.length]));
    const affectedRows=rowIssues.filter(items=>items.length).length;
    const blockers=issueCounts.missingRequired+issueCounts.invalidDate+issueCounts.invalidSir;
    const totalChecks=Math.max(1,rows.length*5);
    const qualityScore=Math.max(0,Math.round(100-(affectedRows/Math.max(1,rows.length))*55-(blockers/totalChecks)*45));
    const readiness=blockers>0?'blocked':affectedRows>0?'review':'ready';
    return {fileName, delimiter:delimiter==='\t'?'TAB':delimiter, headers, rows, patient, organism, date, material, lab, ast, warnings, issueMap, issueCounts, rowIssues, affectedRows, blockers, qualityScore, readiness, labs:[...labs.values()].sort((a,b)=>b.rows-a.rows)};
  }
  function renderWhonetAnalysis(a) {
    const status=sectionView()?.querySelector('#whonet-status');
    const preview=sectionView()?.querySelector('#whonet-preview');
    if(!status||!preview) return;
    const ok=a.warnings.length===0;
    const readyLabel=a.readiness==='ready'?'готов к нормализации':a.readiness==='review'?'нужна проверка':'есть блокирующие ошибки';
    status.innerHTML=`<div class="file-status ${ok?'ok':'warn'}"><span>${ok?'✓':'!'}</span><div><strong>${escapeHtml(a.fileName)}</strong><p>${fmt(a.rows.length)} строк · ${a.headers.length} колонок · разделитель ${escapeHtml(a.delimiter)}</p></div></div><div class="detected-grid"><div><span>Организм</span><b>${escapeHtml(a.organism||'не найден')}</b></div><div><span>Дата</span><b>${escapeHtml(a.date||'не найдена')}</b></div><div><span>Материал</span><b>${escapeHtml(a.material||'не найден')}</b></div><div><span>Лаборатория</span><b>${escapeHtml(a.lab||'не найдена')}</b></div><div><span>AST колонки</span><b>${a.ast.length}</b></div><div><span>Статус</span><b>${readyLabel}</b></div></div>${a.warnings.length?`<div class="warning-list">${a.warnings.map(w=>`<p>⚠ ${escapeHtml(w)}</p>`).join('')}</div>`:''}`;
    const visible=a.headers.slice(0,8);
    preview.hidden=false;
    const issueDefinitions=[['missingRequired','Пустые обязательные поля','Блокирует'],['invalidDate','Некорректные даты','Блокирует'],['invalidSir','Некорректные S/I/R','Блокирует'],['duplicate','Возможные дубликаты','Проверить'],['unknownOrganism','Неизвестные организмы','Сопоставить'],['unknownMaterial','Неизвестные материалы','Сопоставить'],['sirWithoutMeasurement','S/I/R без MIC/zone','Проверить']];
    const issues=issueDefinitions.filter(([key])=>a.issueCounts[key]>0);
    const readinessText=a.readiness==='ready'?'Файл готов к нормализации':a.readiness==='review'?'Файл требует проверки':'Файл пока не готов к импорту';
    const readinessHint=a.readiness==='ready'?'Структура и записи прошли локальную проверку. Сохранение в БД отключено на этапе прототипа.':a.readiness==='review'?'Блокирующих ошибок нет, но перед импортом нужно проверить предупреждения.':'Исправьте блокирующие ошибки и повторите проверку.';
    preview.innerHTML=`<div class="quality-overview"><article><span>Индекс качества</span><strong>${a.qualityScore}%</strong><i><u style="width:${a.qualityScore}%"></u></i></article><article><span>Строк с замечаниями</span><strong>${fmt(a.affectedRows)}</strong><small>из ${fmt(a.rows.length)}</small></article><article><span>Блокирующих ошибок</span><strong class="${a.blockers?'adv-high':'adv-low'}">${fmt(a.blockers)}</strong><small>дата, S/I/R, обязательные поля</small></article><article><span>Лабораторий</span><strong>${fmt(a.labs.length)}</strong><small>в загруженном файле</small></article></div>
      <div class="quality-layout"><div><div class="adv-panel-head"><div><h2>Отчёт проверки</h2><p>Автоматические проверки строк до нормализации</p></div><span class="quality-readiness ${a.readiness}">${readyLabel}</span></div><div class="quality-issues">${issues.length?issues.map(([key,label,action])=>`<button type="button" data-quality-issue="${key}"><span>${escapeHtml(label)}</span><b>${fmt(a.issueCounts[key])}</b><em>${action}</em></button>`).join(''):'<div class="quality-empty">✓ Замечаний по записям не найдено</div>'}</div></div>
      <aside class="lab-summary"><div class="adv-panel-head"><div><h2>Лаборатории</h2><p>Объём и доля строк с замечаниями</p></div></div>${a.labs.slice(0,6).map(lab=>`<div><span><strong>${escapeHtml(lab.name)}</strong><small>${fmt(lab.rows)} строк</small></span><b class="${lab.issues?'adv-mid':'adv-low'}">${Math.round(lab.issues/lab.rows*100)}%</b></div>`).join('')}</aside></div>
      <div class="quality-detail" id="quality-detail" hidden></div>
      <div class="adv-panel-head preview-heading"><div><h2>Предпросмотр</h2><p>Первые ${Math.min(6,a.rows.length)} записей · максимум 8 колонок</p></div><button class="btn secondary" id="clear-whonet">Очистить</button></div><div class="preview-scroll"><table><thead><tr><th>Статус</th>${visible.map(h=>`<th>${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${a.rows.slice(0,6).map((r,rowIndex)=>`<tr class="${a.rowIssues[rowIndex]?.length?'row-warning':''}"><td><span class="row-state">${a.rowIssues[rowIndex]?.length?'!':'✓'}</span></td>${visible.map((h,i)=>`<td>${escapeHtml(r[i]??'')}</td>`).join('')}</tr>`).join('')}</tbody></table></div><div class="import-ready ${a.readiness}"><span>${a.readiness==='ready'?'✓':'!'}</span><div><strong>${readinessText}</strong><p>${readinessHint}</p></div><button class="btn primary" disabled>Импортировать в БД — позже</button></div>`;
    preview.querySelector('#clear-whonet')?.addEventListener('click',()=>renderMethodsAdvanced());
    preview.querySelectorAll('[data-quality-issue]').forEach(button=>button.addEventListener('click',()=>{
      const key=button.dataset.qualityIssue;
      const def=issueDefinitions.find(item=>item[0]===key);
      const detail=preview.querySelector('#quality-detail');
      const matching=a.rowIssues.map((items,index)=>({items,index})).filter(({index})=>a.issueMap[key].includes(index+2)).slice(0,12);
      detail.hidden=false;
      detail.innerHTML=`<div><strong>${escapeHtml(def?.[1]||'Замечания')}</strong><span>Показано ${matching.length} из ${a.issueCounts[key]} строк</span></div>${matching.map(({items,index})=>`<p><b>Строка ${index+2}</b><span>${items.map(escapeHtml).join(' · ')}</span></p>`).join('')}`;
      detail.scrollIntoView({behavior:'smooth',block:'nearest'});
    }));
  }
  function wireWhonetImporter() {
    const input=sectionView()?.querySelector('#whonet-file');
    const demo=sectionView()?.querySelector('#whonet-demo');
    const drop=sectionView()?.querySelector('#whonet-drop');
    const handleFile=(file)=>{
      if(!file) return;
      const reader=new FileReader();
      reader.onload=()=>{try{renderWhonetAnalysis(analyzeText(String(reader.result||''),file.name));}catch(e){alert('Не удалось прочитать файл: '+e.message);}};
      reader.readAsText(file);
    };
    input?.addEventListener('change',()=>handleFile(input.files?.[0]));
    ['dragenter','dragover'].forEach(evt=>drop?.addEventListener(evt,e=>{e.preventDefault();drop.classList.add('drag');}));
    ['dragleave','drop'].forEach(evt=>drop?.addEventListener(evt,e=>{e.preventDefault();drop.classList.remove('drag');}));
    drop?.addEventListener('drop',e=>handleFile(e.dataTransfer?.files?.[0]));
    demo?.addEventListener('click',()=>{
      const text='COUNTRY_A,LABORATORY,PATIENT_ID,SPEC_DATE,SPEC_TYPE,ORGANISM,AMP_NM,CRO_NM,CIP_NM,AMK_NM,MEM_NM\nKAZ,AST-LAB-01,P001,2026-09-01,Urine,Escherichia coli,R,R,R,S,S\nKAZ,AST-LAB-01,P002,2026-09-01,Blood,Klebsiella pneumoniae,R,R,I,S,S\nKAZ,KAR-LAB-02,P003,2026-09-02,Urine,Escherichia coli,R,I,R,S,S\nKAZ,ALA-LAB-03,P004,2026-09-02,Sputum,Pseudomonas aeruginosa,,R,R,I,I\nKAZ,AST-LAB-01,P005,2026-09-03,Blood,Staphylococcus aureus,,,,S,\nKAZ,AST-LAB-01,P001,2026-09-01,Urine,Escherichia coli,R,R,R,S,S\nKAZ,KAR-LAB-02,P006,2026-13-04,Unknown sample,Unknown bacillus,X,R,,,S';
      renderWhonetAnalysis(analyzeText(text,'WHONET_demo_2026.csv'));
    });
  }

  document.addEventListener('click', (event) => {
    const org=event.target.closest?.('[data-organism]');
    if(org && org.dataset.organism) { event.preventDefault(); event.stopImmediatePropagation(); openOrganismDetail(org.dataset.organism); return; }
    const drug=event.target.closest?.('[data-antibiotic]');
    if(drug && drug.dataset.antibiotic) { event.preventDefault(); event.stopImmediatePropagation(); openDrugDetail(drug.dataset.antibiotic); return; }
    const linked=event.target.closest?.('[data-open-organism]');
    if(linked) { event.preventDefault(); openOrganismDetail(linked.dataset.openOrganism); return; }
    const back=event.target.closest?.('[data-back-section]');
    if(back) { navButtons.find(b=>b.dataset.section===back.dataset.backSection)?.click(); return; }
  }, true);

  navButtons.forEach(button => button.addEventListener('click', () => {
    const section=button.dataset.section;
    if(section==='Сигналы') setTimeout(renderRadarAdvanced,0);
    if(section==='Данные и методы') setTimeout(renderMethodsAdvanced,0);
  }));
})();
