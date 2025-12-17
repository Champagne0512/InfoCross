<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useFrequencyStore } from '@/stores/frequencyStore'
import FrequencySwitch from '@/components/common/FrequencySwitch.vue'
import BinaryOrbitAnimation from '@/components/common/BinaryOrbitAnimation.vue'

const router = useRouter()
const route = useRoute()
const { isAuthenticated, profile, logout } = useAuth()
const frequencyStore = useFrequencyStore()

const navItems = computed(() => {
  if (frequencyStore.isFocus) {
    return [
      { label: '首页', path: '/' },
      { label: '发布', path: '/publish' },
      { label: '组队', path: '/team' },
      { label: '论坛', path: '/forum' },
      { label: '个人', path: '/profile' },
    ]
  }
  return [
    { label: '动态', path: '/' },
    { label: '发起', path: '/publish' },
    { label: '约伴', path: '/team' },
    { label: '论坛', path: '/forum' },
    { label: '我的', path: '/profile' },
  ]
})

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
    <div class="mb-8">
      <RouterLink to="/" class="text-2xl font-sans font-bold text-charcoal">
        InfoCross
      </RouterLink>
      <p class="font-sans text-sm text-slate mt-1">
        {{ frequencyStore.isFocus ? '跨学科信息聚合' : '校园生活脉动' }}
      </p>
    </div>

    <!-- 频率切换器 -->
    <div class="mb-6 pb-6 border-b border-slate/10">
      <!-- 双天体轨道动画 -->
      <BinaryOrbitAnimation class="mb-4" />
      <FrequencySwitch />
      <p class="font-sans text-xs text-slate mt-3 text-center">
        {{ frequencyStore.config.desc }}
      </p>
    </div>

    <!-- 导航菜单 -->
    <div class="flex-1 space-y-2">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center px-4 py-3 rounded-soft font-sans text-body transition-all duration-300"
        :class="[
          activePath === item.path 
            ? (frequencyStore.isFocus 
                ? 'bg-focus-primary/15 text-focus-accent font-semibold' 
                : 'bg-vibe-primary/15 text-vibe-accent font-semibold')
            : 'text-slate hover:bg-slate/5 hover:text-charcoal'
        ]"
      >
        <span>{{ item.label }}</span>
      </RouterLink>
    </div>

    <!-- 用户信息 -->
    <div class="mt-auto pt-6 border-t border-slate/20">
      <div v-if="!isAuthenticated" class="space-y-3">
        <button 
          @click="goAuth"
          class="w-full px-4 py-3 rounded-soft text-white font-sans font-medium transition-all duration-300 hover:scale-105"
          :class="frequencyStore.isFocus 
            ? 'bg-focus-accent hover:bg-focus-accent/90' 
            : 'bg-vibe-accent hover:bg-vibe-accent/90'"
        >
          登录
        </button>
      </div>
      <div v-else class="space-y-3">
        <div class="flex items-center gap-3 px-3">
          <div v-if="profile?.avatarUrl" class="w-10 h-10 rounded-full overflow-hidden">
            <img :src="profile.avatarUrl" :alt="profile.username" class="w-full h-full object-cover" />
          </div>
          <div 
            v-else 
            class="w-10 h-10 rounded-full flex items-center justify-center font-sans font-semibold"
            :class="frequencyStore.isFocus 
              ? 'bg-focus-primary/20 text-focus-accent' 
              : 'bg-vibe-primary/20 text-vibe-accent'"
          >
            {{ profile?.username?.charAt(0)?.toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-sans text-sm font-medium text-charcoal truncate">{{ profile?.username }}</p>
          </div>
        </div>
        <button 
          @click="handleLogout"
          class="w-full px-4 py-3 rounded-soft text-white font-sans text-sm font-medium transition-all duration-300 hover:shadow-morandi-lg hover:scale-105 active:scale-95"
          :class="frequencyStore.isFocus 
            ? 'bg-focus-accent hover:bg-focus-accent/90' 
            : 'bg-vibe-accent hover:bg-vibe-accent/90'"
        >
          退出登录
        </button>
      </div>
    </div>
  </nav>
</template>
