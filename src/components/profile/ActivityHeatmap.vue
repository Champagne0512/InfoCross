<script setup lang="ts">
import { computed } from 'vue'

// 生成一年的活动数据
const generateActivityData = () => {
  const data = []
  const today = new Date()
  const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
  
  for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
    const random = Math.random()
    let activity = 0
    let type = ''
    
    if (random > 0.7) {
      activity = Math.floor(Math.random() * 3) + 1
      const types = ['research', 'life', 'academic']
      type = types[Math.floor(Math.random() * types.length)]
    }
    
    data.push({
      date: new Date(d).toISOString().split('T')[0],
      activity,
      type
    })
  }
  
  return data
}

const activityData = generateActivityData()

const getActivityColor = (activity: number, type: string) => {
  if (activity === 0) return 'bg-slate/10'
  
  const opacity = activity * 0.3
  switch (type) {
    case 'research':
      return `bg-[#93A8AC]`
    case 'life':
      return `bg-[#D9A69F]`
    default:
      return `bg-[#A6B9A8]`
  }
}

const getTooltipText = (date: string, activity: number, type: string) => {
  if (activity === 0) return `${date}: 暂无活动`
  
  const activities = {
    research: ['参加了AI研讨会', '完成科研论文', '参与实验项目'],
    life: ['参加社团活动', '组织聚会', '参加志愿者活动'],
    academic: ['参加学术讲座', '完成课程作业', '参加学术竞赛']
  }
  
  const typeLabel = {
    research: '科研',
    life: '生活',
    academic: '学术'
  }
  
  const activityList = activities[type as keyof typeof activities] || []
  const activityText = activityList[Math.floor(Math.random() * activityList.length)]
  
  return `${date}: ${activityText}`
}

const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
const weekDays = ['', '一', '', '三', '', '五', '']
</script>

<template>
  <div class="bg-white rounded-morandi p-8 shadow-morandi">
    <header class="mb-8">
      <p class="font-mono text-mono text-slate mb-2">EXPLORER FOOTPRINT</p>
      <h3 class="text-h2 font-sans font-semibold text-charcoal">破壁足迹</h3>
    </header>
    
    <!-- 图例 -->
    <div class="flex items-center gap-6 mb-8">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded bg-[#93A8AC]"></div>
        <span class="font-mono text-mono text-xs text-slate">科研</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded bg-[#A6B9A8]"></div>
        <span class="font-mono text-mono text-xs text-slate">学术</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded bg-[#D9A69F]"></div>
        <span class="font-mono text-mono text-xs text-slate">生活</span>
      </div>
    </div>
    
    <!-- 热力图 -->
    <div class="overflow-x-auto">
      <div class="min-w-max">
        <!-- 月份标签 -->
        <div class="flex mb-2">
          <div class="w-8"></div>
          <div class="grid grid-cols-12 gap-1 flex-1">
            <div v-for="(month, i) in months" :key="month" class="text-center">
              <span class="font-mono text-mono text-xs text-slate">{{ month }}</span>
            </div>
          </div>
        </div>
        
        <!-- 热力图网格 -->
        <div class="flex">
          <!-- 星期标签 -->
          <div class="w-8 space-y-1">
            <div v-for="(day, i) in weekDays" :key="i" class="h-3 flex items-center">
              <span v-if="day" class="font-mono text-mono text-xs text-slate">{{ day }}</span>
            </div>
          </div>
          
          <!-- 格子 -->
          <div class="grid grid-cols-53 gap-1 flex-1">
            <div
              v-for="(day, index) in activityData"
              :key="day.date"
              class="w-3 h-3 rounded-sm cursor-pointer transition-all hover:scale-110"
              :class="getActivityColor(day.activity, day.type)"
              :title="getTooltipText(day.date, day.activity, day.type)"
            ></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 统计 -->
    <div class="mt-8 grid grid-cols-3 gap-6 pt-6 border-t border-slate/10">
      <div class="text-center">
        <div class="text-2xl font-sans font-bold text-charcoal">{{ activityData.filter(d => d.activity > 0).length }}</div>
        <div class="font-mono text-mono text-xs text-slate">活跃天数</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-sans font-bold text-charcoal">{{ new Set(activityData.filter(d => d.activity > 0).map(d => d.type)).size }}</div>
        <div class="font-mono text-mono text-xs text-slate">跨学科领域</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-sans font-bold text-charcoal">{{ Math.max(...activityData.map(d => d.activity)) }}</div>
        <div class="font-mono text-mono text-xs text-slate">最高活跃度</div>
      </div>
    </div>
  </div>
</template>