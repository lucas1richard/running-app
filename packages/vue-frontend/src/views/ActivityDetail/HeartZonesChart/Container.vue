<script lang="ts" setup>
import { emptyArray } from '@/constants';
import { useActivitiesStore } from '@/stores/activities'
import useHeartZonesStore from '@/stores/heartzones'
import { computed, unref, type Ref } from 'vue';
import ChartDisplay from './ChartDisplay.vue';

const { activityId: id } = defineProps<{
  activityId: number;
  updatePointer: (num: number) => void;
}>();

const activityId = computed(() => id);
const activityStore = useActivitiesStore()
const hrStore = useHeartZonesStore()

const activity = computed(() => activityStore.activities[activityId.value])
const details = computed(() => activityStore.details[activityId.value]);
const latlngStream = activityStore.getStreamTypeData(activityId.value, 'latlng')
const zones = hrStore.selectHeartZones(activity.value?.start_date_local)
const bestEfforts = computed(() => details.value?.best_efforts || emptyArray)
const streamPins = computed(() => activity.value?.stream_pins || emptyArray);
const laps = computed(() => details.value?.laps || emptyArray);
const splitsMi = computed(() => details.value?.splits_standard || emptyArray);

</script>

<template>
<div>
  <ChartDisplay
    :id="activityId"
    :updatePointer="updatePointer"
    :averageSpeed="activity.average_speed"
    :data="unref(activityStore.getStreamTypeData(activityId, 'heartrate'))"
    :velocity="unref(activityStore.getStreamTypeData(activityId, 'velocity_smooth'))"
    :altitude="unref(activityStore.getStreamTypeData(activityId, 'altitude'))"
    :grade="unref(activityStore.getStreamTypeData(activityId, 'grade_smooth'))"
    :time="unref(activityStore.getStreamTypeData(activityId, 'time'))"
    :zones="zones"
    :streamPins="streamPins"
    :zonesBandsDirection="'xAxis'"
    :laps="laps"
    :bestEfforts="bestEfforts"
    :splitsMi="splitsMi"
  />
</div>
</template>