/* Tanıtım sayfası ile hesap sayfasının ortak parçaları: tema düğmesi, nav çizgisi, hesap bağlantısı. */
import { initMeasurement } from "./measurement.js";

const $ = (s) => document.querySelector(s);

/** Web oturum belirtecinin tutulduğu anahtar (`hesap.js` yazar/siler). */
export const TOKEN_KEY = "threed-web-token";

export function hasToken() {
  try { return !!localStorage.getItem(TOKEN_KEY); } catch (e) { return false; }
}

/* Tema: sistem → açık → koyu */
const THEMES = ["system", "light", "dark"];
const LABEL = { system: "Tema: sistem", light: "Tema: açık", dark: "Tema: koyu" };

export function initChrome() {
  initMeasurement();
  const themeBtn = $("#themeBtn");
  const current = () => document.documentElement.dataset.theme || "system";
  const setTheme = (t) => {
    if (t === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = t;
    themeBtn.dataset.mode = t;
    themeBtn.setAttribute("aria-label", LABEL[t]);
    themeBtn.title = LABEL[t];
    try { t === "system" ? localStorage.removeItem("threed-theme") : localStorage.setItem("threed-theme", t); } catch (e) {}
  };
  setTheme(current());
  themeBtn.addEventListener("click", () => setTheme(THEMES[(THEMES.indexOf(current()) + 1) % 3]));

  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Oturum açıksa nav düğmesi hesaba götürür.
  const link = $("#navHesap");
  if (link && hasToken()) link.textContent = "Hesabım";
}
