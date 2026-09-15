"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  BookOpen,
  ChevronDown,
  Database,
  Download,
  FlaskConical,
  Globe2,
  Home,
  Map,
  Microscope,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  TestTube2,
  TrendingUp,
  Users,
} from "lucide-react";

type NavItem = { label: string; icon: React.ComponentType<{ size?: number }> };

const navItems: NavItem[] = [
  { label: "Обзор", icon: Home },
  { label: "Микроорганизмы", icon: Microscope },
  { label: "Антибиотики", icon: TestTube2 },
  { label: "Карта", icon: Map },
  { label: "Аналитика", icon: BarChart3 },
  { label: "Сравнение", icon: SlidersHorizontal },
  { label: "Сигналы", icon: Bell },
  { label: "Данные и методы", icon: Database },
  { label: "Публикации", icon: BookOpen },
];

const antibiotics = [
  { name: "Ампициллин", resistance: 68.7, n: "12 843", tone: "danger" },
  { name: "Ципрофлоксацин", resistance: 34.1, n: "11 927", tone: "warning" },
  { name: "Триметоприм/сульфаметоксазол", resistance: 32.4, n: "10 334", tone: "warning" },
  { name: "Цефтриаксон", resistance: 28.6, n: "14 382", tone: "warning" },
  { name: "Нитрофурантоин", resistance: 8.5, n: "9 442", tone: "success" },
  { name: "Амикацин", resistance: 6.2, n: "8 431", tone: "success" },
  { name: "Меропенем", resistance: 1.3, n: "7 918", tone: "success" },
];

const regions = [
  { name: "ЗКО", value: 14, x: 18, y: 44 },
  { name: "Актобе", value: 21, x: 33, y: 55 },
  { name: "СКО", value: 18, x: 50, y: 25 },
  { name: "Астана", value: 28, x: 58, y: 43 },
  { name: "Караганда", value: 26, x: 61, y: 62 },
  { name: "Павлодар", value: 21, x: 73, y: 36 },
  { name: "ВКО", value: 36, x: 82, y: 54 },
  { name: "Шымкент", value: 20, x: 55, y: 80 },
  { name: "Алматы", value: 33, x: 73, y: 77 },
];

const trend = [18, 21, 24, 26, 28, 29, 31];

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  delta,
  accent = "blue",
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
  detail: string;
  delta?: string;
  accent?: "blue" | "red" | "green" | "cyan";
}) {
  return (
    <article className="stat-card">
      <span className={`stat-icon ${accent}`}><Icon size={21} /></span>
      <div className="stat-copy">
        <span className="eyebrow">{label}</span>
        <div className="stat-row">
          <strong>{value}</strong>
          {delta && <span className={delta.startsWith("+") ? "delta up" : "delta down"}>{delta}</span>}
        </div>
        <span className="muted">{detail}</span>
      </div>
    </article>
  );
}

