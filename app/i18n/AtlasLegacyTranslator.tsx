"use client";

import { useEffect } from "react";
import { AtlasLanguage, useAtlasLanguage } from "./AtlasLanguage";

type Variant = Record<AtlasLanguage, string>;

const phrases: Variant[] = [
  { ru:"Обзор", kk:"Шолу", en:"Overview" },
  { ru:"Карта и аналитика", kk:"Карта және аналитика", en:"Map & analytics" },
  { ru:"Справочники", kk:"Анықтамалықтар", en:"Reference" },
  { ru:"О платформе", kk:"Платформа туралы", en:"About" },
  { ru:"Профили AMR", kk:"AMR профильдері", en:"AMR profiles" },
  { ru:"Карта", kk:"Карта", en:"Map" },
  { ru:"Аналитика", kk:"Аналитика", en:"Analytics" },
  { ru:"Сравнение", kk:"Салыстыру", en:"Comparison" },
  { ru:"Сигналы", kk:"Сигналдар", en:"Signals" },
  { ru:"Национальная аналитическая витрина", kk:"Ұлттық аналитикалық витрина", en:"National analytics workspace" },
  { ru:"Микроорганизм", kk:"Микроорганизм", en:"Organism" },
  { ru:"Антибиотик", kk:"Антибиотик", en:"Antibiotic" },
  { ru:"Материал", kk:"Материал", en:"Specimen" },
  { ru:"Период", kk:"Кезең", en:"Period" },
  { ru:"Все материалы", kk:"Барлық материалдар", en:"All specimens" },
  { ru:"Кровь", kk:"Қан", en:"Blood" },
  { ru:"Моча", kk:"Зәр", en:"Urine" },
  { ru:"Респираторный материал", kk:"Тыныс алу материалы", en:"Respiratory specimen" },
  { ru:"%R · E. coli × CRO", kk:"%R · E. coli × CRO", en:"%R · E. coli × CRO" },
  { ru:"Изолятов", kk:"Изоляттар", en:"Isolates" },
  { ru:"Лабораторий", kk:"Зертханалар", en:"Laboratories" },
  { ru:"множественная резистентность", kk:"көптік төзімділік", en:"multidrug resistance" },
  { ru:"демонстрационная выборка", kk:"демонстрациялық іріктеме", en:"demo dataset" },
  { ru:"условное покрытие", kk:"шартты қамту", en:"indicative coverage" },
  { ru:"Региональная карта", kk:"Өңірлік карта", en:"Regional map" },
  { ru:"Выбранный регион · 2026 YTD", kk:"Таңдалған өңір · 2026 YTD", en:"Selected region · 2026 YTD" },
  { ru:"Изменение за 3 года", kk:"3 жылдағы өзгеріс", en:"3-year change" },
  { ru:"Сравнить этот регион", kk:"Осы өңірді салыстыру", en:"Compare this region" },
  { ru:"Как читать карту", kk:"Картаны қалай оқу керек", en:"How to read the map" },
  { ru:"Динамика резистентности", kk:"Төзімділік динамикасы", en:"Resistance trend" },
  { ru:"Распределение регионов", kk:"Өңірлердің бөлінуі", en:"Regional distribution" },
  { ru:"Региональная таблица", kk:"Өңірлік кесте", en:"Regional table" },
  { ru:"Сравнение двух регионов", kk:"Екі өңірді салыстыру", en:"Compare two regions" },
  { ru:"Разница", kk:"Айырмашылық", en:"Difference" },
  { ru:"Мониторинг сигналов", kk:"Сигналдарды мониторингтеу", en:"Signal monitoring" },
  { ru:"Логика сигналов", kk:"Сигналдар логикасы", en:"Signal logic" },
  { ru:"Критичные", kk:"Критикалық", en:"Critical" },
  { ru:"Высокие", kk:"Жоғары", en:"High" },
  { ru:"Средние", kk:"Орташа", en:"Medium" },
  { ru:"Наблюдение", kk:"Бақылау", en:"Watch" },
  { ru:"Все", kk:"Барлығы", en:"All" },
  { ru:"Национальный обзор антимикробной резистентности", kk:"Микробқа қарсы төзімділіктің ұлттық шолуы", en:"National antimicrobial resistance overview" },
  { ru:"Открыть карту", kk:"Картаны ашу", en:"Open map" },
  { ru:"Регион", kk:"Өңір", en:"Region" },
  { ru:"Источник", kk:"Дереккөз", en:"Source" },
  { ru:"Все лаборатории", kk:"Барлық зертханалар", en:"All laboratories" },
  { ru:"Изолятов в витрине", kk:"Витринадағы изоляттар", en:"Isolates in dataset" },
  { ru:"Покрытие регионов", kk:"Өңірлерді қамту", en:"Regional coverage" },
  { ru:"валидные наблюдения", kk:"валидті бақылаулар", en:"valid observations" },
  { ru:"R / протестированные · 95% ДИ", kk:"R / тестіленген · 95% СА", en:"R / tested · 95% CI" },
  { ru:"Национальная динамика AMR", kk:"AMR ұлттық динамикасы", en:"National AMR trend" },
  { ru:"AMR-сигналы", kk:"AMR сигналдары", en:"AMR signals" },
  { ru:"События, требующие внимания", kk:"Назар аударуды қажет ететін оқиғалар", en:"Events requiring attention" },
  { ru:"Маркерные профили эпиднадзора", kk:"Эпидқадағалаудың маркерлік профильдері", en:"Surveillance marker profiles" },
  { ru:"Антибиотики: текущий профиль", kk:"Антибиотиктер: ағымдағы профиль", en:"Antibiotics: current profile" },
  { ru:"Качество и охват данных", kk:"Деректер сапасы және қамту", en:"Data quality & coverage" },
  { ru:"Регионы, требующие внимания", kk:"Назар аударуды қажет ететін өңірлер", en:"Regions requiring attention" },
  { ru:"Карта Казахстана", kk:"Қазақстан картасы", en:"Kazakhstan map" },
  { ru:"Детальный анализ", kk:"Егжей-тегжейлі талдау", en:"Detailed analysis" },
  { ru:"Источники данных", kk:"Дереккөздер", en:"Data sources" },
  { ru:"О платформе", kk:"Платформа туралы", en:"About the platform" },
  { ru:"Методология", kk:"Әдіснама", en:"Methodology" },
  { ru:"Покрытие лабораторий", kk:"Зертханаларды қамту", en:"Laboratory coverage" },
  { ru:"Отчёты и публикации", kk:"Есептер мен жарияланымдар", en:"Reports & publications" },
  { ru:"Что должен давать Atlas", kk:"Atlas не беруі керек", en:"What Atlas should provide" },
  { ru:"Текущий этап", kk:"Ағымдағы кезең", en:"Current stage" },
  { ru:"Базовые правила включения", kk:"Қосудың негізгі ережелері", en:"Core inclusion rules" },
  { ru:"Принципы", kk:"Қағидаттар", en:"Principles" },
  { ru:"Источники и роль каждого слоя", kk:"Дереккөздер және әр қабаттың рөлі", en:"Sources and role of each layer" },
  { ru:"Покрытие и качество по регионам", kk:"Өңірлер бойынша қамту және сапа", en:"Coverage and quality by region" },
  { ru:"Микроорганизмы", kk:"Микроорганизмдер", en:"Organisms" },
  { ru:"Антибиотики", kk:"Антибиотиктер", en:"Antibiotics" },
  { ru:"Поиск", kk:"Іздеу", en:"Search" },
  { ru:"Все группы", kk:"Барлық топтар", en:"All groups" },
  { ru:"Код", kk:"Код", en:"Code" },
  { ru:"Название", kk:"Атауы", en:"Name" },
  { ru:"Группа", kk:"Топ", en:"Group" },
  { ru:"Приоритет", kk:"Басымдық", en:"Priority" },
  { ru:"Класс", kk:"Класс", en:"Class" },
  { ru:"Сфера", kk:"Қолдану саласы", en:"Scope" },
  { ru:"Назад", kk:"Артқа", en:"Back" },
  { ru:"Сохранить вид", kk:"Көріністі сақтау", en:"Save view" },
  { ru:"Слои", kk:"Қабаттар", en:"Layers" },
  { ru:"Прототип · без БД", kk:"Прототип · ДБ-сыз", en:"Prototype · no DB" },
  { ru:"Демонстрационные данные", kk:"Демонстрациялық деректер", en:"Demo data" }
];

