<script setup lang="ts">
import { computed } from 'vue'
import type { UserProfile } from '@/types/models'
import { User, MapPin, Calendar, LogOut } from 'lucide-vue-next'

const props = defineProps<{
  profile: UserProfile
}>()

const emit = defineEmits<{
  edit: []
  logout: []
}>()

const joinDate = computed(() => {
  const date = new Date()
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
})
</script>

<template>
  <section class="py-6">
    <div class="max-w-6xl mx-auto px-6">
      <div class="profile-card group">
        <!-- 背景图 -->
        <div 
          v-if="profile.bannerUrl" 
          class="card-banner"
          :style="{ backgroundImage: `url(${profile.bannerUrl})` }"
        ></div>
        <div class="card-overlay"></div>
        <div class="card-glow"></div>
        
        <!-- 悬停时显示的操作按钮 -->
        <div class="hover-actions">
          <button 
            @click="emit('edit')"
            class="hover-btn edit-btn"
          >
            <User class="w-4 h-4" />
            <span>编辑</span>
          </button>
          <button 
            @click="emit('logout')"
            class="hover-btn logout-btn"
          >
            <LogOut class="w-4 h-4" />
            <span>退出</span>
          </button>
        </div>
        
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
            <div class="mb-4">
              <h1 class="username-title">
                {{ profile.username }}
                <span class="title-underline"></span>
              </h1>
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
  @apply relative p-8 rounded-morandi;
  @apply border border-slate/10 shadow-morandi;
  @apply transition-all duration-500;
}

.profile-card:hover {
  @apply shadow-morandi-lg;
  transform: translateY(-2px);
}

/* 背景图 */
.card-banner {
  @apply absolute inset-0 rounded-morandi;
  background-size: cover;
  background-position: center;
  z-index: 0;
}

/* 左侧渐变遮罩 */
.card-overlay {
  @apply absolute inset-0 rounded-morandi;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 40%, rgba(255, 255, 255, 0.4) 70%, transparent 100%);
  z-index: 1;
}

.profile-card:not(:has(.card-banner)) .card-overlay {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
}

.card-glow {
  @apply absolute inset-0 rounded-morandi opacity-0 transition-opacity duration-500;
  background: radial-gradient(circle at 30% 30%, rgba(147, 168, 172, 0.1) 0%, transparent 50%);
  z-index: 2;
}

.profile-card:hover .card-glow {
  @apply opacity-100;
}

/* 悬停操作按钮 */
.hover-actions {
  @apply absolute top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20;
  right: -72px;
  @apply opacity-0 translate-x-2 transition-all duration-300;
}

.profile-card:hover .hover-actions {
  @apply opacity-100 translate-x-0;
}

.hover-btn {
  @apply px-3 py-2 rounded-soft flex items-center gap-2;
  @apply text-sm font-sans font-medium;
  @apply transition-all duration-300 shadow-morandi-sm;
}

.hover-btn:hover {
  @apply shadow-morandi;
}

.hover-btn.edit-btn {
  @apply bg-white text-slate border border-slate/20;
}

.hover-btn.edit-btn:hover {
  @apply bg-morandi-blue/10 text-morandi-blue border-morandi-blue/30;
}

.hover-btn.logout-btn {
  @apply bg-white text-red-400 border border-red-200;
}

.hover-btn.logout-btn:hover {
  @apply bg-red-50 text-red-500 border-red-300;
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
  @apply relative text-h1 font-sans font-bold text-charcoal inline-block;
}

.title-underline {
  @apply absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-morandi-blue to-morandi-lavender;
  @apply w-0 transition-all duration-500;
}

.profile-card:hover .title-underline {
  @apply w-full;
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
