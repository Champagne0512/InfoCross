<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppShell from '@/components/layout/AppShell.vue'
</script>

<template>
  <AppShell>
    <RouterView v-slot="{ Component, route }">
      <transition name="blur-fade" mode="out-in">
        <div :key="route.fullPath" class="route-layer">
          <component :is="Component" />
        </div>
      </transition>
    </RouterView>
  </AppShell>
</template>

<style>
.route-layer {
  position: relative;
  min-height: 100%;
  display: block;
}

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

.blur-fade-enter-active,
.blur-fade-leave-active {
  transition:
    opacity 0.35s ease-out,
    filter 0.35s ease-out,
    transform 0.35s ease-out;
  will-change: opacity, filter, transform;
}

.blur-fade-enter-from {
  opacity: 0;
  filter: blur(8px);
  transform: scale(0.98);
}

.blur-fade-enter-to {
  opacity: 1;
  filter: blur(0px);
  transform: scale(1);
}

.blur-fade-leave-from {
  opacity: 1;
  filter: blur(0px);
  transform: scale(1);
}

.blur-fade-leave-to {
  opacity: 0;
  filter: blur(4px);
  transform: scale(0.995);
}

@keyframes route-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
