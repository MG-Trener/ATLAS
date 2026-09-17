"use client";

import { useMemo, useState } from "react";
import { useAtlasLanguage } from "../i18n/AtlasLanguage";
import styles from "./Surveillance.module.css";

type Profile = "caesar" | "glass" | "hospital";

const priority = [
  ["Escherichia coli", "3GC-R · FQ-R"],
  ["Klebsiella pneumoniae", "3GC-R · Carb-R"],
  ["Pseudomonas aeruginosa", "Carb-R"],
  ["Acinetobacter spp.", "Carb-R"],
  ["Staphylococcus aureus", "MRSA"],
  ["Streptococcus pneumoniae", "PNSP · macrolide-R"],
  ["Enterococcus faecalis", "VRE · HLAR"],
  ["Enterococcus faecium", "VRE"],
  ["Salmonella spp.", "FQ-R · 3GC-R"],
] as const;

const copy = {
  ru: {
    kicker: "Национальный AMR surveillance",
    title: "Surveillance",
    subtitle: "Стандартизированные профили наблюдения, которые отделяют национальную эпидемиологическую оценку от локальной лабораторной аналитики.",
    demo: "PROTOTYPE · demo provider",
    tabs: {
      caesar: ["CAESAR", "Инвазивные изоляты · национальная сопоставимость"],
      glass: ["GLASS", "Расширенный routine surveillance"],
      hospital: ["Hospital antibiogram", "Локальная клиническая аналитика"],
    },
    profiles: {
      caesar: ["CAESAR · инвазивный AMR-surveillance", "Приоритетный национальный профиль для сопоставимой оценки резистентности инвазивных бактериальных изолятов.", "Кровь + спинномозговая жидкость", "Первый изолят пациента × организм × год", "Инвазивная инфекция", "R% + N + 95% ДИ"],
      glass: ["GLASS · расширенный surveillance", "Расширенный профиль для приоритетных инфекций с материалом, демографией и происхождением инфекции.", "Кровь, моча, кал, урогенитальный материал", "Версионируемое правило GLASS", "Возраст · пол · происхождение инфекции", "R/S/I + N + стратификация"],
      hospital: ["Hospital antibiogram", "Локальный профиль медицинской организации для stewardship и внутренней лабораторной аналитики; не заменяет национальный surveillance.", "Материалы по политике учреждения", "Первый клинически значимый изолят по локальной методике", "Стационар · отделение · ОРИТ · амбулатория", "Антибиограмма + N + период"],
    },
    specimen: "Материал", dedup: "Дедупликация", patient: "Контекст пациента", output: "Основной результат",
    priority: "Приоритетных групп", territories: "Территорий в модели", breakpoints: "Breakpoint context", source: "Источник данных",
    target: "целевая группа", note: "Все показатели пока демонстрационные. Профили задают структуру будущего расчёта и не означают наличие официальных национальных данных."
  },
  kk: {
    kicker: "Ұлттық AMR surveillance",
    title: "Surveillance",
    subtitle: "Ұлттық эпидемиологиялық бағалауды жергілікті зертханалық аналитикадан бөлетін стандартталған бақылау профильдері.",
    demo: "PROTOTYPE · demo provider",
    tabs: {
      caesar: ["CAESAR", "Инвазиялық изоляттар · ұлттық салыстырмалылық"],
      glass: ["GLASS", "Кеңейтілген routine surveillance"],
      hospital: ["Hospital antibiogram", "Жергілікті клиникалық аналитика"],
    },
    profiles: {
      caesar: ["CAESAR · инвазиялық AMR-surveillance", "Инвазиялық бактериялық изоляттардың төзімділігін салыстырмалы бағалауға арналған басым ұлттық профиль.", "Қан + жұлын сұйықтығы", "Пациент × организм × жыл бойынша бірінші изолят", "Инвазиялық инфекция", "R% + N + 95% СА"],
      glass: ["GLASS · кеңейтілген surveillance", "Материал, демография және инфекцияның шығу тегі бойынша басым инфекцияларды талдауға арналған кеңейтілген профиль.", "Қан, зәр, нәжіс, урогениталдық материал", "Нұсқаланатын GLASS ережесі", "Жас · жыныс · инфекцияның шығу тегі", "R/S/I + N + стратификация"],
      hospital: ["Hospital antibiogram", "Stewardship және ішкі зертханалық аналитикаға арналған медициналық ұйымның жергілікті профилі; ұлттық surveillance-ті алмастырмайды.", "Ұйым саясатына сәйкес материалдар", "Жергілікті әдістеме бойынша бірінші клиникалық маңызды изолят", "Стационар · бөлімше · ЖИА · амбулатория", "Антибиограмма + N + кезең"],
    },
    specimen: "Материал", dedup: "Дедупликация", patient: "Пациент контексті", output: "Негізгі нәтиже",
    priority: "Басым топтар", territories: "Модельдегі аумақтар", breakpoints: "Breakpoint контексті", source: "Дерек көзі",
    target: "мақсатты топ", note: "Барлық көрсеткіштер әзірше демонстрациялық. Профильдер болашақ есептеу құрылымын анықтайды және ресми ұлттық деректер бар екенін білдірмейді."
  },
  en: {
    kicker: "National AMR surveillance",
    title: "Surveillance",
    subtitle: "Standardized surveillance profiles that separate national epidemiological assessment from local laboratory analytics.",
    demo: "PROTOTYPE · demo provider",
    tabs: {
      caesar: ["CAESAR", "Invasive isolates · national comparability"],
      glass: ["GLASS", "Extended routine surveillance"],
      hospital: ["Hospital antibiogram", "Local clinical analytics"],
    },
    profiles: {
      caesar: ["CAESAR · invasive AMR surveillance", "Priority national profile for comparable assessment of resistance in invasive bacterial isolates.", "Blood + cerebrospinal fluid", "First isolate per patient × organism × year", "Invasive infection", "R% + N + 95% CI"],
      glass: ["GLASS · extended surveillance", "Extended profile for priority infections with specimen, demographic and infection-origin stratification.", "Blood, urine, stool, urogenital specimens", "Versioned GLASS rule", "Age · sex · infection origin", "R/S/I + N + stratification"],
      hospital: ["Hospital antibiogram", "Local facility profile for stewardship and internal laboratory analytics; it does not replace national surveillance.", "Specimens per facility policy", "First clinically significant isolate by local method", "Inpatient · ward · ICU · outpatient", "Antibiogram + N + period"],
    },
    specimen: "Specimens", dedup: "Deduplication", patient: "Patient context", output: "Primary output",
    priority: "Priority groups", territories: "Territories in model", breakpoints: "Breakpoint context", source: "Data source",
    target: "target group", note: "All metrics are still demonstrations. Profiles define the future calculation structure and do not imply official national data are available."
  }
} as const;

