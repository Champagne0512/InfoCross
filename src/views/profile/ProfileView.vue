<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import DigitalIDCard from '@/components/profile/DigitalIDCard.vue'
import SkillRadar from '@/components/profile/SkillRadar.vue'
import ActivityHeatmap from '@/components/profile/ActivityHeatmap.vue'
import ReputationTags from '@/components/profile/ReputationTags.vue'
import UserProfileTabs from '@/components/profile/UserProfileTabs.vue'
import ProfileEditForm from '@/components/profile/ProfileEditForm.vue'
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/userStore'

const { profile } = useAuth()
const userStore = useUserStore()
const { loading } = storeToRefs(userStore)

const isEditModalOpen = ref(false)

function openEditModal() {
  isEditModalOpen.value = true
}

function closeEditModal() {
  isEditModalOpen.value = false
}
</script>

<template>
  <div class="space-y-10">
    <!-- Bento Grid 上半部分 -->
    <section class="grid gap-8 lg:grid-cols-3">
      <!-- 左侧：数字工牌（占1份） -->
      <div class="lg:col-span-1">
        <DigitalIDCard 
          v-if="profile" 
          :profile="profile" 
          @edit="openEditModal"
        />
        <div v-else class="bg-white rounded-morandi p-8 shadow-morandi h-full flex items-center justify-center">
          <p class="text-slate">请先登录</p>
        </div>
      </div>
      
      <!-- 右侧：能力雷达图（占2份） -->
      <div class="lg:col-span-2">
        <SkillRadar />
      </div>
    </section>

    <!-- Bento Grid 中间部分 -->
    <section class="grid gap-8 lg:grid-cols-2">
      <!-- 左侧：破壁足迹 -->
      <div class="lg:col-span-1">
        <ActivityHeatmap />
      </div>
      
      <!-- 右侧：队友评价 -->
      <div class="lg:col-span-1">
        <ReputationTags />
      </div>
    </section>

    <!-- 底部：全宽内容选项卡 -->
    <section>
      <UserProfileTabs />
    </section>
  </div>

  <!-- 编辑模态框 -->
  <Transition name="fade">
    <div 
      v-if="isEditModalOpen" 
      class="fixed inset-0 bg-charcoal/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click="closeEditModal"
    >
      <div 
        class="bg-cream rounded-morandi shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <ProfileEditForm 
          v-if="profile"
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
