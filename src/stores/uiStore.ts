import { defineStore } from 'pinia'

interface UiState {
  sidebarOpen: boolean
  globalLoading: boolean
}

export const useUiStore = defineStore('ui', {
  state: (): UiState => ({
    sidebarOpen: false,
    globalLoading: false,
  }),
  actions: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
    setLoading(state: boolean) {
      this.globalLoading = state
    },
  },
})
