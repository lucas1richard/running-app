<script lang="ts" setup>
  const props = defineProps({
    variant: {
      type: String,
      default: 'base',
      validator: (v: string) => ['base', 'foreground'].includes(v),
    }
  })
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