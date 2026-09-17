"use client";

import { useMemo, useState, type ChangeEvent, type DragEvent } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronRight,
  Database,
  FileSearch,
  FileText,
  FlaskConical,
  Gauge,
  Globe2,
  Home,
  Info,
  MapPin,
  Microscope,
  Radar,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  TestTube2,
  TrendingUp,
  Upload,
  XCircle,
} from "lucide-react";
import styles from "./amr-flow.module.css";

type View = "organism" | "antibiotic" | "radar" | "import";
type IssueLevel = "error" | "warning";
type ImportIssue = { level: IssueLevel; message: string; row?: number; field?: string };
type ParsedWhonet = {
  name: string;
  size: number;
  delimiter: string;
  headers: string[];
  rows: string[][];
  mapping: Record<string, string | null>;
  astColumns: string[];
  issues: ImportIssue[];
};

type AntibioticRow = {
  name: string;
  short: string;
  className: string;
  resistance: number;
  susceptible: number;
  isolates: number;
  delta: number;
};

type OrganismProfile = {
  name: string;
  family: string;
  gram: string;
  isolates: number;
  avgResistance: number;
  mdr: number;
  phenotypeLabel: string;
  phenotype: number;
  antibiotics: AntibioticRow[];
};

const navItems: { label: string; view: View; icon: typeof Home }[] = [
  { label: "Микроорганизмы", view: "organism", icon: Microscope },
  { label: "Антибиотики", view: "antibiotic", icon: TestTube2 },
  { label: "AMR Radar", view: "radar", icon: Radar },
  { label: "Импорт WHONET", view: "import", icon: Database },
];

const baseAntibiotics: AntibioticRow[] = [
  { name: "Ампициллин", short: "AMP", className: "Пенициллины", resistance: 68.7, susceptible: 28.1, isolates: 12843, delta: 5.8 },
  { name: "Ципрофлоксацин", short: "CIP", className: "Фторхинолоны", resistance: 34.1, susceptible: 61.4, isolates: 11927, delta: 3.2 },
  { name: "Триметоприм/сульфаметоксазол", short: "SXT", className: "Антифолаты", resistance: 32.4, susceptible: 64.2, isolates: 10334, delta: 1.7 },
  { name: "Цефтриаксон", short: "CRO", className: "Цефалоспорины III", resistance: 28.6, susceptible: 68.8, isolates: 14382, delta: 4.1 },
  { name: "Нитрофурантоин", short: "NIT", className: "Нитрофураны", resistance: 8.5, susceptible: 89.9, isolates: 9442, delta: -0.8 },
  { name: "Амикацин", short: "AMK", className: "Аминогликозиды", resistance: 6.2, susceptible: 92.1, isolates: 8431, delta: -0.4 },
  { name: "Меропенем", short: "MEM", className: "Карбапенемы", resistance: 1.3, susceptible: 98.1, isolates: 7918, delta: 0.3 },
];

function scaledAntibiotics(multiplier: number): AntibioticRow[] {
  return baseAntibiotics.map((item) => ({
    ...item,
    resistance: Math.min(94, +(item.resistance * multiplier).toFixed(1)),
    susceptible: Math.max(2, +(100 - item.resistance * multiplier - 2.4).toFixed(1)),
    isolates: Math.round(item.isolates * (0.58 + multiplier / 3)),
    delta: +(item.delta * Math.max(0.7, multiplier)).toFixed(1),
  }));
}

const organismProfiles: Record<string, OrganismProfile> = {
  "Escherichia coli": {
    name: "Escherichia coli",
    family: "Enterobacterales",
    gram: "Грамотрицательная",
    isolates: 84215,
    avgResistance: 28.6,
    mdr: 8.7,
    phenotypeLabel: "ESBL-продуценты",
    phenotype: 18.4,
    antibiotics: baseAntibiotics,
  },
  "Klebsiella pneumoniae": {
    name: "Klebsiella pneumoniae",
    family: "Enterobacterales",
    gram: "Грамотрицательная",
    isolates: 41760,
    avgResistance: 39.8,
    mdr: 17.6,
    phenotypeLabel: "ESBL-продуценты",
    phenotype: 31.2,
    antibiotics: scaledAntibiotics(1.34),
  },
  "Staphylococcus aureus": {
    name: "Staphylococcus aureus",
    family: "Staphylococcaceae",
    gram: "Грамположительная",
    isolates: 26890,
    avgResistance: 21.7,
    mdr: 6.9,
    phenotypeLabel: "MRSA",
    phenotype: 14.8,
    antibiotics: scaledAntibiotics(0.78),
  },
};

const antibioticDetails: Record<string, { className: string; route: string; who: string; trend: number[] }> = {
  "Ампициллин": { className: "Аминопенициллин", route: "Перорально / парентерально", who: "Access", trend: [52, 55, 58, 61, 63, 66, 69] },
  "Ципрофлоксацин": { className: "Фторхинолон", route: "Перорально / парентерально", who: "Watch", trend: [25, 27, 28, 30, 31, 33, 34] },
  "Цефтриаксон": { className: "Цефалоспорин III поколения", route: "Парентерально", who: "Watch", trend: [18, 20, 22, 23, 25, 27, 29] },
  "Меропенем": { className: "Карбапенем", route: "Парентерально", who: "Watch", trend: [0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3] },
};

