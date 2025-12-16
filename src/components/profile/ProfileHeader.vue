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
  <section class="py-4">
    <div class="max-w-6xl mx-auto px-6">
      <div class="morandi-card-base p-6">
        <div class="flex flex-col lg:flex-row items-center lg:items-center gap-4">
          <!-- 左侧：头像 -->
          <div class="flex-shrink-0">
            <div class="relative">
              <div 
                v-if="profile.avatarUrl"
                class="w-14 h-14 lg:w-16 lg:h-16 rounded-full overflow-hidden border-2 border-white shadow-sm"
              >
                <img 
                  :src="profile.avatarUrl" 
                  :alt="profile.username"
                  class="w-full h-full object-cover"
                />
              </div>
              <div 
                v-else
                class="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-morandi-blue to-morandi-lavender flex items-center justify-center text-white text-lg lg:text-xl font-sans font-bold border-2 border-white shadow-sm"
              >
                {{ profile.username.charAt(0).toUpperCase() }}
              </div>
            </div>
          </div>
          
          <!-- 右侧：个人信息 -->
          <div class="flex-1 text-center lg:text-left">
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mb-2">
              <!-- 姓名和基本信息 -->
              <div>
                <h1 class="text-h2 font-sans font-bold text-charcoal mb-0.5">
                  {{ profile.username }}
                </h1>
                <div class="flex flex-wrap items-center gap-2 text-slate">
                  <div class="flex items-center gap-1">
                    <MapPin class="w-3 h-3" />
                    <span class="font-sans text-xs">{{ profile.college }} · {{ profile.major }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <Calendar class="w-3 h-3" />
                    <span class="font-mono text-mono text-xs">{{ joinDate }}</span>
                  </div>
                </div>
              </div>
              
              <!-- 编辑按钮 -->
              <button 
                @click="emit('edit')"
                class="flex items-center gap-1.5 px-2.5 py-1 rounded-soft bg-white/70 backdrop-blur-sm border border-slate/20 hover:bg-white transition-all duration-200"
              >
                <User class="w-3 h-3 text-slate" />
                <span class="font-sans text-xs font-medium text-slate">编辑</span>
              </button>
            </div>
            
            <!-- 兴趣标签 -->
            <div v-if="profile.tags && profile.tags.length > 0" class="flex flex-wrap gap-1">
              <span 
                v-for="tag in profile.tags" 
                :key="tag"
                class="px-2 py-0.5 rounded-full bg-white/60 border border-slate/10 text-xs font-sans text-slate"
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
