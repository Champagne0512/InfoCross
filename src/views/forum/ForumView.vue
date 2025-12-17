<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import SpectrumTabs from '@/components/forum/SpectrumTabs.vue'
import SignalFeedItem from '@/components/forum/SignalFeedItem.vue'
import DepthArticleCard from '@/components/forum/DepthArticleCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import { useAuth } from '@/composables/useAuth'
import { useFrequencyStore } from '@/stores/frequencyStore'
import {
  fetchForumThreads,
  fetchHotTopics,
  fetchRelatedResources,
  likeThread,
} from '@/api/forum'
import type {
  ForumThread,
  ForumThreadType,
  ForumHotTopic,
} from '@/types/models'

const { profile } = useAuth()
const userCollege = computed(() => profile.value?.college)
const frequencyStore = useFrequencyStore()

// 建立映射关系：Focus ↔ depth，Vibe ↔ signal
const mode = computed<ForumThreadType>({
  get: () => frequencyStore.isFocus ? 'depth' : 'signal',
  set: (value) => {
    frequencyStore.setMode(value === 'depth' ? 'focus' : 'vibe')
  }
})
const signalThreads = ref<ForumThread[]>([])
const depthThreads = ref<ForumThread[]>([])
const hotTopics = ref<ForumHotTopic[]>([])
const selectedDepth = ref<ForumThread | null>(null)
const relatedResources = ref<Array<{ type: string; title: string; id: number }>>([])

const signalLoading = ref(false)
const depthLoading = ref(false)
const sidebarLoading = ref(false)

const heroContent = computed(() => {
  if (mode.value === 'signal') {
    return {
      title: 'Signal · 情报频道',
      subtitle: '消除“我不知道”',
      description:
        '捕捉校园里的即时情报与跨学院爆料，AI 自动聚合热词，帮你在最短时间知道发生了什么。',
      action: '发布情报',
    }
  }
  return {
    title: 'Depth · 深潜频道',
    subtitle: '消除“我不懂”',
    description:
      '沉浸式阅读跨学科经验与测评，支持引用 InfoCross 活动/组队，AI 还会推送关联资源。',
    action: '写长文',
  }
})

onMounted(async () => {
  // 根据当前频率模式初始化forum模式
  if (frequencyStore.isFocus) {
    mode.value = 'depth'
  } else {
    mode.value = 'signal'
  }
  await Promise.all([loadSignalThreads(), loadDepthThreads(), loadHotTopics()])
})

watch(selectedDepth, async (thread) => {
  if (!thread) {
    relatedResources.value = []
    return
  }
  sidebarLoading.value = true
  try {
    relatedResources.value = await fetchRelatedResources(thread.id)
  } finally {
    sidebarLoading.value = false
  }
})

async function loadSignalThreads() {
  signalLoading.value = true
  try {
    signalThreads.value = await fetchForumThreads({ type: 'signal' })
  } finally {
    signalLoading.value = false
  }
}

async function loadDepthThreads() {
  depthLoading.value = true
  try {
    depthThreads.value = await fetchForumThreads({ type: 'depth' })
    if (!selectedDepth.value && depthThreads.value.length) {
      const firstDepth = depthThreads.value[0]
      if (firstDepth) {
        selectedDepth.value = firstDepth
      }
    }
  } finally {
    depthLoading.value = false
  }
}

async function loadHotTopics() {
  hotTopics.value = await fetchHotTopics()
}

function handleDepthSelect(thread: ForumThread) {
  selectedDepth.value = thread
}

async function handleSignalLike(thread: ForumThread) {
  await likeThread(thread.id)
}

function handleSignalComment(thread: ForumThread) {
  console.log('comment thread', thread.id)
}

function handleSignalShare(thread: ForumThread) {
  console.log('share thread', thread.id)
}
</script>

