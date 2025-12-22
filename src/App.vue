<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppShell from '@/components/layout/AppShell.vue'
</script>

<template>
  <AppShell>
    <RouterView v-slot="{ Component, route }">
      <Suspense :key="route.fullPath">
        <component :is="Component" />
        <template #fallback>
          <div class="route-fallback">
            <div class="route-spinner" />
            <p class="route-tip">正在加载页面...</p>
          </div>
        </template>
      </Suspense>
    </RouterView>
  </AppShell>
</template>

<style>
.route-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  color: #475467;
}

.route-spinner {
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  border: 3px solid rgba(71, 84, 103, 0.15);
  border-top-color: #0f172a;
  animation: route-spin 0.8s linear infinite;
  margin-bottom: 0.75rem;
}

.route-tip {
  font-family: 'HarmonyOS Sans', 'Inter', sans-serif;
  font-size: 0.9rem;
}

@keyframes route-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
