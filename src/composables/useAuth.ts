import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useUserStore } from '@/stores/userStore'

export function useAuth() {
  const userStore = useUserStore()
  const { profile, loading, interactions } = storeToRefs(userStore)

  const isAuthenticated = computed(() => userStore.isAuthenticated)

  return {
    profile,
    loading,
    interactions,
    isAuthenticated,
    login: userStore.login,
    register: userStore.register,
    logout: userStore.logout,
    init: userStore.init,
  }
}
