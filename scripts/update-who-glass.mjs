import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const API_BASE = process.env.WHO_XMART_API || 'https://xmart-api-public.who.int';
const OUT = 'data/who-glass.json';
const TABLE = 'RELAY_GLASS_AMR';
const GROUP = 'AMR_RESISTANCE_ANTIBIOTIC_BOX';
const MIN_RECORDS = 1500;
const MIN_COUNTRIES = 80;
const INDICATORS = {
  RESISTANCE_ANTI_BOX_PERCENTRESISTANT: 'percentResistant',
  RESISTANCE_ANTI_BOX_RESISTANT: 'resistant',
  RESISTANCE_ANTI_BOX_INTERPRETABLEAST: 'interpretableAST',
  RESISTANCE_ANTI_BOX_TOTALSPECIMENISOLATES: 'totalSpecimenIsolates'
};

function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i += 1; }
      else quoted = !quoted;
    } else if (ch === ',' && !quoted) {
      row.push(cell); cell = '';
    } else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      row.push(cell); cell = '';
      if (row.some(v => v !== '')) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some(v => v !== '')) rows.push(row);
  const headers = (rows.shift() || []).map(v => v.replace(/^\uFEFF/, '').trim());
  return rows.map(values => Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ''])));
}

async function fetchText(url, attempt = 1) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { accept: 'text/csv,application/json;q=0.8', 'user-agent': 'AMR-Atlas/2.1' }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } catch (error) {
    if (attempt < 3) {
      await new Promise(resolve => setTimeout(resolve, attempt * 1500));
      return fetchText(url, attempt + 1);
    }
    throw new Error(`WHO XMART fetch failed after ${attempt} attempts: ${error.message}`);
  } finally {
    clearTimeout(timer);
  }
}

function buildUrl() {
  const url = new URL(`${API_BASE}/DATA_/${TABLE}`);
  url.searchParams.set('$filter', `IND_GRP_CODE eq '${GROUP}'`);
  url.searchParams.set('$select', [
    'IND_CODE', 'DIM_TIME', 'DIM_GEO_CODE_ISO3',
    'DIM_MEMBER_1_CODE', 'DIM_MEMBER_2_CODE', 'DIM_MEMBER_3_CODE',
    'VALUE_NUMERIC', 'VALUE_LABEL'
  ].join(','));
  url.searchParams.set('$format', 'csv');
  return url.toString();
}

