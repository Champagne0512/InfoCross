<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useInboxStore } from '@/stores/inboxStore'
import { useFrequencyStore } from '@/stores/frequencyStore'
import type { InboxCategory } from '@/types/models'
import EnvelopeFanList from '@/components/inbox/EnvelopeFanList.vue'
import PageFlipDetail from '@/components/inbox/PageFlipDetail.vue'
import { MessageCircle, Inbox, Zap, Bell } from 'lucide-vue-next'

const inboxStore = useInboxStore()
const frequencyStore = useFrequencyStore()
const { filteredPreviews, activeCategory, selectedPreview, currentDetail, selectedId } = storeToRefs(inboxStore)

const categories: Array<{ label: string; value: InboxCategory; icon: typeof MessageCircle }> = [
  { label: '聊天', value: 'chats', icon: MessageCircle },
  { label: '申请', value: 'applications', icon: Inbox },
  { label: '互动', value: 'activity', icon: Zap },
  { label: '系统', value: 'system', icon: Bell },
]

onMounted(async () => {
  // 加载用户的小组聊天
  await inboxStore.loadUserChats()
  inboxStore.selectCategory(activeCategory.value)
})
</script>

<template>
  <div class="inbox-container">
    <!-- 页面头部 -->
    <header class="inbox-header">
      <div class="header-info">
        <p class="font-mono text-sm text-slate tracking-wider">INBOX</p>
        <h1 class="text-3xl font-sans font-bold text-charcoal">消息中心</h1>
      </div>
      <!-- 分类标签 -->
      <nav class="category-tabs">
        <button
          v-for="category in categories"
          :key="category.value"
          class="tab-btn"
          :class="[
            activeCategory === category.value
              ? (frequencyStore.isFocus ? 'tab-active-focus' : 'tab-active-vibe')
              : 'tab-inactive'
          ]"
          @click="inboxStore.selectCategory(category.value)"
        >
          <component :is="category.icon" :size="16" />
          <span>{{ category.label }}</span>
        </button>
      </nav>
    </header>

    <!-- 主内容区：信封扇形列表 + 翻页详情 -->
    <div class="inbox-main">
      <!-- 信封扇形列表容器 -->
      <aside class="fan-list-container">
        <div class="list-header">
          <p class="font-sans text-sm font-medium text-charcoal">
            {{ categories.find((c) => c.value === activeCategory)?.label }}
          </p>
          <span class="count-badge">{{ filteredPreviews.length }}</span>
        </div>
        <div class="fan-wrapper">
          <EnvelopeFanList 
            :items="filteredPreviews"
            :selected-id="selectedId"
            @select="(preview) => inboxStore.selectItem(preview.id)"
          />
        </div>
      </aside>

      <!-- 翻页详情面板 -->
      <section class="detail-panel">
        <PageFlipDetail 
          :preview="selectedPreview"
          :detail="currentDetail ?? null"
        />
      </section>
    </div>
  </div>
</template>

<style scoped>
.inbox-container {
  @apply flex flex-col;
  height: calc(100vh - 80px);
}

/* 头部 */
.inbox-header {
  @apply flex items-end justify-between pb-6 border-b border-slate/10;
}

.header-info {
  @apply space-y-1;
}

.category-tabs {
  @apply flex items-center gap-3;
}

.tab-btn {
  @apply flex items-center gap-2 px-5 py-2.5 rounded-full;
  @apply font-sans text-base transition-all duration-200;
}

.tab-inactive {
  @apply text-slate hover:bg-slate/5;
}

.tab-active-focus {
  @apply bg-focus-accent text-white;
}

.tab-active-vibe {
  @apply bg-vibe-accent text-white;
}

/* 主内容 */
.inbox-main {
  @apply flex-1 flex gap-6 pt-6 min-h-0;
}

/* 信封扇形列表容器 - 透明背景 */
.fan-list-container {
  @apply w-[480px] flex-shrink-0 flex flex-col;
  height: 100%;
  background: transparent;
  overflow: visible;
}

.list-header {
  @apply flex items-center justify-between px-6 py-4;
}

.list-header p {
  @apply text-base;
}

.count-badge {
  @apply px-2.5 py-1 rounded-full bg-slate/10 font-mono text-sm text-slate;
}

.fan-wrapper {
  @apply flex-1 relative;
  min-height: 0;
}

/* 详情区域 - 固定高度 */
.detail-panel {
  @apply flex-1 min-w-0;
  height: 100%;
  border-radius: 24px;
  overflow: hidden;
  background: linear-gradient(to bottom, 
    rgba(255, 255, 255, 0.95),
    rgba(249, 247, 244, 0.9)
  );
  border: 1px solid rgba(107, 114, 128, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}
</style>
