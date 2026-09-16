"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, Database, Search, ShieldCheck, TestTube2, Microscope, Tags, Info } from "lucide-react";
import styles from "./reference.module.css";

type Tab = "organisms" | "antibiotics";

type Organism = {
  code: string;
  name: string;
  group: string;
  gram: string;
  priority: string;
  aliases: string[];
};

type Antibiotic = {
  code: string;
  name: string;
  ru: string;
  className: string;
  aware: string;
  scope: string;
};

const organisms: Organism[] = [
  { code: "eco", name: "Escherichia coli", group: "Enterobacterales", gram: "Gram−", priority: "Ключевой AMR", aliases: ["E. coli", "ecoli"] },
  { code: "kpn", name: "Klebsiella pneumoniae", group: "Enterobacterales", gram: "Gram−", priority: "Ключевой AMR", aliases: ["K. pneumoniae"] },
  { code: "pae", name: "Pseudomonas aeruginosa", group: "Pseudomonadaceae", gram: "Gram−", priority: "Ключевой AMR", aliases: ["P. aeruginosa"] },
  { code: "aba", name: "Acinetobacter baumannii", group: "Moraxellaceae", gram: "Gram−", priority: "Ключевой AMR", aliases: ["A. baumannii"] },
  { code: "sau", name: "Staphylococcus aureus", group: "Staphylococcaceae", gram: "Gram+", priority: "Ключевой AMR", aliases: ["S. aureus"] },
  { code: "spn", name: "Streptococcus pneumoniae", group: "Streptococcaceae", gram: "Gram+", priority: "Надзор", aliases: ["S. pneumoniae"] },
  { code: "efa", name: "Enterococcus faecalis", group: "Enterococcaceae", gram: "Gram+", priority: "Надзор", aliases: ["E. faecalis"] },
  { code: "efm", name: "Enterococcus faecium", group: "Enterococcaceae", gram: "Gram+", priority: "Ключевой AMR", aliases: ["E. faecium"] },
  { code: "ngo", name: "Neisseria gonorrhoeae", group: "Neisseriaceae", gram: "Gram−", priority: "Надзор", aliases: ["N. gonorrhoeae"] },
  { code: "nme", name: "Neisseria meningitidis", group: "Neisseriaceae", gram: "Gram−", priority: "Надзор", aliases: ["N. meningitidis"] },
  { code: "hin", name: "Haemophilus influenzae", group: "Pasteurellaceae", gram: "Gram−", priority: "Надзор", aliases: ["H. influenzae"] },
  { code: "pmi", name: "Proteus mirabilis", group: "Enterobacterales", gram: "Gram−", priority: "Рутинный", aliases: ["P. mirabilis"] },
  { code: "mmo", name: "Morganella morganii", group: "Enterobacterales", gram: "Gram−", priority: "Рутинный", aliases: ["M. morganii"] },
  { code: "sma", name: "Serratia marcescens", group: "Enterobacterales", gram: "Gram−", priority: "Рутинный", aliases: ["S. marcescens"] },
  { code: "mtu", name: "Mycobacterium tuberculosis", group: "Mycobacteriaceae", gram: "AFB", priority: "Спец. надзор", aliases: ["M. tuberculosis"] },
  { code: "cal", name: "Candida albicans", group: "Candida", gram: "Yeast", priority: "Микология", aliases: ["C. albicans"] },
  { code: "cau", name: "Candida auris", group: "Candida", gram: "Yeast", priority: "Ключевой AMR", aliases: ["C. auris"] },
  { code: "sal", name: "Salmonella spp.", group: "Enterobacterales", gram: "Gram−", priority: "Надзор", aliases: ["Salmonella sp."] },
];

