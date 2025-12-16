<script setup lang="ts">
const reputationTags = [
  { tag: '靠谱', count: 12, icon: '👍', color: 'morandi-green' },
  { tag: '代码大神', count: 8, icon: '💻', color: 'morandi-blue' },
  { tag: 'PPT美工', count: 5, icon: '🎨', color: 'morandi-lavender' },
  { tag: '准时', count: 15, icon: '⏰', color: 'morandi-clay' },
  { tag: '沟通清晰', count: 9, icon: '💬', color: 'morandi-green' },
  { tag: '解决问题', count: 7, icon: '🔧', color: 'morandi-blue' },
  { tag: '团队协作', count: 11, icon: '🤝', color: 'morandi-lavender' },
  { tag: '创新思维', count: 6, icon: '💡', color: 'morandi-clay' },
]
</script>

<template>
  <div class="morandi-card-clay">
    <header class="mb-8">
      <p class="font-mono text-mono text-slate mb-2">TEAMMATE REVIEWS</p>
      <h3 class="text-h2 font-sans font-semibold text-charcoal">队友印象</h3>
    </header>
    
    <!-- 标签云 -->
    <div class="flex flex-wrap gap-3">
      <button
        v-for="item in reputationTags"
        :key="item.tag"
        class="inline-flex items-center gap-2 px-4 py-3 rounded-full border transition-all hover:scale-105"
        :class="`border-${item.color} bg-${item.color}/10 text-${item.color}`"
      >
        <span>{{ item.icon }}</span>
        <span class="font-sans text-sm font-medium">{{ item.tag }}</span>
        <span class="font-mono text-mono text-xs">{{ item.count }}</span>
      </button>
    </div>
    
    <!-- 统计 -->
    <div class="mt-8 pt-6 border-t border-slate/10">
      <div class="grid grid-cols-3 gap-6">
        <div class="text-center">
          <div class="text-2xl font-sans font-bold text-charcoal">{{ reputationTags.length }}</div>
          <div class="font-mono text-mono text-xs text-slate">评价标签</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-sans font-bold text-charcoal">
            {{ reputationTags.reduce((sum, item) => sum + item.count, 0) }}
          </div>
          <div class="font-mono text-mono text-xs text-slate">总评价数</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-sans font-bold text-charcoal">
            {{ Math.max(...reputationTags.map(item => item.count)) }}
          </div>
          <div class="font-mono text-mono text-xs text-slate">最高评价</div>
        </div>
      </div>
    </div>
  </div>
</template>