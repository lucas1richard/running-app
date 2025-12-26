<script lang="ts" setup>
import { usePRStore } from '@/stores/prs';
import Surface from './DLS/Surface.vue';
import { computed } from 'vue';
import PRMedal from './PRMedal.vue';
import dayjs from 'dayjs';
import { getDurationString } from '@/utils';

const prsStore = usePRStore();
const allTimePRs = computed(() => prsStore.prs);
</script>

<template>
  <div class="container">
    <div class="grid">
      <Surface
        v-for="(pr, ix) of allTimePRs"
        :key="pr.distance"
        class="pad card elevation-1 raised-1 text-center bg-gold-500"
      >
        <div class="text-h1">
          <PRMedal type="native" color="gold" />
        </div>
        <div class="text-h4">
          <RouterLink :to="`/details/${pr.activityId}`">{{ pr.name }}</RouterLink>
        </div>
        <div>
          {{ dayjs(pr.start_date_local).format('MMMM DD, YYYY') }}
        </div>
        <div class="text-h3 elapsed-time">
          {{ getDurationString(pr.elapsed_time) }}
        </div>
      </Surface>
    </div>
  </div>
</template>

<style lang="css" scoped>
.grid {
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-unit);
}
@container (max-width: 900px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-unit);
  }
  .elapsed-time {
    font-size: 1.4rem;
  }
}
@container (max-width: 500px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-unit);
  }
  .elapsed-time {
    font-size: 1.2rem;
  }
}
</style>