const antibiotics: Antibiotic[] = [
  { code: "AMP", name: "Ampicillin", ru: "Ампициллин", className: "Аминопенициллины", aware: "Access", scope: "Human / Vet" },
  { code: "AMC", name: "Amoxicillin/Clavulanic acid", ru: "Амоксициллин/клавуланат", className: "Пенициллины + ингибитор", aware: "Access", scope: "Human / Vet" },
  { code: "AMK", name: "Amikacin", ru: "Амикацин", className: "Аминогликозиды", aware: "Access", scope: "Human / Vet" },
  { code: "GEN", name: "Gentamicin", ru: "Гентамицин", className: "Аминогликозиды", aware: "Access", scope: "Human / Vet" },
  { code: "CIP", name: "Ciprofloxacin", ru: "Ципрофлоксацин", className: "Фторхинолоны", aware: "Watch", scope: "Human / Vet" },
  { code: "LVX", name: "Levofloxacin", ru: "Левофлоксацин", className: "Фторхинолоны", aware: "Watch", scope: "Human" },
  { code: "CRO", name: "Ceftriaxone", ru: "Цефтриаксон", className: "Цефалоспорины III", aware: "Watch", scope: "Human" },
  { code: "CTX", name: "Cefotaxime", ru: "Цефотаксим", className: "Цефалоспорины III", aware: "Watch", scope: "Human" },
  { code: "CAZ", name: "Ceftazidime", ru: "Цефтазидим", className: "Цефалоспорины III", aware: "Watch", scope: "Human" },
  { code: "FEP", name: "Cefepime", ru: "Цефепим", className: "Цефалоспорины IV", aware: "Watch", scope: "Human" },
  { code: "MEM", name: "Meropenem", ru: "Меропенем", className: "Карбапенемы", aware: "Watch", scope: "Human" },
  { code: "IPM", name: "Imipenem", ru: "Имипенем", className: "Карбапенемы", aware: "Watch", scope: "Human" },
  { code: "ERT", name: "Ertapenem", ru: "Эртапенем", className: "Карбапенемы", aware: "Watch", scope: "Human" },
  { code: "NIT", name: "Nitrofurantoin", ru: "Нитрофурантоин", className: "Нитрофураны", aware: "Access", scope: "Human" },
  { code: "SXT", name: "Trimethoprim/Sulfamethoxazole", ru: "Триметоприм/сульфаметоксазол", className: "Антифолаты", aware: "Access", scope: "Human / Vet" },
  { code: "VAN", name: "Vancomycin", ru: "Ванкомицин", className: "Гликопептиды", aware: "Watch", scope: "Human" },
  { code: "LNZ", name: "Linezolid", ru: "Линезолид", className: "Оксазолидиноны", aware: "Reserve", scope: "Human" },
  { code: "COL", name: "Colistin", ru: "Колистин", className: "Полимиксины", aware: "Reserve", scope: "Human / Vet" },
  { code: "FLU", name: "Fluconazole", ru: "Флуконазол", className: "Азолы", aware: "—", scope: "Mycology" },
  { code: "RIF", name: "Rifampin", ru: "Рифампицин", className: "Рифамицины", aware: "—", scope: "Human / TB" },
];

