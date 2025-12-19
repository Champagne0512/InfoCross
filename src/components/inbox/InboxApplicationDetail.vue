<script setup lang="ts">
import { ref } from 'vue'
import type { InboxApplicationDetail } from '@/types/models'

const props = defineProps<{
  detail: InboxApplicationDetail
}>()

const reply = ref('')
</script>

<template>
  <div class="h-full flex items-center justify-center">
    <div class="w-full max-w-2xl bg-white rounded-[32px] shadow-morandi-lg border border-slate/10 p-8 space-y-6">
      <header class="flex items-center justify-between">
        <div>
          <p class="font-mono text-xs text-slate uppercase tracking-[0.3em]">{{ detail.projectName }}</p>
          <h2 class="text-2xl font-semibold text-charcoal mt-2">入队申请</h2>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-semibold bg-slate/10 text-slate">
          {{ detail.role }}
        </span>
      </header>

      <section class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-2xl bg-slate/10 flex items-center justify-center text-xl font-semibold">
          {{ detail.applicant.name.charAt(0) }}
        </div>
        <div>
          <p class="font-sans text-lg font-semibold text-charcoal">{{ detail.applicant.name }}</p>
          <p class="text-sm text-slate/70">{{ detail.applicant.college }}</p>
          <p class="text-xs text-slate/60 mt-1">技能：{{ detail.applicant.skills.join(' · ') }}</p>
        </div>
        <div class="ml-auto text-right">
          <p class="text-xs text-slate/70 mb-1">AI 匹配度</p>
          <div class="w-40 h-2 rounded-full bg-slate/10 overflow-hidden">
            <div class="h-full bg-charcoal" :style="{ width: `${Math.round(detail.matchScore * 100)}%` }" />
          </div>
          <p class="text-sm font-mono text-charcoal mt-1">{{ Math.round(detail.matchScore * 100) }}%</p>
        </div>
      </section>

      <section class="bg-slate/5 rounded-2xl p-4">
        <p class="text-xs text-slate/70 mb-2">附言</p>
        <p class="text-sm text-charcoal leading-relaxed">{{ detail.message }}</p>
      </section>

      <section class="space-y-3">
        <label class="text-xs text-slate/70">给申请人留言（可选）</label>
        <input
          v-model="reply"
          type="text"
          placeholder="留言..."
          class="w-full rounded-2xl border border-slate/10 px-4 py-3 text-sm focus:outline-none focus:border-charcoal"
        />
      </section>

      <footer class="flex items-center justify-end gap-3">
        <button class="px-6 py-3 rounded-full border border-slate/20 text-sm text-slate hover:border-charcoal/40">
          拒绝
        </button>
        <button class="px-6 py-3 rounded-full bg-charcoal text-white text-sm hover:bg-charcoal/90">
          同意
        </button>
      </footer>
    </div>
  </div>
</template>
