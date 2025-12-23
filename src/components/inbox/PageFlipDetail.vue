<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useFrequencyStore } from '@/stores/frequencyStore'
import type {
  InboxPreview,
  InboxChatThread,
  InboxApplicationDetail,
  InboxActivityDetail,
  InboxSystemDetail,
} from '@/types/models'
import InboxChatRoom from './InboxChatRoom.vue'
import InboxApplicationDetailCard from './InboxApplicationDetail.vue'
import InboxActivityDetailCard from './InboxActivityDetail.vue'
import InboxSystemDetailCard from './InboxSystemDetail.vue'
import { Mail } from 'lucide-vue-next'

type DetailType = InboxChatThread | InboxApplicationDetail | InboxActivityDetail | InboxSystemDetail | null

const props = defineProps<{
  preview: InboxPreview | null
  detail: DetailType
}>()

const frequencyStore = useFrequencyStore()

const displayedDetail = ref<DetailType>(props.detail ?? null)
const transitionKey = ref(0)

// detail 每次更新时立即切换内容，同时递增 key 触发渐变
watch(
  () => props.detail,
  (newDetail) => {
    displayedDetail.value = newDetail ?? null
    transitionKey.value++
  },
  { immediate: true },
)

const detailType = computed(() => props.preview?.category ?? null)

const chatDetail = computed<InboxChatThread | null>(() =>
  detailType.value === 'chats' ? (displayedDetail.value as InboxChatThread) : null,
)
const applicationDetail = computed<InboxApplicationDetail | null>(() =>
  detailType.value === 'applications' ? (displayedDetail.value as InboxApplicationDetail) : null,
)
const activityDetail = computed<InboxActivityDetail | null>(() =>
  detailType.value === 'activity' ? (displayedDetail.value as InboxActivityDetail) : null,
)
const systemDetail = computed<InboxSystemDetail | null>(() =>
  detailType.value === 'system' ? (displayedDetail.value as InboxSystemDetail) : null,
)
</script>

<template>
  <div class="page-flip-container" :class="frequencyStore.isFocus ? 'container-focus' : 'container-vibe'">
    <!-- 空状态 -->
    <div v-if="!preview" class="empty-state">
      <div class="empty-book">
        <div class="book-cover">
          <Mail :size="32" class="text-slate/30" />
        </div>
        <div class="book-pages">
          <div v-for="i in 3" :key="i" class="page-line" />
        </div>
      </div>
      <p>选择一封信件查看详情</p>
      <span class="empty-hint">点击左侧信封卡片</span>
    </div>
    
    <!-- 渐变过渡书本容器 -->
    <div v-else class="book-container">
      <!-- 书脊装饰 -->
      <div class="book-spine">
        <div class="spine-texture" />
        <div class="spine-highlight" />
      </div>
      
      <!-- 页面边缘装饰（模拟多页效果） -->
      <div class="page-edges">
        <div v-for="i in 5" :key="i" class="edge-line" :style="{ '--index': i }" />
      </div>
      
      <!-- 渐变过渡动画层 -->
      <div class="page-wrapper">
        <!-- 当前页面 -->
        <Transition name="fade-slide" mode="out-in">
          <div :key="transitionKey" class="page page-current">
            <div class="page-inner">
              <!-- 页面纹理 -->
              <div class="page-texture" />
              <!-- 页面内容 -->
              <div class="page-content">
                <InboxChatRoom v-if="chatDetail" :thread="chatDetail" />
                <InboxApplicationDetailCard v-else-if="applicationDetail" :detail="applicationDetail" />
                <InboxActivityDetailCard v-else-if="activityDetail" :detail="activityDetail" />
                <InboxSystemDetailCard v-else-if="systemDetail" :detail="systemDetail" />
              </div>
            </div>
          </div>
        </Transition>
      </div>
      
      <!-- 书签装饰 -->
      <div class="bookmark" :class="frequencyStore.isFocus ? 'bookmark-focus' : 'bookmark-vibe'">
        <div class="bookmark-ribbon" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-flip-container {
  @apply relative h-full overflow-hidden rounded-2xl;
  perspective: 2500px;
}

