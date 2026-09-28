/* Hesap sayfası: giriş, kayıt, lisans ve cihaz bilgisi. Sözleşme: threed-backend/docs/web-hesap.md */
import "./style.css";
import { TOKEN_KEY, initChrome } from "./ortak.js";

initChrome();

const API = (import.meta.env.VITE_API_BASE || "https://threed-license.codecore.tech").replace(/\/$/, "");
const $ = (s) => document.querySelector(s);

/* ───── oturum belirteci ───── */
const getToken = () => { try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; } };
const setToken = (t) => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch (e) {} };

class ApiError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

async function api(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  let res;
  try {
    res = await fetch(API + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch (e) {
    throw new ApiError("network", "Sunucuya ulaşılamadı. Bağlantını kontrol edip tekrar dene.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (data.error === "session_invalid" && auth) { setToken(null); showAuth(); }
    throw new ApiError(data.error || "internal", data.message || "Beklenmeyen bir hata oldu; biraz sonra tekrar dene.");
  }
  return data;
}

/* ───── biçimlendirme ───── */
const dateFmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
// Sunucu `--until` gününü UTC gün sonu olarak saklar; yerel saatle biçimlenirse ertesi güne kayar.
const fmtDate = (s) => dateFmt.format(new Date(s * 1000));
const DAY = 86400;

function ago(s) {
  const d = Math.floor((Date.now() / 1000 - s) / DAY);
  if (d <= 0) return "bugün";
  if (d === 1) return "dün";
  if (d < 30) return `${d} gün önce`;
  return fmtDate(s);
}

function platformName(p) {
  const [os, arch] = String(p).split("-");
  const osName = { macos: "macOS", windows: "Windows", linux: "Linux" }[os] || os;
  const archName = { aarch64: "ARM", x86_64: "x64" }[arch];
  return archName ? `${osName} · ${archName}` : osName;
}

const planName = (p) => (p ? p.charAt(0).toLocaleUpperCase("tr-TR") + p.slice(1) : "—");
const STATUS = { active: "Etkin", scheduled: "Başlamadı", expired: "Süresi doldu", revoked: "İptal edildi" };

function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") n.className = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  }
  for (const k of kids) if (k != null) n.append(k);
  return n;
}

/* ───── görünümler ───── */
const views = { loading: $("#loading"), auth: $("#authView"), account: $("#accountView") };
function show(name) {
  for (const [k, v] of Object.entries(views)) v.hidden = k !== name;
}

let mode = new URLSearchParams(location.search).has("kayit") ? "register" : "login";

const COPY = {
  login: {
    tb: "Giriş", title: "Hesabına gir", lead: "threeD uygulamasında kullandığın e-posta ve parolayla.",
    submit: "Giriş yap", busy: "Giriş yapılıyor…", pwAuto: "current-password",
  },
  register: {
    tb: "Kayıt", title: "Hesap oluştur", lead: "Erken erişim lisansın bu hesaba tanımlanır; threeD'ye de aynı e-posta ve parolayla girersin.",
    submit: "Hesap oluştur", busy: "Hesap oluşturuluyor…", pwAuto: "new-password",
  },
};

function setMode(m) {
  mode = m;
  const c = COPY[m];
  $("#tabLogin").setAttribute("aria-selected", String(m === "login"));
  $("#tabRegister").setAttribute("aria-selected", String(m === "register"));
  $("#authTb").textContent = c.tb;
  $("#authTitle").textContent = c.title;
  $("#authLead").textContent = c.lead;
  $("#authSubmit").textContent = c.submit;
  $("#password").autocomplete = c.pwAuto;
  $("#pwHint").hidden = m !== "register";
  $("#authFoot").hidden = m !== "login";
  $("#authError").hidden = true;
  history.replaceState(null, "", location.pathname + (m === "register" ? "?kayit" : ""));
}

function showAuth() {
  setMode(mode);
  show("auth");
  $("#email").focus();
}

$("#tabLogin").addEventListener("click", () => setMode("login"));
$("#tabRegister").addEventListener("click", () => setMode("register"));

for (const b of document.querySelectorAll(".pw-toggle")) {
  b.addEventListener("click", () => {
    const input = document.getElementById(b.dataset.for);
    const hidden = input.type === "password";
    input.type = hidden ? "text" : "password";
    b.textContent = hidden ? "Gizle" : "Göster";
    b.setAttribute("aria-label", hidden ? "Parolayı gizle" : "Parolayı göster");
  });
}

function formError(id, msg) {
  const p = $(id);
  p.textContent = msg || "";
  p.hidden = !msg;
}

$("#authForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = $("#email").value.trim();
  const password = $("#password").value;
  if (!email || !email.includes("@")) return formError("#authError", "Geçerli bir e-posta adresi gir.");
  if (!password) return formError("#authError", "Parolanı gir.");
  if (mode === "register" && [...password].length < 10) return formError("#authError", "Parola en az 10 karakter olmalı.");
  formError("#authError", "");
  const btn = $("#authSubmit");
  btn.disabled = true;
  btn.textContent = COPY[mode].busy;
  try {
    const { token } = await api(mode === "register" ? "/v1/web/register" : "/v1/web/login", {
      method: "POST", body: { email, password }, auth: false,
    });
    setToken(token);
    $("#password").value = "";
    await loadAccount();
  } catch (err) {
    // Hesap zaten varsa giriş sekmesine geç; e-posta alanı dolu kalır.
    if (err.code === "email_taken") setMode("login");
    formError("#authError", err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = COPY[mode].submit;
  }
});

/* ───── hesap ───── */
function renderLicense(acc) {
  const lic = acc.license;
  const card = $("#licCard");
  const grid = $("#licGrid");
  grid.replaceChildren();
  const cell = (dt, dd, sub) => grid.append(el("div", {}, el("dt", {}, dt), el("dd", {}, dd, sub ? el("small", {}, sub) : null)));

  if (!lic) {
    // Geçmişte lisansı olup şimdi olmayan hesap "doldu", hiç olmayan "bekleniyor".
    const last = acc.licenses[0];
    card.dataset.state = last ? "ended" : "pending";
    $("#licStateText").textContent = last ? (STATUS[last.status] || "Geçersiz") : "Lisans bekleniyor";
    $("#licTitle").textContent = last ? "Geçerli bir lisansın yok" : "Hesabın hazır";
    $("#licNote").textContent = last
      ? "threeD'yi açmak için yeni bir lisans gerekiyor. Lisansın yenilendiğinde burada görünür."
      : "Erken erişim lisansın tanımlandığında plan, bitiş tarihi ve cihaz sayısı burada görünür. Sonra threeD'yi aç ve bu hesapla giriş yap.";
    cell("Lisans", last ? "Yok" : "Henüz yok");
    cell("Kayıt", fmtDate(acc.created_at));
    return;
  }

  card.dataset.state = "active";
  $("#licStateText").textContent = "Lisans etkin";
  $("#licTitle").textContent = `threeD ${planName(lic.plan)}`;
  $("#licNote").textContent = "threeD'yi aç ve bu hesabın e-posta ve parolasıyla giriş yap. Uygulama internet olmadan da bir haftaya kadar çalışır.";
  cell("Plan", planName(lic.plan));
  cell("Başlangıç", fmtDate(lic.starts_at));
  if (lic.expires_at == null) cell("Bitiş", "Süresiz");
  else {
    const left = Math.max(0, Math.ceil((lic.expires_at - Date.now() / 1000) / DAY));
    cell("Bitiş", fmtDate(lic.expires_at), left <= 1 ? "son gün" : `${left} gün kaldı`);
  }
  cell("Bilgisayar", `${acc.devices.length} / ${lic.max_devices}`, acc.devices.length >= lic.max_devices ? "tümü kullanımda" : null);
}

function renderDevices(acc) {
  const ul = $("#devices");
  ul.replaceChildren();
  const max = acc.license?.max_devices;
  $("#devCount").textContent = max ? `${acc.devices.length} / ${max} kullanımda` : "";
  if (!acc.devices.length) {
    ul.append(el("li", { class: "dev-empty" }, "threeD'de bu hesapla giriş yaptığın bilgisayarlar burada görünür."));
    return;
  }
  for (const d of acc.devices) {
    const btn = el("button", { class: "btn btn-line", type: "button" }, "Serbest bırak");
    btn.addEventListener("click", async () => {
      if (!confirm(`“${d.name}” serbest bırakılsın mı? Oradaki threeD oturumu kapanır.`)) return;
      btn.disabled = true;
      try {
        await api(`/v1/web/devices/${d.id}/release`, { method: "POST" });
        await loadAccount();
      } catch (err) {
        btn.disabled = false;
        alert(err.message);
      }
    });
    ul.append(
      el("li", {},
        el("div", { class: "dev-main" },
          el("b", {}, d.name),
          el("span", {}, `${platformName(d.platform)} · threeD ${d.app_version}`)),
        el("span", { class: "dev-seen" }, `son görülme ${ago(d.last_seen)}`),
        btn),
    );
  }
}

function renderHistory(acc) {
  const rows = acc.licenses;
  // Tek ve etkin lisans zaten üstte; geçmiş yalnız birden fazla kayıt varsa gösterilir.
  $("#histSec").hidden = rows.length < 2;
  const body = $("#histBody");
  body.replaceChildren();
  for (const l of rows) {
    body.append(
      el("tr", {},
        el("td", {}, planName(l.plan)),
        el("td", {}, el("span", { class: `lst lst-${l.status}` }, STATUS[l.status] || l.status)),
        el("td", {}, fmtDate(l.starts_at)),
        el("td", {}, l.expires_at == null ? "Süresiz" : fmtDate(l.expires_at)),
        el("td", {}, String(l.max_devices))),
    );
  }
}

async function loadAccount() {
  if (!getToken()) return showAuth();
  let acc;
  try {
    acc = await api("/v1/web/account");
  } catch (err) {
    if (err.code === "session_invalid") return; // api() giriş formunu açtı
    views.loading.textContent = err.message;
    show("loading");
    return;
  }
  $("#acctEmail").textContent = acc.email;
  $("#acctSince").textContent = `Kayıt ${fmtDate(acc.created_at)}`;
  renderLicense(acc);
  renderDevices(acc);
  renderHistory(acc);
  show("account");
}

$("#logoutBtn").addEventListener("click", async () => {
  try { await api("/v1/web/logout", { method: "POST" }); } catch (e) {}
  setToken(null);
  mode = "login";
  showAuth();
});

$("#pwForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("#pwOk").hidden = true;
  const current_password = $("#curPw").value;
  const new_password = $("#newPw").value;
  if (!current_password) return formError("#pwError", "Mevcut parolanı gir.");
  if ([...new_password].length < 10) return formError("#pwError", "Yeni parola en az 10 karakter olmalı.");
  formError("#pwError", "");
  const btn = e.submitter || $("#pwForm button[type=submit]");
  btn.disabled = true;
  try {
    await api("/v1/web/password", { method: "POST", body: { current_password, new_password } });
    $("#pwForm").reset();
    $("#pwOk").hidden = false;
  } catch (err) {
    formError("#pwError", err.message);
  } finally {
    btn.disabled = false;
  }
});

loadAccount();
