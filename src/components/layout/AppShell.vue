<script setup lang="ts">
import AppNavBar from './AppNavBar.vue'
</script>

<template>
  <div class="min-h-screen bg-canvas text-ink">
    <AppNavBar />
    <main class="dashboard">
      <slot />
    </main>
  </div>
</template>
