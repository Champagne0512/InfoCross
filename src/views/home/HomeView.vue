<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import ArticleCard from '@/components/business/ArticleCard.vue'
import InsightPanel from '@/components/business/InsightPanel.vue'
import AppButton from '@/components/common/AppButton.vue'
import AiIcon from '@/components/common/AiIcon.vue'
import { fetchArticles, fetchRecommendedArticles } from '@/api/article'
import type { Article } from '@/types/models'
import { buildMockInsights } from '@/utils/ai-parser'
import { useAuth } from '@/composables/useAuth'
import { recordInteraction } from '@/api/interaction'

const articles = ref<Article[]>([])
const recommended = ref<Article[]>([])
const selectedCategory = ref<string>('all')
const loading = ref(true)
const { profile } = useAuth()

const categories = [
  { label: '全部', value: 'all' },
  { label: '讲座', value: 'lecture' },
  { label: '比赛', value: 'competition' },
  { label: '研究', value: 'research' },
  { label: '通知', value: 'notice' },
]

const heroInsights = computed(() =>
  articles.value[0] ? buildMockInsights(articles.value[0]) : [],
)

const filteredArticles = computed(() => {
  if (selectedCategory.value === 'all') return articles.value
  return articles.value.filter((article) => article.category === selectedCategory.value)
})

const spotlightArticles = computed(() => filteredArticles.value.slice(0, 3))
const breakerHighlights = computed(() => recommended.value.slice(0, 2))

onMounted(async () => {
  await loadArticles()
})

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
</script>

<template>
  <div class="space-y-10">
    <!-- Hero 区域 - 直接融入背景 -->
    <section class="py-16 lg:py-20">
      <div class="max-w-4xl mx-auto text-center px-6">
        <p class="font-mono text-mono text-slate mb-4 tracking-wider">{{ new Date().toLocaleDateString() }}</p>
        <h1 class="text-hero font-sans font-bold text-charcoal mb-6 leading-tight">
          Hello, Explorer
        </h1>
        <p class="text-body font-sans text-slate mb-10 max-w-2xl mx-auto leading-relaxed">
          InfoCross 聚合各学院的讲座、竞赛与通知，并由 AI 自动摘要、打标、向量检索，为你推送最值得跨界投入的机会。
        </p>
        <div class="flex justify-center gap-4">
          <AppButton variant="primary" @click="$router.push('/publish')">发布活动</AppButton>
          <AppButton variant="ghost" @click="loadArticles">刷新流</AppButton>
        </div>
      </div>
    </section>

    <!-- 主内容区域 -->
    <section class="grid gap-10 lg:grid-cols-3">
      <!-- 左侧：主要内容 -->
      <div class="lg:col-span-2 space-y-10">
        <!-- 精选内容 -->
        <div class="morandi-card-base p-8">
          <header class="flex items-center justify-between mb-8">
            <div>
              <p class="font-mono text-mono text-slate mb-2">FEATURED</p>
              <h2 class="text-display font-sans font-semibold text-charcoal">精选破壁线索</h2>
            </div>
            <div class="flex gap-2">
              <button
                v-for="category in categories"
                :key="category.value"
                class="px-4 py-2 rounded-soft font-mono text-mono text-xs uppercase tracking-wider transition-all"
                :class="selectedCategory === category.value
                  ? 'bg-charcoal text-white'
                  : 'bg-white border border-slate/20 text-slate hover:bg-slate/5'"
                @click="selectedCategory = category.value"
              >
                {{ category.label }}
              </button>
            </div>
          </header>
          
          <div v-if="loading" class="grid gap-6 md:grid-cols-2">
            <div v-for="index in 4" :key="index" class="h-80 rounded-morandi bg-mist animate-pulse" />
          </div>
          
          <div v-else class="grid gap-6 md:grid-cols-2">
            <ArticleCard
              v-for="article in spotlightArticles"
              :key="article.id"
              :article="article"
              @bookmark="handleBookmark"
            />
          </div>
        </div>

        <!-- AI 推荐 -->
        <div class="morandi-card p-8">
          <header class="text-center mb-10">
            <p class="font-mono text-mono text-morandi-lavender mb-3">AI RECOMMENDATIONS</p>
            <h2 class="text-display font-sans font-semibold text-charcoal mb-4">破壁推荐</h2>
            <p class="text-body font-sans text-slate max-w-2xl mx-auto">
              根据你的兴趣标签与向量空间距离，AI 为你挑选跨学院内容
            </p>
          </header>
          
          <div class="grid gap-6 md:grid-cols-2">
            <ArticleCard
              v-for="article in breakerHighlights"
              :key="`rec-${article.id}`"
              :article="article"
              @bookmark="handleBookmark"
            />
          </div>
        </div>
      </div>

      <!-- 右侧：边栏 -->
      <div class="lg:col-span-1">
        <div class="sticky top-8 space-y-8">
          <!-- AI 洞察 -->
          <div v-if="heroInsights.length" class="morandi-card-lavender p-6">
            <div class="text-center mb-6">
              <div class="w-10 h-10 rounded-full bg-morandi-lavender/10 flex items-center justify-center text-morandi-lavender mx-auto mb-3">
                <AiIcon size="lg" color="#B4A8BF" />
              </div>
              <p class="font-mono text-mono text-morandi-lavender mb-2">AI INSIGHT</p>
              <h3 class="text-h2 font-sans font-semibold text-charcoal">跨学科提示</h3>
            </div>
            <InsightPanel :insights="heroInsights" />
          </div>

          <!-- 今日摘要 -->
          <div class="morandi-card-mist p-6">
            <header class="text-center mb-6">
              <p class="font-mono text-mono text-slate mb-2">TL;DR</p>
              <h3 class="text-h2 font-sans font-semibold text-charcoal">今日重点</h3>
            </header>
            <div class="space-y-4">
              <div class="p-4 rounded-soft bg-morandi-blue/5">
                <p class="font-mono text-mono text-morandi-blue text-xs mb-2">时间</p>
                <p class="font-sans text-sm text-charcoal">12 月 20 日 14:00</p>
              </div>
              <div class="p-4 rounded-soft bg-morandi-green/5">
                <p class="font-mono text-mono text-morandi-green text-xs mb-2">地点</p>
                <p class="font-sans text-sm text-charcoal">图书馆 B1</p>
              </div>
              <div class="p-4 rounded-soft bg-morandi-lavender/5">
                <p class="font-mono text-mono text-morandi-lavender text-xs mb-2">要求</p>
                <p class="font-sans text-sm text-charcoal">仅限大二及以上</p>
              </div>
            </div>
          </div>

          <!-- 快速统计 -->
          <div class="morandi-card p-6">
            <header class="text-center mb-6">
              <p class="font-mono text-mono text-slate mb-2">STATS</p>
              <h3 class="text-h2 font-sans font-semibold text-charcoal">今日数据</h3>
            </header>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 rounded-soft bg-morandi-green/10">
                <span class="font-sans text-sm text-charcoal">新活动</span>
                <span class="font-mono text-mono text-morandi-green font-semibold">{{ articles.length }}</span>
              </div>
              <div class="flex items-center justify-between p-3 rounded-soft bg-morandi-lavender/10">
                <span class="font-sans text-sm text-charcoal">AI 推荐</span>
                <span class="font-mono text-mono text-morandi-lavender font-semibold">{{ recommended.length }}</span>
              </div>
              <div class="flex items-center justify-between p-3 rounded-soft bg-morandi-blue/10">
                <span class="font-sans text-sm text-charcoal">跨学科指数</span>
                <span class="font-mono text-mono text-morandi-blue font-semibold">89%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
