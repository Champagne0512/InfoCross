<script setup lang="ts">
import { computed } from 'vue'
import type { UserProfile } from '@/types/models'
import { User, MapPin, Calendar } from 'lucide-vue-next'

const props = defineProps<{
  profile: UserProfile
}>()

const emit = defineEmits<{
  edit: []
}>()

const joinDate = computed(() => {
  const date = new Date()
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
})
</script>

<template>
  <section class="py-6">
    <div class="max-w-6xl mx-auto px-6">
      <div class="profile-card">
        <div class="card-glow"></div>
        <div class="flex flex-col lg:flex-row items-center lg:items-start gap-6 relative z-10">
          <!-- 左侧：头像 -->
          <div class="flex-shrink-0">
            <div class="avatar-container">
              <div 
                v-if="profile.avatarUrl"
                class="avatar-image"
              >
                <img 
                  :src="profile.avatarUrl" 
                  :alt="profile.username"
                  class="w-full h-full object-cover"
                />
              </div>
              <div 
                v-else
                class="avatar-placeholder"
              >
                {{ profile.username.charAt(0).toUpperCase() }}
              </div>
              <div class="avatar-ring"></div>
            </div>
          </div>
          
          <!-- 右侧：个人信息 -->
          <div class="flex-1 text-center lg:text-left">
            <!-- 姓名行 -->
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
              <h1 class="username-title">
                {{ profile.username }}
                <span class="title-underline"></span>
              </h1>
              
              <!-- 编辑按钮 -->
              <button 
                @click="emit('edit')"
                class="edit-btn group"
              >
                <div class="btn-bg"></div>
                <User class="w-4 h-4 text-slate relative z-10 transition-transform duration-300 group-hover:scale-110" />
                <span class="font-sans text-sm font-medium text-slate relative z-10">编辑资料</span>
              </button>
            </div>
            
            <!-- 基本信息 -->
            <div class="info-row">
              <div class="info-item">
                <MapPin class="w-4 h-4" />
                <span class="font-sans text-sm">{{ profile.college }}</span>
              </div>
              <span class="info-divider">|</span>
              <div class="info-item">
                <span class="font-sans text-sm">{{ profile.major }}</span>
              </div>
              <span class="info-divider">|</span>
              <div class="info-item">
                <Calendar class="w-4 h-4" />
                <span class="font-mono text-sm">{{ joinDate }} 加入</span>
              </div>
            </div>
            
            <!-- 个性签名 -->
            <p v-if="profile.bio" class="bio-text">
              "{{ profile.bio }}"
            </p>

            <!-- 兴趣标签 -->
            <div v-if="profile.tags && profile.tags.length > 0" class="tags-container">
              <span 
                v-for="(tag, index) in profile.tags" 
                :key="tag"
                class="tag-item"
                :style="{ animationDelay: `${index * 100}ms` }"
              >
                #{{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 卡片样式 */
.profile-card {
  @apply relative p-8 rounded-morandi bg-white/80 backdrop-blur-sm;
  @apply border border-slate/10 shadow-morandi;
  @apply transition-all duration-500;
  overflow: hidden;
}

.profile-card:hover {
  @apply shadow-morandi-lg;
  transform: translateY(-2px);
}

.card-glow {
  @apply absolute inset-0 opacity-0 transition-opacity duration-500;
  background: radial-gradient(circle at 30% 30%, rgba(147, 168, 172, 0.1) 0%, transparent 50%);
}

.profile-card:hover .card-glow {
  @apply opacity-100;
}

/* 头像样式 */
.avatar-container {
  @apply relative;
}

.avatar-image {
  @apply w-20 h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden;
  @apply border-4 border-white shadow-morandi;
  @apply transition-transform duration-500;
}

.avatar-placeholder {
  @apply w-20 h-20 lg:w-24 lg:h-24 rounded-full;
  @apply bg-gradient-to-br from-morandi-blue to-morandi-lavender;
  @apply flex items-center justify-center text-white text-2xl lg:text-3xl font-sans font-bold;
  @apply border-4 border-white shadow-morandi;
  @apply transition-transform duration-500;
}

.avatar-container:hover .avatar-image,
.avatar-container:hover .avatar-placeholder {
  transform: scale(1.05);
}

.avatar-ring {
  @apply absolute inset-0 rounded-full;
  @apply border-2 border-morandi-blue/30;
  animation: pulse-ring 3s ease-out infinite;
}

/* 用户名样式 */
.username-title {
  @apply relative text-h1 font-sans font-bold text-charcoal;
}

.title-underline {
  @apply absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-morandi-blue to-morandi-lavender;
  @apply w-0 transition-all duration-500;
}

.profile-card:hover .title-underline {
  @apply w-full;
}

/* 编辑按钮 */
.edit-btn {
  @apply relative flex items-center gap-2 px-4 py-2 rounded-soft;
  @apply border border-slate/20 overflow-hidden;
  @apply transition-all duration-300;
}

.btn-bg {
  @apply absolute inset-0 bg-white opacity-80;
  @apply transition-all duration-300;
}

.edit-btn:hover .btn-bg {
  @apply opacity-100;
}

.edit-btn:hover {
  @apply shadow-morandi-sm -translate-y-0.5;
}

/* 信息行 */
.info-row {
  @apply flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-4 text-slate;
}

.info-item {
  @apply flex items-center gap-2 transition-colors duration-300;
}

.info-item:hover {
  @apply text-charcoal;
}

.info-divider {
  @apply hidden lg:inline text-slate/30;
}

/* 个性签名 */
.bio-text {
  @apply font-sans text-sm text-slate mb-4 italic;
  @apply transition-colors duration-300;
}

.profile-card:hover .bio-text {
  @apply text-charcoal;
}

/* 标签容器 */
.tags-container {
  @apply flex flex-wrap justify-center lg:justify-start gap-2;
}

.tag-item {
  @apply px-3 py-1 rounded-full;
  @apply bg-morandi-lavender/10 border border-morandi-lavender/20;
  @apply text-sm font-sans text-morandi-lavender;
  @apply transition-all duration-300 cursor-default;
  animation: fadeInUp 0.5s ease-out both;
}

.tag-item:hover {
  @apply bg-morandi-lavender/20 -translate-y-0.5;
}

/* 动画定义 */
@keyframes pulse-ring {
  0% { 
    transform: scale(1); 
    opacity: 0.3; 
  }
  50% {
    transform: scale(1.1);
    opacity: 0.1;
  }
  100% { 
    transform: scale(1.2); 
    opacity: 0; 
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
