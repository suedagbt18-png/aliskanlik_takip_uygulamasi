<template>
  <div class="sayfa">
    <div class="baslik">
      <h2>🏡 Çiftliğim</h2>
      <p>Yumurtadan yetişkinliğe kadar büyüttüğün ördekler burada yaşıyor.</p>
    </div>

    <p v-if="yukleniyor" class="bilgi">Yükleniyor...</p>
    <p v-else-if="hata" class="bilgi">{{ hata }}</p>

    <template v-else>
      <!-- Unvan ve ilerleme -->
      <div class="unvan-kutu">
        <div>
          <span class="unvan-etiket">Unvanın</span>
          <strong class="unvan-ad">🏅 {{ unvan }}</strong>
        </div>
        <div class="sayi">
          <strong>{{ ordekler.length }}</strong>
          <span>ördek</span>
        </div>
        <div v-if="sonrakiUnvan" class="ilerleme">
          <span class="unvan-etiket">Sonraki: {{ sonrakiUnvan }} ({{ ordekler.length }}/{{ sonrakiIcin }})</span>
          <div class="bar"><div class="bar-dolu" :style="{ width: ilerlemeYuzde + '%' }"></div></div>
        </div>
        <div v-else class="ilerleme">
          <span class="unvan-etiket">En yüksek unvana ulaştın! 👑</span>
        </div>
      </div>

      <!-- Gölet sahnesi -->
      <div class="sahne">
        <div class="gunes"></div>
        <div class="bulut b1"></div>
        <div class="bulut b2"></div>
        <div class="golet"></div>
        <div class="saz s1"></div>
        <div class="saz s2"></div>

        <p v-if="ordekler.length === 0" class="sahne-bos">
          Çiftliğin şimdilik boş. İlk ördeğini yetişkinliğe kadar büyüt ve buraya gönder! 🐣
        </p>

        <div
          v-for="(o, i) in sahnedekiler"
          :key="o.ciftlik_id"
          class="gezgin"
          :style="gezginStili(o, i)"
          :title="`${o.ordek_adi} · ${o.buyume_gunu} günde büyüdü`"
        >
          <div class="yon" :style="{ animationDuration: sure(o) + 's', animationDelay: -gecikme(o) + 's' }">
            <img :src="gorsel(o)" :alt="o.ordek_adi" />
          </div>
          <span class="isim">{{ o.ordek_adi }}</span>
        </div>
      </div>

      <!-- Liste -->
      <div v-if="ordekler.length" class="liste">
        <div v-for="o in [...ordekler].reverse()" :key="o.ciftlik_id" class="kart">
          <img :src="gorsel(o)" :alt="o.ordek_adi" />
          <div>
            <strong class="kart-ad">{{ o.ordek_adi }}</strong>
            <p>{{ RENK_ADLARI[o.renk] }}</p>
            <p>⏱️ {{ o.buyume_gunu }} günde büyüdü</p>
            <p>🏡 {{ tarihMetni(o.katilma) }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import axios from 'axios'
import { ordekGorsel, RENK_ADLARI } from '@/utils/ordek'

const SAHNE_EN_FAZLA = 24 // sahnede aynı anda en fazla bu kadar ördek dolaşsın

export default {
  data() {
    return {
      RENK_ADLARI,
      yukleniyor: true,
      hata: '',
      ordekler: [],
      unvan: '',
      sonrakiUnvan: null,
      sonrakiIcin: null,
    }
  },
  computed: {
    sahnedekiler() {
      return this.ordekler.slice(-SAHNE_EN_FAZLA)
    },
    ilerlemeYuzde() {
      if (!this.sonrakiIcin) return 100
      return Math.min(100, Math.round((this.ordekler.length / this.sonrakiIcin) * 100))
    },
  },
  methods: {
    gorsel(o) {
      return ordekGorsel('yetiskin', 'mutlu', o.renk)
    },
    // Her ördeğin yeri ve hızı, id'sinden türetilir: sayfa yenilense de aynı kalır
    sure(o) {
      return 14 + ((o.ciftlik_id * 7) % 12) // 14-25 saniyede bir tur
    },
    gecikme(o) {
      return (o.ciftlik_id * 3.7) % this.sure(o)
    },
    gezginStili(o, i) {
      // Ördekleri 4 sıraya ve yatayda farklı noktalara dağıt
      const sol = 4 + ((i * 29 + (o.ciftlik_id % 5) * 3) % 62) // %4 - %66
      const alt = 8 + (i % 4) * 30 + ((o.ciftlik_id * 7) % 12) // 8px - 128px
      const mesafe = 80 + ((o.ciftlik_id * 19) % 140) // kaç piksel yürüsün
      return {
        left: sol + '%',
        bottom: alt + 'px',
        zIndex: 200 - alt, // öndekiler arkadakilerin üstünde
        '--mesafe': mesafe + 'px',
        animationDuration: this.sure(o) + 's',
        animationDelay: -this.gecikme(o) + 's',
      }
    },
    tarihMetni(tarih) {
      return new Date(tarih + 'T00:00:00Z').toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      })
    },
    async ciftligiGetir() {
      try {
        const res = await axios.get('http://localhost:3000/ciftlik', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        this.ordekler = res.data.ordekler
        this.unvan = res.data.unvan
        this.sonrakiUnvan = res.data.sonrakiUnvan
        this.sonrakiIcin = res.data.sonrakiIcin
      } catch (err) {
        console.error('Çiftlik hatası:', err)
        this.hata = err.response?.data?.mesaj || 'Çiftlik yüklenemedi.'
      } finally {
        this.yukleniyor = false
      }
    },
  },
  mounted() {
    this.ciftligiGetir()
  },
}
</script>

