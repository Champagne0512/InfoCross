<script setup lang="ts">
import { storeToRefs } from 'pinia'
import TagBadge from '@/components/business/TagBadge.vue'
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/userStore'
import { formatRelativeTime } from '@/utils/date'

const { profile, interactions } = useAuth()
const userStore = useUserStore()
const { loading } = storeToRefs(userStore)
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-8">
    <!-- 用户档案卡片 -->
    <div class="glass-card p-8">
      <p class="font-mono text-mono text-neon-cyan uppercase tracking-wider">Profile</p>
      <h1 class="text-hero font-display font-bold mt-4 gradient-text">{{ profile?.username ?? '访客' }}</h1>
      <p class="text-body font-body text-text-secondary mt-3">
        {{ profile?.college }} · {{ profile?.major }}
      </p>
      <div class="mt-6 flex flex-wrap gap-3">
        <TagBadge v-for="tag in profile?.tags" :key="tag" :label="tag" :accent="true" />
      </div>
      
      <!-- 数据统计 -->
      <div class="grid grid-cols-3 gap-4 mt-8">
        <div class="glass-card p-4 text-center">
          <div class="text-display font-display font-bold text-neon-purple">{{ interactions.length }}</div>
          <div class="font-mono text-mono text-text-secondary text-sm uppercase tracking-wider mt-1">互动次数</div>
        </div>
        <div class="glass-card p-4 text-center">
          <div class="text-display font-display font-bold text-neon-cyan">{{ profile?.tags?.length || 0 }}</div>
          <div class="font-mono text-mono text-text-secondary text-sm uppercase tracking-wider mt-1">兴趣标签</div>
        </div>
        <div class="glass-card p-4 text-center">
          <div class="text-display font-display font-bold text-neon-orange">89%</div>
          <div class="font-mono text-mono text-text-secondary text-sm uppercase tracking-wider mt-1">破壁指数</div>
        </div>
      </div>
    </div>

    <!-- 活动记录 -->
    <div class="glass-card p-8">
      <header class="flex items-center justify-between mb-8">
        <div>
          <p class="font-mono text-mono text-neon-cyan uppercase tracking-wider">Activity</p>
          <h2 class="text-display font-display font-semibold mt-2 text-text-primary">互动记录</h2>
        </div>
        <div class="data-tile">实时更新</div>
      </header>

      <div v-if="loading" class="space-y-3">
        <div v-for="index in 3" :key="index" class="h-20 skeleton" />
      </div>
      <ul v-else class="space-y-4">
        <li
          v-for="(interaction, index) in interactions"
          :key="interaction.id"
          class="glass-card p-4 flex items-center justify-between hover:border-neon-cyan/30 transition-all duration-300"
          :class="`stagger-in-${(index % 4) + 1}`"
        >
          <div class="flex items-center gap-3">
            <span class="text-neon-purple">✦</span>
            <span class="font-mono text-mono text-text-primary uppercase tracking-wider">{{ interaction.type }}</span>
          </div>
          <span class="font-mono text-mono text-text-secondary">{{ formatRelativeTime(interaction.createdAt) }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
