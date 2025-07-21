<script setup lang="ts">
import { useActivitiesStore } from '@/stores/activities';
import useRecentlyVisited from '@/stores/recentlyVisited';
import { useRoute, useRouter } from 'vue-router';
import DropDown from '@/common/DropDown.vue'
import Tile from './Activities/Tile.vue';
import GoogleMapsImage from './GoogleMapsImage.vue';
import { getSummaryPolyline } from '@/utils';
import { ref } from 'vue';

const recentlyVisitedStore = useRecentlyVisited();
const { activities } = useActivitiesStore();
const { push } = useRouter();
const route = useRoute();
const isOpen = ref<boolean>(false);
const onChange = (id: string | void) => {
  if (id) {
    isOpen.value = false;
    push(`/details/${id}`);
  }
};
</script>

<template>
  <div>
    <DropDown
      :value="route.params?.id ? String(route.params?.id) : undefined"
      :is-open="isOpen"
      :data="recentlyVisitedStore.list.map((id) => ({key: id, ...activities[Number(id)]}))"
      @onChange="onChange"
    >
      <template #selecter>
        <div class="pad-tb">
          Recently Visited
        </div>
      </template>
      <template #row="{ rowData }">
        <div v-if="!!rowData">
          <GoogleMapsImage :activityId="rowData.id" :polyline="getSummaryPolyline(rowData)" :imgWidth="400"
            :imgHeight="200" :width="100" :height="75" />
          <p>{{ rowData.name }}</p>
          <p>{{ rowData.start_date_local }}</p>
        </div>
      </template>
    </DropDown>
  </div>
</template>
