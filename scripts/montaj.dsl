civata = std(ISO4762, M8, 25)
pul = std(ISO7089, M8)
assembly {
  p = insert(main, fixed: true)
  fasten(p.baglanti, civata, washer: pul)
}
