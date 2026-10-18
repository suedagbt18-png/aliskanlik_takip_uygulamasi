<template> 
  <footer class="footer">
    <img :src="logo" alt="logo" class="footer-logo" />
    <p>© {{ yil }} Sueda. Tüm hakları saklıdır.</p>
  </footer>
</template>

<script setup>
import logo from '@/assets/logo.png'

const yil = new Date().getFullYear()
</script>

<style scoped>

.footer {
  background-color: #8cc850;
  border-top: 4px solid black;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: white;
  font-family: monospace;
}
.footer p {
  margin: 0;
}
.footer-logo {
  height: 32px;
  image-rendering: pixelated;
}
</style>
