<script lang="ts" setup>

import { useActivitiesStore } from '@/stores/activities';
import { onMounted } from 'vue';
import Tile from './Tile.vue';
import Surface from '../DLS/Surface.vue';

const activitiesStore = useActivitiesStore();
onMounted(async () => {
  await activitiesStore.fetchActivities();
});

</script>

<template>
  <Surface>
    <h1 class="text-h1 margin-b">Activities</h1>
    <div class="flex flex-column gap">
      <Tile
        v-for="activity in activitiesStore.activities"
        :key="activity.id"
        :activity="activity"
      />
    </div>
  </Surface>
</template>