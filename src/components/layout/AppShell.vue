<script setup lang="ts">
import AppNavBar from './AppNavBar.vue'
import ThreeBodyAnimation from '../ThreeBodyAnimation.vue'
</script>

<template>
  <div class="min-h-screen bg-cream text-charcoal">
    <ThreeBodyAnimation />
    <AppNavBar />
    <main class="main-content bg-cream">
      <slot />
    </main>
  </div>
</template>
