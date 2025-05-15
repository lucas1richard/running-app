<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue';
import { useActivitiesStore } from './stores/activities';
import SideNav from './SideNav.vue';
import useHeartZonesStore from './stores/heartzones';

const activitiesStore = useActivitiesStore();
const heartzonesStore = useHeartZonesStore();

onMounted(async() => {
  await Promise.allSettled([
    activitiesStore.fetchActivities(),
    heartzonesStore.fetchHeartZones(),
  ]);
})
</script>

<template>
  <SideNav />
  <div class="app-content">
    <!-- <Container showViewSizeDisplay={true} providesViewSize={true}> -->
      <RouterView />
    <!-- </Container> -->
  </div>
</template>

<style scoped>
  .app-content {
    margin-left: 200px;
    min-height: 100vh;
    /* ${props => props.theme.breakpoints.down('md')} {
      margin-left: 0;
      padding:  0;
    } */
  }
</style>
