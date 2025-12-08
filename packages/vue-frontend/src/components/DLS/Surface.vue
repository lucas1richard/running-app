<script lang="ts" setup>
type SurfaceProps = {
  variant?: 'base' | 'foreground';
}
const props = withDefaults(defineProps<SurfaceProps>(), {
  variant: 'foreground',
});
</script>

<template>
  <div :class="[props.variant]">
    <slot></slot>
  </div>
</template>

<style scoped>
  .base {
    background-color: var(--color-background);
    color: var(--color-text);
  }

  .foreground {
    --bgColor: var(--color-foreground);
    background-color: var(--color-foreground);
  }
</style>