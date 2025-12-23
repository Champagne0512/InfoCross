<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Clock } from 'lucide-vue-next'

const router = useRouter()

const historyItems = ref([
  { id: 1, title: '数学建模竞赛培训', date: '2024-12-19', category: '竞赛' },
  { id: 2, title: '英语角口语练习', date: '2024-12-17', category: '活动' },
  { id: 3, title: '编程马拉松比赛', date: '2024-12-16', category: '赛事' },
  { id: 4, title: '心理学公开课', date: '2024-12-13', category: '课程' },
])

function goBack() {
  router.back()
}
</script>

<template>
  <div class="min-h-screen bg-cream px-6 py-10">
    <div class="max-w-4xl mx-auto space-y-6">
      <header class="flex items-center justify-between">
        <div>
          <p class="text-xs font-mono tracking-[0.3em] text-slate">BROWSE LOG</p>
          <h1 class="text-h2 font-bold text-charcoal">浏览历史</h1>
        </div>
        <button class="px-4 py-2 rounded-full text-sm border border-slate/20" @click="goBack">返回个人主页</button>
      </header>

      <div class="timeline">
        <div v-for="item in historyItems" :key="item.id" class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-card">
            <div class="timeline-meta">
              <span class="pill">{{ item.category }}</span>
              <span class="date-pill">{{ item.date }}</span>
            </div>
            <h3 class="timeline-title">{{ item.title }}</h3>
          </div>
        </div>
        <div v-if="!historyItems.length" class="empty-state">
          <Clock :size="24" class="text-slate/30" />
          <p>暂无浏览记录</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline {
  @apply relative border-l border-slate/10 pl-6 space-y-6;
}

.timeline-item {
  @apply relative;
}

.timeline-dot {
  @apply w-4 h-4 rounded-full bg-white border-2 border-focus-accent absolute -left-[9px] top-1 shadow;
}

.timeline-card {
  @apply bg-white rounded-2xl border border-slate/10 p-4 shadow-sm;
}

.timeline-meta {
  @apply flex items-center justify-between mb-2;
}

.pill {
  @apply px-2 py-0.5 rounded-full bg-focus-primary/10 text-focus-accent text-xs font-mono;
}

.date-pill {
  @apply font-mono text-xs text-slate/60;
}

.timeline-title {
  @apply text-charcoal font-semibold;
}

.empty-state {
  @apply flex flex-col items-center gap-2 text-sm text-slate py-12;
}
</style>
