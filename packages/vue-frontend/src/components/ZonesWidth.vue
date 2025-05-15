<script lang="ts" setup>
import { convertHeartDataToZonePercents, convertZonesCacheToPercents } from '@/utils';
import { computed } from 'vue';
const { zonesCaches, zones, heartData } = defineProps({
  zones: {
    type: Object as () => HeartZone,
    required: true,
  },
  heartData: {
    type: Array as () => number[],
    required: true,
  },
  id: [Number, String],
  zonesCaches: Object as () => Record<string, HeartZoneCache>,
});
const percentage = computed(() => {
  if (!zones && !heartData) return [];
  if (zonesCaches?.[zones.id]) return convertZonesCacheToPercents(zonesCaches[zones.id]);
  return convertHeartDataToZonePercents(heartData, zones);
});
</script>

<template>
  <div class="flex width-full">
    <div
      v-for="(percent, ix) of percentage"
      :key="`${ix}-${id}`"
      :class="`hr-zone-${ix + 1}-bg hr-zone-${ix + 1}-border`"
      :style="`width: ${percent}%; height: 1rem; overflow: hidden`"
    ></div>
  </div>
</template>