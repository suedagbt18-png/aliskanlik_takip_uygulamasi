<template>
  <Navbar></Navbar>
  <div>
    <div class="row">
      <div class="col-md-4">
        <!--ref sayesinde profil cardın içindeki getuserprofile fonksiyonunu tamamlandi görev kısmında kullanabildik.-->
        <Profilcard ref="refProfilCard"></Profilcard>
      </div>

      <!-- Görevler Kartı -->
      <div class="col-md-4">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0 text-white">Görevler</h5>
            <!-- Görev ekleme butonu -->
            <button class="pixel-btn" data-bs-toggle="modal" data-bs-target="#gorevModal">
              <img :src="ekle" alt="ekle" style="height: 60px" />
            </button>
          </div>

          <!-- Liste -->
          <div class="card-body p-0">
            <ul class="list-group task-scroll">
              <li
                v-for="(gorev, gorevIndex) in gorevler"
                :key="gorevIndex"
                class="list-group-item p-3"
                :class="{ completed: gorev.yapildi_mi, uncompleted: gorev.yapildi_mi == 2 }"
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
                    </div>
                  </div>
                  <div v-if="gorev.yapildi_mi == 0" class="form-check m-0">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      v-model="gorev.selected"
                      :disabled="gorev.completed || gorev.uncompleted"
                    />
                  </div>
                </div>
                <span v-if="gorev.completed" class="badge bg-success">Tamamlandı </span>
                <span v-if="gorev.uncompleted" class="badge bg-danger">Tamamlanmadı </span>
              </li>
            </ul>
          </div>

          <!-- Görev tamamla-tamamlama butonları-->
          <div class="card-footer d-flex justify-content-between align-items-center">
            <button @click="tamamlandiGorev" class="btn pixel-btn">
              <img :src="buton" alt="buton" style="height: 60px" />
            </button>
            <button @click="tamamlanmadiGorev" class="btn pixel-btn">
              <img :src="buton1" alt="buton1" style="height: 60px" />
            </button>
          </div>

          <!-- Görev ekleme modalı düzenlenecek!-->
          <div class="modal fade" id="gorevModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header" id="gorev">
                  <h5 class="modal-title">Görev Ekle</h5>
                  <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Kapat"
                  ></button>
                </div>
                <div class="modal-body">
                  <div class="row">
                    <p>Başlık</p>
                    <input
                      v-model="gorevInfo.gorev_title"
                      class="form-control"
                      placeholder="Görev metni..."
                    />
                    <p>Not ekle</p>
                    <input
                      v-model="gorevInfo.gorev_body"
                      class="form-control"
                      placeholder="Not ekle..."
                    />
                    <p>Zorluk Düzeyi</p>

                    <select v-model="gorevInfo.gorev_puani" class="form-select">
                      <option value="5">Kolay 5XP</option>
                      <option value="10">Orta 10XP</option>
                      <option value="15">Zor 15XP</option>
                    </select>

                    <p>Etiketler</p>
                    <select v-model="gorevInfo.gorev_etiketi" class="form-select">
                      <option value="İş">İş</option>
                      <option value="Okul">Okul</option>
                      <option value="Egzersiz">Egzersiz</option>
                      <option value="Sağlık + Zindelik">Sağlık + Zindelik</option>
                      <option value="Ev işleri">Ev işleri</option>
                      <option value="Kişisel Gelişim">Kişisel Gelişim</option>
                    </select>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                    Vazgeç
                  </button>
                  <button
                    type="button"
                    class="btn btn-danger"
                    @click="ekleGorev"
                    data-bs-dismiss="modal"
                  >
                    Ekle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Alışkanlıklar Kartı -->
      <div class="col-md-4">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0 text-white">Alışkanlıklar</h5>
            <button class="pixel-btn" data-bs-toggle="modal" data-bs-target="#aliskanlikModal">
              <img :src="ekle" alt="ekle" style="height: 60px" />
            </button>
          </div>

          <!-- Liste -->
          <div class="card-body p-0">
            <ul class="list-group task-scroll">
              <li
                v-for="(aliskanlik, aliskanlikIndex) in aliskanliklar"
                :key="aliskanlikIndex"
                class="list-group-item p-3"
                :class="{
                  completed: aliskanlik.yapildi_mi == 1,
                  uncompleted: aliskanlik.yapildi_mi == 2,
                }"
              >
                <div class="d-flex align-items-center justify-content-between">
                  <div class="flex-grow-1 me-3">
                    {{ aliskanlik.aliskanlik_title }}
                    <div class="text-secondary">
                      <span>not: {{ aliskanlik.aliskanlik_body }} </span>
                      <br />
                      <span>puan: {{ aliskanlik.aliskanlik_puani }} XP</span>
                      <br />
                      <span>etiket: {{ aliskanlik.aliskanlik_etiketi }}</span>
                    </div>
                  </div>
                  <div v-if="aliskanlik.yapildi_mi == 0" class="form-check m-0">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      v-model="aliskanlik.selected"
                      :disabled="aliskanlik.completed || aliskanlik.uncompleted"
                    />
                  </div>
                </div>
                <span v-if="aliskanlik.completed" class="badge bg-success"> Tamamlandı</span>
                <span v-if="aliskanlik.uncompleted" class="badge bg-danger"> Tamamlanmadı</span>
              </li>
            </ul>
          </div>

          <!-- Ekleme butonu -->
          <div class="card-footer d-flex justify-content-between align-items-center">
            <button @click="tamamlandiAliskanlik" class="btn pixel-btn">
              <img :src="buton" alt="buton" style="height: 60px" />
            </button>
            <button @click="tamamlanmadiAliskanlik" class="btn pixel-btn">
              <img :src="buton1" alt="buton1" style="height: 60px" />
            </button>
          </div>
          <!--Alışkanlık ekleme modalı-->
          <div class="modal fade" id="aliskanlikModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header" id="aliskanlik">
                  <h5 class="modal-title">Alışkanlık Ekle</h5>
                  <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Kapat"
                  ></button>
                </div>
                <div class="modal-body">
                  <div class="modal-body">
                    <div class="row">
                      <p>Başlık</p>
                      <input
                        v-model="aliskanlikInfo.aliskanlik_title"
                        class="form-control"
                        placeholder="Alışkanlık metni..."
                      />
                      <p>Not ekle</p>
                      <input
                        v-model="aliskanlikInfo.aliskanlik_body"
                        class="form-control"
                        placeholder="Not ekle..."
                      />
                      <p>Zorluk Düzeyi</p>
                      <select v-model="aliskanlikInfo.aliskanlik_puani" class="form-select">
                        <option value="5">Kolay 5XP</option>
                        <option value="10">Orta 10XP</option>
                        <option value="15">Zor 15XP</option>
                      </select>
                      <p>Etiketler</p>
                      <select v-model="aliskanlikInfo.aliskanlik_etiketi" class="form-select">
                        <option value="İş">İş</option>
                        <option value="Okul">Okul</option>
                        <option value="Egzersiz">Egzersiz</option>
                        <option value="Sağlık + Zindelik">Sağlık + Zindelik</option>
                        <option value="Ev işleri">Ev işleri</option>
                        <option value="Kişisel Gelişim">Kişisel Gelişim</option>
                      </select>
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                      Vazgeç
                    </button>
                    <button
                      type="button"
                      class="btn btn-danger"
                      @click="ekleAliskanlik"
                      data-bs-dismiss="modal"
                    >
                      Ekle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer></Footer>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import Profilcard from '@/components/Profilcard.vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import buton from '@/assets/buton.png'
