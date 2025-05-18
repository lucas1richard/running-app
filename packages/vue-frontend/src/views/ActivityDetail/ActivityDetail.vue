<script lang="ts" setup>
import { useActivitiesStore } from '@/stores/activities';
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PageWrapper from '../../components/PageWrapper.vue';
import Tile from '@/components/Activities/Tile.vue';

const activitiesStore = useActivitiesStore();
const route = useRoute();
const activityId = Number(route.params.id);
const activity = computed(() => activitiesStore.activities[activityId]);
</script>

<template>
  <PageWrapper>
    <Tile :activity="activity" />
  </PageWrapper>
</template>

<style scoped lang="scss">
h1 {
  font-size: 24px;
  margin-bottom: 10px;
}

p {
  font-size: 16px;
  margin-bottom: 5px;
}
</style>