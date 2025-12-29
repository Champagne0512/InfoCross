<script setup lang="ts">
import { ref } from 'vue'
import type { InboxApplicationDetail } from '@/types/models'
import { respondTeamApplication } from '@/api/teamWorkspace'
import { useInboxStore } from '@/stores/inboxStore'

const props = defineProps<{
  detail: InboxApplicationDetail
}>()

const emit = defineEmits<{
  (e: 'handled', status: 'approved' | 'rejected'): void
}>()

const inboxStore = useInboxStore()
const reply = ref('')
const isLoading = ref(false)
const handledStatus = ref<'approved' | 'rejected' | null>(null)

async function handleApprove() {
  if (!props.detail.applicationId || isLoading.value) return
  isLoading.value = true
  try {
    await respondTeamApplication(props.detail.applicationId, 'approved')
    handledStatus.value = 'approved'
    // 从预览列表中移除
    inboxStore.removeApplication(props.detail.id)
    emit('handled', 'approved')
  } catch (e: any) {
    console.error('审批失败:', e)
    const msg = e?.message || e?.error?.message || '操作失败，请重试'
    // 如果是已处理的申请，也标记为已处理并移除
    if (msg.includes('已处理')) {
      handledStatus.value = 'approved'
      inboxStore.removeApplication(props.detail.id)
    } else {
      alert(msg)
    }
  } finally {
    isLoading.value = false
  }
}

async function handleReject() {
  if (!props.detail.applicationId || isLoading.value) return
  isLoading.value = true
  try {
    await respondTeamApplication(props.detail.applicationId, 'rejected')
    handledStatus.value = 'rejected'
    // 从预览列表中移除
    inboxStore.removeApplication(props.detail.id)
    emit('handled', 'rejected')
  } catch (e: any) {
    console.error('拒绝失败:', e)
    const msg = e?.message || e?.error?.message || '操作失败，请重试'
    // 如果是已处理的申请，也标记为已处理并移除
    if (msg.includes('已处理')) {
      handledStatus.value = 'rejected'
      inboxStore.removeApplication(props.detail.id)
    } else {
      alert(msg)
    }
  } finally {
    isLoading.value = false
  }
}
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
        <template v-if="handledStatus">
          <p class="text-sm" :class="handledStatus === 'approved' ? 'text-green-600' : 'text-red-500'">
            {{ handledStatus === 'approved' ? '✓ 已同意' : '✗ 已拒绝' }}
          </p>
        </template>
        <template v-else-if="detail.applicationId">
          <button 
            class="px-6 py-3 rounded-full border border-slate/20 text-sm text-slate hover:border-red-300 hover:text-red-500 disabled:opacity-50"
            :disabled="isLoading"
            @click="handleReject"
          >
            {{ isLoading ? '处理中...' : '拒绝' }}
          </button>
          <button 
            class="px-6 py-3 rounded-full bg-charcoal text-white text-sm hover:bg-charcoal/90 disabled:opacity-50"
            :disabled="isLoading"
            @click="handleApprove"
          >
            {{ isLoading ? '处理中...' : '同意' }}
          </button>
        </template>
        <template v-else>
          <p class="text-sm text-slate/50">示例数据，无法操作</p>
        </template>
      </footer>
    </div>
  </div>
</template>
