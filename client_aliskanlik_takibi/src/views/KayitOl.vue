<template>
  <div class="form-content">
    <!-- Ad ve Soyad -->
    <div class="row mb-3">
      <div class="col">
        <input
          type="text"
          placeholder="İsim"
          id="firstName"
          class="form-control"
          v-model="firstName"
          required
        />
      </div>
      <div class="col">
        <input
          type="text"
          placeholder="Soy İsim"
          id="lastName"
          class="form-control"
          v-model="lastName"
          required
        />
      </div>
    </div>

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

    <!-- E-posta -->
    <div class="mb-3">
      <input
        type="email"
        placeholder="E-posta"
        id="email"
        class="form-control"
        v-model="email"
        required
      />
    </div>

    <!-- Şifre -->
    <div class="mb-3 position-relative">
      <input
        :type="showPassword ? 'text' : 'password'"
        placeholder="Şifre"
        id="password"
        class="form-control"
        v-model="password"
        required
      />
      <button
        type="button"
        class="btn btn-sm toggle-password-btn"
        @click="showPassword = !showPassword"
      >
        <i :class="showPassword ? 'bi bi-eye' : 'bi bi-eye-slash'"></i>
      </button>
    </div>

    <!-- Şifre Tekrar -->
    <div class="mb-3 position-relative">
      <input
        :type="showPasswordRepeat ? 'text' : 'password'"
        placeholder="Şifre tekrarı"
        id="passwordRepeat"
        class="form-control"
        v-model="passwordRepeat"
        required
      />
      <button
        type="button"
        class="btn btn-sm toggle-password-btn"
        @click="showPasswordRepeat = !showPasswordRepeat"
      >
        <i :class="showPasswordRepeat ? 'bi bi-eye' : 'bi bi-eye-slash'"></i>
      </button>
    </div>

    <!-- Kayıt Butonu -->
    <button type="button" @click="kayitOl" class="btn w-100 button">Kayıt Ol</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const firstName = ref('')
const lastName = ref('')
const nickname = ref('')
const email = ref('')
const password = ref('')
const passwordRepeat = ref('')
const showPassword = ref(false)
const showPasswordRepeat = ref(false)

// Kayıt olma fonksiyonu
const kayitOl = async () => {
  // boş alan kontrolü
  if (
    !firstName.value ||
    !lastName.value ||
    !nickname.value ||
    !email.value ||
    !password.value ||
    !passwordRepeat.value
  ) {
    alert('Lütfen tüm alanları doldurun.')
    return
  }
  // Şifre eşleşmiyor kontrolü
  if (password.value !== passwordRepeat.value) {
    alert('Şifreler uyuşmuyor!')
    return
  }

  // şifre uzunluğu kontrolü
  if (password.value.length < 8) {
    alert('Şifre en az 8 karakter olmalı.')
    return
  }

  //api isteği gönder
  try {
    const response = await axios.post('http://localhost:3000/register', {
      kullanici_adi: firstName.value,
      kullanici_soyadi: lastName.value,
      kullanici_nickname: nickname.value,
      kullanici_eposta: email.value,
      kullanici_sifre: password.value,
    })
    console.log(response)

    // burayı hallet başla------------------yapamadım!!!!!!
    if (response.data.code === 'db') {
      alert('Sunucu hatası.')
      return
    }

    if (response.data.code === 'alreadyExist') {
      alert('Bu e-posta veya kullanıcı adı zaten kayıtlı.')
      return
    }
    if (response.data.code === 'success') {
      console.log('success bloğuna girdi.')

      alert('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.')
    }
    // burayı hallet bitiş------------------------------------------

    console.log('Kayıt başarılı:', response.data)
    alert('Kayıt başarılı!')
    router.push({ name: 'Giris' }) // kayıt olduktan sonra giriş sayfasına yönlendiriyoruz.
    // Formu temizle
    firstName.value = ''
    lastName.value = ''
    nickname.value = ''
    email.value = ''
    password.value = ''
    passwordRepeat.value = ''
  } catch (error) {
    ;('')
    console.error('Kayıt hatası:', error)
    alert('Kayıt başarısız. Sunucuya bağlanılamadı veya geçersiz bilgi.')
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

.toggle-password-btn {
  position: absolute;
  top: 5px;
  right: 10px;
  background: none;
  border: none;
  color: #6c757d;
}
</style>
