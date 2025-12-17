<script setup lang="ts">
import { computed } from 'vue'
import { formatEventTime, formatRelativeTime } from '@/utils/date'
import TagBadge from './TagBadge.vue'
import AiIcon from '@/components/common/AiIcon.vue'
import type { Article } from '@/types/models'

type FrequencyMode = 'focus' | 'vibe'

const props = withDefaults(defineProps<{
  article: Article
  mode?: FrequencyMode
}>(), {
  mode: 'focus'
})

const emit = defineEmits<{
  bookmark: [Article]
}>()

// Focus 模式配色
const focusCategoryStyles = {
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

// Vibe 模式配色
const vibeCategoryStyles = {
  lecture: {
    topBar: 'bg-[#D9A69F]/40 group-hover:bg-[#D9A69F]/60',
    icon: 'bg-gradient-to-br from-[#D9A69F] to-[#C4887E]',
    label: '活动'
  },
  competition: {
    topBar: 'bg-[#E8D5B7]/50 group-hover:bg-[#E8D5B7]/70',
    icon: 'bg-gradient-to-br from-[#E8D5B7] to-[#D4C4A8]',
    label: '比赛'
  },
  research: {
    topBar: 'bg-[#D9A69F]/40 group-hover:bg-[#D9A69F]/60',
    icon: 'bg-gradient-to-br from-[#D9A69F] to-[#C4887E]',
    label: '分享'
  },
  notice: {
    topBar: 'bg-[#E8D5B7]/50 group-hover:bg-[#E8D5B7]/70',
    icon: 'bg-gradient-to-br from-[#E8D5B7] to-[#D4C4A8]',
    label: '动态'
  },
  meal: {
    topBar: 'bg-[#D9A69F]/40 group-hover:bg-[#D9A69F]/60',
    icon: 'bg-gradient-to-br from-[#D9A69F] to-[#C4887E]',
    label: '约饭'
  },
  sports: {
    topBar: 'bg-[#E8D5B7]/50 group-hover:bg-[#E8D5B7]/70',
    icon: 'bg-gradient-to-br from-[#E8D5B7] to-[#D4C4A8]',
    label: '运动'
  },
  carpool: {
    topBar: 'bg-[#D9A69F]/40 group-hover:bg-[#D9A69F]/60',
    icon: 'bg-gradient-to-br from-[#D9A69F] to-[#C4887E]',
    label: '拼车'
  },
  chat: {
    topBar: 'bg-[#E8D5B7]/50 group-hover:bg-[#E8D5B7]/70',
    icon: 'bg-gradient-to-br from-[#E8D5B7] to-[#D4C4A8]',
    label: '闲聊'
  },
}

const categoryStyle = computed(() => {
  const styles = props.mode === 'focus' ? focusCategoryStyles : vibeCategoryStyles
  return styles[props.article.category as keyof typeof styles] || (props.mode === 'focus' ? focusCategoryStyles.research : vibeCategoryStyles.notice)
})
const isResearch = computed(() => props.article.category === 'research')
const isVibe = computed(() => props.mode === 'vibe')

const cardBgClass = computed(() => {
  if (props.mode === 'vibe') {
    return 'bg-card-vibe border border-vibe-primary/20'
  }
  switch (props.article.category) {
    case 'lecture':
      return 'morandi-card-blue'
    case 'competition':
      return 'morandi-card-green'
    case 'research':
      return 'morandi-card-lavender'
    case 'notice':
      return 'morandi-card-clay'
    default:
      return 'morandi-card-base'
  }
})
</script>

<template>
  <article :class="['morandi-card p-0 overflow-hidden group transition-all duration-300', cardBgClass]">
    <!-- 顶部莫兰迪色条 -->
    <div :class="['h-1.5 transition-all duration-300', categoryStyle.topBar]"></div>
    
    <div class="p-8">
      <!-- 头部：分类标签 + 时间 -->
      <div class="flex items-center justify-between mb-6">
        <TagBadge :label="categoryStyle.label" :accent="isResearch" />
        <span class="font-mono text-mono text-slate text-xs tracking-wider">{{ formatRelativeTime(article.createdAt) }}</span>
      </div>

      <!-- 主体：图标 + 内容 -->
      <div class="flex gap-6 mb-6">
        <!-- 首字母图标 -->
        <div :class="['w-20 h-20 rounded-xl flex items-center justify-center text-2xl font-sans font-bold text-white shadow-md', categoryStyle.icon]">
          {{ article.title.charAt(0).toUpperCase() }}
        </div>
        
        <!-- 标题和摘要 -->
        <div class="flex-1">
          <h3 class="text-h2 font-sans font-semibold text-charcoal leading-snug mb-3">{{ article.title }}</h3>
          <p class="text-body font-sans text-slate leading-relaxed line-clamp-3">{{ article.summary }}</p>
        </div>
      </div>

      <!-- 标签区域 -->
      <div class="flex flex-wrap gap-3 mb-6">
        <TagBadge v-for="tag in article.tags.slice(0, 3)" :key="tag" :label="tag" />
      </div>

      <!-- 元信息 -->
      <div class="pt-6 border-t border-slate/10 mb-6">
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center">
            <p class="font-mono text-mono text-slate text-xs mb-1">时间</p>
            <p class="font-sans text-sm text-charcoal">{{ formatEventTime(article.eventTime) }}</p>
          </div>
          <div class="text-center">
            <p class="font-mono text-mono text-slate text-xs mb-1">地点</p>
            <p class="font-sans text-sm text-charcoal">{{ article.location || '待定' }}</p>
          </div>
          <div class="text-center">
            <p class="font-mono text-mono text-slate text-xs mb-1">学院</p>
            <p class="font-sans text-sm text-charcoal">{{ article.college }}</p>
          </div>
        </div>
      </div>

      <!-- AI 分数和操作 -->
      <div class="flex items-center justify-between pt-6 border-t border-slate/10">
        <div class="flex items-center gap-3">
          <AiIcon size="sm" :color="isVibe ? '#C4887E' : '#B4A8BF'" />
          <span 
            class="font-mono text-mono text-sm font-medium"
            :class="isVibe ? 'text-vibe-accent' : 'text-morandi-lavender'"
          >
            {{ isVibe ? '热度 ' + Math.floor(Math.random() * 50 + 50) : 'AI 匹配度 ' + (article.aiScore * 100).toFixed(0) + '%' }}
          </span>
        </div>
        <button 
          @click="emit('bookmark', article)"
          class="px-4 py-2 rounded-soft transition-all font-sans text-sm font-medium"
          :class="isVibe 
            ? 'bg-vibe-primary/10 text-vibe-accent hover:bg-vibe-primary/20' 
            : 'bg-slate/5 text-slate hover:bg-slate/10 hover:text-charcoal'"
        >
          {{ isVibe ? '参与' : '收藏' }}
        </button>
      </div>
    </div>
  </article>
</template>