<template>
  <div class="forum-wrapper">
    <section class="hero">
      <p class="hero-subtitle">The Spectrum · 全谱论坛</p>
      <h1 class="hero-title">{{ heroContent.title }}</h1>
      <p class="hero-desc">
        {{ heroContent.description }}
      </p>
      <div class="hero-tabs">
        <SpectrumTabs v-model="mode" />
      </div>
      <div class="hero-actions">
        <AppButton variant="primary">
          {{ heroContent.action }}
        </AppButton>
      </div>
    </section>

    <!-- Signal 模式 -->
    <section v-if="mode === 'signal'" class="signal-section">
      <div class="signal-grid">
        <div class="signal-feed">
          <div v-if="signalLoading" class="skeleton-list">
            <div v-for="index in 4" :key="index" class="skeleton-card" />
          </div>
          <SignalFeedItem
            v-for="(thread, index) in signalThreads"
            v-else
            :key="thread.id"
            :thread="thread"
            :user-college="userCollege || undefined"
            :is-last="index === signalThreads.length - 1"
            @like="handleSignalLike"
            @comment="handleSignalComment"
            @share="handleSignalShare"
          />
        </div>

        <aside class="signal-aside">
          <div class="hot-topic-card">
            <h3>热门合辑</h3>
            <p class="aside-desc">AI 自动聚类，避免相同吐槽刷屏。</p>
            <ul class="hot-topic-list">
              <li
                v-for="topic in hotTopics"
                :key="topic.id"
                class="hot-topic-item"
              >
                <div>
                  <p class="topic-title">{{ topic.title }}</p>
                  <p class="topic-meta">{{ topic.threadCount }} 条讨论 · 热度 {{ Math.round(topic.heatScore * 100) }}%</p>
                </div>
              </li>
            </ul>
          </div>

          <div class="tip-card">
            <h4>匿名提示</h4>
            <p>Signal 默认实名，点击发布框右下角的 👁️‍🗨️ 可一键切换匿名身份。</p>
          </div>
        </aside>
      </div>
    </section>

    <!-- Depth 模式 -->
    <section v-else class="depth-section">
      <div class="depth-grid">
        <div class="depth-list">
          <div v-if="depthLoading" class="skeleton-list depth">
            <div v-for="index in 4" :key="index" class="skeleton-line" />
          </div>
          <DepthArticleCard
            v-for="thread in depthThreads"
            v-else
            :key="thread.id"
            :thread="thread"
            :active="selectedDepth?.id === thread.id"
            @select="handleDepthSelect"
          />
        </div>

        <div v-if="selectedDepth" class="depth-detail">
          <div class="detail-header">
            <div>
              <p class="detail-label">{{ selectedDepth.category?.toUpperCase() || 'DEPTH' }}</p>
              <h2>{{ selectedDepth.title }}</h2>
              <p class="detail-meta">
                {{ selectedDepth.authorName || '匿名作者' }} ·
                {{ selectedDepth.readTimeMinutes }} min read ·
                {{ new Date(selectedDepth.createdAt).toLocaleString() }}
              </p>
            </div>
            <AppButton variant="ghost">保存到书签</AppButton>
          </div>

          <p class="detail-summary">
            {{ selectedDepth.summary || selectedDepth.contentText }}
          </p>

          <div v-if="selectedDepth.aiTags.length" class="detail-tags">
            <span
              v-for="tag in selectedDepth.aiTags"
              :key="tag"
              class="tag-pill"
            >
              {{ tag }}
            </span>
          </div>

          <div class="detail-divider" />

          <div class="related-panel">
            <div class="related-header">
              <p class="related-title">相关资源</p>
              <span v-if="sidebarLoading" class="loading-text">加载中...</span>
            </div>
            <ul v-if="relatedResources.length" class="related-list">
              <li v-for="resource in relatedResources" :key="resource.id" class="related-item">
                <span class="resource-type">{{ resource.type }}</span>
                <span class="resource-title">{{ resource.title }}</span>
              </li>
            </ul>
            <p v-else class="aside-desc">暂无关联资源</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.forum-wrapper {
  @apply py-12 space-y-10 bg-cream min-h-screen;
}

.hero {
  @apply max-w-5xl mx-auto text-center px-6;
}

.hero-subtitle {
  @apply font-mono text-xs tracking-[0.3em] uppercase text-slate mb-3;
}

.hero-title {
  @apply text-hero font-sans font-bold text-charcoal;
}

.hero-desc {
  @apply text-body text-slate mt-4 max-w-3xl mx-auto;
}

.hero-actions {
  @apply flex flex-wrap justify-center gap-4 mt-8;
}

.hero-tabs {
  @apply flex justify-center mt-6;
}

.signal-section,
.depth-section {
  @apply max-w-6xl mx-auto px-6;
}

.signal-grid {
  @apply grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,0.8fr)];
}

.signal-feed {
  @apply space-y-6 relative;
}

.signal-aside {
  @apply space-y-6;
}

.hot-topic-card,
.tip-card {
  @apply rounded-morandi bg-white p-6 shadow-morandi border border-slate/10;
}

.hot-topic-card h3 {
  @apply text-2xl font-sans font-semibold text-charcoal mb-2;
}

.aside-desc {
  @apply text-sm text-slate;
}

.hot-topic-list {
  @apply mt-4 space-y-4;
}

.hot-topic-item {
  @apply px-4 py-3 rounded-soft bg-cream border border-slate/5;
}

.topic-title {
  @apply font-sans text-base text-charcoal;
}

.topic-meta {
  @apply font-mono text-xs text-slate mt-1;
}

.tip-card h4 {
  @apply font-sans font-semibold text-charcoal mb-2;
}

.depth-grid {
  @apply grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)];
}

.depth-list {
  @apply rounded-morandi bg-white shadow-morandi border border-slate/10;
}

.depth-detail {
  @apply rounded-morandi bg-white shadow-morandi border border-slate/10 p-8 flex flex-col gap-6;
}

.detail-header {
  @apply flex flex-col md:flex-row md:items-center md:justify-between gap-4;
}

.detail-label {
  @apply font-mono text-xs tracking-widest text-morandi-blue uppercase;
}

.detail-meta {
  @apply font-mono text-xs text-slate mt-2;
}

.detail-summary {
  @apply text-body text-charcoal leading-relaxed;
}

.detail-tags {
  @apply flex flex-wrap gap-2;
}

.tag-pill {
  @apply px-3 py-1 rounded-full bg-morandi-lavender/15 text-morandi-lavender font-mono text-xs;
}

.detail-divider {
  @apply h-px bg-slate/10;
}

.related-panel {
  @apply rounded-xl bg-cream p-4 border border-slate/10;
}

.related-header {
  @apply flex items-center justify-between mb-3;
}

.related-title {
  @apply font-mono text-xs tracking-[0.3em] uppercase text-slate;
}

.loading-text {
  @apply text-xs text-slate;
}

.related-list {
  @apply space-y-2;
}

.related-item {
  @apply flex items-center gap-3 px-3 py-2 rounded-soft bg-white;
  @apply border border-slate/5;
}

.resource-type {
  @apply font-mono text-xs uppercase tracking-widest text-morandi-green;
}

.resource-title {
  @apply font-sans text-sm text-charcoal;
}

.skeleton-list {
  @apply space-y-4;
}

.skeleton-card {
  @apply h-32 rounded-morandi bg-slate/10 animate-pulse;
}

.skeleton-line {
  @apply h-16 border-b border-slate/15 animate-pulse;
}
</style>
