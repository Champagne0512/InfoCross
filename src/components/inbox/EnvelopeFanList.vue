<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useFrequencyStore } from '@/stores/frequencyStore'
import type { InboxPreview } from '@/types/models'
import EnvelopeCard from './EnvelopeCard.vue'

const props = defineProps<{
  items: InboxPreview[]
  selectedId: string
}>()

const emit = defineEmits<{
  select: [InboxPreview]
}>()

const frequencyStore = useFrequencyStore()
const containerRef = ref<HTMLElement | null>(null)

// 扇形旋转偏移量（通过滚轮/滑动控制）
const fanOffset = ref(0)
const isDragging = ref(false)
const startY = ref(0)
const startOffset = ref(0)

// 扇形配置 - 轴心在卡片左侧，像扇骨从左侧展开
const CARD_ANGLE_SPACING = 18 // 每张卡片的角度间隔

// 计算每张卡片的位置
const cardPositions = computed(() => {
  const count = props.items.length
  if (count === 0) return []
  
  const selectedIndex = props.items.findIndex(item => item.id === props.selectedId)
  
  return props.items.map((item, index) => {
    // 基础角度：以选中卡片为中心展开
    const baseAngle = (index - count / 2 + 0.5) * CARD_ANGLE_SPACING
    // 加上滚动偏移
    const rotation = baseAngle + fanOffset.value
    
    // 计算 z-index：选中的最高，其他按角度排列（中间的在上面）
    const distanceFromSelected = selectedIndex >= 0 ? Math.abs(index - selectedIndex) : index
    const zIndex = item.id === props.selectedId ? 50 : 40 - distanceFromSelected
    
    // 左侧轴心旋转，不需要额外的位移
    const translateX = 0
    const translateY = 0
    
    return {
      item,
      rotation,
      zIndex,
      translateX,
      translateY,
      isActive: item.id === props.selectedId,
    }
  })
})

// 滚轮事件处理
function handleWheel(e: WheelEvent) {
  e.preventDefault()
  const delta = e.deltaY * 0.12
  updateFanOffset(fanOffset.value - delta)
}

// 鼠标/触摸拖拽
function handleMouseDown(e: MouseEvent) {
  isDragging.value = true
  startY.value = e.clientY
  startOffset.value = fanOffset.value
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging.value) return
  const deltaY = e.clientY - startY.value
  updateFanOffset(startOffset.value + deltaY * 0.25)
}

function handleMouseUp() {
  isDragging.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

// 触摸事件
function handleTouchStart(e: TouchEvent) {
  isDragging.value = true
  startY.value = e.touches[0]?.clientY ?? 0
  startOffset.value = fanOffset.value
}

function handleTouchMove(e: TouchEvent) {
  if (!isDragging.value) return
  e.preventDefault()
  const deltaY = (e.touches[0]?.clientY ?? 0) - startY.value
  updateFanOffset(startOffset.value + deltaY * 0.25)
}

function handleTouchEnd() {
  isDragging.value = false
}

// 更新扇形偏移量（硬边界限制，第一条和最后一条到中间时停止）
function updateFanOffset(newOffset: number) {
  const count = props.items.length
  if (count === 0) return
  
  // 计算边界：当第一条或最后一条消息在中间位置时的偏移量
  // 第一条消息（index=0）在中间时：baseAngle = (0 - count/2 + 0.5) * CARD_ANGLE_SPACING，需要 offset 使 rotation = 0
  // 所以 maxOffset = -baseAngle = (count/2 - 0.5) * CARD_ANGLE_SPACING
  const maxOffset = (count / 2 - 0.5) * CARD_ANGLE_SPACING
  const minOffset = -maxOffset
  
  // 硬边界限制
  fanOffset.value = Math.max(minOffset, Math.min(maxOffset, newOffset))
}

// 选中卡片
function handleSelect(item: InboxPreview) {
  emit('select', item)
  // 自动将选中卡片旋转到中心位置
  const index = props.items.findIndex(i => i.id === item.id)
  const targetOffset = -(index - props.items.length / 2 + 0.5) * CARD_ANGLE_SPACING
  animateToOffset(targetOffset)
}

// 平滑动画到目标偏移
function animateToOffset(target: number) {
  const start = fanOffset.value
  const duration = 500
  const startTime = performance.now()
  
  function animate(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    // easeOutBack - 带有轻微回弹效果
    const c1 = 1.70158
    const c3 = c1 + 1
    const eased = 1 + c3 * Math.pow(progress - 1, 3) + c1 * Math.pow(progress - 1, 2)
    fanOffset.value = start + (target - start) * eased
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  
  requestAnimationFrame(animate)
}

onMounted(() => {
  if (containerRef.value) {
    containerRef.value.addEventListener('wheel', handleWheel, { passive: false })
  }
})

onUnmounted(() => {
  if (containerRef.value) {
    containerRef.value.removeEventListener('wheel', handleWheel)
  }
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})
</script>

<template>
  <div 
    ref="containerRef"
    class="fan-container"
    :class="frequencyStore.isFocus ? 'fan-focus' : 'fan-vibe'"
    @mousedown="handleMouseDown"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <!-- 扇形背景装饰 -->
    <div class="fan-backdrop">
      <div class="backdrop-arc" />
      <div class="backdrop-rays">
        <div v-for="i in 7" :key="i" class="ray" :style="{ '--ray-index': i }" />
      </div>
    </div>
    
    <!-- 扇形轴心装饰 -->
    <div class="fan-pivot">
      <div class="pivot-inner" :class="frequencyStore.isFocus ? 'pivot-focus' : 'pivot-vibe'" />
      <div class="pivot-ring" />
    </div>
    
    <!-- 卡片容器 -->
    <div class="cards-wrapper">
      <transition-group name="card-transition">
        <EnvelopeCard
          v-for="pos in cardPositions"
          :key="pos.item.id"
          :item="pos.item"
          :active="pos.isActive"
          :rotation="pos.rotation"
          :z-index="pos.zIndex"
          :translate-x="pos.translateX"
          :translate-y="pos.translateY"
          @select="handleSelect"
        />
      </transition-group>
    </div>
    
    <!-- 滚动提示 -->
    <div class="scroll-hint">
      <div class="hint-arrows">
        <span class="arrow arrow-up">▲</span>
        <div class="hint-track">
          <div 
            class="hint-thumb"
            :class="frequencyStore.isFocus ? 'thumb-focus' : 'thumb-vibe'"
            :style="{ transform: `translateY(${Math.max(-30, Math.min(30, fanOffset * 0.4))}px)` }"
          />
        </div>
        <span class="arrow arrow-down">▼</span>
      </div>
      <p class="hint-text">滑动浏览</p>
    </div>
    
    <!-- 空状态 -->
    <div v-if="items.length === 0" class="empty-state">
      <div class="empty-envelope">
        <div class="empty-flap" />
        <div class="empty-body" />
      </div>
      <p>暂无消息</p>
    </div>
  </div>
</template>

<style scoped>
.fan-container {
  @apply relative w-full h-full overflow-hidden select-none;
  cursor: grab;
  /* 使用 mask 实现四边羽化，内容在边缘逐渐透明 */
  -webkit-mask-image: 
    linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%),
    linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
  -webkit-mask-composite: source-in;
  mask-image: 
    linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%),
    linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
  mask-composite: intersect;
}

