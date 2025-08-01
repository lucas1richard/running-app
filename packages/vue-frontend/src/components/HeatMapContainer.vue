<script lang="ts" setup>
import { useActivitiesStore } from '@/stores/activities';
import { computed, ref, watch } from 'vue';
import HeatMap from './HeatMap.vue';
import { useTriggerActionIfStatus } from './hooks/useTriggerActionIfStatus';
import MultiSelect from '@/common/MultiSelect.vue';

type ContainerProps = {
  referenceTime?: string;
  timeframe?: string;
}
const { referenceTime, timeframe } = defineProps<ContainerProps>();

const key = [timeframe, referenceTime].filter(Boolean).join('|') || 'all';
const activitiesStore = useActivitiesStore();
useTriggerActionIfStatus(key, activitiesStore.makeFetchHeatMapData(timeframe, referenceTime));

const allData = computed(() => activitiesStore.heatMap[key] || []);
const uniqueTypes = computed(() => {
  const st: Record<string, boolean> = {};
  allData.value.map(({ sportType }) => {
    st[sportType] = true;
  });
  return st;
})
const sportTypes = computed(() => {

  return Object.keys(uniqueTypes.value).map((v) => ({ value: v, label: v }));
});

const selectedTypes = ref<(string|number)[]>(Object.keys(uniqueTypes.value));
watch(uniqueTypes, (tps) => {
  selectedTypes.value = Object.keys(tps);
});
const data = computed(() => {
  const typesMap = Object.fromEntries(selectedTypes.value.map((v) => [v, true]));
  return allData.value.filter(({ sportType }) => typesMap[sportType]);
});
</script>

<template>
  <div>
    <MultiSelect :options="sportTypes" :modelValue="selectedTypes" @update:modelValue="(val) => selectedTypes = val" />
    <HeatMap :data="data" :key="selectedTypes.length" measure="total_seconds" :deferRender="data.length === 0" />
  </div>
</template>