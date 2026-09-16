"use client";

import { useState } from "react";
import { useAtlasLanguage } from "../i18n/AtlasLanguage";
import styles from "./AtlasPrototypeStatus.module.css";

const copy = {
  ru: {
    prototype: "PROTOTYPE",
    reference: "Справочники Supabase активны",
    demo: "AMR surveillance-показатели демонстрационные",
    official: "не официальная статистика",
    details: "О данных",
    title: "Происхождение и статус данных",
    close: "Закрыть",
    sections: [
      ["Реальные reference-данные", "Справочник микроорганизмов, антимикробных препаратов и AMR knowledge layer загружается из Supabase. Активный WHONET / AMRIE snapshot: 15.09.2026."],
      ["Surveillance / аналитические показатели", "Региональные проценты R, MDR, ESBL, CRE, MRSA, сигналы, тренды и размеры выборок в текущем прототипе являются демонстрационными значениями."],
      ["Статус публикации", "Прототип не является официальным источником национальной статистики и не должен использоваться для клинических решений или официальной эпидемиологической отчётности."],
      ["Целевое состояние", "После подключения валидированных WHONET/LIS-наборов demo-provider будет заменён агрегатами surveillance с версией breakpoint, периодом, N, лабораторным охватом и правилами дедупликации."]
    ]
  },
  kk: {
    prototype: "PROTOTYPE",
    reference: "Supabase анықтамалықтары белсенді",
    demo: "AMR surveillance көрсеткіштері демонстрациялық",
    official: "ресми статистика емес",
    details: "Деректер туралы",
    title: "Деректердің шығу тегі және мәртебесі",
    close: "Жабу",
    sections: [
      ["Нақты reference-деректер", "Микроорганизмдер, микробқа қарсы препараттар және AMR knowledge layer анықтамалығы Supabase-тен жүктеледі. Белсенді WHONET / AMRIE snapshot: 15.09.2026."],
      ["Surveillance / аналитикалық көрсеткіштер", "Қазіргі прототиптегі өңірлік R, MDR, ESBL, CRE, MRSA пайыздары, сигналдар, трендтер және үлгі көлемдері демонстрациялық мәндер болып табылады."],
      ["Жариялау мәртебесі", "Прототип ұлттық ресми статистика көзі емес және клиникалық шешімдер немесе ресми эпидемиологиялық есептілік үшін қолданылмауы тиіс."],
      ["Мақсатты күй", "Валидацияланған WHONET/LIS деректері қосылғаннан кейін demo-provider breakpoint нұсқасы, кезеңі, N, зертханалық қамтуы және дедупликация ережелері бар surveillance агрегаттарымен ауыстырылады."]
    ]
  },
  en: {
    prototype: "PROTOTYPE",
    reference: "Supabase reference catalogs live",
    demo: "AMR surveillance metrics are demo",
    official: "not official statistics",
    details: "About data",
    title: "Data provenance and status",
    close: "Close",
    sections: [
      ["Live reference data", "The organism, antimicrobial and AMR knowledge catalogs are loaded from Supabase. Active WHONET / AMRIE snapshot: 15 Sep 2026."],
      ["Surveillance / analytical metrics", "Regional R, MDR, ESBL, CRE and MRSA percentages, signals, trends and sample sizes in the current prototype are demonstration values."],
      ["Publication status", "This prototype is not an official source of national statistics and must not be used for clinical decisions or official epidemiological reporting."],
      ["Target state", "After validated WHONET/LIS datasets are connected, the demo provider will be replaced by surveillance aggregates with breakpoint version, period, N, laboratory coverage and deduplication rules."]
    ]
  }
} as const;

export default function AtlasPrototypeStatus() {
  const { language } = useAtlasLanguage();
  const [open, setOpen] = useState(false);
  const t = copy[language];

  return (
    <>
      <div className={styles.bar} role="status" aria-live="polite">
        <span className={styles.dot} aria-hidden="true" />
        <strong className={styles.prototype}>{t.prototype}</strong>
        <span className={styles.sep}>•</span>
        <span className={styles.reference}>{t.reference}</span>
        <span className={styles.sep}>•</span>
        <span>{t.demo}</span>
        <span className={styles.sep}>•</span>
        <span>{t.official}</span>
        <button className={styles.button} type="button" onClick={() => setOpen(true)}>{t.details} →</button>
      </div>
      {open && (
        <>
          <button className={styles.backdrop} type="button" aria-label={t.close} onClick={() => setOpen(false)} />
          <aside className={styles.drawer} role="dialog" aria-modal="true" aria-label={t.title}>
            <div className={styles.head}>
              <div><small>{t.prototype}</small><h2>{t.title}</h2></div>
              <button className={styles.close} type="button" aria-label={t.close} onClick={() => setOpen(false)}>×</button>
            </div>
            <div className={styles.body}>
              {t.sections.map(([title, text], index) => (
                <section key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{title}</strong><p>{text}</p></div></section>
              ))}
            </div>
          </aside>
        </>
      )}
    </>
  );
}
