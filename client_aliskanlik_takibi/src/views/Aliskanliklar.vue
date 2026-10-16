<template>
  <Navbar></Navbar>
  <div>
    <div class="row d-flex justify-content-center align-items-center">
      <div class="col-3 d-flex justify-content-center align-items-center">
        <Profilcard></Profilcard>
      </div>
      <div class="col-8">
        <div class="card">
          <div class="card-body d-flex justify-content-between">
            <!--yapıldı-->
            <div class="yapildi w-50 pe-2">
              <div class="baslik">
                <h3>yapıldı</h3>
              </div>
              <ul class="list-group task-scroll">
                <li
                  v-for="(aliskanlik, aliskanlikIndexIndex) in yapilanAliskanliklar"
                  :key="aliskanlikIndexIndex"
                  class="list-group-item p-3"
                  :class="{ completed: aliskanlik.yapildi_mi == 1 }"
                >
                  <div class="d-flex align-items-center justify-content-between">
                    <div class="flex-grow-1 me-3">
                      {{ aliskanlik.aliskanlik_title }}
                      <div class="text-secondary">
                        <span> not: {{ aliskanlik.aliskanlik_body }}</span>
                        <br />
                        <span>puan: {{ aliskanlik.aliskanlik_puani }} XP</span>
                        <br />
                        <span>etiket: {{ aliskanlik.aliskanlik_etiketi }}</span>
                        <br />
                        <span>tarih : {{ aliskanlik.tarih }}</span>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <!--yapılmadı -->
            <div class="yapilmadi w-50 pe-2">
              <div class="baslik">
                <h3>yapılmadı</h3>
              </div>
              <ul class="list-group task-scroll">
                <li
                  v-for="(aliskanlik, aliskanlikIndex) in yapilmayanAliskanliklar"
                  :key="aliskanlikIndex"
                  class="list-group-item p-3"
                  :class="{ uncompleted: aliskanlik.yapildi_mi == 2 }"
                >
                  <div class="d-flex align-items-center justify-content-between">
                    <div class="flex-grow-1 me-3">
                      {{ aliskanlik.aliskanlik_title }}
                      <div class="text-secondary">
                        <span> not: {{ aliskanlik.aliskanlik_body }}</span>
                        <br />
                        <span>puan: {{ aliskanlik.aliskanlik_puani }} XP</span>
                        <br />
                        <span>etiket: {{ aliskanlik.aliskanlik_etiketi }}</span>
                        <br />
                        <span>tarih : {{ aliskanlik.tarih }}</span>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Footer></Footer>
</template>

<script>
import Navbar from '@/components/Navbar.vue'
import Profilcard from '@/components/Profilcard.vue'
import Footer from '@/components/Footer.vue'
import axios from 'axios'

export default {
  components: { Navbar, Footer, Profilcard },
  data() {
    return {
      yapilanAliskanliklar: [],
      yapilmayanAliskanliklar: [],
    }
  },
  mounted() {
    this.takipAliskanlikYapildi()
    this.takipAliskanlikYapilmadi()
  },
  methods: {
    takipAliskanlikYapildi() {
      const token = localStorage.getItem('token')

      axios
        .get('http://localhost:3000/getYapilanAliskanliklar', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          this.yapilanAliskanliklar = res.data
          console.log(res.data)
        })
        .catch((err) => {
          console.error(err)
        })
    },
    takipAliskanlikYapilmadi() {
      const token = localStorage.getItem('token')

      axios
        .get('http://localhost:3000/getYapilmayanAliskanliklar', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          this.yapilmayanAliskanliklar = res.data
          console.log(res.data)
        })
        .catch((err) => {
          console.error(err)
        })
    },
  },
}
</script>

<style scoped>
.card {
  font-family: monospace;
  border: 4px solid black;
  box-shadow: 0px 0px 4px 4px #b4b4b4;
  background-color: #8cc850;
  height: 32rem;
  display: flex;
  flex-direction: column;
  margin: 1rem;
}
.list-group-item {
  margin: 0.5rem;
  border-radius: 1rem !important;
}
.task-scroll {
  height: 24rem;
  overflow-y: auto;
  padding-right: 0.5rem;
}
.task-scroll::-webkit-scrollbar {
  width: 6px;
}

.task-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

.task-scroll::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0.05);
}
.yapildi .list-group-item {
  border: 4px solid black;
  box-shadow: 0px 0px 4px 4px #b4b4b4;
  background-color: #c8f49c;
}
.yapilmadi .list-group-item {
  border: 4px solid black;
  box-shadow: 0px 0px 4px 4px #b4b4b4;
  background-color: #eb7e70;
}
.baslik {
  color: white;
  display: flex;
  justify-content: center;
}
</style>
