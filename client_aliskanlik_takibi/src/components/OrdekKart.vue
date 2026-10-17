<template>
  <div class="ordek-kart">
    <!-- Ördeğin adı -->
    <h4 class="ordek-adi">{{ ordek.ad || 'İsimsiz yumurta' }}</h4>
    <p class="ordek-yas">{{ yasMetni }}</p>

    <!-- Ördek görseli -->
    <div class="ordek-sahne" :class="ordek.ruh_hali">
      <img v-if="gorsel" :src="gorsel" :alt="asamaAdi" class="ordek-img" />
    </div>

    <!-- Aşama ve ruh hali -->
    <p class="durum">{{ asamaAdi }} · {{ ruhHaliMetni }}</p>

    <!-- Can barı -->
    <div class="bar-etiket">
      <span>❤️ Can</span><span>{{ kullanici.hp }}/100</span>
    </div>
    <div class="bar">
      <div class="bar-dolu" :style="{ width: kullanici.hp + '%', background: canRengi }"></div>
    </div>

    <!-- XP barı -->
    <div class="bar-etiket">
      <span>⭐ XP</span><span>{{ kullanici.xp }}/{{ SEVIYE_XP }}</span>
    </div>
    <div class="bar">
      <div class="bar-dolu xp" :style="{ width: xpYuzde + '%' }"></div>
    </div>

    <!-- Seviye ve unvan -->
    <p class="seviye">Seviye {{ kullanici.level }} · {{ kullanici.title }}</p>
    <p class="nickname">@{{ kullanici.nickname }}</p>
  </div>
</template>
<script>
import axios from 'axios'
import Swal from 'sweetalert2'

const SEVIYE_XP = 100 // backend'deki ordekService.js ile aynı olmalı

const ASAMA_ADLARI = {
  yumurta: '🥚 Yumurta',
  catlayan_yumurta: '🐣 Çatlayan yumurta',
  yavru: '🐤 Yavru ördek',
  genc: '🦆 Genç ördek',
  yetiskin: '🦆 Yetişkin ördek',
}

const RUH_HALLERI = {
  sicak: '🔥 Sıcacık',
  soguk: '🥶 Üşüyor',
  mutlu: '😊 Mutlu',
  yorgun: '😐 Yorgun',
  hasta: '🤒 Hasta',
}

