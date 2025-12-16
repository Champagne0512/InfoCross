<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import ArticleCard from '@/components/business/ArticleCard.vue'
import InsightPanel from '@/components/business/InsightPanel.vue'
import TagBadge from '@/components/business/TagBadge.vue'
import AppButton from '@/components/common/AppButton.vue'
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
  <div class="space-y-12">
    <!-- Hero Section - 控制台风格 -->
    <section class="grid gap-6 lg:grid-cols-12">
      <div class="lg:col-span-7 hero-section stagger-in">
        <div class="flex items-center justify-between mb-6">
          <p class="font-mono text-mono text-neon-cyan uppercase tracking-wider">The Hub</p>
          <div class="flex gap-2">
            <div class="data-tile stagger-in-1">今日入库 {{ articles.length }} 条</div>
            <div class="data-tile stagger-in-2">跨学科指数 89%</div>
          </div>
        </div>
        <h1 class="text-hero font-display font-bold mb-6">
          Hello, Explorer.<br />
          <span class="gradient-text">发现跨学科机会</span>
        </h1>
        <p class="text-body font-body text-text-secondary mb-8 max-w-2xl">
          InfoCross 聚合各学院的讲座、竞赛与通知，并由 AI 自动摘要、打标、向量检索，为你推送最值得跨界投入的机会。
        </p>
        <div class="flex flex-wrap gap-3 mb-8">
          <TagBadge label="AI摘要" :accent="true" />
          <TagBadge label="pgvector" />
          <TagBadge label="Realtime" />
          <TagBadge label="Vector Search" :accent="true" />
        </div>
        <div class="flex flex-wrap gap-4">
          <AppButton variant="neon" @click="$router.push('/publish')">上传活动海报</AppButton>
          <AppButton variant="glass" @click="loadArticles">刷新流</AppButton>
        </div>
      </div>
      
      <!-- 右侧情报局 -->
      <div class="lg:col-span-5">
        <InsightPanel v-if="heroInsights.length" :insights="heroInsights" />
      </div>
    </section>

    <!-- 信息流区域 -->
    <section class="glass-card p-8">
      <header class="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <p class="font-mono text-mono text-neon-cyan uppercase tracking-wider">Info Stream</p>
          <h2 class="text-display font-display font-semibold mt-2">今日更新</h2>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="category in categories"
            :key="category.value"
            class="px-4 py-2 rounded-button font-mono text-mono transition-all duration-300"
            :class="
              selectedCategory === category.value
                ? 'bg-neon-purple/80 border border-neon-purple/50 text-white shadow-glow-purple'
                : 'glass-card border-glass-border text-text-secondary hover:border-neon-cyan/30'
            "
            @click="selectedCategory = category.value"
          >
            {{ category.label }}
          </button>
        </div>
      </header>
      
      <div v-if="loading" class="grid gap-4 md:grid-cols-2">
        <div
          v-for="index in 4"
          :key="index"
          class="h-64 skeleton"
        />
      </div>
      <div v-else class="grid gap-4 md:grid-cols-2">
        <ArticleCard
          v-for="(article, index) in filteredArticles"
          :key="article.id"
          :article="article"
          :class="`stagger-in-${(index % 4) + 1}`"
          @bookmark="handleBookmark"
        />
      </div>
    </section>

    <!-- AI 破壁推荐 -->
    <section class="glass-card p-8">
      <header class="flex flex-col gap-3 mb-8">
        <p class="font-mono text-mono text-neon-cyan uppercase tracking-wider">Breaker Mode</p>
        <h2 class="text-display font-display font-semibold">AI 破壁推荐</h2>
        <p class="text-body font-body text-text-secondary">
          根据你的兴趣标签与向量空间距离，AI 为你挑选跨学院内容。
        </p>
      </header>
      <div class="grid gap-4 md:grid-cols-2">
        <ArticleCard
          v-for="(article, index) in recommended"
          :key="`rec-${article.id}`"
          :article="article"
          :class="`stagger-in-${(index % 4) + 1}`"
          @bookmark="handleBookmark"
        />
      </div>
    </section>
  </div>
</template>
