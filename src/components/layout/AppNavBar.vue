<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/i18n'
import { useAuth } from '@/composables/useAuth'
import { useFrequencyStore } from '@/stores/frequencyStore'
import FrequencySwitch from '@/components/common/FrequencySwitch.vue'
import BinaryOrbitAnimation from '@/components/common/BinaryOrbitAnimation.vue'
import { 
  LogOut, 
  User, 
  Settings, 
  ChevronUp,
  Home,
  Compass,
  Users,
  MessageCircle,
  LayoutGrid,
  Zap
} from 'lucide-vue-next'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const { isAuthenticated, profile, logout } = useAuth()
const frequencyStore = useFrequencyStore()

const showUserMenu = ref(false)

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

function closeUserMenu() {
  showUserMenu.value = false
}

const navItems = computed(() => {
  if (frequencyStore.isFocus) {
    return [
      { label: '首页', path: '/', icon: Home },
      { label: '发现', path: '/team', icon: Compass },
      { label: '协作', path: '/team/hub', icon: Users },
      { label: '论坛', path: '/forum', icon: LayoutGrid },
      { label: '消息', path: '/inbox', icon: MessageCircle },
      { label: '个人', path: '/profile', icon: User },
    ]
  }
  return [
    { label: '动态', path: '/', icon: Zap },
    { label: '发现', path: '/team', icon: Compass },
    { label: '协作', path: '/team/hub', icon: Users },
    { label: '论坛', path: '/forum', icon: LayoutGrid },
    { label: '消息', path: '/inbox', icon: MessageCircle },
    { label: '我的', path: '/profile', icon: User },
  ]
})

const activePath = computed(() => route.path)

async function handleLogout() {
  closeUserMenu()
  await logout()
  router.push('/')
}

function goToProfile() {
  closeUserMenu()
  router.push('/profile')
}

function goToSettings() {
  closeUserMenu()
  router.push('/settings')
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
        {{ frequencyStore.isFocus ? t('sidebar.focusSlogan') : t('sidebar.vibeSlogan') }}
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
        class="flex items-center gap-3 px-4 py-3 rounded-soft font-sans text-body transition-all duration-300"
        :class="[
          activePath === item.path 
            ? (frequencyStore.isFocus 
                ? 'bg-focus-primary/15 text-focus-accent font-semibold' 
                : 'bg-vibe-primary/15 text-vibe-accent font-semibold')
            : 'text-slate hover:bg-slate/5 hover:text-charcoal'
        ]"
      >
        <component 
          :is="item.icon" 
          :size="18" 
          :stroke-width="activePath === item.path ? 2.2 : 1.8"
          class="flex-shrink-0"
        />
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
          {{ t('common.login') }}
        </button>
      </div>
      <div v-else class="relative">
        <!-- 用户信息区域（可点击） -->
        <div 
          @click="toggleUserMenu"
          class="px-3 py-2 rounded-soft cursor-pointer transition-all duration-200 hover:bg-slate/5"
        >
          <!-- 箭头按钮 - 显示在头像上方 -->
          <div class="flex justify-center mb-2">
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
              :class="showUserMenu ? 'rotate-180' : ''"
            >
              <ChevronUp :size="18" class="text-slate" />
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div v-if="profile?.avatarUrl" class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <img :src="profile.avatarUrl" :alt="profile.username" class="w-full h-full object-cover" />
            </div>
            <div 
              v-else 
              class="w-10 h-10 rounded-full flex items-center justify-center font-sans font-semibold flex-shrink-0"
              :class="frequencyStore.isFocus 
                ? 'bg-focus-primary/20 text-focus-accent' 
                : 'bg-vibe-primary/20 text-vibe-accent'"
            >
              {{ profile?.username?.charAt(0)?.toUpperCase() }}
            </div>
            <div class="flex flex-col justify-between h-10 flex-1 min-w-0">
              <p class="font-sans text-base font-semibold text-charcoal truncate">{{ profile?.username }}</p>
              <span class="inline-flex items-center gap-1 text-[11px] text-slate/70">
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="frequencyStore.isFocus ? 'bg-focus-accent' : 'bg-vibe-accent'"
                />
                在线
              </span>
            </div>
          </div>
          <p
            v-if="profile?.bio"
            class="font-sans text-xs text-slate/80 mt-2 line-clamp-2 leading-snug"
          >
            {{ profile.bio }}
          </p>
        </div>

        <!-- 用户菜单弹出卡片 -->
        <Transition name="popup">
          <div 
            v-if="showUserMenu"
            class="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-morandi shadow-morandi-lg border border-slate/10 overflow-hidden z-50"
          >
            <div class="p-3 border-b border-slate/10">
              <p class="font-sans text-sm font-medium text-charcoal">{{ profile?.username }}</p>
              <p class="font-sans text-xs text-slate">{{ profile?.email || t('sidebar.emailNotSet') }}</p>
            </div>
            <div class="py-1">
              <button 
                @click="goToProfile"
                class="w-full flex items-center gap-3 px-4 py-2.5 text-left font-sans text-sm text-charcoal hover:bg-slate/5 transition-colors"
              >
                <User :size="16" class="text-slate" />
                <span>{{ t('nav.profile') }}</span>
              </button>
              <button 
                @click="goToSettings"
                class="w-full flex items-center gap-3 px-4 py-2.5 text-left font-sans text-sm text-charcoal hover:bg-slate/5 transition-colors"
              >
                <Settings :size="16" class="text-slate" />
                <span>{{ t('nav.settings') }}</span>
              </button>
              <button 
                @click="handleLogout"
                class="w-full flex items-center gap-3 px-4 py-2.5 text-left font-sans text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut :size="16" />
                <span>{{ t('common.logout') }}</span>
              </button>
            </div>
          </div>
        </Transition>

        <!-- 点击外部关闭菜单的遮罩 -->
        <div 
          v-if="showUserMenu"
          class="fixed inset-0 z-40"
          @click="closeUserMenu"
        />
      </div>
    </div>
  </nav>
</template>

<style scoped>
.popup-enter-active,
.popup-leave-active {
  transition: all 0.2s ease;
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
