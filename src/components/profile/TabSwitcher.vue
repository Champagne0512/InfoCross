<script setup lang="ts">
import { ref, computed } from 'vue'
import { FileText, Calendar, Clock, ChevronRight } from 'lucide-vue-next'

const tabs = [
  { id: 'published', label: '我的发布', icon: FileText },
  { id: 'joined', label: '我的参与', icon: Calendar },
  { id: 'history', label: '浏览历史', icon: Clock },
]

const activeTab = ref('published')

// 模拟数据
const publishedItems = [
  { id: 1, title: '计算机学院人工智能讲座', date: '2024-12-20', category: '讲座' },
  { id: 2, title: '创新创业大赛组队招募', date: '2024-12-18', category: '比赛' },
  { id: 3, title: '期末复习资料分享', date: '2024-12-15', category: '学习' },
]

const joinedItems = [
  { id: 1, title: '物理学院量子计算研讨会', date: '2024-12-16', category: '参与' },
  { id: 2, title: '摄影社团外拍活动', date: '2024-12-14', category: '参与' },
]

const historyItems = [
  { id: 1, title: '数学建模竞赛培训', date: '2024-12-19', category: '浏览' },
  { id: 2, title: '英语角口语练习', date: '2024-12-17', category: '浏览' },
  { id: 3, title: '编程马拉松比赛', date: '2024-12-16', category: '浏览' },
  { id: 4, title: '心理学公开课', date: '2024-12-13', category: '浏览' },
]

const currentItems = computed(() => {
  switch (activeTab.value) {
    case 'published':
      return publishedItems
    case 'joined':
      return joinedItems
    case 'history':
      return historyItems
    default:
      return []
  }
})

const emit = defineEmits<{
  navigate: [id: string, itemId: number]
}>()

function handleItemClick(itemId: number) {
  emit('navigate', activeTab.value, itemId)
}
</script>

<template>
  <section class="py-10">
    <div class="max-w-6xl mx-auto px-6">
      <!-- Tab 导航 -->
      <div class="mb-8">
        <div class="flex border-b border-slate/10">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="flex items-center gap-2 px-6 py-4 border-b-2 transition-all font-sans text-sm font-medium"
            :class="activeTab === tab.id
              ? 'border-morandi-lavender text-charcoal'
              : 'border-transparent text-slate hover:text-charcoal hover:border-slate/20'"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="space-y-4">
        <div
          v-for="item in currentItems"
          :key="item.id"
          @click="handleItemClick(item.id)"
          class="group flex items-center justify-between p-6 rounded-soft bg-card-base border border-slate/10 hover:bg-white/70 hover:border-slate/20 transition-all duration-200 cursor-pointer"
        >
          <div class="flex-1">
            <h4 class="font-sans text-body font-medium text-charcoal mb-2 group-hover:text-morandi-lavender transition-colors">
              {{ item.title }}
            </h4>
            <div class="flex items-center gap-4 text-sm text-slate">
              <span class="font-mono text-mono">{{ item.date }}</span>
              <span class="px-2 py-1 rounded-full bg-slate/10 text-xs font-mono text-slate">
                {{ item.category }}
              </span>
            </div>
          </div>
          <div class="transition-transform duration-200 group-hover:translate-x-1">
            <ChevronRight class="w-5 h-5 text-slate" />
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="currentItems.length === 0" class="py-16 text-center">
          <div class="w-16 h-16 rounded-full bg-slate/10 flex items-center justify-center mx-auto mb-6">
            <FileText class="w-8 h-8 text-slate/50" />
          </div>
          <p class="font-sans text-body text-slate">暂无内容</p>
        </div>
      </div>
    </div>
  </section>
</template>
