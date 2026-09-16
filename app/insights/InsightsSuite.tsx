"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  BellRing,
  ChevronRight,
  GitCompareArrows,
  Layers3,
  MapPinned,
  Microscope,
  ShieldCheck,
  SlidersHorizontal,
  TestTube2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import KazakhstanRegionMap from "./KazakhstanRegionMap";
import styles from "./insights.module.css";

type Section = "map" | "analytics" | "compare" | "signals";
type RegionRow = {
  name: string;
  short: string;
  resistance: number;
  isolates: number;
  mdr: number;
  delta: number;
  labs: number;
  x: number;
  y: number;
};

const regionRows: RegionRow[] = [
  { name: "Астана", short: "AST", resistance: 31.4, isolates: 2268, mdr: 11.9, delta: 4.8, labs: 8, x: 55, y: 31 },
  { name: "Алматы", short: "ALA", resistance: 33.1, isolates: 2791, mdr: 12.7, delta: 3.7, labs: 11, x: 70, y: 78 },
  { name: "Шымкент", short: "SHY", resistance: 27.5, isolates: 1584, mdr: 9.8, delta: 2.4, labs: 6, x: 49, y: 79 },
  { name: "Абайская", short: "ABY", resistance: 35.8, isolates: 968, mdr: 14.2, delta: 5.1, labs: 4, x: 78, y: 53 },
  { name: "Акмолинская", short: "AKM", resistance: 25.8, isolates: 1370, mdr: 8.2, delta: 1.6, labs: 5, x: 53, y: 22 },
  { name: "Актюбинская", short: "AKT", resistance: 21.6, isolates: 1028, mdr: 7.1, delta: 1.2, labs: 4, x: 31, y: 50 },
  { name: "Алматинская", short: "ALM", resistance: 30.7, isolates: 1904, mdr: 10.7, delta: 2.9, labs: 7, x: 73, y: 69 },
  { name: "Атырауская", short: "ATY", resistance: 24.1, isolates: 847, mdr: 8.4, delta: 0.9, labs: 3, x: 16, y: 55 },
  { name: "Восточно-Казахстанская", short: "VKO", resistance: 36.4, isolates: 1314, mdr: 15.1, delta: 5.4, labs: 5, x: 88, y: 44 },
  { name: "Жамбылская", short: "ZHM", resistance: 26.9, isolates: 1152, mdr: 8.9, delta: 1.7, labs: 4, x: 58, y: 76 },
  { name: "Жетысуская", short: "ZHT", resistance: 29.8, isolates: 904, mdr: 10.1, delta: 2.1, labs: 4, x: 78, y: 69 },
  { name: "Западно-Казахстанская", short: "ZKO", resistance: 18.9, isolates: 792, mdr: 5.8, delta: -0.4, labs: 3, x: 10, y: 37 },
  { name: "Карагандинская", short: "KAR", resistance: 29.8, isolates: 1934, mdr: 10.9, delta: 2.1, labs: 7, x: 59, y: 47 },
  { name: "Костанайская", short: "KOS", resistance: 22.7, isolates: 1188, mdr: 6.9, delta: 0.8, labs: 4, x: 43, y: 18 },
  { name: "Кызылординская", short: "KYZ", resistance: 25.2, isolates: 1019, mdr: 8.1, delta: 1.3, labs: 4, x: 41, y: 68 },
  { name: "Мангистауская", short: "MAN", resistance: 23.4, isolates: 744, mdr: 7.8, delta: 1.1, labs: 3, x: 16, y: 74 },
  { name: "Павлодарская", short: "PAV", resistance: 24.2, isolates: 1170, mdr: 7.3, delta: -0.9, labs: 4, x: 72, y: 27 },
  { name: "Северо-Казахстанская", short: "SKO", resistance: 20.8, isolates: 836, mdr: 6.4, delta: 0.5, labs: 3, x: 51, y: 9 },
  { name: "Туркестанская", short: "TUR", resistance: 28.4, isolates: 1468, mdr: 9.4, delta: 2.2, labs: 5, x: 45, y: 85 },
  { name: "Улытауская", short: "ULT", resistance: 27.1, isolates: 612, mdr: 9.2, delta: 2.8, labs: 2, x: 47, y: 52 },
];

