<script lang="ts" setup>
import { useActivitiesStore } from '@/stores/activities';
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import PageWrapper from '../../components/PageWrapper.vue';
import Tile from '@/components/Activities/Tile.vue';
import { useTriggerActionIfStatus } from '@/components/hooks/useTriggerActionIfStatus';
import HeartZonesDisplay from '@/components/HeartZonesDisplay.vue';
import HRZonesMap from '@/components/HRZonesMap.vue';
import Container from './HeartZonesChart/Container.vue';
import SimilarWorkouts from './SimilarWorkouts.vue';

const activitiesStore = useActivitiesStore();
const route = useRoute();
const activityId = Number(route.params.id);
const activity = computed(() => activitiesStore.activities[activityId]);
useTriggerActionIfStatus(
  `activityDetail/${activityId}`,
  activitiesStore.makeFetchActivityDetail(activityId)
)
useTriggerActionIfStatus(
  `activityStreams/${activityId}`,
  activitiesStore.makeFetchActivityStreams(activityId)
)
const pointer = ref(0);
const updatePointer = (num: number) => pointer.value = num
</script>

<template>
  <PageWrapper>
    <div class="grid" v-if="!!activity">
      <Tile :activity="activity" :is-compact="false" />
      <HeartZonesDisplay :activity="activity" />
      <Container :activity-id="activityId" :updatePointer="updatePointer" />
      <HRZonesMap :id="activityId" :pointer="pointer" />
    </div>
    <div class="margin-t">
      <h2 class="text-h2 margin-b">Similar Activities</h2>
      <SimilarWorkouts :id="activityId"></SimilarWorkouts>
    </div>
  </PageWrapper>
</template>

<style scoped lang="scss">
@import "../../assets/base.scss";

.grid {
  grid-template-columns: repeat(1, 1fr);
  gap: var(--space-unit);
  @include lg {
    grid-template-columns: repeat(2, 1fr);
  }
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