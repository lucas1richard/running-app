<script setup lang="ts">
import { convertMetersToMiles } from '@/utils';
import Surface from './DLS/Surface.vue';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import { useActivitiesStore } from '@/stores/activities';
import { computed } from 'vue';

dayjs.extend(utc)

const findRecent = (allActivities: Activity[], numDays: number) => {
  const currentDateUTC = dayjs.utc()
  return allActivities.filter(({ start_date }) => {
    const activityDateUTC = currentDateUTC.diff(dayjs(start_date).utc())
    return Math.floor(activityDateUTC / (24 * 60 * 60 * 1000)) < numDays
  })
}

const findSameYear = (allActivities: Activity[]) => {
  const currentDate = dayjs()
  return allActivities.filter(({ start_date_local }) => dayjs(start_date_local).isSame(currentDate, 'year'))
}

const sumDistance = (activities: Activity[]) => {
  const meters = activities.reduce((acc, { distance }) => acc + distance, 0)
  return convertMetersToMiles(meters)
}

const activitiesStore = useActivitiesStore()

const activities = computed(() => activitiesStore.dateOrderedActivities)

const milesThisWeek = computed(() => sumDistance(findRecent(activities.value, 7)).toFixed(2))
const milesThisYear = computed(() => sumDistance(findSameYear(activities.value)).toFixed(2))
const milesAllTime = computed(() => sumDistance(activities.value).toFixed(2))

</script>

<template>
  <Surface class="pad card">
    <div class="grid">
      <div class="text-center">
        <h5 class="text-h5">Miles in the last 7 days</h5>
        <div class="text-h2">{{ milesThisWeek }}</div>
      </div>
      <div class="text-center">
        <h5 class="text-h5">Miles This Year</h5>
        <div class="text-h2">{{ milesThisYear }}</div>
      </div>
      <div class="text-center">
        <h5 class="text-h5">Miles All Time</h5>
        <div class="text-h2">{{ milesAllTime }}</div>
      </div>
    </div>
  </Surface>
</template>

<style lang="scss" scoped>
@import "../assets/base.scss";

.grid {
  grid-template-columns: 1fr;
  gap: calc(2 * var(--space-unit));
  @include lg {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>