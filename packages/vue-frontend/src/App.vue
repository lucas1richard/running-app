<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue';
import { useActivitiesStore } from './stores/activities';
import SideNav from './SideNav.vue';

const activitiesStore = useActivitiesStore();

onMounted(async() => {
  await activitiesStore.fetchActivities();
})
</script>

<template>
  <Container providesViewSize={true}>
    <SideNav />
    <div class="app-content">
      <Container showViewSizeDisplay={true} providesViewSize={true}>
        <RouterView />
      </Container>
    </div>
  </Container>
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
