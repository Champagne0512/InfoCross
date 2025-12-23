<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@/i18n'
import ProfileHeader from '@/components/profile/ProfileHeader.vue'
import ActionGrid from '@/components/profile/ActionGrid.vue'
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

function handleAction(action: string) {
  switch (action) {
    case 'history':
      router.push('/profile/history')
      break
    case 'bookmarks':
      router.push('/bookmarks')
      break
    case 'forum':
      router.push('/profile/posts')
      break
    case 'security':
      router.push('/settings')
      break
  }
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
    
    <!-- 主体：功能磁贴区 -->
    <ActionGrid @action="handleAction" />

    <!-- 退出登录按钮 -->
    <div class="max-w-6xl mx-auto px-6 py-8">
      <button class="logout-btn" @click="handleLogout">
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
.logout-btn {
  @apply w-full flex items-center justify-center gap-2 px-4 py-3 rounded-soft;
  @apply border border-red-200 text-red-500 font-sans text-sm font-medium;
  @apply transition-all duration-200 hover:bg-red-50 hover:border-red-300;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