export default function ReferenceCatalog() {
  const [tab, setTab] = useState<Tab>("organisms");
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("Все группы");

  const organismGroups = useMemo(() => ["Все группы", ...Array.from(new Set(organisms.map((item) => item.group))).sort()], []);
  const antibioticGroups = useMemo(() => ["Все группы", ...Array.from(new Set(antibiotics.map((item) => item.className))).sort()], []);

  const filteredOrganisms = organisms.filter((item) => {
    const text = `${item.code} ${item.name} ${item.group} ${item.aliases.join(" ")}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (group === "Все группы" || item.group === group);
  });
  const filteredAntibiotics = antibiotics.filter((item) => {
    const text = `${item.code} ${item.name} ${item.ru} ${item.className} ${item.aware}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (group === "Все группы" || item.className === group);
  });

  const switchTab = (next: Tab) => {
    setTab(next);
    setGroup("Все группы");
    setQuery("");
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.top}>
          <div>
            <span className={styles.eyebrow}>AMR Atlas · нормативные справочники</span>
            <h1>Микроорганизмы и антибиотики</h1>
            <p>Единые коды для аналитики, импорта, API и будущей базы данных.</p>
          </div>
          <Link href="/" className={styles.back}><ArrowLeft size={15} /> Вернуться в Atlas</Link>
        </header>

        <section className={styles.sourceBanner}>
          <Database size={21} />
          <div><strong>Целевой источник: WHONET 2026 · 26.8.27</strong><span>Текущий экран показывает интерфейс и репрезентативную выборку. Перед подключением БД каталог будет загружаться из полного версионированного WHONET-ресурса, а не поддерживаться вручную.</span></div>
          <span className={styles.version}>27.08.2026</span>
        </section>

        <section className={styles.summary}>
          <article><Microscope size={20} /><div><strong>Полный WHONET organism catalog</strong><span>3-символьные коды, актуальное название, группы, синонимы, статус номенклатуры</span></div></article>
          <article><TestTube2 size={20} /><div><strong>Полный antimicrobial catalog</strong><span>WHONET code, название, класс, WHO AWaRe, область применения и будущие breakpoint-связи</span></div></article>
          <article><ShieldCheck size={20} /><div><strong>Версионирование</strong><span>Каждый импорт будет знать, с какой версией справочника и breakpoint-ресурса он интерпретирован</span></div></article>
        </section>

        <section className={styles.catalog}>
          <div className={styles.tabs}>
            <button className={tab === "organisms" ? styles.active : ""} onClick={() => switchTab("organisms")}><Microscope size={16} /> Микроорганизмы</button>
            <button className={tab === "antibiotics" ? styles.active : ""} onClick={() => switchTab("antibiotics")}><TestTube2 size={16} /> Антибиотики</button>
          </div>

          <div className={styles.filters}>
            <label className={styles.search}><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={tab === "organisms" ? "Код, название, синоним..." : "Код, препарат, класс..."} /></label>
            <select value={group} onChange={(event) => setGroup(event.target.value)}>{(tab === "organisms" ? organismGroups : antibioticGroups).map((item) => <option key={item}>{item}</option>)}</select>
            <span className={styles.resultCount}>{tab === "organisms" ? filteredOrganisms.length : filteredAntibiotics.length} показано</span>
          </div>

          {tab === "organisms" ? (
            <div className={styles.tableWrap}>
              <div className={`${styles.row} ${styles.head}`}><span>WHONET</span><span>Микроорганизм</span><span>Группа</span><span>Тип</span><span>Статус</span></div>
              {filteredOrganisms.map((item) => <div className={styles.row} key={item.code}><span className={styles.code}>{item.code}</span><span><strong>{item.name}</strong><small>{item.aliases.join(" · ")}</small></span><span>{item.group}</span><span>{item.gram}</span><span><i className={item.priority === "Ключевой AMR" ? styles.priority : ""}>{item.priority}</i></span></div>)}
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <div className={`${styles.row} ${styles.head} ${styles.antibioticRow}`}><span>WHONET</span><span>Препарат</span><span>Класс</span><span>AWaRe</span><span>Область</span></div>
              {filteredAntibiotics.map((item) => <div className={`${styles.row} ${styles.antibioticRow}`} key={item.code}><span className={styles.code}>{item.code}</span><span><strong>{item.ru}</strong><small>{item.name}</small></span><span>{item.className}</span><span><i className={item.aware === "Reserve" ? styles.reserve : item.aware === "Watch" ? styles.watch : styles.access}>{item.aware}</i></span><span>{item.scope}</span></div>)}
            </div>
          )}
        </section>

        <section className={styles.architecture}>
          <div className={styles.archHead}><BookOpen size={18} /><div><strong>Как это будет работать после подключения БД</strong><span>Справочники не будут зависеть от экранов и смогут обновляться независимо.</span></div></div>
          <div className={styles.flow}>
            <span><Tags size={15} /><b>WHONET Resources</b><small>исходные коды</small></span>
            <i>→</i><span><CheckCircle2 size={15} /><b>Atlas dictionary</b><small>нормализация + версии</small></span>
            <i>→</i><span><Database size={15} /><b>AMR observations</b><small>ссылка по стабильному ID</small></span>
            <i>→</i><span><Info size={15} /><b>UI / API / отчёты</b><small>единая терминология</small></span>
          </div>
        </section>
      </div>
    </main>
  );
}
