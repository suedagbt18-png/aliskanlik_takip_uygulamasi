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
                  v-for="(gorev, gorevIndex) in yapilanGorevler"
                  :key="gorevIndex"
                  class="list-group-item p-3"
                  :class="{ completed: gorev.yapildi_mi == 1 }"
                >
                  <div class="d-flex align-items-center justify-content-between">
                    <div class="flex-grow-1 me-3">
                      {{ gorev.gorev_title }}
                      <div class="text-secondary">
                        <span> not: {{ gorev.gorev_body }}</span>
                        <br />
                        <span>puan: {{ gorev.gorev_puani }} XP</span>
                        <br />
                        <span>etiket: {{ gorev.gorev_etiketi }}</span>
                        <br />
                        <span>tarih : {{ gorev.tarih }}</span>
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
                  v-for="(gorev, gorevIndex) in yapilmayanGorevler"
                  :key="gorevIndex"
                  class="list-group-item p-3"
                  :class="{ uncompleted: gorev.yapildi_mi == 2 }"
                >
                  <div class="d-flex align-items-center justify-content-between">
                    <div class="flex-grow-1 me-3">
                      {{ gorev.gorev_title }}
                      <div class="text-secondary">
                        <span> not: {{ gorev.gorev_body }}</span>
                        <br />
                        <span>puan: {{ gorev.gorev_puani }} XP</span>
                        <br />
                        <span>etiket: {{ gorev.gorev_etiketi }}</span>
                        <br />
                        <span>tarih : {{ gorev.tarih }}</span>
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
      yapilanGorevler: [],
      yapilmayanGorevler: [],
    }
  },
  mounted() {
    this.takipGorevYapildi()
    this.takipGorevYapilmadi()
  },
  methods: {
    takipGorevYapildi() {
      const token = localStorage.getItem('token')

      axios
        .get('http://localhost:3000/getYapilanGorevler', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          this.yapilanGorevler = res.data
          console.log(res.data)
        })
        .catch((err) => {
          console.error(err)
        })
    },
    takipGorevYapilmadi() {
      const token = localStorage.getItem('token')

      axios
        .get('http://localhost:3000/getYapilmayanGorevler', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          this.yapilmayanGorevler = res.data
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
  height: 27rem;
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
