<script lang="ts" setup>
import Surface from './components/DLS/Surface.vue';
import RecentlyVisitedActivities from './components/RecentlyVisitedActivities.vue';

</script>

<template>
  <Surface variant="foreground">
    <div class="text-body pad">
      <RecentlyVisitedActivities />
    </div>
  </Surface>
</template>