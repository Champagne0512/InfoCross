<script setup lang="ts">
import { computed } from 'vue'
import { Heart, FileText, Bell, Mail } from 'lucide-vue-next'
import { useFrequencyStore } from '@/stores/frequencyStore'
import type { InboxPreview } from '@/types/models'

const props = defineProps<{
  item: InboxPreview
  active?: boolean
  rotation: number
  zIndex: number
  translateX: number
  translateY: number
}>()

const emit = defineEmits<{
  select: [InboxPreview]
}>()

const frequencyStore = useFrequencyStore()

const iconComponent = computed(() => {
  if (props.item.category === 'activity') return Heart
  if (props.item.category === 'applications') return FileText
  if (props.item.category === 'system') return Bell
  return Mail
})

const iconClass = computed(() => {
  if (props.item.category === 'activity') return 'icon-heart'
  if (props.item.category === 'applications') return 'icon-file'
  if (props.item.category === 'system') return 'icon-bell'
  return 'icon-mail'
})

const timestamp = computed(() => {
  const diff = Date.now() - new Date(props.item.timestamp).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  return `${days}天前`
})

// 旋转轴心在卡片下方 400px 处
const cardStyle = computed(() => ({
  transform: `translateX(${props.translateX}px) translateY(${props.translateY}px) rotate(${props.rotation}deg)`,
  zIndex: props.zIndex,
}))

function handleClick() {
  emit('select', props.item)
}
</script>

<template>
  <button
    class="envelope-card"
    :class="[
      active 
        ? (frequencyStore.isFocus ? 'envelope-active-focus' : 'envelope-active-vibe')
        : 'envelope-inactive',
      item.unread && 'envelope-unread'
    ]"
    :style="cardStyle"
    @click="handleClick"
  >
    <!-- 信封主体 -->
    <div class="envelope-body">
      <!-- 信封封口三角形 - 仅选中时显示 -->
      <div v-if="active" class="envelope-flap flap-open">
        <div class="flap-inner" />
      </div>
      
      <!-- 信封内容区 -->
      <div class="envelope-content">
        <!-- 图标 -->
        <div class="envelope-icon" :class="iconClass">
          <component :is="iconComponent" :size="18" />
        </div>
        
        <!-- 信息 -->
        <div class="envelope-info">
          <div class="info-header">
            <p class="envelope-title">{{ item.title }}</p>
            <span v-if="item.unread" class="unread-badge" :class="frequencyStore.isFocus ? 'badge-focus' : 'badge-vibe'" />
          </div>
          <p class="envelope-preview">{{ item.preview }}</p>
          <p class="envelope-time">{{ timestamp }}</p>
        </div>
      </div>
      
      <!-- 信封纹理装饰 -->
      <div class="envelope-texture" />
      
      <!-- 蜡封装饰 -->
      <div v-if="item.unread" class="wax-seal" :class="[
        item.category === 'chats' && 'seal-blue',
        item.category === 'applications' && 'seal-lavender',
        item.category === 'activity' && 'seal-clay',
        item.category === 'system' && 'seal-green',
      ]">
        <span class="seal-icon">✉</span>
      </div>
    </div>
    
    <!-- 信封底部装饰线 -->
    <div class="envelope-stripe" :class="[
      item.category === 'chats' && 'stripe-blue',
      item.category === 'applications' && 'stripe-lavender',
      item.category === 'activity' && 'stripe-clay',
      item.category === 'system' && 'stripe-green',
    ]" />
  </button>
</template>

<style scoped>
.envelope-card {
  @apply absolute w-96 cursor-pointer;
  /* 旋转轴心在卡片左侧外部 250px 处 */
  transform-origin: -250px center;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
}

.envelope-card:hover {
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.18));
  z-index: 100 !important;
}

