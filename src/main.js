import "./style.css";
import { initChrome } from "./ortak.js";
import { createViewer, loadPart } from "./viewer.js";
import paftaSvg from "./assets/pafta.svg?raw";
import govdeUrl from "./assets/models/step-govde.stl?url";
import kaburgaUrl from "./assets/models/step-kaburga.stl?url";
import koseUrl from "./assets/models/step-kose.stl?url";
import milUrl from "./assets/models/step-mil_delik.stl?url";
import flansUrl from "./assets/models/step-flans_delik.stl?url";
import braketUrl from "./assets/models/step-baglanti.stl?url";
import baglantiUrl from "./assets/models/baglanti-elemanlari.stl?url";

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);

initChrome();

/* ───── Oynatıcı: braketin kuruluşu ─────
   Her bölüm, threeD'den dışa aktarılmış gerçek bir ara durumu (STL) gösterir. Kareler yalnız zamana bağlıdır;
   bu yüzden zaman çizelgesi video gibi ileri-geri sarılabilir. */
const PROFILE = [[0, 0], [110, 0], [110, 10], [10, 10], [10, 80], [0, 80]];
const CHAPTERS = [
  { id: "istek", ai: true, dur: 4200, label: "İstek" },
  {
    id: "profil", dur: 3000, name: "Profil", kind: "Sketch", val: "Ön düzlem", anim: "sketch",
    card: [["Düzlem", "Ön"], ["Durum", "Tam tanımlı"]],
    plan: "L profil sketch'i, Ön düzlem",
    how: "Dock'tan Sketch'i seç ve Ön düzleme tıkla. L ile profili çiz, D ile ölçülendir. Serbestlik derecesi sıfıra inince sketch tam tanımlıdır; Bitir ile çık.",
    keys: [["S", "sketch"], ["L", "çizgi"], ["D", "ölçü"]],
  },
  {
    id: "govde", dur: 2600, name: "Gövde", kind: "Extrude", val: "60 mm", url: govdeUrl, anim: "extrude",
    card: [["Derinlik", "60 mm"], ["Yön", "Orta düzlem"]],
    plan: "Gövde: 60 mm extrude",
    how: "Profili seç ve E'ye bas. Seçimin yanında küçük bir ayar kartı açılır: derinliği yaz, orta düzlemi işaretle. Yeşil önizlemeyi Enter ile uygula.",
    keys: [["E", "extrude"], ["Enter", "uygula"]],
  },
  {
    id: "kaburga", dur: 2400, name: "Kaburga", kind: "Extrude", val: "8 mm", url: kaburgaUrl, sweep: [[1, 0, 0], 6, 58],
    card: [["Derinlik", "8 mm"], ["Yön", "Orta düzlem"]],
    plan: "Destek kaburgası, 8 mm",
    how: "Aynı düzlemde üçgen bir sketch çiz ve 8 mm extrude et. Kaburga gövdeyle kendiliğinden birleşir.",
    keys: [["S", "sketch"], ["E", "extrude"]],
  },
  {
    id: "kose", dur: 2200, name: "Köşeler", kind: "Fillet", val: "R2", url: koseUrl, sweep: [[1, 0, 0], -4, 114],
    card: [["Yarıçap", "2 mm"], ["Kenar", "6"]],
    plan: "Köşelere R2 fillet",
    how: "Dock'tan Fillet'i seç, yuvarlanacak kenarlara tıkla, yarıçapı yaz.",
    keys: [["Enter", "uygula"], ["Esc", "iptal"]],
  },
  {
    id: "mil", dur: 2400, name: "Mil yuvası", kind: "Cut", val: "Ø22", url: milUrl, sweep: [[0, 0, -1], -84, -34],
    card: [["Çap", "22 mm"], ["Derinlik", "Boydan boya"]],
    plan: "Ø22 mil yuvası",
    how: "Duvarın yan düzleminde bir daire çiz (C), çapını 22 yap ve Cut ile boydan boya kes.",
    keys: [["C", "daire"], ["D", "ölçü"]],
  },
  {
    id: "flans", dur: 2400, name: "Flanş delikleri", kind: "Cut", val: "4 × Ø5,5", url: flansUrl, sweep: [[0, 0, -1], -84, -28],
    card: [["Çap", "5,5 mm"], ["Adet", "4"]],
    plan: "4 × Ø5,5 flanş deliği",
    how: "Mil yuvasının çevresine, 40 mm çaplı çember üstüne dört daire koy ve aynı şekilde kes.",
    keys: [["C", "daire"]],
  },
  {
    id: "baglanti", dur: 2400, name: "Bağlantı delikleri", kind: "Delik", val: "4 × Ø9", url: braketUrl, sweep: [[1, 0, 0], 34, 110],
    card: [["Çap", "9 mm"], ["Derinlik", "Boydan boya"]],
    plan: "4 × Ø9 bağlantı deliği",
    how: "Dock'tan Delik'i seç, taban yüzüne tıkla, konumları ve çapı gir. Düz ya da konik havşa da seçilebilir.",
    keys: [["Enter", "uygula"]],
  },
  { id: "uygula", ai: true, dur: 3800, label: "Uygula" },
  { id: "son", dur: 2600, label: "Bitti", how: "Yedi adım, 27 yüz. Bir ölçüyü değiştirmek istersen ağaçta özelliğe tıkla; model yeniden hesaplanır.", keys: [["Ctrl+Z", "geri al"]] },
];
const FEATURES = CHAPTERS.filter((c) => c.kind);

