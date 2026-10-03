/* Sağlayıcıdan bağımsız olaylar; ilk kaynak ancak ölçüm özelliği açılırsa sekme ömrünce saklanır. */
export const MEASUREMENT_ENABLED = import.meta.env?.VITE_MEASUREMENT_ENABLED === '1';
export const MEASUREMENT_EVENT = 'threed:measurement';
const events = new Set(['page_view', 'access_signup_click', 'guide_open', 'example_open', 'example_download', 'demo_open', 'example_view', 'registration_completed', 'web_license_seen']);
const pages = new Map([['', 'home'], ['hesap.html', 'account'], ['ogren/', 'learn'], ['ornekler/', 'examples'], ['ornekler/motor-braketi/', 'motor-braketi'], ['rehberler/parametrik-cad/', 'parametrik-cad'], ['rehberler/step-stl/', 'step-stl']]);
const items = new Set(['hero', 'content', 'access', 'account', 'motor-braketi', 'parametrik-cad', 'step-stl', 'braket', 'braket.step', 'montaj.step', 'braket.stl', 'braket.pdf', 'braket.dxf', 'model', 'assembly', 'sheet']);
const CAMPAIGN_KEY = 'threed-campaign-v1';
let initialized = false;

// Yalnız bizim kampanya etiketleri okunur; diğer sorgular, e-posta ve oturum bilgileri alınmaz.
export function campaignTags(search) {
  const query = new URLSearchParams(search);
  const allowed = {
    source: new Set(['youtube', 'linkedin', 'instagram', 'newsletter', 'creator']),
    medium: new Set(['organic', 'social', 'video', 'email', 'referral', 'paid']),
    campaign: new Set(['erken-erisim', 'pilot', 'motor-braketi', 'baslangic-rehberleri']),
  };
  return Object.fromEntries(Object.entries(allowed).flatMap(([key, values]) => {
    const value = query.get(`utm_${key}`)?.toLowerCase();
    return values.has(value) ? [[key, value]] : [];
  }));
}

export function storedCampaign(storage, search) {
  const clean = (value) => campaignTags(new URLSearchParams(Object.entries(value || {}).filter(([key]) => ['source', 'medium', 'campaign'].includes(key)).map(([key, value]) => [`utm_${key}`, value])).toString());
  try {
    const existing = clean(JSON.parse(storage.getItem(CAMPAIGN_KEY) || '{}'));
    if (Object.keys(existing).length) return existing;
    const tags = campaignTags(search);
    if (Object.keys(tags).length) storage.setItem(CAMPAIGN_KEY, JSON.stringify(tags));
    return tags;
  } catch { return campaignTags(search); }
}

export function signupMeasurement(enabled, storage, search) {
  return { enabled: Boolean(enabled), attribution: enabled ? storedCampaign(storage, search) : {} };
}

export function attribution() {
  if (!MEASUREMENT_ENABLED) return campaignTags(window.location.search);
  try { return storedCampaign(window.sessionStorage, window.location.search); } catch { return campaignTags(window.location.search); }
}

export function measurementDetail(name, pathname, item, base = '/') {
  if (!events.has(name)) return null;
  let path = pathname.startsWith(base) ? pathname.slice(base.length) : '__other__';
  // Hesap sayfasının adı korunur; yalnız dizin ana sayfaları aynı sayfa kimliğine dönüşür.
  if (path.endsWith('index.html')) path = path.slice(0, -'index.html'.length);
  return { name, page: pages.get(path) || 'other', ...(items.has(item) ? { item } : {}) };
}

export function trackSiteEvent(name, item) {
  const detail = measurementDetail(name, window.location.pathname, item, import.meta.env?.BASE_URL || '/');
  if (detail) document.dispatchEvent(new CustomEvent(MEASUREMENT_EVENT, { detail: { ...detail, ...attribution() } }));
}

export function initMeasurement() {
  if (initialized) return;
  initialized = true;
  if (MEASUREMENT_ENABLED) attribution();
  trackSiteEvent('page_view');
  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('[data-event]') : null;
    if (target) trackSiteEvent(target.dataset.event, target.dataset.item);
  });
}
