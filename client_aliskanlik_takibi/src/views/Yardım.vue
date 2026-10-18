<template>
  <div class="sayfa">
    <!-- Giriş -->
    <section class="giris">
      <h2>🦆 Nasıl oynanır?</h2>
      <p>
        Her kullanıcının bakmakla sorumlu olduğu bir ördeği var. Alışkanlıklarını ve görevlerini
        yaptıkça ördeğin büyür; aksatırsan hastalanır ve sonunda ölebilir. Kısacası:
        <strong>sen kendine iyi bakarsan, ördeğin de iyi olur.</strong>
      </p>
    </section>

    <!-- Büyüme -->
    <section class="kart">
      <h4>🌱 Ördeğin büyümesi</h4>
      <p>
        Ördeğin, XP kazanıp seviye atladıkça büyür. Her <strong>{{ K.SEVIYE_XP }} XP</strong> bir seviye demek.
        <strong>{{ K.YETISKIN_SEVIYE }}. seviyede</strong> yetişkin olur ve çiftliğe gönderilmeye hazırdır.
      </p>
      <div class="asamalar">
        <div v-for="(a, i) in ASAMALAR" :key="a.asama" class="asama">
          <img :src="gorsel(a.asama)" :alt="a.ad" />
          <strong>{{ a.ad }}</strong>
          <span>Seviye {{ a.seviye }}</span>
          <span v-if="i < ASAMALAR.length - 1" class="ok">➜</span>
        </div>
      </div>
    </section>

    <!-- Alışkanlık vs görev -->
    <section class="kart">
      <h4>📋 Alışkanlık mı, görev mi?</h4>
      <div class="iki-sutun">
        <div class="kutu">
          <h5>🔁 Alışkanlık</h5>
          <p class="ornek">"Her gün 20 sayfa kitap oku"</p>
          <ul>
            <li>Bir kez eklenir, <strong>her gün</strong> yeniden yapılır.</li>
            <li>Gece yarısı kendiliğinden sıfırlanır.</li>
            <li>Ördeğin <strong>günlük bakımıdır</strong>: XP ve <strong>can</strong> kazandırır.</li>
            <li>Art arda yaptığın günler <strong>seri 🔥</strong> oluşturur.</li>
          </ul>
        </div>
        <div class="kutu">
          <h5>✅ Görev</h5>
          <p class="ornek">"Fizik ödevini teslim et"</p>
          <ul>
            <li><strong>Tek seferliktir</strong>, yapınca biter.</li>
            <li>İşaretleyene kadar listede bekler.</li>
            <li>Ördeğini <strong>büyütür</strong>: yalnızca XP kazandırır.</li>
            <li>Görevler sayfasından geçmişini görebilirsin.</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Can ve XP -->
    <section class="kart">
      <h4>❤️ Can ve ⭐ XP</h4>
      <div class="tablo">
        <div class="satir baslik"><span>Ne yaparsan</span><span>❤️ Can</span><span>⭐ XP</span></div>
        <div class="satir"><span>✅ Alışkanlık tamamla</span><span class="arti">+{{ K.IYILESME }}</span><span class="arti">+ puanı kadar</span></div>
        <div class="satir"><span>🔥 7, 14, 21… günlük seriye ulaş</span><span class="arti">+{{ K.SERI_BONUSU }} bonus</span><span>—</span></div>
        <div class="satir"><span>✅ Görev tamamla</span><span>—</span><span class="arti">+ puanı kadar</span></div>
        <div class="satir"><span>❌ "Yapılmadı" olarak işaretle</span><span class="eksi">− puanı kadar</span><span>—</span></div>
        <div class="satir"><span>💤 Alışkanlığı hiç işaretlemeden günü geçir</span><span class="eksi">−{{ K.GUNLUK_CEZA }} (her biri için)</span><span>—</span></div>
      </div>
      <p class="not">
        Puanlar zorluğa göre belirlenir: Kolay {{ K.PUANLAR[0] }}, Orta {{ K.PUANLAR[1] }}, Zor {{ K.PUANLAR[2] }} XP.
        Can en fazla 100 olabilir.
      </p>
    </section>

    <!-- Ruh halleri -->
    <section class="kart">
      <h4>😊 Ördeğin ruh hali</h4>
      <p>Ördeğinin ne durumda olduğunu görünüşünden anlayabilirsin:</p>
      <div class="ruh-halleri">
        <div v-for="r in RUH_HALLERI" :key="r.hal" class="ruh-hali">
          <img :src="gorsel(r.asama, r.hal)" :alt="r.ad" />
          <strong>{{ r.ad }}</strong>
          <span>{{ r.aciklama }}</span>
        </div>
      </div>
    </section>

    <!-- Renkler -->
    <section class="kart">
      <h4>🎁 Yumurtadan ne çıkacak?</h4>
      <p>
        Bütün yumurtalar birbirine benzer. Ördeğinin rengi ancak yumurtadan çıktığında ortaya çıkar,
        tamamen sürprizdir! Bazı renkler diğerlerinden çok daha nadirdir.
      </p>
      <div class="renkler">
        <div v-for="r in RENKLER" :key="r.renk" class="renk">
          <img :src="gorsel('yetiskin', 'mutlu', r.renk)" :alt="r.ad" />
          <strong>{{ r.ad }}</strong>
          <span :class="['nadirlik', r.sinif]">{{ r.nadirlik }}</span>
        </div>
      </div>
    </section>

    <!-- Çiftlik -->
    <section class="kart">
      <h4>🏡 Çiftlik</h4>
      <ul>
        <li>Ördeğin yetişkin olunca kartında <strong>🏡 Çiftliğe gönder</strong> butonu belirir.</li>
        <li>
          Gönderdiğinde ördeğin çiftliğine katılır ve sen <strong>yeni bir yumurtayla</strong> başlarsın.
          Alışkanlık serilerin <strong>korunur</strong>, bu bir ödüldür.
        </li>
        <li>Çiftlik sayfasında büyüttüğün bütün ördekleri gölette dolaşırken görebilirsin.</li>
        <li>Çiftliğin büyüdükçe <strong>unvanın</strong> yükselir.</li>
      </ul>
    </section>

    <!-- Ölüm -->
    <section class="kart">
      <h4>🪦 Ördeğin ölürse</h4>
      <ul>
        <li>Canı <strong>0'a inerse</strong> ördeğin ölür.</li>
        <li>
          Birkaç gün uygulamaya hiç girmesen bile ördeğin hemen ölmez: canı en fazla
          <strong>1'e</strong> düşer ve ağır hasta olur. Ona bakmak için son bir şansın vardır.
        </li>
        <li>Yumurtalar hiçbir zaman ölmez, sadece soğurlar 🥶</li>
        <li>
          Ölen ördeğin <strong>Anı Defteri</strong>'ne eklenir. Sen de yeni bir yumurtayla, sıfırdan
          başlarsın ve alışkanlık serilerin sıfırlanır.
        </li>
      </ul>
    </section>

    <!-- Unvanlar -->
    <section class="kart">
      <h4>🏅 Unvanlar</h4>
      <p>Unvanın, çiftliğinde kaç ördek olduğuna göre belirlenir:</p>
      <div class="unvanlar">
        <div v-for="u in UNVANLAR" :key="u.ad" class="unvan">
          <span class="unvan-seviye">{{ u.kosul }}</span>
          <strong>{{ u.ad }}</strong>
        </div>
      </div>
    </section>

    <!-- SSS -->
    <section class="kart">
      <h4>❓ Sık sorulan sorular</h4>
      <details v-for="s in SSS" :key="s.soru">
        <summary>{{ s.soru }}</summary>
        <p>{{ s.cevap }}</p>
      </details>
    </section>
  </div>
