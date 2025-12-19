<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ProfileHeader from '@/components/profile/ProfileHeader.vue'
import UserStats from '@/components/profile/UserStats.vue'
import ActionGrid from '@/components/profile/ActionGrid.vue'
import TabSwitcher from '@/components/profile/TabSwitcher.vue'
import ProfileEditForm from '@/components/profile/ProfileEditForm.vue'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'
import { User, LogOut } from 'lucide-vue-next'

const { t } = useI18n()
const { profile, logout } = useAuth()
const router = useRouter()

const isEditModalOpen = ref(false)

function openEditModal() {
  isEditModalOpen.value = true
}

function closeEditModal() {
  isEditModalOpen.value = false
}

function handleStatNavigate(id: string) {
  // 根据统计项导航到对应页面
  switch (id) {
    case 'bookmarks':
      router.push('/bookmarks')
      break
    case 'activities':
      router.push('/activities')
      break
    case 'teams':
      router.push('/team')
      break
    case 'credit':
      router.push('/credit')
      break
  }
}

function handleAction(action: string) {
  // 处理功能磁贴点击
  switch (action) {
    case 'team':
      router.push('/team')
      break
    case 'progress':
      router.push('/progress')
      break
    case 'forum':
      router.push('/forum')
      break
    case 'security':
      router.push('/settings')
      break
  }
}

function handleTabNavigate(tab: string, itemId: number) {
  // 处理列表项点击
  console.log('Navigate to:', tab, itemId)
}

async function handleLogout() {
  await logout()
  router.push('/')
}
</script>

<template>
  <div v-if="profile" class="min-h-screen bg-cream">
    <!-- 顶部：个人资料卡 -->
    <ProfileHeader 
      :profile="profile" 
      @edit="openEditModal"
    />
    
    <!-- 中部：状态数据栏 -->
    <UserStats @navigate="handleStatNavigate" />
    
    <!-- 主体：功能磁贴区 -->
    <ActionGrid @action="handleAction" />
    
    <!-- 底部：内容列表切换 -->
    <TabSwitcher @navigate="handleTabNavigate" />

    <!-- 退出登录按钮 -->
    <div class="px-6 py-8">
      <button 
        @click="handleLogout"
        class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-soft border border-red-200 text-red-500 font-sans text-sm font-medium transition-all duration-200 hover:bg-red-50 hover:border-red-300"
      >
        <LogOut :size="18" />
        <span>{{ t('common.logout') }}</span>
      </button>
    </div>
  </div>

  <!-- 未登录状态 -->
  <div v-else class="min-h-screen bg-cream flex items-center justify-center">
    <div class="text-center">
      <div class="w-16 h-16 rounded-full bg-slate/10 flex items-center justify-center mx-auto mb-6">
        <User :size="32" class="text-slate" />
      </div>
      <h2 class="text-h2 font-sans font-bold text-charcoal mb-3">{{ t('profile.notLoggedIn') }}</h2>
      <p class="text-body font-sans text-slate mb-8">{{ t('profile.notLoggedInDesc') }}</p>
      <button 
        @click="$router.push('/auth')"
        class="px-6 py-3 rounded-soft bg-morandi-lavender text-white font-sans font-medium hover:bg-morandi-lavender/90 transition-colors"
      >
        {{ t('profile.goLogin') }}
      </button>
    </div>
  </div>

  <!-- 编辑模态框 -->
  <Transition name="fade">
    <div 
      v-if="isEditModalOpen && profile" 
      class="fixed inset-0 bg-charcoal/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click="closeEditModal"
    >
      <div 
        class="bg-cream rounded-morandi shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <ProfileEditForm 
          :profile="profile"
          @close="closeEditModal"
          @updated="closeEditModal"
        />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
