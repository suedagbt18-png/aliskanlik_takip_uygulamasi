<template>
  <div class="row justify-content-center sayfa">
    <div class="col-lg-3 d-flex justify-content-center">
      <OrdekKart ref="ordekKart"></OrdekKart>
    </div>

    <div class="col-lg-8">
      <p v-if="yukleniyor" class="bilgi">Yükleniyor...</p>
      <p v-else-if="hata" class="bilgi">{{ hata }}</p>

      <template v-else>
        <!-- 1. Özet kutucukları -->
        <div class="ozet">
          <div class="kutucuk">
            <span class="kutucuk-etiket">⏳ Bekleyen</span>
            <span class="kutucuk-sayi">{{ ozet.bekleyen }}</span>
          </div>
          <div class="kutucuk">
            <span class="kutucuk-etiket">✅ Tamamlanan</span>
            <span class="kutucuk-sayi">{{ ozet.tamamlanan }}</span>
          </div>
          <div class="kutucuk">
            <span class="kutucuk-etiket">⭐ Kazanılan XP</span>
            <span class="kutucuk-sayi">{{ ozet.kazanilanXP }}</span>
          </div>
          <div class="kutucuk">
            <span class="kutucuk-etiket">🎯 Başarı oranı</span>
            <span class="kutucuk-sayi">
              {{ ozet.basariOrani === null ? '—' : '%' + ozet.basariOrani }}
            </span>
          </div>
        </div>

        <!-- 2. Etiketlere göre dağılım -->
        <div v-if="etiketler.length" class="kart">
          <div class="kart-ust">
            <h5 class="kart-baslik">Etiketlere göre</h5>
            <div class="lejant">
              <span><i class="renk tamam"></i>✅ Tamamlanan</span>
              <span><i class="renk olmadi"></i>❌ Yapılmayan</span>
            </div>
          </div>
          <div v-for="e in etiketler" :key="e.etiket" class="etiket-satir">
            <span class="etiket-ad">{{ e.etiket }}</span>
            <div class="cubuk-alan">
              <div
                class="cubuk"
                :style="{ width: cubukGenislik(e) + '%' }"
                :title="`${e.etiket}: ${e.tamamlanan} tamamlandı, ${e.yapilmayan} yapılmadı, ${e.bekleyen} bekliyor`"
              >
                <div v-if="e.tamamlanan" class="parca tamam" :style="{ flex: e.tamamlanan }"></div>
                <div v-if="e.yapilmayan" class="parca olmadi" :style="{ flex: e.yapilmayan }"></div>
              </div>
            </div>
            <span class="etiket-sayi">✅ {{ e.tamamlanan }} · ❌ {{ e.yapilmayan }}</span>
          </div>
        </div>

        <!-- 3. Görev listesi -->
        <div class="kart">
          <!-- Sekmeler -->
          <div class="sekmeler">
            <button
              v-for="s in SEKMELER"
              :key="s.id"
              class="sekme"
              :class="{ aktif: sekme === s.id }"
              @click="sekme = s.id"
            >
              {{ s.ad }} <span class="sekme-sayi">{{ sekmeSayisi(s.id) }}</span>
            </button>
          </div>

          <!-- Etiket filtresi -->
          <div class="filtre">
            <button class="cip" :class="{ aktif: filtre === null }" @click="filtre = null">Hepsi</button>
            <button
              v-for="e in etiketler"
              :key="e.etiket"
              class="cip"
              :class="{ aktif: filtre === e.etiket }"
              @click="filtre = e.etiket"
            >
              {{ e.etiket }}
            </button>
          </div>

          <!-- Hızlı ekleme (sadece Bekleyen sekmesinde) -->
          <form v-if="sekme === 0" class="hizli-ekle" @submit.prevent="gorevEkle">
            <input v-model.trim="yeni.gorev_title" class="form-control" placeholder="Yeni görev..." maxlength="50" />
            <input v-model.trim="yeni.gorev_body" class="form-control not-alani" placeholder="Not (isteğe bağlı)" maxlength="100" />
            <select v-model="yeni.gorev_puani" class="form-select">
              <option value="5">Kolay · 5 XP</option>
              <option value="10">Orta · 10 XP</option>
              <option value="15">Zor · 15 XP</option>
            </select>
            <select v-model="yeni.gorev_etiketi" class="form-select">
              <option v-for="e in ETIKETLER" :key="e" :value="e">{{ e }}</option>
            </select>
            <button type="submit" class="btn btn-dark">Ekle</button>
          </form>

          <!-- Liste -->
          <p v-if="gosterilenGruplar.length === 0" class="bilgi bos-liste">{{ BOS_MESAJ[sekme] }}</p>

          <div v-for="grup in gosterilenGruplar" :key="grup.baslik" class="grup">
            <h6 v-if="grup.baslik" class="grup-baslik">{{ grup.baslik }}</h6>

            <div v-for="g in grup.gorevler" :key="g.gorev_id" class="gorev" :class="'durum-' + g.yapildi_mi">
              <div class="gorev-bilgi">
                <div class="gorev-ust">
                  <span class="gorev-ikon">{{ DURUM_IKON[g.yapildi_mi] }}</span>
                  <strong>{{ g.gorev_title }}</strong>
                </div>
                <p v-if="g.gorev_body" class="gorev-not">{{ g.gorev_body }}</p>
                <div class="gorev-alt">
                  <span class="etiket-cip">{{ g.gorev_etiketi }}</span>
                  <span class="xp">{{ g.gorev_puani }} XP</span>
                  <span v-if="g.yapildi_mi === 0 && g.olusturma" class="zaman">
                    {{ eklenmeMetni(g.olusturma) }}
                  </span>
                  <span v-if="g.yapildi_mi !== 0 && g.isaret_saati" class="zaman">🕒 {{ g.isaret_saati }}</span>
                </div>
              </div>

              <!-- Bekleyen görevler için işlem butonları -->
              <div v-if="g.yapildi_mi === 0" class="islemler">
                <button class="islem tamam" title="Tamamladım" @click="isaretle(g, true)">✅</button>
                <button class="islem olmadi" title="Yapamadım" @click="isaretle(g, false)">❌</button>
                <button class="islem sil" title="Sil" @click="sil(g)">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import OrdekKart from '@/components/OrdekKart.vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const API = 'http://localhost:3000'

