import { createRouter, createWebHistory } from 'vue-router'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { routes } from './routes'
import { useUserStore } from '@/stores/userStore'

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(
  async (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const userStore = useUserStore()
    if (!userStore.profile && !userStore.loading) {
      await userStore.init()
    }

    if (to.meta?.requiresAuth && !userStore.isAuthenticated) {
      next({ path: '/auth', query: { redirect: to.fullPath } })
      return
    }

    if (typeof to.meta?.title === 'string') {
      document.title = to.meta.title
    }

    next()
  },
)

export default router