const player = $("#player");
const view = createViewer($("#plCanvas"), { reduce, azimuth: 0.1, zoom: 1.04 });
const tree = $("#plTree");
const plan = $("#plPlan");
tree.innerHTML = FEATURES.map((c) => `<li data-id="${c.id}" hidden><i class="ti ti-${c.kind === "Sketch" ? "sk" : c.kind === "Fillet" ? "fi" : c.kind === "Cut" ? "cu" : c.kind === "Delik" ? "ho" : "ex"}" aria-hidden="true"></i><span>${c.name}</span><em>${c.val}</em></li>`).join("");
plan.innerHTML = FEATURES.map((c) => `<li data-id="${c.id}" hidden><span class="tick" aria-hidden="true"></span>${c.plan}</li>`).join("");
const userMsg = $("#plChat .msg-user").textContent;

let mode = "ai", list = [], total = 0, t = 0, playing = false, parts = {}, lastKey = "";
function setMode(m) {
  mode = m;
  list = [];
  let s = 0;
  // Yazma bölümü CHAPTERS'taki sürenin 0,7 katı, sonrası 0,35 katı oynar.
  for (const c of CHAPTERS) if (m === "ai" || !c.ai) {
    const dur = c.id === "istek" ? c.dur * 0.7 : c.dur * 0.35;
    list.push({ ...c, dur, start: s });
    s += dur;
  }
  total = s;
  player.dataset.mode = m;
  $$(".pl-tabs button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.mode === m)));
  $("#plChat").hidden = m !== "ai";
  $("#plGuide").hidden = m === "ai";
  $("#plSegs").innerHTML = list.map((c) => `<span style="flex:${c.dur}" title="${c.name || c.label}"></span>`).join("");
  lastKey = "";
}
const at = (id, frac = 0) => {
  const c = list.find((x) => x.id === id);
  return c ? c.start + frac * c.dur : Infinity;
};
const fmt = (ms) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}`;

function render() {
  const i = Math.max(0, list.findIndex((c) => t < c.start + c.dur));
  const idx = t >= total ? list.length - 1 : i;
  const c = list[idx];
  const p = clamp01((t - c.start) / c.dur);
  const fi = FEATURES.findIndex((f) => f.id === c.id);
  const doneF = fi >= 0 ? fi : c.id === "istek" ? -1 : FEATURES.length - 1;

  // Renk: asistanla her şey "Uygula"ya kadar önizleme yeşilidir; elle her adım Enter'la metale döner.
  const applyT = mode === "ai" ? (c.id === "uygula" ? 1 - ease(clamp01((p - 0.42) / 0.4)) : c.id === "son" ? 0 : 1) : 0;
  const tintCur = mode === "ai" ? applyT : fi >= 0 ? 1 - clamp01((p - 0.72) / 0.28) : 0;
  const tintPrev = mode === "ai" ? applyT : 0;

  const partOf = (k) => (k >= 0 && FEATURES[k].url ? parts[FEATURES[k].url] : null);
  if (c.id === "istek") view.frame({ grid: p > 0.6 });
  else if (c.id === "profil") view.frame({ grid: true, sketch: { points: PROFILE, p: ease(clamp01(p / 0.85)) } });
  else if (c.id === "govde")
    view.frame({ grid: p < 0.55, sketch: p < 0.9 ? { points: PROFILE, p: 1 } : null, cur: partOf(fi), extrude: ease(clamp01(p / 0.8)), tintCur });
  else if (c.sweep) {
    const [axis, a, b] = c.sweep;
    const e = ease(clamp01(p / 0.8));
    view.frame({ prev: partOf(fi - 1), cur: partOf(fi), sweep: e < 1 ? { axis, d: a + (b - a) * e } : null, tintPrev, tintCur });
  } else view.frame({ cur: partOf(FEATURES.length - 1), tintCur });

  // DOM yalnız değişince güncellenir.
  const key = `${mode}|${idx}|${Math.floor(t / 80)}`;
  if (key === lastKey) return;
  lastKey = key;

  $$("li", tree).forEach((li, k) => {
    li.hidden = k > doneF;
    li.classList.toggle("now", k === fi);
    li.classList.toggle("pv", mode === "ai" && applyT > 0.5 && k <= doneF);
  });
  const card = $("#plCard");
  if (fi >= 0 && p < 0.97) {
    card.innerHTML = `<b>${c.kind}</b>` + c.card.map(([k, v]) => `<span><em>${k}</em>${v}</span>`).join("");
    card.classList.add("on");
  } else card.classList.remove("on");
  $("#plCaption").textContent = fi >= 0 ? `${c.kind} · ${c.name}` : c.id === "uygula" ? "Önizleme → belge" : c.id === "son" ? "Motor braketi · 27 yüz" : "Yeni parça";

  if (mode === "ai") {
    $$("#plChat [data-at]").forEach((el) => {
      const [id, f] = el.dataset.at.split(":");
      el.classList.toggle("shown", t >= at(id, +f));
    });
    $$("li", plan).forEach((li, k) => {
      const f = FEATURES[k];
      li.hidden = t < at(f.id);
      li.classList.toggle("busy", t >= at(f.id) && t < at(f.id, 0.85));
      li.classList.toggle("ok", t >= at(f.id, 0.85));
    });
    $("#plApply").classList.toggle("pressed", t >= at("uygula", 0.4));
    const typing = c.id === "istek" ? clamp01((p - 0.05) / 0.78) : 0;
    const typed = $("#plTyped");
    typed.textContent = typing > 0 && p < 0.92 ? userMsg.slice(0, Math.round(typing * userMsg.length)) : "threeD'ye ne yapmasını istersin?";
    typed.classList.toggle("ph", !(typing > 0 && p < 0.92));
    const chat = $("#plChat");
    chat.scrollTop = chat.scrollHeight;
  } else {
    const g = $("#plGuide");
    const gk = `${idx}`;
    if (g.dataset.k !== gk) {
      g.dataset.k = gk;
      g.innerHTML = `<p class="pl-step">${fi >= 0 ? `Adım ${fi + 1} / ${FEATURES.length} · ${c.kind}` : "Sonuç"}</p><h3>${c.name || c.label}</h3><p>${c.how}</p><div class="keys">${c.keys.map(([k, l]) => `<span><kbd>${k}</kbd>${l}</span>`).join("")}</div>`;
    }
  }
  $("#plFill").style.width = `${(t / total) * 100}%`;
  $("#plTrack").setAttribute("aria-valuenow", String(Math.round((t / total) * 100)));
  $("#plTrack").setAttribute("aria-valuetext", `${fmt(t)} / ${fmt(total)} · ${c.name || c.label}`);
  $("#plTime").textContent = `${fmt(t)} / ${fmt(total)}`;
  player.classList.toggle("ended", t >= total);
}

let lastNow = 0;
function tick(now) {
  if (!playing) return;
  t = Math.min(total, t + Math.min(64, now - lastNow));
  lastNow = now;
  render();
  if (t >= total) pause();
  else requestAnimationFrame(tick);
}
function play() {
  if (t >= total) t = 0;
  playing = true;
  player.classList.add("playing");
  view.setSpin(true);
  lastNow = performance.now();
  requestAnimationFrame(tick);
}
function pause() {
  playing = false;
  player.classList.remove("playing");
  view.setSpin(false);
}
function seek(ms) {
  t = Math.min(total, Math.max(0, ms));
  render();
}
$("#plPlay").addEventListener("click", () => (playing ? pause() : play()));
$$(".pl-tabs button").forEach((b) =>
  b.addEventListener("click", () => {
    if (b.dataset.mode === mode) return;
    setMode(b.dataset.mode);
    t = 0;
    render();
    play();
  })
);
const track = $("#plTrack");
const seekAt = (e) => {
  const r = track.getBoundingClientRect();
  seek(((e.clientX - r.left) / r.width) * total);
};
track.addEventListener("pointerdown", (e) => {
  track.setPointerCapture(e.pointerId);
  pause();
  seekAt(e);
});
track.addEventListener("pointermove", (e) => track.hasPointerCapture(e.pointerId) && seekAt(e));
track.addEventListener("keydown", (e) => {
  const step = { ArrowRight: 1000, ArrowLeft: -1000, Home: -Infinity, End: Infinity }[e.key];
  if (step === undefined) return;
  e.preventDefault();
  pause();
  seek(Math.abs(step) === Infinity ? (step > 0 ? total : 0) : t + step);
});

setMode("ai");
Promise.all(FEATURES.filter((f) => f.url).map((f) => loadPart(f.url).then((p) => (parts[f.url] = p)))).then(() => {
  if (reduce) { t = total; render(); return; }
  render();
  // Görünüme girince oynar; ekrandan çıkınca duraklar, geri gelince (kullanıcı durdurmadıysa) sürer.
  let auto = true;
  $("#plPlay").addEventListener("click", () => (auto = false));
  track.addEventListener("pointerdown", () => (auto = false));
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && auto && !playing && t < total) play();
    else if (!e.isIntersecting && playing) { pause(); auto = true; }
  }, { threshold: 0.4 }).observe(player);
});

/* Hero ve montaj görüntüleyicileri */
const hero = createViewer($("#heroCanvas"), { autoRotate: true, reduce, azimuth: -0.1 });
loadPart(braketUrl).then((part) => hero.show([{ part }]));
const asm = createViewer($("#asmCanvas"), { autoRotate: true, reduce, azimuth: 0.35 });
Promise.all([loadPart(braketUrl), loadPart(baglantiUrl)]).then(([b, f]) => asm.show([{ part: b }, { part: f, tone: "dark", drop: 45 }]));

/* Pafta: DXF'ten üretilen SVG, katmanları açılıp kapanır */
const paper = $("#sheetPaper");
paper.innerHTML = paftaSvg;
$$(".sheet-tools input").forEach((cb) =>
  cb.addEventListener("change", () => paper.classList.toggle("hide-" + cb.dataset.layer, !cb.checked))
);

/* Görünüme girişte yumuşak beliriş */
if (!reduce) {
  const rv = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); rv.unobserve(e.target); }
  }), { threshold: 0.12 });
  $$(".sec-head, .player, .facts, .asm-fig, .sheet, .status, .faq, .access-card").forEach((el) => {
    el.classList.add("rv");
    rv.observe(el);
  });
}
