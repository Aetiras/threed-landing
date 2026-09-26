param t = 10mm
param w = 60mm
profil = sketch(Front) { polygon((0, 0), (110, 0), (110, t), (t, t), (t, 80), (0, 80)) }
govde = extrude(profil, w, mid: true)
kaburga_sk = sketch(Front) { polygon((t, t), (52, t), (t, 33)) }
kaburga = extrude(kaburga_sk, 8, mid: true)
kose = fillet(govde.edges("|Y"), 2mm)
mil = sketch(Right) { circle(center: (0, 48), d: 22) }
mil_delik = cut(mil, through)
flans = sketch(Right) {
  circle(center: (14.14, 62.14), d: 5.5)
  circle(center: (-14.14, 62.14), d: 5.5)
  circle(center: (14.14, 33.86), d: 5.5)
  circle(center: (-14.14, 33.86), d: 5.5)
}
flans_delik = cut(flans, through)
baglanti = hole(govde.face("+Z largest"), at: [(50, -20), (50, 20), (92, -20), (92, 20)], d: 9, depth: through)
