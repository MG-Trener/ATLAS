(() => {
  const content = document.querySelector('.content');
  const navButtons = [...document.querySelectorAll('.nav-item')];
  if (!content || !navButtons.length) return;

  const overviewNodes = [...content.children].filter((node) => !node.classList.contains('breadcrumb') && !node.classList.contains('footer'));
  const breadcrumb = content.querySelector('.breadcrumb');
  const footer = content.querySelector('.footer');
  const mapPanel = document.getElementById('map-section');
  const mapHome = mapPanel ? { parent: mapPanel.parentNode, next: mapPanel.nextSibling } : null;

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = './sections.css';
  document.head.appendChild(style);

  const view = document.createElement('section');
  view.id = 'atlas-section-view';
  view.className = 'atlas-section-view';
  view.hidden = true;
  if (footer) content.insertBefore(view, footer);
  else content.appendChild(view);

  const organisms = [
    { name: 'Escherichia coli', gram: 'Грам−', group: 'Enterobacterales', isolates: 84215, resistance: 28.6, trend: 4.1, phenotype: 'ESBL 18,4%', material: 'Моча 61%' },
    { name: 'Klebsiella pneumoniae', gram: 'Грам−', group: 'Enterobacterales', isolates: 47820, resistance: 34.8, trend: 6.2, phenotype: 'CRE 7,8%', material: 'Дыхательные 38%' },
    { name: 'Staphylococcus aureus', gram: 'Грам+', group: 'Staphylococcaceae', isolates: 31540, resistance: 19.7, trend: 1.6, phenotype: 'MRSA 14,2%', material: 'Раны 44%' },
    { name: 'Pseudomonas aeruginosa', gram: 'Грам−', group: 'Pseudomonadaceae', isolates: 22115, resistance: 31.4, trend: 3.8, phenotype: 'MDR 11,5%', material: 'Дыхательные 46%' },
    { name: 'Acinetobacter baumannii', gram: 'Грам−', group: 'Moraxellaceae', isolates: 16780, resistance: 49.3, trend: 8.9, phenotype: 'CRAB 32,1%', material: 'ОРИТ 58%' },
    { name: 'Enterococcus faecium', gram: 'Грам+', group: 'Enterococcaceae', isolates: 12460, resistance: 27.9, trend: 2.7, phenotype: 'VRE 9,6%', material: 'Моча 42%' },
    { name: 'Streptococcus pneumoniae', gram: 'Грам+', group: 'Streptococcaceae', isolates: 10330, resistance: 16.8, trend: -0.8, phenotype: 'PNSP 7,1%', material: 'Дыхательные 71%' },
    { name: 'Salmonella spp.', gram: 'Грам−', group: 'Enterobacterales', isolates: 6940, resistance: 13.6, trend: 1.2, phenotype: 'MDR 4,3%', material: 'Кишечные 87%' },
  ];

  const antibiotics = [
    { name: 'Ампициллин', code: 'AMP', cls: 'Пенициллины', tested: 128430, resistance: 68.7, trend: 5.4, spectrum: 'Enterobacterales' },
    { name: 'Цефтриаксон', code: 'CRO', cls: 'Цефалоспорины III', tested: 143820, resistance: 28.6, trend: 4.1, spectrum: 'Грам− / Грам+' },
    { name: 'Ципрофлоксацин', code: 'CIP', cls: 'Фторхинолоны', tested: 119270, resistance: 34.1, trend: 3.7, spectrum: 'Широкий' },
    { name: 'Амикацин', code: 'AMK', cls: 'Аминогликозиды', tested: 84310, resistance: 6.2, trend: 0.4, spectrum: 'Грам−' },
    { name: 'Меропенем', code: 'MEM', cls: 'Карбапенемы', tested: 79180, resistance: 1.3, trend: 0.2, spectrum: 'Широкий' },
    { name: 'Ванкомицин', code: 'VAN', cls: 'Гликопептиды', tested: 51280, resistance: 4.8, trend: 0.9, spectrum: 'Грам+' },
    { name: 'Линезолид', code: 'LNZ', cls: 'Оксазолидиноны', tested: 28440, resistance: 1.1, trend: 0.1, spectrum: 'Грам+' },
    { name: 'Колистин', code: 'CST', cls: 'Полимиксины', tested: 18620, resistance: 3.7, trend: 1.5, spectrum: 'Грам−' },
  ];

  const signals = [
    ['Высокий', 'Klebsiella pneumoniae', 'Карбапенемы', 'Астана', '+8,4 п.п.', '16 сен 2026'],
    ['Высокий', 'Acinetobacter baumannii', 'Меропенем', 'Алматы', '+11,7 п.п.', '15 сен 2026'],
    ['Средний', 'Escherichia coli', 'Цефтриаксон', 'Караганда', '+5,1 п.п.', '15 сен 2026'],
    ['Средний', 'Enterococcus faecium', 'Ванкомицин', 'Павлодар', '+3,8 п.п.', '14 сен 2026'],
    ['Низкий', 'Pseudomonas aeruginosa', 'Амикацин', 'Шымкент', '+2,2 п.п.', '13 сен 2026'],
  ];

  const fmt = (n) => Math.round(n).toLocaleString('ru-RU');
  const pct = (n) => Number(n).toFixed(1).replace('.', ',') + '%';
  const colorClass = (n) => n >= 40 ? 'risk-high' : n >= 25 ? 'risk-mid' : 'risk-low';

  function restoreMap() {
    if (!mapPanel || !mapHome || mapPanel.parentNode === mapHome.parent) return;
    if (mapHome.next && mapHome.next.parentNode === mapHome.parent) mapHome.parent.insertBefore(mapPanel, mapHome.next);
    else mapHome.parent.appendChild(mapPanel);
    mapPanel.classList.remove('map-expanded');
  }

  function showOverview() {
    restoreMap();
    view.hidden = true;
    overviewNodes.forEach((node) => { node.style.display = ''; });
    if (breadcrumb) breadcrumb.innerHTML = 'Главная <span>›</span> Микроорганизмы <span>›</span> Escherichia coli';
  }

  function showSection(name) {
    if (name === 'Обзор') return showOverview();
    overviewNodes.forEach((node) => { node.style.display = 'none'; });
    view.hidden = false;
    view.innerHTML = '';
    restoreMap();
    if (breadcrumb) breadcrumb.innerHTML = `AMR Atlas <span>›</span> ${name}`;

    if (name === 'Микроорганизмы') renderOrganisms();
    else if (name === 'Антибиотики') renderAntibiotics();
    else if (name === 'Карта') renderMap();
    else if (name === 'Аналитика') renderAnalytics();
    else if (name === 'Сравнение') renderComparison();
    else if (name === 'Сигналы') renderSignals();
    else if (name === 'Данные и методы') renderMethods();
    else if (name === 'Публикации') renderPublications();
  }

  function sectionHead(title, subtitle, action = '') {
    return `<div class="section-head"><div><span class="section-kicker">AMR Atlas</span><h1>${title}</h1><p>${subtitle}</p></div>${action ? `<div class="section-actions">${action}</div>` : ''}</div>`;
  }

  function renderOrganisms() {
    view.innerHTML = sectionHead('Микроорганизмы', 'Сводный каталог организмов с текущими показателями резистентности и ключевыми фенотипами.', '<button class="btn secondary">↓ Экспорт</button>') + `
      <div class="section-toolbar"><div class="local-search">⌕ <input id="organism-search" placeholder="Найти микроорганизм…"></div><div class="segmented"><button class="active" data-gram="all">Все</button><button data-gram="Грам−">Грам−</button><button data-gram="Грам+">Грам+</button></div></div>
      <div class="catalog-layout"><div class="catalog-list" id="organism-list"></div><aside class="insight-card"><span>Наибольший рост</span><strong>Acinetobacter baumannii</strong><b>+8,9 п.п.</b><p>Демонстрационный сигнал роста средней резистентности за период.</p><hr><span>Наибольший объём</span><strong>Escherichia coli</strong><b>84 215 изолятов</b></aside></div>`;

    const list = view.querySelector('#organism-list');
    const search = view.querySelector('#organism-search');
    let gram = 'all';
    const draw = () => {
      const q = (search.value || '').toLowerCase();
      const rows = organisms.filter((o) => (gram === 'all' || o.gram === gram) && o.name.toLowerCase().includes(q));
      list.innerHTML = `<div class="catalog-head"><span>Микроорганизм</span><span>Изоляты</span><span>Средняя R</span><span>Тренд</span><span>Фенотип</span><span></span></div>` + rows.map((o) => `
        <button class="catalog-row" data-organism="${o.name}"><span><i class="micro-dot ${o.gram === 'Грам−' ? 'neg' : 'pos'}"></i><strong>${o.name}</strong><small>${o.group} · ${o.gram}</small></span><span><b>${fmt(o.isolates)}</b><small>${o.material}</small></span><span><b class="${colorClass(o.resistance)}">${pct(o.resistance)}</b></span><span><b class="${o.trend > 3 ? 'trend-bad' : 'trend-neutral'}">${o.trend >= 0 ? '↑' : '↓'} ${Math.abs(o.trend).toFixed(1).replace('.', ',')} п.п.</b></span><span><b>${o.phenotype}</b></span><span>Открыть →</span></button>`).join('');
      list.querySelectorAll('[data-organism]').forEach((row) => row.addEventListener('click', () => openOrganism(row.dataset.organism)));
    };
    search.addEventListener('input', draw);
    view.querySelectorAll('[data-gram]').forEach((button) => button.addEventListener('click', () => {
      view.querySelectorAll('[data-gram]').forEach((b) => b.classList.remove('active'));
      button.classList.add('active'); gram = button.dataset.gram; draw();
    }));
    draw();
  }

  function openOrganism(name) {
    const select = document.querySelector('.filters label:first-child select');
    if (select) {
      if (![...select.options].some((o) => o.value === name)) select.add(new Option(name, name));
      select.value = name;
      select.dispatchEvent(new Event('change'));
    }
    navButtons.find((b) => b.dataset.section === 'Обзор')?.click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderAntibiotics() {
    view.innerHTML = sectionHead('Антибиотики', 'Профиль тестирования и резистентности по антибактериальным препаратам.', '<button class="btn secondary">Справочник EUCAST</button>') + `
      <div class="metric-strip"><div><span>Препаратов в каталоге</span><strong>42</strong></div><div><span>AST результатов</span><strong>628 410</strong></div><div><span>Средняя R</span><strong>24,8%</strong></div><div><span>Сигналов роста</span><strong>7</strong></div></div>
      <div class="antibiotic-grid">${antibiotics.map((a) => `<button class="antibiotic-card" data-antibiotic="${a.name}"><div class="drug-head"><span>${a.code}</span><div><strong>${a.name}</strong><small>${a.cls}</small></div></div><div class="drug-metric"><span>Резистентность</span><b class="${colorClass(a.resistance)}">${pct(a.resistance)}</b></div><div class="drug-bar"><i style="width:${Math.min(100,a.resistance)}%"></i></div><div class="drug-foot"><span>${fmt(a.tested)} тестов</span><span>↑ ${a.trend.toFixed(1).replace('.', ',')} п.п.</span></div></button>`).join('')}</div>`;
    view.querySelectorAll('[data-antibiotic]').forEach((card) => card.addEventListener('click', () => {
      const mapSelect = document.getElementById('map-antibiotic');
      const drug = card.dataset.antibiotic;
      if (mapSelect && [...mapSelect.options].some((o) => o.value === drug)) {
        mapSelect.value = drug; mapSelect.dispatchEvent(new Event('change'));
      }
      navButtons.find((b) => b.dataset.section === 'Карта')?.click();
    }));
  }

  function renderMap() {
    view.innerHTML = sectionHead('Карта резистентности', 'Интерактивное географическое представление демонстрационных AMR-данных по регионам Казахстана.', '<button class="btn secondary" id="back-overview">← К обзору</button>') + '<div class="map-full-host"></div>';
    const host = view.querySelector('.map-full-host');
    if (mapPanel) { host.appendChild(mapPanel); mapPanel.style.display = ''; mapPanel.classList.add('map-expanded'); }
    view.querySelector('#back-overview')?.addEventListener('click', () => navButtons.find((b) => b.dataset.section === 'Обзор')?.click());
  }

  function renderAnalytics() {
    view.innerHTML = sectionHead('Аналитика', 'Конструктор исследовательского среза и обзор ключевых тенденций.', '<button class="btn primary">Сохранить исследование</button>') + `
      <div class="analytics-filters"><label>Организм<select><option>E. coli</option><option>K. pneumoniae</option><option>S. aureus</option></select></label><label>Период<select><option>2022–2026</option><option>2026</option></select></label><label>Регион<select><option>Казахстан</option><option>Астана</option><option>Алматы</option></select></label><label>Материал<select><option>Все материалы</option><option>Моча</option><option>Кровь</option></select></label></div>
      <div class="analytics-grid"><article class="analysis-card wide"><div class="mini-head"><div><h3>Изменение резистентности</h3><p>Цефтриаксон · E. coli</p></div><b>+9,1 п.п.</b></div><svg class="analysis-chart" viewBox="0 0 700 230" preserveAspectRatio="none"><g class="grid-lines"><line x1="0" y1="40" x2="700" y2="40"/><line x1="0" y1="90" x2="700" y2="90"/><line x1="0" y1="140" x2="700" y2="140"/><line x1="0" y1="190" x2="700" y2="190"/></g><polyline points="0,178 140,164 280,141 420,122 560,91 700,67"/></svg><div class="year-axis"><span>2021</span><span>2022</span><span>2023</span><span>2024</span><span>2025</span><span>2026</span></div></article><article class="analysis-card"><h3>Фенотипы</h3><div class="donut"><div><strong>18,4%</strong><span>ESBL</span></div></div><div class="rank-list"><span><b>ESBL</b><em>18,4%</em></span><span><b>MDR</b><em>8,7%</em></span><span><b>Carb-R</b><em>1,3%</em></span></div></article><article class="analysis-card"><h3>Качество выборки</h3><div class="quality-score">A</div><p>Высокая полнота AST и достаточная выборка для демонстрационного анализа.</p><div class="quality-mini"><span>Изоляты <b>84 215</b></span><span>Регионов <b>20</b></span><span>Лабораторий <b>86</b></span></div></article></div>`;
  }

  function renderComparison() {
    view.innerHTML = sectionHead('Сравнение', 'Параллельное сравнение двух регионов или выборок.', '<button class="btn secondary">Поменять местами</button>') + `
      <div class="compare-selectors"><label>Выборка A<select><option>Астана</option><option>Алматы</option><option>Караганда</option></select></label><div class="vs">VS</div><label>Выборка B<select><option>Алматы</option><option>Астана</option><option>Шымкент</option></select></label></div>
      <div class="compare-grid"><article><span>Изоляты</span><strong>12 842</strong><em>Астана</em></article><article><span>Изоляты</span><strong>14 516</strong><em>Алматы</em></article><article><span>Средняя R</span><strong>27,8%</strong><em>−1,4 п.п.</em></article><article><span>Средняя R</span><strong>32,6%</strong><em>+3,4 п.п.</em></article></div>
      <div class="compare-table"><div class="compare-row head"><span>Антибиотик</span><b>Астана</b><b>Алматы</b><span>Разница</span></div>${[['Ампициллин',69,72],['Цефтриаксон',28,34],['Ципрофлоксацин',31,38],['Амикацин',6,5],['Меропенем',1.2,1.8]].map(r=>`<div class="compare-row"><span>${r[0]}</span><b>${String(r[1]).replace('.',',')}%</b><b>${String(r[2]).replace('.',',')}%</b><span class="${r[2]-r[1]>3?'trend-bad':''}">${r[2]-r[1]>=0?'+':''}${String((r[2]-r[1]).toFixed(1)).replace('.',',')} п.п.</span></div>`).join('')}</div>`;
  }

  function renderSignals() {
    view.innerHTML = sectionHead('AMR Radar', 'Автоматические сигналы необычного роста резистентности и кластеризации.', '<button class="btn primary">Настроить правила</button>') + `
      <div class="signal-summary"><div><i class="sev high"></i><span>Высоких</span><strong>2</strong></div><div><i class="sev medium"></i><span>Средних</span><strong>2</strong></div><div><i class="sev low"></i><span>Низких</span><strong>1</strong></div><div><span>Последний анализ</span><strong>00:15</strong><small>16.09.2026</small></div></div>
      <div class="signal-table"><div class="signal-row head"><span>Приоритет</span><span>Организм</span><span>Маркер</span><span>Регион</span><span>Изменение</span><span>Дата</span></div>${signals.map(s=>`<button class="signal-row"><span><i class="sev ${s[0]==='Высокий'?'high':s[0]==='Средний'?'medium':'low'}"></i>${s[0]}</span><strong>${s[1]}</strong><span>${s[2]}</span><span>${s[3]}</span><b>${s[4]}</b><span>${s[5]}</span></button>`).join('')}</div>`;
  }

  function renderMethods() {
    view.innerHTML = sectionHead('Данные и методы', 'Как данные будут поступать, проверяться и интерпретироваться в AMR Atlas.') + `
      <div class="method-flow"><div><span>01</span><strong>WHONET</strong><p>Выгрузка лабораторных данных. Первый источник подключения.</p></div><i>→</i><div><span>02</span><strong>Импорт</strong><p>Проверка структуры и обязательных полей.</p></div><i>→</i><div><span>03</span><strong>Нормализация</strong><p>Организмы, антибиотики, материалы и методы AST.</p></div><i>→</i><div><span>04</span><strong>Аналитика</strong><p>Дедупликация, S/I/R, агрегаты и сигналы.</p></div></div>
      <div class="method-grid"><article><h3>Поддерживаемые форматы</h3><ul><li>WHONET / BacLink exports <b>первый этап</b></li><li>CSV / TSV <b>планируется</b></li><li>HL7 ORU <b>позже</b></li><li>REST API ЛИС <b>позже</b></li></ul></article><article><h3>Интерпретация AST</h3><p>Версия breakpoint должна храниться вместе с интерпретацией. Сырые MIC и зоны не перезаписываются.</p><div class="method-tags"><span>EUCAST</span><span>CLSI</span><span>MIC</span><span>Zone mm</span><span>S/I/R</span></div></article><article><h3>Защита данных</h3><p>В платформу не должны поступать ФИО, ИИН, телефоны и адрес пациента. Для дедупликации используется локальный псевдонимизированный идентификатор.</p></article></div>`;
  }

  function renderPublications() {
    const pubs = [
      ['Региональная динамика ESBL-продуцирующих E. coli', 'Аналитический отчёт', '2026', 'Казахстан'],
      ['Карбапенем-резистентность K. pneumoniae', 'AMR brief', '2026', 'Стационары'],
      ['Антибиотикорезистентность в мочевых изолятах', 'Research note', '2025', 'Амбулатория'],
      ['Методология агрегирования данных WHONET', 'Методика', '2026', 'AMR Atlas'],
    ];
    view.innerHTML = sectionHead('Публикации', 'Отчёты, исследования и методические материалы, построенные на данных платформы.', '<button class="btn primary">+ Новая публикация</button>') + `<div class="publication-grid">${pubs.map((p,i)=>`<article><div class="pub-type">${p[1]}</div><h3>${p[0]}</h3><p>Демонстрационная карточка будущего научного материала с автоматическими графиками и ссылкой на методологию выборки.</p><div><span>${p[2]}</span><span>${p[3]}</span></div><button>Открыть материал →</button></article>`).join('')}</div>`;
  }

  navButtons.forEach((button) => {
    button.addEventListener('click', () => showSection(button.dataset.section || 'Обзор'));
  });

  showOverview();
})();