function MiniTrend({ values = trend }: { values?: number[] }) {
  const points = useMemo(() => values.map((v, i) => `${i * 18},${32 - v * 0.35}`).join(" "), [values]);
  return (
    <svg className="spark" viewBox="0 0 110 36" aria-hidden="true">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Dashboard() {
  const [active, setActive] = useState("Обзор");
  const [organism, setOrganism] = useState("Escherichia coli");
  const [region, setRegion] = useState("Казахстан");
  const [material, setMaterial] = useState("Моча");

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            {Array.from({ length: 16 }).map((_, i) => <i key={i} />)}
          </div>
          <div><strong>AMR Atlas</strong><span>Данные сегодня.<br />Здоровье завтра.</span></div>
        </div>

        <nav className="side-nav" aria-label="Основная навигация">
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} className={active === label ? "active" : ""} onClick={() => setActive(label)}>
              <Icon size={18} /><span>{label}</span>{label === "Сигналы" && <b>3</b>}
            </button>
          ))}
        </nav>

        <div className="sidebar-note">
          <ShieldCheck size={22} />
          <p>Рациональное использование антибиотиков начинается с качественных данных.</p>
        </div>
        <div className="sidebar-footer"><Globe2 size={16} /> Казахстан · прототип v0.1</div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <label className="searchbox">
            <Search size={17} />
            <input placeholder="Поиск микроорганизмов, антибиотиков, регионов..." />
            <kbd>Ctrl K</kbd>
          </label>
          <div className="top-actions">
            <button className="language"><Globe2 size={17} /> RU</button>
            <button className="icon-button" aria-label="Оповещения"><Bell size={18} /><i /></button>
            <div className="profile"><span>АП</span><div><strong>Д-р А. Петров</strong><small>Демо-профиль</small></div><ChevronDown size={15} /></div>
          </div>
        </header>

        <div className="content">
          <section className="hero-row">
            <div>
              <div className="breadcrumbs">Главная <span>/</span> Микроорганизмы <span>/</span> {organism}</div>
              <div className="title-line"><h1>{organism}</h1><span>Enterobacterales</span><span>Грамотрицательная</span></div>
              <p>Интерактивный обзор антимикробной резистентности · демонстрационные данные</p>
            </div>
            <div className="hero-actions"><button className="secondary"><Download size={16} /> Экспорт</button><button className="primary">Сохранить вид</button></div>
          </section>

          <section className="filter-bar">
            <label><span>Микроорганизм</span><select value={organism} onChange={(e) => setOrganism(e.target.value)}><option>Escherichia coli</option><option>Klebsiella pneumoniae</option><option>Staphylococcus aureus</option></select></label>
            <label><span>Материал</span><select value={material} onChange={(e) => setMaterial(e.target.value)}><option>Моча</option><option>Кровь</option><option>Респираторный материал</option><option>Все материалы</option></select></label>
            <label><span>Регион</span><select value={region} onChange={(e) => setRegion(e.target.value)}><option>Казахстан</option><option>Астана</option><option>Алматы</option><option>Караганда</option></select></label>
            <label><span>Период</span><select defaultValue="2020–2026"><option>2020–2026</option><option>2026</option><option>Последние 12 месяцев</option></select></label>
            <button className="filter-more"><SlidersHorizontal size={17} /> Доп. фильтры</button>
            <button className="primary apply">Применить</button>
          </section>

          <section className="stats-grid">
            <StatCard icon={FlaskConical} label="Всего изолятов" value="84 215" detail={`${region}, 2026`} delta="+12%" accent="blue" />
            <StatCard icon={Activity} label="Средняя резистентность" value="28,6%" detail="с 2022 года" delta="+4,1 п.п." accent="red" />
            <StatCard icon={Users} label="MDR" value="8,7%" detail="множественная резистентность" delta="+2,3 п.п." accent="cyan" />
            <StatCard icon={ShieldCheck} label="ESBL-продуценты" value="18,4%" detail="от всех E. coli" delta="+3,1 п.п." accent="green" />
            <StatCard icon={AlertTriangle} label="Активные сигналы" value="3" detail="требуют внимания" delta="+2" accent="red" />
          </section>

          <section className="dashboard-grid">
            <article className="panel antibiotics-panel">
              <div className="panel-head"><div><h2>Резистентность к антибиотикам</h2><p>{organism} · {material} · {region}</p></div><button>Все антибиотики →</button></div>
              <div className="table-head"><span>Антибиотик</span><span>% R</span><span>Динамика</span><span>N</span></div>
              <div className="antibiotic-table">
                {antibiotics.map((item) => (
                  <div className="antibiotic-row" key={item.name}>
                    <span className="antibiotic-name">{item.name}</span>
                    <span className="resistance"><b>{item.resistance.toFixed(1).replace(".", ",")}</b><i className={item.tone} style={{ width: `${Math.min(item.resistance, 72)}%` }} /></span>
                    <span className="mini-trend"><MiniTrend values={trend.map((v) => v * (item.resistance / 28.6))} /></span>
                    <span className="sample-n">{item.n}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel map-panel">
              <div className="panel-head"><div><h2>Карта резистентности</h2><p>Цефтриаксон · {region} · 2026</p></div><select defaultValue="Цефтриаксон"><option>Цефтриаксон</option><option>Ципрофлоксацин</option><option>Меропенем</option></select></div>
              <div className="kaz-map" aria-label="Схематичная карта Казахстана">
                <svg viewBox="0 0 100 58" role="img">
                  <path d="M6 24 L18 15 L30 17 L37 9 L49 11 L56 16 L70 13 L79 20 L92 21 L96 31 L87 35 L89 45 L76 48 L69 54 L54 49 L45 52 L34 47 L23 50 L15 43 L7 40 L10 32 Z" />
                  <path className="map-inner" d="M30 17 L34 47 M49 11 L45 52 M70 13 L69 54 M18 15 L23 50 M79 20 L76 48 M10 32 L89 35" />
                </svg>
                {regions.map((item) => <div key={item.name} className={`map-dot ${item.value >= 32 ? "hot" : item.value >= 24 ? "warm" : "cool"}`} style={{ left: `${item.x}%`, top: `${item.y}%` }}><i /><span>{item.name}<b>{item.value}%</b></span></div>)}
                <div className="map-legend"><span><i className="l1" /> &lt;20%</span><span><i className="l2" /> 20–30%</span><span><i className="l3" /> &gt;30%</span></div>
              </div>
            </article>

            <article className="panel trend-panel">
              <div className="panel-head"><div><h2>Динамика резистентности</h2><p>Цефтриаксон · 2020–2026</p></div><TrendingUp size={20} /></div>
              <div className="trend-chart">
                <div className="y-labels"><span>50</span><span>40</span><span>30</span><span>20</span><span>10</span></div>
                <svg viewBox="0 0 520 215" preserveAspectRatio="none">
                  {[20,60,100,140,180].map((y) => <line key={y} x1="0" x2="520" y1={y} y2={y} className="gridline" />)}
                  <polyline className="world-line" points="0,155 86,143 173,128 260,114 346,99 433,84 520,68" />
                  <polyline className="kz-line" points="0,172 86,158 173,145 260,126 346,114 433,101 520,84" />
                  <polyline className="city-line" points="0,185 86,176 173,165 260,151 346,139 433,128 520,111" />
                </svg>
                <div className="x-labels"><span>2020</span><span>2021</span><span>2022</span><span>2023</span><span>2024</span><span>2025</span><span>2026</span></div>
                <div className="chart-legend"><span className="kz">Казахстан</span><span className="city">Астана</span><span className="world">WHO/GLASS</span></div>
              </div>
            </article>

            <article className="panel alerts-panel">
              <div className="panel-head"><div><h2>Сигналы и оповещения</h2><p>Автоматический мониторинг</p></div><button>Все →</button></div>
              <div className="alerts-list">
                <div><span className="alert-icon high"><AlertTriangle size={17} /></span><p><strong>Рост резистентности к цефтриаксону</strong><small>E. coli · Восточный Казахстан</small></p><b>Высокий</b></div>
                <div><span className="alert-icon medium"><TrendingUp size={17} /></span><p><strong>Увеличение доли ESBL</strong><small>E. coli · стационарные изоляты</small></p><b>Средний</b></div>
                <div><span className="alert-icon info"><Activity size={17} /></span><p><strong>Необычный кластер изолятов</strong><small>Требуется эпидемиологическая оценка</small></p><b>Низкий</b></div>
              </div>
            </article>

            <article className="panel heat-panel">
              <div className="panel-head"><div><h2>Регионы × антибиотики</h2><p>Тепловая карта · % резистентных изолятов</p></div></div>
              <div className="heatmap">
                {[
                  ["Астана", 62, 28, 31, 6, 1],
                  ["Алматы", 71, 33, 38, 5, 2],
                  ["Шымкент", 58, 25, 28, 4, 1],
                  ["Караганда", 65, 26, 32, 6, 1],
                  ["Актобе", 54, 14, 24, 3, 1],
                ].map(([name, ...vals]) => <div className="heat-row" key={String(name)}><span>{name}</span>{vals.map((v, i) => <i key={i} className={Number(v) > 50 ? "h4" : Number(v) > 30 ? "h3" : Number(v) > 15 ? "h2" : "h1"}>{v}</i>)}</div>)}
                <div className="heat-labels"><span>Регион</span><span>AMP</span><span>CRO</span><span>CIP</span><span>AMK</span><span>MEM</span></div>
              </div>
            </article>

            <article className="panel quality-panel">
              <div className="panel-head"><div><h2>Качество данных</h2><p>Прототип · WHONET будет подключён позже</p></div><ShieldCheck size={20} /></div>
              <div className="quality-list">
                <div><span>Полнота данных</span><i><b style={{ width: "92%" }} /></i><strong>92%</strong></div>
                <div><span>Сопоставимость</span><i><b style={{ width: "87%" }} /></i><strong>87%</strong></div>
                <div><span>Лабораторное покрытие</span><i><b style={{ width: "76%" }} /></i><strong>76%</strong></div>
                <div><span>Соответствие стандартам</span><i><b style={{ width: "94%" }} /></i><strong>94%</strong></div>
              </div>
              <div className="data-mode"><Database size={18} /><div><strong>Сейчас: демонстрационные данные</strong><span>Архитектура UI отделена от источника — позже подключим импорт WHONET без переделки экранов.</span></div></div>
            </article>
          </section>
        </div>
      </section>
    </main>
  );
}
