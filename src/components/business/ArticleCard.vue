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

// 莫兰迪配色 - 根据分类设置卡片顶部色条
const categoryColors = {
  lecture: 'morandi-blue',
  competition: 'morandi-green',
  research: 'morandi-lavender',
  notice: 'morandi-clay',
}

const categoryLabel = {
  lecture: '讲座',
  competition: '比赛',
  research: '研究',
  notice: '通知',
}

const topBarColor = computed(() => categoryColors[props.article.category] || 'morandi-lavender')
</script>

<template>
  <article class="morandi-card p-0 overflow-hidden group">
    <!-- 顶部莫兰迪色条 -->
    <div :class="`h-1 bg-${topBarColor}/30 group-hover:bg-${topBarColor}/50 transition-colors`"></div>
    
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <TagBadge :label="categoryLabel[article.category]" :accent="article.category === 'research'" />
        <span class="font-mono text-mono text-slate">{{ formatRelativeTime(article.createdAt) }}</span>
      </div>

      <div class="flex gap-4 mb-4">
        <!-- 首字母图标 - 使用莫兰迪色背景 -->
        <div :class="`w-16 h-16 rounded-xl flex items-center justify-center text-xl font-sans font-bold text-white bg-gradient-to-br from-${topBarColor} to-${topBarColor}/80`">
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
        <div class="flex items-center gap-2 font-mono text-mono text-morandi-lavender">
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
