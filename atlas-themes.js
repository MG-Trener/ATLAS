(() => {
  'use strict';

  const STORAGE_KEY = 'atlas-ui-theme';
  const DEFAULT_THEME = 'clinical';
  const THEMES = ['clinical','dark','teal','sand','contrast'];
  const copy = {
    ru:{button:'Скин',title:'Скин интерфейса',hint:'Выберите визуальную модель Atlas',selected:'Выбрано',themes:{clinical:['Clinical Light','Светлый медицинский'],dark:['Atlas Dark','Тёмный аналитический'],teal:['Laboratory Teal','Современный биотех'],sand:['Sand Report','Спокойный отчётный'],contrast:['High Contrast','Максимальная читаемость']}},
    kk:{button:'Скин',title:'Интерфейс скині',hint:'Atlas визуалды моделін таңдаңыз',selected:'Таңдалды',themes:{clinical:['Clinical Light','Жарық медициналық'],dark:['Atlas Dark','Қараңғы аналитикалық'],teal:['Laboratory Teal','Заманауи биотех'],sand:['Sand Report','Тыныш есептік'],contrast:['High Contrast','Жоғары оқылымдылық']}},
    en:{button:'Skin',title:'Interface skin',hint:'Choose an Atlas visual model',selected:'Selected',themes:{clinical:['Clinical Light','Light clinical'],dark:['Atlas Dark','Dark analytics'],teal:['Laboratory Teal','Modern biotech'],sand:['Sand Report','Calm report style'],contrast:['High Contrast','Maximum readability']}}
  };

  const root = document.documentElement;
  const language = () => {
    const saved = localStorage.getItem('atlas-preview-language');
    if (saved === 'kk' || saved === 'en') return saved;
    return 'ru';
  };
  const t = () => copy[language()] || copy.ru;
  const current = () => THEMES.includes(localStorage.getItem(STORAGE_KEY)) ? localStorage.getItem(STORAGE_KEY) : DEFAULT_THEME;

  function metaColor(theme) {
    return ({clinical:'#f4f8fc',dark:'#09131f',teal:'#eef7f6',sand:'#f3efe7',contrast:'#ffffff'})[theme] || '#f4f8fc';
  }

  function setTheme(theme, persist = true) {
    if (!THEMES.includes(theme)) return;
    root.dataset.atlasTheme = theme;
    if (persist) localStorage.setItem(STORAGE_KEY, theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', metaColor(theme));
    document.querySelectorAll('.theme-card').forEach(card => {
      const active = card.dataset.theme === theme;
      card.classList.toggle('active', active);
      card.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    document.dispatchEvent(new CustomEvent('atlas:theme-changed', {detail:{theme}}));
  }

  function card(theme) {
    const text = t().themes[theme];
    return `<button class="theme-card${current()===theme?' active':''}" type="button" data-theme="${theme}" aria-pressed="${current()===theme?'true':'false'}">
      <span class="theme-preview ${theme}"><i></i><span class="theme-preview-main"><b></b><span class="theme-preview-panels"><b></b><b></b></span></span></span>
      <span class="theme-card-copy"><strong>${text[0]}</strong><small>${text[1]}</small><span class="theme-check">✓ ${t().selected}</span></span>
    </button>`;
  }

  function renderPopover() {
    let popover = document.querySelector('.theme-popover');
    if (!popover) {
      popover = document.createElement('div');
      popover.className = 'theme-popover';
      popover.hidden = true;
      document.body.appendChild(popover);
    }
    popover.innerHTML = `<div class="theme-popover-head"><div><strong>${t().title}</strong><small>${t().hint}</small></div><button class="theme-popover-close" type="button" aria-label="Close">×</button></div><div class="theme-grid">${THEMES.map(card).join('')}</div>`;
    popover.querySelector('.theme-popover-close')?.addEventListener('click',()=>popover.hidden=true);
    popover.querySelectorAll('.theme-card').forEach(button => button.addEventListener('click',()=>{
      setTheme(button.dataset.theme);
      renderPopover();
    }));
    return popover;
  }

  function mountTrigger() {
    const actions = document.querySelector('.top-actions');
    if (!actions) return;
    let trigger = actions.querySelector('.theme-trigger');
    if (!trigger) {
      trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'theme-trigger';
      const languageSwitch = actions.querySelector('.language-switch');
      if (languageSwitch?.nextSibling) actions.insertBefore(trigger, languageSwitch.nextSibling);
      else actions.prepend(trigger);
    }
    trigger.innerHTML = `<span class="theme-dot"></span><span class="theme-label">${t().button}</span>`;
    trigger.setAttribute('aria-label', t().title);
    trigger.onclick = () => {
      const popover = renderPopover();
      popover.hidden = !popover.hidden;
    };
  }

  function refreshLanguage() {
    mountTrigger();
    const popover = document.querySelector('.theme-popover');
    if (popover && !popover.hidden) renderPopover();
  }

  setTheme(current(), false);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountTrigger, {once:true});
  else mountTrigger();

  document.addEventListener('atlas:language-changed', refreshLanguage);
  document.addEventListener('click', event => {
    const popover = document.querySelector('.theme-popover');
    const trigger = document.querySelector('.theme-trigger');
    if (!popover || popover.hidden) return;
    if (popover.contains(event.target) || trigger?.contains(event.target)) return;
    popover.hidden = true;
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      const popover = document.querySelector('.theme-popover');
      if (popover) popover.hidden = true;
    }
  });

  window.AtlasThemes = {themes:[...THEMES],get theme(){return current()},setTheme};
})();
