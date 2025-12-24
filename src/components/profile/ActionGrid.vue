<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { Clock, Bookmark, MessageSquare, Settings, ChevronRight } from 'lucide-vue-next'

const { t } = useI18n()

const actions = computed(() => [
  {
    id: 'history',
    title: t('profile.actions.history'),
    description: '快速回顾最近浏览的活动与帖子',
    icon: Clock,
    color: 'text-morandi-green',
    bgColor: 'bg-morandi-green/15',
    borderColor: 'border-morandi-green/20',
  },
  {
    id: 'bookmarks',
    title: t('profile.actions.bookmarks'),
    description: '沉淀灵感，随时复盘喜欢的文章',
    icon: Bookmark,
    color: 'text-amber-500',
    bgColor: 'bg-amber-100/40',
    borderColor: 'border-amber-200',
  },
  {
    id: 'forum',
    title: t('profile.actions.forum'),
    description: '查看你的发帖、评论和互动',
    icon: MessageSquare,
    color: 'text-morandi-clay',
    bgColor: 'bg-morandi-clay/15',
    borderColor: 'border-morandi-clay/20',
  },
  {
    id: 'security',
    title: t('nav.settings'),
    description: '语言、默认模式等设置',
    icon: Settings,
    color: 'text-slate',
    bgColor: 'bg-slate/10',
    borderColor: 'border-slate/20',
  },
])

const emit = defineEmits<{
  action: [id: string]
}>()

function handleAction(id: string) {
  emit('action', id)
}
</script>

<template>
  <section class="py-10">
    <div class="max-w-6xl mx-auto px-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <button
          v-for="(action, index) in actions"
          :key="action.id"
          @click="handleAction(action.id)"
          class="action-card group"
          :class="[action.bgColor, action.borderColor]"
          :style="{ animationDelay: `${index * 100}ms` }"
        >
          <!-- 悬浮光效 -->
          <div class="card-shine"></div>
          
          <!-- 右上角图标 -->
          <div 
            class="icon-container"
            :class="action.bgColor"
          >
            <component :is="action.icon" :class="['w-6 h-6', action.color]" />
            <div class="icon-ring" :class="action.borderColor"></div>
          </div>
          
          <!-- 内容 -->
          <div class="pr-16 relative z-10">
            <h3 class="action-title">
              {{ action.title }}
            </h3>
            <p class="action-desc">
              {{ action.description }}
            </p>
          </div>
          
          <!-- 右下角箭头 -->
          <div class="arrow-container">
            <ChevronRight :class="['w-5 h-5', action.color]" />
          </div>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 卡片样式 */
.action-card {
  @apply relative text-left p-8 rounded-morandi border overflow-hidden;
  @apply transition-all duration-500;
  animation: slideUp 0.6s ease-out both;
}

.action-card:hover {
  @apply -translate-y-2 shadow-morandi-lg;
}

/* 光效 */
.card-shine {
  @apply absolute inset-0 opacity-0 transition-opacity duration-500;
  background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, transparent 100%);
}

.action-card:hover .card-shine {
  @apply opacity-100;
}

/* 图标容器 */
.icon-container {
  @apply absolute top-6 right-6 w-12 h-12 rounded-full;
  @apply flex items-center justify-center;
  @apply transition-all duration-500;
}

.action-card:hover .icon-container {
  @apply scale-110;
  transform: scale(1.1) rotate(10deg);
}

.icon-ring {
  @apply absolute inset-0 rounded-full border-2 opacity-0;
  @apply transition-all duration-500;
}

.action-card:hover .icon-ring {
  @apply opacity-100;
  animation: pulse-ring 1.5s ease-out infinite;
}

/* 标题 */
.action-title {
  @apply text-h3 font-sans font-semibold text-charcoal mb-3;
  @apply transition-all duration-300;
}

.action-card:hover .action-title {
  @apply translate-x-1;
}

/* 描述 */
.action-desc {
  @apply text-body font-sans text-slate leading-relaxed;
  @apply transition-all duration-300;
}

.action-card:hover .action-desc {
  @apply text-charcoal;
}

/* 箭头 */
.arrow-container {
  @apply absolute bottom-6 right-6;
  @apply transition-all duration-300;
}

.action-card:hover .arrow-container {
  @apply translate-x-2;
}

/* 动画定义 */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-ring {
  0% { 
    transform: scale(1); 
    opacity: 0.5; 
  }
  100% { 
    transform: scale(1.5); 
    opacity: 0; 
  }
}
</style>
