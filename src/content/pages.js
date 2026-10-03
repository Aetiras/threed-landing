/* Web rehberleri: gerçek braket ve mevcut çıktılar. Tutorial kataloğu hazır olduğunda ders kimlikleri eşlenecek. */
const arrow = '<span aria-hidden="true">↗</span>';
const link = (url, title, extra = '') => `<a href="${url}" ${extra}>${title}</a>`;
const diagram = '<div class="content-diagram" data-sheet-preview role="img" aria-label="Motor braketinin threeD çıktısından üretilmiş ölçülü teknik resmi"></div>';

export const contentPages = [
  {
    file: 'ogren/index.html', slug: 'ogren/', type: 'CollectionPage',
    title: 'threeD öğren: parametrik CAD rehberleri',
    description: 'Parametrik CAD kavramlarını gerçek bir motor braketi üzerinde öğren. STEP ve STL çıktılarını karşılaştır, modelin teknik resmini incele.',
    heading: 'Bir parçayla başla.\nTasarımın mantığını öğren.',
    lead: 'Ölçüden modele, modelden teknik resme. Gerçek bir motor braketi üzerinden parametrik tasarımı keşfet; aynı parçanın dosyalarını kendi CAD programında incele.',
    breadcrumbs: [['Öğren', 'ogren/']],
    body: (base) => `
      <div class="learning-paths">
        <section class="learning-path" aria-labelledby="newCadTitle">
          <p class="content-label">CAD'e yeni başlıyorum</p>
          <h2 id="newCadTitle">Ölçülerin modelle ilişkisini gör.</h2>
          <p>Sketch, ölçü, özellik ağacı ve dosya çıktısı. İlk iki rehber kavramları aynı braket üzerinde anlatıyor.</p>
          <ol class="lesson-list">
            <li>${link(`${base}rehberler/parametrik-cad/`, `<span>Parametrik CAD nedir?</span><small>Ölçüler ve özellik ağacı</small>${arrow}`, 'data-event="guide_open" data-item="parametrik-cad"')}</li>
            <li>${link(`${base}rehberler/step-stl/`, `<span>STEP mi, STL mi?</span><small>Aynı parçanın iki farklı çıktısı</small>${arrow}`, 'data-event="guide_open" data-item="step-stl"')}</li>
          </ol>
        </section>
        <section class="learning-path" aria-labelledby="knowCadTitle">
          <p class="content-label">CAD biliyorum</p>
          <h2 id="knowCadTitle">Örneği kendi programında incele.</h2>
          <p>Braketin katı modelini, cıvatalı montajını ve paftasını aç. threeD'nin nasıl bir sonuç ürettiğini dosya üzerinde değerlendir.</p>
          <ol class="lesson-list">
            <li>${link(`${base}ornekler/motor-braketi/`, `<span>Motor braketi örneği</span><small>3B model, montaj ve indirilebilir dosyalar</small>${arrow}`, 'data-event="example_open" data-item="motor-braketi"')}</li>
            <li>${link(`${base}#nasil`, `<span>Parçanın oluşumunu izle</span><small>Asistanla veya elle ilerleyen gösterim</small>${arrow}`, 'data-event="demo_open" data-item="braket"')}</li>
          </ol>
        </section>
      </div>
      <section class="content-feature" aria-labelledby="learningExampleTitle">
        <div>${diagram}</div>
        <div><p class="content-label">Üzerinde çalışacağın örnek</p><h2 id="learningExampleTitle">Bir braket. Modeli, montajı ve paftası.</h2><p>Bu çizim ve indirilebilir dosyalar aynı threeD belgesinden üretildi. Rehberleri okurken hangi ölçünün nereye ait olduğunu gerçek örnek üzerinde takip edebilirsin.</p>${link(`${base}ornekler/motor-braketi/`, `Örneği incele ${arrow}`, 'class="text-link" data-event="example_open" data-item="motor-braketi"')}</div>
      </section>`,
  },
  {
    file: 'ornekler/index.html', slug: 'ornekler/', type: 'CollectionPage',
    title: 'threeD örnekleri: gerçek CAD modelleri ve dosyaları',
    description: 'threeD ile oluşturulan motor braketini, cıvatalı montajını ve teknik resmini incele. STEP, STL, PDF ve DXF dosyaları açık erişimde.',
    heading: 'Modeli incele.\nDosyayı kendin aç.',
    lead: "Örnekler threeD'de oluşturulup dışa aktarıldı. Model, montaj ve paftayı birlikte inceleyebilir; dosyaları hesap oluşturmadan indirebilirsin.",
    breadcrumbs: [['Örnekler', 'ornekler/']],
    body: (base) => `
      <section class="content-feature example-feature" aria-labelledby="bracketTitle">
        <figure class="content-model"><canvas data-model="bracket" aria-label="threeD'de oluşturulan motor braketi; döndürmek için sürükleyin"></canvas><figcaption>Motor braketi · aynı belgeden model ve pafta</figcaption></figure>
        <div><p class="content-label">Mekanik parça</p><h2 id="bracketTitle">Motor braketi</h2><p>L profil, kaburga, köşe yuvarlatma ve delikler. Aynı parçanın cıvatalı montajını ve ölçülü paftasını da görebilirsin.</p><ul class="format-list" aria-label="İndirilebilir biçimler"><li>STEP</li><li>STL</li><li>PDF</li><li>DXF</li></ul>${link(`${base}ornekler/motor-braketi/`, `Modeli ve dosyaları aç ${arrow}`, 'class="btn btn-solid" data-event="example_open" data-item="motor-braketi"')}</div>
      </section>
      <div class="content-note"><p>Bu örneğin dosyaları threeD'nin geliştirme sürümünde üretildi. STEP ve STL geometri alışverişi içindir; özellik ağacını taşıyan yerel proje dosyasıyla aynı şey değildir.</p>${link(`${base}rehberler/step-stl/`, 'Dosya biçimleri rehberini oku', 'data-event="guide_open" data-item="step-stl"')}</div>`,
  },
  {
    file: 'ornekler/motor-braketi/index.html', slug: 'ornekler/motor-braketi/', type: 'WebPage',
    title: 'Motor braketi: threeD modeli, montajı ve teknik resmi',
    description: 'Motor braketini 3B olarak döndür, cıvatalı montajını ve paftasını incele. Gerçek threeD çıktıları olan STEP, STL, PDF ve DXF dosyalarını indir.',
    heading: 'Motor braketi',
    lead: 'Parça, bağlantı elemanları ve ölçülü pafta aynı threeD belgesinde hazırlandı. Geometriyi aşağıda döndür; dosyayı indirip kendi programında incele.',
    breadcrumbs: [['Örnekler', 'ornekler/'], ['Motor braketi', 'ornekler/motor-braketi/']],
    body: (base) => `
      <section class="example-workspace" aria-label="Braketin model, montaj ve pafta görünümü">
        <div class="example-tabs" role="tablist" aria-label="Örnek görünümü">
          <button id="model-tab" role="tab" type="button" aria-selected="true" aria-controls="model-panel" data-example-tab="model">Parça</button>
          <button id="assembly-tab" role="tab" type="button" aria-selected="false" aria-controls="assembly-panel" tabindex="-1" data-example-tab="assembly">Montaj</button>
          <button id="sheet-tab" role="tab" type="button" aria-selected="false" aria-controls="sheet-panel" tabindex="-1" data-example-tab="sheet">Teknik resim</button>
        </div>
        <div id="model-panel" role="tabpanel" aria-labelledby="model-tab" class="example-panel"><canvas data-model="bracket" aria-label="Motor braketi modeli; döndürmek için sürükleyin"></canvas><p class="model-hint">Döndürmek için sürükle</p></div>
        <div id="assembly-panel" role="tabpanel" aria-labelledby="assembly-tab" class="example-panel" hidden><canvas data-model="assembly" aria-label="Motor braketi, dört ISO cıvata ve dört pul; döndürmek için sürükleyin"></canvas><p class="model-hint">Dört cıvata ve dört pul ile montaj</p></div>
        <div id="sheet-panel" role="tabpanel" aria-labelledby="sheet-tab" class="example-panel example-sheet" hidden>${diagram}</div>
      </section>
      <div class="example-details">
        <section aria-labelledby="filesTitle"><h2 id="filesTitle">Dosyaları indir</h2><p>Örnek dosyalar için hesap veya lisans gerekmez.</p><ul class="download-list">
          ${[['braket.step', 'Parçanın katı geometrisi', 'STEP'], ['montaj.step', 'Braket, cıvatalar ve pullar', 'STEP'], ['braket.stl', 'Parçanın üçgen ağı', 'STL'], ['braket.pdf', 'Okunabilir teknik resim', 'PDF'], ['braket.dxf', 'Paftanın 2B çizgileri', 'DXF']].map(([file, text, format]) => `<li>${link(`${base}files/${file}`, `<span><b>${file}</b><small>${text}</small></span><span class="file-format">${format} ${arrow}</span>`, `download data-event="example_download" data-item="${file}"`)}</li>`).join('')}
        </ul></section>
        <section aria-labelledby="treeTitle"><h2 id="treeTitle">Parça nasıl kuruldu?</h2><p>Ön düzlemde L profil çizildi, iki yana ekstrüzyon yapıldı. Kaburga ve köşe yuvarlatmadan sonra mil, flanş ve bağlantı delikleri eklendi.</p><dl class="example-spec"><div><dt>Malzeme</dt><dd>S235JR</dd></div><div><dt>Et kalınlığı</dt><dd>10 mm</dd></div><div><dt>Genişlik</dt><dd>60 mm</dd></div><div><dt>Mil deliği</dt><dd>Ø22 mm</dd></div></dl><p>Model threeD'nin geliştirme sürümünde üretildi. Bu dosyalar imalat uygunluğu veya dayanım onayı değildir; burada modelleme ve dosya alışverişini incelemek için sunuluyor.</p>${link(`${base}#nasil`, `Oluşumunu izle ${arrow}`, 'class="text-link" data-event="demo_open" data-item="braket"')}</section>
      </div>
      <aside class="content-note"><p>STEP dosyasındaki katı geometri, threeD'nin özellik ağacının tamamını taşımaz. Tasarımın ölçü ve işlem ilişkisini öğrenmek için parametrik CAD rehberine geçebilirsin.</p>${link(`${base}rehberler/parametrik-cad/`, 'Parametrik CAD rehberini oku', 'data-event="guide_open" data-item="parametrik-cad"')}</aside>`,
  },
  {
    file: 'rehberler/parametrik-cad/index.html', slug: 'rehberler/parametrik-cad/', type: 'Article',
    lessonIds: ['sketch.start', 'sketch.dimension', 'sketch.definition', 'part.extrude', 'model.parameters', 'model.history', 'ai.assistant'],
    title: 'Parametrik CAD nedir? Motor braketiyle ölçüler ve özellik ağacı',
    description: 'Parametrik CAD, sketch, ölçüler ve özellik ağacını gerçek bir motor braketi üzerinden öğren. Yerel proje dosyasıyla geometri çıktılarının farkını gör.',
    heading: 'Parametrik CAD nedir?',
    lead: 'Bir parçayı yalnız son şekliyle değil, nasıl oluşturulduğunu ve hangi ölçülerle değiştiğini de düşün. Motor braketi bu ilişkiyi görmek için iyi bir başlangıç.',
    breadcrumbs: [['Öğren', 'ogren/'], ['Parametrik CAD', 'rehberler/parametrik-cad/']],
    toc: [['olculer', 'Ölçüler modeli yönetir'], ['sketch', 'Sketch ve ilişkiler'], ['agac', 'Özellik ağacı'], ['asistan', 'AI ile oluşturulan modeli düzenlemek'], ['deneme', 'Örnekte neyi incelemeli?']],
    body: (base) => `
      <section id="olculer"><h2>Ölçüler modeli yönetir.</h2><p>Parametrik tasarımda bir parçanın kalınlığını, genişliğini veya bir deliğin çapını değerlerle tanımlarsın. Uygulama, bu değerlerle modelin geometrisini hesaplar. Bir değeri değiştirince, o değere bağlı işlemler de yeniden hesaplanır.</p><p>Örnekteki motor braketinin et kalınlığı 10 mm, genişliği 60 mm. Bu değerler tasarımın içinde tutulur. Aynı tasarımı başka bir genişlikte oluşturmak için baştan çizmek yerine ilgili parametreyi düzenlersin. Değişiklikten sonra delikleri, kenarları ve teknik resmi yeniden kontrol edersin.</p></section>
      <figure class="article-figure">${diagram}<figcaption>Ölçülerin konumunu braketin gerçek threeD paftasında inceleyebilirsin.</figcaption></figure>
      <section id="sketch"><h2>Sketch, şeklin ve ilişkilerin başlangıcıdır.</h2><p>Sketch, düzlem veya düz yüz üzerinde oluşturulan 2B çizimdir. Çizgi, daire ve yay gibi öğeleri kullanırsın. Ölçüler boyutu belirler; yataylık, diklik, eşitlik veya çakışıklık gibi ilişkiler öğelerin birbirine nasıl bağlı olduğunu anlatır.</p><p>Braketin ilk sketch'i bir L profilidir. Profilin yalnız ekranda doğru görünmesi yeterli değildir: çizgilerin birleştiği noktalar ve amaçlanan ölçüler de tanımlı olmalıdır. Açık bir sınır, beklediğin katı ekstrüzyonun oluşmasını engelleyebilir.</p><p>Tam tanımlı bir sketch'in serbest hareketi kalmaz. Bu, tasarımın mühendislik açısından doğru olduğu anlamına gelmez; çizimin ölçü ve ilişkilerle belirlenmiş olduğunu gösterir. Birbirine uymayan ilişkiler eklediğinde ise çelişen kısıtları düzeltmen gerekir.</p></section>
      <section id="agac"><h2>Özellik ağacı parçanın yapılışını saklar.</h2><p>Bir sketch'i Extrude ile katıya dönüştürmek, kesme yapmak, bir kenarı Fillet ile yuvarlatmak ve delik eklemek ayrı özelliklerdir. Özellik ağacı bu işlemleri sıralı biçimde gösterir.</p><p>Motor braketi önce L profil ve ekstrüzyonla kuruldu. Ardından kaburga, köşe yuvarlatma, mil deliği, flanş delikleri ve bağlantı delikleri eklendi. Son parçanın yüzlerine bakmak yerine ağaca bakarak tasarımın nasıl kurulduğunu anlayabilirsin.</p><p>Bir özelliğin önceki geometriye bağlı olabileceğini unutma. İlk profil üzerinde büyük bir değişiklik yaptığında, sonraki işlemin kullandığı yüz veya kenar artık bulunmayabilir. Böyle bir durumda ilgili özelliğin seçimini ve hata açıklamasını incelemek gerekir.</p></section>
      <section id="asistan"><h2>AI ile oluşan model de düzenlenebilir.</h2><p>threeD asistanı, istediğin parçayı uygulamanın modelleme işlemleriyle oluşturur veya düzenler. Eklenen özellikleri ağaçta inceleyebilir; ölçüleri kendin değiştirebilir ve sonucu geri alabilirsin.</p><p>İsteğini yazarken boyutları ve tasarım amacını belirtmek yardımcı olur: hangi düzlemde başlayacağın, et kalınlığı, delik çapları ve delikler arası mesafe gibi. Sonuç oluştuğunda ölçülerin ve işlemlerin isteğine uyduğunu kontrol et. Aynı doğal dil isteği her denemede aynı sonucu garanti etmez.</p><p>Asistan internet üzerinden çalışır. Elle modelleme araçları ise mevcut lisansın çevrimdışı kullanım koşulları içinde kullanılabilir. Bir parçanın AI ile oluşturulması, hesap veya lisans gereksinimini değiştirmez.</p></section>
      <section id="deneme"><h2>Örnekte üç şeyi incele.</h2><ol><li>Paftada kalınlık, genişlik ve delik çaplarının hangi geometriye ait olduğunu bul.</li><li>STEP dosyasını açıp mil deliğini, kaburgayı ve bağlantı deliklerini model üzerinde bul.</li><li>Ana sayfadaki gösterimi izle; her işlemin parçaya ne eklediğini takip et.</li></ol><p>STEP dosyası, son katı geometriyi incelemek içindir. threeD'deki parametreler ve özellik ağacıyla çalışmak için yerel proje belgesi gerekir; STEP'i başka bir programda açmak bütün modelleme geçmişini taşımaz.</p>${link(`${base}ornekler/motor-braketi/`, 'Braketin modelini ve dosyalarını aç', 'class="text-link" data-event="example_open" data-item="motor-braketi"')}</section>`,
  },
  {
    file: 'rehberler/step-stl/index.html', slug: 'rehberler/step-stl/', type: 'Article',
    lessonIds: ['projects.save', 'files.export', 'drawing.export'],
    title: 'STEP ve STL farkı: aynı CAD parçası için hangi dosya?',
    description: 'STEP katı geometrisiyle STL üçgen ağını aynı motor braketi üzerinden karşılaştır. CAD alışverişi, dilimleyici, teknik resim ve yerel proje için uygun biçimi seç.',
    heading: 'STEP mi, STL mi?',
    lead: 'Aynı motor braketi iki dosya olarak indirilebilir. Görünüşleri benzer olsa da içlerinde tutulan bilgi ve kullanım amaçları farklıdır.',
    breadcrumbs: [['Öğren', 'ogren/'], ['STEP ve STL', 'rehberler/step-stl/']],
    toc: [['step', 'STEP: CAD geometrisi'], ['stl', 'STL: üçgen ağ'], ['secim', 'Hangi çıktı?'], ['kontrol', 'Aktardıktan sonra kontrol'], ['deneme', 'İki dosyayı karşılaştır']],
    body: (base) => `
      <section id="step"><h2>STEP, CAD geometrisini taşımak içindir.</h2><p>STEP, CAD programları arasında geometri alışverişi için kullanılan bir biçimdir. Uygulamanın desteklediği kapsamda katıların yüz ve kenarlarını, montaj yapısını, parça adlarını ve renklerini taşıyabilir.</p><p>threeD'den aldığın braket STEP dosyasını başka bir CAD programında açıp katı model üzerinde inceleme yapabilirsin. Montaj örneğinin STEP dosyasında ise braket ile bağlantı elemanları birlikte bulunur.</p><p>Bu, üçgen bir ağı katıya çevirmekle aynı şey değildir. Ancak STEP dosyasının yerel proje dosyasına eşdeğer olduğunu da varsaymamalısın: threeD'nin sketch kısıtları, parametreleri ve özellik ağacı STEP çıktısında aynı biçimde korunmaz.</p></section>
      <section id="stl"><h2>STL, yüzeyi üçgenlerle anlatır.</h2><p>STL dosyasında modelin dış yüzeyi üçgenlerden oluşan bir ağla temsil edilir. Eğri yüzeyler de çok sayıda düz üçgenle yaklaştırılır. Çıktı ayrıntısı, ağın inceliğine bağlıdır.</p><p>Dilimleyicilerde ve ağ işleyen araçlarda STL sık kullanılan bir başlangıçtır. Fakat dosyayı açmak tek başına basılabilirlik onayı değildir. Ağın kapalı olması, ölçülerin doğru yorumlanması ve üretim ayarları ayrıca kontrol edilir.</p><p>STL dosyası ölçü birimini açıkça saklamaz. Program dosyayı milimetre veya başka bir birim olarak yorumlayabilir; açtıktan sonra parçanın boyutunu kontrol et. Standart STL dosyası sketch, özellik ağacı veya montaj ilişkilerini taşımaz.</p></section>
      <section id="secim"><h2>Çıktıyı sonraki işine göre seç.</h2><div class="table-scroll"><table class="guide-table"><thead><tr><th>Sonraki iş</th><th>Başlangıç biçimi</th><th>Ne sağlar?</th></tr></thead><tbody><tr><td>Başka CAD programında katı modeli incelemek</td><td>STEP</td><td>Katı geometri; desteklenen parça ve montaj bilgisi</td></tr><tr><td>Üçgen ağ veya dilimleyiciyle çalışmak</td><td>STL</td><td>Yüzeyin üçgenlerle temsili</td></tr><tr><td>Teknik resmi okumak ve paylaşmak</td><td>PDF</td><td>Paftanın görünümü ve ölçüleri</td></tr><tr><td>2B çizgileri başka programda kullanmak</td><td>DXF</td><td>Çizim öğeleri; dışa aktarılan içeriğe göre</td></tr><tr><td>threeD'deki tasarım geçmişini düzenlemek</td><td>.3d</td><td>Yerel proje: özellikler ve uygulamanın proje bilgileri</td></tr></tbody></table></div><p>Buradaki braket DXF'i teknik resim paftasıdır. Doğrudan kesim makinesine gönderilecek tek kontur dosyası olarak sunulmuyor. Kesim için gerekli kontur ve katmanlar ayrıca seçilip hazırlanmalıdır.</p></section>
      <section id="kontrol"><h2>Aktarımdan sonra modeli kontrol et.</h2><ul><li>Parçanın genel boyutu ve ölçü birimi doğru mu?</li><li>Delik sayısı, çaplar ve bağlantı konumları beklediğin gibi mi?</li><li>Montajdaki parçalar ve konumlar aktarılmış mı?</li><li>Kullandığın program dosyayı katı geometri mi, üçgen ağ mı olarak açtı?</li></ul><p>Bir dosyanın sorunsuz açılması, imalat veya dayanım doğrulaması yerine geçmez. Bu rehber dosya seçimi ve aktarımın ilk kontrolüyle ilgilidir.</p></section>
      <section id="deneme"><h2>Aynı parçanın iki dosyasını karşılaştır.</h2><p>Braketin STEP ve STL dosyalarını indir. Uygun programlarda açıp mil deliğinin çevresini ve yuvarlatılmış kenarları incele. STEP'teki yüzlerle STL'nin üçgen ağı arasındaki farkı gör.</p><div class="article-downloads">${link(`${base}files/braket.step`, 'Braket STEP dosyasını indir', 'class="btn btn-solid" download data-event="example_download" data-item="braket.step"')}${link(`${base}files/braket.stl`, 'Braket STL dosyasını indir', 'class="btn btn-line" download data-event="example_download" data-item="braket.stl"')}</div><p>Modeli, montajı ve teknik resmi birlikte görmek için örnek sayfasına geçebilirsin.</p>${link(`${base}ornekler/motor-braketi/`, 'Braket örneğini incele', 'class="text-link" data-event="example_open" data-item="motor-braketi"')}</section>`,
  },
];
