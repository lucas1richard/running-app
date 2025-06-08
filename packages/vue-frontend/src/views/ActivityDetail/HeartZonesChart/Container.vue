<script lang="ts" setup>
import { emptyArray } from '@/constants';
import { useActivitiesStore } from '@/stores/activities'
import useHeartZonesStore from '@/stores/heartzones'
import { computed, type Ref } from 'vue';
import ChartDisplay from './ChartDisplay.vue';

const { activityId } = defineProps<{
  activityId: number;
  updatePointer: (num: number) => void;
}>()
const activityStore = useActivitiesStore()
const hrStore = useHeartZonesStore()

const activity = activityStore.activities[activityId]
const details = activityStore.details[activityId]
const heartRateStream = activityStore.getStreamTypeData(activityId, 'heartrate')
const velocityStream = activityStore.getStreamTypeData(activityId, 'velocity_smooth')
const altitudeStream = activityStore.getStreamTypeData(activityId, 'altitude')
const timeStream = activityStore.getStreamTypeData(activityId, 'time')
const gradeStream = activityStore.getStreamTypeData(activityId, 'grade_smooth')
const latlngStream = activityStore.getStreamTypeData(activityId, 'latlng')
const zones = hrStore.selectHeartZones(activity?.start_date_local)
const bestEfforts = computed(() => details?.best_efforts || emptyArray)
const streamPins = computed(() => activity?.stream_pins || emptyArray);
const laps = computed(() => details?.laps || emptyArray);
const splitsMi = computed(() => details?.splits_standard || emptyArray);

</script>

<template>
<div>
  <ChartDisplay
    :id="activityId"
    :updatePointer="updatePointer"
    :averageSpeed="activity.average_speed"
    :data="heartRateStream"
    :velocity="velocityStream"
    :altitude="altitudeStream"
    :grade="gradeStream"
    :time="timeStream"
    :zones="zones"
    :streamPins="streamPins"
    :zonesBandsDirection="'xAxis'"
    :laps="laps"
    :bestEfforts="bestEfforts"
    :splitsMi="splitsMi"
  />
</div>
</template>