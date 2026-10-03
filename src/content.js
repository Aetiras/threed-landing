import './style.css';
import './learning.css';
import { initChrome } from './ortak.js';
import { initNavigation } from './navigation.js';
import { trackSiteEvent } from './measurement.js';
import paftaSvg from './assets/pafta.svg?raw';

initChrome();
initNavigation();
document.querySelectorAll('[data-sheet-preview]').forEach((preview) => { preview.innerHTML = paftaSvg; });

// Pafta/metin sayfaları WebGL yüklemeden çalışır. Model yalnız ihtiyaç olan sayfada yüklenir.
const canvases = [...document.querySelectorAll('canvas[data-model]')];
if (canvases.length) {
  Promise.all([
    import('./viewer.js'),
    import('./assets/models/step-baglanti.stl?url'),
    import('./assets/models/baglanti-elemanlari.stl?url'),
  ]).then(async ([{ createViewer, loadPart }, bracketAsset, fastenersAsset]) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bracket = await loadPart(bracketAsset.default);
    const fasteners = canvases.some((canvas) => canvas.dataset.model === 'assembly') ? await loadPart(fastenersAsset.default) : null;
    canvases.forEach((canvas) => {
      const viewer = createViewer(canvas, { reduce });
      const parts = [{ part: bracket }];
      if (canvas.dataset.model === 'assembly') parts.push({ part: fasteners, tone: 'dark' });
      viewer.show(parts);
    });
  }).catch(() => {
    canvases.forEach((canvas) => {
      const message = document.createElement('p');
      message.className = 'model-fallback';
      message.textContent = '3B görünüm yüklenemedi. Örnek dosyaları indirip inceleyebilirsin.';
      canvas.replaceWith(message);
    });
  });
}

const tabs = [...document.querySelectorAll('[data-example-tab]')];
function selectTab(tab, focus = false) {
  tabs.forEach((candidate) => {
    const active = candidate === tab;
    candidate.setAttribute('aria-selected', String(active));
    candidate.tabIndex = active ? 0 : -1;
    document.getElementById(candidate.getAttribute('aria-controls')).hidden = !active;
  });
  if (focus) tab.focus();
  trackSiteEvent('example_view', tab.dataset.exampleTab);
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (event) => {
    const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
    if (next >= 0) { event.preventDefault(); selectTab(tabs[next], true); }
  });
});
