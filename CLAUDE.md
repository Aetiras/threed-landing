# threed-landing — threeD tanıtım sayfası

threeD masaüstü CAD uygulamasını (`../threed-client`) anlatan tek sayfalık Türkçe tanıtım sitesi ve hesap sayfası.
Canlı: https://aetiras.github.io/threed-landing/

## Komutlar

```sh
npm install
npm run dev       # http://localhost:5173
npm run build     # dist/
npm run preview
```

Test ve lint yok; değişikliği `npm run build` ile ve tarayıcıda kontrol et: masaüstü + mobil (390 px), açık + koyu tema.

## Yaklaşım

- Sayfa baştan sona **tek bir gerçek örnek** üzerinden anlatır: threeD'de kurulmuş bir motor braketi. Hero'daki model,
  adım adım özellik ağacı, montaj, pafta ve indirilebilir dosyalar aynı belgeden dışa aktarıldı. Uydurma görsel ekleme.
- Hedef okur makine mühendisi: "uygulamayı açınca ne yaparım, ne görürüm". Crate/test sayısı gibi geliştirici bilgisi yok.
  Sayfada kod bloğu gösterilmez; DSL yalnız SSS'te kodsuz anılır (`src/assets/braket.dsl` sadece `uret.py` içindir).
- usecady.com'dan ilham alındı, ama ondan ayrışmak bilinçli: kehribar renk, revizyon kaydırıcısı ve sticky 01–05
  anlatımı kullanılmaz; kendi motiflerimiz antet şeridi (`.tb`), pafta ve özellik ağacı geri sarmasıdır.
- Erken erişim **kayıt açık**: `#erken-erisim` ve nav hesap sayfasına götürür. Kayıt yalnız hesap açar; lisansı yönetici
  `threed-backend` CLI'ı ile verir. İndirme bağlantısı henüz yok — sayfada indirme vaadi yazma.

## Yapı

- `index.html` — içerik (`lang="tr"`): nav, hero, `#nasil` (oynatıcı), `#asistan`, `#montaj`, `#teknik-resim`,
  `#durum`, `#sss`, `#erken-erisim`. Baştaki satır içi betik temayı ilk boyamadan önce uygular.
- `hesap.html` + `src/hesap.js` — **hesap sayfası**: giriş / kayıt / hesap görünümü (lisans, bilgisayarlar, lisans
  geçmişi, parola değiştirme). `threed-backend`'in `/v1/web/*` uçlarını çağırır; sözleşme
  `../threed-backend/docs/web-hesap.md`. Oturum belirteci `localStorage: threed-web-token`. API adresi
  `VITE_API_BASE` (üretim varsayılanı `https://threed-license.codecore.tech`, `npm run dev` → `.env.development`).
- `src/ortak.js` — iki sayfanın ortağı: tema düğmesi (sistem → açık → koyu, `localStorage: threed-theme`), nav çizgisi,
  oturum açıksa nav'daki "Giriş yap" → "Hesabım".
- `src/main.js` — **oynatıcı** (`CHAPTERS`),
  pafta katmanları, beliriş. Oynatıcı video gibidir: `render()` yalnız `t` (ms) ve moda (`ai` | `manual`) bağlıdır,
  bu yüzden zaman çizelgesi ileri-geri sarılabilir. Sohbet öğeleri `data-at="bölüm:oran"` ile zamanlanır.
- `src/viewer.js` — Three.js STL görüntüleyici (`createViewer`, `loadPart`). `show()` sabit sahne (hero, montajda
  cıvataların inişi); `frame()` oynatıcı karesi: sketch tüpü, extrude büyümesi, kırpma düzlemiyle tarama
  (önceki/sonraki adım STL'i), önizleme yeşili → metal. Tema renkleri CSS değişkenlerinden; yalnız görünürken çizer.
- `src/style.css` — tüm stiller. Renkler yalnız `:root` token'larında; koyu tema `prefers-color-scheme` ve
  `[data-theme="dark"]` altında iki kez tanımlı (ikisini birlikte güncelle). Yazı: Instrument Sans + IBM Plex Mono.
- `src/assets/` — `braket.dsl` (parçanın DSL'i; sayfada gösterilmez, `uret.py` kullanır), `pafta.svg` (DXF'ten), `models/*.stl`
  (ağaç adımları + bağlantı elemanları). `public/files/` — indirilebilir PDF/DXF/STEP/STL.
- `scripts/` — varlıkları yeniden üretme: `uret.py`, `pafta.dsl`, `montaj.dsl`, `dxf2svg.py`.

## Varlıkları yeniden üretmek

Client'ta geometri, DSL ya da teknik resim değişirse varlıkları yeniden üret:

1. Client'ı derle, **boş** bir threeD penceresi aç (`../threed-client/target/debug/threed`).
2. `python3 scripts/uret.py ../threed-client/target/debug/threed-mcp "$HOME/Library/Application Support/threeD/hosts/<pid>.json"`
   — belge `replace` ile baştan yazılır; kullanıcının açık belgesini hedefleme.
3. Çıktıdaki yüz sayısı, hacim ve malzeme listesi değiştiyse `index.html` (spec şeridi, BOM tablosu) ve `main.js`
  (`CHAPTERS`: kart değerleri, tarama aralıkları, sohbet metni) içindeki sayıları güncelle. `braket.dsl` satır
  numaraları `uret.py` ile eşleşmeli.

## Kurallar

- `prefers-reduced-motion` açıkken animasyonlar kapanır, son durum gösterilir (`main.js`'teki `reduce`).
- Bağımlılıklar yalın: yalnız `three` ve `vite`. Framework ekleme.
- İçerik client'ın gerçeğini yansıtmalı; kısayollar, araç adları, dosya biçimleri, mate/standart parça listeleri ve
  platform durumu client'ta doğrulanarak yazıldı. Emin değilsen client'ta doğrula.

## Yayın

- `main`'e push → `.github/workflows/pages.yml` derleyip GitHub Pages'e yayınlar (`PAGES_BASE=/threed-landing/`).
- `vite.config.js`: `base = process.env.PAGES_BASE || "/"`; iki giriş sayfası (`index.html`, `hesap.html`). JS'te varlıkları `import …?url` / `?raw` ile al;
  `index.html`'de `public/` dosyalarına göreli yol ver (`files/braket.pdf`), mutlak `/` alt yolda kırılır.
- Hesap sayfası üretim backend'ine bağlıdır: backend'de `/v1/web/*` yayında değilse ya da `THREED_WEB_ORIGINS` sitenin
  kökenini içermiyorsa sayfa "Sunucuya ulaşılamadı" der. Önce backend'i dağıt.
- Uzak depo: `github.com/Aetiras/threed-landing`. Push yalnız kullanıcı isterse — push canlı siteyi günceller.
