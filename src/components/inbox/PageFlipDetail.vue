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

// 翻页动画状态
const isFlipping = ref(false)
const flipPhase = ref<'idle' | 'lifting' | 'turning' | 'settling'>('idle')
const currentContent = ref<DetailType>(null)
const previousContent = ref<DetailType>(null)

// 监听 detail 变化触发翻页动画
watch(() => props.detail, (newDetail, oldDetail) => {
  if (newDetail !== oldDetail && newDetail !== null) {
    previousContent.value = currentContent.value
    triggerFlip(() => {
      currentContent.value = newDetail
    })
  } else if (newDetail === null) {
    currentContent.value = null
  }
}, { immediate: true })

function triggerFlip(onMidpoint: () => void) {
  if (isFlipping.value) return
  isFlipping.value = true
  flipPhase.value = 'lifting'
  
  // 阶段1: 页面抬起 (200ms)
  setTimeout(() => {
    flipPhase.value = 'turning'
  }, 200)
  
  // 阶段2: 翻转中点，切换内容 (500ms)
  setTimeout(() => {
    onMidpoint()
    flipPhase.value = 'settling'
  }, 500)
  
  // 阶段3: 落下完成 (800ms)
  setTimeout(() => {
    isFlipping.value = false
    flipPhase.value = 'idle'
  }, 900)
}

const detailType = computed(() => props.preview?.category ?? null)

const chatDetail = computed<InboxChatThread | null>(() =>
  detailType.value === 'chats' ? (currentContent.value as InboxChatThread) : null,
)
const applicationDetail = computed<InboxApplicationDetail | null>(() =>
  detailType.value === 'applications' ? (currentContent.value as InboxApplicationDetail) : null,
)
const activityDetail = computed<InboxActivityDetail | null>(() =>
  detailType.value === 'activity' ? (currentContent.value as InboxActivityDetail) : null,
)
const systemDetail = computed<InboxSystemDetail | null>(() =>
  detailType.value === 'system' ? (currentContent.value as InboxSystemDetail) : null,
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
    
    <!-- 翻页书本容器 -->
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
      
      <!-- 翻页动画层 -->
      <div class="page-wrapper" :class="[
        isFlipping && 'is-flipping',
        `phase-${flipPhase}`
      ]">
        <!-- 当前页面（底层） -->
        <div class="page page-current">
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
        
        <!-- 翻页效果层 -->
        <div v-if="isFlipping" class="page page-flip">
          <div class="flip-page-front">
            <div class="flip-texture" />
            <div class="flip-shadow" />
          </div>
          <div class="flip-page-back">
            <div class="flip-texture" />
            <div class="flip-content-preview" />
          </div>
        </div>
        
        <!-- 翻页阴影 -->
        <div v-if="isFlipping" class="flip-shadow-overlay" />
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
  transform-style: preserve-3d;
}

/* 页面基础样式 */
.page {
  @apply absolute inset-0 rounded-r-xl overflow-hidden;
  backface-visibility: hidden;
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

/* 翻页动画层 */
.page-flip {
  @apply pointer-events-none;
  transform-origin: left center;
  transform-style: preserve-3d;
}

.phase-lifting .page-flip {
  animation: pageLift 0.3s ease-out forwards;
}

.phase-turning .page-flip {
  animation: pageTurn 0.3s ease-in-out forwards;
  animation-delay: 0s;
}

.phase-settling .page-flip {
  animation: pageSettle 0.4s ease-out forwards;
}

@keyframes pageLift {
  0% {
    transform: rotateY(0deg) translateZ(0);
    box-shadow: -2px 0 10px rgba(0,0,0,0.05);
  }
  100% {
    transform: rotateY(-15deg) translateZ(20px);
    box-shadow: -8px 0 25px rgba(0,0,0,0.12);
  }
}

@keyframes pageTurn {
  0% {
    transform: rotateY(-15deg) translateZ(20px);
    box-shadow: -8px 0 25px rgba(0,0,0,0.12);
  }
  100% {
    transform: rotateY(-165deg) translateZ(20px);
    box-shadow: 8px 0 25px rgba(0,0,0,0.12);
  }
}

@keyframes pageSettle {
  0% {
    transform: rotateY(-165deg) translateZ(20px);
    box-shadow: 8px 0 25px rgba(0,0,0,0.12);
  }
  100% {
    transform: rotateY(-180deg) translateZ(0);
    box-shadow: 2px 0 10px rgba(0,0,0,0.05);
  }
}

.flip-page-front,
.flip-page-back {
  @apply absolute inset-0 rounded-r-xl;
  backface-visibility: hidden;
}

.flip-page-front {
  background: linear-gradient(90deg, #FDFCF8 0%, #FFFFFF 100%);
  box-shadow: 
    inset -20px 0 40px rgba(0,0,0,0.03),
    inset 0 0 60px rgba(0,0,0,0.01);
}

.flip-page-back {
  background: linear-gradient(270deg, #F8F6F3 0%, #FDFCF8 100%);
  transform: rotateY(180deg);
  box-shadow: 
    inset 20px 0 40px rgba(0,0,0,0.04),
    inset 0 0 60px rgba(0,0,0,0.02);
}

.flip-texture {
  @apply absolute inset-0 opacity-30;
  background-image: 
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 27px,
      rgba(0,0,0,0.02) 27px,
      rgba(0,0,0,0.02) 28px
    );
}

.flip-shadow {
  @apply absolute inset-y-0 right-0 w-16;
  background: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.08) 100%);
}

.flip-content-preview {
  @apply absolute inset-4;
  background: repeating-linear-gradient(
    0deg,
    rgba(0,0,0,0.03) 0px,
    rgba(0,0,0,0.03) 8px,
    transparent 8px,
    transparent 20px
  );
  border-radius: 4px;
}

/* 翻页阴影覆盖层 */
.flip-shadow-overlay {
  @apply absolute inset-0 pointer-events-none rounded-r-xl;
  background: linear-gradient(90deg, 
    rgba(0,0,0,0.08) 0%, 
    transparent 30%,
    transparent 70%,
    rgba(0,0,0,0.04) 100%
  );
  animation: shadowMove 0.9s ease-in-out;
}

@keyframes shadowMove {
  0% { opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
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

/* 翻页时的页面抖动效果 */
.is-flipping .page-current {
  animation: pageShake 0.9s ease-in-out;
}

@keyframes pageShake {
  0%, 100% { transform: translateX(0); }
  10% { transform: translateX(-2px); }
  30% { transform: translateX(1px); }
  50% { transform: translateX(-1px); }
  70% { transform: translateX(0.5px); }
}
</style>
