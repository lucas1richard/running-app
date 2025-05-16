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
  <div>
    <div class="grid">
      <Surface
        v-for="pr of allTimePRs"
        :key="pr.distance"
        variant="foreground"
        class="pad card text-center"
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
        <div class="text-h3">
          {{ getDurationString(pr.elapsed_time) }}
        </div>
      </Surface>
    </div>
  </div>
</template>

<style lang="css" scoped>
.grid {
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-unit);
}
</style>