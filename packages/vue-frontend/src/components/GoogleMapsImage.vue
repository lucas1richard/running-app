<script setup lang="ts">
  const {
    polyline,
    activityId,
    imgWidth,
    imgHeight,
    height,
    width,
  } = defineProps({
    polyline: { type: String, required: false },
    activityId: { type: Number, required: true },
    imgWidth: { type: Number, required: false },
    imgHeight: { type: Number, required: false },
    height: { type: [Number, String], required: false },
    width: { type: [Number, String], required: false },
  })

  const src = `http://localhost:3002/routes/${activityId}.png?size=${imgWidth || 900}x${imgHeight || 450}&maptype=roadmap&path=enc:${polyline}`;
</script>

<template>
  <img
    class="img"
    v-if="!!polyline"
    :src="src"
    :height="height"
    :style="`max-width: ${width}px`"
  />
  <div v-else></div>
</template>

