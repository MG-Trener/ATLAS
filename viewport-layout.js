(() => {
  'use strict';
  if (window.__atlasViewportLayout) return;
  window.__atlasViewportLayout = true;

  const root = document.documentElement;
  const concept = root.dataset.atlasConcept;
  if (!concept) return;

  const desktop = () => window.matchMedia('(min-width:1100px) and (min-height:680px)').matches;

  function ensureClinicalTabs() {
    if (concept !== 'clinical') return;
    const stats = document.querySelector('.stats');
    if (!stats || document.querySelector('.clinical-view-tabs')) return;

    const tabs = document.createElement('nav');
    tabs.className = 'clinical-view-tabs';
    tabs.setAttribute('aria-label', 'Рабочие области');
    tabs.innerHTML = `
      <button type="button" class="active" data-clinical-tab="overview">Работа</button>
      <button type="button" data-clinical-tab="map">Карта</button>
      <button type="button" data-clinical-tab="trends">Тренды</button>
      <button type="button" data-clinical-tab="quality">Качество</button>
      <span class="clinical-view-hint">Один экран · без прокрутки страницы</span>`;
    stats.insertAdjacentElement('afterend', tabs);

    const setView = (view) => {
      const allowed = ['overview','map','trends','quality'];
      if (!allowed.includes(view)) view = 'overview';
      root.dataset.clinicalView = view;
      tabs.querySelectorAll('[data-clinical-tab]').forEach(btn => {
        const active = btn.dataset.clinicalTab === view;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-current', active ? 'page' : 'false');
      });
      localStorage.setItem('atlas-clinical-view', view);
      if (view === 'map') setTimeout(() => window.dispatchEvent(new Event('resize')), 60);
      document.dispatchEvent(new CustomEvent('atlas:clinical-view-changed', {detail:{view}}));
    };

    tabs.addEventListener('click', e => {
      const button = e.target.closest('[data-clinical-tab]');
      if (button) setView(button.dataset.clinicalTab);
    });

    document.addEventListener('click', e => {
      const action = e.target.closest('.clinical-action[data-action]');
      if (!action) return;
      if (action.dataset.action === 'map') {
        e.preventDefault();
        e.stopPropagation();
        setView('map');
      }
      if (action.dataset.action === 'signals') {
        e.preventDefault();
        e.stopPropagation();
        setView('overview');
        setTimeout(() => document.querySelector('.alerts')?.classList.add('viewport-attention'), 30);
        setTimeout(() => document.querySelector('.alerts')?.classList.remove('viewport-attention'), 1300);
      }
    }, true);

    window.addEventListener('keydown', e => {
      if (!desktop() || !e.altKey) return;
      const keyMap = {'1':'overview','2':'map','3':'trends','4':'quality'};
      if (keyMap[e.key]) {
        e.preventDefault();
        setView(keyMap[e.key]);
      }
    });

    window.AtlasViewport = { setClinicalView:setView };
    setView(localStorage.getItem('atlas-clinical-view') || 'overview');
  }

  function applyViewportFlag() {
    root.classList.toggle('atlas-one-screen', desktop());
  }

  applyViewportFlag();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      ensureClinicalTabs();
      setTimeout(ensureClinicalTabs, 120);
    }, {once:true});
  } else {
    ensureClinicalTabs();
    setTimeout(ensureClinicalTabs, 120);
  }
  window.addEventListener('resize', applyViewportFlag);
})();