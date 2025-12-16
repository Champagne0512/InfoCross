<script setup lang="ts">
import { Heart, Calendar, Users, Star } from 'lucide-vue-next'

const stats = [
  {
    id: 'bookmarks',
    label: '我的收藏',
    value: 24,
    icon: Heart,
    color: 'text-morandi-clay',
    bgColor: 'bg-morandi-clay/10',
  },
  {
    id: 'activities',
    label: '参与活动',
    value: 18,
    icon: Calendar,
    color: 'text-morandi-blue',
    bgColor: 'bg-morandi-blue/10',
  },
  {
    id: 'teams',
    label: '组队项目',
    value: 7,
    icon: Users,
    color: 'text-morandi-green',
    bgColor: 'bg-morandi-green/10',
  },
  {
    id: 'credit',
    label: '信用分',
    value: 89,
    icon: Star,
    color: 'text-morandi-lavender',
    bgColor: 'bg-morandi-lavender/10',
  },
]

const emit = defineEmits<{
  navigate: [id: string]
}>()

function handleClick(id: string) {
  emit('navigate', id)
}
</script>

<template>
  <section class="py-4">
    <div class="max-w-6xl mx-auto px-6">
      <div class="morandi-card-base p-6">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            v-for="stat in stats"
            :key="stat.id"
            @click="handleClick(stat.id)"
            class="group text-center p-3 rounded-soft hover:bg-white/50 transition-all duration-200"
          >
            <div class="flex flex-col items-center gap-2 mb-1">
              <div 
                :class="['w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110', stat.bgColor]"
              >
                <component :is="stat.icon" :class="['w-4 h-4', stat.color]" />
              </div>
              <div 
                :class="['font-mono text-mono text-xl font-bold transition-transform duration-200 group-hover:scale-105', stat.color]"
              >
                {{ stat.value }}
              </div>
            </div>
            <div class="font-sans text-xs font-medium text-slate">
              {{ stat.label }}
            </div>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