.fan-container:active {
  cursor: grabbing;
}

/* 背景装饰 */
.fan-backdrop {
  @apply absolute inset-0 pointer-events-none overflow-hidden;
}

.backdrop-arc {
  @apply absolute top-1/2 -translate-y-1/2 w-[450px] h-[700px] rounded-r-full;
  left: -180px;
  opacity: 0.12;
}

.fan-focus .backdrop-arc {
  background: radial-gradient(ellipse at left, rgba(147, 168, 172, 0.4) 0%, transparent 70%);
}

.fan-vibe .backdrop-arc {
  background: radial-gradient(ellipse at left, rgba(217, 166, 159, 0.4) 0%, transparent 70%);
}

/* 扇形射线装饰 */
.backdrop-rays {
  @apply absolute top-1/2 -translate-y-1/2;
  left: -180px;
  width: 400px;
  height: 500px;
}

.ray {
  @apply absolute left-0 top-1/2 h-px w-full origin-left;
  background: linear-gradient(to right, rgba(107, 114, 128, 0.12) 0%, transparent 70%);
  transform: translateY(-50%) rotate(calc((var(--ray-index) - 4) * 15deg));
}

/* 扇形轴心 */
.fan-pivot {
  @apply absolute top-1/2 -translate-y-1/2;
  left: -180px;
  z-index: 60;
}

.pivot-inner {
  @apply w-4 h-4 rounded-full;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.pivot-focus {
  background: linear-gradient(145deg, #93A8AC, #7A9A9E);
}

.pivot-vibe {
  background: linear-gradient(145deg, #D9A69F, #C4887E);
}

.pivot-ring {
  @apply absolute -inset-1 rounded-full border-2 border-slate/10;
}

/* 卡片容器 */
.cards-wrapper {
  @apply absolute;
  /* 轴心在 left:-180px，卡片 transform-origin 是 -250px，所以卡片起始位置是 -180+250=70px */
  left: 70px;
  top: 50%;
  transform: translateY(-50%);
  width: 300px;
  height: 180px;
}

/* 卡片过渡动画 */
.card-transition-enter-active,
.card-transition-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-transition-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.card-transition-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(-20px);
}

/* 滚动提示 */
.scroll-hint {
  @apply absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2;
}

.hint-arrows {
  @apply flex flex-col items-center gap-1;
}

.arrow {
  @apply text-[10px] text-slate/30 transition-colors;
  animation: arrowPulse 2s ease-in-out infinite;
}

.arrow-up {
  animation-delay: 0s;
}

.arrow-down {
  animation-delay: 1s;
}

@keyframes arrowPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

.hint-track {
  @apply w-1.5 h-20 rounded-full bg-slate/10 relative overflow-hidden;
}

.hint-thumb {
  @apply absolute left-0 right-0 h-8 rounded-full transition-transform duration-200;
  top: calc(50% - 16px);
}

.thumb-focus {
  background: linear-gradient(180deg, rgba(147, 168, 172, 0.5) 0%, rgba(122, 154, 158, 0.3) 100%);
}

.thumb-vibe {
  background: linear-gradient(180deg, rgba(217, 166, 159, 0.5) 0%, rgba(196, 136, 126, 0.3) 100%);
}

.hint-text {
  @apply font-mono text-[10px] text-slate/40 mt-2;
  writing-mode: vertical-rl;
}

/* 空状态 */
.empty-state {
  @apply absolute inset-0 flex flex-col items-center justify-center gap-4;
}

.empty-envelope {
  @apply relative w-20 h-14;
}

.empty-flap {
  @apply absolute top-0 left-0 right-0 h-6;
  background: linear-gradient(180deg, #E8E4DF 0%, #DDD9D4 100%);
  clip-path: polygon(0 0, 50% 100%, 100% 0);
}

.empty-body {
  @apply absolute bottom-0 left-0 right-0 h-10 rounded-b-lg;
  background: linear-gradient(145deg, #F5F3EF 0%, #E8E6E2 100%);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.empty-state p {
  @apply font-sans text-base text-slate/50;
}
</style>
