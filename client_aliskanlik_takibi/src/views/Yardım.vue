<template>
  <div>
    <Navbar></Navbar>
  </div>
  <div>
    <div class="row">
      <div class="col-md-3">
        <div class="baslik">
          <h3>Nasıl Çalışır</h3>
        </div>
        <div class="aciklama">
          <p>dckdmscmalsxmşlsclşscs</p>
        </div>
      </div>
      <div class="col-md-3">
        <p>dkskanxak</p>
      </div>
      <div class="col-md-3">
        <p>skxamkxsa</p>
      </div>
    </div>
  </div>
  <div>
    <Footer></Footer>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
const router = useRouter()
export default {
  components: { Navbar, Footer },
  data() {
    return {}
  },
}
</script>
<style>
.row {
  display: flex;
  justify-content: center;
}
.col-md-3 {
  margin: 3rem;
}
</style>
