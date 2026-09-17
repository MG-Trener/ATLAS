"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Database,
  FlaskConical,
  Map,
  Microscope,
  ShieldAlert,
  ShieldCheck,
  TestTube2,
  TrendingUp,
} from "lucide-react";
import styles from "./overview.module.css";

type Risk = "critical" | "high" | "medium" | "watch";

type Signal = {
  risk: Risk;
  title: string;
  detail: string;
  region: string;
  metric: string;
};

const organisms = [
  { name: "Acinetobacter baumannii", value: 44.6, delta: 6.8, marker: "MEM", tag: "CRAB · предполагаемый", n: 2842 },
  { name: "Escherichia coli", value: 28.6, delta: 4.1, marker: "CRO", tag: "ESBL · предполагаемый", n: 14382 },
  { name: "Klebsiella pneumoniae", value: 39.8, delta: 7.4, marker: "CRO", tag: "ESBL/CRE · предполагаемый", n: 9760 },
  { name: "Pseudomonas aeruginosa", value: 31.2, delta: 3.5, marker: "MEM", tag: "MDR · demo v0.1", n: 4384 },
  { name: "Staphylococcus aureus", value: 21.7, delta: 1.9, marker: "FOX", tag: "MRSA · предполагаемый", n: 6890 },
];

const antibiotics = [
  { code: "AMP", name: "Ампициллин", value: 68.7, delta: 5.8 },
  { code: "CIP", name: "Ципрофлоксацин", value: 34.1, delta: 3.2 },
  { code: "CRO", name: "Цефтриаксон", value: 28.6, delta: 4.1 },
  { code: "SXT", name: "Триметоприм/сульфаметоксазол", value: 32.4, delta: 1.7 },
  { code: "MEM", name: "Меропенем", value: 1.3, delta: 0.3 },
];

const signals: Signal[] = [
  { risk: "critical", title: "Рост карбапенем-резистентности у A. baumannii", detail: "Устойчивый рост третий год подряд; профиль выше национального среднего.", region: "Восточно-Казахстанская", metric: "+8,1 п.п." },
  { risk: "high", title: "Рост ESBL у K. pneumoniae", detail: "Увеличение доли ESBL-профиля за последние три года.", region: "Астана", metric: "+7,4 п.п." },
  { risk: "high", title: "Ципрофлоксацин: выраженный региональный разброс", detail: "Разница между верхним и нижним квартилем регионов остаётся высокой.", region: "Алматы", metric: "18,2 п.п." },
  { risk: "medium", title: "Недостаточный объём AST в части регионов", detail: "Низкий объём тестирования снижает устойчивость регионального сравнения.", region: "Северо-Казахстанская", metric: "N < 500" },
  { risk: "watch", title: "Меропенем: пока низкий уровень, но положительный тренд", detail: "Национальный уровень невысокий, требуется наблюдение за динамикой.", region: "Казахстан", metric: "+0,3 п.п." },
];

const coverage = [
  { label: "Лаборатории с данными", value: 68, target: 82 },
  { label: "Заполненность региона", value: 87, target: 95 },
  { label: "AST с валидной интерпретацией", value: 94, target: 98 },
  { label: "Изоляты с материалом", value: 91, target: 97 },
];

const regionHighlights = [
  { name: "Алматы", resistance: 33.1, delta: 3.7, pair: "E. coli × CRO", n: 1680 },
  { name: "Астана", resistance: 31.4, delta: 4.8, pair: "E. coli × CRO", n: 1420 },
  { name: "Восточно-Казахстанская", resistance: 36.4, delta: 5.4, pair: "E. coli × CRO", n: 730 },
  { name: "Карагандинская", resistance: 29.8, delta: 2.1, pair: "E. coli × CRO", n: 960 },
  { name: "Павлодарская", resistance: 24.2, delta: -0.9, pair: "E. coli × CRO", n: 610 },
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value);
}

function ci95(percent: number, n: number) {
  const p = percent / 100;
  const z = 1.96;
  const denominator = 1 + z * z / n;
  const centre = (p + z * z / (2 * n)) / denominator;
  const margin = z * Math.sqrt((p * (1 - p) + z * z / (4 * n)) / n) / denominator;
  return `${Math.max(0, (centre - margin) * 100).toFixed(1)}–${Math.min(100, (centre + margin) * 100).toFixed(1)}%`;
}

