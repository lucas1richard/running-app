<script setup lang="ts">
import Surface from './DLS/Surface.vue';
</script>

<template>
  <main class="page-wrapper">
    <Surface>
      <slot></slot>
    </Surface>
  </main>
</template>

<style scoped>
  .page-wrapper {
    padding: 2rem;
  }
</style>