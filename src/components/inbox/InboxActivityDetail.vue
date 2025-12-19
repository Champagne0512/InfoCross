<script setup lang="ts">
import type { InboxActivityDetail } from '@/types/models'

defineProps<{
  detail: InboxActivityDetail
}>()
</script>

<template>
  <div class="h-full flex items-center justify-center">
    <div class="w-full max-w-3xl bg-white rounded-3xl border border-slate/10 shadow-morandi p-8 space-y-6">
      <header>
        <p class="font-mono text-xs text-slate uppercase tracking-[0.3em]">互动通知</p>
        <h2 class="text-2xl font-semibold text-charcoal mt-2">{{ detail.title }}</h2>
      </header>

      <section class="bg-slate/5 rounded-2xl p-5">
        <p class="text-xs text-slate/70 mb-2">引用内容</p>
        <p class="text-sm font-semibold text-charcoal">{{ detail.origin.title }}</p>
        <p class="text-sm text-slate mt-1">{{ detail.origin.excerpt }}</p>
      </section>

      <section>
        <p class="text-xs text-slate/70 mb-2">参与者</p>
        <div class="flex flex-wrap gap-2 text-sm text-charcoal">
          <span
            v-for="name in detail.participants"
            :key="name"
            class="px-3 py-1 rounded-full bg-slate/10"
          >
            {{ name }}
          </span>
        </div>
      </section>

      <section v-if="detail.comment" class="bg-white border border-slate/10 rounded-2xl p-5">
        <p class="text-xs text-slate/70 mb-2">最新留言</p>
        <p class="text-sm text-charcoal leading-relaxed">{{ detail.comment }}</p>
      </section>
    </div>
  </div>
</template>