function numberOrNull(value) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const n = Number(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

const sourceUrl = buildUrl();
const csv = await fetchText(sourceUrl);
if (!csv.trim() || !csv.includes('IND_CODE')) throw new Error('WHO XMART returned an empty or unexpected CSV response');
const rawRows = parseCsv(csv);
if (!rawRows.length) throw new Error('WHO XMART CSV contains no data rows');

const pivot = new Map();
for (const row of rawRows) {
  const iso3 = String(row.DIM_GEO_CODE_ISO3 || '').trim().toUpperCase();
  const year = Number(row.DIM_TIME);
  const infection = String(row.DIM_MEMBER_1_CODE || '').trim();
  const pathogen = String(row.DIM_MEMBER_2_CODE || '').trim();
  const antibiotic = String(row.DIM_MEMBER_3_CODE || '').trim();
  const indicator = INDICATORS[String(row.IND_CODE || '').trim()];
  const label = String(row.VALUE_LABEL || '').trim();
  if (!indicator || label || !/^[A-Z]{3}$/.test(iso3) || !Number.isInteger(year) || year < 2016 || year > 2100 || !pathogen || !antibiotic) continue;
  const key = [iso3, year, infection || 'ALL', pathogen, antibiotic].join('|');
  if (!pivot.has(key)) {
    pivot.set(key, {
      countryCode: iso3,
      year,
      infection: infection || 'All specimens',
      pathogen,
      antibiotic,
      percentResistant: null,
      resistant: null,
      interpretableAST: null,
      totalSpecimenIsolates: null
    });
  }
  pivot.get(key)[indicator] = numberOrNull(row.VALUE_NUMERIC);
}

const records = [...pivot.values()]
  .filter(r => Number.isFinite(r.percentResistant) && r.percentResistant >= 0 && r.percentResistant <= 100)
  .map(r => ({
    ...r,
    percentResistant: +r.percentResistant.toFixed(4),
    resistant: Number.isFinite(r.resistant) ? Math.round(r.resistant) : null,
    interpretableAST: Number.isFinite(r.interpretableAST) ? Math.round(r.interpretableAST) : null,
    totalSpecimenIsolates: Number.isFinite(r.totalSpecimenIsolates) ? Math.round(r.totalSpecimenIsolates) : null
  }))
  .sort((a, b) => a.countryCode.localeCompare(b.countryCode) || a.year - b.year || a.infection.localeCompare(b.infection) || a.pathogen.localeCompare(b.pathogen) || a.antibiotic.localeCompare(b.antibiotic));

const countries = new Set(records.map(r => r.countryCode));
const years = records.map(r => r.year);
const infections = [...new Set(records.map(r => r.infection))].sort();
const pathogens = [...new Set(records.map(r => r.pathogen))].sort();
const antibiotics = [...new Set(records.map(r => r.antibiotic))].sort();
if (records.length < MIN_RECORDS || countries.size < MIN_COUNTRIES) {
  throw new Error(`WHO GLASS quality gate failed: ${records.length} records / ${countries.size} countries`);
}

const infectionIndex = new Map(infections.map((value, index) => [value, index]));
const pathogenIndex = new Map(pathogens.map((value, index) => [value, index]));
const antibioticIndex = new Map(antibiotics.map((value, index) => [value, index]));
const compactRecords = records.map(r => [
  r.countryCode,
  r.year,
  infectionIndex.get(r.infection),
  pathogenIndex.get(r.pathogen),
  antibioticIndex.get(r.antibiotic),
  r.percentResistant,
  r.resistant,
  r.interpretableAST,
  r.totalSpecimenIsolates
]);

const minYear = Math.min(...years);
const maxYear = Math.max(...years);
const stable = JSON.stringify(compactRecords);
const sha256 = crypto.createHash('sha256').update(stable).digest('hex');
const now = new Date().toISOString();
const dataset = {
  meta: {
    schemaVersion: '2.1',
    recordEncoding: ['countryCode','year','infectionIndex','pathogenIndex','antibioticIndex','percentResistant','resistant','interpretableAST','totalSpecimenIsolates'],
    source: 'WHO GLASS Data Visualization Dashboard / XMART API',
    sourceTable: TABLE,
    sourceGroup: GROUP,
    checkedAt: now,
    generatedAt: now,
    version: `glass-amr-${maxYear}-${sha256.slice(0, 12)}`,
    contentSha256: sha256,
    period: { from: minYear, to: maxYear },
    latestAvailableYear: maxYear,
    recordCount: records.length,
    countryCount: countries.size,
    infectionCount: infections.length,
    pathogenCount: pathogens.length,
    antibioticCount: antibiotics.length,
    refreshEveryDays: 7,
    usaAvailable: countries.has('USA'),
    sourceUrls: {
      dashboard: 'https://worldhealthorg.shinyapps.io/glass-dashboard/',
      portal: 'https://data.who.int/dashboards/amr',
      glass: 'https://www.who.int/initiatives/glass',
      api: API_BASE,
      dashboardCode: 'https://github.com/WorldHealthOrganization/GLASS-Dashboard'
    },
    notes: [
      'The map covers the whole world; coloured countries are those with a published GLASS value for the selected combination.',
      'Latest available mode uses the newest published year separately for each country and selected pathogen-antibiotic combination.',
      'Absence of a value means no published GLASS value for the selected combination, not absence of antimicrobial resistance.',
      'WHO reports GLASS dashboard data for 2016-2023; actual availability varies by country, specimen/infection context, pathogen and antibiotic.'
    ]
  },
  dimensions: { infections, pathogens, antibiotics },
  records: compactRecords
};

await fs.mkdir('data', { recursive: true });
await fs.writeFile(OUT, JSON.stringify(dataset) + '\n', 'utf8');
console.log(`WHO GLASS compact snapshot written: ${dataset.meta.version}; ${records.length} combinations; ${countries.size} countries; ${minYear}-${maxYear}; USA=${dataset.meta.usaAvailable}`);
