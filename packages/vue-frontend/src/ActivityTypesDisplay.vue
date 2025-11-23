<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import MultiSelect from './common/MultiSelect.vue';
import { useActivitiesStore } from './stores/activities';
import usePreferencesStore from './stores/preferences';

const prefStore = usePreferencesStore();
const activitiesStore = useActivitiesStore();

const types = computed(() => activitiesStore.activitiesDisplayTypes);

const updateSelectedTypes = (selected: (string | number)[]) => {
  activitiesStore.setDisplayTypes(selected);
  prefStore.setGlobalPreferences({ activityDisplayTypes: activitiesStore.activitiesDisplayTypes });
  prefStore.setUserPreferences();
};

const selectedItems = ref(Object.keys(types.value).filter((k) => types.value[k]));

watch(types, (newTypes) => selectedItems.value = Object.keys(newTypes).filter((k) => !!newTypes[k]));
</script>

<template>
    <div>
      <h2>Activity Types</h2>
      <MultiSelect
        :model-value="selectedItems"
        :options="Object.keys(types).map((displayType) => ({ value: displayType, label: displayType }))"
        :selectedValues="Object.keys(types).filter(type => types[type])"
        @update:model-value="updateSelectedTypes"
      />
    </div>
</template>

export default ActivityTypesDisplay;