</template>

<script>
// Oyun kuralları: backend'deki ordekService.js ile aynı tutulmalı
import { ordekGorsel, yumurtaMi } from '@/utils/ordek'

const K = {
  SEVIYE_XP: 100,
  YETISKIN_SEVIYE: 10,
  IYILESME: 10,
  SERI_BONUSU: 15,
  GUNLUK_CEZA: 10,
  PUANLAR: [5, 10, 15],
}

const ASAMALAR = [
  { asama: 'yumurta', ad: 'Yumurta', seviye: '1–2' },
  { asama: 'catlayan_yumurta', ad: 'Çatlayan yumurta', seviye: '3' },
  { asama: 'yavru', ad: 'Yavru', seviye: '4–6' },
  { asama: 'genc', ad: 'Genç', seviye: '7–9' },
  { asama: 'yetiskin', ad: 'Yetişkin', seviye: '10' },
]

const RENKLER = [
  { renk: 'beyaz', ad: 'Beyaz', nadirlik: 'Yaygın', sinif: 'yaygin' },
  { renk: 'yaban', ad: 'Yaban', nadirlik: 'Yaygın', sinif: 'yaygin' },
  { renk: 'siyah', ad: 'Siyah', nadirlik: 'Az bulunur', sinif: 'az' },
  { renk: 'altin', ad: 'Altın', nadirlik: 'Nadir', sinif: 'nadir' },
  { renk: 'lavanta', ad: 'Lavanta', nadirlik: 'Çok nadir ✨', sinif: 'cok-nadir' },
]

