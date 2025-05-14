<script lang="ts" setup>
  import { useActivitiesStore } from '@/stores/activities';
  import { computed, ref } from 'vue'
  import { useRoute } from 'vue-router'
import Surface from '../../components/DLS/Surface.vue';
import PageWrapper from '../../components/PageWrapper.vue';

  const activitiesStore = useActivitiesStore();
  const route = useRoute();
  const activityId = ref(route.params.id);
  const activity = computed(() => activitiesStore.activities.find(activity => String(activity.id) === activityId.value));

</script>

<template>
  <PageWrapper>
    <Surface variant="foreground">
      <div v-if="!!activity" class="activity-detail">
        <h1 class="text-h1">Activity Detail</h1>
        <p class="text-body">Activity ID: {{ activity?.id }}</p>
        <p class="text-body">Activity Title: {{ activity?.name }}</p>
        <p class="text-body">Activity Start: {{ activity?.start_date_local }}</p>
      </div>
    </Surface>
  </PageWrapper>
</template>

<style scoped lang="scss">
  .activity-detail {
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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