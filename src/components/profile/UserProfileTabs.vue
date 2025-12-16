<script setup lang="ts">
import { ref, computed } from 'vue'
import { PhBookmark, PhUsers, PhArticle } from '@phosphor-icons/vue'

const activeTab = ref<'recruiting' | 'saved' | 'topics'>('recruiting')

const recruitingItems = [
  {
    id: 1,
    title: 'AI+文学跨学科平台开发',
    type: '项目合作',
    skills: ['前端开发', 'NLP'],
    status: '招募中',
    createdAt: '2025-12-15'
  },
  {
    id: 2,
    title: '可持续建筑设计大赛组队',
    type: '比赛组队',
    skills: ['建筑设计', '环境工程'],
    status: '招募中',
    createdAt: '2025-12-14'
  }
]

const savedItems = [
  {
    id: 1,
    title: 'AI+文学：科幻叙事工作坊',
    type: '讲座',
    college: '中文与传媒学院',
    savedAt: '2025-12-10'
  },
  {
    id: 2,
    title: 'HNSW 索引黑客松',
    type: '比赛',
    college: '信息科学学院',
    savedAt: '2025-12-09'
  }
]

const topicItems = [
  {
    id: 1,
    title: '如何找到跨学科的队友？',
    type: '提问',
    replies: 12,
    createdAt: '2025-12-08'
  },
  {
    id: 2,
    title: '分享：我的跨学科项目经验',
    type: '分享',
    replies: 8,
    createdAt: '2025-12-05'
  }
]

const tabs = [
  { id: 'recruiting', label: '发布的招募', icon: PhUsers, count: recruitingItems.length },
  { id: 'saved', label: '收藏的活动', icon: PhBookmark, count: savedItems.length },
  { id: 'topics', label: '发布的帖子', icon: PhArticle, count: topicItems.length }
]
</script>

<template>
  <div class="morandi-card-base">
    <!-- 标签页 -->
    <div class="flex border-b border-slate/10 mb-8">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="flex items-center gap-2 px-6 py-4 border-b-2 transition-all font-sans text-sm font-medium"
        :class="activeTab === tab.id
          ? 'border-morandi-lavender text-charcoal'
          : 'border-transparent text-slate hover:text-charcoal'"
        @click="activeTab = tab.id as any"
      >
        <component :is="tab.icon" weight="duotone" class="w-4 h-4" />
        <span>{{ tab.label }}</span>
        <span class="font-mono text-mono text-xs bg-slate/10 px-2 py-1 rounded-full">{{ tab.count }}</span>
      </button>
    </div>
    
    <!-- 内容 -->
    <div class="tab-content">
      <!-- 发布的招募 -->
      <div v-if="activeTab === 'recruiting'" class="space-y-4">
        <div
          v-for="item in recruitingItems"
          :key="item.id"
          class="p-6 rounded-soft border border-slate/10 hover:border-morandi-lavender/30 transition-all"
        >
          <div class="flex items-start justify-between mb-4">
            <div>
              <h4 class="text-h3 font-sans font-semibold text-charcoal mb-2">{{ item.title }}</h4>
              <div class="flex items-center gap-4">
                <span class="font-mono text-mono text-xs text-morandi-blue">{{ item.type }}</span>
                <span class="font-mono text-mono text-xs text-slate">{{ item.createdAt }}</span>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full bg-morandi-green/10 text-morandi-green font-mono text-mono text-xs">
              {{ item.status }}
            </span>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="skill in item.skills"
              :key="skill"
              class="px-3 py-1 rounded-full bg-slate/5 text-slate font-mono text-mono text-xs"
            >
              {{ skill }}
            </span>
          </div>
        </div>
        
        <div v-if="recruitingItems.length === 0" class="text-center py-12">
          <div class="w-16 h-16 rounded-full bg-slate/10 flex items-center justify-center mx-auto mb-6">
            <PhUsers class="w-8 h-8 text-slate" />
          </div>
          <h3 class="text-h2 font-sans font-semibold text-charcoal mb-3">暂无招募</h3>
          <p class="text-body font-sans text-slate mb-6">你还没有发布任何组队招募</p>
        </div>
      </div>
      
      <!-- 收藏的活动 -->
      <div v-if="activeTab === 'saved'" class="space-y-4">
        <div
          v-for="item in savedItems"
          :key="item.id"
          class="p-6 rounded-soft border border-slate/10 hover:border-morandi-lavender/30 transition-all"
        >
          <div class="flex items-start justify-between mb-4">
            <div>
              <h4 class="text-h3 font-sans font-semibold text-charcoal mb-2">{{ item.title }}</h4>
              <div class="flex items-center gap-4">
                <span class="font-mono text-mono text-xs text-morandi-blue">{{ item.type }}</span>
                <span class="font-mono text-mono text-xs text-slate">{{ item.college }}</span>
              </div>
            </div>
            <span class="font-mono text-mono text-xs text-slate">{{ item.savedAt }}</span>
          </div>
        </div>
        
        <div v-if="savedItems.length === 0" class="text-center py-12">
          <div class="w-16 h-16 rounded-full bg-slate/10 flex items-center justify-center mx-auto mb-6">
            <PhBookmark class="w-8 h-8 text-slate" />
          </div>
          <h3 class="text-h2 font-sans font-semibold text-charcoal mb-3">暂无收藏</h3>
          <p class="text-body font-sans text-slate mb-6">你还没有收藏任何活动</p>
        </div>
      </div>
      
      <!-- 发布的帖子 -->
      <div v-if="activeTab === 'topics'" class="space-y-4">
        <div
          v-for="item in topicItems"
          :key="item.id"
          class="p-6 rounded-soft border border-slate/10 hover:border-morandi-lavender/30 transition-all"
        >
          <div class="flex items-start justify-between mb-4">
            <div>
              <h4 class="text-h3 font-sans font-semibold text-charcoal mb-2">{{ item.title }}</h4>
              <div class="flex items-center gap-4">
                <span class="font-mono text-mono text-xs text-morandi-blue">{{ item.type }}</span>
                <span class="font-mono text-mono text-xs text-slate">{{ item.createdAt }}</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-mono text-mono text-xs text-slate">{{ item.replies }} 回复</span>
            </div>
          </div>
        </div>
        
        <div v-if="topicItems.length === 0" class="text-center py-12">
          <div class="w-16 h-16 rounded-full bg-slate/10 flex items-center justify-center mx-auto mb-6">
            <PhArticle class="w-8 h-8 text-slate" />
          </div>
          <h3 class="text-h2 font-sans font-semibold text-charcoal mb-3">暂无帖子</h3>
          <p class="text-body font-sans text-slate mb-6">你还没有发布任何帖子</p>
        </div>
      </div>
    </div>
  </div>
</template>