const regionRows = [
  ["Астана", 31.4, 2268, 4.8],
  ["Алматы", 33.1, 2791, 3.7],
  ["Карагандинская", 29.8, 1934, 2.1],
  ["Павлодарская", 24.2, 1170, -0.9],
  ["Актюбинская", 21.6, 1028, 1.2],
  ["Восточно-Казахстанская", 36.4, 1314, 5.4],
] as const;

const radarMetrics = ["Резистентность", "MDR", "ESBL/MRSA", "Рост за 3 года", "Региональный разброс", "Сигналы"];
const nationalRadar = [62, 44, 53, 57, 48, 39];
const selectedRadar = [71, 59, 66, 69, 61, 54];

const matrix = [
  ["E. coli", 69, 34, 29, 9, 6, 1],
  ["K. pneumoniae", 78, 48, 44, 27, 18, 9],
  ["S. aureus", 42, 22, 16, 12, 9, 3],
  ["P. aeruginosa", 35, 41, 31, 18, 15, 13],
  ["A. baumannii", 61, 67, 63, 56, 44, 39],
] as const;

const FIELD_ALIASES: Record<string, string[]> = {
  PATIENT_ID: ["PATIENT_ID", "PATIENTID", "IDENTIFICATION_NUMBER", "ID", "PATIENT"],
  ORGANISM: ["ORGANISM", "ORG", "ORGANISM_CODE", "WHONET_ORGANISM"],
  SPEC_DATE: ["SPEC_DATE", "SPECIMEN_DATE", "COLLECTION_DATE", "DATE_SPECIMEN", "DATE"],
  SPEC_TYPE: ["SPEC_TYPE", "SPEC_CODE", "SPECIMEN_TYPE", "SPECIMEN"],
  SEX: ["SEX", "GENDER"],
  DEPARTMENT: ["DEPARTMENT", "WARD", "LOCATION"],
  INSTITUT: ["INSTITUT", "INSTITUTION", "LABORATORY", "LAB"],
  REGION: ["REGION", "PROVINCE", "STATE", "OBLAST"],
};

const AST_CODES = new Set(["AMP", "AMK", "CIP", "CRO", "CTX", "CAZ", "FEP", "MEM", "IPM", "NIT", "SXT", "GEN", "TZP", "VAN", "ERY", "CLI", "OXA", "PEN", "LEV", "COL"]);
const REQUIRED_FIELDS = ["PATIENT_ID", "ORGANISM", "SPEC_DATE"];

function formatNumber(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value);
}

function normalizeHeader(value: string) {
  return value.trim().replace(/^\uFEFF/, "").replace(/[\s.-]+/g, "_").toUpperCase();
}

function detectDelimiter(text: string) {
  const first = text.split(/\r?\n/).find((line) => line.trim()) ?? "";
  const candidates = ["\t", ";", ",", "|"];
  return candidates.sort((a, b) => first.split(b).length - first.split(a).length)[0];
}

function parseDelimited(text: string, delimiter: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === delimiter && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell.trim());
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell.trim());
  if (row.some((value) => value !== "")) rows.push(row);
  return rows;
}

function isValidDate(value: string) {
  if (!value.trim()) return false;
  const match = value.trim().match(/^(\d{1,4})[./-](\d{1,2})[./-](\d{1,4})$/);
  if (!match) return !Number.isNaN(Date.parse(value));
  const [, a, b, c] = match;
  const year = a.length === 4 ? +a : +c;
  const month = +b;
  const day = a.length === 4 ? +c : +a;
  return year >= 1990 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31;
}

