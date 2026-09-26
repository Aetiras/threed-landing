# threeD — Landing

**Canlı:** https://aetiras.github.io/threed-landing/

threeD, bilgisayarında çalışan parametrik bir mekanik CAD'dir: özellik ağacı, kısıtlı sketch, montaj ve teknik resim; istenirse parçayı tarif edip ağaca ekleyen bir yapay zekâ asistanı. Bu depo, ürünü anlatan tanıtım sayfasıdır.

## Sayfada neler var

Sayfa tek bir gerçek örnekle ilerler: threeD'de kurulmuş bir motor braketi. Görsellerin ve dosyaların hepsi aynı threeD belgesinden dışa aktarıldı.

- **Hero:** braketin döndürülebilir 3B modeli ve özellikleri (malzeme, kütle, yüz sayısı).
- **Nasıl çalışır:** video gibi oynayan, sarılabilen bir oynatıcı. "Asistanla" modunda istek yazılır, model yeşil önizleme olarak adım adım oluşur (ağaç ve sohbet eşzamanlı), "Uygula" ile metale döner. "Elle" modunda aynı adımlar kısayollarıyla anlatılır.
- **Asistan:** önizleme, tek geri alma, isteğe bağlılık, MCP.
- **Montaj:** yerine inen ISO cıvata ve pullar, malzeme listesi.
- **Teknik resim:** threeD'nin DXF çıktısından çizilen pafta (katmanlar açılıp kapanır) ve indirilebilir PDF/DXF/STEP/STL.
- **Durum, SSS, erken erişim (yakında).**

Açık/koyu tema (sistem tercihi ya da düğme). `prefers-reduced-motion` açıkken animasyonlar kapanır.

## Geliştirme

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/
```

Varlıkları client'tan yeniden üretmek için: `scripts/uret.py` (ayrıntı `CLAUDE.md`'de).

## Yayın

`main` dalına her gönderimde GitHub Actions (`.github/workflows/pages.yml`) siteyi derleyip GitHub Pages'e yayınlar. Proje sayfası `/threed-landing/` alt yolunda sunulduğu için derleme `PAGES_BASE` ortam değişkeniyle yapılır; Vercel veya başka bir kök alan adında değişken verilmeden derlenir (`vercel.json` hazır).

## Teknoloji

Vite · Three.js · saf CSS · Instrument Sans + IBM Plex Mono.
