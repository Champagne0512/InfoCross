<script setup lang="ts">
import { computed } from 'vue'
import { formatEventTime, formatRelativeTime } from '@/utils/date'
import TagBadge from './TagBadge.vue'
import AppButton from '@/components/common/AppButton.vue'
import type { Article } from '@/types/models'

const props = defineProps<{
  article: Article
}>()

const emit = defineEmits<{
  bookmark: [Article]
}>()

// 莫兰迪配色 - 直接使用颜色值而不是动态类名
const categoryStyles = {
  lecture: {
    topBar: 'bg-[#93A8AC]/30 group-hover:bg-[#93A8AC]/50',
    icon: 'bg-gradient-to-br from-[#93A8AC] to-[#93A8AC]/80',
    label: '讲座'
  },
  competition: {
    topBar: 'bg-[#A6B9A8]/30 group-hover:bg-[#A6B9A8]/50',
    icon: 'bg-gradient-to-br from-[#A6B9A8] to-[#A6B9A8]/80',
    label: '比赛'
  },
  research: {
    topBar: 'bg-[#B4A8BF]/30 group-hover:bg-[#B4A8BF]/50',
    icon: 'bg-gradient-to-br from-[#B4A8BF] to-[#B4A8BF]/80',
    label: '研究'
  },
  notice: {
    topBar: 'bg-[#D9A69F]/30 group-hover:bg-[#D9A69F]/50',
    icon: 'bg-gradient-to-br from-[#D9A69F] to-[#D9A69F]/80',
    label: '通知'
  },
}

const categoryStyle = computed(() => categoryStyles[props.article.category] || categoryStyles.research)
const isResearch = computed(() => props.article.category === 'research')
</script>

<template>
  <article class="morandi-card p-0 overflow-hidden group">
    <!-- 顶部莫兰迪色条 - 使用静态类名确保颜色显示 -->
    <div :class="['h-1 transition-colors', categoryStyle.topBar]"></div>
    
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <TagBadge :label="categoryStyle.label" :accent="isResearch" />
        <span class="font-mono text-mono text-slate">{{ formatRelativeTime(article.createdAt) }}</span>
      </div>

      <div class="flex gap-4 mb-4">
        <!-- 首字母图标 - 使用内联样式确保颜色显示 -->
        <div :class="['w-16 h-16 rounded-xl flex items-center justify-center text-xl font-sans font-bold text-white', categoryStyle.icon]">
          {{ article.title.charAt(0).toUpperCase() }}
        </div>
        
        <div class="flex-1 space-y-3">
          <h3 class="text-h3 font-sans font-semibold text-charcoal leading-tight">{{ article.title }}</h3>
          <p class="text-body font-sans text-slate line-clamp-3">{{ article.summary }}</p>
        </div>
      </div>

      <!-- 标签 -->
      <div class="flex flex-wrap gap-2 mb-4">
        <TagBadge v-for="tag in article.tags.slice(0, 3)" :key="tag" :label="tag" />
      </div>

      <!-- 元信息 -->
      <div class="pt-4 border-t border-slate/10">
        <div class="flex flex-wrap items-center justify-between gap-3 font-mono text-mono text-slate">
          <span>{{ formatEventTime(article.eventTime) }}</span>
          <span>{{ article.location || '地点待定' }}</span>
          <span class="px-2 py-1 rounded bg-slate/5 text-slate">{{ article.college }}</span>
        </div>
      </div>

      <!-- AI 分数和操作 -->
      <div class="flex items-center justify-between mt-4 pt-4 border-t border-slate/10">
        <div class="flex items-center gap-2 font-mono text-mono text-[#B4A8BF]">
          <span>✨</span>
          <span>AI 匹配度 {{ (article.aiScore * 100).toFixed(0) }}%</span>
        </div>
        <AppButton 
          variant="ghost" 
          @click="emit('bookmark', article)"
          class="text-slate hover:text-charcoal"
        >
          收藏
        </AppButton>
      </div>
    </div>
  </article>
</template>
