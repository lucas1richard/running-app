<script lang="ts" setup>
type SurfaceProps = {
  variant?: 'base' | 'foreground';
}
const { variant = 'foreground' } = defineProps<SurfaceProps>()
</script>

<template>
  <div :class="variant">
    <slot></slot>
  </div>
</template>

<style>
  @import '../../assets/theme.css';

  .base {
    background-color: var(--color-background);
    color: var(--color-text);
  }

  .foreground {
    background-color: var(--color-foreground);
  }
</style>