function buildParsed(name: string, size: number, text: string): ParsedWhonet {
  const delimiter = detectDelimiter(text);
  const allRows = parseDelimited(text, delimiter);
  if (allRows.length < 2) {
    return { name, size, delimiter, headers: allRows[0] ?? [], rows: [], mapping: {}, astColumns: [], issues: [{ level: "error", message: "Файл не содержит строк данных." }] };
  }

  const headers = allRows[0].map((header) => header.replace(/^\uFEFF/, "").trim());
  const normalized = headers.map(normalizeHeader);
  const rows = allRows.slice(1).map((source) => headers.map((_, index) => source[index] ?? ""));
  const mapping: Record<string, string | null> = {};
  Object.entries(FIELD_ALIASES).forEach(([field, aliases]) => {
    const index = normalized.findIndex((header) => aliases.includes(header));
    mapping[field] = index >= 0 ? headers[index] : null;
  });

  const astColumns = headers.filter((header, index) => {
    const normalizedHeader = normalized[index];
    const prefix = normalizedHeader.split("_")[0];
    if (AST_CODES.has(prefix)) return true;
    const sample = rows.slice(0, 80).map((row) => (row[index] ?? "").trim().toUpperCase()).filter(Boolean);
    if (sample.length < 4) return false;
    const interpreted = sample.filter((value) => ["R", "S", "I", "NS", "SDD"].includes(value)).length;
    return interpreted / sample.length >= 0.65;
  });

  const issues: ImportIssue[] = [];
  REQUIRED_FIELDS.forEach((field) => {
    if (!mapping[field]) issues.push({ level: "error", field, message: `Не найдено обязательное поле ${field}.` });
  });
  if (!mapping.SPEC_TYPE) issues.push({ level: "warning", field: "SPEC_TYPE", message: "Не найден тип материала. Фильтрация по материалу будет ограничена." });
  if (!mapping.REGION) issues.push({ level: "warning", field: "REGION", message: "Не найден регион. Карта и региональные сравнения не смогут использовать этот файл напрямую." });
  if (astColumns.length === 0) issues.push({ level: "warning", message: "Не распознаны колонки антибиотикограммы (R/S/I или стандартные коды препаратов)." });

  const columnIndex = (field: string) => mapping[field] ? headers.indexOf(mapping[field] as string) : -1;
  const patientIndex = columnIndex("PATIENT_ID");
  const organismIndex = columnIndex("ORGANISM");
  const dateIndex = columnIndex("SPEC_DATE");
  const seen = new Set<string>();

  rows.forEach((row, rowIndex) => {
    const visualRow = rowIndex + 2;
    if (patientIndex >= 0 && !row[patientIndex]?.trim()) issues.push({ level: "error", row: visualRow, field: "PATIENT_ID", message: "Пустой идентификатор пациента." });
    if (organismIndex >= 0 && !row[organismIndex]?.trim()) issues.push({ level: "error", row: visualRow, field: "ORGANISM", message: "Не указан микроорганизм." });
    if (dateIndex >= 0 && !isValidDate(row[dateIndex] ?? "")) issues.push({ level: "error", row: visualRow, field: "SPEC_DATE", message: `Некорректная дата: ${row[dateIndex] || "пусто"}.` });

    if (patientIndex >= 0 && organismIndex >= 0 && dateIndex >= 0) {
      const signature = `${row[patientIndex]}|${row[organismIndex]}|${row[dateIndex]}`.toUpperCase();
      if (seen.has(signature)) issues.push({ level: "warning", row: visualRow, message: "Возможный дубль: совпадают пациент, микроорганизм и дата." });
      seen.add(signature);
    }
  });

  return { name, size, delimiter, headers, rows, mapping, astColumns, issues: issues.slice(0, 120) };
}

function radarPoints(values: number[], radius = 105, cx = 140, cy = 140) {
  return values.map((value, index) => {
    const angle = -Math.PI / 2 + index * (Math.PI * 2 / values.length);
    const r = radius * value / 100;
    return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
  }).join(" ");
}

