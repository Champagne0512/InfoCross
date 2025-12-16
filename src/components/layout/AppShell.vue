<script setup lang="ts">
import AppNavBar from './AppNavBar.vue'
</script>

<template>
  <div class="min-h-screen bg-canvas text-ink">
    <AppNavBar />
    <main class="mx-auto flex w-full max-w-7xl flex-col gap-10 px-8 py-10">
      <slot />
    </main>
  </div>
</template>
