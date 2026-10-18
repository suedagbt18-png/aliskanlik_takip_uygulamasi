<template>
  <div class="panel">
    <!-- Sol: ördek -->
    <aside class="ordek-alani">
      <OrdekKart ref="ordekKart"></OrdekKart>
    </aside>

    <!-- Sağ: bugün + listeler -->
    <section class="icerik-alani">
      <!-- Bugün şeridi -->
      <div class="bugun">
        <div class="bugun-ust">
          <div>
            <h4 class="selam">{{ selam }}</h4>
            <p class="bugun-metin">{{ bugunMetni }}</p>
          </div>
          <div class="bugun-sayilar">
            <span class="sayi-kutu">🔁 {{ yapilanAliskanlik }}/{{ aliskanliklar.length }}</span>
            <span class="sayi-kutu">⏳ {{ gorevler.length }} görev</span>
          </div>
        </div>
        <div class="bar" :title="`Bugün ${yapilanAliskanlik}/${aliskanliklar.length} alışkanlık tamamlandı`">
          <div class="bar-dolu" :style="{ width: bugunYuzde + '%' }"></div>
        </div>
      </div>

      <div class="listeler">
        <!-- ALIŞKANLIKLAR -->
        <div class="kart">
          <div class="kart-ust">
            <h5 class="kart-baslik">🔁 Bugünün alışkanlıkları</h5>
            <button class="ekle-btn" @click="formAc('aliskanlik')">
              {{ acikForm === 'aliskanlik' ? '✕ Kapat' : '+ Ekle' }}
            </button>
          </div>

          <form v-if="acikForm === 'aliskanlik'" class="ekle-form" @submit.prevent="aliskanlikEkle">
            <input v-model.trim="yeniAliskanlik.baslik" class="form-control" placeholder="Örn: 20 sayfa kitap oku" maxlength="50" />
            <input v-model.trim="yeniAliskanlik.not" class="form-control" placeholder="Not (isteğe bağlı)" maxlength="100" />
            <select v-model="yeniAliskanlik.puan" class="form-select">
              <option v-for="z in ZORLUKLAR" :key="z.puan" :value="z.puan">{{ z.ad }}</option>
            </select>
            <select v-model="yeniAliskanlik.etiket" class="form-select">
              <option v-for="e in ETIKETLER" :key="e" :value="e">{{ e }}</option>
            </select>
            <button type="submit" class="btn btn-dark">Ekle</button>
          </form>

          <p v-if="aliskanliklar.length === 0" class="bos">
            Henüz alışkanlığın yok. Her gün yapmak istediğin bir şey ekle 🐣
          </p>

          <div v-for="a in siraliAliskanliklar" :key="a.aliskanlik_id" class="oge" :class="'durum-' + a.yapildi_mi">
            <div class="oge-bilgi">
              <div class="oge-ust">
                <span class="oge-ikon">{{ DURUM_IKON[a.yapildi_mi] }}</span>
                <strong>{{ a.aliskanlik_title }}</strong>
                <span v-if="a.seri > 0" class="seri" :title="`${a.seri} gündür devam ediyor`">🔥 {{ a.seri }}</span>
              </div>
              <p v-if="a.aliskanlik_body" class="oge-not">{{ a.aliskanlik_body }}</p>
              <div class="oge-alt">
                <span class="etiket-cip">{{ a.aliskanlik_etiketi }}</span>
                <span class="xp">{{ a.aliskanlik_puani }} XP</span>
                <span v-if="a.yapildi_mi === 1" class="durum-yazi tamam">Bugün tamamlandı</span>
                <span v-if="a.yapildi_mi === 2" class="durum-yazi olmadi">Bugün yapılmadı</span>
              </div>
            </div>
            <div class="islemler">
              <template v-if="a.yapildi_mi === 0">
                <button class="islem tamam" title="Tamamladım" @click="aliskanlikIsaretle(a, true)">✅</button>
                <button class="islem olmadi" title="Yapamadım" @click="aliskanlikIsaretle(a, false)">❌</button>
              </template>
              <button class="islem sil" title="Sil" @click="sil('aliskanlik', a)">🗑️</button>
            </div>
          </div>
        </div>

        <!-- GÖREVLER -->
        <div class="kart">
          <div class="kart-ust">
            <h5 class="kart-baslik">✅ Bekleyen görevler</h5>
            <button class="ekle-btn" @click="formAc('gorev')">
              {{ acikForm === 'gorev' ? '✕ Kapat' : '+ Ekle' }}
            </button>
          </div>

          <form v-if="acikForm === 'gorev'" class="ekle-form" @submit.prevent="gorevEkle">
            <input v-model.trim="yeniGorev.baslik" class="form-control" placeholder="Örn: Fizik ödevini teslim et" maxlength="50" />
            <input v-model.trim="yeniGorev.not" class="form-control" placeholder="Not (isteğe bağlı)" maxlength="100" />
            <select v-model="yeniGorev.puan" class="form-select">
              <option v-for="z in ZORLUKLAR" :key="z.puan" :value="z.puan">{{ z.ad }}</option>
            </select>
            <select v-model="yeniGorev.etiket" class="form-select">
              <option v-for="e in ETIKETLER" :key="e" :value="e">{{ e }}</option>
            </select>
            <button type="submit" class="btn btn-dark">Ekle</button>
          </form>

          <p v-if="gorevler.length === 0" class="bos">Bekleyen görevin yok. Harika! ✨</p>

          <div v-for="g in gorevler" :key="g.gorev_id" class="oge durum-0">
            <div class="oge-bilgi">
              <div class="oge-ust">
                <span class="oge-ikon">⏳</span>
                <strong>{{ g.gorev_title }}</strong>
              </div>
              <p v-if="g.gorev_body" class="oge-not">{{ g.gorev_body }}</p>
              <div class="oge-alt">
                <span class="etiket-cip">{{ g.gorev_etiketi }}</span>
                <span class="xp">{{ g.gorev_puani }} XP</span>
              </div>
            </div>
            <div class="islemler">
              <button class="islem tamam" title="Tamamladım" @click="gorevIsaretle(g, true)">✅</button>
              <button class="islem olmadi" title="Yapamadım" @click="gorevIsaretle(g, false)">❌</button>
              <button class="islem sil" title="Sil" @click="sil('gorev', g)">🗑️</button>
            </div>
          </div>

          <RouterLink to="/gorevler" class="tumu">Tüm görevler ve geçmiş →</RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import OrdekKart from '@/components/OrdekKart.vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const API = 'http://localhost:3000'

