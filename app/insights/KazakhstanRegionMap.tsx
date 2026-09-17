"use client";

import Link from "next/link";
import { useMemo } from "react";
import geometrySource from "../../regions.json";
import { useAtlasLanguage } from "../i18n/AtlasLanguage";
import { slugForRegion } from "../data/regions";
import styles from "./KazakhstanRegionMap.module.css";

type MapRegion = { name_kk: string; name_en: string; pcode: string; path: string; cx: number; cy: number };
type RegionValue = { name: string; short: string; resistance: number };
type Props = { regions: RegionValue[]; selectedRegion: string; onSelect: (name: string) => void };

const geometry = geometrySource as MapRegion[];
const pcodeToRegion: Record<string, string> = {
  KZ10:"Абайская", KZ11:"Акмолинская", KZ15:"Актюбинская", KZ19:"Алматинская", KZ23:"Атырауская",
  KZ27:"Западно-Казахстанская", KZ31:"Жамбылская", KZ33:"Жетысуская", KZ35:"Карагандинская", KZ39:"Костанайская",
  KZ43:"Кызылординская", KZ47:"Мангистауская", KZ55:"Павлодарская", KZ59:"Северо-Казахстанская", KZ61:"Туркестанская",
  KZ62:"Улытауская", KZ63:"Восточно-Казахстанская", KZ71:"Астана", KZ75:"Алматы", KZ79:"Шымкент"
};

function tone(value:number){ return value >= 32 ? styles.geoHot : value >= 25 ? styles.geoWarm : styles.geoCool; }

export default function KazakhstanRegionMap({ regions, selectedRegion, onSelect }: Props) {
  const { t, regionName } = useAtlasLanguage();
  const values=useMemo(()=>new Map(regions.map(item=>[item.name,item])),[regions]);

  return <div className={styles.realMap}>
    <svg viewBox="0 0 610 345" role="img" aria-label={t("mapAria")}>
      <g>{geometry.map(shape=>{const name=pcodeToRegion[shape.pcode];const value=values.get(name);if(!name||!value)return null;const selected=selectedRegion===name;const localized=regionName(name);return <path key={shape.pcode} d={shape.path} className={`${styles.geoRegion} ${tone(value.resistance)} ${selected?styles.geoSelected:""}`} onClick={()=>onSelect(name)} tabIndex={0} role="button" aria-label={`${localized}: ${value.resistance}% R`} onKeyDown={e=>{if(e.key==="Enter"||e.key===" ")onSelect(name);}}><title>{localized}: {value.resistance}% R</title></path>;})}</g>
      <g className={styles.geoLabels}>{geometry.map(shape=>{const name=pcodeToRegion[shape.pcode];const value=values.get(name);if(!name||!value)return null;return <g key={`${shape.pcode}-label`} transform={`translate(${shape.cx} ${shape.cy})`} pointerEvents="none"><rect x="-18" y="-10" width="36" height="20" rx="6"/><text y="-1" textAnchor="middle">{value.short}</text><text y="7" textAnchor="middle">{value.resistance}%</text></g>;})}</g>
    </svg>
    <div className={styles.mapAttribution}>{t("mapAttribution")}</div>
    <Link className={styles.profileLink} href={`/regions/${slugForRegion(selectedRegion)}`}>{t("openProfile")}: {regionName(selectedRegion)} →</Link>
  </div>;
}
