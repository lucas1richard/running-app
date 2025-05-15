<script lang="ts" setup>

import { useActivitiesStore } from '@/stores/activities';
import { computed } from 'vue';
import Tile from './Tile.vue';

const activitiesStore = useActivitiesStore();
const activities = computed(() => activitiesStore.dateOrderedActivities);
</script>

<template>
  <div class="flex flex-column gap">
    <Tile
      v-for="activity in activities"
      :key="activity.id"
      :activity="activity"
    />
  </div>
</template>