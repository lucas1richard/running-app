<script setup lang="ts">
import TileList from '@/components/Activities/TileList.vue'
import PageWrapper from '@/components/PageWrapper.vue'
import MileageSummary from '@/components/MileageSummary.vue';
import AllTimePRs from '@/components/AllTimePRs.vue';
import MetricsChart from '@/components/MetricsChart.vue';
import HeatMapContainer from '@/components/HeatMapContainer.vue';
import { useActivitiesStore } from '@/stores/activities';
import dayjs from 'dayjs';
import { computed } from 'vue';

const activitiesStore = useActivitiesStore();
const oneYearAgo = dayjs().subtract(1, 'year');
const activities = computed(() => activitiesStore
  .dateOrderedActivities
  .filter(({ start_date_local }) => dayjs(start_date_local).isAfter(oneYearAgo))
  .reverse());
</script>

<template>
  <PageWrapper>
    <div class="flex gap">
      <div class="flex flex-column gap width-50">
        <div>
          <h2 class="text-h2 margin-b">All Time PRs</h2>
            <AllTimePRs />
        </div>
        <div>
          <h2 class="text-h2 margin-b">Mileage</h2>
          <MileageSummary />
        </div>
        <div>
          <h2 class="text-h2 margin-b">Activities</h2>
          <TileList />
        </div>
      </div>
      <div class="flex flex-column gap width-50">
        <div>
          <h2 class="text-h2 margin-b">Metrics Over Time</h2>
          <MetricsChart :activities="activities" />
        </div>
        <div>
          <h2 class="text-h2 margin-b">Heat Map - All Time</h2>
          <HeatMapContainer />
        </div>
      </div>
    </div>
  </PageWrapper>
</template>
