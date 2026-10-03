/* Client katalog kaynağını salt okunur doğrular; ders metni veya ses dosyası üretmez/değiştirmez. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { contentPages } from '../src/content/pages.js';

const source = process.argv[2] || fileURLToPath(new URL('../../threed-client/crates/threed-app/assets/tutorial/catalog.json', import.meta.url));
const raw = readFileSync(source, 'utf8');
const catalog = JSON.parse(raw);
assert.ok(Number.isInteger(catalog.version) && catalog.version > 0, 'Katalog sürümü bulunamadı');
assert.ok(Array.isArray(catalog.chapters) && Array.isArray(catalog.lessons), 'Katalog şeması farklı');
const lessons = new Map(catalog.lessons.map((lesson) => [lesson.id, lesson]));
assert.equal(lessons.size, catalog.lessons.length, 'Yinelenen ders kimlikleri');
let matched = 0;
for (const page of contentPages.filter((page) => page.lessonIds)) {
  for (const id of page.lessonIds) {
    const lesson = lessons.get(id);
    assert.ok(lesson, `${page.slug}: client ders kimliği bulunamadı: ${id}`);
    assert.ok(lesson.title?.tr && lesson.title?.en && lesson.segments?.length, `${id}: anlatım eksik`);
    assert.ok(lesson.segments.every((segment) => segment.text?.tr?.trim() && segment.text?.en?.trim()), `${id}: Türkçe/İngilizce metin eksik`);
    matched++;
  }
}
console.log(JSON.stringify({ catalogVersion: catalog.version, chapters: catalog.chapters.length, lessons: catalog.lessons.length, mappedLessons: matched, sha256: createHash('sha256').update(raw).digest('hex'), state: 'Geliştirme kataloğu eşlemesi; client kabulü veya sesli eğitim yayını anlamına gelmez.' }, null, 2));
