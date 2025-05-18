<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted, provide } from 'vue';
import { useActivitiesStore } from './stores/activities';
import SideNav from './SideNav.vue';
import useHeartZonesStore from './stores/heartzones';
import { usePRStore } from './stores/prs';
import { provideIsDarkMode } from './components/hooks/useIsDarkMode';

const activitiesStore = useActivitiesStore();
const heartzonesStore = useHeartZonesStore();

provideIsDarkMode()

onMounted(async() => {
  await Promise.allSettled([
    activitiesStore.fetchActivities(),
    heartzonesStore.fetchHeartZones(),
    usePRStore().fetchPRs(),
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
