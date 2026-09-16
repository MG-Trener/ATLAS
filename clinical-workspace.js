(() => {
  'use strict';
  if (window.__atlasClinicalWorkbench) return;
  window.__atlasClinicalWorkbench = true;

  const stats = document.querySelector('.stats');
  if (!stats) return;

  const block = document.createElement('section');
  block.className = 'clinical-workbench';
  block.innerHTML = `
    <article class="clinical-queue">
      <div class="clinical-workbench-head">
        <div><h2>Рабочая очередь</h2><p>Что требует внимания специалиста сегодня · демонстрационные записи</p></div>
        <span>4 задачи</span>
      </div>
      <div class="clinical-queue-grid">
        <div class="clinical-task high" tabindex="0">
          <span class="dot"></span><div><strong>K. pneumoniae · карбапенемы</strong><small>Восточно-Казахстанская область · рост +5,4 п.п.</small></div><code>AMR-0421</code><span class="status">проверить</span><small>184 изолята</small><button type="button">Открыть</button><div class="clinical-detail-strip">Проверить динамику по лабораториям, материалам и периоду. Сигнал демонстрационный и не является официальной эпидемиологической оценкой.</div>
        </div>
        <div class="clinical-task medium" tabindex="0">
          <span class="dot"></span><div><strong>ESBL Enterobacterales</strong><small>Абайская область · доля 34,8%</small></div><code>AMR-0418</code><span class="status">анализ</span><small>392 изолята</small><button type="button">Открыть</button><div class="clinical-detail-strip">Сравнить с национальным уровнем и предыдущим периодом, затем проверить структуру E. coli / K. pneumoniae.</div>
        </div>
        <div class="clinical-task medium" tabindex="0">
          <span class="dot"></span><div><strong>S. aureus · MRSA</strong><small>Алматы · умеренный рост</small></div><code>AMR-0415</code><span class="status">наблюдать</span><small>216 изолятов</small><button type="button">Открыть</button><div class="clinical-detail-strip">Оценить устойчивость тренда и достаточность выборки до эскалации сигнала.</div>
        </div>
        <div class="clinical-task info" tabindex="0">
          <span class="dot"></span><div><strong>Качество данных</strong><small>3 лаборатории · снижение полноты AST</small></div><code>QC-0097</code><span class="status">QC</span><small>88% полнота</small><button type="button">Открыть</button><div class="clinical-detail-strip">Проверить пропуски AST и своевременность передачи данных. Источник пока демонстрационный.</div>
        </div>
      </div>
    </article>
    <aside class="clinical-actions">
      <div class="clinical-workbench-head"><div><h2>Быстрые действия</h2><p>Рабочие инструменты Atlas</p></div><span>workspace</span></div>
      <div class="clinical-actions-body">
        <button class="clinical-action" type="button" data-action="catalog"><span>◉</span><strong>Справочник</strong><small>Организмы и препараты</small></button>
        <button class="clinical-action" type="button" data-action="mechanisms"><span>⌬</span><strong>Механизмы AMR</strong><small>ESBL, CRE, MRSA, VRE…</small></button>
        <button class="clinical-action" type="button" data-action="map"><span>⌖</span><strong>Карта</strong><small>Региональный слой</small></button>
        <button class="clinical-action" type="button" data-action="signals"><span>△</span><strong>Сигналы</strong><small>AMR Radar</small></button>
      </div>
      <div class="clinical-data-health"><div><span>Готовность данных прототипа</span><strong>91%</strong></div><div class="clinical-health-bar"><i></i></div></div>
    </aside>`;

  const tabs = document.querySelector('.clinical-view-tabs');
  if (tabs) tabs.insertAdjacentElement('afterend', block);
  else stats.insertAdjacentElement('afterend', block);

  block.querySelectorAll('.clinical-task').forEach(task => {
    const activate = () => {
      block.querySelectorAll('.clinical-task').forEach(t => t.classList.remove('active'));
      task.classList.add('active');
    };
    task.addEventListener('click', activate);
    task.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
  });

  block.querySelector('[data-action="catalog"]')?.addEventListener('click', () => { location.href = './reference.html'; });
  block.querySelector('[data-action="mechanisms"]')?.addEventListener('click', () => { location.href = './mechanisms.html'; });
  block.querySelector('[data-action="map"]')?.addEventListener('click', () => {
    if (window.AtlasViewport?.setClinicalView) window.AtlasViewport.setClinicalView('map');
    else document.getElementById('map-section')?.scrollIntoView({behavior:'smooth',block:'center'});
  });
  block.querySelector('[data-action="signals"]')?.addEventListener('click', () => {
    if (window.AtlasViewport?.setClinicalView) window.AtlasViewport.setClinicalView('overview');
    else document.querySelector('.alerts')?.scrollIntoView({behavior:'smooth',block:'center'});
  });
})();