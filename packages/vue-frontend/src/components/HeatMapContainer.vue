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

const data = computed(() => activitiesStore.heatMap[key] || []);
</script>

<template>
<HeatMap :data="data" measure="total_seconds" :deferRender="data.length === 0" />
</template>