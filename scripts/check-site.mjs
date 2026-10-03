/* Derlenmiş sitede gerçek dosyaları ve çapraz sayfa bağlantılarını denetler. */
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicPages } from './site-content.mjs';
import { measurementDetail, campaignTags } from '../src/measurement.js';

const project = fileURLToPath(new URL('../', import.meta.url));
const dist = resolve(project, process.argv[2] || 'dist');
const base = process.argv[3] || '/';
const origin = new URL('https://site-check.invalid');
const canonicalUrls = new Set();
let links = 0;
for (const page of [...publicPages(), { file: 'hesap.html', slug: 'hesap.html' }]) {
  const html = readFileSync(resolve(dist, page.file), 'utf8');
  const current = new URL(`${base}${page.slug}`, origin);
  if (page.file === 'hesap.html') {
    assert.match(html, /name="robots"\s+content="noindex"/, 'Hesap sayfası noindex olmalı');
  } else {
    assert.match(html, /<h1[\s>]/, `${page.file}: görünür başlık bulunamadı`);
    const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/);
    assert.ok(canonical, `${page.file}: canonical yok`);
    assert.ok(!canonicalUrls.has(canonical[1]), `${page.file}: yinelenen canonical`);
    canonicalUrls.add(canonical[1]);
    assert.match(html, /property="og:image"/, `${page.file}: paylaşım görseli yok`);
    for (const schema of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) JSON.parse(schema[1]);
    if (page.type === 'Article') assert.ok(html.includes('<article'), `${page.file}: rehber HTML'de bulunmuyor`);
  }
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = new URL(match[1].replaceAll('&amp;', '&'), current);
    if (url.origin !== origin.origin || !['http:', 'https:'].includes(url.protocol)) continue;
    assert.ok(url.pathname.startsWith(base), `${page.file}: alt yol dışına çıkan bağlantı ${match[1]}`);
    const path = decodeURIComponent(url.pathname.slice(base.length));
    const target = resolve(dist, !path || path.endsWith('/') ? `${path}index.html` : path);
    assert.ok(!relative(dist, target).startsWith('..'), `${page.file}: çıktı dışındaki bağlantı`);
    assert.ok(existsSync(target) && statSync(target).isFile(), `${page.file}: bulunamayan dosya ${match[1]}`);
    if (url.hash && target.endsWith('.html') && !url.search) {
      const linkedHtml = readFileSync(target, 'utf8');
      assert.ok(linkedHtml.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `${page.file}: bulunamayan bölüm ${match[1]}`);
    }
    links++;
  }
}
const sitemap = readFileSync(resolve(dist, 'sitemap.xml'), 'utf8');
assert.equal([...sitemap.matchAll(/<loc>/g)].length, publicPages().length, 'Sitemap kamuya açık sayfaları kapsamalı');
assert.ok(!sitemap.includes('hesap.html'), 'Hesap sitemap içinde olmamalı');
const image = readFileSync(resolve(dist, 'brand/threed-paylasim.png'));
assert.equal(image.readUInt32BE(16), 1200, 'Paylaşım görseli genişliği');
assert.equal(image.readUInt32BE(20), 630, 'Paylaşım görseli yüksekliği');

// Ölçüm sözleşmesi özel sayfa/öğe değerlerini taşımamalı; hesap URL'sinin sorgusu hiçbir zaman alınmaz.
assert.deepEqual(measurementDetail('page_view', `${base}hesap.html`, 'user@example.com', base), { name: 'page_view', page: 'account' });
assert.deepEqual(measurementDetail('example_download', `${base}ornekler/motor-braketi/`, 'braket.step', base), { name: 'example_download', page: 'motor-braketi', item: 'braket.step' });
assert.equal(measurementDetail('password_change', `${base}hesap.html`, '', base), null);
assert.deepEqual(campaignTags('?utm_source=linkedin&utm_medium=social&utm_campaign=pilot&token=private&email=user@example.com'), { source: 'linkedin', medium: 'social', campaign: 'pilot' });
assert.deepEqual(campaignTags('?utm_source=user@example.com&utm_campaign=secret&password=private'), {});
console.log(`${publicPages().length} halka açık sayfa + hesap, ${links} yerel bağlantı, sitemap, metadata, 1200×630 paylaşım görseli ve ölçüm sözleşmesi doğrulandı (${base}).`);