const RUH_HALLERI = [
  { asama: 'yavru', hal: 'mutlu', ad: '😊 Mutlu', aciklama: 'Can 70 ve üstü' },
  { asama: 'yavru', hal: 'yorgun', ad: '😐 Yorgun', aciklama: 'Can 40–69' },
  { asama: 'yavru', hal: 'hasta', ad: '🤒 Hasta', aciklama: 'Can 1–39' },
  { asama: 'yumurta', hal: 'soguk', ad: '🥶 Üşüyor', aciklama: 'Yumurtanın canı 40 altı' },
]

const UNVANLAR = [
  { kosul: '0 ördek', ad: 'Yumurta Bekçisi' },
  { kosul: '1 ördek', ad: 'Acemi Çiftçi' },
  { kosul: '3 ördek', ad: 'Gölet Sahibi' },
  { kosul: '5 ördek', ad: 'Sazlık Ustası' },
  { kosul: '10 ördek', ad: 'Göl Muhafızı' },
  { kosul: '20 ördek', ad: 'Efsanevi Çiftçi' },
]

const SSS = [
  {
    soru: 'Alışkanlığımı her gün yeniden eklemem gerekiyor mu?',
    cevap:
      'Hayır. Alışkanlığı bir kez eklersin, listede kalır. Her gün yapman gereken tek şey onu seçip ✅ butonuna basmak. Gece yarısı tarih değişince alışkanlık tekrar işaretlenebilir hale gelir.',
  },
  {
    soru: 'Seri nasıl bozulur?',
    cevap:
      'Bir alışkanlığı bir gün hiç işaretlemezsen ya da "yapılmadı" dersen o alışkanlığın serisi sıfırlanır. Ertesi gün yaptığında seri 1\'den yeniden başlar. En uzun serin 🏆 rekor olarak Alışkanlıklar sayfasında saklanır.',
  },
  {
    soru: 'Birkaç gün uygulamaya giremezsem ne olur?',
    cevap: `Döndüğünde, geçen her gün için yapılmayan her alışkanlık başına ${K.GUNLUK_CEZA} can kaybedersin. Ama bu ceza ördeğini öldürmez; canı en fazla 1'e iner. O gün alışkanlıklarını yaparak onu iyileştirebilirsin.`,
  },
  {
    soru: 'Hasta ördeğimi nasıl iyileştiririm?',
    cevap: `Alışkanlıklarını tamamla: her biri ${K.IYILESME} can verir. Bir alışkanlıkta 7 günlük seriye ulaşırsan ${K.SERI_BONUSU} can bonus kazanırsın.`,
  },
  {
    soru: 'Ördeğimin rengini seçebilir miyim?',
    cevap:
      'Hayır, renk tamamen sürpriz! Yumurta çatlayıp ördek dünyaya geldiğinde ortaya çıkar. Lavanta ördekler çok nadirdir; çiftliğinde bir tane varsa şanslısın ✨',
  },
  {
    soru: 'Yetişkin ördeğimi çiftliğe göndermek zorunda mıyım?',
    cevap:
      'Hayır, ne zaman göndereceğine sen karar verirsin. Ama göndermediğin sürece ördeğin bakım istemeye devam eder: alışkanlıklarını aksatırsan yetişkin bir ördek de hastalanıp ölebilir.',
  },
  {
    soru: 'Ördeğimin adını değiştirebilir miyim?',
    cevap:
      'Hayır, isim yumurtaya bir kez verilir ve ördeğin hayatı boyunca onunla kalır. Yeni bir isim ancak yeni bir yumurtayla mümkün.',
  },
  {
    soru: 'Bir alışkanlığı silersem ne olur?',
    cevap:
      'Alışkanlık, serisi ve geçmiş kayıtlarıyla birlikte silinir. Silinen alışkanlık için artık ceza almazsın; ama kazandığın XP ve seviye kaybolmaz.',
  },
]

export default {
  data() {
    return { K, ASAMALAR, RENKLER, RUH_HALLERI, UNVANLAR, SSS }
  },
  methods: {
    gorsel(asama, hal = 'mutlu', renk = 'beyaz') {
      return ordekGorsel(asama, yumurtaMi(asama) ? 'sicak' : hal, renk)
    },
  },
}
</script>

