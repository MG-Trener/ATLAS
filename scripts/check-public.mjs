import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const requiredPages = ['index.html','national-atlas.html','command-center.html','reference.html','mechanisms.html'];
const requiredShared = [
  'atlas-themes.js','atlas-global-i18n.js','atlas-i18n-extensions.js','atlas-global-i18n.css',
  'platform-status.js','platform-status.css','platform-manifest.json','regions-loader.js','regions.json','atlas-readable-type.css',
  'analysis-context.js','amr-demo-data.js','regional-analysis.js','unified-analytics.js'
];
const failures = [];
const warnings = [];

function fail(message){ failures.push(message); }
function warn(message){ warnings.push(message); }
function file(path){ return resolve(root,path); }

for (const path of [...requiredPages,...requiredShared]) {
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
  if (!/atlas-themes\.js/.test(html)) fail(`${page}: atlas-themes.js loader is missing`);
  if (!/(RU|data-lang=["']ru["'])/.test(html)) warn(`${page}: no visible RU language control found in static HTML`);
  for (const ref of localRefs(html)) {
    if (!existsSync(file(ref))) fail(`${page}: broken local reference -> ${ref}`);
  }
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
  } catch (error) {
    fail(`platform-manifest.json: invalid JSON (${error.message})`);
  }
}

if (existsSync(file('regions.json'))) {
  try {
    const regions=JSON.parse(readFileSync(file('regions.json'),'utf8'));
    if (!Array.isArray(regions)) fail('regions.json: expected an array');
    else {
      const pcodes=regions.map(region=>region?.pcode).filter(Boolean);
      const unique=new Set(pcodes);
      const expected=manifest?.geography?.territories ?? 20;
      if (regions.length!==expected) fail(`regions.json: expected ${expected} territories, found ${regions.length}`);
      if (unique.size!==expected) fail(`regions.json: expected ${expected} unique PCODE values, found ${unique.size}`);
      for (const region of regions) {
        if (!region?.pcode || !region?.path) fail('regions.json: every territory must contain pcode and SVG path');
      }
    }
  } catch (error) {
    fail(`regions.json: invalid JSON (${error.message})`);
  }
}

const ignoredDirs=new Set(['node_modules','.next','.git','out']);
function walk(dir='.'){
  const abs=file(dir);
  if (!existsSync(abs)) return [];
  const out=[];
  for (const name of readdirSync(abs)) {
    if (ignoredDirs.has(name)) continue;
    const rel=dir==='.'?name:`${dir}/${name}`;
    const st=statSync(file(rel));
    if (st.isDirectory()) out.push(...walk(rel));
    else out.push(rel);
  }
  return out;
}

const jsFiles=walk('.').filter(path=>extname(path)==='.js' || extname(path)==='.mjs');
for (const path of jsFiles) {
  const check=spawnSync(process.execPath,['--check',file(path)],{encoding:'utf8'});
  if (check.status!==0) fail(`${path}: JavaScript syntax check failed\n${check.stderr || check.stdout}`);
}

if (warnings.length) {
  console.log('\nWarnings:');
  warnings.forEach(message=>console.log(`  - ${message}`));
}

if (failures.length) {
  console.error('\nPublic prototype verification FAILED:');
  failures.forEach(message=>console.error(`  - ${message}`));
  process.exit(1);
}

console.log(`\nPublic prototype verification OK: ${requiredPages.length} pages, ${manifest?.geography?.territories ?? 20} territories, ${jsFiles.length} JS modules checked.`);
