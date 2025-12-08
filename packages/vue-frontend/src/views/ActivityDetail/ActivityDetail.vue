<script lang="ts" setup>
import { useActivitiesStore } from '@/stores/activities';
import useRecentlyVisited from '@/stores/recentlyVisited';
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import PageWrapper from '@/components/PageWrapper.vue';
import Tile from '@/components/Activities/Tile.vue';
import { useTriggerActionIfStatus } from '@/components/hooks/useTriggerActionIfStatus';
import HeartZonesDisplay from '@/components/HeartZonesDisplay.vue';
import HRZonesMap from '@/components/HRZonesMap.vue';
import Container from './HeartZonesChart/Container.vue';
import SimilarWorkouts from './SimilarWorkouts.vue';

const activitiesStore = useActivitiesStore();
const route = useRoute();
const activityId = ref(Number(route.params.id));
watch(() => route.params.id, (newid) => (activityId.value = Number(newid)));
const activity = computed(() => activitiesStore.activities[activityId.value]);
useTriggerActionIfStatus(
  `activityDetail/${activityId.value}`,
  activitiesStore.makeFetchActivityDetail(activityId.value)
)
useTriggerActionIfStatus(
  `activityStreams/${activityId.value}`,
  computed(() => activitiesStore.makeFetchActivityStreams(activityId.value)).value
)
const pointer = ref(0);
const updatePointer = (num: number) => pointer.value = num

const recentlyVisitedStore = useRecentlyVisited();

watch(activityId, (newId) => recentlyVisitedStore.addRecentlyVisited(newId.toString()), { immediate: true });
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