function MiniLine({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(1, max - min);
  const points = values.map((value, index) => `${index * 48},${70 - ((value - min) / range) * 55}`).join(" ");
  return (
    <svg className={styles.miniLine} viewBox="0 0 290 82" preserveAspectRatio="none" aria-hidden="true">
      <line x1="0" x2="290" y1="70" y2="70" />
      <polyline points={points} />
    </svg>
  );
}

function Stat({ label, value, detail, icon: Icon, tone = "blue" }: { label: string; value: string; detail: string; icon: typeof Activity; tone?: "blue" | "red" | "green" | "orange" }) {
  return (
    <article className={styles.stat}>
      <span className={`${styles.statIcon} ${styles[tone]}`}><Icon size={20} /></span>
      <div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>
    </article>
  );
}

function proportionCi95(percent: number, total: number) {
  const n = Math.max(1, total);
  const x = Math.round(n * percent / 100);
  const p = x / n;
  const z = 1.959964;
  const denominator = 1 + z * z / n;
  const centre = (p + z * z / (2 * n)) / denominator;
  const margin = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / denominator;
  return [Math.max(0, (centre - margin) * 100), Math.min(100, (centre + margin) * 100)];
}

export default function AtlasFlow() {
  const [view, setView] = useState<View>("organism");
  const [organismName, setOrganismName] = useState("Escherichia coli");
  const [antibioticName, setAntibioticName] = useState("Цефтриаксон");
  const [region, setRegion] = useState("Казахстан");
  const [material, setMaterial] = useState("Все материалы");
  const [parsed, setParsed] = useState<ParsedWhonet | null>(null);
  const [importReady, setImportReady] = useState(false);
  const [importMessage, setImportMessage] = useState("");

  const organism = organismProfiles[organismName] ?? organismProfiles["Escherichia coli"];
  const antibiotic = organism.antibiotics.find((item) => item.name === antibioticName) ?? organism.antibiotics[3];
  const antibioticMeta = antibioticDetails[antibiotic.name] ?? { className: antibiotic.className, route: "По показаниям", who: "Watch", trend: [20, 21, 22, 24, 25, 27, antibiotic.resistance] };
  const [ciLow, ciHigh] = proportionCi95(antibiotic.resistance, antibiotic.isolates);
  const resistantCount = Math.round(antibiotic.isolates * antibiotic.resistance / 100);

  const errorCount = parsed?.issues.filter((item) => item.level === "error").length ?? 0;
  const warningCount = parsed?.issues.filter((item) => item.level === "warning").length ?? 0;
  const importStage = !parsed ? 1 : errorCount > 0 ? 3 : importReady ? 4 : 3;

  const openAntibiotic = (name: string) => {
    setAntibioticName(name);
    setView("antibiotic");
  };

  const openOrganism = (name: string) => {
    if (organismProfiles[name]) setOrganismName(name);
    setView("organism");
  };

  const processText = (name: string, size: number, text: string) => {
    setImportReady(false);
    setImportMessage("");
    setParsed(buildParsed(name, size, text));
  };

  const processFile = async (file?: File) => {
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !["csv", "txt", "tsv", "dat"].includes(extension)) {
      setParsed({ name: file.name, size: file.size, delimiter: "", headers: [], rows: [], mapping: {}, astColumns: [], issues: [{ level: "error", message: "В этом прототипе предварительный просмотр работает для CSV, TXT, TSV и DAT. Для Excel экспортируйте таблицу из WHONET/BacLink в текстовый формат." }] });
      return;
    }
    processText(file.name, file.size, await file.text());
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => processFile(event.target.files?.[0]);
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    processFile(event.dataTransfer.files?.[0]);
  };

  const loadDemo = () => {
    const demo = [
      "PATIENT_ID,SPEC_DATE,SPEC_TYPE,ORGANISM,REGION,DEPARTMENT,AMP,CIP,CRO,MEM",
      "KZ-001,2026-09-01,Blood,Escherichia coli,Astana,ICU,R,R,I,S",
      "KZ-002,2026-09-02,Urine,Escherichia coli,Almaty,Urology,R,S,S,S",
      "KZ-003,03/09/2026,Blood,Klebsiella pneumoniae,Karaganda,ICU,R,R,R,S",
      "KZ-004,2026-09-04,Wound,Staphylococcus aureus,Pavlodar,Surgery,S,S,S,S",
      "KZ-005,2026-09-05,Urine,Escherichia coli,Aktobe,Outpatient,R,I,S,S",
      "KZ-006,2026-09-06,Blood,Klebsiella pneumoniae,East Kazakhstan,ICU,R,R,R,I",
    ].join("\n");
    processText("whonet_demo_kz_2026.csv", new Blob([demo]).size, demo);
  };

  const resetImport = () => {
    setParsed(null);
    setImportReady(false);
    setImportMessage("");
  };

  const prepareImport = () => {
    if (!parsed || errorCount > 0) return;
    setImportReady(true);
    setImportMessage(`Проверка завершена: ${formatNumber(parsed.rows.length)} строк готовы к следующему этапу. В БД ничего не записано.`);
  };

  const screenTitle = view === "organism" ? organism.name : view === "antibiotic" ? antibiotic.name : view === "radar" ? "AMR Radar" : "Импорт WHONET";

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <button className={styles.brand} onClick={() => setView("organism")}>
          <span className={styles.brandMark}><i /><i /><i /><i /><i /><i /></span>
          <span><strong>AMR Atlas</strong><small>Казахстан · прототип</small></span>
        </button>
        <div className={styles.overviewButton}><Home size={17} /><span>Рабочая область</span></div>
        <nav className={styles.nav}>
          {navItems.map(({ label, view: target, icon: Icon }) => (
            <button key={label} className={view === target ? styles.activeNav : ""} onClick={() => setView(target)}>
              <Icon size={18} /><span>{label}</span>{view === target && <ChevronRight size={15} />}
            </button>
          ))}
        </nav>
        <div className={styles.sourceCard}>
          <ShieldCheck size={20} />
          <strong>Режим прототипа</strong>
          <span>Все данные на аналитических экранах демонстрационные. Импорт анализируется только в браузере.</span>
        </div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <label className={styles.search}><Search size={17} /><input placeholder="Поиск микроорганизма, антибиотика, региона..." /><kbd>Ctrl K</kbd></label>
          <div className={styles.topActions}><button><Globe2 size={17} /> RU</button><button className={styles.notification}><Bell size={18} /><i /></button><span className={styles.avatar}>АП</span></div>
        </header>

        <div className={styles.content}>
          <div className={styles.contextBar}>
            <div><span>AMR Atlas</span><ChevronRight size={13} /><strong>{screenTitle}</strong></div>
            <span className={styles.prototypePill}><Database size={13} /> Без БД</span>
          </div>

          {view === "organism" && (
            <>
              <section className={styles.hero}>
                <div><span className={styles.eyebrow}>Детальная карточка микроорганизма</span><div className={styles.heroTitle}><h1>{organism.name}</h1><span>{organism.family}</span><span>{organism.gram}</span></div><p>Профиль резистентности, фенотипы, динамика и переход к конкретному антибиотику.</p></div>
                <div className={styles.heroActions}><button className={styles.secondary} onClick={() => setView("radar")}><Radar size={16} /> Открыть AMR Radar</button><button className={styles.primary} onClick={() => setView("import")}><Database size={16} /> Импорт WHONET</button></div>
              </section>

              <section className={styles.filters}>
                <label><span>Микроорганизм</span><select value={organismName} onChange={(event) => setOrganismName(event.target.value)}>{Object.keys(organismProfiles).map((name) => <option key={name}>{name}</option>)}</select></label>
                <label><span>Материал</span><select value={material} onChange={(event) => setMaterial(event.target.value)}><option>Все материалы</option><option>Кровь</option><option>Моча</option><option>Респираторный материал</option></select></label>
                <label><span>Регион</span><select value={region} onChange={(event) => setRegion(event.target.value)}><option>Казахстан</option><option>Астана</option><option>Алматы</option><option>Караганда</option></select></label>
                <label><span>Период</span><select defaultValue="2020–2026"><option>2020–2026</option><option>2026 YTD</option><option>Последние 12 месяцев</option></select></label>
                <button className={styles.filterButton}><SlidersHorizontal size={16} /> Доп. фильтры</button>
              </section>

              <section className={styles.statsGrid}>
                <Stat icon={FlaskConical} label="Изолятов" value={formatNumber(organism.isolates)} detail={`${region} · ${material}`} />
                <Stat icon={Activity} label={`%R · ${antibiotic.short}`} value={`${antibiotic.resistance.toFixed(1).replace(".", ",")}%`} detail={`${formatNumber(resistantCount)}/${formatNumber(antibiotic.isolates)} · 95% ДИ ${ciLow.toFixed(1)}–${ciHigh.toFixed(1)}`} tone="red" />
                <Stat icon={Gauge} label="MDR · demo v0.1" value={`${organism.mdr.toFixed(1).replace(".", ",")}%`} detail="определение ожидает экспертного утверждения" tone="orange" />
                <Stat icon={ShieldCheck} label={`${organism.phenotypeLabel} · предполагаемый`} value={`${organism.phenotype.toFixed(1).replace(".", ",")}%`} detail="не означает молекулярное подтверждение" tone="green" />
              </section>

              <section className={styles.organismGrid}>
                <article className={`${styles.panel} ${styles.antibioticPanel}`}>
                  <div className={styles.panelHead}><div><h2>Антибиотикограмма</h2><p>Нажмите на препарат, чтобы открыть детальную карточку</p></div><span className={styles.countBadge}>{organism.antibiotics.length} препаратов</span></div>
                  <div className={styles.tableHead}><span>Антибиотик</span><span>Класс</span><span>R</span><span>S</span><span>N</span><span>Δ 3 года</span></div>
                  <div className={styles.rows}>
                    {organism.antibiotics.map((item) => (
                      <button className={styles.dataRow} key={item.name} onClick={() => openAntibiotic(item.name)}>
                        <span><strong>{item.name}</strong><small>{item.short}</small></span><span>{item.className}</span><span className={styles.rateCell}><b>{item.resistance.toFixed(1)}%</b><i><em style={{ width: `${Math.min(100, item.resistance)}%` }} /></i></span><span>{item.susceptible.toFixed(1)}%</span><span>{formatNumber(item.isolates)}</span><span className={item.delta > 0 ? styles.badDelta : styles.goodDelta}>{item.delta > 0 ? "+" : ""}{item.delta.toFixed(1)} п.п. <ChevronRight size={14} /></span>
                      </button>
                    ))}
                  </div>
                </article>

                <article className={styles.panel}>
                  <div className={styles.panelHead}><div><h2>Динамика резистентности</h2><p>{organism.name} × {antibiotic.name} · %R</p></div><TrendingUp size={19} /></div>
                  <MiniLine values={antibioticMeta.trend} />
                  <div className={styles.yearLabels}><span>2020</span><span>2021</span><span>2022</span><span>2023</span><span>2024</span><span>2025</span><span>2026 YTD</span></div>
                  <div className={styles.insight}><AlertTriangle size={17} /><div><strong>Тренд требует наблюдения</strong><span>Рост наиболее заметен для β-лактамов и фторхинолонов.</span></div></div>
                </article>

                <article className={styles.panel}>
                  <div className={styles.panelHead}><div><h2>Распределение материала</h2><p>Демонстрационная структура выборки</p></div><FileSearch size={19} /></div>
                  {[['Моча', 46], ['Кровь', 24], ['Респираторный', 16], ['Раны', 9], ['Другие', 5]].map(([label, value]) => <div className={styles.progressRow} key={label}><span>{label}</span><i><b style={{ width: `${value}%` }} /></i><strong>{value}%</strong></div>)}
                </article>
              </section>
            </>
          )}

          {view === "antibiotic" && (
            <>
              <section className={styles.hero}>
                <div><button className={styles.backButton} onClick={() => setView("organism")}><ArrowLeft size={15} /> {organism.name}</button><span className={styles.eyebrow}>Детальная карточка антибиотика</span><div className={styles.heroTitle}><h1>{antibiotic.name}</h1><span>{antibiotic.short}</span><span>{antibioticMeta.who}</span></div><p>{antibioticMeta.className} · {antibioticMeta.route}</p></div>
                <div className={styles.heroActions}><button className={styles.secondary} onClick={() => setView("radar")}><Radar size={16} /> Сравнить в Radar</button><button className={styles.primary} onClick={() => setView("import")}><Database size={16} /> Проверить WHONET</button></div>
              </section>

              <section className={styles.statsGrid}>
                <Stat icon={Activity} label="Резистентность" value={`${antibiotic.resistance.toFixed(1)}%`} detail={`${organism.name} · ${region}`} tone="red" />
                <Stat icon={ShieldCheck} label="Чувствительность" value={`${antibiotic.susceptible.toFixed(1)}%`} detail="S среди интерпретированных" tone="green" />
                <Stat icon={FlaskConical} label="Изолятов" value={formatNumber(antibiotic.isolates)} detail="с результатом AST" />
                <Stat icon={TrendingUp} label="Изменение за 3 года" value={`${antibiotic.delta > 0 ? "+" : ""}${antibiotic.delta.toFixed(1)} п.п.`} detail="динамика R" tone={antibiotic.delta > 0 ? "orange" : "green"} />
              </section>

              <section className={styles.antibioticDetailGrid}>
                <article className={styles.panel}>
                  <div className={styles.panelHead}><div><h2>Динамика {antibiotic.name}</h2><p>Доля резистентных изолятов, %</p></div><span className={styles.countBadge}>2020–2026 YTD</span></div>
                  <MiniLine values={antibioticMeta.trend} />
                  <div className={styles.yearLabels}><span>2020</span><span>2021</span><span>2022</span><span>2023</span><span>2024</span><span>2025</span><span>2026 YTD</span></div>
                  <div className={styles.detailNote}><Info size={16} /><span>Паспорт demo-показателя: R / интерпретируемые протестированные изоляты · EUCAST 2026 demo mapping · 95% ДИ Wilson · первый изолят пациента × организм × отчётный период.</span></div>
                </article>

                <article className={styles.panel}>
                  <div className={styles.panelHead}><div><h2>По микроорганизмам</h2><p>Переход обратно в профиль возбудителя</p></div><Microscope size={19} /></div>
                  <div className={styles.organismList}>
                    {Object.values(organismProfiles).map((profile, index) => {
                      const row = profile.antibiotics.find((item) => item.name === antibiotic.name) ?? profile.antibiotics[3];
                      return <button key={profile.name} onClick={() => openOrganism(profile.name)}><span><strong>{profile.name}</strong><small>{profile.family}</small></span><b>{row.resistance.toFixed(1)}% R</b><i style={{ width: `${Math.min(100, row.resistance)}%` }} /><ChevronRight size={15} /></button>;
                    })}
                  </div>
                </article>

                <article className={`${styles.panel} ${styles.regionPanel}`}>
                  <div className={styles.panelHead}><div><h2>Региональная вариабельность</h2><p>{antibiotic.name} · 2026 YTD · без ранжирования</p></div><MapPin size={19} /></div>
                  <div className={styles.regionTable}><div><span>Регион</span><span>R</span><span>N</span><span>Δ</span></div>{regionRows.map(([name, rate, n, delta]) => <button key={name} onClick={() => { setRegion(name); setView("radar"); }}><span>{name}</span><b>{rate}%</b><span>{formatNumber(n)}</span><em className={delta > 0 ? styles.badDelta : styles.goodDelta}>{delta > 0 ? "+" : ""}{delta}</em></button>)}</div>
                </article>
              </section>
            </>
          )}

          {view === "radar" && (
            <>
              <section className={styles.hero}>
                <div><span className={styles.eyebrow}>Расширенный аналитический экран</span><div className={styles.heroTitle}><h1>AMR Radar</h1><span>Мультиметрический анализ</span></div><p>Сравнение риска, трендов и вариабельности по микроорганизмам, антибиотикам и регионам.</p></div>
                <button className={styles.primary} onClick={() => setView("import")}><Upload size={16} /> Обновить через WHONET</button>
              </section>

              <section className={styles.filters}>
                <label><span>Микроорганизм</span><select value={organismName} onChange={(event) => setOrganismName(event.target.value)}>{Object.keys(organismProfiles).map((name) => <option key={name}>{name}</option>)}</select></label>
                <label><span>Антибиотик</span><select value={antibioticName} onChange={(event) => setAntibioticName(event.target.value)}>{baseAntibiotics.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>
                <label><span>Регион сравнения</span><select value={region} onChange={(event) => setRegion(event.target.value)}><option>Казахстан</option><option>Астана</option><option>Алматы</option><option>Караганда</option><option>Восточно-Казахстанская</option></select></label>
                <label><span>Период</span><select defaultValue="2024–2026"><option>2024–2026</option><option>2026 YTD</option><option>2020–2026</option></select></label>
                <button className={styles.filterButton}><SlidersHorizontal size={16} /> Сценарий</button>
              </section>

              <section className={styles.radarLayout}>
                <article className={`${styles.panel} ${styles.radarPanel}`}>
                  <div className={styles.panelHead}><div><h2>Профиль AMR-риска</h2><p>{organismName} · {antibioticName} · {region}</p></div><Radar size={20} /></div>
                  <div className={styles.radarWrap}>
                    <svg viewBox="0 0 280 280" role="img" aria-label="Радар профиля антимикробной резистентности">
                      {[25, 50, 75, 100].map((level) => <polygon key={level} className={styles.radarGrid} points={radarPoints(Array(6).fill(level))} />)}
                      {radarMetrics.map((label, index) => {
                        const angle = -Math.PI / 2 + index * (Math.PI * 2 / radarMetrics.length);
                        return <line key={label} className={styles.radarAxis} x1="140" y1="140" x2={140 + Math.cos(angle) * 105} y2={140 + Math.sin(angle) * 105} />;
                      })}
                      <polygon className={styles.radarNational} points={radarPoints(nationalRadar)} />
                      <polygon className={styles.radarSelected} points={radarPoints(selectedRadar)} />
                    </svg>
                    {radarMetrics.map((label, index) => <span key={label} className={styles[`radarLabel${index}`]}>{label}</span>)}
                  </div>
                  <div className={styles.radarLegend}><span><i className={styles.nationalDot} /> Казахстан</span><span><i className={styles.selectedDot} /> {region === "Казахстан" ? "Выбранный профиль" : region}</span></div>
                </article>

                <article className={styles.panel}>
                  <div className={styles.panelHead}><div><h2>Ключевые сигналы</h2><p>Приоритеты для эпиднадзора</p></div><AlertTriangle size={19} /></div>
                  <div className={styles.signalList}>
                    <div className={styles.highSignal}><span>Высокий</span><strong>Рост ESBL у K. pneumoniae</strong><p>+7,4 п.п. за 3 года · выше национального профиля.</p></div>
                    <div className={styles.mediumSignal}><span>Средний</span><strong>Ципрофлоксацин: региональный разброс</strong><p>Разница между регионами достигает 18,2 п.п.</p></div>
                    <div className={styles.lowSignal}><span>Наблюдение</span><strong>Карбапенемы</strong><p>Уровень пока низкий, но тренд положительный третий год подряд.</p></div>
                  </div>
                </article>

                <article className={`${styles.panel} ${styles.matrixPanel}`}>
                  <div className={styles.panelHead}><div><h2>Матрица «микроорганизм × антибиотик»</h2><p>Цвет показывает долю R, % · клик по строке открывает микроорганизм</p></div><BarChart3 size={19} /></div>
                  <div className={styles.matrixTable}>
                    <div className={styles.matrixHeader}><span>Микроорганизм</span>{["AMP", "CIP", "CRO", "NIT", "AMK", "MEM"].map((code) => <b key={code}>{code}</b>)}</div>
                    {matrix.map(([name, ...values]) => <button key={name} onClick={() => openOrganism(name)}><strong>{name}</strong>{values.map((value, index) => <span key={index} className={value >= 50 ? styles.heatHigh : value >= 25 ? styles.heatMid : styles.heatLow}>{value}%</span>)}</button>)}
                  </div>
                </article>
              </section>
            </>
          )}

          {view === "import" && (
            <>
              <section className={styles.hero}>
                <div><span className={styles.eyebrow}>Подключение источника данных · без сохранения</span><div className={styles.heroTitle}><h1>Импорт WHONET</h1><span>Предварительный просмотр</span><span>Client-side</span></div><p>Файл читается локально в браузере: определяем структуру, сопоставляем поля, проверяем ошибки и показываем данные до будущей записи в БД.</p></div>
                {parsed && <button className={styles.secondary} onClick={resetImport}><RotateCcw size={16} /> Новый файл</button>}
              </section>

              <div className={styles.stepper}>{["Файл", "Сопоставление", "Проверка", "Готово"].map((label, index) => <div key={label} className={importStage >= index + 1 ? styles.stepActive : ""}><span>{index + 1}</span><strong>{label}</strong></div>)}</div>

              {!parsed ? (
                <section className={styles.importStart}>
                  <div className={styles.dropzone} onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
                    <Upload size={34} /><h2>Перетащите файл WHONET сюда</h2><p>CSV, TSV, TXT или DAT. Анализ выполняется только в этом окне браузера.</p>
                    <label className={styles.primary}>Выбрать файл<input type="file" accept=".csv,.tsv,.txt,.dat,text/csv,text/plain" onChange={handleFile} /></label>
                    <button className={styles.demoButton} onClick={loadDemo}><FileText size={16} /> Загрузить демонстрационный WHONET-файл</button>
                  </div>
                  <aside className={styles.importRules}><h3>Что проверяем сейчас</h3><div><CheckCircle2 size={16} /><span><strong>Обязательные поля</strong>PATIENT_ID, ORGANISM, SPEC_DATE</span></div><div><CheckCircle2 size={16} /><span><strong>Структура AST</strong>Колонки антибиотиков и значения R/S/I</span></div><div><CheckCircle2 size={16} /><span><strong>Качество строк</strong>Пустые поля, даты, возможные дубли</span></div><div><Info size={16} /><span><strong>Важно</strong>Это предпросмотр. Никакой сетевой отправки и записи в БД.</span></div></aside>
                </section>
              ) : (
                <section className={styles.importWorkspace}>
                  <article className={styles.fileSummary}>
                    <span className={styles.fileIcon}><FileText size={22} /></span><div><strong>{parsed.name}</strong><small>{(parsed.size / 1024).toFixed(1)} КБ · {formatNumber(parsed.rows.length)} строк · {parsed.headers.length} колонок</small></div><span className={errorCount ? styles.fileBad : styles.fileGood}>{errorCount ? <XCircle size={15} /> : <CheckCircle2 size={15} />}{errorCount ? `${errorCount} ошибок` : "Структура читается"}</span>
                  </article>

                  <div className={styles.importStats}><Stat icon={FileText} label="Строк данных" value={formatNumber(parsed.rows.length)} detail="без заголовка" /><Stat icon={Database} label="Колонок" value={String(parsed.headers.length)} detail={`${parsed.astColumns.length} AST`} /><Stat icon={XCircle} label="Ошибок" value={String(errorCount)} detail="блокируют следующий этап" tone="red" /><Stat icon={AlertTriangle} label="Предупреждений" value={String(warningCount)} detail="можно продолжить" tone="orange" /></div>

                  <article className={styles.panel}>
                    <div className={styles.panelHead}><div><h2>Сопоставление WHONET</h2><p>Автоматически распознанные поля. Обязательные поля основаны на базовом WHONET-профиле импорта Atlas.</p></div><span className={styles.countBadge}>{Object.values(parsed.mapping).filter(Boolean).length} распознано</span></div>
                    <div className={styles.mappingGrid}>{Object.keys(FIELD_ALIASES).map((field) => <div key={field} className={parsed.mapping[field] ? styles.mappingOk : REQUIRED_FIELDS.includes(field) ? styles.mappingError : styles.mappingWarn}><span>{parsed.mapping[field] ? <CheckCircle2 size={15} /> : REQUIRED_FIELDS.includes(field) ? <XCircle size={15} /> : <AlertTriangle size={15} />}</span><div><strong>{field}{REQUIRED_FIELDS.includes(field) && <em>обязательное</em>}</strong><small>{parsed.mapping[field] ?? "Не найдено"}</small></div></div>)}</div>
                    {parsed.astColumns.length > 0 && <div className={styles.astDetected}><strong>AST-колонки:</strong>{parsed.astColumns.slice(0, 14).map((column) => <span key={column}>{column}</span>)}{parsed.astColumns.length > 14 && <span>+{parsed.astColumns.length - 14}</span>}</div>}
                  </article>

                  <article className={styles.panel}>
                    <div className={styles.panelHead}><div><h2>Проверка качества</h2><p>Первые 120 замечаний, чтобы экран не перегружался</p></div><span className={errorCount ? styles.errorBadge : styles.successBadge}>{errorCount ? "Нужно исправить" : "Можно продолжить"}</span></div>
                    {parsed.issues.length === 0 ? <div className={styles.noIssues}><CheckCircle2 size={26} /><div><strong>Критических замечаний не найдено</strong><span>Файл прошёл текущий набор предварительных проверок.</span></div></div> : <div className={styles.issueList}>{parsed.issues.map((issue, index) => <div key={`${issue.message}-${index}`} className={issue.level === "error" ? styles.issueError : styles.issueWarning}>{issue.level === "error" ? <XCircle size={16} /> : <AlertTriangle size={16} />}<div><strong>{issue.level === "error" ? "Ошибка" : "Предупреждение"}{issue.row ? ` · строка ${issue.row}` : ""}{issue.field ? ` · ${issue.field}` : ""}</strong><span>{issue.message}</span></div></div>)}</div>}
                  </article>

                  <article className={`${styles.panel} ${styles.previewPanel}`}>
                    <div className={styles.panelHead}><div><h2>Предварительный просмотр</h2><p>Первые 8 строк файла после разбора</p></div><FileSearch size={19} /></div>
                    <div className={styles.previewScroller}><table><thead><tr><th>#</th>{parsed.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{parsed.rows.slice(0, 8).map((row, rowIndex) => <tr key={rowIndex}><td>{rowIndex + 2}</td>{parsed.headers.map((_, columnIndex) => <td key={columnIndex}>{row[columnIndex] || <em>пусто</em>}</td>)}</tr>)}</tbody></table></div>
                  </article>

                  <div className={styles.importFooter}>
                    <div><ShieldCheck size={18} /><span><strong>Безопасный режим</strong>Сохранение в БД на этом этапе отключено.</span></div>
                    <button className={styles.primary} disabled={errorCount > 0} onClick={prepareImport}><CheckCircle2 size={16} /> Подготовить импорт</button>
                  </div>
                  {importMessage && <div className={styles.readyMessage}><CheckCircle2 size={18} /><span>{importMessage}</span></div>}
                </section>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
