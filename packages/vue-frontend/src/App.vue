<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useActivitiesStore } from './stores/activities';
import SideNav from './SideNav.vue';
import useHeartZonesStore from './stores/heartzones';
import usePreferencesStore from './stores/preferences';
import { usePRStore } from './stores/prs';
import { provideIsDarkMode } from './components/hooks/useIsDarkMode';
import { useTriggerActionIfStatus } from './components/hooks/useTriggerActionIfStatus';
import TopNav from './TopNav.vue';
import { computed } from 'vue';

provideIsDarkMode()

usePreferencesStore().fetchUserPreferences()();
useTriggerActionIfStatus(computed(() => 'fetchActivities'), computed(() => useActivitiesStore().fetchActivities));
useTriggerActionIfStatus(computed(() => 'fetchHeartZones'), computed(() => useHeartZonesStore().fetchHeartZones));
useTriggerActionIfStatus(computed(() => 'fetchPRs'), computed(() => usePRStore().fetchPRs));
</script>

<template>
  <SideNav />
  <div class="app-content">
    <TopNav />
    <RouterView />
  </div>
</template>

<style scoped>
  .app-content {
    margin-left: 200px;
    min-height: 100vh;
  }
</style>
