"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Database,
  FlaskConical,
  GitCompareArrows,
  MapPinned,
  Microscope,
  ShieldCheck,
  TestTube2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  RegionProfile,
  regionAntibiotics,
  regionMaterials,
  regionOrganisms,
  regions,
  regionTrend,
} from "../../data/regions";
import styles from "./region.module.css";

function formatNumber(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value);
}

function linePoints(values: number[], width = 620, height = 180) {
  const min = Math.min(...values) - 2;
  const max = Math.max(...values) + 2;
  const range = Math.max(1, max - min);
  return values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");
}

export default function RegionDetail({ region }: { region: RegionProfile }) {
  const trend = regionTrend(region);
  const organisms = regionOrganisms(region);
  const antibiotics = regionAntibiotics(region);
  const materials = regionMaterials(region);
  const nationalResistance = 29.8;
  const nationalMdr = 12.4;
  const rank = [...regions].sort((a, b) => b.resistance - a.resistance).findIndex((item) => item.slug === region.slug) + 1;
  const attention = region.resistance >= 32 || region.delta >= 4 || region.completeness < 85;

  return (
    <main className={styles.page}>
      <section className={styles.wrap}>
        <div className={styles.breadcrumbs}>
          <Link href="/insights"><ArrowLeft size={15} /> Карта AMR</Link>
          <span>/</span>
          <strong>{region.name}</strong>
        </div>

        <section className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>Региональный профиль · демонстрационные данные</span>
            <h1>{region.name}</h1>
            <p>Детальный профиль антимикробной резистентности, охвата лабораторий, структуры материала и качества исходных данных.</p>
          </div>
          <div className={styles.heroActions}>
            <Link href="/insights"><MapPinned size={16} /> На карту</Link>
            <Link href="/insights"><GitCompareArrows size={16} /> Сравнить регион</Link>
          </div>
        </section>

        {attention && (
          <section className={styles.alert}>
            <AlertTriangle size={19} />
            <div><strong>Регион требует внимания</strong><span>{region.resistance >= 32 ? "Уровень R выше условного сигнального диапазона. " : ""}{region.delta >= 4 ? "Наблюдается выраженный рост за три года. " : ""}{region.completeness < 85 ? "Качество/полнота данных ограничивает уверенность интерпретации." : ""}</span></div>
          </section>
        )}

        <section className={styles.kpis}>
          <article><BarChart3 size={20} /><span><small>Резистентность</small><strong>{region.resistance}%</strong><em>{region.resistance > nationalResistance ? "+" : ""}{(region.resistance - nationalResistance).toFixed(1)} п.п. к КЗ</em></span></article>
          <article><AlertTriangle size={20} /><span><small>MDR</small><strong>{region.mdr}%</strong><em>{region.mdr > nationalMdr ? "+" : ""}{(region.mdr - nationalMdr).toFixed(1)} п.п. к КЗ</em></span></article>
          <article><FlaskConical size={20} /><span><small>Изолятов</small><strong>{formatNumber(region.isolates)}</strong><em>в текущем срезе</em></span></article>
          <article><Database size={20} /><span><small>Лабораторий</small><strong>{region.labs}</strong><em>условное покрытие</em></span></article>
          <article><ShieldCheck size={20} /><span><small>Полнота</small><strong>{region.completeness}%</strong><em>AST {region.astQuality}%</em></span></article>
        </section>

        <section className={styles.grid}>
          <article className={`${styles.panel} ${styles.trendPanel}`}>
            <div className={styles.panelHead}><div><h2>Динамика резистентности</h2><p>2020–2026 · доля R, %</p></div>{region.delta >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}</div>
            <div className={styles.chart}>
              <svg viewBox="0 0 620 180" preserveAspectRatio="none">
                {[35, 75, 115, 155].map((y) => <line key={y} x1="0" x2="620" y1={y} y2={y} />)}
                <polyline points={linePoints(trend)} />
              </svg>
            </div>
            <div className={styles.years}>{[2020,2021,2022,2023,2024,2025,2026].map((year) => <span key={year}>{year}</span>)}</div>
            <div className={styles.trendSummary}><strong className={region.delta >= 0 ? styles.bad : styles.good}>{region.delta >= 0 ? "+" : ""}{region.delta} п.п.</strong><span>за 3 года</span><i /><span>место по уровню R: <b>{rank} из {regions.length}</b></span></div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHead}><div><h2>Качество данных</h2><p>Уверенность региональной интерпретации</p></div><ShieldCheck size={20} /></div>
            <div className={styles.qualityRows}>
              <div><span><strong>Полнота обязательных полей</strong><small>цель ≥95%</small></span><i><b style={{ width: `${region.completeness}%` }} /></i><em>{region.completeness}%</em></div>
              <div><span><strong>Интерпретируемый AST</strong><small>цель ≥98%</small></span><i><b style={{ width: `${region.astQuality}%` }} /></i><em>{region.astQuality}%</em></div>
              <div><span><strong>Региональная выборка</strong><small>условная достаточность</small></span><i><b style={{ width: `${Math.min(100, Math.round(region.isolates / 20))}%` }} /></i><em>{region.isolates >= 1500 ? "высокая" : region.isolates >= 800 ? "средняя" : "ограниченная"}</em></div>
            </div>
            <div className={styles.qualityNote}><Database size={17} /><span>После подключения реальных данных здесь появятся дата последней загрузки, число источников, доля дублей и история QC.</span></div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHead}><div><h2>Ведущие микроорганизмы</h2><p>Условный профиль R внутри региона</p></div><Microscope size={20} /></div>
            <div className={styles.rankList}>{organisms.map((item, index) => <Link href="/" key={item.code}><span className={styles.rank}>{index + 1}</span><div><strong>{item.name}</strong><small>{item.phenotype}</small></div><i><b style={{ width: `${item.value}%` }} /></i><em>{item.value}%</em><ArrowRight size={14} /></Link>)}</div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHead}><div><h2>Антибиотики</h2><p>Доля R по ключевым препаратам</p></div><TestTube2 size={20} /></div>
            <div className={styles.drugList}>{antibiotics.map((item) => <div key={item.code}><span>{item.code}</span><div><strong>{item.name}</strong><small>WHO AWaRe · {item.aware}</small></div><i><b style={{ width: `${item.value}%` }} /></i><em>{item.value}%</em></div>)}</div>
          </article>

          <article className={`${styles.panel} ${styles.materialPanel}`}>
            <div className={styles.panelHead}><div><h2>Структура материала</h2><p>Доля изолятов в региональном наборе</p></div><FlaskConical size={20} /></div>
            <div className={styles.materials}>{materials.map((item) => <div key={item.name}><span>{item.name}</span><i><b style={{ width: `${item.value}%` }} /></i><strong>{item.value}%</strong></div>)}</div>
          </article>

          <article className={`${styles.panel} ${styles.comparePanel}`}>
            <div className={styles.panelHead}><div><h2>Сравнение с Казахстаном</h2><p>Контекст регионального показателя</p></div><GitCompareArrows size={20} /></div>
            <div className={styles.compareRows}>
              <div><span>Резистентность</span><strong>{region.resistance}%</strong><b>КЗ {nationalResistance}%</b><em className={region.resistance > nationalResistance ? styles.bad : styles.good}>{region.resistance > nationalResistance ? "+" : ""}{(region.resistance - nationalResistance).toFixed(1)} п.п.</em></div>
              <div><span>MDR</span><strong>{region.mdr}%</strong><b>КЗ {nationalMdr}%</b><em className={region.mdr > nationalMdr ? styles.bad : styles.good}>{region.mdr > nationalMdr ? "+" : ""}{(region.mdr - nationalMdr).toFixed(1)} п.п.</em></div>
              <div><span>Рост за 3 года</span><strong>{region.delta > 0 ? "+" : ""}{region.delta}</strong><b>п.п.</b><em className={region.delta > 3 ? styles.bad : styles.good}>{region.delta > 3 ? "выше ожидаемого" : "без сильного сигнала"}</em></div>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