<style scoped>
.sayfa {
  font-family: monospace;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem 1rem;
}
.giris {
  text-align: center;
  margin-bottom: 1.5rem;
}
.giris h2 {
  font-weight: bold;
}
.giris p {
  max-width: 640px;
  margin: 0 auto;
  color: #444;
}
.kart {
  background: white;
  border: 4px solid black;
  border-radius: 10px;
  padding: 18px 22px;
  margin-bottom: 1.5rem;
}
.kart h4 {
  font-weight: bold;
  margin-bottom: 12px;
}
.kart ul {
  padding-left: 1.2rem;
  margin-bottom: 0;
}
.kart li {
  margin-bottom: 4px;
}
img {
  image-rendering: pixelated;
}

/* Büyüme aşamaları */
.asamalar {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}
.asama {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 100px;
  font-size: 0.8rem;
}
.asama img {
  width: 72px;
  height: 72px;
  background: #b9e08d;
  border: 3px solid black;
  border-radius: 8px;
  margin-bottom: 6px;
}
.asama span {
  color: #666;
}
.asama .ok {
  position: absolute;
  right: -10px;
  top: 26px;
  font-size: 1.1rem;
  color: #2d2020;
}

/* Alışkanlık / görev */
.iki-sutun {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.kutu {
  border: 2px solid black;
  border-radius: 8px;
  padding: 12px 14px;
  background: #fafaf7;
}
.kutu h5 {
  font-weight: bold;
  margin-bottom: 4px;
}
.ornek {
  font-style: italic;
  color: #666;
  font-size: 0.85rem;
}

/* Can ve XP tablosu */
.tablo {
  border: 2px solid black;
  border-radius: 8px;
  overflow: hidden;
}
.satir {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 8px;
  padding: 8px 12px;
  border-top: 1px solid #ddd;
  font-size: 0.85rem;
}
.satir.baslik {
  background: #8cc850;
  color: white;
  font-weight: bold;
  border-top: none;
}
.arti {
  color: #2e7d32;
  font-weight: bold;
}
.eksi {
  color: #c62828;
  font-weight: bold;
}
.not {
  font-size: 0.8rem;
  color: #666;
  margin: 10px 0 0;
}

/* Ruh halleri */
.ruh-halleri {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.ruh-hali {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  font-size: 0.8rem;
}
.ruh-hali img {
  width: 64px;
  height: 64px;
  background: #b9e08d;
  border: 3px solid black;
  border-radius: 8px;
  margin-bottom: 6px;
}
.ruh-hali span {
  color: #666;
}

/* Renkler */
.renkler {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}
.renk {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.8rem;
  text-align: center;
}
.renk img {
  width: 64px;
  height: 64px;
  background: #b9e08d;
  border: 3px solid black;
  border-radius: 8px;
  margin-bottom: 6px;
}
.nadirlik {
  font-size: 0.7rem;
  border-radius: 8px;
  padding: 0 6px;
  margin-top: 2px;
}
.nadirlik.yaygin { background: #eee; color: #555; }
.nadirlik.az { background: #dbeafe; color: #1e40af; }
.nadirlik.nadir { background: #fef3c7; color: #92400e; }
.nadirlik.cok-nadir { background: #ede9fe; color: #6d28d9; font-weight: bold; }

/* Unvanlar */
.unvanlar {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 8px;
}
.unvan {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 2px solid black;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 0.85rem;
}
.unvan-seviye {
  background: #2d2020;
  color: white;
  border-radius: 6px;
  padding: 1px 6px;
  font-size: 0.75rem;
  white-space: nowrap;
}

/* SSS */
details {
  border-top: 2px dashed #ddd;
  padding: 10px 0;
}
details:first-of-type {
  border-top: none;
}
summary {
  font-weight: bold;
  cursor: pointer;
}
details p {
  margin: 8px 0 0;
  color: #444;
  font-size: 0.9rem;
}

/* Dar ekranlar */
@media (max-width: 768px) {
  .iki-sutun {
    grid-template-columns: 1fr;
  }
  .ruh-halleri {
    grid-template-columns: repeat(2, 1fr);
  }
  .renkler {
    grid-template-columns: repeat(3, 1fr);
  }
  .asama .ok {
    display: none;
  }
  .satir {
    grid-template-columns: 1.5fr 1fr 1fr;
    font-size: 0.75rem;
  }
}
</style>