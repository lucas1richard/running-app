<script lang="ts" setup>
import Tile from '@/components/Activities/Tile.vue';
import { useTriggerActionIfStatus } from '@/components/hooks/useTriggerActionIfStatus';
import MetricsChart from '@/components/MetricsChart.vue';
import { useActivitiesStore } from '@/stores/activities';

const activitiesStore = useActivitiesStore();
const { id } = defineProps<{ id: number }>();

const similarWorkouts = activitiesStore.getSimilarWorkouts(id);

useTriggerActionIfStatus(
  `fetchSimilarWorkouts/${id}`,
  activitiesStore.makeSetchSimilarWorkouts(id)
)
</script>

<template>
  <div>
    <h2 class="text-h2 margin-b">Similar Activities</h2>
    <div class="grid" v-if="similarWorkouts.length > 0">
      <MetricsChart
        :activities="[...similarWorkouts, activitiesStore.activities[id]].filter(Boolean)"
      />
      <Tile
        v-for="activity of similarWorkouts"
        :key="activity.id"
        :activity="activity"
        :isCompact="true"
      ></Tile>
    </div>
  </div>
</template>

<style lang="css" scoped>
.grid {
  display: grid;
  gap: var(--space-unit);
  grid-template-columns: repeat(3, 1fr);
}
</style>