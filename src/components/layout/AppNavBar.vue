<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const route = useRoute()
const { isAuthenticated, profile, logout } = useAuth()

const navItems = [
  { label: '首页', path: '/' },
  { label: '发布', path: '/publish' },
  { label: '组队', path: '/team' },
  { label: '个人', path: '/profile' },
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
  <nav class="sidebar-nav">
    <!-- Logo -->
    <div class="mb-12">
      <RouterLink to="/" class="text-2xl font-sans font-bold text-charcoal">
        InfoCross
      </RouterLink>
      <p class="font-sans text-sm text-slate mt-2">跨学科信息聚合</p>
    </div>

    <!-- 导航菜单 -->
    <div class="flex-1 space-y-2">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center px-4 py-3 rounded-soft font-sans text-body transition-all duration-300"
        :class="activePath === item.path 
          ? 'bg-morandi-lavender/10 text-charcoal font-semibold' 
          : 'text-slate hover:bg-morandi-lavender/5 hover:text-charcoal'"
      >
        <span>{{ item.label }}</span>
      </RouterLink>
    </div>

    <!-- 用户信息 -->
    <div class="mt-auto pt-6 border-t border-slate/20">
      <div v-if="!isAuthenticated" class="space-y-3">
        <button 
          @click="goAuth"
          class="w-full px-4 py-3 rounded-soft bg-charcoal text-white font-sans font-medium transition-all duration-300 hover:scale-105"
        >
          登录
        </button>
      </div>
      <div v-else class="space-y-3">
        <div class="flex items-center gap-3 px-3">
          <div class="w-10 h-10 rounded-full bg-morandi-lavender/20 flex items-center justify-center text-morandi-lavender font-sans font-semibold">
            {{ profile?.username?.charAt(0)?.toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-sans text-sm font-medium text-charcoal truncate">{{ profile?.username }}</p>
            <p class="font-sans text-xs text-slate">{{ profile?.college }}</p>
          </div>
        </div>
        <button 
          @click="handleLogout"
          class="w-full px-4 py-2 rounded-soft border border-slate/20 font-sans text-sm text-slate transition-all duration-300 hover:bg-slate/5"
        >
          退出登录
        </button>
      </div>
    </div>
  </nav>
</template>
