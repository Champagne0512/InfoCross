<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'toggle', isOpen: boolean): void
}>()

const isActive = ref(false)

function toggle() {
  isActive.value = !isActive.value
  emit('toggle', isActive.value)
}
</script>

<template>
  <Teleport to="body">
    <button 
      :class="['bh-btn', { 'bh-active': isActive }]" 
      @click="toggle"
    >
      <!-- 默认状态 -->
      <div class="bh-state bh-default">
        <svg viewBox="0 0 100 100">
          <circle class="bh-ring" cx="50" cy="50" r="15"/>
          <circle class="bh-p bh-p1" cx="82" cy="50" r="3"/>
          <circle class="bh-p bh-p2" cx="72" cy="72" r="3"/>
          <circle class="bh-p bh-p3" cx="50" cy="82" r="3"/>
          <circle class="bh-p bh-p4" cx="28" cy="72" r="3"/>
          <circle class="bh-p bh-p5" cx="18" cy="50" r="3"/>
          <circle class="bh-p bh-p6" cx="28" cy="28" r="3"/>
          <circle class="bh-p bh-p7" cx="50" cy="18" r="3"/>
          <circle class="bh-p bh-p8" cx="72" cy="28" r="3"/>
        </svg>
      </div>
      <!-- 激活状态 -->
      <div class="bh-state bh-activated">
        <svg viewBox="0 0 100 100">
          <defs>
            <linearGradient id="bhGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#FFD700"/>
              <stop offset="50%" stop-color="#FF6B35"/>
              <stop offset="100%" stop-color="#FFD700"/>
            </linearGradient>
          </defs>
          <circle class="bh-glow" cx="50" cy="50" r="42"/>
          <ellipse class="bh-disk1" cx="50" cy="50" rx="32" ry="10"/>
          <ellipse class="bh-disk2" cx="50" cy="50" rx="22" ry="7"/>
          <circle class="bh-center" cx="50" cy="50" r="12"/>
          <circle class="bh-horizon" cx="50" cy="50" r="13"/>
        </svg>
      </div>
    </button>
  </Teleport>
</template>

<style>
.bh-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #0a0a0a;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 99999;
  box-shadow: 0 4px 30px rgba(0,0,0,0.6), 0 0 40px rgba(0,0,0,0.3);
  transition: transform 0.3s ease;
}
.bh-btn:hover { transform: scale(1.1); }

.bh-state {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.5s, transform 0.5s;
}
.bh-state svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* 默认状态显示/隐藏 */
.bh-default { opacity: 1; transform: scale(1); }
.bh-activated { opacity: 0; transform: scale(0.6) rotate(180deg); }
.bh-active .bh-default { opacity: 0; transform: scale(0.6) rotate(-180deg); }
.bh-active .bh-activated { opacity: 1; transform: scale(1) rotate(0deg); }

/* 中心圆环 */
.bh-ring {
  fill: none;
  stroke: white;
  stroke-width: 2;
  animation: bhRingPulse 2s ease-in-out infinite;
}
@keyframes bhRingPulse {
  0%, 100% { stroke-opacity: 0.5; stroke-width: 1.5; }
  50% { stroke-opacity: 1; stroke-width: 2.5; }
}

/* 粒子 */
.bh-p {
  fill: white;
  opacity: 0;
  animation: bhSuck 2.5s ease-in infinite;
}
.bh-p1 { animation-delay: 0s; }
.bh-p2 { animation-delay: 0.31s; }
.bh-p3 { animation-delay: 0.62s; }
.bh-p4 { animation-delay: 0.93s; }
.bh-p5 { animation-delay: 1.24s; }
.bh-p6 { animation-delay: 1.55s; }
.bh-p7 { animation-delay: 1.86s; }
.bh-p8 { animation-delay: 2.17s; }

@keyframes bhSuck {
  0% { opacity: 0; transform: scale(1); }
  15% { opacity: 1; }
  85% { opacity: 0.6; }
  100% { opacity: 0; transform: scale(0); }
}

/* 外层光晕 */
.bh-glow {
  fill: none;
  stroke: #ff9500;
  stroke-width: 2;
  opacity: 0.4;
  animation: bhGlowPulse 2s ease-in-out infinite;
}
@keyframes bhGlowPulse {
  0%, 100% { opacity: 0.2; stroke-width: 1; }
  50% { opacity: 0.6; stroke-width: 3; }
}

/* 吸积盘 */
.bh-disk1 {
  fill: none;
  stroke: url(#bhGrad);
  stroke-width: 6;
  transform-origin: center;
  animation: bhSpinCW 3s linear infinite;
}
.bh-disk2 {
  fill: none;
  stroke: url(#bhGrad);
  stroke-width: 3;
  opacity: 0.8;
  transform-origin: center;
  animation: bhSpinCCW 2s linear infinite;
}
@keyframes bhSpinCW {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes bhSpinCCW {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

/* 中心黑洞 */
.bh-center { fill: #000; }

/* 事件视界 */
.bh-horizon {
  fill: none;
  stroke: #ff6b35;
  stroke-width: 2;
  animation: bhHorizon 1.5s ease-in-out infinite;
}
@keyframes bhHorizon {
  0%, 100% { stroke-opacity: 0.3; }
  50% { stroke-opacity: 1; }
}
</style>
