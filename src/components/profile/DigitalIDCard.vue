<script setup lang="ts">
import { computed, ref } from 'vue'
import type { UserProfile } from '@/types/models'

const props = defineProps<{
  profile: UserProfile
}>()

const emit = defineEmits<{
  edit: []
}>()

const userId = computed(() => props.profile.id.slice(0, 8).toUpperCase())
const joinDate = computed(() => {
  const date = new Date()
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' })
})

const isHovering = ref(false)
</script>

<template>
  <div 
    class="relative morandi-card-lavender h-full cursor-pointer"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
    :class="{ 'scale-[1.01] shadow-xl': isHovering }"
  >
    <!-- 编辑按钮 -->
    <button 
      @click.stop="emit('edit')"
      class="absolute top-6 right-6 p-2 rounded-lg bg-white/70 backdrop-blur-sm border border-slate/20 transition-all duration-200 hover:bg-white hover:scale-110"
    >
      <svg class="w-4 h-4 text-slate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
      </svg>
    </button>

    <!-- 挂绳孔装饰 -->
    <div class="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-4 border-2 border-slate/20 rounded-t-full"></div>
    
    <div class="pt-6">
      <!-- 头像 -->
      <div class="mb-6">
        <div 
          v-if="profile.avatarUrl"
          class="w-24 h-24 rounded-xl overflow-hidden shadow-lg transition-transform duration-300"
          :class="{ 'scale-105': isHovering }"
        >
          <img 
            :src="profile.avatarUrl" 
            :alt="profile.username"
            class="w-full h-full object-cover"
          />
        </div>
        <div 
          v-else
          class="w-24 h-24 rounded-xl bg-gradient-to-br from-morandi-blue to-morandi-lavender flex items-center justify-center text-white text-3xl font-sans font-bold shadow-lg transition-transform duration-300"
          :class="{ 'scale-105': isHovering }"
        >
          {{ profile.username.charAt(0).toUpperCase() }}
        </div>
      </div>
      
      <!-- 姓名 -->
      <h2 class="text-h2 font-sans font-bold text-charcoal mb-2 tracking-tight">{{ profile.username }}</h2>
      
      <!-- 学院专业 -->
      <div class="mb-6 space-y-1">
        <p class="text-body font-sans text-slate font-medium">{{ profile.college }}</p>
        <p class="text-body font-sans text-slate">{{ profile.major }}</p>
      </div>

      <!-- 兴趣标签 -->
      <div v-if="profile.tags && profile.tags.length > 0" class="mb-6">
        <div class="flex flex-wrap gap-2">
          <span 
            v-for="tag in profile.tags.slice(0, 3)" 
            :key="tag"
            class="px-3 py-1 rounded-full bg-white/60 border border-slate/10 text-xs font-mono text-slate"
          >
            #{{ tag }}
          </span>
          <span 
            v-if="profile.tags.length > 3"
            class="px-3 py-1 rounded-full bg-white/60 border border-slate/10 text-xs font-mono text-slate"
          >
            +{{ profile.tags.length - 3 }}
          </span>
        </div>
      </div>
      
      <!-- 认证状态 -->
      <div class="mb-6">
        <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-morandi-green/10 border border-morandi-green/20 backdrop-blur-sm">
          <span class="w-2 h-2 rounded-full bg-morandi-green animate-pulse"></span>
          <span class="font-mono text-mono text-morandi-green text-xs font-medium">学生身份已认证</span>
        </span>
      </div>
      
      <!-- 条形码装饰 -->
      <div class="flex justify-end mb-4">
        <div class="w-16 h-8 flex items-end gap-0.5">
          <div v-for="i in 12" :key="i" class="bg-charcoal/40 w-0.5 transition-all duration-300" :style="{ height: (Math.random() * 80 + 20) + '%' }"></div>
        </div>
      </div>
      
      <!-- 底部信息 -->
      <div class="pt-4 border-t border-slate/10">
        <div class="flex justify-between items-center">
          <span class="font-mono text-mono text-slate text-xs font-medium">ID: {{ userId }}</span>
          <span class="font-mono text-mono text-slate text-xs font-medium">Joined: {{ joinDate }}</span>
        </div>
      </div>
    </div>
  </div>
</template>