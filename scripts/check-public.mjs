import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const requiredPages = ['index.html','national-atlas.html','command-center.html','reference.html','mechanisms.html'];
const requiredShared = [
  'atlas-themes.js','atlas-global-i18n.js','atlas-i18n-extensions.js','atlas-global-i18n.css',
  'platform-status.js','platform-status.css','regions-loader.js','atlas-readable-type.css',
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

if (!existsSync(file('regions.json'))) {
  warn('regions.json is not vendored yet; runtime map loader still relies on external fallbacks/cache.');
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

console.log(`\nPublic prototype verification OK: ${requiredPages.length} pages, ${jsFiles.length} JS modules checked.`);
