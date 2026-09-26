"""Sayfadaki braket varlıklarını çalışan bir threeD uygulamasından yeniden üretir.

Kullanım (threed-landing kökünden):
    python3 scripts/uret.py <threed-mcp yolu> <host dosyası>
    ör. python3 scripts/uret.py ../threed-client/target/debug/threed-mcp \
        "$HOME/Library/Application Support/threeD/hosts/<pid>.json"

DİKKAT: Hedef uygulamadaki belge `replace` moduyla baştan yazılır; boş bir threeD penceresi açıp onu hedefleyin.
Çıktılar: src/assets/models/*.stl, src/assets/pafta.svg, public/files/*.
"""
import json, math, os, struct, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS = os.path.join(ROOT, "src/assets/models")
FILES = os.path.join(ROOT, "public/files")


class Mcp:
    def __init__(self, exe, host):
        self.p = subprocess.Popen([exe, "--host-file", host], stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
        self.i = 0
        self.req("initialize", {"protocolVersion": "2025-06-18", "capabilities": {}, "clientInfo": {"name": "landing", "version": "1"}})
        self.send({"jsonrpc": "2.0", "method": "notifications/initialized"})

    def send(self, msg):
        self.p.stdin.write(json.dumps(msg) + "\n")
        self.p.stdin.flush()

    def req(self, method, params):
        self.i += 1
        self.send({"jsonrpc": "2.0", "id": self.i, "method": method, "params": params})
        while True:
            r = json.loads(self.p.stdout.readline())
            if r.get("id") == self.i:
                return r

    def call(self, name, args):
        r = self.req("tools/call", {"name": name, "arguments": args})["result"]
        text = next((c["text"] for c in r.get("content", []) if c.get("type") == "text"), "{}")
        if r.get("isError"):
            sys.exit(f"{name}: {text}")
        return json.loads(text)


def read_stl(path):
    b = open(path, "rb").read()
    n = struct.unpack("<I", b[80:84])[0]
    return [b[84 + i * 50 : 134 + i * 50] for i in range(n)]


def write_stl(path, tris):
    open(path, "wb").write(b"\0" * 80 + struct.pack("<I", len(tris)) + b"".join(tris))


def tri_key(t):
    v = struct.unpack("<12f", t[:48])
    return tuple(sorted(tuple(round(x, 2) for x in v[3 + 3 * k : 6 + 3 * k]) for k in range(3)))


def main():
    mcp = Mcp(sys.argv[1], sys.argv[2])
    here = os.path.dirname(os.path.abspath(__file__))
    part = open(os.path.join(ROOT, "src/assets/braket.dsl")).read().strip()
    lines = part.split("\n")

    # Ağacın her adımı ayrı bir STL (satır sayısı = o adıma kadarki betik).
    for name, n in [("govde", 4), ("kaburga", 6), ("kose", 7), ("mil_delik", 9), ("flans_delik", 16), ("baglanti", 17)]:
        r = mcp.call("threed_apply_dsl", {"script": "\n".join(lines[:n]), "label": "adım " + name, "mode": "replace"})
        print(name, r["regen"]["faces"], "yüz")
        mcp.call("threed_export", {"path": os.path.join(MODELS, f"step-{name}.stl")})

    # Tam parça + pafta; ardından montaj.
    sheet = open(os.path.join(here, "pafta.dsl")).read()
    r = mcp.call("threed_apply_dsl", {"script": part + "\n" + sheet, "label": "Motor braketi", "mode": "replace"})
    print("regen", r["regen"]["regen_ms"], "ms ·", r["regen"]["volume_mm3"], "mm³")
    for ext in ("pdf", "dxf", "step", "stl"):
        mcp.call("threed_export", {"path": os.path.join(FILES, "braket." + ext)})
    mcp.call("threed_apply_dsl", {"script": open(os.path.join(here, "montaj.dsl")).read(), "label": "Bağlantı elemanları"})
    print("BOM", [(b["name"], b["quantity"], b["mass_g"]) for b in mcp.call("threed_query", {"what": "bom"})])
    tmp = os.path.join(FILES, "_montaj.stl")
    mcp.call("threed_export", {"path": tmp, "what": "assembly"})
    mcp.call("threed_export", {"path": os.path.join(FILES, "montaj.step"), "what": "assembly"})

    # Montaj ağından braketi çıkar: kalan üçgenler cıvata + pul (sitede koyu renkte çizilir).
    part_keys = {tri_key(t) for t in read_stl(os.path.join(FILES, "braket.stl"))}
    holes = [(50, -20), (50, 20), (92, -20), (92, 20)]
    rest = []
    for t in read_stl(tmp):
        if tri_key(t) in part_keys:
            continue
        v = struct.unpack("<12f", t[:48])
        pts = [v[3 + 3 * k : 6 + 3 * k] for k in range(3)]
        r = lambda p: min(math.hypot(p[0] - x, p[1] - y) for x, y in holes)
        # Tessellation farkıyla eşleşmeyen braket üçgenleri: delik duvarı dışı ya da deliklerden uzak.
        if all(-0.01 <= p[2] <= 10.01 and r(p) >= 4.45 for p in pts) or any(r(p) > 9 for p in pts):
            continue
        rest.append(t)
    write_stl(os.path.join(MODELS, "baglanti-elemanlari.stl"), rest)
    os.remove(tmp)

    subprocess.run([sys.executable, os.path.join(here, "dxf2svg.py"), os.path.join(FILES, "braket.dxf"), os.path.join(ROOT, "src/assets/pafta.svg")], check=True)


if __name__ == "__main__":
    main()
