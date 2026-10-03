# Görünürlük ve içerik temeli

3 Ekim 2026. Çalışma sırası: [ortak uygulama planı](../../docs/plans/2026-10-03-gorunurluk-ve-egitim.md).

## İçerik kaynağı ve sayfalar

`src/content/pages.js` web yazıları ve örneklerin tek kaynağıdır. `scripts/site-content.mjs`, Vite yapılandırması okunurken bu kaynaktan statik HTML üretir. Oluşan HTML dosyaları Git'e alınmaz; görünür metin derlenmiş sayfada bulunduğu için rehber okumak JavaScript'e bağlı değildir. Pafta ve 3B görünüm mevcut uygulama çıktılarından yüklenir.

| Adres | İçerik |
| --- | --- |
| `/ogren/` | Yeni CAD kullanıcıları ve CAD bilenler için iki giriş |
| `/ornekler/` | Gerçek model kütüphanesinin ilk örneği |
| `/ornekler/motor-braketi/` | Parça, montaj, pafta ve beş dosya |
| `/rehberler/parametrik-cad/` | Ölçüler, sketch, özellik ağacı, AI ve örnek inceleme |
| `/rehberler/step-stl/` | Dosya seçimi ve gerçek STEP/STL örneği |

Yeni örnekler aynı kaynakta, doğrulanmış dosyalarıyla eklenir. Mevcut ilk kütüphanede tek motor braketi vardır; üç bağımsız model varmış gibi anlatılmaz. `.3d` dosyası şu anda web kütüphanesinde sunulmuyor; mevcut STEP/STL/PDF/DXF çıktıları sunuluyor.

## Tutorial ile eşleme

Client başka oturumda `crates/threed-app/assets/tutorial/catalog.json` kaynağını hazırlıyor. Katalog bu çalışmanın sırasında oluştu: sürüm 1, 18 bölüm, 139 ders. İki rehberin `lessonIds` alanları toplam 10 dersle eşlendi. `npm run check:learning` client dosyasını salt okunur kontrol eder; ders kimliğinin kaldırılmasını, yinelenmesini veya Türkçe/İngilizce metin eksikliğini bildirir.

Bu kontrol uygulamanın sesli eğitim kabul testi değildir. Katalog hâlâ geliştirme kaynağıdır; webde yeni sesli eğitim hazır diye duyurulmaz. Metin/sesin webde yeniden kullanımını, client kabulünden ve ses tesliminden sonra ortak sürüm kaydıyla ekleyeceğiz. Bu nedenle landing'in tek başına GitHub Actions derlemesi private client deposuna veya bu yerel kontrole bağlı değildir.

## Yayın adresi ve arama metaverileri

- `SITE_URL`: canonical, OG, JSON-LD ve sitemap için mutlak yayın adresi. Varsayılan `https://aetiras.github.io/threed-landing/`.
- `PAGES_BASE`: derlemenin dosya/bağlantı kökü. GitHub Pages için `/threed-landing/`; kök alan adı için `/`.
- Halka açık altı sayfa sitemap içinde; hesap sayfası `noindex` ve sitemap dışında.
- Rehberlerde Article; diğer sayfalarda WebSite/WebPage/CollectionPage ve uygun BreadcrumbList verisi bulunur. Uydurma kullanıcı yorumu veya değerlendirme puanı eklenmez.
- `public/brand/threed-paylasim.png`: 1200×630 paylaşım görseli. Gerçek `braket.stl` geometrisinden `scripts/uret-paylasim.ps1` ile üretildi. Görsel Git'e alınacak hazır varlıktır; Linux derleme makinesinde PowerShell veya raster üretimi gerekmez.
- GitHub Pages proje alt yolundaki `robots.txt`, alan adının kökündeki robots dosyası yerine geçmez. Kendi kök alan adına geçince çıktı doğrudan kökte sunulur; mevcut projede sitemap Search Console'a açık adresiyle gönderilebilir.

Yeni domain seçilirse `SITE_URL` ve gerekiyorsa `PAGES_BASE` birlikte değiştirilmeli. Arama konsolu doğrulaması ve canlı indeks takibi henüz yapılmadı; metadata eklemek indeks veya arama sonucu garantisi değildir.

## Ölçüm sözleşmesi

