/* İçerik sayfalarını ortak kabuktan statik HTML olarak üretir; bağımlılık veya çalışma zamanı CMS'i gerekmez. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contentPages } from '../src/content/pages.js';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const logo = '<svg class="brand-mark" viewBox="0 0 48 48" aria-hidden="true"><polygon points="24,6 40,15 24,24 8,15" fill="#12B76A"/><polygon points="8,15 24,24 24,42 8,33" fill="#0B7C49"/><polygon points="24,24 40,15 40,33 24,42" fill="#7DCBA3"/></svg><span>three<b>D</b></span>';
const theme = '<button class="theme-btn" id="themeBtn" type="button" aria-label="Tema: sistem" title="Tema: sistem"><svg class="i-sys" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/></svg><svg class="i-light" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg><svg class="i-dark" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg></button>';
const themeBoot = '<script>try{const t=localStorage.getItem("threed-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch{}</script>';

export function publicPages() {
  return [{ file: 'index.html', slug: '', type: 'WebSite', title: 'threeD — Parametrik mekanik CAD', description: 'Türkçe parametrik mekanik CAD. Özellik ağacı, montaj ve teknik resim; parçayı tarif edip düzenleyebileceğin isteğe bağlı yapay zekâ asistanı.' }, ...contentPages];
}

export function prepareContent(base) {
  for (const page of contentPages) {
    const target = resolve(projectRoot, page.file);
    if (relative(projectRoot, target).startsWith('..')) throw new Error('İçerik yolu proje dışında');
    const active = page.slug.startsWith('ornekler/') ? 'ornekler/' : 'ogren/';
    const nav = [['Ürün', `${base}#nasil`], ['Öğren', `${base}ogren/`, 'ogren/'], ['Örnekler', `${base}ornekler/`, 'ornekler/'], ['Fiyatlar', `${base}#fiyatlar`], ['SSS', `${base}#sss`]]
      .map(([label, href, section]) => `<a href="${href}"${section === active ? ' aria-current="page"' : ''}>${label}</a>`).join('');
    const crumbs = `<a href="${base}">threeD</a>${page.breadcrumbs.map(([label, slug], index) => index === page.breadcrumbs.length - 1 ? `<span aria-current="page">${escapeHtml(label)}</span>` : `<a href="${base}${slug}">${escapeHtml(label)}</a>`).join('')}`;
    const toc = page.toc ? `<nav class="article-toc" aria-label="Bu rehberde"><p>Bu rehberde</p>${page.toc.map(([id, title]) => `<a href="#${id}">${escapeHtml(title)}</a>`).join('')}</nav>` : '';
    const body = page.type === 'Article' ? `<div class="article-layout">${toc}<article class="article-body" aria-label="${escapeHtml(page.heading)}">${page.body(base)}<p class="article-reviewed">threeD rehberi · İçerik kontrolü: 3 Ekim 2026</p></article></div>` : page.body(base);
    const html = `<!doctype html>
<html lang="tr"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><meta name="color-scheme" content="light dark"/><title>${escapeHtml(page.title)}</title><meta name="description" content="${escapeHtml(page.description)}"/><link rel="icon" href="${base}favicon.svg" type="image/svg+xml"/>${themeBoot}<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/><link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet"/></head>
<body class="content-page"><a class="skip" href="#icerik">İçeriğe geç</a><header class="nav" id="nav"><div class="wrap nav-in"><a class="brand" href="${base}" aria-label="threeD ana sayfa">${logo}</a><nav class="nav-links" aria-label="Bölümler">${nav}</nav><details class="mobile-nav"><summary>Menü</summary><nav aria-label="Mobil bölümler">${nav}</nav></details><div class="nav-end">${theme}<a class="btn btn-line" href="${base}hesap.html" id="navHesap">Giriş yap</a></div></div></header>
<main id="icerik" class="wrap content-main"><nav class="breadcrumbs" aria-label="Sayfa yolu">${crumbs}</nav><header class="content-head"><h1>${escapeHtml(page.heading).replaceAll('\n', '<br/>')}</h1><p>${escapeHtml(page.lead)}</p></header>${body}<section class="content-access" aria-labelledby="contentAccessTitle"><div><h2 id="contentAccessTitle">Kendi parçanla devam et.</h2><p>threeD erken erişimde. Hesap açmak ücretsiz; uygulama erişimi lisansın tanımlandığında başlar.</p></div><a class="btn btn-solid" href="${base}hesap.html?kayit" data-event="access_signup_click" data-item="content">Erken erişim hesabı oluştur</a></section></main>
<footer class="footer"><div class="wrap footer-in"><a class="brand small" href="${base}" aria-label="threeD ana sayfa">${logo}</a><span>Parametrik mekanik CAD · © 2026</span><nav class="footer-links" aria-label="Alt bağlantılar"><a href="${base}ogren/">Öğren</a><a href="${base}ornekler/">Örnekler</a><a href="${base}#erken-erisim">Erken erişim</a></nav><span class="fine">Örnek model ve çıktılar threeD'nin geliştirme sürümünde üretildi.</span></div></footer><script type="module" src="/src/content.js"></script></body></html>`;
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, html, 'utf8');
  }
  return Object.fromEntries(contentPages.map((page) => [page.slug.replaceAll('/', '_'), resolve(projectRoot, page.file)]));
}

export function siteMetadataPlugin(siteUrl) {
  const site = new URL(siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`);
  if (!['http:', 'https:'].includes(site.protocol) || site.username || site.password || site.search || site.hash) throw new Error('SITE_URL sorgu veya kimlik bilgisi içermeyen bir HTTP(S) adresi olmalı');
  const pages = publicPages();
  const absolute = (slug) => new URL(slug, site).href;
  return {
    name: 'threed-public-content',
    transformIndexHtml: {
      order: 'post',
      handler(html, context) {
        const file = relative(projectRoot, context.filename).replaceAll('\\', '/');
        const page = pages.find((entry) => entry.file === file);
        if (!page) return;
        const url = absolute(page.slug);
        // Eski ana sayfa OG alanlarını ortak kaynakla eşleştir; başlık/açıklama görünür HTML'de kalır.
        html = html.replace(/<meta\s+property="og:(?:title|description)"[^>]*\/?\s*>/g, '');
        const tags = [
          { tag: 'link', attrs: { rel: 'canonical', href: url }, injectTo: 'head' },
          ...Object.entries({ 'og:type': page.type === 'Article' ? 'article' : 'website', 'og:locale': 'tr_TR', 'og:site_name': 'threeD', 'og:title': page.title, 'og:description': page.description, 'og:url': url, 'og:image': absolute('brand/threed-paylasim.png'), 'og:image:width': '1200', 'og:image:height': '630', 'og:image:alt': 'threeD motor braketinin gerçek modelinden hazırlanmış görünüm' }).map(([property, content]) => ({ tag: 'meta', attrs: { property, content }, injectTo: 'head' })),
          ...Object.entries({ 'twitter:card': 'summary_large_image', 'twitter:title': page.title, 'twitter:description': page.description, 'twitter:image': absolute('brand/threed-paylasim.png') }).map(([name, content]) => ({ tag: 'meta', attrs: { name, content }, injectTo: 'head' })),
        ];
        const schema = page.type === 'WebSite' ? { '@context': 'https://schema.org', '@type': 'WebSite', name: 'threeD', url, inLanguage: 'tr', description: page.description } : { '@context': 'https://schema.org', '@type': page.type, name: page.title, headline: page.title, description: page.description, url, inLanguage: 'tr', ...(page.type === 'Article' ? { author: { '@type': 'Organization', name: 'threeD' }, mainEntityOfPage: url } : {}) };
        tags.push({ tag: 'script', attrs: { type: 'application/ld+json' }, children: JSON.stringify(schema).replaceAll('<', '\\u003c'), injectTo: 'head' });
        if (page.breadcrumbs) tags.push({ tag: 'script', attrs: { type: 'application/ld+json' }, children: JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['threeD', ''], ...page.breadcrumbs].map(([name, slug], index) => ({ '@type': 'ListItem', position: index + 1, name, item: absolute(slug) })) }), injectTo: 'head' });
        return { html, tags };
      },
    },
    generateBundle() {
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((page) => `  <url><loc>${escapeHtml(absolute(page.slug))}</loc></url>`).join('\n')}\n</urlset>\n`;
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap });
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n\nSitemap: ${absolute('sitemap.xml')}\n` });
    },
  };
}
