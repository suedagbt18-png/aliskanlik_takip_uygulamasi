import { createRouter, createWebHistory } from 'vue-router'

import KayitOl from '@/views/KayitOl.vue'
import Giris from '@/views/Giris.vue'
import Dashboard from '@/views/Dashboard.vue'
import Gorevler from '@/views/Gorevler.vue'
import loginLayout from '@/layouts/loginLayout.vue'
import Aliskanliklar from '@/views/Aliskanliklar.vue'
import Yardım from '@/views/Yardım.vue'
import AniDefteri from '@/views/AniDefteri.vue'
import Ciftlik from '@/views/Ciftlik.vue'

const routes = [
  {
    path: '/',
    name: 'Giris',
    redirect: '/giris',
  },
  {
    path: '/',
    component: loginLayout,
    children: [
      { path: 'giris', component: Giris },
      { path: 'kayitol', component: KayitOl },
    ],
  },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/gorevler', component: Gorevler, meta: { requiresAuth: true } },
  { path: '/aliskanliklar', component: Aliskanliklar, meta: { requiresAuth: true } },
  { path: '/yardım', component: Yardım, meta: { requiresAuth: true } },
  { path: '/ani-defteri', component: AniDefteri, meta: { requiresAuth: true } },
  { path: '/ciftlik', component: Ciftlik, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

//korumalı sayfa özelliği
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token')

  // Eğer korumalı sayfaya gitmek istiyor ama giriş yapmamışsa
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Giris' })
  } else {
    next()
  }
})

export default router
