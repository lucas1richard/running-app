<script setup lang="ts">
type GoogleMapImageProps = {
  polyline: string;
  activityId: number;
  imgWidth?: number;
  imgHeight?: number;
  height?: number | string;
  width?: number | string;
  alt?: string;
}
const {
  polyline,
  activityId,
  imgWidth,
  imgHeight,
  height,
  width,
} = defineProps<GoogleMapImageProps>()

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

