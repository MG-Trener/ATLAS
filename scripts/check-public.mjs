import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const requiredPages = ['index.html','reference.html','mechanisms.html','world.html','glossary.html'];
const legacyRedirects = ['national-atlas.html','command-center.html','clinical-preview.html'];
const requiredShared = [
  'atlas-model.mjs','atlas-copy.mjs','atlas-explorer.mjs','atlas-explorer.css','atlas-mark.svg','atlas-unified.css',
  'atlas-themes.js','atlas-global-i18n.js','atlas-i18n-extensions.js','atlas-global-i18n.css',
  'platform-status.js','platform-status.css','platform-manifest.json','regions-loader.js','regions.json','atlas-readable-type.css',
  'analysis-context.js','amr-demo-data.js','regional-analysis.js','unified-analytics.js','whonet-quality.css',
  'surveillance-p0.js','surveillance-p0.css','atlas-sections-nav.js','atlas-sections.css','world.js','world.css','glossary.js','glossary-light.css','data/who-glass.json'
];
const failures = [];
const warnings = [];

function fail(message){ failures.push(message); }
function warn(message){ warnings.push(message); }
function file(path){ return resolve(root,path); }

for (const path of [...requiredPages,...legacyRedirects,...requiredShared]) {
  if (!existsSync(file(path))) fail(`Missing required public asset: ${path}`);
}

