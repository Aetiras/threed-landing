import "./style.css";
import { initHero } from "./hero3d.js";

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Nav gölgesi */
const nav = $("#nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 20);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* İmleç ışığı */
const glow = $(".cursor-glow");
window.addEventListener("pointermove", (e) => {
  glow.style.left = e.clientX + "px";
  glow.style.top = e.clientY + "px";
});

/* Görünüme girince */
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add("visible");
      io.unobserve(e.target);
    }
  }),
  { threshold: 0.18 }
);
$$(".reveal, .arch").forEach((el) => io.observe(el));

/* Sayaçlar */
function countUp(el) {
  const target = +el.dataset.count;
  if (reduce) { el.textContent = target; return; }
  const t0 = performance.now(), dur = 1600;
  const tick = (now) => {
    const p = Math.min(1, (now - t0) / dur);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4)));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
setTimeout(() => $$("[data-count]").forEach(countUp), 700);

/* Mıknatıslı butonlar */
$$(".magnetic").forEach((b) => {
  b.addEventListener("pointermove", (e) => {
    const r = b.getBoundingClientRect();
    b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.28}px)`;
  });
  b.addEventListener("pointerleave", () => (b.style.transform = ""));
});

/* Kart eğimi + spot ışık */
$$(".tilt").forEach((c) => {
  c.addEventListener("pointermove", (e) => {
    const r = c.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    c.style.setProperty("--mx", x * 100 + "%");
    c.style.setProperty("--my", y * 100 + "%");
    if (!reduce) c.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 5}deg) rotateY(${(x - 0.5) * 6}deg)`;
  });
  c.addEventListener("pointerleave", () => (c.style.transform = ""));
});

/* Hero sahnesi: pencere eğimi fareyi izler */
const stage = $(".stage-frame");
window.addEventListener("pointermove", (e) => {
  if (reduce || window.innerWidth < 980) return;
  const x = e.clientX / window.innerWidth - 0.5, y = e.clientY / window.innerHeight - 0.5;
  stage.style.transform = `rotateY(${-9 + x * 6}deg) rotateX(${5 - y * 5}deg)`;
});

/* Hero 3B + sohbet adımları */
const stepEls = $$(".sc-step");
const scResult = $("#scResult");
initHero($("#hero3d"), (cur, allDone, reset) => {
  stepEls.forEach((el, i) => {
    el.classList.toggle("done", !reset && (i < cur || allDone || (i === cur && false)));
    el.classList.toggle("run", !reset && !allDone && i === cur);
  });
  scResult.classList.toggle("show", allDone && !reset);
});

/* Asistan sohbet demosu */
const body = $("#cdBody");
const typing = $("#cdTyping");
const PH = "threeD'ye ne yapmasını istersiniz?";

function add(html, cls) {
  const d = document.createElement("div");
  d.className = "msg " + cls;
  d.innerHTML = html;
  body.appendChild(d);
  while (body.scrollHeight > body.clientHeight && body.children.length > 1) body.firstElementChild.remove();
  return d;
}

async function type(text) {
  typing.classList.add("typing");
  typing.textContent = "";
  for (const ch of text) {
    typing.textContent += ch;
    await sleep(reduce ? 0 : 28 + Math.random() * 30);
  }
  await sleep(380);
  typing.classList.remove("typing");
  typing.textContent = PH;
}

async function steps(label, doneLabel, ms) {
  const s = add(`<span class="spin"></span>${label}`, "msg-steps");
  await sleep(ms);
  s.innerHTML = `<span class="tick"></span>${doneLabel}`;
}

