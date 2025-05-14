import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import Calendar from '@/views/Calendar.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/Admin.vue'),
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: Calendar,
    },
    {
      path: '/details/:id',
      name: 'details',
      component: () => import('@/views/ActivityDetail/ActivityDetail.vue'),
    },
    {
      path: '/multi-map',
      name: 'multimap',
      component: () => import('@/views/MultiMap.vue'),
    },
    {
      path: '/personal-records',
      name: 'personal-records',
      component: () => import('@/views/PersonalRecords.vue'),
    },
    {
      path: '/volume',
      name: 'volume',
      component: () => import('@/views/Volume.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue'),
    },
  ],
})

export default router
