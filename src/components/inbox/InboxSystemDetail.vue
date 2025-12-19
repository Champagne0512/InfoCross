<script setup lang="ts">
import type { InboxSystemDetail } from '@/types/models'

defineProps<{
  detail: InboxSystemDetail
}>()
</script>

<template>
  <div class="h-full flex items-center justify-center">
    <div class="w-full max-w-2xl bg-white rounded-3xl border border-slate/10 shadow-morandi p-8 space-y-4">
      <p class="font-mono text-xs text-slate uppercase tracking-[0.3em]">系统公告</p>
      <h2 class="text-2xl font-semibold text-charcoal">{{ detail.title }}</h2>
      <p class="text-sm text-charcoal leading-relaxed">{{ detail.body }}</p>
    </div>
  </div>
</template>
