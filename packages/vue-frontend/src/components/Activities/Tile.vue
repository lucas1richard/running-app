<script lang="ts" setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import Surface from '../DLS/Surface.vue'
import dayjs from 'dayjs'

const props = defineProps({
  activity: {
    type: Object,
    required: true
  }
})
const activity = computed(() => props.activity)
const activityId = activity.value.id;
</script>

<template>
  <Surface variant="foreground" class="card pad">
    <div class="tile__content">
      <RouterLink :to="`/details/${activityId}`" class="text-h4 dls-blue">
        {{ activity.name }}
      </RouterLink>
      <div class="text-body">
        {{ dayjs(activity.start_date_local).format('MMMM DD, YYYY') }}
      </div>
    </div>
  </Surface>
</template>

<style scoped lang="scss">
</style>