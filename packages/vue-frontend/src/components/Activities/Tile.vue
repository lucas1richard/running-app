<script lang="ts" setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { convertMetricSpeedToMPH, getDurationString, getSummaryPolyline } from '@/utils'
import Surface from '../DLS/Surface.vue'
import dayjs from 'dayjs'
import GoogleMapsImage from '../GoogleMapsImage.vue'
import calcEfficiencyFactor from '@/utils/calcEfficiencyFactor'
import useHeartZonesStore from '@/stores/heartzones'
import ZonesWidth from '../ZonesWidth.vue'
import PRMedal from '../PRMedal.vue'

const { activity, isCompact } = defineProps({
  activity: { type: Object as () => Activity, required: true },
  isCompact: { type: Boolean, required: false },
})
const activityId = activity.id;
const largeText = computed(() => isCompact ? 'text-h5' : 'text-h4');
const smallText = computed(() => isCompact ? 'text-sm' : 'text-md');
const heartzonesStore = useHeartZonesStore();
const hrZones = heartzonesStore.selectHeartZones(activity.start_date);

</script>

<template>
  <div class="container">
    <Surface class="card pad elevated-3 raised-1">
      <div :class="{ grid: !isCompact, gridCompact: isCompact }">
        <div class="gridImage">
          <GoogleMapsImage :activityId="activity.id" :polyline="getSummaryPolyline(activity)" :imgWidth="400"
            :imgHeight="200" :width="100" :height="75" />
        </div>
        <div class="gridTitle">
          <div class="text-body">
            {{ dayjs(activity.start_date_local).format('MMMM DD, YYYY') }}
          </div>
          <RouterLink :to="`/details/${activityId}`" class="text-h4 dls">
            {{ activity.name }}
          </RouterLink>
        </div>
        <div class="gridStats">
          <div>
            <div>
              <span :class="smallText">
                {{ getDurationString(activity.elapsed_time) }}
              </span>
              <span :class="`margin-l ${largeText} dls-dark-gold`">
                {{ activity.distance_miles }} <abbr>mi</abbr>
              </span>
            </div>
  
            <div>
              <span :class="`${largeText}`">
                {{ convertMetricSpeedToMPH(activity.average_speed).toFixed(2) }} mph
              </span>
            </div>
  
            <div>
              <span :class="`${largeText}`">
                {{ Math.round(activity.average_heartrate) }}/{{ activity.max_heartrate }} bpm
              </span>
            </div>
  
            <div>
              <span :class="`${smallText} text-efficiencyFactor`">Efficiency Factor</span>
              <span :class="`margin-l ${largeText} text-efficiencyFactor`">
                {{ calcEfficiencyFactor(activity.average_speed, activity.average_heartrate).toFixed(2) }} y/b
              </span>
            </div>
          </div>
        </div>
        <div class="gridZonesWidth">
          <ZonesWidth :id="activity.id" :zones="hrZones"
            :zonesCaches="activity.zonesCaches" :heartData="[]" />
        </div>
        <div v-if="!isCompact" class="gridBestEfforts">
          <div v-for="effort of activity.calculatedBestEfforts?.filter(({ pr_rank }) => pr_rank)" :key="effort.distance" className="flex flex-align-center">
            <span>
              <PRMedal :type="'svg'" :color="effort.pr_rank || 10" />
            </span>
            <small>
              {{ effort.name }} &rarr; {{ getDurationString(effort.elapsed_time) }}
            </small>
          </div>
        </div>
        <slot class="gridChildren"></slot>
      </div>
    </Surface>
  </div>
</template>

<style scoped lang="scss">
.grid {
  display: grid;
  gap: 1rem;

  grid-template-columns: auto 1fr auto;
  grid-template-areas:
    "image title stats"
    "zonesWidth zonesWidth zonesWidth"
    "bestEfforts bestEfforts bestEfforts"
    "children children children";
}

.gridCompact {
  display: grid;
  gap: 0.5rem;

  grid-template-columns: 1fr auto auto;
  grid-template-areas: "image title title"
    "stats stats stats"
    "zonesWidth zonesWidth zonesWidth"
    "children children children";
}

@container (max-width: 600px) {
  .grid {
    display: grid;
    gap: 0.5rem;

    grid-template-columns: 1fr auto auto;
    grid-template-areas: "image title title"
      "stats stats stats"
      "zonesWidth zonesWidth zonesWidth"
      "children children children";
  }
  .gridStats {
    text-align: left;
  }
}
@container (max-width: 400px) {
  .grid {
    display: flex;
    flex-direction: column;
  }
  .gridStats {
    text-align: left;
  }
}

.gridImage {
  grid-area: image;
}

.gridTitle {
  grid-area: title;
}

.gridStats {
  grid-area: stats;
  text-align: right;
}

.gridZonesWidth {
  grid-area: zonesWidth;
}

.gridBestEfforts {
  grid-area: bestEfforts;
  display: flex;
  align-content: start;
  gap: 1rem;
}

.gridChildren {
  grid-area: children;
}
</style>