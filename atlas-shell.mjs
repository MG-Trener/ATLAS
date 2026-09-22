// Shared, deterministic header for the explorer and reference workspace.
const labels = {
  ru: ['Казахстан', 'Мир / WHO GLASS', 'Справочник', 'Механизмы', 'Словарь AMR', 'Антимикробная резистентность'],
  kk: ['Қазақстан', 'Әлем / WHO GLASS', 'Анықтамалық', 'Механизмдер', 'AMR сөздігі', 'Антимикробтық резистенттілік'],
  en: ['Kazakhstan', 'World / WHO GLASS', 'Reference', 'Mechanisms', 'AMR glossary', 'Antimicrobial resistance']
};
const pages = ['index', 'world', 'reference', 'mechanisms', 'glossary'];
const languageButtons = [['ru', 'RU'], ['kk', 'ҚАЗ'], ['en', 'EN']];

function languageCopy(language) {
  const lang = labels[language] ? language : 'ru';
  return {lang, copy: labels[lang]};
}

export function renderHeader(language = 'ru', active = 'index') {
  const {lang, copy} = languageCopy(language);
  return `<header class="site-header workspace-header"><a class="brand" href="./index.html" ${active === 'index' ? 'data-home' : ''}><img class="brand-symbol" src="./assets/branding/logo.png" width="44" height="44" alt=""><span class="brand-copy"><b>AMR <span>Atlas</span></b><small>${copy[5]}</small></span></a><nav aria-label="AMR Atlas">${pages.map((page, i) => `<a href="./${page}.html" ${page === active ? 'class="active" aria-current="page"' : ''} ${page === 'index' && active === 'index' ? 'data-home' : ''}>${copy[i]}</a>`).join('')}</nav><div class="language-switch" role="group" aria-label="Язык / Тіл / Language">${languageButtons.map(([code, label]) => `<button type="button" data-language="${code}" lang="${code}" aria-pressed="${lang === code}">${label}</button>`).join('')}</div></header>`;
}

export function syncHeader(header, language = 'ru', active = 'index') {
  if (!header) return null;
  const {lang, copy} = languageCopy(language);
  header.classList.add('workspace-header');
  const subtitle = header.querySelector('.brand-copy small');
  if (subtitle) subtitle.textContent = copy[5];
  [...header.querySelectorAll('nav a')].forEach((link, index) => {
    if (copy[index]) link.textContent = copy[index];
    const isActive = pages[index] === active;
    link.classList.toggle('active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  header.querySelectorAll('[data-language]').forEach(button => {
    const code = button.dataset.language;
    button.setAttribute('lang', code);
    button.setAttribute('aria-pressed', String(code === lang));
  });
  return header;
}

if (document.body.dataset.workspace === 'reference') {
  let header = document.querySelector('.site-header');
  if (header && !header.classList.contains('workspace-header')) {
    header.outerHTML = renderHeader(document.documentElement.lang, 'reference');
    header = document.querySelector('.site-header');
  }
  syncHeader(header, document.documentElement.lang, 'reference');
  document.addEventListener('click', event => {
    const button = event.target.closest('.workspace-header [data-language]');
    if (!button) return;
    const language = button.dataset.language;
    document.dispatchEvent(new CustomEvent('atlas:language-changed', {detail: {language}}));
    syncHeader(document.querySelector('.site-header'), language, 'reference');
    document.querySelector(`.workspace-header [data-language="${language}"]`)?.focus();
  });
}
