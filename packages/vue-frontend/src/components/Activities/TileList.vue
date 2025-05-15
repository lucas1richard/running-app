<script lang="ts" setup>

import { useActivitiesStore } from '@/stores/activities';
import { computed, onMounted, ref } from 'vue';
import Tile from './Tile.vue';
import Surface from '../DLS/Surface.vue';

const activitiesStore = useActivitiesStore();
const activities = computed(() => activitiesStore.selectDateOrderedActivities);
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