<style scoped>
.sayfa {
  font-family: monospace;
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1rem 1rem;
}
.baslik {
  text-align: center;
  margin-bottom: 1.5rem;
}
.baslik h2 {
  font-weight: bold;
}
.baslik p,
.bilgi {
  color: #666;
  text-align: center;
}

/* Unvan kutusu */
.unvan-kutu {
  display: grid;
  grid-template-columns: 1.2fr auto 2fr;
  gap: 20px;
  align-items: center;
  background: #8cc850;
  color: white;
  border: 4px solid black;
  border-radius: 10px;
  padding: 14px 20px;
  margin-bottom: 1.5rem;
}
.unvan-etiket {
  display: block;
  font-size: 0.8rem;
}
.unvan-ad {
  font-size: 1.3rem;
  text-shadow: 2px 2px 0 #2d2020;
}
.sayi {
  text-align: center;
  line-height: 1;
}
.sayi strong {
  display: block;
  font-size: 2rem;
  text-shadow: 2px 2px 0 #2d2020;
}
.bar {
  height: 14px;
  background: #3d3030;
  border: 2px solid black;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 4px;
}
.bar-dolu {
  height: 100%;
  background: #ffd54f;
  transition: width 0.5s ease;
}

/* Gölet sahnesi */
.sahne {
  position: relative;
  height: 320px;
  border: 4px solid black;
  border-radius: 10px;
  overflow: hidden;
  background: linear-gradient(#bfe6fb 0%, #dff3fd 38%, #8cc850 38%, #7ab840 100%);
}
.gunes {
  position: absolute;
  top: 18px;
  right: 40px;
  width: 44px;
  height: 44px;
  background: #ffd54f;
  border: 3px solid #f9a825;
  border-radius: 50%;
}
.bulut {
  position: absolute;
  height: 18px;
  background: white;
  border-radius: 10px;
  animation: suzul 60s linear infinite;
}
.bulut.b1 {
  top: 26px;
  width: 80px;
  left: 10%;
}
.bulut.b2 {
  top: 60px;
  width: 56px;
  left: 55%;
  animation-duration: 80s;
}
@keyframes suzul {
  from { transform: translateX(-120px); }
  to { transform: translateX(1100px); }
}
.golet {
  position: absolute;
  left: 30%;
  bottom: 40px;
  width: 40%;
  height: 90px;
  background: #5fa8d3;
  border: 4px solid #3d7fa8;
  border-radius: 50%;
  box-shadow: inset 0 8px 0 rgba(255, 255, 255, 0.25);
}
.saz {
  position: absolute;
  bottom: 90px;
  width: 6px;
  height: 40px;
  background: #4e7d2a;
  border-radius: 3px;
}
.saz.s1 {
  left: 29%;
}
.saz.s2 {
  left: 70%;
  height: 30px;
}
.sahne-bos {
  position: absolute;
  inset: auto 0 140px 0;
  text-align: center;
  font-weight: bold;
  color: #2d2020;
  padding: 0 20px;
}

/* Dolaşan ördekler: sağa yürür, döner, geri gelir */
.gezgin {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation-name: gez;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  cursor: default;
}
@keyframes gez {
  0% { transform: translateX(0); }
  50% { transform: translateX(var(--mesafe)); }
  100% { transform: translateX(0); }
}
.yon {
  animation-name: don;
  animation-timing-function: steps(1);
  animation-iteration-count: infinite;
}
@keyframes don {
  0% { transform: scaleX(1); }
  50% { transform: scaleX(-1); }
}
.gezgin img {
  width: 56px;
  height: 56px;
  image-rendering: pixelated;
  animation: paytak 0.5s ease-in-out infinite;
}
@keyframes paytak {
  0%, 100% { transform: translateY(0) rotate(-3deg); }
  50% { transform: translateY(-2px) rotate(3deg); }
}
.isim {
  font-size: 0.65rem;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid #2d2020;
  border-radius: 6px;
  padding: 0 4px;
  margin-top: -4px;
  white-space: nowrap;
}

/* Liste */
.liste {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 14px;
  margin-top: 1.5rem;
}
.kart {
  display: flex;
  gap: 12px;
  align-items: center;
  background: white;
  border: 3px solid black;
  border-radius: 10px;
  padding: 10px;
}
.kart img {
  width: 72px;
  height: 72px;
  image-rendering: pixelated;
  background: #b9e08d;
  border: 2px solid black;
  border-radius: 8px;
}
.kart-ad {
  font-size: 1rem;
}
.kart p {
  margin: 0;
  font-size: 0.75rem;
  color: #555;
}

@media (max-width: 768px) {
  .unvan-kutu {
    grid-template-columns: 1fr auto;
  }
  .ilerleme {
    grid-column: 1 / -1;
  }
}
</style>
