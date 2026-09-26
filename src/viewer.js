// threeD'den dışa aktarılan STL'leri gösteren görüntüleyici (Three.js).
// Model CAD koordinatındadır (Z yukarı); kök grup onu Three'nin Y-yukarı sahnesine çevirir.
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { mergeVertices, toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const loader = new STLLoader();
const cache = new Map();

/** STL'i yükler; yumuşak/keskin normaller ve CAD kenar çizgileri üretir. */
export function loadPart(url) {
  if (!cache.has(url)) {
    cache.set(
      url,
      loader.loadAsync(url).then((g) => {
        g.deleteAttribute("normal");
        const merged = mergeVertices(g, 1e-3);
        return { mesh: toCreasedNormals(merged, THREE.MathUtils.degToRad(28)), edges: new THREE.EdgesGeometry(merged, 28) };
      })
    );
  }
  return cache.get(url);
}

const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// Braketin sınır kutusu (mm): tüm karelerde aynı kadraj kullanılır, parça zıplamaz.
const BOX = { min: [0, -30, -14], max: [110, 30, 80] };
const CENTER = new THREE.Vector3(...BOX.min.map((v, i) => (v + BOX.max[i]) / 2));
const KEEP_ALL = new THREE.Plane(new THREE.Vector3(0, 1, 0), 1e6);

export function createViewer(canvas, { autoRotate = false, reduce = false, azimuth = 0, zoom = 1 } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.localClippingEnabled = true;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 1, 5000);
  const root = new THREE.Group();
  root.rotation.x = -Math.PI / 2; // CAD Z-yukarı → Three Y-yukarı
  scene.add(root);
  root.updateMatrixWorld();

  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8f96, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.9);
  key.position.set(-160, 260, 220);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 0.7);
  rim.position.set(220, 80, -200);
  scene.add(rim);

  const col = {};
  const readColors = () => {
    for (const k of ["metal", "metal-dark", "preview", "edge", "line", "line-2"]) col[k] = new THREE.Color(css("--" + k));
  };
  readColors();

  // Bir "yuva": gövde + kenar çizgileri; renk tonu ve önizleme yeşili oranı taşır.
  const slots = [];
  function slot(tone = "metal") {
    const mat = new THREE.MeshStandardMaterial({ metalness: 0.25, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1, clippingPlanes: [KEEP_ALL.clone()] });
    const emat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.75, clippingPlanes: mat.clippingPlanes });
    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat);
    const lines = new THREE.LineSegments(new THREE.BufferGeometry(), emat);
    const group = new THREE.Group();
    group.add(mesh, lines);
    group.visible = false;
    root.add(group);
    const s = { group, mesh, lines, mat, emat, part: null, tone, tint: 0 };
    slots.push(s);
    paint(s);
    return s;
  }
  function setPart(s, part) {
    if (s.part !== part) {
      s.part = part;
      if (part) { s.mesh.geometry = part.mesh; s.lines.geometry = part.edges; }
    }
    s.group.visible = !!part;
  }
  function paint(s) {
    const base = s.tone === "dark" ? col["metal-dark"] : col.metal;
    s.mat.color.copy(base).lerp(col.preview, s.tint);
    s.mat.emissive.copy(col.preview).multiplyScalar(0.28 * s.tint);
    s.emat.color.copy(col.edge);
  }
  function setTint(s, t) {
    if (Math.abs(s.tint - t) > 1e-3) { s.tint = t; paint(s); }
  }
  // CAD eksenine dik kırpma: keep = "below" → a·x <= d, "above" → a·x >= d.
  function clip(s, axis, d, keep) {
    const p = s.mat.clippingPlanes[0];
    if (!axis) { p.copy(KEEP_ALL); return; }
    const n = new THREE.Vector3(...axis);
    if (keep === "below") p.set(n.negate(), d);
    else p.set(n, -d);
    p.applyMatrix4(root.matrixWorld);
  }

  // Kadraj: izometriğe yakın, sağdan hafif üstten.
  const target = CENTER.clone().applyMatrix4(root.matrixWorld);
  const radius = Math.hypot(...BOX.max.map((v, i) => v - BOX.min[i])) / 2;
  const dir = new THREE.Vector3(0.95, 0.72, 1.15).normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), azimuth);
  const controls = new OrbitControls(camera, canvas);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = !reduce;
  controls.dampingFactor = 0.08;
  controls.autoRotate = autoRotate && !reduce;
  controls.autoRotateSpeed = 0.6;
  controls.target.copy(target);
  controls.addEventListener("start", () => (controls.autoRotate = false));
  controls.addEventListener("change", () => (dirty = true));

  let dirty = true, visible = false, drops = [];
  const fit = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const fov = THREE.MathUtils.degToRad(camera.fov) / 2;
    const dist = (radius * 1.08) / zoom / Math.sin(Math.min(fov, Math.atan(Math.tan(fov) * camera.aspect)));
    camera.position.copy(target).addScaledVector(dir, dist);
    camera.updateProjectionMatrix();
    controls.update();
    dirty = true;
  };
  new ResizeObserver(fit).observe(canvas);
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) drops.forEach((d) => d.t0 ??= performance.now());
  }).observe(canvas);
  const retheme = () => {
    readColors();
    slots.forEach(paint);
    extras.scan?.material.color.copy(col.preview);
    extras.tip?.material.color.copy(col.preview);
    extras.sketch?.material.color.copy(col.preview);
    if (extras.grid) {
      root.remove(extras.grid);
      extras.grid = makeGrid(extras.grid.visible);
    }
    dirty = true;
  };
  new MutationObserver(retheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", retheme);

  const loop = (now) => {
    requestAnimationFrame(loop);
    if (!visible) return;
    for (const d of drops) {
      if (d.t0 == null || d.done) continue;
      const p = Math.min(1, (now - d.t0 - d.delay) / 1100);
      if (p < 0) continue;
      d.slot.group.position.z = d.from * (1 - (1 - (1 - p) ** 3));
      d.done = p === 1;
      dirty = true;
    }
    if (controls.autoRotate || controls.enableDamping) dirty = controls.update() || dirty || controls.autoRotate;
    if (dirty) { renderer.render(scene, camera); dirty = false; }
  };
  requestAnimationFrame(loop);

  /* Oynatıcı için ek nesneler: sketch çizgisi, ızgara, tarama düzlemi */
  const extras = {};
  function makeGrid(vis) {
    // GridHelper kendi XZ düzleminde durur; kök grup CAD koordinatında olduğu için bu Ön düzlemdir.
    const g = new THREE.GridHelper(150, 15, col["line-2"], col.line);
    g.material.transparent = true;
    g.material.opacity = 0.55;
    g.position.set(55, 0, 38);
    g.visible = vis;
    root.add(g);
    return g;
  }
  function ensureExtras() {
    if (extras.scan) return;
    extras.grid = makeGrid(false);
    const scanMat = new THREE.MeshBasicMaterial({ color: col.preview, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false });
    extras.scan = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), scanMat);
    const rimLine = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 1)), new THREE.LineBasicMaterial({ color: col.preview, transparent: true, opacity: 0.9 }));
    rimLine.material.color = scanMat.color;
    extras.scan.add(rimLine);
    extras.scan.visible = false;
    root.add(extras.scan);
    extras.sketch = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: col.preview }));
    extras.sketch.visible = false;
    root.add(extras.sketch);
    extras.tip = new THREE.Mesh(new THREE.SphereGeometry(1.8, 16, 12), new THREE.MeshBasicMaterial({ color: col.preview }));
    extras.tip.visible = false;
    root.add(extras.tip);
    extras.prev = slot();
    extras.cur = slot();
  }
  let sketchPts = null;

  return {
    /** Sabit sahne: parts = [{ part, tone: "metal" | "dark", drop?: mm }] */
    show(parts) {
      parts.forEach(({ part, tone = "metal", drop = 0 }, i) => {
        const s = slots[i] || slot(tone);
        s.tone = tone;
        paint(s);
        setPart(s, part);
        if (drop && !reduce) {
          s.group.position.z = drop;
          drops.push({ slot: s, from: drop, delay: 250, t0: visible ? performance.now() : null });
        }
      });
      dirty = true;
    },
    setSpin(on) { controls.autoRotate = on && !reduce; },
    /**
     * Oynatıcı karesi (durumsuz: aynı girdi → aynı görüntü, ileri-geri sarılabilir).
     * sketch: { points: [[x, z], …], p } · prev/cur: parça · extrude: 0..1 (CAD Y'de büyür)
     * sweep: { axis: [x, y, z], d } — cur, eksen boyunca d'ye kadar görünür; ötesinde prev kalır.
     */
    frame({ sketch = null, grid = false, prev = null, cur = null, extrude = 1, sweep = null, tintPrev = 0, tintCur = 0 }) {
      ensureExtras();
      extras.grid.visible = grid;
      // Sketch çizgisi uçtan uca çizilir, ucunda bir nokta ilerler.
      if (sketch) {
        if (sketchPts !== sketch.points) {
          sketchPts = sketch.points;
          const path = new THREE.CurvePath();
          const pts = [...sketch.points, sketch.points[0]].map(([x, z]) => new THREE.Vector3(x, 0, z));
          for (let i = 0; i < pts.length - 1; i++) path.add(new THREE.LineCurve3(pts[i], pts[i + 1]));
          extras.sketch.geometry.dispose();
          extras.sketch.geometry = new THREE.TubeGeometry(path, 240, 0.75, 6, false);
          extras.sketchPath = path;
        }
        // Tüp halkalar hâlinde üretilir: bir halka = 6 dörtgen = 36 indeks.
        const rings = Math.round(sketch.p * 240);
        extras.sketch.geometry.setDrawRange(0, rings * 36);
        extras.sketch.visible = rings > 0;
        extras.tip.position.copy(extras.sketchPath.getPointAt(Math.min(1, sketch.p)));
        extras.tip.visible = sketch.p > 0 && sketch.p < 1;
      } else {
        extras.sketch.visible = extras.tip.visible = false;
      }
      setPart(extras.prev, sweep ? prev : null);
      setPart(extras.cur, cur);
      extras.cur.group.scale.y = Math.max(0.002, extrude);
      setTint(extras.prev, tintPrev);
      setTint(extras.cur, tintCur);
      if (sweep && prev) {
        clip(extras.cur, sweep.axis, sweep.d, "below");
        clip(extras.prev, sweep.axis, sweep.d, "above");
        const a = new THREE.Vector3(...sweep.axis);
        extras.scan.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), a);
        extras.scan.position.copy(CENTER).addScaledVector(a, sweep.d - a.dot(CENTER));
        extras.scan.scale.setScalar(130);
        extras.scan.visible = true;
      } else {
        clip(extras.cur, null);
        clip(extras.prev, null);
        extras.scan.visible = false;
      }
      dirty = true;
    },
  };
}