const organisms = ["Escherichia coli", "Klebsiella pneumoniae", "Staphylococcus aureus", "Pseudomonas aeruginosa", "Acinetobacter baumannii"];
const antibiotics = ["Цефтриаксон", "Ципрофлоксацин", "Ампициллин", "Амикацин", "Меропенем"];
const trendYears = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
const nationalTrend = [20.4, 21.8, 23.2, 24.7, 26.1, 27.4, 28.6];

const signals = [
  { id: 1, level: "critical", title: "Рост карбапенем-резистентности у K. pneumoniae", region: "Восточно-Казахстанская", metric: "+5,4 п.п.", detail: "Третий последовательный год роста. Уровень выше национального профиля.", status: "Новый" },
  { id: 2, level: "high", title: "Высокая доля ESBL у Enterobacterales", region: "Абайская", metric: "34,8%", detail: "Превышение условного сигнального порога 30% в демонстрационном наборе.", status: "На контроле" },
  { id: 3, level: "medium", title: "Региональный разброс по ципрофлоксацину", region: "Алматы", metric: "18,2 п.п.", detail: "Разница между верхним и нижним квартилем регионов увеличилась.", status: "Наблюдение" },
  { id: 4, level: "watch", title: "Снижение чувствительности к амикацину", region: "Астана", metric: "-2,1 п.п.", detail: "Пока без критического уровня, но тренд требует повторной оценки.", status: "Наблюдение" },
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value);
}

function linePoints(values: number[], width = 600, height = 180) {
  const max = Math.max(...values) + 2;
  const min = Math.min(...values) - 2;
  const range = Math.max(1, max - min);
  return values.map((value, index) => `${(index / (values.length - 1)) * width},${height - ((value - min) / range) * height}`).join(" ");
}

