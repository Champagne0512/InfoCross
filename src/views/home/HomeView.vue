<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import ArticleCard from '@/components/business/ArticleCard.vue'
import InsightPanel from '@/components/business/InsightPanel.vue'
import AiIcon from '@/components/common/AiIcon.vue'
import { fetchArticles, fetchRecommendedArticles } from '@/api/article'
import type { Article } from '@/types/models'
import { buildMockInsights } from '@/utils/ai-parser'
import { useAuth } from '@/composables/useAuth'
import { recordInteraction } from '@/api/interaction'
import { useFrequencyStore } from '@/stores/frequencyStore'

const frequencyStore = useFrequencyStore()

const articles = ref<Article[]>([])
const recommended = ref<Article[]>([])
const selectedCategory = ref<string>('all')
const searchQuery = ref('')
const loading = ref(true)
const { profile } = useAuth()

// Focus 模式分类
const focusCategories = [
  { label: '全部', value: 'all' },
  { label: '讲座', value: 'lecture' },
  { label: '比赛', value: 'competition' },
  { label: '研究', value: 'research' },
  { label: '通知', value: 'notice' },
]

// Vibe 模式分类
const vibeCategories = [
  { label: '全部', value: 'all' },
  { label: '约饭', value: 'meal' },
  { label: '运动', value: 'sports' },
  { label: '拼车', value: 'carpool' },
  { label: '闲聊', value: 'chat' },
]

const categories = computed(() =>
  frequencyStore.isFocus ? focusCategories : vibeCategories,
)

const allowedCategoryValues = computed(() =>
  categories.value
    .map((category) => category.value)
    .filter((value) => value !== 'all'),
)

// 页面配置
const displayName = computed(() => profile.value?.username || 'Explorer')

const pageConfig = computed(() => {
  if (frequencyStore.isFocus) {
    return {
      greeting: `Hello, ${displayName.value}`,
      desc: 'InfoCross 聚合各学院的讲座、竞赛与通知，并由 AI 自动摘要、打标、向量检索，为你推送最值得跨界投入的机会。',
      publishText: '发布活动',
      refreshText: '刷新流',
      featuredTitle: '精选破壁线索',
      featuredSubtitle: 'FEATURED',
      aiTitle: '破壁推荐',
      aiSubtitle: 'AI RECOMMENDATIONS',
      aiDesc: '根据你的兴趣标签与向量空间距离，AI 为你挑选跨学院内容',
      insightTitle: '跨学科提示',
      summaryTitle: '今日重点',
      statsTitle: '今日数据',
    }
  }
  return {
    greeting: 'What\'s up',
    desc: '校园生活脉动，即时约伴、限时动态。所有内容限时可见，永远新鲜有趣。',
    publishText: '发起约伴',
    refreshText: '刷新动态',
    featuredTitle: '热门动态',
    featuredSubtitle: 'TRENDING',
    aiTitle: '附近的人',
    aiSubtitle: 'NEARBY',
    aiDesc: '发现你身边正在发起约伴的同学',
    insightTitle: '热门话题',
    summaryTitle: '即时速递',
    statsTitle: '实时数据',
  }
})

const modeArticles = computed(() =>
  articles.value.filter((article) =>
    allowedCategoryValues.value.includes(article.category),
  ),
)

const modeRecommended = computed(() =>
  recommended.value.filter((article) =>
    allowedCategoryValues.value.includes(article.category),
  ),
)

const heroInsights = computed(() =>
  modeArticles.value[0] ? buildMockInsights(modeArticles.value[0]) : [],
)

const filteredArticles = computed(() => {
  const source = modeArticles.value
  if (
    selectedCategory.value !== 'all' &&
    allowedCategoryValues.value.includes(selectedCategory.value)
  ) {
    return source.filter((article) => article.category === selectedCategory.value)
  }
  return source
})

const spotlightArticles = computed(() => filteredArticles.value.slice(0, 3))
const breakerHighlights = computed(() => modeRecommended.value.slice(0, 2))

