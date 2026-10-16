<template>
  <div class="form-content bg-color-white">
    <!--kullanıcı nickname-->
    <div class="mb-3">
      <input
        type="text"
        placeholder="Kullanıcı Adı"
        id="nickname"
        class="form-control"
        v-model="nickname"
        required
      />
    </div>

    <!-- Şifre girişi -->
    <div class="mb-3 position-relative">
      <input
        :type="show ? 'text' : 'password'"
        placeholder="Şifre"
        id="password"
        class="form-control"
        v-model="password"
        required
      />
      <button type="button" class="btn btn-sm toggle-password-btn" @click="show = !show">
        <i :class="show ? 'bi bi-eye' : 'bi bi-eye-slash'"></i>
      </button>
    </div>

    <!-- Giriş butonu -->
    <button type="button" @click="girisYap" class="btn w-100 button">Giriş Yap</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const nickname = ref('')
const password = ref('')
const show = ref(false)

// giriş yapma fonksiyonu
const girisYap = async () => {
  // boş alan kontrolü
  if (!nickname.value || !password.value) {
    alert('Lütfen kullanıcı adı ve şifrenizi girin.')
    return
  }
  //api isteği gönder
  try {
    const response = await axios.post('http://localhost:3000/login', {
      kullanici_nickname: nickname.value,
      kullanici_sifre: password.value,
    })

    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      router.push('/dashboard')
    } else {
      alert('Giriş başarısız.')
    }
    console.log(response)

    console.log('Giriş Başarılı', response.data)

    //Formu temizle
    nickname.value = ''
    password.value = ''
  } catch (error) {
    ;('')
    console.error('notFound', error)
    alert('Kullanıcı adı yada şifre yanlış.')
  }
}
</script>

<style scoped>
.form-content {
  padding: 25px;
}
input {
  background-color: rgba(255, 255, 255, 0.3);
  border: none;
}

.button {
  background-color: #ff6400;
  color: white;
  border-radius: 5rem;
}

/* Göz ikonu pozisyonu */
.toggle-password-btn {
  position: absolute;
  top: 5px;
  right: 10px;
  background: none;
  border: none;
  color: #6c757d;
}
</style>
