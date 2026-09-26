// Hero sahnesi: bir braketin sketch → extrude → seçim döngüsü (Three.js).
import * as THREE from "three";

const W = 80, D = 40, R = 5, H = 10, HOLE = 3.3, HX = 25;

function plateShape() {
  const s = new THREE.Shape();
  const x0 = -W / 2, x1 = W / 2, y0 = -D / 2, y1 = D / 2;
  s.moveTo(x0 + R, y0);
  s.lineTo(x1 - R, y0);
  s.absarc(x1 - R, y0 + R, R, -Math.PI / 2, 0, false);
  s.lineTo(x1, y1 - R);
  s.absarc(x1 - R, y1 - R, R, 0, Math.PI / 2, false);
  s.lineTo(x0 + R, y1);
  s.absarc(x0 + R, y1 - R, R, Math.PI / 2, Math.PI, false);
  s.lineTo(x0, y0 + R);
  s.absarc(x0 + R, y0 + R, R, Math.PI, Math.PI * 1.5, false);
  for (const cx of [-HX, HX]) {
    const h = new THREE.Path();
    h.absarc(cx, 0, HOLE, 0, Math.PI * 2, true);
    s.holes.push(h);
  }
  return s;
}

// Şekil noktalarını XZ düzlemine (y = yükseklik) taşır
function toXZ(points, y) {
  const out = [];
  for (const p of points) out.push(p.x, y, -p.y);
  return out;
}

function outlineLine(shape, y, color, opacity = 1) {
  const pts = [...shape.getPoints(48)];
  pts.push(pts[0]);
  const verts = toXZ(pts, y);
  for (const h of shape.holes) {
    const hp = h.getPoints(32);
    hp.push(hp[0]);
    // Delikler aynı çizgide: kopukluk için NaN yerine ayrı segmentler
    verts.push(...toXZ(hp, y));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  return new THREE.Line(g, m);
}

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => 1 - Math.pow(1 - clamp(t), 3);
const span = (t, a, b) => clamp((t - a) / (b - a));

export function initHero(canvas, onStep) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 1, 1000);
  camera.position.set(118, 92, 128);
  camera.lookAt(0, 2, 0);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xb9c2cc, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.9);
  key.position.set(60, 120, 40);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xcfe9ff, 0.8);
  rim.position.set(-80, 40, -60);
  scene.add(rim);

  const grid = new THREE.GridHelper(220, 22, 0xd4d7da, 0xe2e4e6);
  grid.position.y = -0.05;
  grid.material.transparent = true;
  grid.material.opacity = 0.8;
  scene.add(grid);

  const group = new THREE.Group();
  scene.add(group);
  const shape = plateShape();

  // Sketch çizgisi (yeşil, aşamalı çizim)
  const sketch = outlineLine(shape, 0.05, 0x0e9f5e);
  const sketchCount = sketch.geometry.attributes.position.count;
  group.add(sketch);

  // Katı gövde
  const geo = new THREE.ExtrudeGeometry(shape, { depth: H, bevelEnabled: false, curveSegments: 28 });
  geo.rotateX(-Math.PI / 2);
  const metal = new THREE.Color(0xc5cbd3);
  const green = new THREE.Color(0x3fcf8e);
  const mat = new THREE.MeshStandardMaterial({ color: green.clone(), roughness: 0.42, metalness: 0.18, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
  const solid = new THREE.Mesh(geo, mat);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 28), new THREE.LineBasicMaterial({ color: 0x2b3036, transparent: true, opacity: 0 }));
  const body = new THREE.Group();
  body.add(solid, edges);
  group.add(body);

  // Seçim vurgusu: üst dış kontur (mavi)
  const selPts = shape.getPoints(64);
  selPts.push(selPts[0]);
  const selGeo = new THREE.BufferGeometry();
  selGeo.setAttribute("position", new THREE.Float32BufferAttribute(toXZ(selPts, H + 0.08), 3));
  const sel = new THREE.Line(selGeo, new THREE.LineBasicMaterial({ color: 0x0d99ff, transparent: true, opacity: 0 }));
  group.add(sel);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Dar kadrajda parçayı sığdırmak için geri çekil
    const dist = w / h < 1.2 ? 1.25 : 1;
    camera.position.set(118 * dist, 92 * dist, 128 * dist);
    camera.lookAt(0, 2, 0);
    // Sağdaki sohbet kartı görünürken parçayı sola kaydır
    const chatVisible = window.innerWidth > 640;
    if (chatVisible) camera.setViewOffset(w, h, w * 0.17, -h * 0.04, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(canvas);

  let mouseX = 0, mouseY = 0;
  window.addEventListener("pointermove", (e) => {
    mouseX = e.clientX / window.innerWidth - 0.5;
    mouseY = e.clientY / window.innerHeight - 0.5;
  });

  const LOOP = 12;
  let lastStep = -1;
  const steps = [
    [0.2, 0.7],  // Model okundu
    [0.7, 2.8],  // Sketch
    [2.8, 4.6],  // Önizleme (extrude)
    [4.6, 5.6],  // Uygulandı
  ];

  function frame(t) {
    const lt = reduce ? 9 : t % LOOP;
    // Sketch çizimi
    const sk = ease(span(lt, 0.7, 2.8));
    sketch.geometry.setDrawRange(0, Math.max(2, Math.floor(sketchCount * sk)));
    sketch.material.opacity = 1 - span(lt, 4.4, 5.2);
    // Extrude
    const ex = ease(span(lt, 2.8, 4.4));
    body.scale.y = Math.max(0.001, ex);
    body.visible = ex > 0.001;
    // Önizleme yeşili → metal
    const m = span(lt, 4.6, 5.6);
    mat.color.copy(green).lerp(metal, m);
    mat.opacity = 0.5 + 0.5 * m;
    mat.transparent = m < 1;
    mat.depthWrite = m > 0.5;
    edges.material.opacity = m;
    // Seçim darbesi
    const s = span(lt, 6.0, 6.6) * (1 - span(lt, 9.2, 9.8));
    sel.material.opacity = s * (0.75 + 0.25 * Math.sin(lt * 6));
    // Döngü sonu solma
    const fade = 1 - span(lt, 11.3, 11.9);
    group.traverse((o) => {
      if (o.material && o !== solid) o.material.opacity = Math.min(o.material.opacity, fade);
    });
    if (fade < 1) { mat.opacity *= fade; mat.transparent = true; }

    group.rotation.y = -0.35 + Math.sin(t * 0.25) * 0.18 + mouseX * 0.35;
    group.rotation.x = mouseY * 0.08;

    // Sohbet adımlarını senkronla
    if (onStep) {
      let cur = -1;
      steps.forEach(([a], i) => { if (lt >= a) cur = i; });
      const allDone = lt >= steps[3][1];
      const key = allDone ? 99 : cur * 2 + (cur >= 0 && lt >= steps[cur][1] ? 1 : 0);
      if (key !== lastStep) {
        lastStep = key;
        onStep(cur, allDone, lt < 0.2 || lt > 11.3);
      }
    }
    renderer.render(scene, camera);
  }

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
  const t0 = performance.now();
  function loop(now) {
    if (visible) frame((now - t0) / 1000);
    if (!reduce) requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
