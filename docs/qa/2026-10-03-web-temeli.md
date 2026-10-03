# Web içerik temeli kabul kaydı

3 Ekim 2026; yerel uygulama, commit/push/canlı yayın yapılmadı.

## Derleme ve içerik

- Vite 6.4.3 üretim derlemesi geçti; yeni framework veya paket eklenmedi.
- Kök çıktı ve `/threed-landing/` çıktısı ayrı üretildi. Her birinde `check:site`: 6 halka açık sayfa + hesap, 204 yerel bağlantı, dosyalar, bölüm hedefleri, JSON-LD/canonical ve sitemap geçti.
- Hesap `noindex`, sitemap dışında. Rehber metinleri derlenmiş HTML'de; yalnız pafta/model için JavaScript gerekli.
- Paylaşım PNG'si gerçek braket STL geometrisinden üretildi ve görsel olarak incelendi; 1200×630 boyutu doğrulandı.
- Ölçüm sözleşmesi: yalnız izinli olay/öğe ve kampanya etiketleri; özel öğeler, bilinmeyen kampanya ve hesap bilgileri dışarıda. Sağlayıcı bağlanmadı, canlı istatistik toplanmıyor.
- `check:learning`: katalog v1, 18 bölüm, 139 ders, 10 eşleme geçti. Kaynak hash'i ortak planda kayıtlı. Client kodu veya ses dosyaları değiştirilmedi.

## Gerçek tarayıcı

- Chrome masaüstü görünümü: Öğren ve braket modeli incelendi.
- Parça → Montaj → Teknik resim sekmeleri görünür paneli değiştiriyor; dört cıvata/pul ile montaj görüldü.
- 390×844: Öğren, STEP/STL rehberi, braket örneği ve ana sayfada belge genişliği 375 px; yatay taşma yok.
- Mobil Menü bağlantıları çalıştı ve gezinmeden sonra kapandı.
- Açık ve koyu tema geçişleri denendi; küçük pafta önizlemesi temanın yüzey/çizgi renkleriyle aynı kaynaktan çizildi.
- Ana sayfanın erişim bağlantısı `hesap.html?kayit` hedefli; klavye Enter ile ve derlenmiş sitede fare tıklamasıyla kayıt sekmesi/boş kayıt formu açıldı. Hesap açılmadı, parola yazılmadı, canlı lisans verilmedi.
- Tema sistem seçimine ve ekran boyutu normal masaüstüne döndürüldü.

Geliştirme sunucusu config yeniden üretimleri sırasında eski HMR bağlantı hatası kaydetti. Son teslim `npm run preview -- --host 127.0.0.1 --port 5179 --strictPort` ile derlenmiş site üzerinden yapıldı. Yerel önizleme `http://127.0.0.1:5179/ogren/`; üretim sitede HMR istemcisi yoktur.

Yerel görsel kayıtları: `ogren-masaustu.jpg`, `ogren-mobil-acik.jpg`, `braket-mobil-koyu.jpg` (bu klasörde, Git'e alınmaz).

## Kalan işler

Analiz hizmeti ve kayıt/lisans/ilk model ölçümü, kabul edilmiş tutorial içeriğinin webde yeniden kullanımı, `.3d` örnek dosyaları, yeni modeller, gerçek ekran kaydından medya paketi, pilot ve yayın ortak uygulama planındaki sırayla sürdürülür.
