"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AtlasLanguage = "ru" | "kk" | "en";

type Dictionary = Record<string, string>;

const dictionaries: Record<AtlasLanguage, Dictionary> = {
  ru: {
    profiles: "Профили",
    overview: "Обзор",
    map: "Карта",
    reference: "Справочники",
    about: "О платформе",
    mapAmr: "Карта AMR",
    backToMap: "На карту",
    compareRegion: "Сравнить регион",
    regionalProfile: "Региональный профиль · демонстрационные данные",
    regionalProfileDescription: "Детальный профиль антимикробной резистентности, охвата лабораторий, структуры материала и качества исходных данных.",
    needsAttention: "Регион требует внимания",
    resistanceAboveSignal: "Уровень R выше условного сигнального диапазона.",
    strongThreeYearGrowth: "Наблюдается выраженный рост за три года.",
    limitedDataQuality: "Качество/полнота данных ограничивает уверенность интерпретации.",
    resistance: "Резистентность",
    isolates: "Изолятов",
    laboratories: "Лабораторий",
    completeness: "Полнота",
    currentSlice: "в текущем срезе",
    conditionalCoverage: "условное покрытие",
    dynamics: "Динамика резистентности",
    shareR: "доля R, %",
    threeYears: "за 3 года",
    rankByR: "место по уровню R",
    of: "из",
    dataQuality: "Качество данных",
    confidence: "Уверенность региональной интерпретации",
    requiredCompleteness: "Полнота обязательных полей",
    target95: "цель ≥95%",
    interpretableAst: "Интерпретируемый AST",
    target98: "цель ≥98%",
    regionalSample: "Региональная выборка",
    conditionalSufficiency: "условная достаточность",
    high: "высокая",
    medium: "средняя",
    limited: "ограниченная",
    qcFuture: "После подключения реальных данных здесь появятся дата последней загрузки, число источников, доля дублей и история QC.",
    leadingOrganisms: "Ведущие микроорганизмы",
    conditionalProfile: "Условный профиль R внутри региона",
    antibiotics: "Антибиотики",
    keyDrugShare: "Доля R по ключевым препаратам",
    materialStructure: "Структура материала",
    isolateShare: "Доля изолятов в региональном наборе",
    compareKazakhstan: "Сравнение с Казахстаном",
    regionalContext: "Контекст регионального показателя",
    growth3y: "Рост за 3 года",
    pp: "п.п.",
    aboveExpected: "выше ожидаемого",
    noStrongSignal: "без сильного сигнала",
    loadingMap: "Загружаю административные границы Казахстана…",
    mapUnavailable: "Географический слой временно недоступен",
    mapUnavailableText: "Аналитика продолжает работать. Контуры загружаются из открытого набора 2024 года.",
    mapAria: "Интерактивная карта регионов Казахстана",
    mapAttribution: "Границы: new_qazaqstan_GeoJSON / geokz · административное деление 2024 · MIT",
    openProfile: "Открыть профиль",
    regionalCartogram: "Региональная карта",
    realBoundaries: "Актуальные административные границы Казахстана, 2024",
    nationalAnalytics: "Национальная аналитическая витрина",
    analytics: "Аналитика",
    comparison: "Сравнение",
    signals: "Сигналы",
    organism: "Микроорганизм",
    antibiotic: "Антибиотик",
    material: "Материал",
    period: "Период",
    allMaterials: "Все материалы",
    blood: "Кровь",
    urine: "Моча",
    respiratory: "Респираторный материал",
    wounds: "Раны",
    other: "Прочие",
    respiratoryShort: "Респираторный",
    ampicillin: "Ампициллин",
    ciprofloxacin: "Ципрофлоксацин",
    ceftriaxone: "Цефтриаксон",
    trimSulfa: "Триметоприм/сульфаметоксазол",
    meropenem: "Меропенем"
  },
  kk: {
    profiles: "Профильдер",
    overview: "Шолу",
    map: "Карта",
    reference: "Анықтамалықтар",
    about: "Платформа туралы",
    mapAmr: "AMR картасы",
    backToMap: "Картаға",
    compareRegion: "Өңірді салыстыру",
    regionalProfile: "Өңірлік профиль · демонстрациялық деректер",
    regionalProfileDescription: "Микробқа қарсы төзімділік, зертханалар қамтылуы, материал құрылымы және бастапқы деректер сапасының егжей-тегжейлі профилі.",
    needsAttention: "Өңір назар аударуды қажет етеді",
    resistanceAboveSignal: "R деңгейі шартты дабыл диапазонынан жоғары.",
    strongThreeYearGrowth: "Үш жыл ішінде айқын өсім байқалады.",
    limitedDataQuality: "Деректердің сапасы/толықтығы интерпретация сенімділігін шектейді.",
    resistance: "Төзімділік",
    isolates: "Изоляттар",
    laboratories: "Зертханалар",
    completeness: "Толықтық",
    currentSlice: "ағымдағы кесіндіде",
    conditionalCoverage: "шартты қамту",
    dynamics: "Төзімділік динамикасы",
    shareR: "R үлесі, %",
    threeYears: "3 жылда",
    rankByR: "R деңгейі бойынша орын",
    of: "ішінен",
    dataQuality: "Деректер сапасы",
    confidence: "Өңірлік интерпретация сенімділігі",
    requiredCompleteness: "Міндетті өрістердің толықтығы",
    target95: "мақсат ≥95%",
    interpretableAst: "Интерпретацияланатын AST",
    target98: "мақсат ≥98%",
    regionalSample: "Өңірлік іріктеме",
    conditionalSufficiency: "шартты жеткіліктілік",
    high: "жоғары",
    medium: "орташа",
    limited: "шектеулі",
    qcFuture: "Нақты деректер қосылғаннан кейін мұнда соңғы жүктеу күні, дереккөздер саны, дубльдер үлесі және QC тарихы көрсетіледі.",
    leadingOrganisms: "Жетекші микроорганизмдер",
    conditionalProfile: "Өңір ішіндегі шартты R профилі",
    antibiotics: "Антибиотиктер",
    keyDrugShare: "Негізгі препараттар бойынша R үлесі",
    materialStructure: "Материал құрылымы",
    isolateShare: "Өңірлік жиындағы изоляттар үлесі",
    compareKazakhstan: "Қазақстанмен салыстыру",
    regionalContext: "Өңірлік көрсеткіш контексті",
    growth3y: "3 жылдағы өсім",
    pp: "т.п.",
    aboveExpected: "күтілгеннен жоғары",
    noStrongSignal: "айқын сигнал жоқ",
    loadingMap: "Қазақстанның әкімшілік шекаралары жүктелуде…",
    mapUnavailable: "Географиялық қабат уақытша қолжетімсіз",
    mapUnavailableText: "Аналитика жұмысын жалғастырады. Контурлар 2024 жылғы ашық картографиялық жинақтан жүктеледі.",
    mapAria: "Қазақстан өңірлерінің интерактивті картасы",
    mapAttribution: "Шекаралар: new_qazaqstan_GeoJSON / geokz · 2024 әкімшілік бөлінісі · MIT",
    openProfile: "Профильді ашу",
    regionalCartogram: "Өңірлік карта",
    realBoundaries: "Қазақстанның өзекті әкімшілік шекаралары, 2024",
    nationalAnalytics: "Ұлттық аналитикалық витрина",
    analytics: "Аналитика",
    comparison: "Салыстыру",
    signals: "Сигналдар",
    organism: "Микроорганизм",
    antibiotic: "Антибиотик",
    material: "Материал",
    period: "Кезең",
    allMaterials: "Барлық материалдар",
    blood: "Қан",
    urine: "Зәр",
    respiratory: "Тыныс алу материалы",
    wounds: "Жаралар",
    other: "Басқа",
    respiratoryShort: "Тыныс алу",
    ampicillin: "Ампициллин",
    ciprofloxacin: "Ципрофлоксацин",
    ceftriaxone: "Цефтриаксон",
    trimSulfa: "Триметоприм/сульфаметоксазол",
    meropenem: "Меропенем"
  },
  en: {
    profiles: "Profiles",
    overview: "Overview",
    map: "Map",
    reference: "Reference",
    about: "About",
    mapAmr: "AMR Map",
    backToMap: "Back to map",
    compareRegion: "Compare region",
    regionalProfile: "Regional profile · demo data",
    regionalProfileDescription: "Detailed profile of antimicrobial resistance, laboratory coverage, specimen structure and source-data quality.",
    needsAttention: "Region requires attention",
    resistanceAboveSignal: "R level is above the indicative alert range.",
    strongThreeYearGrowth: "A pronounced three-year increase is observed.",
    limitedDataQuality: "Data quality/completeness limits confidence in interpretation.",
    resistance: "Resistance",
    isolates: "Isolates",
    laboratories: "Laboratories",
    completeness: "Completeness",
    currentSlice: "in the current slice",
    conditionalCoverage: "indicative coverage",
    dynamics: "Resistance trend",
    shareR: "share R, %",
    threeYears: "over 3 years",
    rankByR: "rank by R level",
    of: "of",
    dataQuality: "Data quality",
    confidence: "Confidence in regional interpretation",
    requiredCompleteness: "Required-field completeness",
    target95: "target ≥95%",
    interpretableAst: "Interpretable AST",
    target98: "target ≥98%",
    regionalSample: "Regional sample",
    conditionalSufficiency: "indicative sufficiency",
    high: "high",
    medium: "medium",
    limited: "limited",
    qcFuture: "Once real data are connected, this block will show the last load date, number of sources, duplicate rate and QC history.",
    leadingOrganisms: "Leading organisms",
    conditionalProfile: "Indicative R profile within the region",
    antibiotics: "Antibiotics",
    keyDrugShare: "R share for key agents",
    materialStructure: "Specimen structure",
    isolateShare: "Share of isolates in the regional dataset",
    compareKazakhstan: "Comparison with Kazakhstan",
    regionalContext: "Context of the regional indicator",
    growth3y: "3-year change",
    pp: "pp",
    aboveExpected: "above expected",
    noStrongSignal: "no strong signal",
    loadingMap: "Loading Kazakhstan administrative boundaries…",
    mapUnavailable: "Geographic layer is temporarily unavailable",
    mapUnavailableText: "Analytics remain available. Boundaries are loaded from an open 2024 mapping dataset.",
    mapAria: "Interactive map of Kazakhstan regions",
    mapAttribution: "Boundaries: new_qazaqstan_GeoJSON / geokz · 2024 administrative division · MIT",
    openProfile: "Open profile",
    regionalCartogram: "Regional map",
    realBoundaries: "Current Kazakhstan administrative boundaries, 2024",
    nationalAnalytics: "National analytics workspace",
    analytics: "Analytics",
    comparison: "Comparison",
    signals: "Signals",
    organism: "Organism",
    antibiotic: "Antibiotic",
    material: "Specimen",
    period: "Period",
    allMaterials: "All specimens",
    blood: "Blood",
    urine: "Urine",
    respiratory: "Respiratory specimen",
    wounds: "Wounds",
    other: "Other",
    respiratoryShort: "Respiratory",
    ampicillin: "Ampicillin",
    ciprofloxacin: "Ciprofloxacin",
    ceftriaxone: "Ceftriaxone",
    trimSulfa: "Trimethoprim/sulfamethoxazole",
    meropenem: "Meropenem"
  }
};

