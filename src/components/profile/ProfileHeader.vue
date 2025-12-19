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
      <div class="morandi-card-base p-8">
        <div class="flex flex-col lg:flex-row items-center lg:items-start gap-6">
          <!-- 左侧：头像 -->
          <div class="flex-shrink-0">
            <div class="relative">
              <div 
                v-if="profile.avatarUrl"
                class="w-20 h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden border-3 border-white shadow-morandi"
              >
                <img 
                  :src="profile.avatarUrl" 
                  :alt="profile.username"
                  class="w-full h-full object-cover"
                />
              </div>
              <div 
                v-else
                class="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-morandi-blue to-morandi-lavender flex items-center justify-center text-white text-2xl lg:text-3xl font-sans font-bold border-3 border-white shadow-morandi"
              >
                {{ profile.username.charAt(0).toUpperCase() }}
              </div>
            </div>
          </div>
          
          <!-- 右侧：个人信息 -->
          <div class="flex-1 text-center lg:text-left">
            <!-- 姓名行 -->
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
              <h1 class="text-h1 font-sans font-bold text-charcoal">
                {{ profile.username }}
              </h1>
              
              <!-- 编辑按钮 -->
              <button 
                @click="emit('edit')"
                class="flex items-center gap-2 px-4 py-2 rounded-soft bg-white/80 backdrop-blur-sm border border-slate/20 hover:bg-white hover:shadow-morandi-sm transition-all duration-200"
              >
                <User class="w-4 h-4 text-slate" />
                <span class="font-sans text-sm font-medium text-slate">编辑资料</span>
              </button>
            </div>
            
            <!-- 基本信息 -->
            <div class="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-4 text-slate">
              <div class="flex items-center gap-2">
                <MapPin class="w-4 h-4" />
                <span class="font-sans text-sm">{{ profile.college }}</span>
              </div>
              <span class="hidden lg:inline text-slate/30">|</span>
              <div class="flex items-center gap-2">
                <span class="font-sans text-sm">{{ profile.major }}</span>
              </div>
              <span class="hidden lg:inline text-slate/30">|</span>
              <div class="flex items-center gap-2">
                <Calendar class="w-4 h-4" />
                <span class="font-mono text-sm">{{ joinDate }} 加入</span>
              </div>
            </div>
            
            <!-- 个性签名 -->
            <p v-if="profile.bio" class="font-sans text-sm text-slate mb-4 italic">
              "{{ profile.bio }}"
            </p>

            <!-- 兴趣标签 -->
            <div v-if="profile.tags && profile.tags.length > 0" class="flex flex-wrap justify-center lg:justify-start gap-2">
              <span 
                v-for="tag in profile.tags" 
                :key="tag"
                class="px-3 py-1 rounded-full bg-morandi-lavender/10 border border-morandi-lavender/20 text-sm font-sans text-morandi-lavender"
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
