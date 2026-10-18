<template>
  <nav class="navbar navbar-expand-lg sticky-top">
    <div class="container-fluid">
      <!-- Logo -->
      <RouterLink to="/dashboard" class="navbar-brand">
        <img :src="logo" alt="logo" class="logo" />
      </RouterLink>

      <!-- Telefonda menüyü açan buton -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Menüyü aç"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <!-- Sol: sayfa bağlantıları -->
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li v-for="b in baglantilar" :key="b.yol" class="nav-item">
            <RouterLink class="nav-link" :class="{ active: $route.path === b.yol }" :to="b.yol">
              {{ b.ad }}
            </RouterLink>
          </li>
        </ul>

        <!-- Sağ: ördeğin küçük resmi, tıklayınca profil penceresi açılır -->
        <button
          type="button"
          class="btn profil-btn"
          data-bs-toggle="modal"
          data-bs-target="#profilModal"
          title="Profil"
          @click="getUserProfile"
        >
          <img :src="ordekGorsel" alt="profil" class="profil-img" />
          <span class="profil-ad">{{ ordek.ad || 'Yumurta' }}</span>
        </button>
      </div>
    </div>
  </nav>

  <!-- Profil penceresi -->
  <div class="modal fade" id="profilModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content profil-pencere">
        <div class="modal-header border-0 pb-0">
          <button type="button" class="btn-close ms-auto" data-bs-dismiss="modal" aria-label="Kapat"></button>
        </div>

        <div class="modal-body text-center pt-0">
          <!-- Ördek -->
          <div class="ordek-sahne">
            <img :src="ordekGorsel" :alt="ordek.ad" class="ordek-img" />
          </div>
          <h4 class="ordek-adi">{{ ordek.ad || 'İsimsiz yumurta' }}</h4>
          <p class="text-muted mb-0">{{ ASAMA_ADLARI[ordek.asama] }}</p>
          <p class="text-muted small mb-3">{{ yumurta ? 'İçinden ne çıkacak? 🎁' : RENK_ADLARI[ordek.renk] }}</p>

          <!-- Değerler -->
          <div class="degerler">
            <div class="deger">
              <span class="deger-etiket">Seviye</span>
              <strong>{{ kullanici.level }}</strong>
            </div>
            <div class="deger">
              <span class="deger-etiket">❤️ Can</span>
              <strong>{{ kullanici.hp }}</strong>
            </div>
            <div class="deger">
              <span class="deger-etiket">⭐ XP</span>
              <strong>{{ kullanici.xp }}/100</strong>
            </div>
          </div>
          <p class="unvan">🏅 {{ kullanici.title }} · 🏡 {{ kullanici.ciftlikSayisi }} ördek</p>

          <!-- Bakıcı bilgisi -->
          <p class="bakici">
            Bakıcısı: <strong>{{ kullanici.name }} {{ kullanici.surname }}</strong>
            <span class="text-muted ms-1">@{{ kullanici.nickname }}</span>
          </p>

          <!-- Kısayollar (tıklayınca pencere de kapanır) -->
          <div class="kisayollar">
            <button type="button" class="btn btn-outline-dark btn-sm" @click="git('/ciftlik')">
              🏡 Çiftliğim
            </button>
            <button type="button" class="btn btn-outline-dark btn-sm" @click="git('/aliskanliklar')">
              📊 Alışkanlık karnesi
            </button>
            <button type="button" class="btn btn-outline-dark btn-sm" @click="git('/ani-defteri')">
              🪦 Anı defteri
            </button>
          </div>
        </div>

        <div class="modal-footer border-0">
          <button type="button" class="btn btn-danger" data-bs-dismiss="modal" @click="cikisYap">
            Çıkış Yap
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { Modal } from 'bootstrap'
import logo from '@/assets/logo.png'
import { ordekGorsel, yumurtaMi, ASAMA_ADLARI, RENK_ADLARI } from '@/utils/ordek'

