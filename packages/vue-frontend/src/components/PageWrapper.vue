<script setup lang="ts">
import DLSContainer from './DLS/DLSContainer.vue';
import Surface from './DLS/Surface.vue';
</script>

<template>
  <main class="page-wrapper">
    <DLSContainer :providesViewSize="true" :showViewSizeDisplay="true">
      <Surface variant="base">
        <slot></slot>
      </Surface>
    </DLSContainer>
  </main>
</template>

<style scoped>
  .page-wrapper {
    padding: 2rem;
  }
</style>