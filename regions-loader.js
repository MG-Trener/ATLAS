(() => {
  'use strict';

  if (window.__atlasRegionsLoaderInstalled) return;
  window.__atlasRegionsLoaderInstalled = true;

  const nativeFetch = window.fetch.bind(window);
  const SOURCES = [
    './regions.json',
    'https://cdn.jsdelivr.net/gh/galymorg/new_qazaqstan_GeoJSON@main/regions.json',
    'https://raw.githubusercontent.com/galymorg/new_qazaqstan_GeoJSON/main/regions.json'
  ];
  const CACHE_KEY = 'atlas-regions-2024-cache-v1';

  function validRegions(data) {
    return Array.isArray(data) && data.length >= 20 && data.every(region =>
      region && typeof region.pcode === 'string' && typeof region.path === 'string'
    );
  }

  function responseFrom(data, source) {
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Atlas-Region-Source': source
      }
    });
  }

  async function loadRegions() {
    let lastError = null;

    for (const source of SOURCES) {
      try {
        const response = await nativeFetch(source, { cache: source.startsWith('./') ? 'no-cache' : 'force-cache' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.clone().json();
        if (!validRegions(data)) throw new Error('Invalid Kazakhstan regions payload');
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ source, data }));
        } catch (_) {}
        document.dispatchEvent(new CustomEvent('atlas:regions-source', { detail: { source, count: data.length } }));
        return responseFrom(data, source);
      } catch (error) {
        lastError = error;
      }
    }

    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (cached && validRegions(cached.data)) {
        document.dispatchEvent(new CustomEvent('atlas:regions-source', { detail: { source: 'browser-cache', count: cached.data.length } }));
        return responseFrom(cached.data, 'browser-cache');
      }
    } catch (_) {}

    throw lastError || new Error('Kazakhstan region geometry unavailable');
  }

  window.AtlasRegionLoader = Object.freeze({ load: loadRegions, sources: [...SOURCES] });

  window.fetch = async function atlasFetch(input, init) {
    const url = typeof input === 'string' ? input : input?.url;
    if (url === './regions.json' || url === 'regions.json' || /\/ATLAS\/regions\.json(?:\?.*)?$/.test(url || '')) {
      return loadRegions();
    }
    return nativeFetch(input, init);
  };
})();
