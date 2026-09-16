"use client";

import Link from "next/link";
import { useMemo, useState, type ChangeEvent, type DragEvent } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Database,
  FileText,
  Info,
  Microscope,
  RotateCcw,
  ShieldCheck,
  TestTube2,
  Upload,
  XCircle,
} from "lucide-react";
import styles from "./workbench.module.css";

type FieldKey = "PATIENT_ID" | "ORGANISM" | "SPEC_DATE" | "SPEC_TYPE" | "SEX" | "DEPARTMENT" | "INSTITUT" | "REGION";
type Dataset = { name: string; size: number; delimiter: string; headers: string[]; rows: string[][] };
type Issue = { level: "error" | "warning"; message: string; row?: number; field?: string };
type DictEntry = { code: string; name: string; aliases: string[] };
type NormalizedRow = {
  patientId: string;
  organism: string;
  organismCode: string;
  specimenDate: string;
  specimenType: string;
  specimenCode: string;
  sex: string;
  department: string;
  institution: string;
  region: string;
  ast: Record<string, string>;
};

const FIELD_DEFS: { key: FieldKey; label: string; required?: boolean; aliases: string[] }[] = [
  { key: "PATIENT_ID", label: "ID пациента", required: true, aliases: ["PATIENT_ID", "PATIENTID", "IDENTIFICATION_NUMBER", "ID", "PATIENT"] },
  { key: "ORGANISM", label: "Микроорганизм", required: true, aliases: ["ORGANISM", "ORG", "ORGANISM_CODE", "WHONET_ORGANISM"] },
  { key: "SPEC_DATE", label: "Дата материала", required: true, aliases: ["SPEC_DATE", "SPECIMEN_DATE", "COLLECTION_DATE", "DATE_SPECIMEN", "DATE"] },
  { key: "SPEC_TYPE", label: "Материал", aliases: ["SPEC_TYPE", "SPEC_CODE", "SPECIMEN_TYPE", "SPECIMEN"] },
  { key: "SEX", label: "Пол", aliases: ["SEX", "GENDER"] },
  { key: "DEPARTMENT", label: "Отделение", aliases: ["DEPARTMENT", "WARD", "LOCATION"] },
  { key: "INSTITUT", label: "Лаборатория", aliases: ["INSTITUT", "INSTITUTION", "LABORATORY", "LAB"] },
  { key: "REGION", label: "Регион", aliases: ["REGION", "PROVINCE", "STATE", "OBLAST"] },
];

const ORGANISMS: DictEntry[] = [
  { code: "eco", name: "Escherichia coli", aliases: ["e. coli", "escherichia coli", "ecoli", "eco"] },
  { code: "kpn", name: "Klebsiella pneumoniae", aliases: ["k. pneumoniae", "klebsiella pneumoniae", "kpn"] },
  { code: "sau", name: "Staphylococcus aureus", aliases: ["s. aureus", "staphylococcus aureus", "sau"] },
  { code: "pae", name: "Pseudomonas aeruginosa", aliases: ["p. aeruginosa", "pseudomonas aeruginosa", "pae"] },
  { code: "aba", name: "Acinetobacter baumannii", aliases: ["a. baumannii", "acinetobacter baumannii", "aba"] },
  { code: "efa", name: "Enterococcus faecalis", aliases: ["e. faecalis", "enterococcus faecalis", "efa"] },
  { code: "efm", name: "Enterococcus faecium", aliases: ["e. faecium", "enterococcus faecium", "efm"] },
];

const SPECIMENS: DictEntry[] = [
  { code: "ur", name: "Моча", aliases: ["ur", "urine", "моча"] },
  { code: "bl", name: "Кровь", aliases: ["bl", "blood", "кровь"] },
  { code: "sp", name: "Мокрота / респираторный", aliases: ["sp", "sputum", "respiratory", "мокрота", "респираторный материал"] },
  { code: "wo", name: "Рана", aliases: ["wo", "wound", "рана", "раневое отделяемое"] },
  { code: "csf", name: "Ликвор", aliases: ["csf", "ликвор", "cerebrospinal fluid"] },
  { code: "st", name: "Кал", aliases: ["st", "stool", "кал"] },
];