const regionNames: Record<string, Record<AtlasLanguage, string>> = {
  "Астана": { ru: "Астана", kk: "Астана", en: "Astana" },
  "Алматы": { ru: "Алматы", kk: "Алматы", en: "Almaty" },
  "Шымкент": { ru: "Шымкент", kk: "Шымкент", en: "Shymkent" },
  "Абайская": { ru: "Абайская", kk: "Абай облысы", en: "Abay Region" },
  "Акмолинская": { ru: "Акмолинская", kk: "Ақмола облысы", en: "Akmola Region" },
  "Актюбинская": { ru: "Актюбинская", kk: "Ақтөбе облысы", en: "Aktobe Region" },
  "Алматинская": { ru: "Алматинская", kk: "Алматы облысы", en: "Almaty Region" },
  "Атырауская": { ru: "Атырауская", kk: "Атырау облысы", en: "Atyrau Region" },
  "Восточно-Казахстанская": { ru: "Восточно-Казахстанская", kk: "Шығыс Қазақстан облысы", en: "East Kazakhstan Region" },
  "Жамбылская": { ru: "Жамбылская", kk: "Жамбыл облысы", en: "Zhambyl Region" },
  "Жетысуская": { ru: "Жетысуская", kk: "Жетісу облысы", en: "Zhetysu Region" },
  "Западно-Казахстанская": { ru: "Западно-Казахстанская", kk: "Батыс Қазақстан облысы", en: "West Kazakhstan Region" },
  "Карагандинская": { ru: "Карагандинская", kk: "Қарағанды облысы", en: "Karaganda Region" },
  "Костанайская": { ru: "Костанайская", kk: "Қостанай облысы", en: "Kostanay Region" },
  "Кызылординская": { ru: "Кызылординская", kk: "Қызылорда облысы", en: "Kyzylorda Region" },
  "Мангистауская": { ru: "Мангистауская", kk: "Маңғыстау облысы", en: "Mangystau Region" },
  "Павлодарская": { ru: "Павлодарская", kk: "Павлодар облысы", en: "Pavlodar Region" },
  "Северо-Казахстанская": { ru: "Северо-Казахстанская", kk: "Солтүстік Қазақстан облысы", en: "North Kazakhstan Region" },
  "Туркестанская": { ru: "Туркестанская", kk: "Түркістан облысы", en: "Turkistan Region" },
  "Улытауская": { ru: "Улытауская", kk: "Ұлытау облысы", en: "Ulytau Region" }
};

