<template>
  <div class="ordek-kart" v-if="yuklendi">
    <!-- Ördeğin adı -->
    <h4 class="ordek-adi">{{ ordek.ad || 'İsimsiz yumurta' }}</h4>
    <p class="ordek-yas">{{ yasMetni }}</p>

    <!-- Ördek görseli -->
    <div class="ordek-sahne" :class="ordek.ruh_hali">
      <img :src="gorsel" :alt="asamaAdi" class="ordek-img" />
    </div>

    <!-- Aşama ve ruh hali -->
    <p class="durum">{{ asamaAdi }} · {{ ruhHaliMetni }}</p>
    <p v-if="!yumurta" class="renk-adi">{{ RENK_ADLARI[ordek.renk] }}</p>

    <!-- Yetişkin olunca: tören butonu -->
    <button v-if="ordek.asama === 'yetiskin'" class="ciftlik-btn" @click="ciftligeGonder">
      🏡 Çiftliğe gönder
    </button>

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

    <!-- Seviye, unvan, çiftlik -->
    <p class="seviye">Seviye {{ kullanici.level }}</p>
    <p class="unvan">🏅 {{ kullanici.title }} · 🏡 {{ kullanici.ciftlikSayisi }}</p>
    <p class="nickname">Bakıcısı: @{{ kullanici.nickname }}</p>
  </div>
</template>

<script>
import axios from 'axios'
import Swal from 'sweetalert2'
import { ordekGorsel, yumurtaMi, ASAMA_ADLARI, RUH_HALLERI, RENK_ADLARI, kacis } from '@/utils/ordek'

const API = 'http://localhost:3000'
const SEVIYE_XP = 100 // backend'deki ordekService.js ile aynı olmalı

