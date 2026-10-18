<template>
  
  <div class="sayfa">
    <div class="baslik">
      <h2>🪦 Anı Defteri</h2>
      <p>Bakımını yapamadığın ördekler burada anılıyor.</p>
    </div>

    <p v-if="yukleniyor" class="bilgi">Yükleniyor...</p>
    <p v-else-if="hata" class="bilgi">{{ hata }}</p>

    <!-- Hiç ördek ölmediyse -->
    <div v-else-if="anilar.length === 0" class="bos">
      <img :src="ordekGorsel('yavru', 'mutlu', 'beyaz')" alt="Mutlu ördek" class="bos-img" />
      <p>Henüz hiçbir ördeğini kaybetmedin.<br />Böyle devam et! 💚</p>
    </div>

    <template v-else>
      <p class="sayac">
        Şimdiye kadar <strong>{{ anilar.length }}</strong> ördeğe veda ettin.
        En uzun yaşayan: <strong>{{ enUzunYasayan.ordek_adi }}</strong>
        ({{ yasMetni(enUzunYasayan.yasadigi_gun) }})
      </p>

      <div class="mezarlik">
        <div v-for="ani in anilar" :key="ani.ani_id" class="mezar">
          <img :src="gorsel(ani)" :alt="ani.ordek_adi" class="mezar-img" />
          <h4 class="mezar-ad">{{ ani.ordek_adi || 'İsimsiz' }}</h4>
          <p class="mezar-tarih">{{ tarihMetni(ani.dogum) }} – {{ tarihMetni(ani.olum) }}</p>
          <p class="mezar-yas">{{ yasMetni(ani.yasadigi_gun) }}</p>
          <p class="mezar-asama">{{ ASAMA_ADLARI[ani.asama] }} · Seviye {{ ani.ulastigi_seviye }}</p>
          <p v-if="!yumurtaMi(ani.asama)" class="mezar-asama">{{ RENK_ADLARI[ani.renk] }}</p>
          <p class="mezar-yazi">Huzur içinde yüzsün</p>
        </div>
      </div>
    </template>
  </div>

</template>

<script>
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import axios from 'axios'
import { ordekGorsel, yumurtaMi, ASAMA_ADLARI, RENK_ADLARI } from '@/utils/ordek'

export default {
  components: { Navbar, Footer },
  data() {
    return {
      ASAMA_ADLARI,
      RENK_ADLARI,
      yukleniyor: true,
      hata: '',
      anilar: [],
    }
  },
  computed: {
    enUzunYasayan() {
      return this.anilar.reduce((en, a) => (a.yasadigi_gun > en.yasadigi_gun ? a : en), this.anilar[0])
    },
  },
  methods: {
    ordekGorsel,
    yumurtaMi,
    // Ördeği en mutlu haliyle hatırlıyoruz
    gorsel(ani) {
      const hal = yumurtaMi(ani.asama) ? 'sicak' : 'mutlu'
      return ordekGorsel(ani.asama, hal, ani.renk)
    },
    tarihMetni(tarih) {
      return new Date(tarih + 'T00:00:00Z').toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      })
    },
    yasMetni(gun) {
      return gun < 1 ? '1 günden az yaşadı' : `${gun} gün yaşadı`
    },
    async anilariGetir() {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get('http://localhost:3000/aniDefteri', {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.anilar = res.data.anilar
      } catch (err) {
        console.error('Anı defteri hatası:', err)
        this.hata = err.response?.data?.mesaj || 'Anı defteri yüklenemedi.'
      } finally {
        this.yukleniyor = false
      }
    },
  },
  mounted() {
    this.anilariGetir()
  },
}
</script>

<style scoped>
.sayfa {
  font-family: monospace;
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1rem 3rem;
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
.sayac {
  text-align: center;
  margin-bottom: 2rem;
}

/* Hiç ölüm yoksa */
.bos {
  text-align: center;
  margin-top: 2rem;
}
.bos-img {
  width: 144px;
  image-rendering: pixelated;
}

/* Mezar taşları */
.mezarlik {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
}
.mezar {
  background: #d9d9d2;
  border: 4px solid black;
  border-radius: 90px 90px 10px 10px; /* üstü yuvarlak mezar taşı */
  box-shadow: 6px 6px 0 #9a9a90;
  padding: 28px 16px 16px;
  text-align: center;
}
.mezar-img {
  width: 96px;
  height: 96px;
  image-rendering: pixelated;
  filter: grayscale(1) sepia(0.3) opacity(0.85); /* eski fotoğraf gibi */
}
.mezar-ad {
  font-weight: bold;
  margin: 8px 0 4px;
}
.mezar-tarih,
.mezar-asama {
  font-size: 0.8rem;
  color: #555;
  margin: 2px 0;
}
.mezar-yas {
  font-weight: bold;
  margin: 6px 0;
}
.mezar-yazi {
  margin: 12px 0 0;
  padding-top: 8px;
  border-top: 2px dashed #9a9a90;
  font-size: 0.8rem;
  font-style: italic;
  color: #666;
}
</style>
