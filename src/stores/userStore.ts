import { defineStore } from 'pinia'
import type { Interaction, UserProfile } from '@/types/models'
import { getCurrentUserProfile, registerUser, signInWithEmail, signOut } from '@/api/auth'
import { fetchInteractions } from '@/api/interaction'

interface UserState {
  profile: UserProfile | null
  loading: boolean
  interactions: Interaction[]
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    profile: null,
    loading: false,
    interactions: [],
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.profile),
  },
  actions: {
    async init() {
      this.loading = true
      try {
        const profile = await getCurrentUserProfile()
        this.profile = profile
        if (profile) {
          this.interactions = await fetchInteractions()
        }
      } finally {
        this.loading = false
      }
    },
    async login(email: string, password: string) {
      this.loading = true
      try {
        this.profile = await signInWithEmail(email, password)
        this.interactions = await fetchInteractions()
      } finally {
        this.loading = false
      }
    },
    async register(payload: {
      email: string
      password: string
      username: string
      college: string
      major: string
      tags: string[]
    }) {
      this.loading = true
      try {
        this.profile = await registerUser({
          email: payload.email,
          password: payload.password,
          username: payload.username,
          college: payload.college,
          major: payload.major,
          tags: payload.tags,
        })
        this.interactions = await fetchInteractions()
      } finally {
        this.loading = false
      }
    },
    async logout() {
      await signOut()
      this.profile = null
      this.interactions = []
    },
  },
})
