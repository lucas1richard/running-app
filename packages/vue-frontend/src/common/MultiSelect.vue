<script setup lang="ts">
import { ref, watch } from 'vue'

interface Option {
  value: string | number
  label: string
}

interface Props {
  options: Option[]
  modelValue?: (string | number)[]
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  placeholder: 'Select options...'
})

const emit = defineEmits<{
  'update:modelValue': [(string | number)[]]
}>()

const isOpen = ref<boolean>(false)
const selectedItems = ref<(string | number)[]>([...props.modelValue])

watch(() => props.modelValue, (newVal: (string | number)[]) => {
  selectedItems.value = [...newVal]
})

const toggleDropdown = (): void => {
  isOpen.value = !isOpen.value
}

const toggleOption = (value: string | number): void => {
  const index = selectedItems.value.indexOf(value)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(value)
  }
  emit('update:modelValue', selectedItems.value)
}

const isSelected = (value: string | number): boolean => {
  return selectedItems.value.includes(value)
}
</script>

<template>
  <div class="multi-select">
    <div class="select-header hover pad" @click="toggleDropdown">
      <span v-if="selectedItems.length === 0" class="placeholder">
        {{ placeholder }}
      </span>
      <span v-else class="selected-text">
        {{ selectedItems.length }} item(s) selected
      </span>
      <span class="arrow" :class="{ 'arrow-up': isOpen }">▼</span>
    </div>
    
    <div v-if="isOpen" class="dropdown">
      <div
        v-for="option in options"
        :key="option.value"
        class="option hover"
        :class="{ selected: isSelected(option.value) }"
        @click="toggleOption(option.value)"
      >
      <label>
        <input
          type="checkbox"
          :checked="isSelected(option.value)"
        /> {{ option.label }}
      </label>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/assets/theme.module.scss";

.multi-select {
  position: relative;
  width: 100%;
}

.select-header {
  cursor: pointer;
  background-color: var(--color-foreground);
  display: flex;
  justify-content: space-between;
  align-items: center;
  @include hover-effect;
  &:hover {
    @include hovered();
  }
}

.placeholder {
  color: #999;
}

.arrow {
  transition: transform 0.2s;
}

.arrow-up {
  transform: rotate(180deg);
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  border-top: none;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  border-radius: 0 0 4px 4px;
}

.option {
  padding: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-foreground);
}

.option.selected {
}

.option input[type="checkbox"] {
  margin: 0;
}
</style>