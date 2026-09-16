"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Database,
  FileBarChart,
  FlaskConical,
  Gauge,
  GitBranch,
  Info,
  Layers3,
  Map,
  Microscope,
  Network,
  ShieldCheck,
  TestTube2,
} from "lucide-react";
import styles from "./about.module.css";

type Section = "about" | "method" | "sources" | "coverage" | "reports";

type CoverageRow = {
  region: string;
  labs: number;
  isolates: number;
  completeness: number;
  ast: number;
  status: "good" | "watch" | "limited";
};

const tabs: { id: Section; label: string }[] = [
  { id: "about", label: "О платформе" },
  { id: "method", label: "Методология" },
  { id: "sources", label: "Источники данных" },
  { id: "coverage", label: "Покрытие лабораторий" },
  { id: "reports", label: "Отчёты и публикации" },
];

const pipeline = [
  { icon: Database, title: "Получение", text: "WHONET и другие согласованные источники лабораторных данных." },
  { icon: GitBranch, title: "Нормализация", text: "Сопоставление полей, справочников, кодов организмов и антибиотиков." },
  { icon: ShieldCheck, title: "Контроль качества", text: "Проверка обязательных полей, дат, дублей, AST и полноты." },
  { icon: Layers3, title: "Стандартизация", text: "Единая модель наблюдения с версией справочников и правил интерпретации." },
  { icon: BarChart3, title: "Агрегация", text: "Региональные и национальные показатели без раскрытия персональных данных." },
  { icon: Gauge, title: "Сигналы", text: "Поиск роста резистентности, MDR и значимых региональных отклонений." },
];

const principles = [
  ["Трассируемость", "Каждый показатель должен быть связан с источником, периодом, версией справочника и правилами обработки."],
  ["Воспроизводимость", "Расчёты должны повторяться при одинаковом наборе данных и одинаковой версии методики."],
  ["Минимизация и защита данных", "Публичные экраны используют агрегаты; персональные идентификаторы не должны выводиться в аналитическую витрину."],
  ["Сопоставимость", "Национальные, региональные и лабораторные срезы рассчитываются по одинаковым определениям."],
];

const sourceRows = [
  { name: "WHONET", role: "Основной стартовый источник", format: "CSV / TXT / DAT", state: "В прототипе", detail: "Изоляты, микроорганизмы, материал, даты, AST, учреждение и регион после сопоставления." },
  { name: "ЛИС лабораторий", role: "Будущее прямое подключение", format: "API / ETL", state: "Планируется", detail: "Регламентированный обмен после появления серверной части и модели доступа." },
  { name: "Ручной структурированный импорт", role: "Резервный канал", format: "CSV / XLSX", state: "Планируется", detail: "Для лабораторий без автоматического обмена с обязательной валидацией шаблона." },
  { name: "Справочники", role: "Нормализация", format: "WHONET / Atlas", state: "Развивается", detail: "Микроорганизмы, антибиотики, материалы, регионы, учреждения, версии интерпретации." },
];

const coverageRows: CoverageRow[] = [
  { region: "Астана", labs: 7, isolates: 22680, completeness: 96, ast: 97, status: "good" },
  { region: "Алматы", labs: 9, isolates: 27910, completeness: 95, ast: 96, status: "good" },
  { region: "Карагандинская", labs: 5, isolates: 19340, completeness: 92, ast: 94, status: "good" },
  { region: "Восточно-Казахстанская", labs: 4, isolates: 13140, completeness: 89, ast: 91, status: "watch" },
  { region: "Павлодарская", labs: 4, isolates: 11700, completeness: 90, ast: 93, status: "watch" },
  { region: "Актюбинская", labs: 3, isolates: 10280, completeness: 88, ast: 90, status: "watch" },
  { region: "Северо-Казахстанская", labs: 2, isolates: 4480, completeness: 73, ast: 79, status: "limited" },
];

const reports = [
  { period: "2026", title: "Национальный обзор AMR", type: "Годовой отчёт", state: "Макет", text: "Резистентность, MDR, ключевые пары организм–антибиотик, региональные различия и качество данных." },
  { period: "Q3 2026", title: "Сигналы эпиднадзора", type: "Квартальный бюллетень", state: "Макет", text: "Приоритетные изменения, устойчивые тренды и территории, требующие проверки." },
  { period: "2024–2026", title: "Региональное сравнение", type: "Аналитический отчёт", state: "Планируется", text: "Сопоставление регионов с учётом объёма выборки, структуры материалов и полноты AST." },
  { period: "Методика v0.1", title: "Методология AMR Atlas", type: "Технический документ", state: "В разработке", text: "Определения, правила включения, дедупликация, расчёт показателей и контроль качества." },
];

function number(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value);
}

