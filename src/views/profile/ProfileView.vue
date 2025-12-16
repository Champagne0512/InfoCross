<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import TagBadge from '@/components/business/TagBadge.vue'
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/userStore'
import { formatRelativeTime } from '@/utils/date'

const { profile, interactions } = useAuth()
const userStore = useUserStore()
const { loading } = storeToRefs(userStore)

const radarData = [
  { label: '学术', value: 80 },
  { label: '艺术', value: 55 },
  { label: '运动', value: 35 },
  { label: '公益', value: 60 },
  { label: '生活', value: 45 },
]

const badges = [
  { label: '文理兼修', unlocked: true },
  { label: '跨校旅行家', unlocked: false },
  { label: '夜跑计划', unlocked: true },
  { label: '公益先锋', unlocked: false },
]

const radarPath = computed(() => {
  const center = 100
  const radius = 80
  const angleStep = (Math.PI * 2) / radarData.length
  return radarData
    .map((metric, index) => {
      const angle = -Math.PI / 2 + angleStep * index
      const distance = radius * (metric.value / 100)
      const x = center + Math.cos(angle) * distance
      const y = center + Math.sin(angle) * distance
      return `${x},${y}`
    })
    .join(' ')
})
</script>

<template>
  <div class="space-y-10">
    <section class="panel">
      <div class="rounded-2xl border border-border bg-white p-6 shadow-sheet">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="font-data text-xs text-ink-soft">Digital ID</p>
            <h1 class="mt-2 text-2xl font-semibold text-ink">{{ profile?.username ?? '未登录' }}</h1>
            <p class="text-sm text-ink-soft">{{ profile?.college }} · {{ profile?.major }}</p>
            <div class="mt-4 flex flex-wrap gap-2">
              <TagBadge v-for="tag in profile?.tags" :key="tag" :label="tag" accent />
            </div>
          </div>
          <div class="min-w-[140px] rounded-2xl bg-neutral p-4 text-center">
            <p class="font-data text-xs text-ink-soft">破壁指数</p>
            <p class="text-3xl font-semibold text-intelligence">89%</p>
            <div class="mt-3 h-12 w-full rounded bg-[repeating-linear-gradient(90deg,#0f172a_0_8px,transparent_8px_16px)]" />
          </div>
        </div>
        <div class="mt-6 grid gap-4 md:grid-cols-3">
          <div class="rounded-xl border border-border bg-white p-4 text-center">
            <p class="font-data text-xs text-ink-soft">互动次数</p>
            <p class="mt-2 text-2xl font-semibold text-ink">{{ interactions.length }}</p>
          </div>
          <div class="rounded-xl border border-border bg-white p-4 text-center">
            <p class="font-data text-xs text-ink-soft">兴趣标签</p>
            <p class="mt-2 text-2xl font-semibold text-ink">{{ profile?.tags?.length ?? 0 }}</p>
          </div>
          <div class="rounded-xl border border-border bg-white p-4 text-center">
            <p class="font-data text-xs text-ink-soft">跨院领域</p>
            <p class="mt-2 text-2xl font-semibold text-ink">4</p>
          </div>
        </div>
      </div>
    </section>

    <section class="grid gap-6 lg:grid-cols-2">
      <div class="panel">
        <p class="font-data text-xs text-ink-soft">Explorer Footprint</p>
        <h2 class="mt-2 text-xl font-semibold text-ink">破壁维度雷达</h2>
        <div class="mt-4 flex items-center gap-6">
          <svg viewBox="0 0 200 200" class="h-56 w-56 text-intelligence/30">
            <polygon
              v-for="layer in [80, 60, 40]"
              :key="layer"
              fill="none"
              stroke="currentColor"
              :points="radarData
                .map((metric, index) => {
                  const angle = -Math.PI / 2 + ((Math.PI * 2) / radarData.length) * index
                  const distance = layer * (metric.value / 100)
                  const x = 100 + Math.cos(angle) * distance
                  const y = 100 + Math.sin(angle) * distance
                  return `${x},${y}`
                })
                .join(' ')"
            />
            <polygon :points="radarPath" fill="#7C3AED22" stroke="#7C3AED" stroke-width="1.5" />
          </svg>
          <ul class="space-y-3 text-sm text-ink">
            <li v-for="point in radarData" :key="point.label" class="flex items-center gap-3">
              <span class="h-2 w-2 rounded-full bg-intelligence/60" />
              <span class="flex-1">{{ point.label }}</span>
              <span class="font-data text-xs text-ink-soft">{{ point.value }}%</span>
            </li>
          </ul>
        </div>
      </div>
      <div class="panel">
        <p class="font-data text-xs text-ink-soft">Badge Wall</p>
        <h2 class="mt-2 text-xl font-semibold text-ink">勋章墙</h2>
        <div class="mt-4 grid grid-cols-2 gap-4">
          <div
            v-for="badge in badges"
            :key="badge.label"
            class="rounded-2xl border border-dashed border-border p-4 text-center"
          >
            <div
              class="mx-auto h-14 w-14 rounded-full border-2"
              :class="badge.unlocked ? 'border-intelligence bg-intelligence/10' : 'border-border bg-neutral'"
            />
            <p class="mt-3 text-sm font-medium" :class="badge.unlocked ? 'text-ink' : 'text-ink-soft'">
              {{ badge.label }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="panel">
      <header class="flex items-center justify-between">
        <div>
          <p class="font-data text-xs text-ink-soft">Activity Log</p>
          <h3 class="text-xl font-semibold text-ink">互动记录</h3>
        </div>
        <span class="rounded-full bg-intelligence/10 px-3 py-1 text-xs text-intelligence">实时同步</span>
      </header>
      <div v-if="loading" class="mt-4 space-y-3">
        <div v-for="index in 3" :key="index" class="h-16 rounded-xl bg-neutral animate-pulse" />
      </div>
      <ul v-else class="mt-4 space-y-3">
        <li
          v-for="interaction in interactions"
          :key="interaction.id"
          class="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3 shadow-subtle"
        >
          <div class="flex flex-col">
            <span class="font-semibold text-ink">{{ interaction.type }}</span>
            <span class="text-sm text-ink-soft">InfoCross 平台</span>
          </div>
          <span class="font-data text-xs text-ink-soft">{{ formatRelativeTime(interaction.createdAt) }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>