const SEKMELER = [
  { id: 0, ad: '⏳ Bekleyen' },
  { id: 1, ad: '✅ Tamamlanan' },
  { id: 2, ad: '❌ Yapılmayan' },
]
const DURUM_IKON = { 0: '⏳', 1: '✅', 2: '❌' }
const BOS_MESAJ = {
  0: 'Bekleyen görevin yok. Yukarıdan yeni bir tane ekleyebilirsin ✨',
  1: 'Henüz tamamlanan görev yok.',
  2: 'Yapılmayan görev yok, harika! 🎉',
}
const ETIKETLER = ['İş', 'Okul', 'Egzersiz', 'Sağlık + Zindelik', 'Ev işleri', 'Kişisel Gelişim']

function tarihNesnesi(tarih) {
  return new Date(tarih + 'T00:00:00Z')
}
function gunFarki(bugun, tarih) {
  return Math.round((tarihNesnesi(bugun) - tarihNesnesi(tarih)) / 86400000)
}
function bosGorev() {
  return { gorev_title: '', gorev_body: '', gorev_puani: '10', gorev_etiketi: 'Okul' }
}

export default {
  components: { OrdekKart },
  data() {
    return {
      SEKMELER,
      DURUM_IKON,
      BOS_MESAJ,
      ETIKETLER,
      yukleniyor: true,
      hata: '',
      bugun: '',
      gorevler: [],
      ozet: {},
      etiketler: [],
      sekme: 0,
      filtre: null,
      yeni: bosGorev(),
    }
  },
  computed: {
    enBuyukToplam() {
      return Math.max(1, ...this.etiketler.map((e) => e.tamamlanan + e.yapilmayan))
    },
    // Seçili sekme + etiket filtresine göre görevler, tarih gruplarına ayrılmış
    gosterilenGruplar() {
      const liste = this.gorevler.filter(
        (g) => g.yapildi_mi === this.sekme && (this.filtre === null || g.gorev_etiketi === this.filtre),
      )
      if (this.sekme === 0) return liste.length ? [{ baslik: '', gorevler: liste }] : []

      const gruplar = []
      for (const g of liste) {
        const baslik = this.gunBasligi(g.isaret_gunu)
        let grup = gruplar.find((x) => x.baslik === baslik)
        if (!grup) {
          grup = { baslik, gorevler: [] }
          gruplar.push(grup)
        }
        grup.gorevler.push(g)
      }
      return gruplar
    },
  },
  methods: {
    sekmeSayisi(id) {
      return this.gorevler.filter((g) => g.yapildi_mi === id).length
    },
    cubukGenislik(e) {
      return ((e.tamamlanan + e.yapilmayan) / this.enBuyukToplam) * 100
    },
    gunBasligi(tarih) {
      if (!tarih) return 'Tarihi bilinmeyen'
      const fark = gunFarki(this.bugun, tarih)
      if (fark === 0) return 'Bugün'
      if (fark === 1) return 'Dün'
      return tarihNesnesi(tarih).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        timeZone: 'UTC',
      })
    },
    eklenmeMetni(tarih) {
      const fark = gunFarki(this.bugun, tarih)
      if (fark <= 0) return 'bugün eklendi'
      if (fark === 1) return 'dün eklendi'
      return `${fark} gündür bekliyor`
    },
    yetki() {
      return { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    },

    async gorevleriGetir() {
      try {
        const res = await axios.get(`${API}/gorevIstatistik`, this.yetki())
        this.bugun = res.data.bugun
        this.gorevler = res.data.gorevler
        this.ozet = res.data.ozet
        this.etiketler = res.data.etiketler
      } catch (err) {
        console.error('Görev hatası:', err)
        this.hata = err.response?.data?.mesaj || 'Görevler yüklenemedi.'
      } finally {
        this.yukleniyor = false
      }
    },

    async gorevEkle() {
      if (!this.yeni.gorev_title) {
        return Swal.fire({ title: 'Görevin bir adı olmalı', icon: 'warning' })
      }
      try {
        await axios.post(`${API}/addGorev`, this.yeni, this.yetki())
        this.yeni = bosGorev()
        await this.gorevleriGetir()
      } catch (err) {
        Swal.fire({
          title: 'Eklenemedi',
          text: err.response?.data?.mesaj || 'Bir şeyler ters gitti.',
          icon: 'error',
        })
      }
    },

    async isaretle(gorev, basarili) {
      try {
        const yol = basarili ? 'gorevBasarili' : 'gorevBasarisiz'
        const res = await axios.post(`${API}/${yol}`, { gorev_id: gorev.gorev_id }, this.yetki())
        await this.gorevleriGetir()
        this.$refs.ordekKart.olayGoster(
          res.data,
          basarili
            ? { title: 'Tebrikler!', text: `+${gorev.gorev_puani} XP kazandın.`, icon: 'success' }
            : { title: 'Biraz daha gayret.', text: res.data.mesaj, icon: 'error' },
        )
      } catch (err) {
        Swal.fire({
          title: 'Hata',
          text: err.response?.data?.mesaj || 'Bir şeyler ters gitti.',
          icon: 'error',
        })
      }
    },

    async sil(gorev) {
      const onay = await Swal.fire({
        title: `"${gorev.gorev_title}" silinsin mi?`,
        text: 'Bu işlem geri alınamaz.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Evet, sil',
        cancelButtonText: 'Vazgeç',
        confirmButtonColor: '#e53935',
      })
      if (!onay.isConfirmed) return
      try {
        await axios.delete(`${API}/deleteGorev`, { ...this.yetki(), data: { gorev_id: gorev.gorev_id } })
        await this.gorevleriGetir()
      } catch (err) {
        Swal.fire({ title: 'Hata', text: err.response?.data?.mesaj || 'Silinemedi.', icon: 'error' })
      }
    },
  },
  mounted() {
    this.gorevleriGetir()
  },
}
</script>