export default function AboutPlatform() {
  const [section, setSection] = useState<Section>("about");
  const [coverageFilter, setCoverageFilter] = useState<"all" | CoverageRow["status"]>("all");

  const visibleCoverage = useMemo(
    () => coverageFilter === "all" ? coverageRows : coverageRows.filter((item) => item.status === coverageFilter),
    [coverageFilter],
  );

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand}><span>AMR</span><strong>Atlas</strong><small>Казахстан</small></Link>
        <nav>
          <Link href="/overview">Обзор</Link>
          <Link href="/insights">Карта и аналитика</Link>
          <Link href="/reference">Справочники</Link>
          <Link className={styles.activeNav} href="/about">О платформе</Link>
        </nav>
        <span className={styles.badge}>Методологический раздел</span>
      </header>

      <section className={styles.wrap}>
        <section className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>AMR Atlas · информационный и методологический центр</span>
            <h1>Как устроена платформа и откуда берутся показатели</h1>
            <p>Здесь фиксируются правила обработки данных, происхождение показателей, охват лабораторий и будущая система публичных отчётов. Пока данные в аналитических экранах демонстрационные, этот раздел описывает целевую архитектуру продукта.</p>
          </div>
          <div className={styles.heroLinks}>
            <Link href="/overview"><BarChart3 size={17} /> Национальный обзор</Link>
            <Link href="/reference"><BookOpen size={17} /> Справочники</Link>
          </div>
        </section>

        <section className={styles.tabs}>
          {tabs.map((tab) => <button key={tab.id} onClick={() => setSection(tab.id)} className={section === tab.id ? styles.tabActive : ""}>{tab.label}</button>)}
        </section>

        {section === "about" && (
          <>
            <section className={styles.summaryGrid}>
              <article><Network size={23} /><strong>Единая витрина</strong><p>Сводит лабораторные наблюдения в единую модель для национального и регионального анализа.</p></article>
              <article><Microscope size={23} /><strong>Микробиология в центре модели</strong><p>Организм, материал, AST, фенотипы, учреждение, регион и время остаются ключевыми измерениями.</p></article>
              <article><ShieldCheck size={23} /><strong>Качество до аналитики</strong><p>Показатель не должен попадать в публичную витрину без проверки структуры и достаточности данных.</p></article>
              <article><FileBarChart size={23} /><strong>Отчёты из той же модели</strong><p>Дашборды, карты и будущие PDF/XLSX-отчёты должны рассчитываться из одной нормализованной основы.</p></article>
            </section>

            <section className={styles.twoCol}>
              <article className={styles.panel}>
                <div className={styles.panelHead}><div><h2>Что должен давать Atlas</h2><p>Целевые функции платформы</p></div><Map size={20} /></div>
                <div className={styles.goalList}>
                  {["Показывать резистентность по регионам и периодам", "Сравнивать микроорганизмы и антибиотики", "Выявлять рост MDR и значимые отклонения", "Показывать качество и достаточность исходных данных", "Формировать воспроизводимые отчёты", "Хранить версии справочников и методики"].map((item) => <div key={item}><CheckCircle2 size={16} /><span>{item}</span></div>)}
                </div>
              </article>
              <article className={styles.panel}>
                <div className={styles.panelHead}><div><h2>Текущий этап</h2><p>Что уже есть в прототипе</p></div><Info size={20} /></div>
                <div className={styles.stageList}>
                  <div><b>01</b><span><strong>Национальный обзор</strong><small>KPI, тренды, сигналы, качество данных</small></span></div>
                  <div><b>02</b><span><strong>Карта и аналитика</strong><small>Региональные сравнения и AMR-сигналы</small></span></div>
                  <div><b>03</b><span><strong>Детальные карточки</strong><small>Микроорганизмы и антибиотики</small></span></div>
                  <div><b>04</b><span><strong>Справочники</strong><small>Версионируемая база терминов и кодов</small></span></div>
                </div>
              </article>
            </section>
          </>
        )}

        {section === "method" && (
          <>
            <section className={styles.pipeline}>
              {pipeline.map(({ icon: Icon, title, text }, index) => <article key={title}><span>{index + 1}</span><Icon size={21} /><strong>{title}</strong><p>{text}</p>{index < pipeline.length - 1 && <ArrowRight size={16} />}</article>)}
            </section>
            <section className={styles.twoCol}>
              <article className={styles.panel}>
                <div className={styles.panelHead}><div><h2>Базовые правила включения</h2><p>Целевая методика v0.1</p></div><FlaskConical size={20} /></div>
                <div className={styles.ruleList}>
                  <div><strong>Изолят должен иметь дату</strong><span>Без валидного периода наблюдение нельзя корректно включить в временную аналитику.</span></div>
                  <div><strong>Организм должен быть нормализован</strong><span>Исходный код или название связывается с версией справочника Atlas/WHONET.</span></div>
                  <div><strong>AST должен иметь трактуемый результат</strong><span>R/S/I или числовой результат должны быть связаны с препаратом и правилами интерпретации.</span></div>
                  <div><strong>Дубли должны выявляться до агрегации</strong><span>Правила дедупликации фиксируются в методике и не меняются скрытно.</span></div>
                </div>
              </article>
              <article className={styles.panel}>
                <div className={styles.panelHead}><div><h2>Принципы</h2><p>Что важно для доверия к показателям</p></div><ShieldCheck size={20} /></div>
                <div className={styles.principles}>{principles.map(([title, text]) => <div key={title}><strong>{title}</strong><span>{text}</span></div>)}</div>
              </article>
            </section>
            <div className={styles.note}><Info size={18} /><span><strong>Важно:</strong> конкретные правила дедупликации, выбор знаменателя, обработка повторных изолятов и версия CLSI/EUCAST будут вынесены в отдельный версионируемый методологический документ до подключения реальных данных.</span></div>
          </>
        )}

        {section === "sources" && (
          <section className={styles.panel}>
            <div className={styles.panelHead}><div><h2>Источники и роль каждого слоя</h2><p>Планируемая схема поступления и нормализации данных</p></div><Database size={20} /></div>
            <div className={styles.sourceTable}>
              <div><span>Источник</span><span>Назначение</span><span>Формат</span><span>Статус</span><span>Что получаем</span></div>
              {sourceRows.map((item) => <article key={item.name}><strong>{item.name}</strong><span>{item.role}</span><code>{item.format}</code><em>{item.state}</em><p>{item.detail}</p></article>)}
            </div>
            <div className={styles.sourceFlow}><span>Лаборатория</span><ArrowRight size={16} /><span>Staging</span><ArrowRight size={16} /><span>Валидация</span><ArrowRight size={16} /><span>Нормализованная модель</span><ArrowRight size={16} /><span>Агрегаты Atlas</span></div>
          </section>
        )}

        {section === "coverage" && (
          <>
            <section className={styles.coverageStats}>
              <article><strong>68</strong><span>лабораторий в демонстрационной модели</span></article>
              <article><strong>20 / 20</strong><span>территорий представлены в макете</span></article>
              <article><strong>91%</strong><span>условный индекс полноты данных</span></article>
              <article><strong>94%</strong><span>AST с интерпретируемым результатом</span></article>
            </section>
            <section className={styles.panel}>
              <div className={styles.panelHead}><div><h2>Покрытие и качество по регионам</h2><p>Демонстрационные значения для проектирования экрана</p></div><Map size={20} /></div>
              <div className={styles.coverageFilters}>{(["all","good","watch","limited"] as const).map((item) => <button key={item} className={coverageFilter === item ? styles.filterActive : ""} onClick={() => setCoverageFilter(item)}>{item === "all" ? "Все" : item === "good" ? "Хорошее" : item === "watch" ? "Наблюдение" : "Ограниченное"}</button>)}</div>
              <div className={styles.coverageTable}>
                <div><span>Регион</span><span>Лаб.</span><span>Изолятов</span><span>Полнота</span><span>AST</span><span>Статус</span></div>
                {visibleCoverage.map((item) => <article key={item.region}><strong>{item.region}</strong><span>{item.labs}</span><span>{number(item.isolates)}</span><span>{item.completeness}%</span><span>{item.ast}%</span><em className={styles[item.status]}>{item.status === "good" ? "Хорошее" : item.status === "watch" ? "Наблюдение" : "Ограниченное"}</em></article>)}
              </div>
            </section>
          </>
        )}

        {section === "reports" && (
          <>
            <section className={styles.reportGrid}>
              {reports.map((item) => <article key={item.title}><span>{item.type}</span><h3>{item.title}</h3><p>{item.text}</p><div><b>{item.period}</b><em>{item.state}</em></div></article>)}
            </section>
            <div className={styles.note}><FileBarChart size={18} /><span>На этом этапе карточки отчётов показывают будущую структуру раздела. Файлы не публикуются, пока Atlas работает на демонстрационных данных.</span></div>
          </>
        )}

        <section className={styles.bottomNav}>
          <Link href="/overview"><BarChart3 size={19} /><span><strong>Национальный обзор</strong><small>Основные показатели и AMR-сигналы</small></span><ArrowRight size={15} /></Link>
          <Link href="/insights"><Map size={19} /><span><strong>Карта и аналитика</strong><small>Региональные различия и сравнение</small></span><ArrowRight size={15} /></Link>
          <Link href="/reference"><TestTube2 size={19} /><span><strong>Справочники</strong><small>Организмы, антибиотики и коды</small></span><ArrowRight size={15} /></Link>
        </section>
      </section>
    </main>
  );
}
