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

const posterInitial = computed(() => props.article.title.charAt(0).toUpperCase())
</script>

<template>
  <article class="article-card stagger-in">
    <div class="flex items-center justify-between mb-4">
      <TagBadge :label="article.category" :accent="true" />
      <span class="font-mono text-mono text-text-secondary">
        {{ formatRelativeTime(article.createdAt) }}
      </span>
    </div>
    
    <div class="flex gap-4 mb-4">
      <div class="flex h-20 w-20 items-center justify-center rounded-lg border border-glass-border glass-card text-display font-bold text-neon-purple image-hover">
        {{ posterInitial }}
      </div>
      <div class="flex-1 space-y-2">
        <h3 class="text-h2 font-display font-semibold text-text-primary">{{ article.title }}</h3>
        <p class="line-clamp-3 text-body font-body text-text-secondary">{{ article.summary }}</p>
      </div>
    </div>
    
    <div class="flex flex-wrap gap-2 mb-4">
      <TagBadge v-for="tag in article.tags" :key="tag" :label="tag" />
    </div>
    
    <div class="flex flex-wrap items-center justify-between gap-3 border-t border-glass-border pt-3 font-mono text-mono text-text-secondary">
      <span>{{ formatEventTime(article.eventTime) }}</span>
      <span>{{ article.location ?? '地点待定' }}</span>
      <span>{{ article.college }}</span>
    </div>
    
    <div class="flex items-center justify-between mt-4">
      <div class="font-mono text-mono text-neon-cyan flex items-center gap-2">
        <span>✦</span>
        AI SCORE {{ (article.aiScore * 100).toFixed(0) }}%
      </div>
      <AppButton variant="glass" @click="emit('bookmark', article)">
        收藏
      </AppButton>
    </div>
  </article>
</template>
