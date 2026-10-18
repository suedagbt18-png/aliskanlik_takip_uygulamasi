// Ördekle ilgili ortak bilgiler: tüm bileşenler buradan kullanır

const YUMURTALAR = ['yumurta', 'catlayan_yumurta']

export const ASAMA_ADLARI = {
  yumurta: '🥚 Yumurta',
  catlayan_yumurta: '🐣 Çatlayan yumurta',
  yavru: '🐤 Yavru ördek',
  genc: '🦆 Genç ördek',
  yetiskin: '🦆 Yetişkin ördek',
}

export const RUH_HALLERI = {
  sicak: '🔥 Sıcacık',
  soguk: '🥶 Üşüyor',
  mutlu: '😊 Mutlu',
  yorgun: '😐 Yorgun',
  hasta: '🤒 Hasta',
}

export const RENK_ADLARI = {
  beyaz: 'Beyaz ördek',
  yaban: 'Yaban ördeği',
  siyah: 'Siyah ördek',
  altin: 'Altın ördek',
  lavanta: 'Lavanta ördeği ✨',
}

export function yumurtaMi(asama) {
  return YUMURTALAR.includes(asama)
}

// Görselin yolunu verir. Yumurtalar herkes için aynı (renk, yumurtadan çıkınca sürpriz!)
export function ordekGorsel(asama, ruhHali, renk) {
  const dosya = yumurtaMi(asama) ? `${asama}_${ruhHali}` : `${asama}_${renk || 'beyaz'}_${ruhHali}`
  return new URL(`../assets/ordek/${dosya}.png`, import.meta.url).href
}

// Kullanıcının yazdığı metni (ör. ördek adı) HTML içine güvenle koymak için
export function kacis(metin) {
  const tablo = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
  return String(metin ?? '').replace(/[&<>"']/g, (c) => tablo[c])
}
