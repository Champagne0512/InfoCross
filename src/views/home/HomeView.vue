<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import ArticleCard from '@/components/business/ArticleCard.vue'
import InsightPanel from '@/components/business/InsightPanel.vue'
import AppButton from '@/components/common/AppButton.vue'
import { PhUsersThree } from '@phosphor-icons/vue'
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

const tldrSample = {
  time: '12 月 20 日 14:00',
  place: '图书馆 B1',
  gate: '仅限大二及以上，需提交作品集',
  reward: '综测 +1.0 / 赛事补贴 800 元',
}

const filteredArticles = computed(() => {
  if (selectedCategory.value === 'all') return articles.value
  return articles.value.filter((article) => article.category === selectedCategory.value)
})

const previewArticles = computed(() => filteredArticles.value.slice(0, 4))
const previewRecommended = computed(() => recommended.value.slice(0, 3))

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
    <section class="grid gap-6 lg:grid-cols-12">
      <div class="panel lg:col-span-7">
        <div class="flex items-center justify-between">
          <p class="font-data text-xs text-ink-soft">{{ new Date().toLocaleDateString() }}</p>
          <span class="rounded-full bg-neutral px-3 py-1 text-xs text-ink-soft">Wall-Breaker Engine</span>
        </div>
        <h1 class="mt-4 text-4xl font-semibold text-ink">
          Hello, Explorer.<br />
          今天为你挑选 3 条最值得跨界参与的活动。
        </h1>
        <p class="mt-4 max-w-2xl text-[15px] text-ink-soft">
          InfoCross 将长文公告压缩为 TL;DR 卡片，并用语义向量挑选“专业外但相关”的机会。
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <AppButton variant="primary" @click="$router.push('/publish')">发布 / 组队</AppButton>
          <AppButton variant="ghost" @click="loadArticles">刷新推荐</AppButton>
        </div>
      </div>
      <div class="panel lg:col-span-5 space-y-3">
        <p class="font-data text-xs text-intelligence">TL;DR · 省流摘要</p>
        <div class="grid gap-3">
          <div class="tldr-card">
            <p class="font-data text-xs text-intelligence">TIME</p>
            <p class="text-sm text-ink">{{ tldrSample.time }}</p>
          </div>
          <div class="tldr-card">
            <p class="font-data text-xs text-intelligence">PLACE</p>
            <p class="text-sm text-ink">{{ tldrSample.place }}</p>
          </div>
          <div class="tldr-card">
            <p class="font-data text-xs text-intelligence">GATE</p>
            <p class="text-sm text-ink">{{ tldrSample.gate }}</p>
          </div>
          <div class="tldr-card">
            <p class="font-data text-xs text-intelligence">REWARD</p>
            <p class="text-sm text-ink">{{ tldrSample.reward }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div class="panel">
        <header class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="font-data text-xs text-ink-soft">Info Stream</p>
            <h2 class="text-2xl font-semibold text-ink mt-1">今日破壁线索</h2>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="category in categories"
              :key="category.value"
              class="pill-button"
              :class="{ 'is-active': selectedCategory === category.value }"
              @click="selectedCategory = category.value"
            >
              {{ category.label }}
            </button>
          </div>
        </header>
        <div v-if="loading" class="mt-6 grid gap-4 md:grid-cols-2">
          <div v-for="index in 4" :key="index" class="h-44 rounded-2xl bg-neutral animate-pulse" />
        </div>
        <div v-else class="mt-6 grid gap-4 md:grid-cols-2">
          <ArticleCard
            v-for="article in previewArticles"
            :key="article.id"
            :article="article"
            @bookmark="handleBookmark"
          />
        </div>
      </div>
      <div class="space-y-6">
        <InsightPanel v-if="heroInsights.length" :insights="heroInsights" />
        <div class="panel">
          <header class="flex items-center justify-between">
            <div>
              <p class="font-data text-xs text-intelligence">Wall-Breaker</p>
              <h3 class="text-lg font-semibold text-ink">你可能错过的跨界活动</h3>
            </div>
            <span class="rounded-full bg-intelligence/10 px-3 py-1 text-xs text-intelligence">语义推荐</span>
          </header>
          <div class="mt-4 space-y-4">
            <article
              v-for="article in previewRecommended"
              :key="`rec-${article.id}`"
              class="rounded-xl border border-border p-4 hover:border-intelligence"
            >
              <p class="font-data text-xs text-ink-soft">{{ article.college }}</p>
              <h4 class="mt-1 text-ink font-semibold">{{ article.title }}</h4>
              <p class="mt-1 text-sm text-ink-soft">{{ article.summary }}</p>
              <div class="mt-3 flex items-center justify-between text-xs text-ink-soft">
                <div class="flex items-center gap-2">
                  <PhUsersThree size="18" weight="duotone" class="text-intelligence" />
                  <span>{{ article.tags.slice(0, 1).join(' / ') || '破壁推荐' }}</span>
                </div>
                <span class="font-data text-intelligence">{{ (article.aiScore * 100).toFixed(0) }}%</span>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
