<template>
  <footer class="footer">
    <div class="footer-content">
      <p>© 2025 Sueda. Tüm hakları saklıdır.</p>
      <img :src="logo" alt="logo" style="height: 50px" />
    </div>
  </footer>
</template>

<script setup>
import logo from '@/assets/logo.png'
</script>

<style scoped>
.footer {
  background-color: #8cc850;
  padding: 1.5rem;
  height: 70px;
  width: 100vw;

  position: fixed;
  bottom: 0px;
  left: 0px;

  text-align: center;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
</style>
