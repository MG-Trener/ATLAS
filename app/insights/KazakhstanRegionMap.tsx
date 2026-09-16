"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./insights.module.css";

type MapRegion = {
  name_kk: string;
  name_en: string;
  pcode: string;
  path: string;
  cx: number;
  cy: number;
};

type RegionValue = {
  name: string;
  short: string;
  resistance: number;
};

type Props = {
  regions: RegionValue[];
  selectedRegion: string;
  onSelect: (name: string) => void;
};

const SOURCE_URL = "https://raw.githubusercontent.com/galymorg/new_qazaqstan_GeoJSON/refs/heads/main/regions.json";

const pcodeToRegion: Record<string, string> = {
  KZ10: "Абайская",
  KZ11: "Акмолинская",
  KZ15: "Актюбинская",
  KZ19: "Алматинская",
  KZ23: "Атырауская",
  KZ27: "Западно-Казахстанская",
  KZ31: "Жамбылская",
  KZ33: "Жетысуская",
  KZ35: "Карагандинская",
  KZ39: "Костанайская",
  KZ43: "Кызылординская",
  KZ47: "Мангистауская",
  KZ55: "Павлодарская",
  KZ59: "Северо-Казахстанская",
  KZ61: "Туркестанская",
  KZ62: "Улытауская",
  KZ63: "Восточно-Казахстанская",
  KZ71: "Астана",
  KZ75: "Алматы",
  KZ79: "Шымкент",
};

function tone(value: number) {
  if (value >= 32) return styles.geoHot;
  if (value >= 25) return styles.geoWarm;
  return styles.geoCool;
}

export default function KazakhstanRegionMap({ regions, selectedRegion, onSelect }: Props) {
  const [geometry, setGeometry] = useState<MapRegion[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;
    fetch(SOURCE_URL)
      .then((response) => {
        if (!response.ok) throw new Error("map fetch failed");
        return response.json() as Promise<MapRegion[]>;
      })
      .then((data) => {
        if (!active) return;
        setGeometry(data);
        setState("ready");
      })
      .catch(() => {
        if (!active) return;
        setState("error");
      });
    return () => {
      active = false;
    };
  }, []);

  const values = useMemo(() => new Map(regions.map((item) => [item.name, item])), [regions]);

  if (state === "loading") {
    return <div className={styles.mapLoader}><span /><strong>Загружаю административные границы Казахстана…</strong></div>;
  }

  if (state === "error") {
    return (
      <div className={styles.mapFallback}>
        <strong>Географический слой временно недоступен</strong>
        <p>Аналитика продолжает работать. Для прототипа контуры загружаются из открытого картографического набора 2024 года.</p>
        <div>{regions.map((item) => <button key={item.name} onClick={() => onSelect(item.name)} className={selectedRegion === item.name ? styles.fallbackSelected : ""}><span>{item.short}</span><b>{item.resistance}%</b></button>)}</div>
      </div>
    );
  }

  return (
    <div className={styles.realMap}>
      <svg viewBox="0 0 610 345" role="img" aria-label="Интерактивная карта регионов Казахстана">
        <g className={styles.geoRegions}>
          {geometry.map((shape) => {
            const name = pcodeToRegion[shape.pcode];
            const value = values.get(name);
            if (!name || !value) return null;
            const selected = selectedRegion === name;
            return (
              <path
                key={shape.pcode}
                d={shape.path}
                className={`${styles.geoRegion} ${tone(value.resistance)} ${selected ? styles.geoSelected : ""}`}
                onClick={() => onSelect(name)}
                tabIndex={0}
                role="button"
                aria-label={`${name}: ${value.resistance}% резистентности`}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") onSelect(name);
                }}
              >
                <title>{name}: {value.resistance}% R</title>
              </path>
            );
          })}
        </g>
        <g className={styles.geoLabels}>
          {geometry.map((shape) => {
            const name = pcodeToRegion[shape.pcode];
            const value = values.get(name);
            if (!name || !value) return null;
            return (
              <g key={`${shape.pcode}-label`} transform={`translate(${shape.cx} ${shape.cy})`} pointerEvents="none">
                <rect x="-18" y="-10" width="36" height="20" rx="6" />
                <text y="-1" textAnchor="middle">{value.short}</text>
                <text y="7" textAnchor="middle">{value.resistance}%</text>
              </g>
            );
          })}
        </g>
      </svg>
      <div className={styles.mapAttribution}>Границы: new_qazaqstan_GeoJSON / geokz, административное деление 2024 · MIT</div>
    </div>
  );
}
