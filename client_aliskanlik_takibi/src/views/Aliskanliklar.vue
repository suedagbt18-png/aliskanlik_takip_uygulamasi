<template>
  <Navbar></Navbar>
  <div class="row justify-content-center sayfa">
    <div class="col-lg-3 d-flex justify-content-center">
      <OrdekKart></OrdekKart>
    </div>

    <div class="col-lg-8">
      <p v-if="yukleniyor" class="bilgi">Yükleniyor...</p>
      <p v-else-if="hata" class="bilgi">{{ hata }}</p>

      <template v-else>
        <!-- 1. Özet kutucukları -->
        <div class="ozet">
          <div class="kutucuk">
            <span class="kutucuk-etiket">📚 Aktif alışkanlık</span>
            <span class="kutucuk-sayi">{{ ozet.aktif }}</span>
          </div>
          <div class="kutucuk">
            <span class="kutucuk-etiket">🏆 Rekor seri</span>
            <span class="kutucuk-sayi">{{ ozet.rekorSeri }} <small>gün</small></span>
          </div>
          <div class="kutucuk">
            <span class="kutucuk-etiket">✅ Son 7 gün</span>
            <span class="kutucuk-sayi">
              {{ ozet.haftaOrani === null ? '—' : '%' + ozet.haftaOrani }}
            </span>
          </div>
          <div class="kutucuk">
            <span class="kutucuk-etiket">🎯 Toplam tamamlanan</span>
            <span class="kutucuk-sayi">{{ ozet.toplamTamamlanan }}</span>
          </div>
        </div>

        <!-- 2. Isı haritası -->
        <div class="kart">
          <h5 class="kart-baslik">Son 12 hafta</h5>
          <div class="harita-sarmal">
            <div class="gun-etiketleri">
              <span>Pzt</span><span></span><span>Çar</span><span></span><span>Cum</span><span></span><span>Paz</span>
            </div>
            <div class="harita">
              <div
                v-for="(hucre, i) in haritaHucreleri"
                :key="i"
                class="hucre"
                :class="hucre ? 'seviye-' + hucre.seviye : 'bos-hucre'"
                :title="hucre ? hucreIpucu(hucre) : ''"
              ></div>
            </div>
          </div>
          <div class="lejant">
            <span>Az</span>
            <div v-for="s in [0, 1, 2, 3, 4]" :key="s" class="hucre" :class="'seviye-' + s"></div>
            <span>Çok</span>
          </div>
        </div>

        <!-- 3. Her alışkanlık için son 7 gün -->
        <div class="kart">
          <h5 class="kart-baslik">Alışkanlıkların</h5>

          <p v-if="aliskanliklar.length === 0" class="bilgi">
            Henüz alışkanlığın yok. Ana sayfadan ekleyebilirsin 🐣
          </p>

          <div v-for="a in aliskanliklar" :key="a.aliskanlik_id" class="aliskanlik">
            <div class="aliskanlik-ust">
              <div>
                <strong>{{ a.baslik }}</strong>
                <span class="etiket">{{ a.etiket }}</span>
              </div>
              <div class="rozetler">
                <span class="rozet" title="Şu anki seri">🔥 {{ a.seri }}</span>
                <span class="rozet" title="En uzun seri">🏆 {{ a.rekor }}</span>
                <span class="rozet" title="Son 30 günde başarı oranı">
                  {{ a.oran30 === null ? 'Yeni' : '%' + a.oran30 }}
                </span>
              </div>
            </div>

            <div class="son7">
              <div v-for="g in a.son7" :key="g.tarih" class="gun" :title="gunIpucu(g)">
                <span class="gun-adi">{{ gunAdi(g.tarih) }}</span>
                <span class="gun-ikon">{{ IKONLAR[g.durum] }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
  <Footer></Footer>
</template>

<script>
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import OrdekKart from '@/components/OrdekKart.vue'
import axios from 'axios'

const GUN_ADLARI = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']

const IKONLAR = {
  yapildi: '✅',
  yapilmadi: '❌',
  kacirildi: '⬜',
  bekliyor: '⏳',
  yok: '·',
}

const DURUM_METNI = {
  yapildi: 'yapıldı',
  yapilmadi: 'yapılmadı',
  kacirildi: 'işaretlenmedi',
  bekliyor: 'bugün, bekliyor',
  yok: 'alışkanlık henüz yoktu',
}

function tarihNesnesi(tarih) {
  return new Date(tarih + 'T00:00:00Z')
}

export default {
  components: { Navbar, Footer, OrdekKart },
  data() {
    return {
      IKONLAR,
      yukleniyor: true,
      hata: '',
      ozet: {},
      takvim: [],
      aliskanliklar: [],
    }
  },
  computed: {
    // Isı haritası sütunları haftalar, satırları günler (Pzt üstte).
    // İlk günün haftanın hangi gününe denk geldiğine göre başa boş hücre ekliyoruz.
    haritaHucreleri() {
      if (this.takvim.length === 0) return []
      const ilkGun = tarihNesnesi(this.takvim[0].tarih).getUTCDay() // 0 = Pazar
      const bosluk = (ilkGun + 6) % 7 // Pazartesi = 0 olacak şekilde
      return [...Array(bosluk).fill(null), ...this.takvim]
    },
  },
  methods: {
    gunAdi(tarih) {
      return GUN_ADLARI[tarihNesnesi(tarih).getUTCDay()]
    },
    tarihMetni(tarih) {
      return tarihNesnesi(tarih).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        timeZone: 'UTC',
      })
    },
    hucreIpucu(h) {
      if (h.toplam === 0) return `${this.tarihMetni(h.tarih)}: alışkanlık yoktu`
      return `${this.tarihMetni(h.tarih)}: ${h.yapilan}/${h.toplam} alışkanlık yapıldı`
    },
    gunIpucu(g) {
      return `${this.tarihMetni(g.tarih)}: ${DURUM_METNI[g.durum]}`
    },
    async istatistikleriGetir() {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get('http://localhost:3000/aliskanlikIstatistik', {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.ozet = res.data.ozet
        this.takvim = res.data.takvim
        this.aliskanliklar = res.data.aliskanliklar
      } catch (err) {
        console.error('İstatistik hatası:', err)
        this.hata = err.response?.data?.mesaj || 'İstatistikler yüklenemedi.'
      } finally {
        this.yukleniyor = false
      }
    },
  },
  mounted() {
    this.istatistikleriGetir()
  },
}
</script>

