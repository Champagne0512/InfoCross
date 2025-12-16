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

const skillGaps = [
  { role: '财务分析', status: '待加入' },
  { role: 'UI 设计', status: '待加入' },
  { role: '视频剪辑', status: '已匹配' },
]

const footprint = [
  { label: '学术', value: 80, color: 'bg-academic/50' },
  { label: '娱乐', value: 45, color: 'bg-life/50' },
  { label: '运动', value: 30, color: 'bg-activity/50' },
  { label: '公益', value: 55, color: 'bg-intelligence/30' },
]

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
  <div class="space-y-10">
    <!-- Hero & Metrics -->
    <section class="grid gap-6 lg:grid-cols-12">
      <div class="panel lg:col-span-7">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-data text-xs text-ink-soft">{{ new Date().toLocaleDateString() }}</p>
            <h1 class="hero-title font-display text-ink mt-2">
              Hello, Explorer.<br />
              今日你想去哪一座学术宇宙？
            </h1>
          </div>
          <div class="text-right">
            <p class="text-sm text-ink-soft">Wall-Breaker Engine</p>
            <p class="font-display text-3xl text-intelligence">89%</p>
          </div>
        </div>
        <p class="mt-4 max-w-2xl text-[15px] text-ink-soft">
          基于语义向量的破壁推荐引擎，主动向你推送专业之外但逻辑相关的活动，并提供可执行的“省流”摘要、智能组队和探索足迹。
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <AppButton variant="primary" @click="$router.push('/publish')">发布/组队</AppButton>
          <AppButton variant="ghost" @click="loadArticles">刷新数据</AppButton>
        </div>
      </div>
      <div class="grid gap-4 lg:col-span-5 sm:grid-cols-2 lg:grid-cols-1">
        <div
          v-for="tile in [
            { label: '今日新增', value: `${articles.length} 条`, desc: 'AI 自建摘要' },
            { label: '技能缺口', value: '3 个', desc: '等待跨院系补位' },
            { label: '足迹板块', value: '4', desc: '学术/运动/公益/生活' },
          ]"
          :key="tile.label"
          class="rounded-xl border border-border bg-surface p-4 shadow-subtle"
        >
          <p class="text-xs uppercase tracking-[0.3em] text-ink-soft">{{ tile.label }}</p>
          <p class="mt-2 text-2xl font-semibold text-ink">{{ tile.value }}</p>
          <p class="text-sm text-ink-soft">{{ tile.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Feature Grid -->
    <section class="bento-grid">
      <div class="panel col-span-2">
        <h3 class="text-xl font-semibold text-ink">TL;DR · 省流摘要代理</h3>
        <p class="mt-2 text-sm text-ink-soft">自动提炼活动关键信息，四个字段必须呈现。</p>
        <div class="mt-4 grid gap-3 md:grid-cols-2">
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
      <div class="panel">
        <h3 class="text-xl font-semibold text-ink">技能互补型组队</h3>
        <p class="text-sm text-ink-soft">AI 按角色缺口排序，优先通知具备互补技能的同学。</p>
        <ul class="mt-4 space-y-3">
          <li
            v-for="gap in skillGaps"
            :key="gap.role"
            class="flex items-center justify-between rounded-xl border border-dashed border-border px-4 py-3"
          >
            <span class="font-medium text-ink">{{ gap.role }}</span>
            <span class="font-data text-xs" :class="gap.status === '待加入' ? 'text-life' : 'text-ink-soft'">
              {{ gap.status }}
            </span>
          </li>
        </ul>
      </div>
      <div class="panel">
        <h3 class="text-xl font-semibold text-ink">Explorer Footprint</h3>
        <p class="text-sm text-ink-soft">实时记录你在不同领域的探索分布。</p>
        <div class="mt-4 space-y-3">
          <div
            v-for="point in footprint"
            :key="point.label"
            class="flex items-center gap-3"
          >
            <span class="font-data text-xs text-ink-soft w-20">{{ point.label }}</span>
            <div class="flex-1 rounded-full bg-neutral">
              <div class="h-2 rounded-full" :class="point.color" :style="{ width: `${point.value}%` }" />
            </div>
            <span class="text-sm text-ink">{{ point.value }}%</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Streams -->
    <section class="grid gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
      <div class="panel">
        <header class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="font-data text-xs text-ink-soft">Info Stream</p>
            <h2 class="text-2xl font-semibold text-ink mt-1">今日更新</h2>
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
            v-for="article in filteredArticles"
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
              <h3 class="text-lg font-semibold text-ink">破壁推荐引擎</h3>
            </div>
            <span class="rounded-full bg-intelligence/10 px-3 py-1 text-xs text-intelligence">语义距离</span>
          </header>
          <div class="mt-4 space-y-4">
            <article
              v-for="article in recommended"
              :key="`rec-${article.id}`"
              class="rounded-xl border border-border p-4 hover:border-intelligence"
            >
              <p class="font-data text-xs text-ink-soft">{{ article.college }}</p>
              <h4 class="mt-1 text-ink font-semibold">{{ article.title }}</h4>
              <p class="mt-1 text-sm text-ink-soft">{{ article.summary }}</p>
              <div class="mt-3 flex items-center justify-between text-xs text-ink-soft">
                <div class="flex items-center gap-2">
                  <PhUsersThree size="18" weight="duotone" class="text-intelligence" />
                  <span>破壁推荐</span>
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
