<script setup lang="ts">
import type { AiInsight } from '@/types/models'
import TagBadge from './TagBadge.vue'

defineProps<{
  insights: AiInsight[]
}>()
</script>

<template>
  <section class="insight-panel stagger-in-2">
    <header class="mb-6 flex items-center justify-between">
      <div>
        <p class="font-mono text-mono text-neon-cyan uppercase tracking-wider">AI Insight</p>
        <h3 class="text-display font-display font-semibold mt-2 gradient-text">跨学科提示</h3>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-neon-purple animate-glow">✦</span>
        <TagBadge label="AI" :accent="true" />
      </div>
    </header>
    
    <div class="space-y-4">
      <article
        v-for="insight in insights"
        :key="insight.headline"
        class="glass-card p-4 border border-neon-purple/20 hover:border-neon-cyan/30 transition-all duration-300"
      >
        <div class="flex items-center justify-between text-body font-body font-medium mb-2">
          <span class="text-text-primary">{{ insight.headline }}</span>
          <span class="font-mono text-mono text-neon-cyan">
            {{ (insight.confidence * 100).toFixed(0) }}%
          </span>
        </div>
        <p class="text-body font-body text-text-secondary mb-3">{{ insight.description }}</p>
        <div class="flex flex-wrap gap-2">
          <TagBadge v-for="tag in insight.tags" :key="tag" :label="tag" :accent="true" />
        </div>
      </article>
    </div>
  </section>
</template>