async function chatLoop() {
  for (;;) {
    body.innerHTML = "";
    await sleep(600);
    const q1 = "Üst kenarlara 4 mm fillet ekle, sonra iki Ø6.6 delik aç";
    await type(q1);
    add(q1, "msg-user");
    await sleep(500);
    await steps("Önizleme hazırlanıyor…", "3 adımda tamamlandı", 1700);
    await sleep(250);
    add(`<div class="mc-top"><span class="ok"></span>2 özellik eklendi<em>rev 14</em></div><div class="mc-chips"><span>+ Fillet1</span><span>+ Delik1</span></div><div class="mc-actions"><span>↶ Geri al</span><span>Modelde göster</span></div>`, "msg-card");
    await sleep(600);
    add(`Üst dört kenara <b>R4 fillet</b> ve iki adet <b>Ø6.6 geçme delik</b> ekledim.`, "msg-text");
    await sleep(900);
    add(`Delikleri M6 cıvata için havşalı yapayım mı?`, "msg-text");
    const ch = add(`<span>Evet, M6 havşa</span><span>Hayır, böyle kalsın</span>`, "msg-choices");
    await sleep(1800);
    ch.firstElementChild.classList.add("picked");
    await sleep(500);
    add("Evet, M6 havşa", "msg-user");
    await sleep(400);
    await steps("Değişiklik uygulanıyor…", "2 adımda tamamlandı", 1500);
    await sleep(250);
    add(`<div class="mc-top"><span class="ok"></span>Delik1 güncellendi<em>rev 15</em></div><div class="mc-chips"><span>~ Delik1 · havşa Ø13 × 90°</span></div>`, "msg-card");
    await sleep(5200);
  }
}
let chatStarted = false;
new IntersectionObserver(([e]) => {
  if (e.isIntersecting && !chatStarted) { chatStarted = true; chatLoop(); }
}, { threshold: 0.3 }).observe($("#chatDemo"));

/* DSL yazımı */
const DSL = `# Braket — tek betik, tek geri alma adımı
param genislik = 80mm
param kalinlik = 10mm

b  = box(genislik, 40, kalinlik)
f1 = fillet(b.edges("|Z"), 5mm)
h1 = hole(b.face(">Z"), at: [(-25, 0), (25, 0)],
          d: 6.6, depth: through, cbore: (11, 6.5))

sheet S1 A3 iso {
  v1 = view(front, scale: 1:1)
  v2 = view(top, parent: v1)
  v3 = view(iso, scale: 1:2)
}`;

function tokenize(src) {
  const out = [];
  const re = /(#[^\n]*)|("[^"]*")|\b(param|sheet|through|front|top|iso|A3)\b|\b([a-z_]+)(?=\()|(?<![\w.])(-?\d+(?:\.\d+)?(?:mm)?(?::\d+)?)|([\s\S])/g;
  let m;
  while ((m = re.exec(src))) {
    const [t, c, s, k, f, n] = m;
    const cls = c ? "c" : s ? "s" : k ? "k" : f ? "f" : n ? "n" : "";
    const last = out[out.length - 1];
    if (!cls && last && !last.cls) last.text += t;
    else out.push({ cls, text: t });
  }
  return out;
}
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const tokens = tokenize(DSL);
const code = $("#codeBlock");
const badge = $("#runBadge");

function render(n, caret) {
  let left = n, html = "";
  for (const t of tokens) {
    if (left <= 0) break;
    const part = t.text.slice(0, left);
    left -= part.length;
    html += t.cls ? `<span class="${t.cls}">${esc(part)}</span>` : esc(part);
  }
  code.innerHTML = html + (caret ? '<span class="caret"></span>' : "");
}

async function dslLoop() {
  for (;;) {
    badge.textContent = "yazılıyor…";
    for (let i = 0; i <= DSL.length; i += reduce ? DSL.length : 2) {
      render(i, true);
      await sleep(DSL[i] === "\n" ? 90 : 16);
    }
    render(DSL.length, false);
    badge.textContent = "uygulandı · rev 4";
    await sleep(6000);
  }
}
let dslStarted = false;
new IntersectionObserver(([e]) => {
  if (e.isIntersecting && !dslStarted) { dslStarted = true; dslLoop(); }
}, { threshold: 0.3 }).observe(code);

/* Mimari akış çizgileri */
$$(".arch-links path").forEach((p, i) => {
  const flow = p.cloneNode();
  flow.classList.add("flow");
  flow.style.animationDelay = `${(i * 0.37) % 3.2}s`;
  p.after(flow);
});
$$(".arch-nodes .node").forEach((n, i) => (n.style.transitionDelay = `${i * 0.07}s`));