function Sparkline({ values }: { values: number[] }) {
  const width = 320;
  const height = 92;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - 10 - ((value - min) / range) * 66;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg className={styles.sparkline} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <line x1="0" x2={width} y1="80" y2="80" />
      <polyline points={points} />
    </svg>
  );
}

function Kpi({ icon: Icon, label, value, detail, tone }: { icon: typeof Activity; label: string; value: string; detail: string; tone: "blue" | "red" | "orange" | "green" }) {
  return (
    <article className={styles.kpi}>
      <span className={`${styles.kpiIcon} ${styles[tone]}`}><Icon size={20} /></span>
      <div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>
    </article>
  );
}

export default function OverviewDashboard() {
  const [period, setPeriod] = useState("2026 YTD");
  const [material, setMaterial] = useState("Все материалы");
  const [signalFilter, setSignalFilter] = useState<"all" | Risk>("all");

  const visibleSignals = useMemo(() => signalFilter === "all" ? signals : signals.filter((item) => item.risk === signalFilter), [signalFilter]);

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand}><span>AMR</span><strong>Atlas</strong><small>Казахстан</small></Link>
        <nav>
          <Link className={styles.activeNav} href="/overview">Обзор</Link>
          <Link href="/insights">Карта и аналитика</Link>
          <Link href="/reference">Справочники</Link>
          <Link href="/whonet">WHONET</Link>
        </nav>
        <span className={styles.prototype}>Демонстрационные данные</span>
      </header>

      <section className={styles.wrap}>
        <section className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>Национальный обзор антимикробной резистентности</span>
            <h1>AMR Atlas Казахстан</h1>
            <p>Единая аналитическая витрина для мониторинга резистентности, динамики, региональных различий, качества данных и сигналов эпиднадзора.</p>
          </div>
          <div className={styles.heroActions}>
            <Link href="/insights"><Map size={17} /> Открыть карту <ArrowRight size={15} /></Link>
            <Link href="/reference"><BookOpen size={17} /> Справочники</Link>
          </div>
        </section>

        <section className={styles.filters}>
          <label><span>Период</span><select value={period} onChange={(event) => setPeriod(event.target.value)}><option>2026 YTD</option><option>2025</option><option>2024–2026</option><option>2020–2026 YTD</option></select></label>
          <label><span>Материал</span><select value={material} onChange={(event) => setMaterial(event.target.value)}><option>Все материалы</option><option>Кровь</option><option>Моча</option><option>Респираторный материал</option><option>Раны</option></select></label>
          <label><span>Регион</span><select defaultValue="Казахстан"><option>Казахстан</option><option>Астана</option><option>Алматы</option><option>Карагандинская</option><option>Восточно-Казахстанская</option></select></label>
          <label><span>Источник</span><select defaultValue="Все лаборатории"><option>Все лаборатории</option><option>WHONET</option><option>Ручной импорт</option></select></label>
          <span className={styles.filterSummary}>{period} · {material}</span>
        </section>

        <section className={styles.kpiGrid}>
          <Kpi icon={FlaskConical} label="Изолятов в витрине" value="186 742" detail="валидные наблюдения" tone="blue" />
          <Kpi icon={Activity} label="%R · E. coli × CRO" value="28,6%" detail="4 113 / 14 382 · 95% ДИ 27,9–29,3" tone="red" />
          <Kpi icon={ShieldAlert} label="MDR · demo v0.1" value="12,4%" detail="проект определения" tone="orange" />
          <Kpi icon={ShieldCheck} label="Покрытие регионов" value="20 / 20" detail="регионы и города респ. значения" tone="green" />
        </section>

        <section className={styles.mainGrid}>
          <article className={`${styles.panel} ${styles.trendPanel}`}>
            <div className={styles.panelHead}><div><h2>Национальная динамика %R</h2><p>E. coli × цефтриаксон · 2020–2026 YTD</p></div><TrendingUp size={20} /></div>
            <Sparkline values={[20.9, 22.0, 23.1, 24.4, 25.8, 27.2, 28.6]} />
            <div className={styles.years}>{["2020","2021","2022","2023","2024","2025","2026 YTD"].map((year) => <span key={year}>{year}</span>)}</div>
            <div className={styles.trendFooter}><strong>+7,7 п.п.</strong><span>за 6 лет</span><i /> <span>описательный демо-тренд; N и 95% ДИ обязательны при публикации</span></div>
          </article>

          <article className={`${styles.panel} ${styles.signalPanel}`}>
            <div className={styles.panelHead}><div><h2>AMR-сигналы</h2><p>События, требующие внимания</p></div><AlertTriangle size={20} /></div>
            <div className={styles.signalFilters}>{(["all","critical","high","medium","watch"] as const).map((item) => <button key={item} className={signalFilter === item ? styles.filterActive : ""} onClick={() => setSignalFilter(item)}>{item === "all" ? "Все" : item === "critical" ? "Критичные" : item === "high" ? "Высокие" : item === "medium" ? "Средние" : "Наблюдение"}</button>)}</div>
            <div className={styles.signalList}>{visibleSignals.slice(0,4).map((item) => <Link href="/insights" key={item.title} className={`${styles.signal} ${styles[item.risk]}`}><span>{item.risk === "critical" ? "Критичный" : item.risk === "high" ? "Высокий" : item.risk === "medium" ? "Средний" : "Наблюдение"}</span><div><strong>{item.title}</strong><small>{item.detail}</small><em>{item.region}</em></div><b>{item.metric}</b></Link>)}</div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHead}><div><h2>Маркерные профили эпиднадзора</h2><p>Разные пары организм × препарат нельзя ранжировать между собой</p></div><Microscope size={20} /></div>
            <div className={styles.rankList}>{organisms.map((item) => <Link href="/" key={item.name}><span className={styles.rank}>AST</span><div><strong>{item.name} × {item.marker}</strong><small>{item.tag} · N {formatNumber(item.n)} · 95% ДИ {ci95(item.value, item.n)}</small></div><span className={styles.bar}><i style={{ width: `${item.value}%` }} /></span><b>{item.value.toFixed(1)}%</b><em>{item.delta >= 0 ? "+" : ""}{item.delta.toFixed(1)}</em></Link>)}</div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHead}><div><h2>Антибиотики: текущий профиль</h2><p>Доля резистентных изолятов</p></div><TestTube2 size={20} /></div>
            <div className={styles.drugList}>{antibiotics.map((item) => <Link href="/" key={item.code}><span>{item.code}</span><div><strong>{item.name}</strong><small>Δ 3 года +{item.delta.toFixed(1)} п.п.</small></div><b>{item.value.toFixed(1)}%</b><i><em style={{ width: `${item.value}%` }} /></i></Link>)}</div>
          </article>

          <article className={`${styles.panel} ${styles.coveragePanel}`}>
            <div className={styles.panelHead}><div><h2>Качество и охват данных</h2><p>Готовность витрины к национальной аналитике</p></div><Database size={20} /></div>
            <div className={styles.coverageList}>{coverage.map((item) => <div key={item.label}><span><strong>{item.label}</strong><small>целевой уровень {item.target}%</small></span><div><i style={{ width: `${item.value}%` }} /></div><b>{item.value}%</b></div>)}</div>
            <div className={styles.qualityNote}><ShieldCheck size={18} /><span><strong>Качество данных: 91 / 100</strong><small>Основные ограничения сейчас связаны с полнотой отдельных регионов и стандартизацией кодов.</small></span></div>
          </article>

          <article className={`${styles.panel} ${styles.regionPanel}`}>
            <div className={styles.panelHead}><div><h2>Региональные сигналы для валидации</h2><p>Не рейтинг: одна маркерная пара, с учётом N и неопределённости</p></div><BarChart3 size={20} /></div>
            <div className={styles.regionList}>{regionHighlights.map((item) => <Link href="/insights" key={item.name}><span><strong>{item.name}</strong><small>{item.pair} · N {formatNumber(item.n)} · 95% ДИ {ci95(item.resistance, item.n)}</small></span><b>{item.resistance}% R · {item.delta >= 0 ? "+" : ""}{item.delta} п.п.</b><ArrowRight size={15} /></Link>)}</div>
          </article>
        </section>

        <section className={styles.quickGrid}>
          <Link href="/insights"><Map size={22} /><span><strong>Карта Казахстана</strong><small>Региональная резистентность и сравнение</small></span><ArrowRight size={16} /></Link>
          <Link href="/reference"><BookOpen size={22} /><span><strong>Справочники</strong><small>Микроорганизмы, антибиотики, WHONET-коды</small></span><ArrowRight size={16} /></Link>
          <Link href="/"><Microscope size={22} /><span><strong>Детальный анализ</strong><small>Карточки возбудителей и антибиотиков</small></span><ArrowRight size={16} /></Link>
          <Link href="/whonet"><Database size={22} /><span><strong>Источники данных</strong><small>Подготовка импорта WHONET</small></span><ArrowRight size={16} /></Link>
        </section>
      </section>
    </main>
  );
}
