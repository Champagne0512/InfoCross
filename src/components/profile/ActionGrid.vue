<script setup lang="ts">
import { Users, FileText, MessageSquare, ShieldCheck, ChevronRight } from 'lucide-vue-next'

const actions = [
  {
    id: 'team',
    title: '寻找搭子管理',
    description: '管理你的组队项目，查看队友动态',
    icon: Users,
    color: 'text-morandi-green',
    bgColor: 'bg-morandi-green/15',
    borderColor: 'border-morandi-green/20',
  },
  {
    id: 'progress',
    title: '比赛/研究进度',
    description: '追踪项目进展，管理任务清单',
    icon: FileText,
    color: 'text-morandi-blue',
    bgColor: 'bg-morandi-blue/15',
    borderColor: 'border-morandi-blue/20',
  },
  {
    id: 'forum',
    title: '校园论坛动态',
    description: '查看你的发帖、评论和互动',
    icon: MessageSquare,
    color: 'text-morandi-clay',
    bgColor: 'bg-morandi-clay/15',
    borderColor: 'border-morandi-clay/20',
  },
  {
    id: 'security',
    title: '认证与安全',
    description: '管理账户设置和隐私权限',
    icon: ShieldCheck,
    color: 'text-slate',
    bgColor: 'bg-slate/10',
    borderColor: 'border-slate/20',
  },
]

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
          v-for="action in actions"
          :key="action.id"
          @click="handleAction(action.id)"
          class="group relative text-left p-8 rounded-morandi transition-all duration-300 hover:-translate-y-1 hover:shadow-morandi-lg"
          :class="[action.bgColor, action.borderColor, 'border']"
        >
          <!-- 右上角图标 -->
          <div 
            class="absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110"
            :class="action.bgColor"
          >
            <component :is="action.icon" :class="['w-6 h-6', action.color]" />
          </div>
          
          <!-- 内容 -->
          <div class="pr-16">
            <h3 class="text-h3 font-sans font-semibold text-charcoal mb-3">
              {{ action.title }}
            </h3>
            <p class="text-body font-sans text-slate leading-relaxed">
              {{ action.description }}
            </p>
          </div>
          
          <!-- 右下角箭头 -->
          <div class="absolute bottom-6 right-6 transition-transform duration-200 group-hover:translate-x-1">
            <ChevronRight :class="['w-5 h-5', action.color]" />
          </div>
        </button>
      </div>
    </div>
  </section>
</template>
