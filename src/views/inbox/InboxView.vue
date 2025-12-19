<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useInboxStore } from '@/stores/inboxStore'
import { useFrequencyStore } from '@/stores/frequencyStore'
import type {
  InboxCategory,
  InboxChatThread,
  InboxApplicationDetail,
  InboxActivityDetail,
  InboxSystemDetail,
} from '@/types/models'
import InboxListItem from '@/components/inbox/InboxListItem.vue'
import InboxChatRoom from '@/components/inbox/InboxChatRoom.vue'
import ApplicationDetailCard from '@/components/inbox/InboxApplicationDetail.vue'
import ActivityDetailCard from '@/components/inbox/InboxActivityDetail.vue'
import SystemDetailCard from '@/components/inbox/InboxSystemDetail.vue'
import { MessageCircle, Inbox, Zap, Bell } from 'lucide-vue-next'

const inboxStore = useInboxStore()
const frequencyStore = useFrequencyStore()
const { filteredPreviews, activeCategory, selectedPreview, currentDetail } = storeToRefs(inboxStore)

const categories: Array<{ label: string; value: InboxCategory; icon: any }> = [
  { label: '聊天', value: 'chats', icon: MessageCircle },
  { label: '申请', value: 'applications', icon: Inbox },
  { label: '互动', value: 'activity', icon: Zap },
  { label: '系统', value: 'system', icon: Bell },
]

onMounted(() => {
  inboxStore.selectCategory(activeCategory.value)
})

const detailType = computed(() => selectedPreview.value?.category ?? null)

const chatDetail = computed<InboxChatThread | null>(() =>
  detailType.value === 'chats' ? (currentDetail.value as InboxChatThread) : null,
)
const applicationDetail = computed<InboxApplicationDetail | null>(() =>
  detailType.value === 'applications' ? (currentDetail.value as InboxApplicationDetail) : null,
)
const activityDetail = computed<InboxActivityDetail | null>(() =>
  detailType.value === 'activity' ? (currentDetail.value as InboxActivityDetail) : null,
)
const systemDetail = computed<InboxSystemDetail | null>(() =>
  detailType.value === 'system' ? (currentDetail.value as InboxSystemDetail) : null,
)
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

    <!-- 主内容区：列表 + 详情 -->
    <div class="inbox-main">
      <!-- 消息列表 -->
      <aside class="message-list">
        <div class="list-header">
          <p class="font-sans text-sm font-medium text-charcoal">
            {{ categories.find((c) => c.value === activeCategory)?.label }}
          </p>
          <span class="count-badge">{{ filteredPreviews.length }}</span>
        </div>
        <div class="list-content">
          <InboxListItem
            v-for="item in filteredPreviews"
            :key="item.id"
            :item="item"
            :active="item.id === inboxStore.selectedId"
            @select="(preview) => inboxStore.selectItem(preview.id)"
          />
          <div v-if="!filteredPreviews.length" class="empty-list">
            <p>暂无消息</p>
          </div>
        </div>
      </aside>

      <!-- 详情区域 -->
      <section class="detail-panel">
        <div v-if="!selectedPreview" class="empty-detail">
          <div class="empty-icon">
            <MessageCircle :size="32" class="text-slate/30" />
          </div>
          <p>选择一条消息查看详情</p>
        </div>
        <div v-else class="detail-content">
          <InboxChatRoom v-if="chatDetail" :thread="chatDetail" />
          <ApplicationDetailCard v-else-if="applicationDetail" :detail="applicationDetail" />
          <ActivityDetailCard v-else-if="activityDetail" :detail="activityDetail" />
          <SystemDetailCard v-else-if="systemDetail" :detail="systemDetail" />
        </div>
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

/* 消息列表 - 固定高度 */
.message-list {
  @apply w-96 flex-shrink-0 flex flex-col bg-white rounded-2xl border border-slate/10;
  height: 100%;
}

.list-header {
  @apply flex items-center justify-between px-5 py-4 border-b border-slate/10;
}

.list-header p {
  @apply text-base;
}

.count-badge {
  @apply px-2.5 py-1 rounded-full bg-slate/10 font-mono text-sm text-slate;
}

.list-content {
  @apply flex-1 overflow-y-auto p-3 space-y-2;
}

.empty-list {
  @apply flex items-center justify-center h-full;
}

.empty-list p {
  @apply font-sans text-base text-slate;
}

/* 详情区域 - 固定高度 */
.detail-panel {
  @apply flex-1 min-w-0 bg-white rounded-2xl border border-slate/10;
  height: 100%;
}

.empty-detail {
  @apply h-full flex flex-col items-center justify-center gap-4;
}

.empty-icon {
  @apply w-20 h-20 rounded-full bg-slate/5 flex items-center justify-center;
}

.empty-detail p {
  @apply font-sans text-base text-slate;
}

.detail-content {
  @apply h-full overflow-hidden;
}
</style>