<style scoped>
.sayfa {
  font-family: monospace;
  margin: 0;
  padding-bottom: 2rem;
}
.bilgi {
  margin-top: 3rem;
  text-align: center;
  color: #555;
}

/* Kart görünümü (ana sayfadaki kartlarla uyumlu) */
.kart {
  background: white;
  border: 4px solid black;
  border-radius: 10px;
  padding: 16px 20px;
  margin-top: 1.5rem;
}
.kart-baslik {
  font-weight: bold;
  margin-bottom: 12px;
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
.kutucuk-sayi small {
  font-size: 0.9rem;
}

/* 2. Isı haritası: tek renk tonu, açıktan koyuya */
.harita-sarmal {
  display: flex;
  gap: 6px;
  overflow-x: auto;
}
.gun-etiketleri {
  display: grid;
  grid-template-rows: repeat(7, 16px);
  gap: 3px;
  font-size: 0.7rem;
  color: #777;
}
.harita {
  display: grid;
  grid-template-rows: repeat(7, 16px);
  grid-auto-flow: column;
  grid-auto-columns: 16px;
  gap: 3px;
}
.hucre {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}
.hucre:not(.bos-hucre):hover {
  outline: 2px solid black;
}
.seviye-0 { background: #ebede6; }
.seviye-1 { background: #cfe8b4; }
.seviye-2 { background: #a3d46e; }
.seviye-3 { background: #6aa83a; }
.seviye-4 { background: #3a6e1c; }
.lejant {
  display: flex;
  align-items: center;
  gap: 3px;
  justify-content: flex-end;
  margin-top: 10px;
  font-size: 0.75rem;
  color: #777;
}
.lejant span {
  margin: 0 4px;
}

/* 3. Alışkanlık satırları */
.aliskanlik {
  border-top: 2px dashed #ddd;
  padding: 12px 0;
}
.aliskanlik:first-of-type {
  border-top: none;
}
.aliskanlik-ust {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.etiket {
  margin-left: 8px;
  font-size: 0.75rem;
  color: #777;
}
.rozetler {
  display: flex;
  gap: 6px;
}
.rozet {
  background: #f3f3ee;
  border: 2px solid black;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 0.85rem;
  font-weight: bold;
}
.son7 {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
.gun {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 36px;
}
.gun-adi {
  font-size: 0.7rem;
  color: #777;
}
.gun-ikon {
  font-size: 1.1rem;
}

/* Dar ekranlarda kutucuklar 2'li sıralansın */
@media (max-width: 768px) {
  .ozet {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>