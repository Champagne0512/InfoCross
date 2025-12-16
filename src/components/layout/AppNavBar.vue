<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppButton from '@/components/common/AppButton.vue'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const route = useRoute()
const { isAuthenticated, profile, logout } = useAuth()

const navItems = [
  { label: '仪表盘', path: '/' },
  { label: '发布/组队', path: '/publish' },
  { label: '数字身份', path: '/profile' },
]

const active = computed(() => route.path)

function goAuth() {
  router.push({ path: '/auth', query: { redirect: route.fullPath } })
}

async function handleLogout() {
  await logout()
  router.push('/')
}
</script>

<template>
  <header class="border-b border-border bg-canvas/80 backdrop-blur-sm">
    <div class="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-5">
      <div class="flex items-center gap-6">
        <RouterLink to="/" class="font-display text-xl tracking-[0.2em] text-ink">InfoCross</RouterLink>
        <nav class="hidden items-center gap-2 md:flex">
          <RouterLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="pill-button"
            :class="{ 'is-active': active === item.path }"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
      </div>
      <div class="flex items-center gap-3">
        <div class="hidden items-center gap-3 rounded-full bg-neutral px-4 py-2 font-data text-xs text-ink-soft sm:flex">
          <span>今日新增 12</span>
          <span class="text-ink">破壁指数 89%</span>
        </div>
        <AppButton v-if="!isAuthenticated" variant="ghost" @click="goAuth">登录</AppButton>
        <div v-else class="flex items-center gap-3">
          <span class="font-data text-xs text-ink-soft">{{ profile?.username ?? 'Explorer' }}</span>
          <AppButton variant="ghost" @click="handleLogout">退出</AppButton>
        </div>
        <AppButton variant="primary">AI Brief</AppButton>
      </div>
    </div>
  </header>
</template>