**G3 güncellemesi:** Kayıt/lisans/ilk modelin kendi backend'i üzerinden ölçümü ve isteğe bağlı hesap ayarı
[uygulandı](../../threed-backend/docs/2026-10-03-kayit-ve-ilk-model-olcumu.md). `VITE_MEASUREMENT_ENABLED=1`
olduğunda ilk kaynak sekme ömrünce korunur ve ancak kayıt formunda paylaşım seçilirse backend'e gider.
Varsayılan kapalı; anonim ziyaretçi hizmeti eklenmedi. Aşağıdaki yalnız sayfa içi olay açıklamaları G1 temelini
anlatır; kalıcı hesap/kullanım kayıtları için yeni protokolü esas al.

Kullanıcı önce altyapıyı istedi. `src/measurement.js` üçüncü taraf SDK, çerez veya kalıcı ziyaretçi kimliği oluşturmaz; olayları `threed:measurement` üzerinden yayımlar. Özellik açık olduğunda yalnız izinli kampanya etiketleri sekme ömrünce saklanır. Kayıt ve izinli ürün adımları kendi backend'inde raporlanabilir; anonim ziyaretçi hizmeti henüz bağlanmadı. Üretim bayrakları kapalı olduğundan canlı kullanım bildirimi toplanmıyor.

| Olay | Ne zaman? | Öğe |
| --- | --- | --- |
| `page_view` | Ortak sayfa kabuğu başlatıldığında | Sabit sayfa kimliği |
| `access_signup_click` | Yeni erişim CTA'sına basıldığında | hero / content / access |
| `guide_open` | Rehbere giden işaretli bağlantıda | parametrik-cad / step-stl |
| `example_open` | Braket örneğine giden işaretli bağlantıda | motor-braketi |
| `example_download` | Örnek dosya bağlantısına basıldığında | Beş bilinen örnek dosya |
| `demo_open` | Ana sayfa gösterimine geçildiğinde | braket |
| `example_view` | Parça/montaj/pafta sekmesi seçildiğinde | model / assembly / sheet |
| `registration_completed` | Başarılı register yanıtı ve geçerli web belirteci alındığında | account |
| `web_license_seen` | Etkin lisans hesap görünümünde ilk kez görüldüğünde | account |

`example_download`, bağlantı tıklamasıdır; dosyanın kullanıcının diskine başarıyla yazıldığını iddia etmez. `access_signup_click`, başarılı hesap kaydı değildir. Başarılı kayıt, lisans açılması, ilk model ve tekrar kullanım ayrı sonraki aşamada backend/client tarafından doğrulanmalıdır.

Payload sabit `name`, `page`, varsa izin verilen `item` ve bilinen kampanya etiketlerini içerir. Sayfanın diğer sorgu parametreleri, e-posta, parola, belirteç, referrer ve kullanıcı projesi bilgisi alınmaz. Başlangıç etiketleri:

- Kaynak: `youtube`, `linkedin`, `instagram`, `newsletter`, `creator`.
- Araç: `organic`, `social`, `video`, `email`, `referral`, `paid`.
- Kampanya: `erken-erisim`, `pilot`, `motor-braketi`, `baslangic-rehberleri`.

Örnek sosyal bağlantı: `/ornekler/motor-braketi/?utm_source=linkedin&utm_medium=social&utm_campaign=pilot`. Özellik açıkken ilk etiket sessionStorage ile sayfalar arasında korunur ve yalnız kayıt formunda paylaşım seçilirse backend'e gönderilir. Yeni kaynak/kampanya izin listesine eklenir. Anonim ziyaretçi hizmeti seçildiğinde sayfa olayları için aynı sözleşmeye abone olan adaptör kullanılabilir.

## Kontroller

```powershell
npm run build
npm run check:site
npm run check:learning
npm run check:measurement
```

GitHub Pages alt yolu için ayrı çıktı:

```powershell
$env:PAGES_BASE = '/threed-landing/'
npm run build -- --outDir .qa/pages
node scripts/check-site.mjs .qa/pages /threed-landing/
```

Alt yol kontrolünden sonra yerel kök önizlemesinin HTML'ini tekrar üretmek için `prepareContent('/')` çalıştırılır veya normal kök Vite süreci yeniden başlatılır. Aynı üretilen HTML'leri farklı base'lerle eşzamanlı değiştiren geliştirme süreçleri çalıştırılmaz.

`check:site`, altı halka açık sayfa + hesabın yerel bağlantılarını, dosyaları, bölüm hedeflerini, JSON-LD, canonical, sitemap, paylaşım görseli boyutunu ve ölçüm sözleşmesini doğrular. Tarayıcı kabulü ayrıca yapılır: 390 px ve masaüstü; açık/koyu tema; mobil menü; sekmeler; içerik, dosya bağlantıları ve erişim CTA'sı. Gerçek hesap açılmaz veya canlı lisans verilmez.
