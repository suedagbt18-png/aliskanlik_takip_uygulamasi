<template>
  <div class="uygulama">
    <Navbar v-if="!girisSayfasi" />
    <main class="icerik">
      <RouterView />
    </main>
    <Footer v-if="!girisSayfasi" />
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'

export default {
  name: 'App',
  components: { Navbar, Footer },
  computed: {
    // Giriş ve kayıt sayfalarında navbar/footer gösterme
    girisSayfasi() {
      return ['/', '/giris', '/kayitol'].includes(this.$route.path)
    },
  },
}
</script>

<style>
/* Sayfa en az ekran boyu kadar uzun; navbar, içerik ve footer alt alta dizilir */
.uygulama {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
/* İçerik kalan bütün boşluğu kaplar, footer'ı en alta iter */
.icerik {
  flex: 1 0 auto;
  padding-bottom: 2rem;
}
</style>