export default {
  name: 'Navbar',
  data() {
    return {
      logo,
      ASAMA_ADLARI,
      RENK_ADLARI,
      baglantilar: [
        { yol: '/dashboard', ad: 'Anasayfa' },
        { yol: '/gorevler', ad: 'Görevler' },
        { yol: '/aliskanliklar', ad: 'Alışkanlıklar' },
        { yol: '/ciftlik', ad: 'Çiftlik' },
        { yol: '/ani-defteri', ad: 'Anı Defteri' },
        { yol: '/yardım', ad: 'Yardım' },
      ],
      kullanici: { name: '', surname: '', nickname: '', level: 1, hp: 100, xp: 0, title: '', ciftlikSayisi: 0 },
      ordek: { ad: null, asama: 'yumurta', ruh_hali: 'sicak', renk: 'beyaz' },
    }
  },
  computed: {
    ordekGorsel() {
      return ordekGorsel(this.ordek.asama, this.ordek.ruh_hali, this.ordek.renk)
    },
    yumurta() {
      return yumurtaMi(this.ordek.asama)
    },
  },
  watch: {
    // Sayfa değiştikçe bilgileri tazele (seviye, can vs. değişmiş olabilir)
    '$route.path'() {
      this.getUserProfile()
    },
  },
  methods: {
    async getUserProfile() {
      const token = localStorage.getItem('token')
      if (!token) return
      try {
        const res = await axios.get('http://localhost:3000/getUserInfo', {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.kullanici = {
          name: res.data.name,
          surname: res.data.surname,
          nickname: res.data.nickname,
          level: res.data.level,
          hp: res.data.hp,
          xp: res.data.xp,
          title: res.data.title,
          ciftlikSayisi: res.data.ciftlikSayisi ?? 0,
        }
        if (res.data.ordek) this.ordek = res.data.ordek
      } catch (err) {
        console.error('Profil yüklenemedi:', err)
      }
    },
    // Profil penceresini kapatıp istenen sayfaya git
    git(yol) {
      Modal.getInstance(document.getElementById('profilModal'))?.hide()
      this.$router.push(yol)
    },
    cikisYap() {
      localStorage.removeItem('token')
      this.$router.push('/giris')
    },
  },
  mounted() {
    this.getUserProfile()
  },
}
</script>

<style scoped>
.navbar {
  background-color: #8cc850;
  border-bottom: 4px solid black;
  font-family: monospace;
}
.logo {
  height: 40px;
  image-rendering: pixelated;
}
.nav-link {
  color: white;
  font-weight: bold;
}
.nav-link.active,
.nav-link:hover {
  color: #2d2020;
}

/* Sağdaki ördek butonu */
.profil-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #b9e08d;
  border: 3px solid black;
  border-radius: 8px;
  padding: 2px 10px 2px 4px;
  font-family: monospace;
  font-weight: bold;
}
.profil-btn:hover .profil-img {
  transform: scale(1.15);
}
.profil-img {
  height: 40px;
  image-rendering: pixelated;
  transition: transform 0.2s;
}

/* Profil penceresi */
.profil-pencere {
  border: 4px solid black;
  border-radius: 12px;
  font-family: monospace;
}
.ordek-sahne {
  background: #b9e08d;
  border: 3px solid black;
  border-radius: 8px;
  display: inline-block;
  padding: 6px 24px;
}
.ordek-img {
  width: 96px;
  height: 96px;
  image-rendering: pixelated;
}
.ordek-adi {
  font-weight: bold;
  margin: 10px 0 2px;
}
.degerler {
  display: flex;
  justify-content: center;
  gap: 10px;
}
.deger {
  display: flex;
  flex-direction: column;
  min-width: 80px;
  border: 2px solid black;
  border-radius: 6px;
  padding: 4px 8px;
  background: #f3f3ee;
}
.deger-etiket {
  font-size: 0.75rem;
  color: #666;
}
.unvan {
  margin: 12px 0 4px;
  font-weight: bold;
}
.bakici {
  font-size: 0.85rem;
  margin-bottom: 14px;
}
.kisayollar {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
