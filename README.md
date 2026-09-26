# threeD — Landing

**Canlı:** https://aetiras.github.io/threed-landing/

threeD, SolidWorks tarzı özellik ağacını, teknik resmi ve Codex tabanlı yapay zekâ asistanını tek bir yerel masaüstü uygulamasında birleştiren parametrik mekanik CAD'dir (Rust · Open CASCADE · egui/wgpu). Bu depo, projeyi anlatan animasyonlu tanıtım sayfasıdır.

## Sayfada neler var

- **Hero:** Three.js ile gerçek zamanlı çizilen bir braket — sketch çizilir, extrude ile yükselir, önizleme yeşilinden metale döner, kenarları seçilir. Yanındaki asistan kartı adımları eşzamanlı işaretler.
- **Özellikler:** özellik ağacı, kısıt çözücü, teknik resim, montaj, dosya alışverişi (bento ızgara, eğim ve spot ışık efektleri).
- **Asistan:** uygulamadaki sohbet tasarımının canlı demosu — adım özeti, sonuç kartı, hızlı yanıt seçenekleri.
- **DSL:** threeD betiği yazılırken sözdizimi renklendirmesiyle akar.
- **Mimari:** 13 crate'lik yapının akan bağlantılı diyagramı.

`prefers-reduced-motion` açık olduğunda animasyonlar kapanır ve son durum gösterilir.

## Geliştirme

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/
```

## Yayın

`main` dalına her gönderimde GitHub Actions (`.github/workflows/pages.yml`) siteyi derleyip GitHub Pages'e yayınlar. Proje sayfası `/threed-landing/` alt yolunda sunulduğu için derleme `PAGES_BASE` ortam değişkeniyle yapılır; Vercel veya başka bir kök alan adında değişken verilmeden derlenir (`vercel.json` hazır).

## Teknoloji

Vite · Three.js · saf CSS animasyonları · Geist yazı ailesi.