const ANTIBIOTICS = [
  ["AMP", "Ампициллин"], ["AMK", "Амикацин"], ["CIP", "Ципрофлоксацин"], ["CRO", "Цефтриаксон"],
  ["CTX", "Цефотаксим"], ["CAZ", "Цефтазидим"], ["FEP", "Цефепим"], ["MEM", "Меропенем"],
  ["IPM", "Имипенем"], ["NIT", "Нитрофурантоин"], ["SXT", "Триметоприм/сульфаметоксазол"], ["GEN", "Гентамицин"],
  ["TZP", "Пиперациллин/тазобактам"], ["VAN", "Ванкомицин"], ["ERY", "Эритромицин"], ["CLI", "Клиндамицин"],
  ["OXA", "Оксациллин"], ["PEN", "Пенициллин"], ["LEV", "Левофлоксацин"], ["COL", "Колистин"],
] as const;

const AST_CODES = new Set(ANTIBIOTICS.map(([code]) => code));
const VALID_AST = new Set(["R", "S", "I", "NS", "SDD", "WT", "NWT"]);

function normalize(value: string) {
  return value.trim().replace(/^\uFEFF/, "").replace(/[\s.-]+/g, "_").toUpperCase();
}

function lookup(value: string, dictionary: DictEntry[]) {
  const clean = value.trim().toLowerCase();
  return dictionary.find((item) => item.code.toLowerCase() === clean || item.name.toLowerCase() === clean || item.aliases.some((alias) => alias.toLowerCase() === clean));
}

function detectDelimiter(text: string) {
  const first = text.split(/\r?\n/).find((line) => line.trim()) ?? "";
  return ["\t", ";", ",", "|"].sort((a, b) => first.split(b).length - first.split(a).length)[0];
}

function parseDelimited(text: string, delimiter: string) {
  const result: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      row.push(cell.trim()); cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) result.push(row);
      row = []; cell = "";
    } else cell += char;
  }
  row.push(cell.trim());
  if (row.some(Boolean)) result.push(row);
  return result;
}

function parseDataset(name: string, size: number, text: string): Dataset | null {
  const delimiter = detectDelimiter(text);
  const all = parseDelimited(text, delimiter);
  if (all.length < 2) return null;
  const headers = all[0].map((value) => value.replace(/^\uFEFF/, "").trim());
  return { name, size, delimiter, headers, rows: all.slice(1).map((row) => headers.map((_, index) => row[index] ?? "")) };
}

function autoMapping(headers: string[]) {
  const normalized = headers.map(normalize);
  const result = {} as Record<FieldKey, string>;
  FIELD_DEFS.forEach((field) => {
    const index = normalized.findIndex((header) => field.aliases.includes(header));
    result[field.key] = index >= 0 ? headers[index] : "";
  });
  return result;
}

function detectAst(headers: string[], rows: string[][]) {
  const result: Record<string, string> = {};
  headers.forEach((header, index) => {
    const prefix = normalize(header).split("_")[0];
    const sample = rows.slice(0, 80).map((row) => (row[index] ?? "").trim().toUpperCase()).filter(Boolean);
    const interpreted = sample.filter((value) => VALID_AST.has(value) || /^([<>]=?)?\d+(\.\d+)?$/.test(value)).length;
    if (AST_CODES.has(prefix) || (sample.length >= 4 && interpreted / sample.length >= .65)) {
      result[header] = AST_CODES.has(prefix) ? prefix : "";
    }
  });
  return result;
}

function validDate(value: string) {
  if (!value.trim()) return false;
  const match = value.trim().match(/^(\d{1,4})[./-](\d{1,2})[./-](\d{1,4})$/);
  if (!match) return !Number.isNaN(Date.parse(value));
  const [, a, b, c] = match;
  const year = a.length === 4 ? +a : +c;
  const month = +b;
  const day = a.length === 4 ? +c : +a;
  return year >= 1990 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31;
}

function columnIndex(dataset: Dataset, mapping: Record<FieldKey, string>, field: FieldKey) {
  const header = mapping[field];
  return header ? dataset.headers.indexOf(header) : -1;
}

