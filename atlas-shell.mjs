// Shared, deterministic header for the explorer and reference workspace.
const labels = {
  ru: ['Казахстан', 'Мир / WHO GLASS', 'Справочник', 'Механизмы', 'Словарь AMR', 'Антимикробная резистентность'],
  kk: ['Қазақстан', 'Әлем / WHO GLASS', 'Анықтамалық', 'Механизмдер', 'AMR сөздігі', 'Антимикробтық резистенттілік'],
  en: ['Kazakhstan', 'World / WHO GLASS', 'Reference', 'Mechanisms', 'AMR glossary', 'Antimicrobial resistance']
};
const pages = ['index', 'world', 'reference', 'mechanisms', 'glossary'];
export function renderHeader(language = 'ru', active = 'index') {
  const lang = labels[language] ? language : 'ru', copy = labels[lang];
  return `<header class="site-header workspace-header"><a class="brand" href="./index.html" ${active === 'index' ? 'data-home' : ''}><img class="brand-symbol" src="./assets/branding/logo.png" width="44" height="44" alt=""><span class="brand-copy"><b>AMR <span>Atlas</span></b><small>${copy[5]}</small></span></a><nav aria-label="AMR Atlas">${pages.map((page, i) => `<a href="./${page}.html" ${page === active ? 'class="active" aria-current="page"' : ''} ${page === 'index' && active === 'index' ? 'data-home' : ''}>${copy[i]}</a>`).join('')}</nav><div class="language-switch" role="group" aria-label="Язык / Тіл / Language">${[['ru', 'RU'], ['kk', 'ҚАЗ'], ['en', 'EN']].map(([code, label]) => `<button type="button" data-language="${code}" lang="${code}" aria-pressed="${lang === code}">${label}</button>`).join('')}</div></header>`;
}
if (document.body.dataset.workspace === 'reference') {
  const mount = () => document.querySelector('.site-header').outerHTML = renderHeader(document.documentElement.lang, 'reference');
  mount();
  document.addEventListener('click', event => {
    const button = event.target.closest('.workspace-header [data-language]');
    if (!button) return;
    document.dispatchEvent(new CustomEvent('atlas:language-changed', {detail: {language: button.dataset.language}}));
    mount();
    document.querySelector(`.workspace-header [data-language="${document.documentElement.lang}"]`)?.focus();
  });
}
