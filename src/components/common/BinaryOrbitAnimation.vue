<script setup lang="ts">
/**
 * 双天体轨道动画组件
 * 两个天体围绕共同质心做匀速圆周运动
 * 遵循质心关系：m₁·r₁ = m₂·r₂
 */
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useFrequencyStore } from '@/stores/frequencyStore'

const frequencyStore = useFrequencyStore()

// 动画容器尺寸（匹配按钮宽度128px，高度容纳完整轨道+间距）
const WIDTH = 128
const HEIGHT = 160
const CENTER_X = WIDTH / 2
const CENTER_Y = HEIGHT / 2

// 天体配置（质量决定大小，质量与轨道半径成反比）
const FOCUS_MASS = 1.5  // Focus模式下F球质量大
const VIBE_MASS = 1     // Focus模式下V球质量小
const TOTAL_ORBIT = 107 // 两球轨道半径之和，使大轨道直径=128px

// 计算目标轨道半径：m₁·r₁ = m₂·r₂，且 r₁ + r₂ = TOTAL_ORBIT
const getTargetValues = (isFocus: boolean) => {
  const m1 = isFocus ? FOCUS_MASS : VIBE_MASS  // F球质量
  const m2 = isFocus ? VIBE_MASS : FOCUS_MASS  // V球质量
  const r1 = TOTAL_ORBIT * m2 / (m1 + m2)
  const r2 = TOTAL_ORBIT - r1
  const baseSize = 20  // 等比例放大天体（原8 * 2.5倍）
  return {
    r1, r2,
    s1: baseSize * m1,  // F球大小
    s2: baseSize * m2   // V球大小
  }
}

// 动画状态（使用插值实现平滑过渡）
const angle = ref(0)
const currentR1 = ref(0)
const currentR2 = ref(0)
const currentS1 = ref(0)
const currentS2 = ref(0)
const animationId = ref<number | null>(null)

// 初始化当前值
const initValues = getTargetValues(frequencyStore.isFocus)
currentR1.value = initValues.r1
currentR2.value = initValues.r2
currentS1.value = initValues.s1
currentS2.value = initValues.s2

// 目标值（响应模式变化）
const targetValues = computed(() => getTargetValues(frequencyStore.isFocus))

// 固定颜色配置（不随模式变化）
const bodyColor = '#374151'
const textColor = '#ede9e3'

// 线性插值函数
const lerp = (current: number, target: number, factor: number) => {
  return current + (target - current) * factor
}

// 动画循环
const animate = () => {
  // 更新角度（匀速圆周运动，减慢速度）
  angle.value += 0.012
  
  // 平滑插值过渡轨道半径和大小
  const lerpFactor = 0.05
  currentR1.value = lerp(currentR1.value, targetValues.value.r1, lerpFactor)
  currentR2.value = lerp(currentR2.value, targetValues.value.r2, lerpFactor)
  currentS1.value = lerp(currentS1.value, targetValues.value.s1, lerpFactor)
  currentS2.value = lerp(currentS2.value, targetValues.value.s2, lerpFactor)
  
  animationId.value = requestAnimationFrame(animate)
}

onMounted(() => {
  animate()
})

onUnmounted(() => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
  }
})

// 天体位置计算（相位差180°，关于质心对称）
const body1X = computed(() => CENTER_X + currentR1.value * Math.cos(angle.value) - currentS1.value / 2)
const body1Y = computed(() => CENTER_Y + currentR1.value * Math.sin(angle.value) - currentS1.value / 2)
const body2X = computed(() => CENTER_X + currentR2.value * Math.cos(angle.value + Math.PI) - currentS2.value / 2)
const body2Y = computed(() => CENTER_Y + currentR2.value * Math.sin(angle.value + Math.PI) - currentS2.value / 2)
</script>

<template>
  <div class="binary-orbit-container">
    <!-- 轨道（F球轨道） -->
    <div 
      class="orbit"
      :style="{
        width: `${currentR1 * 2}px`,
        height: `${currentR1 * 2}px`,
        borderColor: bodyColor
      }"
    />
    <!-- 轨道（V球轨道） -->
    <div 
      class="orbit"
      :style="{
        width: `${currentR2 * 2}px`,
        height: `${currentR2 * 2}px`,
        borderColor: bodyColor
      }"
    />
    
    <!-- 质心标记 -->
    <div class="barycenter" :style="{ backgroundColor: bodyColor }" />
    
    <!-- F天体 -->
    <div 
      class="body"
      :style="{
        width: `${currentS1}px`,
        height: `${currentS1}px`,
        backgroundColor: bodyColor,
        color: textColor,
        fontSize: `${currentS1 * 0.5}px`,
        transform: `translate(${body1X}px, ${body1Y}px)`
      }"
    >F</div>
    
    <!-- V天体 -->
    <div 
      class="body"
      :style="{
        width: `${currentS2}px`,
        height: `${currentS2}px`,
        backgroundColor: bodyColor,
        color: textColor,
        fontSize: `${currentS2 * 0.5}px`,
        transform: `translate(${body2X}px, ${body2Y}px)`
      }"
    >V</div>
  </div>
</template>

<style scoped>
.binary-orbit-container {
  width: 128px;
  height: 160px;
  position: relative;
  margin: 0 auto;
}

.orbit {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 1px solid;
  border-radius: 50%;
  opacity: 0.3;
}

.barycenter {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 3px;
  height: 3px;
  border-radius: 50%;
  opacity: 0.6;
}

.body {
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Manrope', sans-serif;
  font-weight: 600;
}
</style>