function validate(dataset: Dataset, mapping: Record<FieldKey, string>, astMap: Record<string, string>) {
  const issues: Issue[] = [];
  FIELD_DEFS.filter((field) => field.required).forEach((field) => {
    if (!mapping[field.key]) issues.push({ level: "error", field: field.key, message: `Не сопоставлено обязательное поле ${field.key}.` });
  });
  if (!mapping.SPEC_TYPE) issues.push({ level: "warning", field: "SPEC_TYPE", message: "Материал не сопоставлен: аналитика по типу материала будет ограничена." });
  if (!mapping.REGION) issues.push({ level: "warning", field: "REGION", message: "Регион не сопоставлен: географическая аналитика не будет доступна для этого набора." });

  const patient = columnIndex(dataset, mapping, "PATIENT_ID");
  const organism = columnIndex(dataset, mapping, "ORGANISM");
  const date = columnIndex(dataset, mapping, "SPEC_DATE");
  const specimen = columnIndex(dataset, mapping, "SPEC_TYPE");
  const seen = new Set<string>();
  let unknownOrganisms = 0;
  let unknownSpecimens = 0;
  let invalidAst = 0;

  dataset.rows.forEach((row, i) => {
    const visual = i + 2;
    if (patient >= 0 && !row[patient]?.trim()) issues.push({ level: "error", row: visual, field: "PATIENT_ID", message: "Пустой идентификатор пациента." });
    if (organism >= 0) {
      const value = row[organism]?.trim() ?? "";
      if (!value) issues.push({ level: "error", row: visual, field: "ORGANISM", message: "Не указан микроорганизм." });
      else if (!lookup(value, ORGANISMS)) unknownOrganisms += 1;
    }
    if (date >= 0 && !validDate(row[date] ?? "")) issues.push({ level: "error", row: visual, field: "SPEC_DATE", message: `Некорректная дата: ${row[date] || "пусто"}.` });
    if (specimen >= 0 && row[specimen]?.trim() && !lookup(row[specimen], SPECIMENS)) unknownSpecimens += 1;

    const key = [patient, date, organism, specimen].filter((index) => index >= 0).map((index) => row[index]?.trim().toLowerCase()).join("|");
    if (key && seen.has(key)) issues.push({ level: "warning", row: visual, message: "Возможный дубль: совпадают пациент, дата, организм и материал." });
    if (key) seen.add(key);

    Object.entries(astMap).forEach(([header, code]) => {
      if (!code) return;
      const index = dataset.headers.indexOf(header);
      const value = (row[index] ?? "").trim().toUpperCase();
      if (!value) return;
      if (!VALID_AST.has(value) && !/^([<>]=?)?\d+(\.\d+)?$/.test(value)) invalidAst += 1;
    });
  });

  if (unknownOrganisms) issues.push({ level: "warning", field: "ORGANISM", message: `${unknownOrganisms} строк содержат микроорганизм, которого пока нет во встроенном словаре.` });
  if (unknownSpecimens) issues.push({ level: "warning", field: "SPEC_TYPE", message: `${unknownSpecimens} строк содержат неизвестный код/название материала.` });
  if (invalidAst) issues.push({ level: "warning", message: `${invalidAst} значений AST не похожи на S/I/R либо числовой MIC/диаметр зоны.` });
  if (!Object.values(astMap).some(Boolean)) issues.push({ level: "warning", message: "Не сопоставлено ни одного антибиотика." });
  return issues;
}

