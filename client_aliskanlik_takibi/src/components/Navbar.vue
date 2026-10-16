<template>
  <Router-view>
    <nav class="navbar navbar-expand-lg">
      <div class="container-fluid">
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <!--navbar sol kısım-->
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <img :src="logo" alt="logo" style="height: 40px" />
            </li>
            <li class="nav-item">
              <RouterLink
                class="nav-link"
                :class="{ active: $route.path === '/dashboard' }"
                to="/dashboard"
              >
                Anasayfa
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink
                class="nav-link"
                :class="{ active: $route.path === '/gorevler' }"
                to="/gorevler"
              >
                Görevler
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink
                class="nav-link"
                :class="{ active: $route.path === '/aliskanliklar' }"
                to="/aliskanliklar"
              >
                Alışkanlıklar
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink
                class="nav-link"
                :class="{ active: $route.path === '/yardım' }"
                to="/yardım"
              >
                Yardım
              </RouterLink>
            </li>
          </ul>
          <!-- navbar sağ kısım-->
          <div class="d-flex align-items-center ms-auto">
            <button type="button" class="btn" data-bs-toggle="modal" data-bs-target="#profilModal">
              <i> <img :src="profil" alt="profil" class="profil-img" style="height: 40px" /></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
    <!-- profil modalım -->
    <div
      class="modal fade"
      id="profilModal"
      tabindex="-1"
      aria-hidden="true"
      data-bs-backdrop="false"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><img :src="avatar" alt="avatar" style="height: 90px" /></h5>
            <div class="text-center">
              <h6 class="mb-1">{{ userInfo.userName }} {{ userInfo.userSurname }}</h6>
              <!--kullanıcı adı soyadı -->
              <p class="text-muted mb-0">
                @{{ userInfo.userNickname }} {{ userInfo.userLevel }} seviye
              </p>
              <!--kullanıcı nickname-->
              <p class="text-muted mb-0">{{ userInfo.userTitle }}</p>
              <!--seviye bilgisi-->
            </div>
            <!--kapatma butonu-->
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Kapat"
            ></button>

            <!--modal içeriği başla=> dinamik artık dinamik düzenlenmeli !!!!!!!!!!!-->
          </div>
          <div class="modal-body text-center">
            <h6 class="mb-1"></h6>
            <p class="text-muted mb-0"></p>
            <p class="text-muted mb-0"></p>
          </div>
          <!--modal içeriği bitiş-->

          <!--çıkış butonu-->
          <div class="modal-footer justify-content-end">
            <button type="button" class="btn btn-danger" @click="cikisYap">Çıkış Yap</button>
          </div>
        </div>
      </div>
    </div>
  </Router-view>
</template>

<script>
import { useRouter } from 'vue-router'
import axios from 'axios'
import avatar from '@/assets/avatar.png'
import logo from '@/assets/logo.png'
import profil from '@/assets/profil.png'
const router = useRouter()

export default {
  data() {
    return {
      avatar: avatar,
      logo: logo,
      profil: profil,
      userInfo: {
        userName: '',
        userSurname: '',
        userNickname: '',
        userLevel: '',
        userHP: '',
        userXP: '',
        userTitle: '',
      },
    }
  },
  methods: {
    getUserProfile() {
      console.log(profil)
      const token = localStorage.getItem('token')
      axios
        .get('http://localhost:3000/getUserInfo', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          this.userInfo = {
            userName: res.data.name,
            userSurname: res.data.surname,
            userNickname: res.data.nickname,
            userLevel: res.data.level,
            userHP: res.data.hp,
            userXP: res.data.xp,
            userTitle: res.data.title,
          }
        })
        .catch((err) => {
          console.error('Profil yüklenemedi:', err)
        })
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
}
.nav-link {
  color: white;
}
.profil-img {
  transition: 0.3s;
}

.profil-img:hover {
  transform: scale(1.2);
}
</style>