export default function SurveillancePage() {
  const { language } = useAtlasLanguage();
  const [profile, setProfile] = useState<Profile>("caesar");
  const t = copy[language];
  const p = useMemo(() => t.profiles[profile], [t, profile]);

  return <main className={styles.page}>
    <header className={styles.head}>
      <div><small>{t.kicker}</small><h1>{t.title}</h1><p>{t.subtitle}</p></div>
      <span className={styles.badge}>{t.demo}</span>
    </header>

    <div className={styles.tabs}>
      {(Object.keys(t.tabs) as Profile[]).map((key) => <button key={key} type="button" className={`${styles.tab} ${profile === key ? styles.tabActive : ""}`} onClick={() => setProfile(key)}><strong>{t.tabs[key][0]}</strong><span>{t.tabs[key][1]}</span></button>)}
    </div>

    <section className={styles.hero}>
      <article className={styles.card}><h2>{p[0]}</h2><p>{p[1]}</p><div className={styles.tags}><span>WHONET / LIS</span><span>EUCAST / CLSI</span><span>{t.demo}</span></div></article>
      <article className={styles.card}><h3>{t.title}</h3><dl className={styles.contract}><dt>{t.specimen}</dt><dd>{p[2]}</dd><dt>{t.dedup}</dt><dd>{p[3]}</dd><dt>{t.patient}</dt><dd>{p[4]}</dd><dt>{t.output}</dt><dd>{p[5]}</dd></dl></article>
    </section>

    <section className={styles.metrics}>
      <article className={styles.metric}><span>{t.priority}</span><strong>{profile === "caesar" ? "9" : "—"}</strong><small>{t.target}</small></article>
      <article className={styles.metric}><span>{t.territories}</span><strong>20</strong><small>{t.demo}</small></article>
      <article className={styles.metric}><span>{t.breakpoints}</span><strong>EUCAST / CLSI</strong><small>versioned</small></article>
      <article className={styles.metric}><span>{t.source}</span><strong>WHONET</strong><small>LIS later</small></article>
    </section>

    <section className={styles.pathogens}>
      {priority.map(([name, marker]) => <article className={styles.pathogen} key={name}><strong>{name}</strong><span>{marker}</span><em>{t.target}</em></article>)}
    </section>

    <div className={styles.note}><strong>PROTOTYPE:</strong> {t.note}</div>
  </main>;
}
