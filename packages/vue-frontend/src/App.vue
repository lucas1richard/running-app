<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useActivitiesStore } from './stores/activities';
import SideNav from './SideNav.vue';
import useHeartZonesStore from './stores/heartzones';
import { usePRStore } from './stores/prs';
import { provideIsDarkMode } from './components/hooks/useIsDarkMode';
import { useTriggerActionIfStatus } from './components/hooks/useTriggerActionIfStatus';
import TopNav from './TopNav.vue';

provideIsDarkMode()

useTriggerActionIfStatus('fetchActivities', useActivitiesStore().fetchActivities);
useTriggerActionIfStatus('fetchHeartZones', useHeartZonesStore().fetchHeartZones);
useTriggerActionIfStatus('fetchPRs', usePRStore().fetchPRs);
</script>

<template>
  <SideNav />
  <div class="app-content">
    <TopNav />
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