onMounted(async () => {
  await loadArticles()
})

watch(
  () => frequencyStore.mode,
  () => {
    selectedCategory.value = 'all'
  },
)

async function loadArticles() {
  loading.value = true
  try {
    articles.value = await fetchArticles()
    recommended.value = await fetchRecommendedArticles(profile.value?.tags ?? [])
  } finally {
    loading.value = false
  }
}

async function handleBookmark(article: Article) {
  await recordInteraction({ articleId: article.id, type: 'bookmark' })
}

function handleSearch() {
  if (!searchQuery.value.trim()) return
  // 搜索逻辑 - 可以跳转到搜索结果页或过滤当前列表
  console.log('搜索:', searchQuery.value)
}
</script>

<template>
  <div class="space-y-10">
    <!-- Hero 区域 -->
    <section class="py-8 lg:py-10">
      <div class="max-w-2xl mx-auto text-center">
        <!-- 问候语 + 价值主张 + 搜索栏 -->
        <div class="space-y-5">
          <div>
            <p class="font-mono text-mono text-slate mb-2 tracking-wider">
              {{ new Date().toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' }) }}
            </p>
            <h1 class="text-hero font-sans font-bold text-charcoal mb-3 leading-tight">
              {{ pageConfig.greeting }}
            </h1>
            <p class="text-body font-sans text-slate leading-relaxed">
              {{ pageConfig.desc }}
            </p>
          </div>
          <!-- 全局搜索栏 -->
          <div class="relative max-w-lg mx-auto">
            <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-slate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="frequencyStore.isFocus ? '搜索讲座、比赛、研究项目...' : '搜索约伴、活动、话题...'"
              class="w-full pl-12 pr-4 py-3 rounded-full border bg-white/80 backdrop-blur-sm font-sans text-body text-charcoal placeholder:text-slate/60 transition-all duration-300 focus:outline-none focus:ring-2"
              :class="frequencyStore.isFocus 
                ? 'border-slate/20 focus:border-focus-primary focus:ring-focus-primary/20' 
                : 'border-vibe-primary/20 focus:border-vibe-primary focus:ring-vibe-primary/20'"
              @keyup.enter="handleSearch"
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute inset-y-0 right-4 flex items-center text-slate hover:text-charcoal transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 主内容区域 -->
    <section class="grid gap-10 lg:grid-cols-3">
      <!-- 左侧：主要内容 -->
      <div class="lg:col-span-2 space-y-10">
        <!-- 精选内容 -->
        <div 
          class="rounded-morandi p-8 transition-all duration-500 shadow-morandi backdrop-blur-sm"
          :class="frequencyStore.isFocus 
            ? 'bg-card-focus border border-focus-primary/20' 
            : 'bg-card-vibe border border-vibe-primary/20'"
        >
          <header class="flex items-center justify-between mb-8">
            <div>
              <p 
                class="font-mono text-mono mb-2 transition-colors duration-300"
                :class="frequencyStore.isFocus ? 'text-focus-accent' : 'text-vibe-accent'"
              >
                {{ pageConfig.featuredSubtitle }}
              </p>
              <h2 class="text-display font-sans font-semibold text-charcoal">{{ pageConfig.featuredTitle }}</h2>
            </div>
            <div class="flex gap-2">
              <button
                v-for="category in categories"
                :key="category.value"
                class="px-4 py-2 rounded-soft font-sans text-caption uppercase tracking-wider transition-all"
                :class="selectedCategory === category.value
                  ? (frequencyStore.isFocus 
                      ? 'bg-focus-accent text-white' 
                      : 'bg-vibe-accent text-white')
                  : 'bg-white border border-slate/20 text-slate hover:bg-slate/5'"
                @click="selectedCategory = category.value"
              >
                {{ category.label }}
              </button>
            </div>
          </header>
          
          <div v-if="loading" class="grid gap-6 md:grid-cols-2">
            <div 
              v-for="index in 4" 
              :key="index" 
              class="h-80 rounded-morandi animate-pulse"
              :class="frequencyStore.isFocus ? 'bg-focus-primary/10' : 'bg-vibe-primary/10'"
            />
          </div>
          
          <div v-else class="grid gap-6 md:grid-cols-2">
            <ArticleCard
              v-for="article in spotlightArticles"
              :key="article.id"
              :article="article"
              :mode="frequencyStore.mode"
              @bookmark="handleBookmark"
            />
          </div>
        </div>

        <!-- AI 推荐 / 附近的人 -->
        <div 
          class="rounded-morandi p-8 transition-all duration-500 shadow-morandi"
          :class="frequencyStore.isFocus 
            ? 'bg-card-lavender border border-morandi-lavender/20' 
            : 'bg-card-vibe border border-vibe-primary/20'"
        >
          <header class="text-center mb-10">
            <p 
              class="font-mono text-mono mb-3 transition-colors duration-300"
              :class="frequencyStore.isFocus ? 'text-morandi-lavender' : 'text-vibe-accent'"
            >
              {{ pageConfig.aiSubtitle }}
            </p>
            <h2 class="text-display font-sans font-semibold text-charcoal mb-4">{{ pageConfig.aiTitle }}</h2>
            <p class="text-body font-sans text-slate max-w-2xl mx-auto">
              {{ pageConfig.aiDesc }}
            </p>
          </header>
          
          <div class="grid gap-6 md:grid-cols-2">
            <ArticleCard
              v-for="article in breakerHighlights"
              :key="`rec-${article.id}`"
              :article="article"
              :mode="frequencyStore.mode"
              @bookmark="handleBookmark"
            />
          </div>
        </div>
      </div>

      <!-- 右侧：边栏 -->
      <div class="lg:col-span-1">
        <div class="sticky top-8 space-y-8">
          <!-- AI 洞察 / 热门话题 -->
          <div 
            v-if="heroInsights.length" 
            class="rounded-morandi p-6 transition-all duration-500 shadow-morandi"
            :class="frequencyStore.isFocus 
              ? 'bg-card-lavender border border-morandi-lavender/20' 
              : 'bg-card-vibe border border-vibe-primary/20'"
          >
            <div class="text-center mb-6">
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
                :class="frequencyStore.isFocus ? 'bg-morandi-lavender/10' : 'bg-vibe-primary/20'"
              >
                <AiIcon size="lg" :color="frequencyStore.isFocus ? '#B4A8BF' : '#C4887E'" />
              </div>
              <p 
                class="font-mono text-mono mb-2"
                :class="frequencyStore.isFocus ? 'text-morandi-lavender' : 'text-vibe-accent'"
              >
                AI INSIGHT
              </p>
              <h3 class="text-h2 font-sans font-semibold text-charcoal">{{ pageConfig.insightTitle }}</h3>
            </div>
            <InsightPanel :insights="heroInsights" />
          </div>

          <!-- 今日摘要 / 即时速递 -->
          <div 
            class="rounded-morandi p-6 transition-all duration-500 shadow-morandi"
            :class="frequencyStore.isFocus 
              ? 'bg-card-mist border border-slate/10' 
              : 'bg-card-vibe border border-vibe-secondary/20'"
          >
            <header class="text-center mb-6">
              <p class="font-mono text-mono text-slate mb-2">TL;DR</p>
              <h3 class="text-h2 font-sans font-semibold text-charcoal">{{ pageConfig.summaryTitle }}</h3>
            </header>
            <div class="space-y-4">
              <div 
                class="p-4 rounded-soft"
                :class="frequencyStore.isFocus ? 'bg-morandi-blue/5' : 'bg-vibe-primary/10'"
              >
                <p 
                  class="font-mono text-mono text-xs mb-2"
                  :class="frequencyStore.isFocus ? 'text-morandi-blue' : 'text-vibe-accent'"
                >
                  {{ frequencyStore.isFocus ? '时间' : '热度' }}
                </p>
                <p class="font-sans text-sm text-charcoal">
                  {{ frequencyStore.isFocus ? '12 月 20 日 14:00' : '32 人正在约伴' }}
                </p>
              </div>
              <div 
                class="p-4 rounded-soft"
                :class="frequencyStore.isFocus ? 'bg-morandi-green/5' : 'bg-vibe-secondary/20'"
              >
                <p 
                  class="font-mono text-mono text-xs mb-2"
                  :class="frequencyStore.isFocus ? 'text-morandi-green' : 'text-vibe-accent'"
                >
                  {{ frequencyStore.isFocus ? '地点' : '最近' }}
                </p>
                <p class="font-sans text-sm text-charcoal">
                  {{ frequencyStore.isFocus ? '图书馆 B1' : '二食堂 · 5分钟前' }}
                </p>
              </div>
              <div 
                class="p-4 rounded-soft"
                :class="frequencyStore.isFocus ? 'bg-morandi-lavender/5' : 'bg-vibe-primary/10'"
              >
                <p 
                  class="font-mono text-mono text-xs mb-2"
                  :class="frequencyStore.isFocus ? 'text-morandi-lavender' : 'text-vibe-accent'"
                >
                  {{ frequencyStore.isFocus ? '要求' : '话题' }}
                </p>
                <p class="font-sans text-sm text-charcoal">
                  {{ frequencyStore.isFocus ? '仅限大二及以上' : '期末复习搭子' }}
                </p>
              </div>
            </div>
          </div>

          <!-- 快速统计 -->
          <div 
            class="rounded-morandi p-6 transition-all duration-500 shadow-morandi"
            :class="frequencyStore.isFocus 
              ? 'bg-card-base border border-slate/10' 
              : 'bg-card-vibe border border-vibe-primary/20'"
          >
            <header class="text-center mb-6">
              <p class="font-mono text-mono text-slate mb-2">STATS</p>
              <h3 class="text-h2 font-sans font-semibold text-charcoal">{{ pageConfig.statsTitle }}</h3>
            </header>
            <div class="space-y-3">
              <div 
                class="flex items-center justify-between p-3 rounded-soft"
                :class="frequencyStore.isFocus ? 'bg-morandi-green/10' : 'bg-vibe-primary/10'"
              >
                <span class="font-sans text-sm text-charcoal">
                  {{ frequencyStore.isFocus ? '新活动' : '新动态' }}
                </span>
                <span 
                  class="font-mono text-mono font-semibold"
                  :class="frequencyStore.isFocus ? 'text-morandi-green' : 'text-vibe-accent'"
                >
                  {{ modeArticles.length }}
                </span>
              </div>
              <div 
                class="flex items-center justify-between p-3 rounded-soft"
                :class="frequencyStore.isFocus ? 'bg-morandi-lavender/10' : 'bg-vibe-secondary/20'"
              >
                <span class="font-sans text-sm text-charcoal">
                  {{ frequencyStore.isFocus ? 'AI 推荐' : '正在约伴' }}
                </span>
                <span 
                  class="font-mono text-mono font-semibold"
                  :class="frequencyStore.isFocus ? 'text-morandi-lavender' : 'text-vibe-accent'"
                >
                  {{ modeRecommended.length }}
                </span>
              </div>
              <div 
                class="flex items-center justify-between p-3 rounded-soft"
                :class="frequencyStore.isFocus ? 'bg-morandi-blue/10' : 'bg-vibe-primary/10'"
              >
                <span class="font-sans text-sm text-charcoal">
                  {{ frequencyStore.isFocus ? '跨学科指数' : '活跃度' }}
                </span>
                <span 
                  class="font-mono text-mono font-semibold"
                  :class="frequencyStore.isFocus ? 'text-morandi-blue' : 'text-vibe-accent'"
                >
                  {{ frequencyStore.isFocus ? '89%' : 'HIGH' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.vibe-button {
  @apply bg-vibe-accent hover:bg-vibe-accent/90;
}
</style>