function localRefs(html){
  const refs=[];
  const regex=/(?:src|href)=["']([^"']+)["']/g;
  for (const match of html.matchAll(regex)) {
    const ref=match[1];
    if (!ref || ref.startsWith('http:') || ref.startsWith('https:') || ref.startsWith('//') || ref.startsWith('#') || ref.startsWith('mailto:') || ref.startsWith('data:')) continue;
    const clean=ref.split(/[?#]/)[0].replace(/^\.\//,'');
    if (clean) refs.push(clean);
  }
  return refs;
}

for (const page of requiredPages) {
  if (!existsSync(file(page))) continue;
  const html=readFileSync(file(page),'utf8');
  const standaloneSections=new Set(['world.html','glossary.html']);
  if (['reference.html','mechanisms.html'].includes(page) && !/atlas-themes\.js/.test(html)) fail(`${page}: unified compatibility loader is missing`);
  if (standaloneSections.has(page) && !/atlas-sections\.css\?v=/.test(html)) fail(`${page}: atlas-sections.css must be cache-busted`);
  if (['index.html','world.html','glossary.html'].includes(page) && !/atlas-sections-nav\.js\?v=/.test(html)) fail(`${page}: unified navigation loader is missing`);
  if (!/(RU|data-lang=["']ru["']|lang=["']ru["'])/.test(html)) warn(`${page}: no visible RU language marker found in static HTML`);
  for (const ref of localRefs(html)) if (!existsSync(file(ref))) fail(`${page}: broken local reference -> ${ref}`);
}

for (const page of legacyRedirects) {
  const html=readFileSync(file(page),'utf8');
  if (!/index\.html/.test(html) || !/location\.replace/.test(html)) fail(`${page}: legacy concept must redirect to index.html`);
}

if (existsSync(file('atlas-themes.js'))) {
  const themes=readFileSync(file('atlas-themes.js'),'utf8');
  if (/Clinical Workspace|National AMR Atlas|Intelligence Center|theme-popover/.test(themes)) fail('atlas-themes.js: legacy design concept switcher is still present');
}
if (existsSync(file('atlas-i18n-extensions.js'))) {
  const extensions=readFileSync(file('atlas-i18n-extensions.js'),'utf8');
  if (/tr\(['"]изолятов['"],['"]изолят['"],['"]isolates['"]\)/.test(extensions)) fail('atlas-i18n-extensions.js: unsafe partial translation can repeatedly mutate “изолятов”');
}
if (existsSync(file('preview-i18n.js'))) {
  const previewI18n=readFileSync(file('preview-i18n.js'),'utf8');
  if (!/registerTranslations/.test(previewI18n)) fail('preview-i18n.js: shared translation registry is missing');
  if (!/insideWord/.test(previewI18n)) fail('preview-i18n.js: fragment translations must respect word boundaries');
}

if (existsSync(file('index.html'))) {
  const indexHtml=readFileSync(file('index.html'),'utf8');
  for (const asset of ['atlas-explorer.mjs','atlas-explorer.css']) if (!new RegExp(`${asset.replace('.', '\\.')}\\?v=`).test(indexHtml)) fail(`index.html: ${asset} must be cache-busted`);
}
if (existsSync(file('world.html'))) {
  const world=readFileSync(file('world.html'),'utf8');
  for (const asset of ['world.js','world.css']) if (!new RegExp(`${asset.replace('.', '\\.')}\\?v=`).test(world)) fail(`world.html: ${asset} must be cache-busted`);
}
if (existsSync(file('glossary.html'))) {
  const glossary=readFileSync(file('glossary.html'),'utf8');
  for (const asset of ['glossary.js','glossary-light.css']) if (!new RegExp(`${asset.replace('.', '\\.')}\\?v=`).test(glossary)) fail(`glossary.html: ${asset} must be cache-busted`);
}
if (existsSync(file('dashboard.js'))) {
  const dashboard=readFileSync(file('dashboard.js'),'utf8');
  if (!/surveillance-p0\.js\?v=/.test(dashboard)) fail('dashboard.js: surveillance-p0.js must be loaded with cache busting');
}

let manifest=null;
if (existsSync(file('platform-manifest.json'))) {
  try {
    manifest=JSON.parse(readFileSync(file('platform-manifest.json'),'utf8'));
    if (manifest.stage!=='prototype') fail(`platform-manifest.json: expected stage=prototype, found ${manifest.stage}`);
    if (manifest.official_statistics!==false) fail('platform-manifest.json: prototype must declare official_statistics=false');
    if (manifest.surveillance?.mode!=='demo') fail('platform-manifest.json: surveillance.mode must remain demo until validated observations are connected');
    const languages=new Set(manifest.languages||[]);
    for (const lang of ['ru','kk','en']) if (!languages.has(lang)) fail(`platform-manifest.json: missing language ${lang}`);
    const profileCodes=new Set((manifest.surveillance?.profiles||[]).map(profile=>profile?.code));
    for (const code of ['caesar_invasive','glass_routine','hospital_antibiogram']) if (!profileCodes.has(code)) fail(`platform-manifest.json: missing surveillance profile ${code}`);
    const caesar=(manifest.surveillance?.profiles||[]).find(profile=>profile?.code==='caesar_invasive');
    if (caesar?.priority_groups!==9) fail(`platform-manifest.json: CAESAR profile must declare 9 priority groups, found ${caesar?.priority_groups}`);
    const caesarSpecimens=new Set(caesar?.specimens||[]);
    for (const specimen of ['blood','cerebrospinal_fluid']) if (!caesarSpecimens.has(specimen)) fail(`platform-manifest.json: CAESAR profile missing specimen ${specimen}`);
    const policy=manifest.surveillance?.publication_policy||{};
    if (!(Number(policy.show_percentage_min_n)>0)) fail('platform-manifest.json: publication_policy.show_percentage_min_n must be > 0');
    if (!(Number(policy.low_precision_warning_below_n)>=Number(policy.show_percentage_min_n))) fail('platform-manifest.json: publication_policy.low_precision_warning_below_n must be at least show_percentage_min_n');
    for (const key of ['show_95ci','require_breakpoint_version','require_deduplication_version','require_quality_context']) if (policy[key]!==true) fail(`platform-manifest.json: publication_policy.${key} must be true for the prototype contract`);
  } catch (error) { fail(`platform-manifest.json: invalid JSON (${error.message})`); }
}

if (existsSync(file('regions.json'))) {
  try {
    const regions=JSON.parse(readFileSync(file('regions.json'),'utf8'));
    if (!Array.isArray(regions)) fail('regions.json: expected an array');
    else {
      const pcodes=regions.map(region=>region?.pcode).filter(Boolean),unique=new Set(pcodes),expected=manifest?.geography?.territories ?? 20;
      if (regions.length!==expected) fail(`regions.json: expected ${expected} territories, found ${regions.length}`);
      if (unique.size!==expected) fail(`regions.json: expected ${expected} unique PCODE values, found ${unique.size}`);
      for (const region of regions) if (!region?.pcode || !region?.path) fail('regions.json: every territory must contain pcode and SVG path');
    }
  } catch (error) { fail(`regions.json: invalid JSON (${error.message})`); }
}

const ignoredDirs=new Set(['node_modules','.next','.git','out']);
function walk(dir='.'){
  const abs=file(dir);if (!existsSync(abs)) return [];const out=[];
  for (const name of readdirSync(abs)) {if (ignoredDirs.has(name)) continue;const rel=dir==='.'?name:`${dir}/${name}`,st=statSync(file(rel));if (st.isDirectory()) out.push(...walk(rel));else out.push(rel)}
  return out;
}
const jsFiles=walk('.').filter(path=>extname(path)==='.js' || extname(path)==='.mjs');
for (const path of jsFiles) {const check=spawnSync(process.execPath,['--check',file(path)],{encoding:'utf8'});if (check.status!==0) fail(`${path}: JavaScript syntax check failed\n${check.stderr || check.stdout}`)}

if (warnings.length) {console.log('\nWarnings:');warnings.forEach(message=>console.log(`  - ${message}`))}
if (failures.length) {console.error('\nPublic prototype verification FAILED:');failures.forEach(message=>console.error(`  - ${message}`));process.exit(1)}
console.log(`\nPublic prototype verification OK: ${requiredPages.length} canonical pages, ${legacyRedirects.length} legacy redirects, ${manifest?.geography?.territories ?? 20} territories, ${jsFiles.length} JS modules checked.`);
