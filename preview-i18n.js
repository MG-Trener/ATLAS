(() => {
  const LANGS = ['ru', 'kk', 'en'];
  const STORAGE_KEY = 'atlas-preview-language';
  let language = 'ru';
  let scheduled = false;

  const tr = (ru, kk, en) => ({ ru, kk, en });

  const phrases = [
    tr('Данные сегодня.', 'Деректер бүгін.', 'Data today.'),
    tr('Здоровье завтра.', 'Денсаулық ертең.', 'Health tomorrow.'),
    tr('Обзор', 'Шолу', 'Overview'),
    tr('Микроорганизмы', 'Микроорганизмдер', 'Organisms'),
    tr('Антибиотики', 'Антибиотиктер', 'Antibiotics'),
    tr('Карта', 'Карта', 'Map'),
    tr('Аналитика', 'Аналитика', 'Analytics'),
    tr('Сравнение', 'Салыстыру', 'Comparison'),
    tr('Сигналы', 'Сигналдар', 'Signals'),
    tr('Данные и методы', 'Деректер және әдістер', 'Data & methods'),
    tr('Публикации', 'Жарияланымдар', 'Publications'),
    tr('Научный мониторинг', 'Ғылыми мониторинг', 'Scientific surveillance'),
    tr('Локальные данные, динамика резистентности и ранние сигналы AMR в одном интерфейсе.', 'Жергілікті деректер, төзімділік динамикасы және ерте AMR сигналдары бір интерфейсте.', 'Local data, resistance trends and early AMR signals in one interface.'),
    tr('Казахстан · frontend prototype v0.3', 'Қазақстан · frontend prototype v0.3', 'Kazakhstan · frontend prototype v0.3'),
    tr('Д-р А. Петров', 'Д-р А. Петров', 'Dr A. Petrov'),
    tr('Демо-профиль', 'Демо-профиль', 'Demo profile'),
    tr('Главная', 'Басты бет', 'Home'),
    tr('Грамотрицательная', 'Грамтеріс', 'Gram-negative'),
    tr('Интерактивный обзор антимикробной резистентности ·', 'Микробқа қарсы төзімділіктің интерактивті шолуы ·', 'Interactive antimicrobial resistance overview ·'),
    tr('демонстрационные данные', 'демонстрациялық деректер', 'demo data'),
    tr('↓ Экспорт', '↓ Экспорт', '↓ Export'),
    tr('☆ Сохранить вид', '☆ Көріністі сақтау', '☆ Save view'),
    tr('Микроорганизм', 'Микроорганизм', 'Organism'),
    tr('Материал', 'Материал', 'Specimen'),
    tr('Регион', 'Өңір', 'Region'),
    tr('Период', 'Кезең', 'Period'),
    tr('Тип учреждения', 'Мекеме түрі', 'Facility type'),
    tr('Моча', 'Зәр', 'Urine'),
    tr('Кровь', 'Қан', 'Blood'),
    tr('Респираторный материал', 'Тыныс алу материалы', 'Respiratory specimen'),
    tr('Все материалы', 'Барлық материалдар', 'All specimens'),
    tr('Последние 12 месяцев', 'Соңғы 12 ай', 'Last 12 months'),
    tr('Все учреждения', 'Барлық мекемелер', 'All facilities'),
    tr('Стационар', 'Стационар', 'Inpatient'),
    tr('Амбулатория', 'Амбулатория', 'Outpatient'),
    tr('⚙ Доп. фильтры', '⚙ Қос. сүзгілер', '⚙ More filters'),
    tr('Применить', 'Қолдану', 'Apply'),
    tr('Всего изолятов', 'Барлық изоляттар', 'Total isolates'),
    tr('Средняя резистентность', 'Орташа төзімділік', 'Mean resistance'),
    tr('к уровню 2022 года', '2022 жылғы деңгейге қатысты', 'vs 2022 level'),
    tr('множественная резистентность', 'көптік төзімділік', 'multidrug resistance'),
    tr('ESBL-продуценты', 'ESBL-продуценттер', 'ESBL producers'),
    tr('от всех E. coli', 'барлық E. coli ішінен', 'of all E. coli'),
    tr('Активные сигналы', 'Белсенді сигналдар', 'Active signals'),
    tr('требуют внимания', 'назар аударуды қажет етеді', 'require attention'),
    tr('Резистентность к антибиотикам', 'Антибиотиктерге төзімділік', 'Antibiotic resistance'),
    tr('Все антибиотики →', 'Барлық антибиотиктер →', 'All antibiotics →'),
    tr('Антибиотик', 'Антибиотик', 'Antibiotic'),
    tr('Динамика', 'Динамика', 'Trend'),
    tr('Ампициллин', 'Ампициллин', 'Ampicillin'),
    tr('Ципрофлоксацин', 'Ципрофлоксацин', 'Ciprofloxacin'),
    tr('Триметоприм/сульфаметоксазол', 'Триметоприм/сульфаметоксазол', 'Trimethoprim/sulfamethoxazole'),
    tr('Цефтриаксон', 'Цефтриаксон', 'Ceftriaxone'),
    tr('Нитрофурантоин', 'Нитрофурантоин', 'Nitrofurantoin'),
    tr('Амикацин', 'Амикацин', 'Amikacin'),
    tr('Меропенем', 'Меропенем', 'Meropenem'),
    tr('Интерактивная карта резистентности', 'Төзімділіктің интерактивті картасы', 'Interactive resistance map'),
    tr('Сигналы и оповещения', 'Сигналдар мен ескертулер', 'Signals and alerts'),
    tr('Все →', 'Барлығы →', 'All →'),
    tr('Рост резистентности к цефтриаксону', 'Цефтриаксонға төзімділіктің өсуі', 'Increase in ceftriaxone resistance'),
    tr('Увеличение доли ESBL', 'ESBL үлесінің өсуі', 'Increase in ESBL share'),
    tr('Необычная кластеризация изолятов', 'Изоляттардың әдеттен тыс кластерленуі', 'Unusual isolate clustering'),
    tr('Высокий', 'Жоғары', 'High'),
    tr('Средний', 'Орташа', 'Medium'),
    tr('Низкий', 'Төмен', 'Low'),
    tr('AMR Radar активен', 'AMR Radar белсенді', 'AMR Radar active'),
    tr('Последний анализ: 5 сентября 2026, 14:37', 'Соңғы талдау: 5 қыркүйек 2026, 14:37', 'Last analysis: 5 September 2026, 14:37'),
    tr('Динамика резистентности', 'Төзімділік динамикасы', 'Resistance trend'),
    tr('Линейный график', 'Сызықтық график', 'Line chart'),
    tr('Регионы × антибиотики', 'Өңірлер × антибиотиктер', 'Regions × antibiotics'),
    tr('Доля резистентных изолятов, %', 'Төзімді изоляттар үлесі, %', 'Share of resistant isolates, %'),
    tr('Расширить →', 'Кеңейту →', 'Expand →'),
    tr('Качество данных', 'Деректер сапасы', 'Data quality'),
    tr('Покрытие и полнота', 'Қамту және толықтық', 'Coverage and completeness'),
    tr('Высокое', 'Жоғары', 'High'),
    tr('Полнота данных', 'Деректер толықтығы', 'Data completeness'),
    tr('Своевременность', 'Уақтылылық', 'Timeliness'),
    tr('Лабораторное покрытие', 'Зертханалық қамту', 'Laboratory coverage'),
    tr('Соответствие стандартам', 'Стандарттарға сәйкестік', 'Standards compliance'),
    tr('Источник на этапе прототипа', 'Прототип кезеңіндегі дереккөз', 'Prototype data source'),
    tr('Демонстрационные AMR-значения. Геометрия карты — geoBoundaries ADM1; далее — актуальные границы и импорт WHONET.', 'Демонстрациялық AMR мәндері. Карта геометриясы — geoBoundaries ADM1; кейін өзекті шекаралар және WHONET импорты.', 'Demo AMR values. Map geometry uses geoBoundaries ADM1; current boundaries and WHONET import follow next.'),
    tr('AMR Atlas · визуальный прототип', 'AMR Atlas · визуалды прототип', 'AMR Atlas · visual prototype'),
    tr('Без БД · данные демонстрационные · подготовлено для интеграции WHONET', 'ДҚ жоқ · демонстрациялық деректер · WHONET интеграциясына дайындалған', 'No database · demo data · prepared for WHONET integration'),
    tr('Интерфейс активен', 'Интерфейс белсенді', 'Interface active'),
    tr('Загрузка контуров регионов Казахстана…', 'Қазақстан өңірлерінің контурлары жүктелуде…', 'Loading Kazakhstan region boundaries…'),
    tr('Интерактивные контуры временно недоступны. Используется резервное изображение карты.', 'Интерактивті контурлар уақытша қолжетімсіз. Резервтік карта кескіні қолданылады.', 'Interactive boundaries are temporarily unavailable. A fallback map image is shown.'),
    tr('Карта регионов Казахстана', 'Қазақстан өңірлерінің картасы', 'Map of Kazakhstan regions'),
    tr('Интерактивная карта регионов Казахстана', 'Қазақстан өңірлерінің интерактивті картасы', 'Interactive map of Kazakhstan regions'),
    tr('Приблизить', 'Жақындату', 'Zoom in'),
    tr('Отдалить', 'Алыстату', 'Zoom out'),
    tr('Сбросить масштаб', 'Масштабты қалпына келтіру', 'Reset zoom'),
    tr('Изолятов', 'Изоляттар', 'Isolates'),
    tr('Изоляты', 'Изоляттар', 'Isolates'),
    tr('Лаб.', 'Зерт.', 'Labs'),
    tr('Закрыть', 'Жабу', 'Close'),
    tr('Регион применён ко всему обзору ✓', 'Өңір бүкіл шолуға қолданылды ✓', 'Region applied to the whole overview ✓'),
    tr('Локальная геометрия · 17 областей + 3 города · hover и клик активны', 'Жергілікті геометрия · 17 облыс + 3 қала · hover және click белсенді', 'Local geometry · 17 regions + 3 cities · hover and click enabled'),
    tr('Пробная геометрия 2024 · 17 областей + 3 города · hover и клик активны', '2024 сынақ геометриясы · 17 облыс + 3 қала · hover және click белсенді', '2024 preview geometry · 17 regions + 3 cities · hover and click enabled'),
    tr('Пробная геометрия: geoBoundaries ADM1 (2017) · hover и клик активны', 'Сынақ геометриясы: geoBoundaries ADM1 (2017) · hover және click белсенді', 'Preview geometry: geoBoundaries ADM1 (2017) · hover and click enabled')
  ];

  const pcodeNames = {
    KZ10: tr('Абайская область', 'Абай облысы', 'Abay Region'),
    KZ11: tr('Акмолинская область', 'Ақмола облысы', 'Akmola Region'),
    KZ15: tr('Актюбинская область', 'Ақтөбе облысы', 'Aktobe Region'),
    KZ19: tr('Алматинская область', 'Алматы облысы', 'Almaty Region'),
    KZ23: tr('Атырауская область', 'Атырау облысы', 'Atyrau Region'),
    KZ27: tr('Западно-Казахстанская область', 'Батыс Қазақстан облысы', 'West Kazakhstan Region'),
    KZ31: tr('Жамбылская область', 'Жамбыл облысы', 'Zhambyl Region'),
    KZ33: tr('Жетысуская область', 'Жетісу облысы', 'Zhetysu Region'),
    KZ35: tr('Карагандинская область', 'Қарағанды облысы', 'Karaganda Region'),
    KZ39: tr('Костанайская область', 'Қостанай облысы', 'Kostanay Region'),
    KZ43: tr('Кызылординская область', 'Қызылорда облысы', 'Kyzylorda Region'),
    KZ47: tr('Мангистауская область', 'Маңғыстау облысы', 'Mangystau Region'),
    KZ55: tr('Павлодарская область', 'Павлодар облысы', 'Pavlodar Region'),
    KZ59: tr('Северо-Казахстанская область', 'Солтүстік Қазақстан облысы', 'North Kazakhstan Region'),
    KZ61: tr('Туркестанская область', 'Түркістан облысы', 'Turkistan Region'),
    KZ62: tr('Улытауская область', 'Ұлытау облысы', 'Ulytau Region'),
    KZ63: tr('Восточно-Казахстанская область', 'Шығыс Қазақстан облысы', 'East Kazakhstan Region'),
    KZ71: tr('Астана', 'Астана', 'Astana'),
    KZ75: tr('Алматы', 'Алматы', 'Almaty'),
    KZ79: tr('Шымкент', 'Шымкент', 'Shymkent')
  };

  const looseRegions = [
    tr('Казахстан', 'Қазақстан', 'Kazakhstan'), tr('Караганда', 'Қарағанды', 'Karaganda'), tr('Актобе', 'Ақтөбе', 'Aktobe'),
    tr('Восточно-Казахстанская область', 'Шығыс Қазақстан облысы', 'East Kazakhstan Region')
  ];

  const allEntries = [...phrases, ...Object.values(pcodeNames), ...looseRegions];
  const knownEntries = new Set(allEntries.map((entry) => LANGS.map((lang) => entry[lang] || '').join('\u0000')));
  const reverse = new Map();
  allEntries.forEach((entry) => LANGS.forEach((lang) => {
    if (!reverse.has(entry[lang])) reverse.set(entry[lang], entry);
  }));

  function registerTranslations(entries = []) {
    let changed = false;
    entries.forEach((entry) => {
      if (!entry || !LANGS.every((lang) => typeof entry[lang] === 'string')) return;
      const key = LANGS.map((lang) => entry[lang]).join('\u0000');
      if (knownEntries.has(key)) return;
      knownEntries.add(key);
      allEntries.push(entry);
      LANGS.forEach((lang) => {
        if (!reverse.has(entry[lang])) reverse.set(entry[lang], entry);
      });
      changed = true;
    });
    if (changed) scheduleApply();
  }

  function translateExact(value) {
    const entry = reverse.get(value);
    return entry ? entry[language] : value;
  }

  const isWordChar = (value) => /[\p{L}\p{N}]/u.test(value || '');
  function replaceFragment(value, source, target) {
    let output = '';
    let cursor = 0;
    let match;
    while ((match = value.indexOf(source, cursor)) !== -1) {
      const before = value[match - 1] || '';
      const after = value[match + source.length] || '';
      const insideWord = (isWordChar(source[0]) && isWordChar(before)) || (isWordChar(source[source.length - 1]) && isWordChar(after));
      output += value.slice(cursor, match) + (insideWord ? source : target);
      cursor = match + source.length;
    }
    return output + value.slice(cursor);
  }

  function translateFragments(value) {
    let output = value;
    const sorted = allEntries.slice().sort((a, b) => Math.max(b.ru.length, b.kk.length, b.en.length) - Math.max(a.ru.length, a.kk.length, a.en.length));
    sorted.forEach((entry) => {
      LANGS.forEach((lang) => {
        const source = entry[lang];
        if (source && source !== entry[language] && output.includes(source)) output = replaceFragment(output, source, entry[language]);
      });
    });
    if (language === 'kk') {
      output = output.replace(/п\.п\./g, 'т.п.').replace(/Данные демонстрационные\./g, 'Деректер демонстрациялық.');
    } else if (language === 'en') {
      output = output.replace(/п\.п\./g, 'pp').replace(/Данные демонстрационные\./g, 'Demo data.').replace(/за 12 месяцев/g, 'over 12 months').replace(/требуется эпидемиологическая оценка/g, 'epidemiological assessment required');
    } else {
      output = output.replace(/т\.п\./g, 'п.п.').replace(/Demo data\./g, 'Данные демонстрационные.');
    }
    return output;
  }

  function translateNode(node) {
    const parent = node.parentElement;
    if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) return;
    const raw = node.nodeValue || '';
    const trimmed = raw.trim();
    if (!trimmed) return;
    const exact = translateExact(trimmed);
    const next = exact === trimmed ? translateFragments(trimmed) : exact;
    if (next !== trimmed) node.nodeValue = raw.replace(trimmed, next);
  }

  function translateTree(root) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      translateNode(root);
      return;
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) translateNode(node);
  }

  function updateAttributes() {
    document.documentElement.lang = language === 'kk' ? 'kk' : language;
    document.title = language === 'ru' ? 'AMR Atlas — визуальный прототип' : language === 'kk' ? 'AMR Atlas — визуалды прототип' : 'AMR Atlas — visual prototype';
    const search = document.querySelector('.search input');
    if (search) search.placeholder = language === 'ru' ? 'Поиск микроорганизмов, антибиотиков, регионов, публикаций…' : language === 'kk' ? 'Микроорганизмдар, антибиотиктер, өңірлер, жарияланымдар бойынша іздеу…' : 'Search organisms, antibiotics, regions, publications…';
    document.querySelectorAll('[aria-label]').forEach((el) => {
      const current = el.getAttribute('aria-label');
      if (current) el.setAttribute('aria-label', translateFragments(current));
    });
    document.querySelectorAll('.language-switch button').forEach((button) => button.classList.toggle('active', button.dataset.lang === language));
  }

  function applyLanguage(root = document.body) {
    translateTree(root);
    updateAttributes();
  }

  function setLanguage(next, persist = true) {
    if (!LANGS.includes(next)) return;
    language = next;
    if (persist) localStorage.setItem(STORAGE_KEY, language);
    applyLanguage();
    document.dispatchEvent(new CustomEvent('atlas:language-changed', { detail: { language } }));
  }

  function regionName(region) {
    const entry = pcodeNames[region?.pcode];
    if (entry) return entry[language];
    return translateFragments(region?.name_kk || region?.name_en || '');
  }

  function setupCanonicalValues() {
    document.querySelectorAll('#map-antibiotic option').forEach((option) => {
      if (!option.dataset.canonicalValue) option.dataset.canonicalValue = option.textContent.trim();
      option.setAttribute('value', option.dataset.canonicalValue);
    });
  }

  function setupSwitcher() {
    document.querySelectorAll('.language-switch button').forEach((button) => button.addEventListener('click', () => setLanguage(button.dataset.lang)));
  }

  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      applyLanguage();
    }, 0);
  }

  language = localStorage.getItem(STORAGE_KEY) || 'ru';
  if (!LANGS.includes(language)) language = 'ru';
  setupCanonicalValues();
  setupSwitcher();
  applyLanguage();

  const observer = new MutationObserver(scheduleApply);
  observer.observe(document.body, { subtree: true, childList: true, characterData: true });

  document.addEventListener('change', (event) => {
    if (event.target?.id === 'map-antibiotic') setTimeout(() => applyLanguage(), 0);
  });

  window.AtlasPreviewI18n = {
    get language() { return language; },
    setLanguage,
    translate: (value) => translateFragments(value),
    regionName,
    pcodeNames,
    registerTranslations,
    applyLanguage
  };
})();