import buton1 from '@/assets/buton1.png'
import ekle from '@/assets/ekle.png'

export default {
  components: { Navbar, Footer, Profilcard },
  data() {
    return {
      buton: buton,
      buton1: buton1,
      ekle: ekle,
      gorevInfo: {
        gorev_title: '',
        gorev_body: '',
        gorev_puani: '',
        gorev_etiketi: '',
      },
      aliskanlikInfo: {
        aliskanlik_title: '',
        aliskanlik_body: '',
        aliskanlik_puani: '',
        aliskanlik_etiketi: '',
      },

      gorevler: [],
      aliskanliklar: [],
    }
  },
  methods: {
    ekleGorev() {
      //boş alan kontrolü
      if (
        !this.gorevInfo.gorev_title ||
        !this.gorevInfo.gorev_body ||
        !this.gorevInfo.gorev_puani ||
        !this.gorevInfo.gorev_etiketi
      ) {
        return Swal.fire({
          title: 'Uyarı!',
          text: 'Lütfen tüm alanları doldurunuz.',
          icon: 'warning',
          confirmButtonText: 'Tamam',
        })
      }

      //tokeni aldık
      const token = localStorage.getItem('token')

      //api isteği gönder
      axios
        .post('http://localhost:3000/addGorev', this.gorevInfo, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          //hata kodları backendde eklediğimiz code hataları
          if (res.data.code === 'db') {
            return Swal.fire({
              icon: 'error',
              title: 'Veritabanı hatası',
              text: 'Görev ekleneme',
              confirmButtonText: 'Tamam',
            })
          }

          if (res.data.code === 'success') {
            Swal.fire({
              title: 'Görev başarıyla eklendi!',
              icon: 'success',
              draggable: true,
              confirmButtonText: 'Tamam',
            })

            console.log('Görev eklendi:', res.data)

            //ekrana ekle
            this.getGorevler()
          }
          // işlem bittikten sonra temizliyor.
          this.gorevInfo = {
            gorev_title: '',
            gorev_body: '',
            gorev_puani: '',
            gorev_etiketi: '',
          }
        })
        .catch((err) => {
          if (err.response.data.code === 'alreadyExist') {
            Swal.fire({
              title: 'Uyarı!',
              text: 'Bu görev zaten kayıtlı.',
              icon: 'warning',
            })
          }
        })
    },
    ekleAliskanlik() {
      // boş alan kontolü
      if (
        !this.aliskanlikInfo.aliskanlik_title ||
        !this.aliskanlikInfo.aliskanlik_body ||
        !this.aliskanlikInfo.aliskanlik_puani ||
        !this.aliskanlikInfo.aliskanlik_etiketi
      ) {
        return Swal.fire({
          title: 'Uyarı!',
          text: 'Lütfen tüm alanları doldurunuz.',
          icon: 'warning',
          confirmButtonText: 'Tamam',
        })
      }

      // tokeni al
      const token = localStorage.getItem('token')

      // api isteği gönder
      axios
        .post('http://localhost:3000/addAliskanlik', this.aliskanlikInfo, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          //hata kodları backend
          if (res.data.code === 'db') {
            return Swal.fire({
              icon: 'error',
              title: 'Veritabanı hatası.',
              text: 'Alışkanlık eklenemedi.',
              confirmButtonText: 'Tamam',
            })
          }

          if (res.data.code === 'success') {
            Swal.fire({
              title: 'Alışkanlık başarıyla eklendi!',
              icon: 'success',
              draggable: true,
              confirmButtonText: 'Tamam',
            })
            console.log('Alışkanık eklendi:', res.data)
            //ekrana ekle
            this.getAliskanliklar()
          }
          // işlem bittikten sonra temizliyor
          this.aliskanlikInfo = {
            aliskanlik_title: '',
            aliskanlik_body: '',
            aliskanlik_puani: '',
            aliskanlik_etiketi: '',
          }
        })
        .catch((err) => {
          if (err.response.data.code === 'alreadyExist') {
            Swal.fire({
              title: 'Uyarı!',
              text: 'Bu alışkanlık zaten kayıtlı.',
              icon: 'warning',
            })
          }
        })
    },

    getGorevler() {
      const token = localStorage.getItem('token')

      axios
        .get('http://localhost:3000/getMyGorev', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (res.data.code === 'success') {
            this.gorevler = res.data.gorevler
          }
        })
        .catch((err) => {
          console.log('Hata : ' + err.message)
        })
    },
    getAliskanliklar() {
      const token = localStorage.getItem('token')
      axios
        .get('http://localhost:3000/getMyAliskanlik', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (res.data.code === 'success') {
            this.aliskanliklar = res.data.aliskanliklar
          }
        })
        .catch((err) => {
          console.log('Hata : ' + err.message)
        })
    },

    tamamlandiGorev() {
      //secili görevi buluyoruz.
      const seciliGorev = this.gorevler.find((gorev) => gorev.selected)

      //seçme işlemi gerçekleşmediyse uyarı veriyoruz
      if (!seciliGorev) {
        return Swal.fire({
          title: 'Uyarı!',
          text: 'Lütfen bir görev seçin.',
          icon: 'warning',
          confirmButtonText: 'Tamam',
        })
      }

      //tokeni al
      const token = localStorage.getItem('token')

      //token kontrolu yapıyoruz.
      if (!token) {
        return Swal.fire({
          title: 'Hata',
          text: 'Kullanıcı oturumu bulunamadı.',
          icon: 'error',
          confirmButtonText: 'Tamam',
        })
      }

      //api isteği gönder

      const payload = {
        gorev_id: seciliGorev.gorev_id,
        gorev_title: seciliGorev.gorev_title,
        gorev_body: seciliGorev.gorev_body,
        gorev_puani: seciliGorev.gorev_puani,
        gorev_etiketi: seciliGorev.gorev_etiketi,
      }
      console.log('Gönderilen payload:', payload)
      axios
        .post('http://localhost:3000/gorevBasarili', payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          this.$refs.refProfilCard.getUserProfile()
          this.getGorevler()
          console.log('tebrikler görev başarıyla tamamlandı  : ', res.data)
          return Swal.fire({
            title: 'Tebrikler',
            text: 'Görevinizi başarıyla tamamladınız.',
            icon: 'success',
            confirmButtonText: 'Tamam',
          })
        })
        .catch((err) => {
          console.error('görev tamamlanamadı', err)
        })
    },
    tamamlanmadiGorev() {
      //secili görevi buluyoruz.
      const seciliGorev = this.gorevler.find((gorev) => gorev.selected)
      //seçme işlemi gerçekleşmediyse uyarı veriyoruz
      if (!seciliGorev) {
        return Swal.fire({
          title: 'Uyarı!',
          text: 'Lütfen bir görev seçin.',
          icon: 'warning',
          confirmButtonText: 'Tamam',
        })
      }

      //token al
      const token = localStorage.getItem('token')

      //token kontrolu yapıyoruz.
      if (!token) {
        return Swal.fire({
          title: 'Hata',
          text: 'Kullanıcı oturumu bulunamadı.',
          icon: 'error',
          confirmButtonText: 'Tamam',
        })
      }
      //api isteği gönder
      const payload = {
        gorev_id: seciliGorev.gorev_id,
        gorev_title: seciliGorev.gorev_title,
        gorev_body: seciliGorev.gorev_body,
        gorev_puani: seciliGorev.gorev_puani,
        gorev_etiketi: seciliGorev.gorev_etiketi,
      }

      console.log('Gönderilen payload:', payload)
      axios
        .post('http://localhost:3000/gorevBasarisiz', payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          this.$refs.refProfilCard.getUserProfile()
          this.getGorevler()
          console.log('görev tamamlanmadı  : ', res.data)
          return Swal.fire({
            title: 'Biraz daha gayret.',
            text: 'Görevinizi tamamlamadınız.',
            icon: 'error',
            confirmButtonText: 'Tamam',
          })
        })
        .catch((err) => {
          console.log('Hata', err)
        })
    },
    tamamlandiAliskanlik() {
      //seçili alışkanlığı buluyoruz
      const seciliAliskanlik = this.aliskanliklar.find((alisknalik) => alisknalik.selected)
      //seçme işlemi gerçekleşti mi kontrol et
      if (!seciliAliskanlik) {
        return Swal.fire({
          title: 'Uyarı',
          text: 'Lütfen bir alışkanlık seçiniz.',
          icon: 'warning',
          confirmButtonText: 'Tamam',
        })
      }

      //token al
      const token = localStorage.getItem('token')

      //token kontrolu yap
      if (!token) {
        return Swal.fire({
          title: 'Hata',
          text: 'Kullanıcı oturumu bulunamadı.',
          icon: 'error',
          confirmButtonText: 'Tamam',
        })
      }
      //api isteği gönder
      const payload = {
        aliskanlik_id: seciliAliskanlik.aliskanlik_id,
        aliskanlik_title: seciliAliskanlik.aliskanlik_title,
        aliskanlik_body: seciliAliskanlik.aliskanlik_body,
        aliskanlik_puani: seciliAliskanlik.aliskanlik_puani,
        aliskanlik_etiketi: seciliAliskanlik.aliskanlik_etiketi,
      }

      axios
        .post('http://localhost:3000/aliskanlikBasarili', payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          this.$refs.refProfilCard.getUserProfile()
          this.getAliskanliklar()
          console.log('tebrikler alışkanlık başarıyla eklendi : ', res.data)
          return Swal.fire({
            title: 'Tebrikler',
            text: 'Alışkanlığınızı başarıyla tamamladınız.',
            icon: 'success',
            confirmButtonText: 'Tamam',
          })
        })
        .catch((err) => {
          console.log('Hata', err)
        })
    },
    tamamlanmadiAliskanlik() {
      //seçili alışkanlığı buluyoruz
      const seciliAliskanlik = this.aliskanliklar.find((alisknalik) => alisknalik.selected)
      //seçme işlemi gerçekleşti mi kontrol et
      if (!seciliAliskanlik) {
        return Swal.fire({
          title: 'Uyarı',
          text: 'Lütfen bir alışkanlık seçiniz.',
          icon: 'warning',
          confirmButtonText: 'Tamam',
        })
      }

      //token al
      const token = localStorage.getItem('token')

      //token kontrolu yap
      if (!token) {
        return Swal.fire({
          title: 'Hata',
          text: 'Kullanıcı oturumu bulunamadı.',
          icon: 'error',
          confirmButtonText: 'Tamam',
        })
      }
      //api isteği gönder
      const payload = {
        aliskanlik_id: seciliAliskanlik.aliskanlik_id,
        aliskanlik_title: seciliAliskanlik.aliskanlik_title,
        aliskanlik_body: seciliAliskanlik.aliskanlik_body,
        aliskanlik_puani: seciliAliskanlik.aliskanlik_puani,
        aliskanlik_etiketi: seciliAliskanlik.aliskanlik_etiketi,
      }

      axios
        .post('http://localhost:3000/aliskanlikBasarisiz', payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          this.$refs.refProfilCard.getUserProfile()
          this.getAliskanliklar()
          console.log('alışkanlık tamamlanmadı : ', res.data)
          return Swal.fire({
            title: 'Biraz daha gayret.',
            text: 'Alışkanlığınızı  tamamlamadınız.',
            icon: 'error',
            confirmButtonText: 'Tamam',
          })
        })
        .catch((err) => {
          console.log('Hata', err)
        })
    },
  },
  created() {
    this.getGorevler()
    this.getAliskanliklar()
  },
}
</script>
<style scoped>
.card {
  font-family: monospace;
  border: 4px solid black;
  box-shadow: 0px 0px 4px 4px #b4b4b4;
  background-color: #8cc850;
  height: 34rem;
  display: flex;
  flex-direction: column;
}
#gorev {
  background-color: #ffd700;
  color: white;
}
#aliskanlik {
  background-color: #dc370f;
  color: white;
}

.card-body {
  flex: 1 1 auto;
}
.card-footer {
  height: 600px;
}
.list-group-item {
  border: 3px solid black;
  margin: 0.5rem;
  border-radius: 1rem !important;
}
.row {
  margin: 1rem 3rem 10rem 3rem;
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

.btn-close {
  filter: invert(1);
}
.pixel-btn {
  border: none;
  padding: 0;
  background: none;
  cursor: pointer;
}

.pixel-btn img {
  image-rendering: pixelated;
  width: 150px;
  height: auto;
  transition: transform 0.2s;
}

.pixel-btn:hover img {
  transform: scale(1.05);
}
</style>
