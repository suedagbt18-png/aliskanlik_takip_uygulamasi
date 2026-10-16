<template>
  <div class="profile-card">
    <img src="@/assets/avatar.png" alt="Avatar" class="avatar" />
    <h3 class="username">{{ userInfo.userName }} {{ userInfo.userSurname }}</h3>
    <p class="handle">@{{ userInfo.userNickname }}</p>
    <p class="level">{{ userInfo.userLevel }} seviye {{ userInfo.userTitle }}</p>
    <p class="hp">HP:{{ userInfo.userHP }}</p>
    <p class="xp">XP: {{ userInfo.userXP }}</p>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
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
  },
  mounted() {
    this.getUserProfile()
  },
}
</script>

<style scoped>
.profile-card {
  background: #8cc850;
  font-family: monospace;
  border: 4px solid black;
  box-shadow: 0px 0px 4px 4px #b4b4b4;
  color: white;
  padding: 20px;
  border-radius: 10px;
  width: 250px;
  text-align: center;
  margin-top: 3rem;
  margin-left: 1rem;
}
.avatar {
  width: 80px;
  border-radius: 50%;
}
.level {
  margin-top: 10px;
  font-weight: bold;
}
</style>
