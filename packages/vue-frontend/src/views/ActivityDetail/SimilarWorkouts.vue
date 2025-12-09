<script lang="ts" setup>
import Tile from '@/components/Activities/Tile.vue';
import { useTriggerActionIfStatus } from '@/components/hooks/useTriggerActionIfStatus';
import MetricsChart from '@/components/MetricsChart.vue';
import { useActivitiesStore } from '@/stores/activities';
import { computed } from 'vue';

const activitiesStore = useActivitiesStore();
const { id } = defineProps<{ id: number }>();

const activityId = computed(() => id);

const similarWorkouts = computed(() => activitiesStore.getSimilarWorkouts(activityId.value));

useTriggerActionIfStatus(
  computed(() => `fetchSimilarWorkouts/${activityId.value}`),
  computed(() => activitiesStore.makeSetchSimilarWorkouts(activityId.value))
)
</script>

<template>
  <div class="container">
    <h2 class="text-h2 margin-b">Similar Activities</h2>
    <MetricsChart
      :activities="[...similarWorkouts, activitiesStore.activities[id]].filter(Boolean)"
    />
    <div class="grid margin-t" v-if="similarWorkouts.length > 0">
      <Tile
        v-for="activity of similarWorkouts"
        :key="activity.id"
        :activity="activity"
        :isCompact="true"
      ></Tile>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.grid {
  display: grid;
  gap: var(--space-unit);
  grid-template-columns: repeat(3, 1fr);
}

@container (min-width: 1600px) {
  .grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
@container (min-width: 2400px) {
  .grid {
    grid-template-columns: repeat(8, 1fr);
  }
}
</style>