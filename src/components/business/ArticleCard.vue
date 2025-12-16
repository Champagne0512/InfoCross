<script setup lang="ts">
import { computed } from 'vue'
import { formatEventTime, formatRelativeTime } from '@/utils/date'
import { PhSparkle } from '@phosphor-icons/vue'
import AppButton from '@/components/common/AppButton.vue'
import type { Article } from '@/types/models'

const props = defineProps<{
  article: Article
}>()

const emit = defineEmits<{
  bookmark: [Article]
}>()

const palette: Record<string, string> = {
  lecture: 'bg-academic/10 text-academic',
  competition: 'bg-academic/10 text-academic',
  research: 'bg-academic/10 text-academic',
  notice: 'bg-life/10 text-life',
}

const coverColor = computed(() => {
  switch (props.article.category) {
    case 'competition':
      return 'bg-academic text-white'
    case 'notice':
      return 'bg-life text-white'
    case 'research':
      return 'bg-activity text-white'
    default:
      return 'bg-intelligence text-white'
  }
})

const categoryClass = computed(() => palette[props.article.category] ?? 'bg-intelligence/10 text-intelligence')
</script>

<template>
  <article class="flex flex-col gap-4 rounded-2xl bg-surface p-6 shadow-card transition hover:-translate-y-1 hover:shadow-sheet">
    <div class="flex items-center justify-between">
      <span class="category-chip" :class="categoryClass">{{ article.category }}</span>
      <span class="font-data text-[0.6rem] text-ink-soft">{{ formatRelativeTime(article.createdAt) }}</span>
    </div>

    <div class="flex gap-4">
      <div :class="['flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-semibold', coverColor]">
        {{ article.title.slice(0, 2).toUpperCase() }}
      </div>
      <div class="flex-1 space-y-2">
        <h3 class="text-xl font-semibold text-ink">{{ article.title }}</h3>
        <p class="line-clamp-3 text-[15px] text-ink-soft">{{ article.summary }}</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <span
        v-for="tag in article.tags"
        :key="tag"
        class="rounded-full bg-neutral px-3 py-1 text-xs text-ink font-medium"
      >
        #{{ tag }}
      </span>
    </div>

    <div class="grid gap-2 border-y border-dashed border-border py-3 font-data text-[0.65rem] text-ink-soft">
      <span>时间 · {{ formatEventTime(article.eventTime) }}</span>
      <span>地点 · {{ article.location ?? '待定' }}</span>
      <span>发布机构 · {{ article.college }}</span>
    </div>

    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3 text-sm text-ink">
        <div class="avatar-stack">
          <span>DK</span>
          <span>AI</span>
          <span>UX</span>
        </div>
        <div class="text-xs text-ink-soft">+32 位同学关注</div>
      </div>
      <AppButton variant="ghost" @click="emit('bookmark', article)">收藏</AppButton>
    </div>

    <div class="ai-ribbon">
      <PhSparkle size="16" weight="duotone" />
      推荐理由：{{ props.article.tags[0] ?? '破壁推荐' }} · 更配你的兴趣
    </div>
  </article>
</template>
