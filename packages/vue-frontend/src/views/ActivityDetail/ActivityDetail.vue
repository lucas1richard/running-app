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
    <div class="grid">
      <Tile :activity="activity" :is-compact="true" />
    </div>
  </PageWrapper>
</template>

<style scoped lang="scss">
.grid {
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-unit);
}

h1 {
  font-size: 24px;
  margin-bottom: 10px;
}

p {
  font-size: 16px;
  margin-bottom: 5px;
}
</style>