export default function InsightsSuite() {
  const [section, setSection] = useState<Section>("map");
  const [selectedRegion, setSelectedRegion] = useState("Астана");
  const [organism, setOrganism] = useState(organisms[0]);
  const [antibiotic, setAntibiotic] = useState(antibiotics[0]);
  const [material, setMaterial] = useState("Все материалы");
  const [compareA, setCompareA] = useState("Астана");
  const [compareB, setCompareB] = useState("Алматы");
  const [signalFilter, setSignalFilter] = useState("Все");

  const region = regionRows.find((item) => item.name === selectedRegion) ?? regionRows[0];
  const a = regionRows.find((item) => item.name === compareA) ?? regionRows[0];
  const b = regionRows.find((item) => item.name === compareB) ?? regionRows[1];

  const summary = useMemo(() => {
    const isolates = regionRows.reduce((sum, item) => sum + item.isolates, 0);
    const weighted = regionRows.reduce((sum, item) => sum + item.resistance * item.isolates, 0) / isolates;
    const mdr = regionRows.reduce((sum, item) => sum + item.mdr * item.isolates, 0) / isolates;
    return { isolates, weighted, mdr, labs: regionRows.reduce((sum, item) => sum + item.labs, 0) };
  }, []);

  const filteredSignals = signalFilter === "Все" ? signals : signals.filter((item) => item.level === signalFilter);
  const title = section === "map" ? "Карта AMR" : section === "analytics" ? "Аналитика" : section === "compare" ? "Сравнение" : "Сигналы";

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark}><i /><i /><i /><i /><i /><i /></span>
          <span><strong>AMR Atlas</strong><small>Казахстан · прототип</small></span>
        </Link>
        <Link href="/" className={styles.back}><ArrowLeft size={16} /> Профили AMR</Link>
        <nav className={styles.nav}>
          <button className={section === "map" ? styles.active : ""} onClick={() => setSection("map")}><MapPinned size={18} /><span>Карта</span><ChevronRight size={14} /></button>
          <button className={section === "analytics" ? styles.active : ""} onClick={() => setSection("analytics")}><BarChart3 size={18} /><span>Аналитика</span><ChevronRight size={14} /></button>
          <button className={section === "compare" ? styles.active : ""} onClick={() => setSection("compare")}><GitCompareArrows size={18} /><span>Сравнение</span><ChevronRight size={14} /></button>
          <button className={section === "signals" ? styles.active : ""} onClick={() => setSection("signals")}><BellRing size={18} /><span>Сигналы</span><b>4</b></button>
        </nav>
        <div className={styles.sideNote}><ShieldCheck size={19} /><strong>Демонстрационные данные</strong><span>Логика экранов готовится до подключения БД и WHONET.</span></div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <div><span>AMR Atlas</span><ChevronRight size={13} /><strong>{title}</strong></div>
          <span className={styles.demo}>Прототип · без БД</span>
        </header>

        <div className={styles.content}>
          <section className={styles.hero}>
            <div><span className={styles.eyebrow}>Национальная аналитическая витрина</span><h1>{title}</h1><p>{organism} · {antibiotic} · {material} · 2020–2026</p></div>
            <div className={styles.heroActions}><button className={styles.secondary}><Layers3 size={15} /> Слои</button><button className={styles.primary}><SlidersHorizontal size={15} /> Сохранить вид</button></div>
          </section>

          <section className={styles.filters}>
            <label><span>Микроорганизм</span><select value={organism} onChange={(event) => setOrganism(event.target.value)}>{organisms.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span>Антибиотик</span><select value={antibiotic} onChange={(event) => setAntibiotic(event.target.value)}>{antibiotics.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span>Материал</span><select value={material} onChange={(event) => setMaterial(event.target.value)}><option>Все материалы</option><option>Кровь</option><option>Моча</option><option>Респираторный материал</option></select></label>
            <label><span>Период</span><select defaultValue="2020–2026"><option>2020–2026</option><option>2026</option><option>2024–2026</option></select></label>
          </section>

          <section className={styles.stats}>
            <article><Activity size={19} /><span><small>Средняя резистентность</small><strong>{summary.weighted.toFixed(1)}%</strong><em>+4,1 п.п. за 3 года</em></span></article>
            <article><Microscope size={19} /><span><small>Изолятов</small><strong>{formatNumber(summary.isolates)}</strong><em>демонстрационная выборка</em></span></article>
            <article><AlertTriangle size={19} /><span><small>MDR</small><strong>{summary.mdr.toFixed(1)}%</strong><em>множественная резистентность</em></span></article>
            <article><ShieldCheck size={19} /><span><small>Лабораторий</small><strong>{summary.labs}</strong><em>условное покрытие</em></span></article>
          </section>

          {section === "map" && (
            <section className={styles.mapLayout}>
              <article className={`${styles.panel} ${styles.mapPanel}`}>
                <div className={styles.panelHead}><div><h2>Карта регионов Казахстана</h2><p>Административное деление 2024 · реальные контуры, упрощённые для веб-визуализации.</p></div><span className={styles.legend}><i className={styles.cool} /> &lt;25 <i className={styles.warm} /> 25–32 <i className={styles.hot} /> ≥32%</span></div>
                <KazakhstanRegionMap regions={regionRows} selectedRegion={selectedRegion} onSelect={setSelectedRegion} />
              </article>

              <article className={styles.panel}>
                <div className={styles.panelHead}><div><h2>{region.name}</h2><p>Выбранный регион · 2026</p></div><MapPinned size={19} /></div>
                <div className={styles.regionKpis}><div><span>R</span><strong>{region.resistance}%</strong></div><div><span>MDR</span><strong>{region.mdr}%</strong></div><div><span>Изолятов</span><strong>{formatNumber(region.isolates)}</strong></div><div><span>Лаб.</span><strong>{region.labs}</strong></div></div>
                <div className={styles.change}><span>Изменение за 3 года</span><strong className={region.delta > 0 ? styles.bad : styles.good}>{region.delta > 0 ? <TrendingUp size={15} /> : <TrendingDown size={15} />}{region.delta > 0 ? "+" : ""}{region.delta} п.п.</strong></div>
                <button className={styles.fullButton} onClick={() => { setCompareA(region.name); setSection("compare"); }}><GitCompareArrows size={15} /> Сравнить этот регион</button>
                <div className={styles.regionRanking}><strong>Топ по резистентности</strong>{[...regionRows].sort((x,y) => y.resistance - x.resistance).slice(0,6).map((item, index) => <button key={item.name} onClick={() => setSelectedRegion(item.name)}><span>{index + 1}. {item.name}</span><b>{item.resistance}%</b></button>)}</div>
              </article>
            </section>
          )}

          {section === "analytics" && (
            <section className={styles.analyticsGrid}>
              <article className={`${styles.panel} ${styles.trendPanel}`}>
                <div className={styles.panelHead}><div><h2>Динамика резистентности</h2><p>Национальный тренд · доля R, %</p></div><TrendingUp size={19} /></div>
                <div className={styles.chart}><div className={styles.yAxis}><span>35</span><span>30</span><span>25</span><span>20</span><span>15</span></div><svg viewBox="0 0 600 180" preserveAspectRatio="none">{[30,70,110,150].map((y) => <line key={y} x1="0" x2="600" y1={y} y2={y} />)}<polyline points={linePoints(nationalTrend)} /></svg></div>
                <div className={styles.xAxis}>{trendYears.map((year) => <span key={year}>{year}</span>)}</div>
              </article>

              <article className={styles.panel}>
                <div className={styles.panelHead}><div><h2>Распределение регионов</h2><p>Количество регионов по диапазону R</p></div><BarChart3 size={19} /></div>
                <div className={styles.bars}>{[["<20%", regionRows.filter(r=>r.resistance<20).length],["20–25%", regionRows.filter(r=>r.resistance>=20&&r.resistance<25).length],["25–30%", regionRows.filter(r=>r.resistance>=25&&r.resistance<30).length],["30–35%", regionRows.filter(r=>r.resistance>=30&&r.resistance<35).length],[">35%", regionRows.filter(r=>r.resistance>=35).length]].map(([label,value]) => <div key={String(label)}><span>{label}</span><i><b style={{ width: `${Number(value) * 18}%` }} /></i><strong>{value}</strong></div>)}</div>
              </article>

              <article className={`${styles.panel} ${styles.wide}`}>
                <div className={styles.panelHead}><div><h2>Региональная таблица</h2><p>Сортировка по доле резистентных изолятов</p></div><span className={styles.mini}>20 регионов / городов</span></div>
                <div className={styles.regionTable}><div><span>Регион</span><span>R</span><span>MDR</span><span>Изоляты</span><span>Δ 3 года</span><span>Лаб.</span></div>{[...regionRows].sort((x,y)=>y.resistance-x.resistance).map((item) => <button key={item.name} onClick={() => { setSelectedRegion(item.name); setSection("map"); }}><strong>{item.name}</strong><span>{item.resistance}%</span><span>{item.mdr}%</span><span>{formatNumber(item.isolates)}</span><span className={item.delta > 0 ? styles.bad : styles.good}>{item.delta > 0 ? "+" : ""}{item.delta}</span><span>{item.labs}</span></button>)}</div>
              </article>
            </section>
          )}

          {section === "compare" && (
            <section className={styles.compareLayout}>
              <article className={`${styles.panel} ${styles.comparePanel}`}>
                <div className={styles.panelHead}><div><h2>Сравнение двух регионов</h2><p>Одинаковый фильтр микроорганизма, антибиотика и материала</p></div><GitCompareArrows size={19} /></div>
                <div className={styles.compareSelectors}><label><span>Регион A</span><select value={compareA} onChange={(e)=>setCompareA(e.target.value)}>{regionRows.map(r=><option key={r.name}>{r.name}</option>)}</select></label><label><span>Регион B</span><select value={compareB} onChange={(e)=>setCompareB(e.target.value)}>{regionRows.map(r=><option key={r.name}>{r.name}</option>)}</select></label></div>
                <div className={styles.compareCards}><div><span>A</span><h3>{a.name}</h3><strong>{a.resistance}% R</strong><small>{formatNumber(a.isolates)} изолятов</small></div><div className={styles.vs}>VS</div><div><span>B</span><h3>{b.name}</h3><strong>{b.resistance}% R</strong><small>{formatNumber(b.isolates)} изолятов</small></div></div>
                <div className={styles.compareRows}>{[["Резистентность",a.resistance,b.resistance,"%"],["MDR",a.mdr,b.mdr,"%"],["Рост за 3 года",a.delta,b.delta," п.п."],["Лаборатории",a.labs,b.labs,""]].map(([label,av,bv,suffix]) => <div key={String(label)}><strong>{label}</strong><span><b>{av}{suffix}</b><i><em style={{width:`${Math.min(100,Number(av)*2.2)}%`}} /></i></span><span><b>{bv}{suffix}</b><i><em style={{width:`${Math.min(100,Number(bv)*2.2)}%`}} /></i></span></div>)}</div>
              </article>

              <article className={styles.panel}>
                <div className={styles.panelHead}><div><h2>Разница</h2><p>B относительно A</p></div><Activity size={19} /></div>
                <div className={styles.deltaHero}><span>Δ R</span><strong className={b.resistance-a.resistance>0?styles.bad:styles.good}>{b.resistance-a.resistance>0?"+":""}{(b.resistance-a.resistance).toFixed(1)} п.п.</strong></div>
                <p className={styles.explain}>{Math.abs(b.resistance-a.resistance) < 3 ? "Профили близки: разница менее 3 п.п." : b.resistance > a.resistance ? `${b.name} имеет более высокий демонстрационный уровень резистентности.` : `${a.name} имеет более высокий демонстрационный уровень резистентности.`}</p>
                <button className={styles.fullButton} onClick={()=>{setSelectedRegion(b.name);setSection("map");}}><MapPinned size={15}/> Открыть регион B на карте</button>
              </article>
            </section>
          )}

          {section === "signals" && (
            <section className={styles.signalsLayout}>
              <article className={`${styles.panel} ${styles.wide}`}>
                <div className={styles.panelHead}><div><h2>Мониторинг сигналов</h2><p>Прототип очереди событий, требующих внимания</p></div><div className={styles.signalFilters}>{[["Все","Все"],["Критичные","critical"],["Высокие","high"],["Средние","medium"],["Наблюдение","watch"]].map(([label,value])=><button key={value} className={signalFilter===value?styles.filterActive:""} onClick={()=>setSignalFilter(value)}>{label}</button>)}</div></div>
                <div className={styles.signalTable}><div><span>Приоритет</span><span>Сигнал</span><span>Регион</span><span>Метрика</span><span>Статус</span></div>{filteredSignals.map(item=><button key={item.id} onClick={()=>{setSelectedRegion(item.region);setSection("map");}}><span className={`${styles.priority} ${styles[item.level]}`}>{item.level === "critical" ? "Критичный" : item.level === "high" ? "Высокий" : item.level === "medium" ? "Средний" : "Наблюдение"}</span><span><strong>{item.title}</strong><small>{item.detail}</small></span><span>{item.region}</span><b>{item.metric}</b><span>{item.status}</span></button>)}</div>
              </article>

              <article className={styles.panel}>
                <div className={styles.panelHead}><div><h2>Логика сигналов</h2><p>Что будет автоматизировано после подключения данных</p></div><BellRing size={19} /></div>
                <div className={styles.rules}><div><AlertTriangle size={16}/><span><strong>Порог</strong>Превышение заданной доли R/MDR.</span></div><div><TrendingUp size={16}/><span><strong>Тренд</strong>Устойчивый рост несколько периодов подряд.</span></div><div><GitCompareArrows size={16}/><span><strong>Аномалия</strong>Сильное отличие от национального или соседнего профиля.</span></div><div><TestTube2 size={16}/><span><strong>Редкое событие</strong>Новая значимая комбинация организм × антибиотик.</span></div></div>
              </article>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
