<script setup lang="ts">
import AppNavBar from './AppNavBar.vue'
</script>

<template>
  <div class="min-h-screen bg-cream text-charcoal">
    <AppNavBar />
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>
