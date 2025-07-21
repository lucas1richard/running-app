<script lang="ts" setup generic="T extends { key: string }">
import Surface from '@/components/DLS/Surface.vue';
import { onMounted, onBeforeUnmount, defineEmits, defineProps, ref, watch } from 'vue';

interface DropdownData {
  key: string;
}

interface DropdownProps<T> {
  data: T[];
  isOpen?: boolean;
  value?: string;
}
const props = defineProps<DropdownProps<T>>();

const emit = defineEmits<{
  onOpen: [];
  onClose: [];
  onChange: [key: string | void];
}>();

const isOpen = ref<boolean>(!!props.isOpen);
const selected = ref<string | void>(props.value || props.data[0]?.key);

const toggleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.code === 'Space') {
    event.preventDefault();
    isOpen.value = !isOpen.value;
  }
}

watch(isOpen, (open) => {
  if (open) emit('onOpen');
  else emit('onClose')
});
watch(selected, (key) => {
  emit('onChange', key);
  isOpen.value = false;
});
watch(() => props.isOpen, (open) => isOpen.value = open);
watch(() => props.value, (key) => selected.value = key);

// Add this function to your component's setup:
const setupClickOutside = () => {
  const handleClickOutside = (event: MouseEvent) => {
    const dropdownEl = document.querySelector('.dropdown-container');
    if (dropdownEl && !dropdownEl.contains(event.target as Node) && isOpen.value) {
      isOpen.value = false;
    }
  };

  onMounted(() => {
    document.addEventListener('mousedown', handleClickOutside);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleClickOutside);
  });
};

// Call the function in your setup
setupClickOutside();
</script>

<template>
  <div class="dropdown-container">
    <div
      @click="isOpen = !isOpen"
      @keydown="toggleKeydown"
      class="selecter"
      role="button"
      :tabindex="'0'"
    >
      <slot v-if="!props.data.find((v) => v.key === selected)" name="selecter"></slot>
      <slot name="row" :row-data="props.data.find((v) => v.key === selected)" :key="selected"></slot>
    </div>
    <Surface v-show="isOpen" variant="foreground" class="dropdown-row-container pad full-width">
      <div class="selecter" role="button" v-for="d in props.data" :key="d.key">
        <div @click="selected = d.key">
          <slot name="row" :row-data="d"></slot>
        </div>
      </div>
    </Surface>
  </div>
</template>

<style scoped>
.dropdown-container {
  overflow-y: auto;
  overflow-x: hidden;
}

.dropdown-row-container {
  position: absolute;
  max-height: 800px;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 100;
}

.selecter {
  cursor: pointer;
}
</style>