function yetki() {
  return { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
}

export default {
  name: 'OrdekKart',
  data() {
    return {
      SEVIYE_XP,
      RENK_ADLARI,
      yuklendi: false,
      kullanici: { nickname: '', level: 1, hp: 100, xp: 0, title: '', ciftlikSayisi: 0 },
      ordek: { ad: null, asama: 'yumurta', ruh_hali: 'sicak', renk: 'beyaz', dogum_tarihi: null },
      isimSoruluyor: false,
    }
  },
  computed: {
    gorsel() {
      return ordekGorsel(this.ordek.asama, this.ordek.ruh_hali, this.ordek.renk)
    },
    yumurta() {
      return yumurtaMi(this.ordek.asama)
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
    // Görseli HTML içinde göstermek için (Swal pencereleri)
    resimHtml(src) {
      return `<img src="${src}" style="width:120px;height:120px;image-rendering:pixelated;background:#b9e08d;border:3px solid black;border-radius:8px">`
    },

    // kontrol = true ise backend günlük kontrolü (ceza/ölüm) yapar.
    // Sadece sayfa ilk açıldığında true gönderiyoruz.
    async getUserProfile(kontrol = false) {
      try {
        const res = await axios.get(`${API}/getUserInfo`, {
          ...yetki(),
          params: kontrol ? { kontrol: 1 } : {},
        })
        const eskiAd = this.ordek.ad
        this.yuklendi = true
        this.kullanici = {
          nickname: res.data.nickname,
          level: res.data.level,
          hp: res.data.hp,
          xp: res.data.xp,
          title: res.data.title,
          ciftlikSayisi: res.data.ciftlikSayisi ?? 0,
        }
        if (res.data.ordek) this.ordek = res.data.ordek

        // Günlük kontrol bildirimi
        const b = res.data.bildirim
        if (b && b.oldu) {
          await this.olumGoster(b.olenOrdek)
        } else if (b && b.ceza > 0) {
          await Swal.fire({
            title: `${kacis(this.ordek.ad || eskiAd || 'Ördeğin')} sen yokken ${b.ceza} can kaybetti 😢`,
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
        title: `${kacis(olenOrdek || 'Ördeğin')} öldü 🪦`,
        text: 'Anı defterine eklendi. Yeni bir yumurtayla baştan başlıyorsun.',
        icon: 'error',
        confirmButtonText: 'Hoşça kal...',
      })
    },

    // Dashboard ve Görevler sayfası, bir şey işaretlendikten sonra bunu çağırır.
    // sonuc: backend'in cevabı, varsayilan: özel bir olay yoksa gösterilecek mesaj
    async olayGoster(sonuc, varsayilan) {
      const eskiAsama = this.ordek.asama

      if (sonuc.oldu) {
        await this.olumGoster(sonuc.olenOrdek)
        await this.getUserProfile() // ad boş geleceği için isim penceresi açılır
        return
      }

      await this.getUserProfile() // yeni aşama/renk bilgisi gelsin
      const ad = kacis(this.ordek.ad)
      const yeniAsama = this.ordek.asama

      if (sonuc.seviyeAtladi && yumurtaMi(eskiAsama) && !yumurtaMi(yeniAsama)) {
        // Sürpriz anı: yumurtadan ne çıktı?
        await Swal.fire({
          title: `🐣 ${ad} yumurtadan çıktı!`,
          html: `${this.resimHtml(this.gorsel)}<p style="margin-top:12px">Bu bir <b>${RENK_ADLARI[this.ordek.renk]}</b>!</p>`,
          confirmButtonText: 'Merhaba küçük!',
        })
      } else if (sonuc.seviyeAtladi && yeniAsama !== eskiAsama) {
        await Swal.fire({
          title: `${ad} büyüdü! 🎉`,
          html:
            `${this.resimHtml(this.gorsel)}<p style="margin-top:12px">Artık bir ${ASAMA_ADLARI[yeniAsama]}</p>` +
            (yeniAsama === 'yetiskin' ? '<p><b>Onu çiftliğe gönderebilirsin 🏡</b></p>' : ''),
          confirmButtonText: 'Yaşasın!',
        })
      } else if (sonuc.seviyeAtladi) {
        await Swal.fire({
          title: `Seviye ${sonuc.seviye}! ⭐`,
          text: 'Böyle devam et!',
          icon: 'success',
          confirmButtonText: 'Yaşasın!',
        })
      } else if (varsayilan) {
        await Swal.fire(varsayilan)
      }
    },

    // Tören: yetişkin ördeği çiftliğe gönder
    async ciftligeGonder() {
      const ad = kacis(this.ordek.ad)
      const onay = await Swal.fire({
        title: `${ad} çiftliğe gitmeye hazır! 🏡`,
        html:
          `${this.resimHtml(this.gorsel)}` +
          `<p style="margin-top:12px">Onu yumurtadan yetişkinliğe kadar büyüttün.</p>` +
          `<p>Çiftliğe gönderdiğinde yeni bir yumurtayla başlayacaksın.<br>Alışkanlık serilerin korunacak.</p>`,
        showCancelButton: true,
        confirmButtonText: '🏡 Çiftliğe gönder',
        cancelButtonText: 'Biraz daha kalsın',
        confirmButtonColor: '#4caf50',
      })
      if (!onay.isConfirmed) return

      try {
        const res = await axios.post(`${API}/ciftligeGonder`, {}, yetki())
        const d = res.data
        await Swal.fire({
          title: `🎉 ${kacis(d.ordek_adi)} çiftliğe katıldı!`,
          html:
            `<p><b>${d.buyume_gunu}</b> günde büyüttün. Harika bir bakıcısın!</p>` +
            `<p>Çiftliğinde artık <b>${d.ciftlikSayisi}</b> ördek var.<br>Unvanın: <b>🏅 ${d.unvan}</b></p>`,
          icon: 'success',
          confirmButtonText: 'Yaşasın!',
        })
        await this.getUserProfile() // ad boş → yeni yumurtaya isim penceresi
      } catch (err) {
        Swal.fire({
          title: 'Hata',
          text: err.response?.data?.mesaj || 'Çiftliğe gönderilemedi.',
          icon: 'error',
        })
      }
    },

    async isimSor() {
      if (this.isimSoruluyor) return
      this.isimSoruluyor = true

      const { value: ad } = await Swal.fire({
        title: '🥚 Yeni bir yumurtan var!',
        html: `${this.resimHtml(ordekGorsel('yumurta', 'sicak'))}<p style="margin-top:12px">İçinden hangi renk ördek çıkacak, kimse bilmiyor 🎁<br>Ona bir isim ver:</p>`,
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
        await axios.post(`${API}/ordekIsimVer`, { ad }, yetki())
        this.ordek.ad = ad.trim()
        Swal.fire({
          title: `Merhaba ${kacis(ad.trim())}! 🐣`,
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
  margin: 3rem auto 0;
  max-width: 100%;
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
  margin: 10px 0 0;
  font-weight: bold;
}
.renk-adi {
  margin: 2px 0 0;
  font-size: 0.8rem;
  opacity: 0.95;
}
.ciftlik-btn {
  margin-top: 10px;
  width: 100%;
  background: #ffd54f;
  color: #2d2020;
  border: 3px solid black;
  border-radius: 8px;
  font-weight: bold;
  padding: 6px;
  font-family: monospace;
  animation: parilda 1.5s ease-in-out infinite;
}
.ciftlik-btn:hover {
  background: #ffca28;
}
@keyframes parilda {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 213, 79, 0.9); }
  50% { box-shadow: 0 0 0 6px rgba(255, 213, 79, 0); }
}
.bar-etiket {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  margin-top: 10px;
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
.unvan {
  margin: 0 0 4px;
  font-size: 0.9rem;
}
.nickname {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.9;
}
/* Telefonda daha kompakt */
@media (max-width: 767px) {
  .ordek-kart {
    margin-top: 1.5rem;
    padding: 14px;
  }
  .ordek-img {
    width: 96px;
    height: 96px;
  }
}
</style>