.envelope-body {
  @apply relative rounded-xl overflow-hidden;
  background: linear-gradient(145deg, #FDFCF8 0%, #F5F3EF 100%);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.08), 
    0 1px 3px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.envelope-inactive .envelope-body {
  background: linear-gradient(145deg, #FFFFFF 0%, #F8F7F5 100%);
}

.envelope-active-focus .envelope-body {
  @apply ring-2 ring-focus-accent/50;
  box-shadow: 
    0 8px 30px rgba(122, 154, 158, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.envelope-active-vibe .envelope-body {
  @apply ring-2 ring-vibe-accent/50;
  box-shadow: 
    0 8px 30px rgba(196, 136, 126, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

/* 信封封口 */
.envelope-flap {
  @apply absolute top-0 left-0 right-0 h-12;
  background: linear-gradient(180deg, #E8E4DF 0%, #DDD9D4 100%);
  clip-path: polygon(0 0, 50% 100%, 100% 0);
  transform-origin: top center;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2;
}

.flap-inner {
  @apply absolute inset-0;
  background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%);
}

.flap-open {
  transform: rotateX(180deg) translateY(-2px);
}

.flap-closed {
  transform: rotateX(0deg);
}

/* 信封纹理 */
.envelope-texture {
  @apply absolute inset-0 pointer-events-none opacity-30;
  background-image: 
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.01) 2px,
      rgba(0,0,0,0.01) 4px
    );
}

/* 蜡封装饰 */
.wax-seal {
  @apply absolute -top-2 right-4 w-7 h-7 rounded-full flex items-center justify-center;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.2),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
  z-index: 10;
}

.seal-blue {
  background: linear-gradient(145deg, #93A8AC 0%, #7A9A9E 100%);
}

.seal-lavender {
  background: linear-gradient(145deg, #B4A8BF 0%, #9A8FA8 100%);
}

.seal-clay {
  background: linear-gradient(145deg, #D9A69F 0%, #C4887E 100%);
}

.seal-green {
  background: linear-gradient(145deg, #A6B9A8 0%, #8FA592 100%);
}

.seal-icon {
  @apply text-white text-xs font-bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* 信封内容 */
.envelope-content {
  @apply flex gap-4 p-6 flex-row-reverse justify-start;
  position: relative;
  z-index: 1;
  min-height: 140px;
}

.envelope-icon {
  @apply w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0;
  backdrop-filter: blur(4px);
}

.icon-mail {
  @apply bg-morandi-blue/20 text-morandi-blue;
}

.icon-heart {
  @apply bg-morandi-clay/20 text-morandi-clay;
}

.icon-file {
  @apply bg-morandi-lavender/20 text-morandi-lavender;
}

.icon-bell {
  @apply bg-morandi-green/20 text-morandi-green;
}

.envelope-info {
  @apply flex-1 min-w-0 text-right;
}

.info-header {
  @apply flex items-center gap-2 flex-row-reverse;
}

.envelope-title {
  @apply font-sans text-lg font-semibold text-charcoal truncate;
}

.unread-badge {
  @apply w-2 h-2 rounded-full flex-shrink-0 animate-pulse;
}

.badge-focus {
  @apply bg-focus-accent;
}

.badge-vibe {
  @apply bg-vibe-accent;
}

.envelope-preview {
  @apply font-sans text-base text-slate/70 truncate mt-2;
}

.envelope-time {
  @apply font-mono text-sm text-slate/50 mt-2;
}

/* 底部装饰条 */
.envelope-stripe {
  @apply h-1;
}

.stripe-blue {
  @apply bg-morandi-blue;
}

.stripe-lavender {
  @apply bg-morandi-lavender;
}

.stripe-clay {
  @apply bg-morandi-clay;
}

.stripe-green {
  @apply bg-morandi-green;
}

/* 未读状态 */
.envelope-unread .envelope-body {
  background: linear-gradient(145deg, #FFFFFF 0%, #FDFCF8 100%);
}

.envelope-unread .envelope-body::before {
  content: '';
  @apply absolute inset-0 pointer-events-none;
  background: linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 50%);
}
</style>
