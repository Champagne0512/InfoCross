<script setup lang="ts">
import type { AiInsight } from '@/types/models'
import { PhMagicWand } from '@phosphor-icons/vue'

defineProps<{
  insights: AiInsight[]
}>()
</script>

<template>
  <section class="rounded-2xl border border-intelligence/30 bg-surface p-5 shadow-subtle">
    <header class="mb-4 flex items-center justify-between">
      <div>
        <p class="font-data text-xs text-intelligence">AI BRIEF</p>
        <h3 class="text-lg font-semibold text-ink mt-1">跨学科建议</h3>
      </div>
      <div class="rounded-full bg-intelligence/10 px-3 py-1 text-xs text-intelligence font-semibold">破壁推荐</div>
    </header>
    <div class="space-y-3">
      <article
        v-for="insight in insights"
        :key="insight.headline"
        class="rounded-xl border border-border p-4 transition hover:border-intelligence"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-ink">
            <PhMagicWand size="18" weight="duotone" class="text-intelligence" />
            <span class="font-semibold">{{ insight.headline }}</span>
          </div>
          <span class="font-data text-[0.6rem] text-intelligence">
            {{ (insight.confidence * 100).toFixed(0) }}%
          </span>
        </div>
        <p class="mt-2 text-[15px] text-ink-soft">{{ insight.description }}</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <span
            v-for="tag in insight.tags"
            :key="tag"
            class="rounded-full bg-intelligence/10 px-3 py-1 text-xs font-medium text-intelligence"
          >
            #{{ tag }}
          </span>
        </div>
      </article>
    </div>
  </section>
</template>
