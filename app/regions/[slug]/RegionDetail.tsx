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
import { useAtlasLanguage } from "../../i18n/AtlasLanguage";
import styles from "./region.module.css";

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
  const { language, t, regionName, materialName, antibioticName } = useAtlasLanguage();
  const trend = regionTrend(region);
  const organisms = regionOrganisms(region);
  const antibiotics = regionAntibiotics(region);
  const materials = regionMaterials(region);
  const nationalResistance = 29.8;
  const nationalMdr = 12.4;
  const rank = [...regions].sort((a, b) => b.resistance - a.resistance).findIndex((item) => item.slug === region.slug) + 1;
  const attention = region.resistance >= 32 || region.delta >= 4 || region.completeness < 85;
  const locale = language === "en" ? "en-US" : language === "kk" ? "kk-KZ" : "ru-RU";
  const formatNumber = (value: number) => new Intl.NumberFormat(locale).format(value);
  const localizedRegion = regionName(region.name);

  return (
    <main className={styles.page}>
      <section className={styles.wrap}>
        <div className={styles.breadcrumbs}>
          <Link href="/insights"><ArrowLeft size={15} /> {t("mapAmr")}</Link>
          <span>/</span>
          <strong>{localizedRegion}</strong>
        </div>

        <section className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>{t("regionalProfile")}</span>
            <h1>{localizedRegion}</h1>
            <p>{t("regionalProfileDescription")}</p>
          </div>
          <div className={styles.heroActions}>
            <Link href="/insights"><MapPinned size={16} /> {t("backToMap")}</Link>
            <Link href="/insights"><GitCompareArrows size={16} /> {t("compareRegion")}</Link>
          </div>
        </section>

        {attention && (
          <section className={styles.alert}>
            <AlertTriangle size={19} />
            <div><strong>{t("needsAttention")}</strong><span>{region.resistance >= 32 ? `${t("resistanceAboveSignal")} ` : ""}{region.delta >= 4 ? `${t("strongThreeYearGrowth")} ` : ""}{region.completeness < 85 ? t("limitedDataQuality") : ""}</span></div>
          </section>
        )}

        <section className={styles.kpis}>
          <article><BarChart3 size={20} /><span><small>{t("resistance")}</small><strong>{region.resistance}%</strong><em>{region.resistance > nationalResistance ? "+" : ""}{(region.resistance - nationalResistance).toFixed(1)} {t("pp")} · KZ</em></span></article>
          <article><AlertTriangle size={20} /><span><small>MDR</small><strong>{region.mdr}%</strong><em>{region.mdr > nationalMdr ? "+" : ""}{(region.mdr - nationalMdr).toFixed(1)} {t("pp")} · KZ</em></span></article>
          <article><FlaskConical size={20} /><span><small>{t("isolates")}</small><strong>{formatNumber(region.isolates)}</strong><em>{t("currentSlice")}</em></span></article>
          <article><Database size={20} /><span><small>{t("laboratories")}</small><strong>{region.labs}</strong><em>{t("conditionalCoverage")}</em></span></article>
          <article><ShieldCheck size={20} /><span><small>{t("completeness")}</small><strong>{region.completeness}%</strong><em>AST {region.astQuality}%</em></span></article>
        </section>

        <section className={styles.grid}>
          <article className={`${styles.panel} ${styles.trendPanel}`}>
            <div className={styles.panelHead}><div><h2>{t("dynamics")}</h2><p>2020–2026 · {t("shareR")}</p></div>{region.delta >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}</div>
            <div className={styles.chart}>
              <svg viewBox="0 0 620 180" preserveAspectRatio="none">
                {[35, 75, 115, 155].map((y) => <line key={y} x1="0" x2="620" y1={y} y2={y} />)}
                <polyline points={linePoints(trend)} />
              </svg>
            </div>
            <div className={styles.years}>{[2020,2021,2022,2023,2024,2025,2026].map((year) => <span key={year}>{year}</span>)}</div>
            <div className={styles.trendSummary}><strong className={region.delta >= 0 ? styles.bad : styles.good}>{region.delta >= 0 ? "+" : ""}{region.delta} {t("pp")}</strong><span>{t("threeYears")}</span><i /><span>{t("rankByR")}: <b>{rank} {t("of")} {regions.length}</b></span></div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHead}><div><h2>{t("dataQuality")}</h2><p>{t("confidence")}</p></div><ShieldCheck size={20} /></div>
            <div className={styles.qualityRows}>
              <div><span><strong>{t("requiredCompleteness")}</strong><small>{t("target95")}</small></span><i><b style={{ width: `${region.completeness}%` }} /></i><em>{region.completeness}%</em></div>
              <div><span><strong>{t("interpretableAst")}</strong><small>{t("target98")}</small></span><i><b style={{ width: `${region.astQuality}%` }} /></i><em>{region.astQuality}%</em></div>
              <div><span><strong>{t("regionalSample")}</strong><small>{t("conditionalSufficiency")}</small></span><i><b style={{ width: `${Math.min(100, Math.round(region.isolates / 20))}%` }} /></i><em>{region.isolates >= 1500 ? t("high") : region.isolates >= 800 ? t("medium") : t("limited")}</em></div>
            </div>
            <div className={styles.qualityNote}><Database size={17} /><span>{t("qcFuture")}</span></div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHead}><div><h2>{t("leadingOrganisms")}</h2><p>{t("conditionalProfile")}</p></div><Microscope size={20} /></div>
            <div className={styles.rankList}>{organisms.map((item, index) => <Link href="/" key={item.code}><span className={styles.rank}>{index + 1}</span><div><strong>{item.name}</strong><small>{item.phenotype}</small></div><i><b style={{ width: `${item.value}%` }} /></i><em>{item.value}%</em><ArrowRight size={14} /></Link>)}</div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHead}><div><h2>{t("antibiotics")}</h2><p>{t("keyDrugShare")}</p></div><TestTube2 size={20} /></div>
            <div className={styles.drugList}>{antibiotics.map((item) => <div key={item.code}><span>{item.code}</span><div><strong>{antibioticName(item.name)}</strong><small>WHO AWaRe · {item.aware}</small></div><i><b style={{ width: `${item.value}%` }} /></i><em>{item.value}%</em></div>)}</div>
          </article>

          <article className={`${styles.panel} ${styles.materialPanel}`}>
            <div className={styles.panelHead}><div><h2>{t("materialStructure")}</h2><p>{t("isolateShare")}</p></div><FlaskConical size={20} /></div>
            <div className={styles.materials}>{materials.map((item) => <div key={item.name}><span>{materialName(item.name)}</span><i><b style={{ width: `${item.value}%` }} /></i><strong>{item.value}%</strong></div>)}</div>
          </article>

          <article className={`${styles.panel} ${styles.comparePanel}`}>
            <div className={styles.panelHead}><div><h2>{t("compareKazakhstan")}</h2><p>{t("regionalContext")}</p></div><GitCompareArrows size={20} /></div>
            <div className={styles.compareRows}>
              <div><span>{t("resistance")}</span><strong>{region.resistance}%</strong><b>KZ {nationalResistance}%</b><em className={region.resistance > nationalResistance ? styles.bad : styles.good}>{region.resistance > nationalResistance ? "+" : ""}{(region.resistance - nationalResistance).toFixed(1)} {t("pp")}</em></div>
              <div><span>MDR</span><strong>{region.mdr}%</strong><b>KZ {nationalMdr}%</b><em className={region.mdr > nationalMdr ? styles.bad : styles.good}>{region.mdr > nationalMdr ? "+" : ""}{(region.mdr - nationalMdr).toFixed(1)} {t("pp")}</em></div>
              <div><span>{t("growth3y")}</span><strong>{region.delta > 0 ? "+" : ""}{region.delta}</strong><b>{t("pp")}</b><em className={region.delta > 3 ? styles.bad : styles.good}>{region.delta > 3 ? t("aboveExpected") : t("noStrongSignal")}</em></div>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
