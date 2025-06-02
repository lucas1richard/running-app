<script lang="ts" setup>
import { computed, provide, ref, useTemplateRef, watch } from 'vue';
import { defaultBreakpoints, type BreakPoint } from './createBreakpoints';
import useResizeObserver from '../hooks/useResizeObserver';
import ViewSizeDisplay from './ViewSizeDisplay.vue';

const props = defineProps<{
  showViewSizeDisplay?: boolean;
  providesViewSize?: boolean;
}>();
const viewSize = ref('lg');
const breakpoints = Object.entries<number>(defaultBreakpoints.values) as [BreakPoint, number][];
const templateRef = useTemplateRef('container');
const trackSize = (dims: DOMRectReadOnly) => {
  const [size] = (breakpoints.find((_, ix) => breakpoints[ix + 1]?.[1] >= dims.width) || ['xl']);
  viewSize.value = size;
}
watch(templateRef, () => {
  if (templateRef.value) {
    useResizeObserver(templateRef.value, trackSize, { defer: !props.providesViewSize });
  }
})
provide('viewSize', viewSize);
</script>

<template>
  <div ref="container" class="container">
    <div v-if="props.showViewSizeDisplay">
      <ViewSizeDisplay />
    </div>
    <slot></slot>
  </div>
</template>

<style>
.container {
  container-type: inline-size;
  position: relative;
}
</style>