function targetFor(text: string, language: AtlasLanguage) {
  const phrase = phrases.find((item) => item.ru === text || item.kk === text || item.en === text);
  return phrase?.[language];
}

function translateNode(node: Text, language: AtlasLanguage) {
  const raw = node.nodeValue ?? "";
  const trimmed = raw.trim();
  if (!trimmed) return;
  const translated = targetFor(trimmed, language);
  if (!translated || translated === trimmed) return;
  const prefix = raw.slice(0, raw.indexOf(trimmed));
  const suffix = raw.slice(raw.indexOf(trimmed) + trimmed.length);
  node.nodeValue = `${prefix}${translated}${suffix}`;
}

function scan(root: Node, language: AtlasLanguage) {
  if (root.nodeType === Node.TEXT_NODE) {
    translateNode(root as Text, language);
    return;
  }
  const element = root as Element;
  if (element.tagName === "SCRIPT" || element.tagName === "STYLE" || element.tagName === "CODE" || element.tagName === "PRE") return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  while (current) {
    const parent = (current as Text).parentElement;
    if (parent && !["SCRIPT","STYLE","CODE","PRE"].includes(parent.tagName)) translateNode(current as Text, language);
    current = walker.nextNode();
  }
}

export default function AtlasLegacyTranslator() {
  const { language } = useAtlasLanguage();

  useEffect(() => {
    scan(document.body, language);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => scan(node, language));
        if (mutation.type === "characterData") scan(mutation.target, language);
      }
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true });
    return () => observer.disconnect();
  }, [language]);

  return null;
}