type AtlasLanguageContextValue = {
  language: AtlasLanguage;
  setLanguage: (language: AtlasLanguage) => void;
  t: (key: string) => string;
  regionName: (russianName: string) => string;
  materialName: (russianName: string) => string;
  antibioticName: (russianName: string) => string;
};

const AtlasLanguageContext = createContext<AtlasLanguageContextValue | null>(null);

export function AtlasLanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AtlasLanguage>("ru");

  useEffect(() => {
    const saved = window.localStorage.getItem("atlas-language");
    if (saved === "ru" || saved === "kk" || saved === "en") setLanguageState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "kk" ? "kk" : language;
    window.localStorage.setItem("atlas-language", language);
  }, [language]);

  const value = useMemo<AtlasLanguageContextValue>(() => ({
    language,
    setLanguage: setLanguageState,
    t: (key) => dictionaries[language][key] ?? dictionaries.ru[key] ?? key,
    regionName: (name) => regionNames[name]?.[language] ?? name,
    materialName: (name) => {
      const map: Record<string, string> = { "Моча": "urine", "Кровь": "blood", "Респираторный": "respiratoryShort", "Респираторный материал": "respiratory", "Раны": "wounds", "Прочие": "other" };
      const key = map[name];
      return key ? (dictionaries[language][key] ?? name) : name;
    },
    antibioticName: (name) => {
      const map: Record<string, string> = { "Ампициллин": "ampicillin", "Ципрофлоксацин": "ciprofloxacin", "Цефтриаксон": "ceftriaxone", "Триметоприм/сульфаметоксазол": "trimSulfa", "Меропенем": "meropenem" };
      const key = map[name];
      return key ? (dictionaries[language][key] ?? name) : name;
    }
  }), [language]);

  return <AtlasLanguageContext.Provider value={value}>{children}</AtlasLanguageContext.Provider>;
}

export function useAtlasLanguage() {
  const context = useContext(AtlasLanguageContext);
  if (!context) throw new Error("useAtlasLanguage must be used within AtlasLanguageProvider");
  return context;
}
