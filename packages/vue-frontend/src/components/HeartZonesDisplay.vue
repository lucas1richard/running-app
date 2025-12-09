<script lang="ts" setup>
import usePreferencesStore from '@/stores/preferences';
import Surface from './DLS/Surface.vue';
import useHeartZonesStore from '@/stores/heartzones';
import { computed } from 'vue';
import { useActivitiesStore } from '@/stores/activities';
import { convertHeartDataToZoneSpeeds, convertHeartDataToZoneTimes, convertMetricSpeedToMPH, getDurationString } from '@/utils';
import SurfaceCrease from './DLS/SurfaceCrease.vue';

const prefStore = usePreferencesStore();
const hrStore = useHeartZonesStore();
const activitiesStore = useActivitiesStore();

const props = defineProps<{ activity: Activity; }>();

const allZones = hrStore.record;
const configZonesId = prefStore.getPreferredHRZoneId();
const nativeZones = hrStore.selectHeartZones(props.activity.start_date_local);
const heartData = computed(() => activitiesStore.getStreamTypeData(props.activity.id, 'heartrate'))
const velocityData = computed(() => activitiesStore.getStreamTypeData(props.activity.id, 'velocity_smooth'))

const zonesId = computed(() => configZonesId === -1 ? nativeZones.value.id : configZonesId);
const zones = computed(() => allZones.find(({ id }) => id === zonesId.value) || nativeZones.value);
const totalTimes = computed(() => convertHeartDataToZoneTimes(heartData.value, zones.value));
const percents = computed(() => totalTimes.value.map((time) => (100 * time / heartData.value.length)));
const avg = computed(() => convertHeartDataToZoneSpeeds(zones.value, heartData.value, velocityData.value));

const isUsingNonNativeZones = computed(() => nativeZones.value.id !== zones.value.id);
const data = computed(() => {
  const ranges = [
    [zones.value.z1, zones.value.z2 - 1],
    [zones.value.z2, zones.value.z3 - 1],
    [zones.value.z3, zones.value.z4 - 1],
    [zones.value.z4, zones.value.z5 - 1],
    [zones.value.z5, 'Max']
  ]
  return [1,2,3,4,5].map((n, i) => ({
    title: `Zone ${n}`,
    range: ranges[i],
    percent: percents.value[i],
    timeInZone: getDurationString(totalTimes.value[i]),
    avg: getDurationString(Math.floor((3660 / convertMetricSpeedToMPH(avg.value[i].avg)))),
    max: getDurationString(Math.floor((3660 / convertMetricSpeedToMPH(avg.value[i].max)))),
  }))
});

const maxPercent = computed(() => Math.max(...percents.value));
const minPercent = computed(() => Math.min(...percents.value));
</script>

<template>
  <Surface class="card">
    <div v-if="isUsingNonNativeZones">
      <small>Note: Using Non-native Heart Rate Zones</small>
    </div>
    <div class="grid full-height">
      <div v-for="(d, ix) in data" :key="d.timeInZone" class="full-height">
        <div
          :class="[
            `text-center text-body hr-zone-${ix + 1}-bg-light pad full-height`,
            
          ]"
        >
        <div :class="['pad', { 'raised-2 elevation-4': d.percent === maxPercent, 'sunken-1': d.percent === minPercent }]">
          <h3 class="text-h4">{{ d.title }}</h3>
          <div>({{ d.range[0] }} - {{ d.range[1] }})</div>
            <div class="margin-t text-no-wrap">
              <b>Time in Zone:</b>
              <div>
                <span v-if="d.timeInZone">{{ d.timeInZone }}</span>
                <span v-else>--</span>
              </div>
              <div class="text-h5 margin-t">
                ({{ d.percent.toFixed(2) }}%)
              </div>
            </div>
            <SurfaceCrease />
            <div class="margin-t">
              <b>Average Pace:</b>
              <div>
                <span v-if="d.avg">{{ d.avg }}</span>
                <span v-else>--</span>
              </div>
            </div>
            <div class="margin-t">
              <b>Fastest Pace:</b>
              <div>
                <span v-if="d.max">{{ d.max }}</span>
                <span v-else>--</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Surface>
</template>

<style lang="css" scoped>
.grid {
  grid-template-columns: repeat(5, 1fr);
}
</style>