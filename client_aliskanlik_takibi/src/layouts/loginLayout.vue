<template>
  <div class="gradient-background">
    <div v-if="$route.path === '/dashboard'">
      <RouterView />
    </div>

    <div v-else class="main-bg">
      <div class="container d-flex justify-content-center align-items-center min-vh-100">
        <div class="card shadow-lg custom-card">
          <!-- Sekmeler -->
          <ul class="nav nav-tabs nav-fill text-white">
            <li class="nav-item">
              <RouterLink
                class="nav-link"
                :class="{ active: $route.path === '/giris' }"
                to="/giris"
              >
                Giriş Yap
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink
                class="nav-link"
                :class="{ active: $route.path === '/kayitol' }"
                to="/kayitol"
              >
                Kayıt Ol
              </RouterLink>
            </li>
          </ul>

          <!-- İçerik -->
          <div class="card-body text-center">
            <RouterView />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-card {
  width: 35%;
  min-width: 350px;
  min-height: 450px;
  background-color: rgba(255, 255, 255, 0.364);
  border-radius: 15px;
  overflow: hidden;
}
.custom-card > .nav-tabs {
  border-radius: 15px 15px 0 0;
  border-bottom: none;
  overflow: hidden;
}

.custom-card > .nav-tabs .nav-link {
  border-radius: 15px 15px 15px 15px;
}

.custom-card > .nav-tabs .nav-link.active {
  border-radius: 15px 15px 15px 15px;
}

.nav-tabs .nav-link.active {
  background-color: #ff6400 !important;
  color: white !important;
  border: none;
}
.gradient-background {
  height: 100vh;
  background-color: #8cc850;
  color: white;
}
</style>
