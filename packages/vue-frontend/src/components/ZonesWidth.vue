<script lang="ts" setup>
import { convertHeartDataToZonePercents, convertZonesCacheToPercents } from '@/utils';
import { computed } from 'vue';

type ZonesWidthProps = {
  zones: HeartZone;
  heartData: number[];
  id: number | string;
  zonesCaches: Record<string, HeartZoneCache>;
};
const { zonesCaches, zones, heartData } = defineProps<ZonesWidthProps>();
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
      :class="!percent.startsWith('0') ? `hr-zone-${ix + 1}-bg hr-zone-${ix + 1}-border` : ''"
      :title="`Zone ${ix + 1}: ${percent}%`"
      :style="`width: ${percent}%; height: 1rem; overflow: hidden`"
    ></div>
  </div>
</template>