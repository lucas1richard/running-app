<script setup lang="ts">
import { computed, ref } from 'vue';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import PageWrapper from '@/components/PageWrapper.vue';
import { useActivitiesStore } from '@/stores/activities';
import Surface from '@/components/DLS/Surface.vue';
import Tile from '@/components/Activities/Tile.vue';

type CalendarDay = { day: number, activities: Activity[]; };

dayjs.extend(weekday);
dayjs.extend(weekOfYear);

const currentMonth = ref(dayjs());
const activitiesStore = useActivitiesStore();

const navigateMonth = (direction: number) => {
  currentMonth.value = dayjs(currentMonth.value).add(direction, 'month');
};

const firstDayOfMonth = computed(() => currentMonth.value.startOf('month').weekday());
const days = computed(() => {
  const dateActivities = activitiesStore.dateGroupedActivities;
  const daysInMonth = currentMonth.value.daysInMonth();
  const weekPlaceholders = [0, 1, 2, 3, 4, 5, 6]
    .map<CalendarDay>((day) => ({ day: day - 7, activities: [] }));
  const tmp = weekPlaceholders.slice(0, firstDayOfMonth.value);
  let daysWithActivities = 0;
  const daysArray = [...Array(daysInMonth)].map((_, i) => i + 1);

  daysArray.forEach(day => {
    const currentDate = currentMonth.value.date(day);
    const currentDayOfWeek = currentDate.day();
    const isWeekend = currentDayOfWeek === 0;
    const formattedDate = currentDate.format('YYYY-MM-DD');

    const hasActivities = dateActivities[formattedDate]?.length > 0;
    if (hasActivities) daysWithActivities++;

    tmp.push({ day, activities: dateActivities[formattedDate] });
  });

  return tmp;
});

const backOneMonth = () => navigateMonth(-1);
const forwardOneMonth = () => navigateMonth(1);
const snapToCurrent = () => currentMonth.value = dayjs();
const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
</script>

<template>
  <PageWrapper>
    <div class="text-center text-h1">{{ currentMonth.format('MMMM YYYY') }}</div>
    <div class="flex">
      <button class="text-h4 pad-lr" @click="backOneMonth">&larr;</button>
      <button class="text-h4 pad-lr" @click="snapToCurrent">Snap to Current</button>
      <button class="text-h4 pad-lr" @click="forwardOneMonth">&rarr;</button>
    </div>
    <div class="grid margin-t">
      <Surface v-for="label of weekdayLabels" class="card pad dls-blue-bg text-h4">{{ label }}</Surface>
      <div v-for="day of days" :key="`day-${day.day}-${!!day.activities}`">
        <Surface v-if="day.day > 0" class="card full-height">
          <div v-if="!day.activities" :key="`${day.day}`" class="text-right pad">
            {{ day.day }}
          </div>

          <Tile
            v-for="activity of day.activities"
            :activity="activity"
            :key="activity.id"
            :is-compact="true"
          ></Tile>
        </Surface>

        <div v-else></div>
      </div>
    </div>
  </PageWrapper>
</template>

<style lang="scss" scoped>
.flex {
  display: flex;
  justify-content: center;
  align-items: end;
  gap: calc(var(--space-unit) * 0.5);
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: auto repeat(5, 1fr);
  gap: calc(var(--space-unit) * 0.5);
}
</style>
