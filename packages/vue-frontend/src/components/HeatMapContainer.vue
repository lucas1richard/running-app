<script lang="ts" setup>
import { useActivitiesStore } from '@/stores/activities';
import { computed } from 'vue';
import HeatMap from './HeatMap.vue';
import { useTriggerActionIfStatus } from './hooks/useTriggerActionIfStatus';

type ContainerProps = {
  referenceTime?: string;
  timeframe?: string;
}
const { referenceTime, timeframe } = defineProps<ContainerProps>();

const key = [timeframe, referenceTime].filter(Boolean).join('|') || 'all';
const activitiesStore = useActivitiesStore();
useTriggerActionIfStatus(key, activitiesStore.makeFetchHeatMapData(timeframe, referenceTime));

const allData = computed(() => activitiesStore.heatMap[key] || []);
const uniqueTypes = computed(() => activitiesStore.activitiesDisplayTypes);

const data = computed(() => {
  return allData.value.filter(({ sportType }) => uniqueTypes.value[sportType]);
});
</script>

<template>
  <div>
    <HeatMap
      :data="data"
      localStorageKey="homepage:heatmap:bounds"
      measure="total_seconds"
      :deferRender="data.length === 0"
    />
  </div>
</template>