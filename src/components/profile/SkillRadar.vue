<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AiIcon from '@/components/common/AiIcon.vue'

const chartRef = ref<HTMLDivElement>()

const skills = [
  { name: '学术', value: 85, color: '#93A8AC' },
  { name: '执行力', value: 92, color: '#A6B9A8' },
  { name: '领导力', value: 78, color: '#B4A8BF' },
  { name: '沟通', value: 88, color: '#D9A69F' },
  { name: '技术', value: 95, color: '#93A8AC' },
  { name: '创新', value: 82, color: '#A6B9A8' },
]

const aiComment = "该用户是典型的全栈型人才，技术能力突出，执行力强，适合担任技术负责人或项目队长。建议在沟通和创新方面继续提升。"

onMounted(() => {
  // 简化的雷达图实现
  if (chartRef.value) {
    // 这里可以集成 ECharts 或 Chart.js
    // 目前使用 CSS 实现简化版本
  }
})
</script>

<template>
  <div class="morandi-card-mist h-full">
    <header class="mb-8">
      <p class="font-mono text-mono text-slate mb-2">SKILL RADAR</p>
      <h3 class="text-h2 font-sans font-semibold text-charcoal">能力雷达图</h3>
    </header>
    
    <div class="grid lg:grid-cols-2 gap-8">
      <!-- 雷达图 -->
      <div class="flex items-center justify-center">
        <div class="relative w-64 h-64">
          <!-- 背景网格 -->
          <svg class="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
            <!-- 同心圆 -->
            <circle cx="100" cy="100" r="30" fill="none" stroke="#f2f4f6" stroke-width="1"/>
            <circle cx="100" cy="100" r="60" fill="none" stroke="#f2f4f6" stroke-width="1"/>
            <circle cx="100" cy="100" r="90" fill="none" stroke="#f2f4f6" stroke-width="1"/>
            <!-- 轴线 -->
            <line x1="100" y1="10" x2="100" y2="190" stroke="#f2f4f6" stroke-width="1"/>
            <line x1="10" y1="100" x2="190" y2="100" stroke="#f2f4f6" stroke-width="1"/>
            <line x1="50" y1="22" x2="150" y2="178" stroke="#f2f4f6" stroke-width="1"/>
            <line x1="50" y1="178" x2="150" y2="22" stroke="#f2f4f6" stroke-width="1"/>
          </svg>
          
          <!-- 数据区域 -->
          <svg class="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
            <polygon
              :points="skills.map((s, i) => {
                const angle = (i * 60 - 90) * Math.PI / 180
                const r = s.value * 0.9
                const x = 100 + r * Math.cos(angle)
                const y = 100 + r * Math.sin(angle)
                return `${x},${y}`
              }).join(' ')"
              fill="#A6B9A8"
              fill-opacity="0.3"
              stroke="#A6B9A8"
              stroke-width="2"
            />
          </svg>
          
          <!-- 数据点 -->
          <svg class="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
            <circle
              v-for="(skill, i) in skills"
              :key="skill.name"
              :cx="100 + skill.value * 0.9 * Math.cos((i * 60 - 90) * Math.PI / 180)"
              :cy="100 + skill.value * 0.9 * Math.sin((i * 60 - 90) * Math.PI / 180)"
              r="4"
              :fill="skill.color"
            />
          </svg>
          
          <!-- 标签 -->
          <div class="absolute inset-0">
            <div
              v-for="(skill, i) in skills"
              :key="skill.name"
              class="absolute font-mono text-mono text-xs text-charcoal"
              :style="{
                left: `${50 + 50 * Math.cos((i * 60 - 90) * Math.PI / 180)}%`,
                top: `${50 + 50 * Math.sin((i * 60 - 90) * Math.PI / 180)}%`,
                transform: 'translate(-50%, -50%)'
              }"
            >
              {{ skill.name }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- AI 短评 -->
      <div class="flex items-center">
        <div>
          <div class="flex items-center gap-2 mb-4">
            <AiIcon size="sm" color="#B4A8BF" />
            <span class="font-mono text-mono text-morandi-lavender text-sm">AI 分析</span>
          </div>
          <p class="text-body font-sans text-slate leading-relaxed">
            {{ aiComment }}
          </p>
          <div class="mt-6 grid grid-cols-2 gap-4">
            <div v-for="skill in skills.slice(0, 4)" :key="skill.name" class="text-center">
              <div class="text-2xl font-sans font-bold text-charcoal">{{ skill.value }}</div>
              <div class="font-mono text-mono text-xs text-slate">{{ skill.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>