.container-focus {
  @apply bg-gradient-to-br from-focus-bg via-white to-focus-bg/50;
}

.container-vibe {
  @apply bg-gradient-to-br from-vibe-bg via-white to-vibe-bg/50;
}

/* 空状态 */
.empty-state {
  @apply h-full flex flex-col items-center justify-center gap-4;
}

.empty-book {
  @apply relative w-24 h-28 mb-2;
}

.book-cover {
  @apply absolute inset-0 rounded-r-lg rounded-l-sm flex items-center justify-center;
  background: linear-gradient(145deg, #F5F3EF 0%, #E8E6E2 100%);
  box-shadow: 
    2px 4px 12px rgba(0, 0, 0, 0.1),
    inset -2px 0 4px rgba(0, 0, 0, 0.05);
}

.book-pages {
  @apply absolute left-0 top-2 bottom-2 w-2 flex flex-col justify-center gap-1;
}

.page-line {
  @apply h-px bg-slate/20;
}

.empty-state p {
  @apply font-sans text-base text-charcoal;
}

.empty-hint {
  @apply font-mono text-xs text-slate/50;
}

/* 书本容器 */
.book-container {
  @apply relative h-full;
  transform-style: preserve-3d;
}

/* 书脊 */
.book-spine {
  @apply absolute left-0 top-4 bottom-4 w-4;
  background: linear-gradient(90deg, 
    rgba(0,0,0,0.12) 0%, 
    rgba(0,0,0,0.06) 30%,
    rgba(0,0,0,0.02) 60%,
    transparent 100%
  );
  border-radius: 4px 0 0 4px;
}

.spine-texture {
  @apply absolute inset-0;
  background: repeating-linear-gradient(
    180deg,
    transparent 0px,
    transparent 8px,
    rgba(0,0,0,0.02) 8px,
    rgba(0,0,0,0.02) 9px
  );
}

.spine-highlight {
  @apply absolute left-1 top-0 bottom-0 w-px;
  background: linear-gradient(180deg, 
    transparent 0%, 
    rgba(255,255,255,0.3) 20%,
    rgba(255,255,255,0.3) 80%,
    transparent 100%
  );
}

/* 页面边缘装饰 */
.page-edges {
  @apply absolute right-0 top-4 bottom-4 w-3 pointer-events-none;
}

.edge-line {
  @apply absolute right-0 top-0 bottom-0 rounded-r;
  width: calc(12px - var(--index) * 2px);
  transform: translateX(calc(var(--index) * 1.5px));
  background: linear-gradient(90deg, #FDFCF8 0%, #F5F3EF 100%);
  opacity: calc(1 - var(--index) * 0.12);
  box-shadow: 1px 0 2px rgba(0,0,0,0.03);
}

/* 页面包装器 */
.page-wrapper {
  @apply relative h-full ml-4 mr-3;
}

/* 页面基础样式 */
.page {
  @apply absolute inset-0 rounded-r-xl overflow-hidden;
}

.page-current {
  @apply bg-white;
  box-shadow: 
    2px 0 12px rgba(0,0,0,0.06),
    inset -1px 0 0 rgba(0,0,0,0.02);
}

.page-inner {
  @apply relative h-full;
}

.page-texture {
  @apply absolute inset-0 pointer-events-none opacity-40;
  background-image: 
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 27px,
      rgba(0,0,0,0.015) 27px,
      rgba(0,0,0,0.015) 28px
    );
}

.page-content {
  @apply h-full overflow-hidden relative z-10;
}

/* 渐变过渡动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 书签装饰 */
.bookmark {
  @apply absolute top-0 right-8 w-6 h-16 z-20;
}

.bookmark-ribbon {
  @apply w-full h-full;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.bookmark-focus .bookmark-ribbon {
  background: linear-gradient(180deg, #93A8AC 0%, #7A9A9E 100%);
}

.bookmark-vibe .bookmark-ribbon {
  background: linear-gradient(180deg, #D9A69F 0%, #C4887E 100%);
}
</style>