export default {
  name: 'OrdekKart',
  data() {
    return {
      SEVIYE_XP,
      kullanici: { nickname: '', level: 1, hp: 100, xp: 0, title: '' },
      ordek: { ad: null, asama: 'yumurta', ruh_hali: 'sicak', dogum_tarihi: null },
      isimSoruluyor: false,
    }
  },
  computed: {
    gorsel() {
      return new URL(
        `../assets/ordek/${this.ordek.asama}_${this.ordek.ruh_hali}.png`,
        import.meta.url,
      ).href
    },
    asamaAdi() {
      return ASAMA_ADLARI[this.ordek.asama] || this.ordek.asama
    },
    ruhHaliMetni() {
      return RUH_HALLERI[this.ordek.ruh_hali] || this.ordek.ruh_hali
    },
    xpYuzde() {
      return Math.min(100, Math.round((this.kullanici.xp / SEVIYE_XP) * 100))
    },
    canRengi() {
      if (this.kullanici.hp >= 70) return '#4caf50'
      if (this.kullanici.hp >= 40) return '#ffb300'
      return '#e53935'
    },
    yasMetni() {
      if (!this.ordek.dogum_tarihi) return ''
      const gun = Math.floor((Date.now() - new Date(this.ordek.dogum_tarihi)) / 86400000)
      return gun === 0 ? 'Bugün doğdu' : `${gun} günlük`
    },
  },
  methods: {
    // kontrol = true ise backend günlük kontrolü (ceza/ölüm) yapar.
    // Sadece sayfa ilk açıldığında true gönderiyoruz.
    async getUserProfile(kontrol = false) {
      const token = localStorage.getItem('token')
      try {
        const res = await axios.get('http://localhost:3000/getUserInfo', {
          params: kontrol ? { kontrol: 1 } : {},
          headers: { Authorization: `Bearer ${token}` },
        })
        const eskiAd = this.ordek.ad
        this.kullanici = {
          nickname: res.data.nickname,
          level: res.data.level,
          hp: res.data.hp,
          xp: res.data.xp,
          title: res.data.title,
        }
        if (res.data.ordek) this.ordek = res.data.ordek

        // Günlük kontrol bildirimi
        const b = res.data.bildirim
        if (b && b.oldu) {
          await this.olumGoster(b.olenOrdek)
        } else if (b && b.ceza > 0) {
          await Swal.fire({
            title: `${this.ordek.ad || eskiAd || 'Ördeğin'} sen yokken ${b.ceza} can kaybetti 😢`,
            text:
              this.ordek.ruh_hali === 'hasta'
                ? 'Çok hasta! Bugün alışkanlıklarını yaparsan iyileşebilir.'
                : 'Alışkanlıklarını yapmadığın her gün ördeğin üzülüyor.',
            icon: 'warning',
            confirmButtonText: 'Ona bakacağım',
          })
        }

        if (!this.ordek.ad) this.isimSor()
      } catch (err) {
        console.error('Ördek bilgisi yüklenemedi:', err)
      }
    },

    olumGoster(olenOrdek) {
      return Swal.fire({
        title: `${olenOrdek || 'Ördeğin'} öldü 🪦`,
        text: 'Anı defterine eklendi. Yeni bir yumurtayla baştan başlıyorsun.',
        icon: 'error',
        confirmButtonText: 'Hoşça kal...',
      })
    },

    // Dashboard, görev/alışkanlık işaretlendikten sonra bunu çağırır.
    // sonuc: backend'in cevabı, varsayilan: özel bir olay yoksa gösterilecek mesaj
    async olayGoster(sonuc, varsayilan) {
      const eskiAsama = this.ordek.asama

      if (sonuc.oldu) {
        await this.olumGoster(sonuc.olenOrdek)
      } else if (sonuc.seviyeAtladi) {
        const buyudu = sonuc.asama !== eskiAsama
        await Swal.fire({
          title: buyudu ? `${this.ordek.ad} büyüdü! 🎉` : `Seviye ${sonuc.seviye}! ⭐`,
          text: buyudu ? `Artık bir ${ASAMA_ADLARI[sonuc.asama]}` : 'Böyle devam et!',
          icon: 'success',
          confirmButtonText: 'Yaşasın!',
        })
      } else if (varsayilan) {
        await Swal.fire(varsayilan)
      }

      await this.getUserProfile()
    },

    async isimSor() {
      if (this.isimSoruluyor) return
      this.isimSoruluyor = true

      const { value: ad } = await Swal.fire({
        title: '🥚 Yeni bir yumurtan var!',
        text: 'Ona bir isim ver:',
        input: 'text',
        inputPlaceholder: 'Örn: Pamuk',
        inputAttributes: { maxlength: 20 },
        confirmButtonText: 'İsim ver',
        allowOutsideClick: false,
        allowEscapeKey: false,
        inputValidator: (deger) => {
          if (!deger || !deger.trim()) return 'Yumurtanın bir isme ihtiyacı var 🥺'
        },
      })

      try {
        const token = localStorage.getItem('token')
        await axios.post(
          'http://localhost:3000/ordekIsimVer',
          { ad },
          { headers: { Authorization: `Bearer ${token}` } },
        )
        this.ordek.ad = ad.trim()
        Swal.fire({
          title: `Merhaba ${ad.trim()}! 🐣`,
          text: 'Alışkanlıklarını yaptıkça büyüyecek. Ona iyi bak!',
          icon: 'success',
        })
      } catch (err) {
        Swal.fire({
          title: 'Hata',
          text: err.response?.data?.mesaj || 'İsim kaydedilemedi.',
          icon: 'error',
        })
      } finally {
        this.isimSoruluyor = false
      }
    },
  },
  mounted() {
    this.getUserProfile(true) // sayfa açılınca günlük kontrolü yap
  },
}
</script>

<style scoped>
.ordek-kart {
  background: #8cc850;
  font-family: monospace;
  border: 4px solid black;
  box-shadow: 0 0 4px 4px #b4b4b4;
  color: white;
  padding: 20px;
  border-radius: 10px;
  width: 260px;
  text-align: center;
  margin-top: 3rem;
  margin-left: 1rem;
}
.ordek-adi {
  margin: 0;
  font-weight: bold;
  text-shadow: 2px 2px 0 #2d2020;
}
.ordek-yas {
  margin: 2px 0 10px;
  font-size: 0.85rem;
  opacity: 0.9;
}
.ordek-sahne {
  background: #b9e08d;
  border: 3px solid black;
  border-radius: 8px;
  padding: 8px 0;
}
.ordek-img {
  width: 144px;
  height: 144px;
  image-rendering: pixelated; /* pikseller bulanıklaşmasın */
  animation: zipla 1.6s ease-in-out infinite;
}
/* Ruh haline göre hareket: mutluyken zıplar, yorgun/hastayken sallanır */
.ordek-sahne.yorgun .ordek-img,
.ordek-sahne.soguk .ordek-img {
  animation: sallan 3s ease-in-out infinite;
}
.ordek-sahne.hasta .ordek-img {
  animation: sallan 4s ease-in-out infinite;
  filter: saturate(0.8);
}
@keyframes zipla {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
@keyframes sallan {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}
.durum {
  margin: 10px 0;
  font-weight: bold;
}
.bar-etiket {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  margin-top: 6px;
}
.bar {
  height: 14px;
  background: #3d3030;
  border: 2px solid black;
  border-radius: 3px;
  overflow: hidden;
}
.bar-dolu {
  height: 100%;
  transition: width 0.5s ease;
}
.bar-dolu.xp {
  background: #42a5f5;
}
.seviye {
  margin: 12px 0 2px;
  font-weight: bold;
}
.nickname {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.9;
}
</style>