const ZORLUKLAR = [
  { puan: '5', ad: 'Kolay · 5 XP' },
  { puan: '10', ad: 'Orta · 10 XP' },
  { puan: '15', ad: 'Zor · 15 XP' },
]
const ETIKETLER = ['İş', 'Okul', 'Egzersiz', 'Sağlık + Zindelik', 'Ev işleri', 'Kişisel Gelişim']
const DURUM_IKON = { 0: '⏳', 1: '✅', 2: '❌' }

function bosForm() {
  return { baslik: '', not: '', puan: '10', etiket: 'Kişisel Gelişim' }
}
function yetki() {
  return { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
}
function hataGoster(err, varsayilan) {
  Swal.fire({ title: 'Hata', text: err.response?.data?.mesaj || varsayilan, icon: 'error' })
}

export default {
  components: { OrdekKart },
  data() {
    return {
      ZORLUKLAR,
      ETIKETLER,
      DURUM_IKON,
      aliskanliklar: [],
      gorevler: [],
      acikForm: null,
      yeniAliskanlik: bosForm(),
      yeniGorev: bosForm(),
    }
  },
  computed: {
    // Bekleyenler üstte, işaretlenenler altta
    siraliAliskanliklar() {
      return [...this.aliskanliklar].sort((a, b) => (a.yapildi_mi === 0 ? 0 : 1) - (b.yapildi_mi === 0 ? 0 : 1))
    },
    yapilanAliskanlik() {
      return this.aliskanliklar.filter((a) => a.yapildi_mi === 1).length
    },
    bugunYuzde() {
      if (this.aliskanliklar.length === 0) return 0
      return Math.round((this.yapilanAliskanlik / this.aliskanliklar.length) * 100)
    },
    selam() {
      const saat = new Date().getHours()
      if (saat < 6) return 'İyi geceler 🌙'
      if (saat < 12) return 'Günaydın ☀️'
      if (saat < 18) return 'İyi günler 🌤️'
      return 'İyi akşamlar 🌆'
    },
    bugunMetni() {
      const toplam = this.aliskanliklar.length
      if (toplam === 0) return 'İlk alışkanlığını ekleyerek başla.'
      const kalan = this.aliskanliklar.filter((a) => a.yapildi_mi === 0).length
      if (kalan === 0) return 'Bugünün bütün alışkanlıkları işaretlendi. Ördeğin seninle gurur duyuyor 🎉'
      return `Bugün ${kalan} alışkanlık seni bekliyor.`
    },
  },
  methods: {
    formAc(tur) {
      this.acikForm = this.acikForm === tur ? null : tur
    },

    async listeleriGetir() {
      try {
        const [a, g] = await Promise.all([
          axios.get(`${API}/getMyAliskanlik`, yetki()),
          axios.get(`${API}/getMyGorev`, yetki()),
        ])
        this.aliskanliklar = a.data.aliskanliklar || []
        this.gorevler = g.data.gorevler || []
      } catch (err) {
        console.error('Liste hatası:', err)
      }
    },

    async aliskanlikEkle() {
      const y = this.yeniAliskanlik
      if (!y.baslik) return Swal.fire({ title: 'Alışkanlığın bir adı olmalı', icon: 'warning' })
      try {
        await axios.post(
          `${API}/addAliskanlik`,
          { aliskanlik_title: y.baslik, aliskanlik_body: y.not, aliskanlik_puani: y.puan, aliskanlik_etiketi: y.etiket },
          yetki(),
        )
        this.yeniAliskanlik = bosForm()
        this.acikForm = null
        await this.listeleriGetir()
      } catch (err) {
        hataGoster(err, 'Alışkanlık eklenemedi.')
      }
    },

    async gorevEkle() {
      const y = this.yeniGorev
      if (!y.baslik) return Swal.fire({ title: 'Görevin bir adı olmalı', icon: 'warning' })
      try {
        await axios.post(
          `${API}/addGorev`,
          { gorev_title: y.baslik, gorev_body: y.not, gorev_puani: y.puan, gorev_etiketi: y.etiket },
          yetki(),
        )
        this.yeniGorev = bosForm()
        this.acikForm = null
        await this.listeleriGetir()
      } catch (err) {
        hataGoster(err, 'Görev eklenemedi.')
      }
    },

    async aliskanlikIsaretle(a, basarili) {
      try {
        const yol = basarili ? 'aliskanlikBasarili' : 'aliskanlikBasarisiz'
        const res = await axios.post(`${API}/${yol}`, { aliskanlik_id: a.aliskanlik_id }, yetki())
        await this.listeleriGetir()
        const d = res.data
        this.$refs.ordekKart.olayGoster(
          d,
          basarili
            ? {
                title: d.seriBonusu ? `🔥 ${d.seri} günlük seri! +${d.seriBonusu} can bonusu` : `Tebrikler! 🔥 ${d.seri} gün`,
                text: d.seriBonusu
                  ? `Harika gidiyorsun! Toplam +${10 + d.seriBonusu} can kazandın.`
                  : 'Alışkanlığını tamamladın, ördeğin +10 can kazandı.',
                icon: 'success',
              }
            : { title: 'Biraz daha gayret.', text: d.mesaj, icon: 'error' },
        )
      } catch (err) {
        hataGoster(err, 'Bir şeyler ters gitti.')
      }
    },

    async gorevIsaretle(g, basarili) {
      try {
        const yol = basarili ? 'gorevBasarili' : 'gorevBasarisiz'
        const res = await axios.post(`${API}/${yol}`, { gorev_id: g.gorev_id }, yetki())
        await this.listeleriGetir()
        this.$refs.ordekKart.olayGoster(
          res.data,
          basarili
            ? { title: 'Tebrikler!', text: `+${g.gorev_puani} XP kazandın.`, icon: 'success' }
            : { title: 'Biraz daha gayret.', text: res.data.mesaj, icon: 'error' },
        )
      } catch (err) {
        hataGoster(err, 'Bir şeyler ters gitti.')
      }
    },

    async sil(tur, oge) {
      const baslik = tur === 'aliskanlik' ? oge.aliskanlik_title : oge.gorev_title
      const onay = await Swal.fire({
        title: `"${baslik}" silinsin mi?`,
        text: tur === 'aliskanlik' ? 'Serisi ve geçmişi de silinecek.' : 'Bu işlem geri alınamaz.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Evet, sil',
        cancelButtonText: 'Vazgeç',
        confirmButtonColor: '#e53935',
      })
      if (!onay.isConfirmed) return
      try {
        if (tur === 'aliskanlik') {
          await axios.delete(`${API}/deleteAliskanlik`, { ...yetki(), data: { aliskanlik_id: oge.aliskanlik_id } })
        } else {
          await axios.delete(`${API}/deleteGorev`, { ...yetki(), data: { gorev_id: oge.gorev_id } })
        }
        await this.listeleriGetir()
      } catch (err) {
        hataGoster(err, 'Silinemedi.')
      }
    },
  },
  mounted() {
    this.listeleriGetir()
  },
}
</script>

<style scoped>
/* Ana düzen: geniş ekranda ördek | alışkanlıklar | görevler */
.panel {
  display: grid;
  grid-template-columns: 290px 1fr;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 16px;
  font-family: monospace;
}
.ordek-alani {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
.icerik-alani {
  min-width: 0; /* uzun metinler sütunu taşırmasın */
  margin-top: 3rem;
}
.listeler {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
  align-items: start;
}

/* Bugün şeridi */
.bugun {
  background: #8cc850;
  color: white;
  border: 4px solid black;
  border-radius: 10px;
  padding: 14px 18px;
}
.bugun-ust {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.selam {
  font-weight: bold;
  margin: 0;
  text-shadow: 2px 2px 0 #2d2020;
}
.bugun-metin {
  margin: 4px 0 0;
  font-size: 0.9rem;
}
.bugun-sayilar {
  display: flex;
  gap: 8px;
}
.sayi-kutu {
  background: white;
  color: #2d2020;
  border: 3px solid black;
  border-radius: 8px;
  padding: 2px 10px;
  font-weight: bold;
  white-space: nowrap;
}
.bar {
  height: 16px;
  background: #3d3030;
  border: 2px solid black;
  border-radius: 4px;
  overflow: hidden;
}
.bar-dolu {
  height: 100%;
  background: #ffd54f;
  transition: width 0.5s ease;
}

/* Kartlar */
.kart {
  background: white;
  border: 4px solid black;
  border-radius: 10px;
  padding: 14px 16px;
}
.kart-ust {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.kart-baslik {
  font-weight: bold;
  margin: 0;
}
.ekle-btn {
  background: #8cc850;
  color: white;
  border: 3px solid black;
  border-radius: 8px;
  font-weight: bold;
  padding: 2px 12px;
  white-space: nowrap;
}
.ekle-btn:hover {
  background: #7ab840;
}
.bos {
  color: #777;
  text-align: center;
  margin: 1.5rem 0;
}

/* Ekleme formu */
.ekle-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-bottom: 14px;
  padding: 10px;
  background: #f3f9ec;
  border: 2px dashed #8cc850;
  border-radius: 8px;
}
.ekle-form input:first-child {
  grid-column: 1 / -1;
}
.ekle-form .btn {
  grid-column: 1 / -1;
}
.ekle-form .form-control,
.ekle-form .form-select {
  border: 2px solid black;
  font-family: monospace;
  font-size: 0.85rem;
}

/* Satırlar */
.oge {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  border: 2px solid black;
  border-left-width: 8px;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;
  background: #fafaf7;
}
.oge.durum-0 { border-left-color: #ffb300; }
.oge.durum-1 { border-left-color: #4caf50; background: #f1f8ec; }
.oge.durum-2 { border-left-color: #e53935; background: #fdf1f1; }
.oge-bilgi {
  min-width: 0;
}
.oge-ust {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}
.oge-ust strong {
  overflow-wrap: anywhere;
}
.seri {
  background: #ffd54f;
  border: 2px solid black;
  border-radius: 8px;
  padding: 0 6px;
  font-size: 0.75rem;
  font-weight: bold;
}
.oge-not {
  margin: 2px 0 0 24px;
  font-size: 0.8rem;
  color: #666;
}
.oge-alt {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  margin: 6px 0 0 24px;
  font-size: 0.75rem;
}
.etiket-cip {
  border: 1px solid #999;
  border-radius: 10px;
  padding: 0 8px;
  color: #555;
}
.xp {
  font-weight: bold;
  color: #1e6fd9;
}
.durum-yazi.tamam { color: #2e7d32; font-weight: bold; }
.durum-yazi.olmadi { color: #c62828; font-weight: bold; }
.islemler {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
.islem {
  border: 2px solid black;
  background: white;
  border-radius: 6px;
  width: 36px;
  height: 36px;
  transition: transform 0.15s;
}
.islem:hover { transform: scale(1.12); }
.islem.tamam:hover { background: #d9f2d0; }
.islem.olmadi:hover { background: #fbd9d9; }
.islem.sil { opacity: 0.6; }
.islem.sil:hover { opacity: 1; }
.tumu {
  display: block;
  text-align: right;
  margin-top: 6px;
  font-size: 0.85rem;
  color: #2d2020;
  font-weight: bold;
}

/* ---------- Responsive ---------- */

/* Orta ekran: listeler alt alta */
@media (max-width: 1199px) {
  .listeler {
    grid-template-columns: 1fr;
  }
}

/* Tablet ve telefon: her şey tek sütun */
@media (max-width: 767px) {
  .panel {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .icerik-alani {
    margin-top: 1.5rem;
  }
  .ekle-form {
    grid-template-columns: 1fr;
  }
}

/* Küçük telefon: butonlar satırın altına insin */
@media (max-width: 480px) {
  .oge {
    flex-direction: column;
    align-items: stretch;
  }
  .islemler {
    justify-content: flex-end;
  }
  .oge-not,
  .oge-alt {
    margin-left: 0;
  }
}
</style>