function normalizedRows(dataset: Dataset, mapping: Record<FieldKey, string>, astMap: Record<string, string>): NormalizedRow[] {
  const idx = (field: FieldKey) => columnIndex(dataset, mapping, field);
  const get = (row: string[], field: FieldKey) => idx(field) >= 0 ? (row[idx(field)] ?? "").trim() : "";
  return dataset.rows.map((row) => {
    const organism = lookup(get(row, "ORGANISM"), ORGANISMS);
    const specimen = lookup(get(row, "SPEC_TYPE"), SPECIMENS);
    const ast: Record<string, string> = {};
    Object.entries(astMap).forEach(([header, code]) => {
      if (!code) return;
      const value = row[dataset.headers.indexOf(header)]?.trim();
      if (value) ast[code] = value;
    });
    return {
      patientId: get(row, "PATIENT_ID"),
      organism: organism?.name ?? get(row, "ORGANISM"),
      organismCode: organism?.code ?? "UNMAPPED",
      specimenDate: get(row, "SPEC_DATE"),
      specimenType: specimen?.name ?? get(row, "SPEC_TYPE"),
      specimenCode: specimen?.code ?? (get(row, "SPEC_TYPE") ? "UNMAPPED" : ""),
      sex: get(row, "SEX"), department: get(row, "DEPARTMENT"), institution: get(row, "INSTITUT"), region: get(row, "REGION"), ast,
    };
  });
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

export default function WhonetWorkbench() {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [mapping, setMapping] = useState<Record<FieldKey, string>>({ PATIENT_ID: "", ORGANISM: "", SPEC_DATE: "", SPEC_TYPE: "", SEX: "", DEPARTMENT: "", INSTITUT: "", REGION: "" });
  const [astMap, setAstMap] = useState<Record<string, string>>({});
  const [prepared, setPrepared] = useState<NormalizedRow[] | null>(null);
  const [fileError, setFileError] = useState("");
  const [filter, setFilter] = useState("");

  const issues = useMemo(() => dataset ? validate(dataset, mapping, astMap) : [], [dataset, mapping, astMap]);
  const errors = issues.filter((item) => item.level === "error");
  const warnings = issues.filter((item) => item.level === "warning");
  const stage = !dataset ? 1 : errors.length ? 2 : prepared ? 4 : 3;

  const dictionaryStats = useMemo(() => {
    if (!dataset) return { organisms: [] as string[], specimens: [] as string[] };
    const values = (field: FieldKey) => {
      const index = columnIndex(dataset, mapping, field);
      return index < 0 ? [] : Array.from(new Set(dataset.rows.map((row) => row[index]?.trim()).filter(Boolean) as string[]));
    };
    return { organisms: values("ORGANISM"), specimens: values("SPEC_TYPE") };
  }, [dataset, mapping]);

  const loadText = (name: string, size: number, text: string) => {
    const parsed = parseDataset(name, size, text);
    setPrepared(null);
    if (!parsed) { setDataset(null); setFileError("Не удалось определить таблицу: нужен заголовок и хотя бы одна строка данных."); return; }
    setFileError("");
    setDataset(parsed);
    setMapping(autoMapping(parsed.headers));
    setAstMap(detectAst(parsed.headers, parsed.rows));
  };

  const processFile = async (file?: File) => {
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !["csv", "tsv", "txt", "dat"].includes(extension)) {
      setFileError("Поддерживаются CSV, TSV, TXT и DAT. Excel лучше предварительно экспортировать из WHONET/BacLink в текстовый формат.");
      return;
    }
    loadText(file.name, file.size, await file.text());
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => processFile(event.target.files?.[0]);
  const handleDrop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); processFile(event.dataTransfer.files?.[0]); };

  const loadDemo = () => {
    const demo = [
      "PATIENT_ID,SPEC_DATE,SPEC_TYPE,ORGANISM,REGION,DEPARTMENT,SEX,AMP,CIP,CRO,MEM",
      "KZ-001,2026-09-01,ur,eco,Astana,Outpatient,F,R,R,R,S",
      "KZ-002,2026-09-02,bl,kpn,Almaty,ICU,M,R,R,R,I",
      "KZ-003,2026-09-03,sp,pae,Karaganda,ICU,M,I,R,S,S",
      "KZ-004,2026-09-04,wo,sau,Pavlodar,Surgery,F,S,S,S,S",
      "KZ-005,2026-09-05,ur,Escherichia coli,Aktobe,Outpatient,F,R,I,S,S",
      "KZ-006,2026-09-06,bl,UNKNOWN_ORG,East Kazakhstan,ICU,M,R,R,R,I",
    ].join("\n");
    loadText("whonet_demo_kz_2026.csv", new Blob([demo]).size, demo);
  };

  const reset = () => { setDataset(null); setPrepared(null); setFileError(""); setFilter(""); };
  const prepare = () => { if (dataset && errors.length === 0) setPrepared(normalizedRows(dataset, mapping, astMap)); };
  const visibleIssues = issues.filter((item) => `${item.field ?? ""} ${item.message} ${item.row ?? ""}`.toLowerCase().includes(filter.toLowerCase()));

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.top}>
          <div><span className={styles.eyebrow}>AMR Atlas · слой подготовки данных</span><h1>WHONET Mapping Workbench</h1><p>Ручное сопоставление полей, словари и строгая проверка перед будущей записью в БД.</p></div>
          <Link href="/" className={styles.back}><ArrowLeft size={15} /> Вернуться в Atlas</Link>
        </header>

        <div className={styles.notice}><Database size={17} /><div><strong>Режим без БД.</strong> Файл читается локально в браузере. Кнопка подготовки создаёт только нормализованный объект в памяти страницы.</div></div>

        <section className={styles.stepper}>
          {["Файл", "Сопоставление", "Проверка", "Нормализация"].map((label, index) => <div key={label} className={`${styles.step} ${stage >= index + 1 ? styles.active : ""}`}><span>{index + 1}</span><strong>{label}</strong></div>)}
        </section>

        {!dataset ? (
          <section className={styles.start}>
            <div className={styles.drop} onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
              <Upload size={34} /><h2>Загрузите выгрузку WHONET</h2><p>CSV, TSV, TXT или DAT. После чтения Atlas автоматически попробует определить поля и колонки антибиотикограммы.</p>
              <label className={styles.primary}>Выбрать файл<input type="file" accept=".csv,.tsv,.txt,.dat,text/csv,text/plain" onChange={handleFile} /></label>
              <button className={styles.ghost} onClick={loadDemo}><FileText size={15} /> Открыть демонстрационный файл</button>
              {fileError && <div className={styles.warningBox}>{fileError}</div>}
            </div>
            <aside className={styles.rules}><h3>Новый уровень проверки</h3>
              <div><Microscope size={16} /><span><strong>Словарь микроорганизмов</strong><br />Коды и названия приводятся к каноническому виду.</span></div>
              <div><TestTube2 size={16} /><span><strong>Словарь антибиотиков</strong><br />Каждая AST-колонка получает код препарата.</span></div>
              <div><ShieldCheck size={16} /><span><strong>Контроль качества</strong><br />Обязательные поля, даты, дубли, неизвестные справочники и AST.</span></div>
              <div><Info size={16} /><span><strong>Без потери исходника</strong><br />Нормализованный preview строится отдельно от загруженных строк.</span></div>
            </aside>
          </section>
        ) : (
          <div className={styles.sectionGap}>
            <div className={styles.toolbar}>
              <div className={styles.file}><span className={styles.fileIcon}><FileText size={18} /></span><div><strong>{dataset.name}</strong><small>{formatSize(dataset.size)} · {dataset.rows.length} строк · {dataset.headers.length} колонок · разделитель {dataset.delimiter === "\t" ? "TAB" : dataset.delimiter}</small></div></div>
              <button className={styles.secondary} onClick={reset}><RotateCcw size={14} /> Новый файл</button>
            </div>

            <section className={styles.grid}>
              <article className={styles.panel}>
                <div className={styles.panelHead}><div><h2>1. Сопоставление полей</h2><p>Автоматическое сопоставление можно изменить вручную.</p></div><span className={errors.length ? styles.warningBox : styles.successBox}>{errors.length ? `${errors.length} ошибок` : "Обязательные поля готовы"}</span></div>
                <div className={styles.mapping}>{FIELD_DEFS.map((field) => <div key={field.key} className={`${styles.mapCard} ${mapping[field.key] ? styles.good : field.required ? styles.bad : ""}`}><label>{field.key} · {field.label} {field.required && <em>*</em>}</label><select value={mapping[field.key]} onChange={(event) => { setPrepared(null); setMapping((current) => ({ ...current, [field.key]: event.target.value })); }}><option value="">— не сопоставлено —</option>{dataset.headers.map((header) => <option key={header}>{header}</option>)}</select></div>)}</div>
              </article>

              <article className={styles.panel}>
                <div className={styles.panelHead}><div><h2>2. Сопоставление антибиотиков</h2><p>Распознанные AST-колонки и код препарата Atlas.</p></div><span className={styles.mini}>{Object.values(astMap).filter(Boolean).length} сопоставлено</span></div>
                <div className={styles.astList}>{Object.keys(astMap).length ? Object.entries(astMap).map(([header, code]) => <div className={styles.astRow} key={header}><span><strong>{header}</strong><br />AST-колонка исходного файла</span><select value={code} onChange={(event) => { setPrepared(null); setAstMap((current) => ({ ...current, [header]: event.target.value })); }}><option value="">— пропустить —</option>{ANTIBIOTICS.map(([itemCode, name]) => <option key={itemCode} value={itemCode}>{itemCode} · {name}</option>)}</select></div>) : <div className={styles.warningBox}>AST-колонки автоматически не распознаны. На следующем этапе добавим возможность вручную отметить любую колонку файла как антибиотик.</div>}</div>
              </article>
            </section>

            <article className={styles.panel}>
              <div className={styles.panelHead}><div><h2>3. Словари WHONET → Atlas</h2><p>Показываем, какие значения уже узнаются встроенными справочниками.</p></div><span className={styles.mini}>Справочники пока встроены в прототип</span></div>
              <div className={styles.dictionaryGrid}>
                <div className={styles.dictionary}><strong>Микроорганизмы</strong><p>{dictionaryStats.organisms.length} уникальных значений в файле</p><div className={styles.chips}>{dictionaryStats.organisms.slice(0,18).map((value) => <span key={value} className={`${styles.chip} ${lookup(value, ORGANISMS) ? "" : styles.chipWarn}`}>{value} → {lookup(value, ORGANISMS)?.name ?? "не найден"}</span>)}</div></div>
                <div className={styles.dictionary}><strong>Материалы</strong><p>{dictionaryStats.specimens.length} уникальных значений в файле</p><div className={styles.chips}>{dictionaryStats.specimens.slice(0,18).map((value) => <span key={value} className={`${styles.chip} ${lookup(value, SPECIMENS) ? "" : styles.chipWarn}`}>{value} → {lookup(value, SPECIMENS)?.name ?? "не найден"}</span>)}</div></div>
                <div className={styles.dictionary}><strong>Антибиотики</strong><p>{ANTIBIOTICS.length} кодов в локальном словаре прототипа</p><div className={styles.chips}>{ANTIBIOTICS.slice(0,18).map(([code, name]) => <span key={code} className={styles.chip}>{code} · {name}</span>)}</div></div>
              </div>
            </article>

            <section className={styles.stats}>
              <div className={styles.stat}><span>Строк данных</span><strong>{dataset.rows.length}</strong></div>
              <div className={styles.stat}><span>Ошибок блокирующих</span><strong>{errors.length}</strong></div>
              <div className={styles.stat}><span>Предупреждений</span><strong>{warnings.length}</strong></div>
              <div className={styles.stat}><span>AST препаратов</span><strong>{Object.values(astMap).filter(Boolean).length}</strong></div>
            </section>

            <section className={styles.grid}>
              <article className={styles.panel}>
                <div className={styles.panelHead}><div><h2>4. Проверка ошибок</h2><p>Строковые ошибки и агрегированные проблемы словарей.</p></div><input className={styles.search} value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Фильтр ошибок..." /></div>
                {visibleIssues.length ? <div className={styles.errors}>{visibleIssues.slice(0,100).map((issue, index) => <div className={`${styles.issue} ${issue.level === "error" ? styles.issueError : styles.issueWarn}`} key={`${issue.message}-${issue.row}-${index}`}>{issue.level === "error" ? <XCircle size={14} /> : <AlertTriangle size={14} />}<span>{issue.row ? `Строка ${issue.row}: ` : ""}{issue.message}</span></div>)}</div> : <div className={styles.ok}><CheckCircle2 size={17} /><span>Проверки не нашли проблем для текущего сопоставления.</span></div>}
              </article>

              <article className={styles.panel}>
                <div className={styles.panelHead}><div><h2>Предварительный просмотр исходника</h2><p>Первые 8 строк без изменения данных.</p></div></div>
                <div className={styles.preview}><table><thead><tr>{dataset.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{dataset.rows.slice(0,8).map((row, rowIndex) => <tr key={rowIndex}>{dataset.headers.map((header, columnIndex) => <td key={`${rowIndex}-${header}`}>{row[columnIndex]}</td>)}</tr>)}</tbody></table></div>
              </article>
            </section>

            {prepared && <section className={styles.normalized}><h3>Нормализованный preview · ничего не сохранено</h3><div className={styles.preview}><table><thead><tr><th>patientId</th><th>organismCode</th><th>organism</th><th>date</th><th>specimenCode</th><th>specimen</th><th>region</th><th>AST JSON</th></tr></thead><tbody>{prepared.slice(0,10).map((row, index) => <tr key={index}><td>{row.patientId}</td><td>{row.organismCode}</td><td>{row.organism}</td><td>{row.specimenDate}</td><td>{row.specimenCode}</td><td>{row.specimenType}</td><td>{row.region}</td><td>{JSON.stringify(row.ast)}</td></tr>)}</tbody></table></div><div className={styles.linkRow}><span className={styles.successBox}>{prepared.length} строк преобразовано только в памяти страницы</span><span className={styles.mini}>Следующий будущий слой: серверная staging-таблица и подтверждение импорта.</span></div></section>}

            <footer className={styles.footer}><div className={styles.footerText}>Чтобы подготовить нормализованные данные, устраните только блокирующие ошибки. Предупреждения допускаются и остаются видимыми.</div><button className={styles.primary} disabled={errors.length > 0} onClick={prepare}><CheckCircle2 size={14} /> {prepared ? "Перестроить preview" : "Подготовить нормализованный preview"}</button></footer>
          </div>
        )}
      </div>
    </main>
  );
}