<style scoped>
.sayfa {
  font-family: monospace;
  margin: 0;
}
.bilgi {
  margin-top: 3rem;
  text-align: center;
  color: #555;
}

/* Kartlar (Alışkanlıklar sayfasıyla aynı dil) */
.kart {
  background: white;
  border: 4px solid black;
  border-radius: 10px;
  padding: 16px 20px;
  margin-top: 1.5rem;
}
.kart-ust {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.kart-baslik {
  font-weight: bold;
  margin: 0;
}

/* 1. Özet kutucukları */
.ozet {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 3rem;
}
.kutucuk {
  background: #8cc850;
  color: white;
  border: 4px solid black;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
}
.kutucuk-etiket {
  font-size: 0.85rem;
}
.kutucuk-sayi {
  font-size: 1.8rem;
  font-weight: bold;
  text-shadow: 2px 2px 0 #2d2020;
}

/* 2. Etiket çubukları */
.lejant {
  display: flex;
  gap: 14px;
  font-size: 0.75rem;
  color: #555;
}
.renk {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  margin-right: 4px;
  vertical-align: middle;
}
.renk.tamam,
.parca.tamam {
  background: #4caf50;
}
.renk.olmadi,
.parca.olmadi {
  background: #e53935;
}
.etiket-satir {
  display: grid;
  grid-template-columns: 150px 1fr 110px;
  align-items: center;
  gap: 10px;
  margin: 6px 0;
  font-size: 0.85rem;
}
.etiket-ad {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cubuk-alan {
  height: 14px;
}
.cubuk {
  display: flex;
  gap: 2px;
  height: 100%;
  min-width: 4px;
}
.parca {
  height: 100%;
  border-radius: 4px;
}
.etiket-sayi {
  color: #555;
  text-align: right;
}

/* 3. Sekmeler ve filtre */
.sekmeler {
  display: flex;
  gap: 6px;
  border-bottom: 3px solid black;
  margin: -4px -4px 12px;
  flex-wrap: wrap;
}
.sekme {
  border: 3px solid transparent;
  border-bottom: none;
  background: transparent;
  padding: 6px 12px;
  border-radius: 8px 8px 0 0;
  font-weight: bold;
  margin-bottom: -3px;
}
.sekme.aktif {
  border-color: black;
  background: #b9e08d;
}
.sekme-sayi {
  background: #2d2020;
  color: white;
  border-radius: 10px;
  padding: 0 7px;
  font-size: 0.75rem;
  margin-left: 4px;
}
.filtre {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.cip {
  border: 2px solid black;
  background: white;
  border-radius: 14px;
  padding: 1px 10px;
  font-size: 0.8rem;
}
.cip.aktif {
  background: #2d2020;
  color: white;
}

/* Hızlı ekleme */
.hizli-ekle {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr 1.2fr auto;
  gap: 6px;
  margin-bottom: 14px;
}
.hizli-ekle .form-control,
.hizli-ekle .form-select {
  border: 2px solid black;
  font-family: monospace;
  font-size: 0.85rem;
}

/* Görev satırları */
.bos-liste {
  margin: 1.5rem 0;
}
.grup-baslik {
  font-weight: bold;
  color: #555;
  margin: 14px 0 6px;
}
.gorev {
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
.gorev.durum-0 {
  border-left-color: #ffb300;
}
.gorev.durum-1 {
  border-left-color: #4caf50;
}
.gorev.durum-2 {
  border-left-color: #e53935;
}
.gorev-ust {
  display: flex;
  gap: 6px;
  align-items: center;
}
.gorev-not {
  margin: 2px 0 0 24px;
  font-size: 0.8rem;
  color: #666;
}
.gorev-alt {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 6px 0 0 24px;
  font-size: 0.75rem;
  flex-wrap: wrap;
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
.zaman {
  color: #888;
}
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
.islem:hover {
  transform: scale(1.12);
}
.islem.tamam:hover {
  background: #d9f2d0;
}
.islem.olmadi:hover {
  background: #fbd9d9;
}

/* Dar ekranlar */
@media (max-width: 768px) {
  .ozet {
    grid-template-columns: repeat(2, 1fr);
  }
  .hizli-ekle {
    grid-template-columns: 1fr 1fr;
  }
  .etiket-satir {
    grid-template-columns: 90px 1fr;
  }
  .etiket-sayi {
    grid-column: 2;
    text-align: left;
  }
}
</style>