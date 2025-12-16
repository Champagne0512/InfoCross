<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppButton from '@/components/common/AppButton.vue'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const route = useRoute()
const { isAuthenticated, profile, logout } = useAuth()

const navItems = [
  { label: '破壁信息流', path: '/' },
  { label: '发布活动', path: '/publish' },
  { label: '个人空间', path: '/profile' },
]

const activePath = computed(() => route.path)

async function handleLogout() {
  await logout()
  router.push('/')
}

function goAuth() {
  router.push({ path: '/auth', query: { redirect: route.fullPath } })
}
</script>

<template>
  <nav class="nav-glass sticky top-0 z-50">
    <div class="flex items-center gap-8">
      <RouterLink to="/" class="text-h2 font-display font-semibold gradient-text">InfoCross</RouterLink>
      <div class="hidden md:flex items-center gap-6">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="font-body text-body transition-all duration-300 hover:text-neon-cyan"
          :class="activePath === item.path ? 'text-neon-cyan' : 'text-text-secondary'"
        >
          {{ item.label }}
        </RouterLink>
      </div>
    </div>
    <div class="flex items-center gap-4">
      <AppButton v-if="!isAuthenticated" variant="glass" @click="goAuth">登录</AppButton>
      <div v-else class="flex items-center gap-4">
        <span class="font-mono text-mono text-text-secondary">
          {{ profile?.username }}
        </span>
        <AppButton variant="glass" @click="handleLogout">退出</AppButton>
      </div>
      <AppButton variant="neon">AI 摘要</AppButton>
    </div>
  </nav>
</template>
