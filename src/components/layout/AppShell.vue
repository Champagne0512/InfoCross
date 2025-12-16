<script setup lang="ts">
import AppNavBar from './AppNavBar.vue'
</script>

<template>
  <div class="min-h-screen bg-void text-text-primary">
    <AppNavBar />
    <main class="mx-auto mt-8 w-full max-w-7xl px-6 pb-16">
      <slot />
    </main>
  </div>
</template>
