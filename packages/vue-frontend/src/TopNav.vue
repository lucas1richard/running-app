<script lang="ts" setup>
import ActivityTypesDisplay from './ActivityTypesDisplay.vue';
import Surface from './components/DLS/Surface.vue';
import RecentlyVisitedActivities from './components/RecentlyVisitedActivities.vue';

</script>

<template>
  <Surface variant="foreground">
    <div class="text-body">
      <ActivityTypesDisplay />
      <RecentlyVisitedActivities />
    </div>
  </Surface>
</template>